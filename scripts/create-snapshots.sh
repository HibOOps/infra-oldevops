#!/bin/bash
# Create Proxmox snapshots for all active containers before deployment
# Usage: ./create-snapshots.sh
# Requires: PROXMOX_API_TOKEN, PROXMOX_HOST (defaults to 192.168.1.50)

set -euo pipefail

PROXMOX_HOST="${PROXMOX_HOST:-192.168.1.50}"
PROXMOX_NODE="${PROXMOX_NODE:-pve}"
CONTAINERS=(200 210 220 240 250)
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
SNAPSHOT_NAME="auto-backup-${TIMESTAMP}"

echo "=== Creating Pre-Deployment Snapshots ==="
echo "Snapshot name: ${SNAPSHOT_NAME}"
echo "Containers: ${CONTAINERS[*]}"
echo ""

FAILED=0

for CTID in "${CONTAINERS[@]}"; do
  echo -n "Creating snapshot for CT ${CTID}... "

  HTTP_CODE=$(curl -s -o /tmp/snap_response_${CTID}.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"snapname\": \"${SNAPSHOT_NAME}\", \"description\": \"Auto backup before deployment ${TIMESTAMP}\"}" \
    "https://${PROXMOX_HOST}:8006/api2/json/nodes/${PROXMOX_NODE}/lxc/${CTID}/snapshot" \
    --insecure 2>/dev/null)

  if [[ "${HTTP_CODE}" =~ ^2[0-9]{2}$ ]]; then
    echo "OK (HTTP ${HTTP_CODE})"
  else
    echo "FAILED (HTTP ${HTTP_CODE})"
    cat /tmp/snap_response_${CTID}.json 2>/dev/null || true
    FAILED=1
  fi
done

echo ""

if [ "${FAILED}" -eq 1 ]; then
  echo "ERROR: One or more snapshots failed to create. Aborting deployment."
  exit 1
fi

echo "All snapshots created successfully: ${SNAPSHOT_NAME}"
echo "snapshot_name=${SNAPSHOT_NAME}" >> "${GITHUB_OUTPUT:-/dev/null}"
