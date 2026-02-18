#!/bin/bash
# Infrastructure Restore Script
# Restores containers and/or databases from backup
# Must be run on the Proxmox host (192.168.1.50) as root
#
# Usage:
#   ./restore.sh                        — interactive menu
#   ./restore.sh --date YYYY-MM-DD      — restore from specific date
#   ./restore.sh --containers-only      — snapshot rollback only
#   ./restore.sh --databases-only       — DB restore only
#   ./restore.sh --container 201        — restore single container snapshot
#
# RTO target: <30 minutes

set -uo pipefail

BACKUP_ROOT="/var/backups/infra-oldevops"
PROXMOX_NODE="homelab"
CONTAINERS=(200 201 202 210 250)
LOG_FILE="${BACKUP_ROOT}/restore.log"

# ─── Logging ──────────────────────────────────────────────────────────────────
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"; }

# ─── Prerequisites ────────────────────────────────────────────────────────────
if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: Must be run as root on the Proxmox host" >&2
  exit 1
fi

if ! command -v pct &>/dev/null; then
  echo "ERROR: Must be run on a Proxmox host (pct not found)" >&2
  exit 1
fi

# ─── Argument parsing ─────────────────────────────────────────────────────────
RESTORE_DATE=""
MODE="interactive"
SINGLE_CT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --date)           RESTORE_DATE="$2"; shift 2 ;;
    --containers-only) MODE="containers"; shift ;;
    --databases-only)  MODE="databases"; shift ;;
    --container)       MODE="single-container"; SINGLE_CT="$2"; shift 2 ;;
    --help)
      grep '^#' "$0" | head -15 | sed 's/^# //'
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Interactive Menu ─────────────────────────────────────────────────────────
interactive_menu() {
  echo ""
  echo "=========================================="
  echo "  Infrastructure Restore — Interactive"
  echo "=========================================="

  # List available backups
  echo ""
  echo "Available local backups:"
  local backups=()
  while IFS= read -r dir; do
    backups+=("$(basename "$dir")")
    echo "  [${#backups[@]}] $(basename "$dir") ($(du -sh "$dir" | cut -f1))"
  done < <(find "${BACKUP_ROOT}" -maxdepth 1 -type d -name "20[0-9][0-9]-*" | sort -r)

  if [ ${#backups[@]} -eq 0 ]; then
    echo "  No local backups found in ${BACKUP_ROOT}"
    exit 1
  fi

  echo ""
  read -rp "Select backup date [1-${#backups[@]}]: " idx
  RESTORE_DATE="${backups[$((idx - 1))]}"

  echo ""
  echo "Restore options:"
  echo "  [1] Full restore (containers + databases)"
  echo "  [2] Container snapshots only"
  echo "  [3] Databases only"
  echo "  [4] Single container snapshot"
  echo ""
  read -rp "Select option [1-4]: " opt

  case "$opt" in
    1) MODE="full" ;;
    2) MODE="containers" ;;
    3) MODE="databases" ;;
    4)
      MODE="single-container"
      echo ""
      echo "Available containers: ${CONTAINERS[*]}"
      read -rp "Container VMID: " SINGLE_CT
      ;;
    *) echo "Invalid option"; exit 1 ;;
  esac
}

# ─── Functions ────────────────────────────────────────────────────────────────
rollback_container() {
  local vmid="$1"
  local snap_name="daily-${RESTORE_DATE}"

  log "  Rolling back CT ${vmid} to snapshot: ${snap_name}"

  # Check snapshot exists
  if ! pct listsnapshot "${vmid}" 2>/dev/null | grep -q "${snap_name}"; then
    log "  CT ${vmid}: snapshot '${snap_name}' not found — skipping"
    return 1
  fi

  # Stop container
  pct stop "${vmid}" 2>/dev/null || true
  sleep 5

  # Rollback
  if pct rollback "${vmid}" "${snap_name}" 2>>"${LOG_FILE}"; then
    sleep 3
    pct start "${vmid}" 2>>"${LOG_FILE}" || true
    log "  CT ${vmid}: rollback OK"
    return 0
  else
    log "  CT ${vmid}: rollback FAILED"
    pct start "${vmid}" 2>/dev/null || true
    return 1
  fi
}

restore_db_mysql() {
  local ct_id="$1"
  local container="$2"
  local db="$3"
  local user="$4"
  local password="$5"
  local dump_file="${BACKUP_DIR}/databases/${db}-${RESTORE_DATE}.sql.gz"

  if [ ! -f "${dump_file}" ]; then
    log "  ${db}: dump file not found: ${dump_file}"
    return 1
  fi

  log "  Restoring MySQL ${db} on CT ${ct_id}..."
  if gunzip -c "${dump_file}" | pct exec "${ct_id}" -- bash -c \
    "docker exec -i ${container} mysql -u${user} -p'${password}' ${db}"; then
    log "  ${db}: restore OK"
    return 0
  else
    log "  ${db}: restore FAILED"
    return 1
  fi
}

