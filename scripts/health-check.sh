#!/bin/bash
# Post-deployment health checks for all services
# Usage: ./health-check.sh
# Returns: exit 0 if all pass, exit 1 if any fail

set -uo pipefail

FAILED=0
RESULTS=""

# --- HTTP Health Checks ---
echo "=== HTTP Health Checks ==="

declare -A HTTP_SERVICES
HTTP_SERVICES=(
  ["proxy.oldevops.fr"]="200,301,302,404"   # Traefik dashboard: may redirect HTTP→HTTPS
  ["vault.oldevops.fr"]="200,301,302"
  ["status.oldevops.fr"]="200,301,302"      # Uptime Kuma: redirects HTTP→HTTPS
  ["grafana.oldevops.fr"]="200,301,302,502"  # 502 while Grafana is starting
  ["inventory.oldevops.fr"]="200,301,302"   # Snipe-IT: redirects HTTP→HTTPS
  ["monitoring.oldevops.fr"]="200,301,302"
  ["demo.oldevops.fr"]="200,301,302,502,503" # PriceSync frontend: 503 while starting
)

for SERVICE in "${!HTTP_SERVICES[@]}"; do
  EXPECTED_CODES="${HTTP_SERVICES[$SERVICE]}"
  URL="https://${SERVICE}"

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --insecure "${URL}" 2>/dev/null || echo "000")

  # Check if returned code is in expected codes
  PASS=0
  IFS=',' read -ra CODES <<< "${EXPECTED_CODES}"
  for CODE in "${CODES[@]}"; do
    if [ "${HTTP_CODE}" = "${CODE}" ]; then
      PASS=1
      break
    fi
  done

  if [ "${PASS}" -eq 1 ]; then
    echo "  OK ${SERVICE} (HTTP ${HTTP_CODE})"
    RESULTS="${RESULTS}OK|${SERVICE}|HTTP ${HTTP_CODE}\n"
  else
    echo "  FAIL ${SERVICE} (HTTP ${HTTP_CODE}, expected ${EXPECTED_CODES})"
    RESULTS="${RESULTS}FAIL|${SERVICE}|HTTP ${HTTP_CODE}\n"
    FAILED=1
  fi
done

# --- SSH Health Checks ---
echo ""
echo "=== SSH Health Checks ==="

CONTAINERS=(
  "192.168.1.200"
  "192.168.1.201"
  "192.168.1.202"
  # 192.168.1.210 excluded: this is the CI runner itself, SSH self-check always fails
  "192.168.1.250"
)

for HOST in "${CONTAINERS[@]}"; do
  echo -n "  SSH ${HOST}: "

  if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "root@${HOST}" 'uptime' >/dev/null 2>&1; then
    echo "OK (uptime)"
    RESULTS="${RESULTS}OK|SSH ${HOST}|uptime OK\n"
  else
    echo "FAIL (unreachable)"
    RESULTS="${RESULTS}FAIL|SSH ${HOST}|unreachable\n"
    FAILED=1
  fi
done

# --- Docker Health Checks ---
echo ""
echo "=== Docker Health Checks ==="

for HOST in "${CONTAINERS[@]}"; do
  echo -n "  Docker ${HOST}: "

  DOCKER_STATUS=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "root@${HOST}" \
    'docker ps --format "{{.Names}}: {{.Status}}"' 2>/dev/null || echo "UNREACHABLE")

  if [ "${DOCKER_STATUS}" = "UNREACHABLE" ]; then
    echo "FAIL (cannot connect)"
    RESULTS="${RESULTS}FAIL|Docker ${HOST}|cannot connect\n"
    FAILED=1
  elif echo "${DOCKER_STATUS}" | grep -q "Up"; then
    RUNNING=$(echo "${DOCKER_STATUS}" | grep -c "Up" || true)
    echo "OK (${RUNNING} containers running)"
    RESULTS="${RESULTS}OK|Docker ${HOST}|${RUNNING} containers up\n"
  else
    echo "FAIL (no running containers)"
    RESULTS="${RESULTS}FAIL|Docker ${HOST}|no running containers\n"
    FAILED=1
  fi
done

# --- Summary ---
echo ""
echo "=== Health Check Summary ==="

if [ "${FAILED}" -eq 0 ]; then
  echo "All health checks PASSED"
else
  echo "Some health checks FAILED"
fi

# Export results for workflow
echo "health_results<<EOF" >> "${GITHUB_OUTPUT:-/dev/null}"
echo -e "${RESULTS}" >> "${GITHUB_OUTPUT:-/dev/null}"
echo "EOF" >> "${GITHUB_OUTPUT:-/dev/null}"
echo "health_status=$([ ${FAILED} -eq 0 ] && echo 'pass' || echo 'fail')" >> "${GITHUB_OUTPUT:-/dev/null}"

exit ${FAILED}
