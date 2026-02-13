#!/bin/bash
# Rollback Proxmox containers to a specified snapshot
# Usage: ./rollback.sh <snapshot_name>
# Requires: PROXMOX_API_TOKEN, PROXMOX_HOST

set -uo pipefail

SNAPSHOT_NAME="${1:?Usage: rollback.sh <snapshot_name>}"
PROXMOX_HOST="${PROXMOX_HOST:-192.168.1.50}"
PROXMOX_NODE="${PROXMOX_NODE:-pve}"
CONTAINERS=(200 210 220 240 250)
TIMEOUT=300  # 5 minutes max

echo "=== Rollback to Snapshot: ${SNAPSHOT_NAME} ==="
echo "Containers: ${CONTAINERS[*]}"
echo "Timeout: ${TIMEOUT}s"
echo ""

FAILED=0
START_TIME=$(date +%s)

for CTID in "${CONTAINERS[@]}"; do
  ELAPSED=$(( $(date +%s) - START_TIME ))
  if [ "${ELAPSED}" -ge "${TIMEOUT}" ]; then
    echo "TIMEOUT: Rollback exceeded ${TIMEOUT}s limit. Aborting remaining containers."
    FAILED=1
    break
  fi

  echo -n "Rolling back CT ${CTID} to ${SNAPSHOT_NAME}... "

  # Stop the container first
  curl -s -o /dev/null \
    -X POST \
    -H "Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}" \
    "https://${PROXMOX_HOST}:8006/api2/json/nodes/${PROXMOX_NODE}/lxc/${CTID}/status/stop" \
    --insecure 2>/dev/null || true

  sleep 5

  # Rollback to snapshot
  HTTP_CODE=$(curl -s -o /tmp/rollback_response_${CTID}.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}" \
    "https://${PROXMOX_HOST}:8006/api2/json/nodes/${PROXMOX_NODE}/lxc/${CTID}/snapshot/${SNAPSHOT_NAME}/rollback" \
    --insecure 2>/dev/null)

  if [[ "${HTTP_CODE}" =~ ^2[0-9]{2}$ ]]; then
    echo "OK (HTTP ${HTTP_CODE})"
  else
    echo "FAILED (HTTP ${HTTP_CODE})"
    cat /tmp/rollback_response_${CTID}.json 2>/dev/null || true
    FAILED=1
  fi

  # Start the container
  sleep 3
  curl -s -o /dev/null \
    -X POST \
    -H "Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}" \
    "https://${PROXMOX_HOST}:8006/api2/json/nodes/${PROXMOX_NODE}/lxc/${CTID}/status/start" \
    --insecure 2>/dev/null || true
done

# Wait for containers to boot
echo ""
echo "Waiting 15s for containers to start..."
sleep 15

ELAPSED=$(( $(date +%s) - START_TIME ))
echo ""
echo "=== Rollback completed in ${ELAPSED}s ==="

if [ "${FAILED}" -eq 1 ]; then
  echo "WARNING: Some rollbacks failed. Manual intervention may be required."
  exit 1
fi

echo "All containers rolled back successfully."
exit 0