restore_db_postgres() {
  local ct_id="$1"
  local container="$2"
  local db="$3"
  local user="$4"
  local password="$5"
  local dump_file="${BACKUP_DIR}/databases/${db}-${RESTORE_DATE}.sql.gz"

  if [ ! -f "${dump_file}" ]; then
    log "  ${db}: dump file not found: ${dump_file}"
    return 1
  fi

  log "  Restoring PostgreSQL ${db} on CT ${ct_id}..."
  if gunzip -c "${dump_file}" | pct exec "${ct_id}" -- bash -c \
    "PGPASSWORD='${password}' docker exec -i -e PGPASSWORD='${password}' ${container} psql -U ${user} -d ${db}"; then
    log "  ${db}: restore OK"
    return 0
  else
    log "  ${db}: restore FAILED"
    return 1
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
[ "${MODE}" = "interactive" ] && interactive_menu

BACKUP_DIR="${BACKUP_ROOT}/${RESTORE_DATE}"
if [ ! -d "${BACKUP_DIR}" ]; then
  echo "ERROR: Backup directory not found: ${BACKUP_DIR}"
  exit 1
fi

log "================================================================"
log "=== Restore Started: date=${RESTORE_DATE} mode=${MODE} ==="
log "================================================================"

ERRORS=0
START_TIME=$(date +%s)

# Container snapshot rollback
if [[ "${MODE}" =~ ^(full|containers)$ ]]; then
  log "--- Rolling back container snapshots ---"
  log "WARNING: This will STOP all containers briefly"
  if [ "${MODE}" = "interactive" ] || [ "${MODE}" = "full" ]; then
    read -rp "Confirm container rollback? [y/N]: " confirm
    [[ "${confirm}" != "y" && "${confirm}" != "Y" ]] && log "Container rollback skipped." || {
      for vmid in "${CONTAINERS[@]}"; do
        [ "${vmid}" = "210" ] && { log "  CT 210 (ci-runner): skipped to preserve GitHub Actions runner"; continue; }
        rollback_container "${vmid}" || ERRORS=$((ERRORS + 1))
      done
      log "Waiting 45s for containers to start..."
      sleep 45
    }
  else
    for vmid in "${CONTAINERS[@]}"; do
      [ "${vmid}" = "210" ] && { log "  CT 210 (ci-runner): skipped"; continue; }
      rollback_container "${vmid}" || ERRORS=$((ERRORS + 1))
    done
    log "Waiting 45s for containers to start..."
    sleep 45
  fi
fi

# Single container rollback
if [ "${MODE}" = "single-container" ] && [ -n "${SINGLE_CT}" ]; then
  log "--- Rolling back single container CT ${SINGLE_CT} ---"
  rollback_container "${SINGLE_CT}" || ERRORS=$((ERRORS + 1))
  log "Waiting 30s for container to start..."
  sleep 30
fi

# Database restores
if [[ "${MODE}" =~ ^(full|databases)$ ]]; then
  log "--- Restoring databases ---"
  log "WARNING: This will OVERWRITE current database data"
  if [ "${MODE}" != "databases" ]; then
    read -rp "Confirm database restore? [y/N]: " confirm
    [[ "${confirm}" != "y" && "${confirm}" != "Y" ]] && log "Database restore skipped." || {
      # Passwords must be set as env vars or sourced from vault
      : "${SNIPEIT_MYSQL_USER:?Set SNIPEIT_MYSQL_USER}"
      : "${SNIPEIT_MYSQL_PASS:?Set SNIPEIT_MYSQL_PASS}"
      : "${NETBOX_PG_PASS:?Set NETBOX_PG_PASS}"
      : "${ZABBIX_MYSQL_ROOT_PASS:?Set ZABBIX_MYSQL_ROOT_PASS}"

      restore_db_mysql 201 "snipeit-db" "snipeit" "${SNIPEIT_MYSQL_USER}" "${SNIPEIT_MYSQL_PASS}" || ERRORS=$((ERRORS + 1))
      restore_db_postgres 201 "netbox-postgres-1" "netbox" "netbox" "${NETBOX_PG_PASS}" || ERRORS=$((ERRORS + 1))
      restore_db_mysql 202 "mysql-server" "zabbix" "root" "${ZABBIX_MYSQL_ROOT_PASS}" || ERRORS=$((ERRORS + 1))
    }
  fi
fi

ELAPSED=$(( $(date +%s) - START_TIME ))
log "================================================================"
log "=== Restore completed in ${ELAPSED}s ==="
log "    Errors: ${ERRORS}"
log "================================================================"

if [ "${ERRORS}" -gt 0 ]; then
  log "WARNING: ${ERRORS} error(s) occurred. Manual review required."
  exit 1
fi

echo ""
echo "✅ Restore completed successfully in ${ELAPSED}s"
echo "   Run health checks: ./scripts/health-check.sh"
exit 0
