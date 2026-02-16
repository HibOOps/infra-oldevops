# Infrastructure Quick Reference Guide

**Last Updated:** 2026-02-16
**Status:** ✅ Production Ready

---

## Container Inventory

| VMID | Hostname | IP | Services | Access |
|------|----------|-----|----------|--------|
| 200 | proxy | 192.168.1.200 | Traefik | `ssh root@192.168.1.200` |
| 201 | utilities | 192.168.1.201 | Vaultwarden, Snipe-IT, NetBox | `ssh root@192.168.1.201` |
| 202 | monitoring | 192.168.1.202 | Prometheus, Grafana, Zabbix, Loki | `ssh root@192.168.1.202` |
| 210 | ci-runner | 192.168.1.210 | GitHub Actions Runner | `ssh root@192.168.1.210` |
| 250 | app-demo | 192.168.1.250 | React App, Node.js API, PostgreSQL | `ssh root@192.168.1.250` |

---

## Public URLs

| Service | URL | Container |
|---------|-----|-----------|
| **App Frontend** | https://app.oldevops.fr | app-demo |
| **App API** | https://api.oldevops.fr | app-demo |
| Vaultwarden | https://vault.oldevops.fr | utilities |
| Snipe-IT | https://inventory.oldevops.fr | utilities |
| NetBox | https://netbox.oldevops.fr | utilities |
| Uptime Kuma | https://status.oldevops.fr | monitoring |
| Zabbix | https://monitoring.oldevops.fr | monitoring |
| Prometheus | https://prometheus.oldevops.fr | monitoring |
| Grafana | https://grafana.oldevops.fr | monitoring |
| Traefik Dashboard | https://proxy.oldevops.fr | proxy |

---

## Common Commands

### Check Container Status
```bash
# All containers
for ip in 192.168.1.200 192.168.1.201 192.168.1.202 192.168.1.210 192.168.1.250; do
  echo "=== $ip ===" && ssh root@$ip "hostname && uptime"
done

# Specific container
ssh root@192.168.1.250 "docker ps"
```

### App-Demo Operations
```bash
# Check health
ssh root@192.168.1.250 "curl -s http://localhost:8080/api/health"

# View logs
ssh root@192.168.1.250 "docker logs app-demo-backend"
ssh root@192.168.1.250 "docker logs app-demo-frontend"
ssh root@192.168.1.250 "docker logs app-demo-db"

# Restart services
ssh root@192.168.1.250 "cd /opt/app-demo && docker compose restart"

# Rebuild and restart
ssh root@192.168.1.250 "cd /opt/app-demo && docker compose up -d --build"

# Run database migrations
ssh root@192.168.1.250 "docker exec app-demo-backend npx prisma migrate deploy"
```

### Traefik Operations
```bash
# Check status
ssh root@192.168.1.200 "docker ps | grep traefik"

# View logs
ssh root@192.168.1.200 "docker logs traefik | tail -50"

# Check SSL certificates
ssh root@192.168.1.200 "cat /opt/traefik/acme.json | jq '.ovh.Certificates[] | .domain.main'"

# Restart Traefik
ssh root@192.168.1.200 "cd /opt/traefik && docker compose restart"
```

### Terraform Operations
```bash
# Set credentials
export AWS_ACCESS_KEY_ID="5959720fc0d64fff9989df1310ec786b"
export AWS_SECRET_ACCESS_KEY="f430b26e52e04eb98479e7a9bd588b0b"

# Check plan
cd terraform
terraform plan

# Apply changes
terraform apply

# Check state
terraform state list
terraform state show module.app_demo.proxmox_lxc.this
```

### Ansible Operations
```bash
cd ansible

# Deploy Traefik
ansible-playbook -i inventory.ini playbooks/traefik.yml --vault-password-file=.vault_pass

# Deploy app-demo
ansible-playbook -i inventory.ini playbooks/app-demo.yml --vault-password-file=.vault_pass

# Deploy monitoring
ansible-playbook -i inventory.ini playbooks/monitoring.yml --vault-password-file=.vault_pass

# Install Docker on specific host
ansible-playbook -i inventory.ini playbooks/install-docker-new-containers.yml --limit app_demo
```

---

## Troubleshooting

### App-Demo Not Accessible

1. **Check container is running:**
   ```bash
   ssh root@192.168.1.250 "docker ps"
   ```

2. **Check service health:**
   ```bash
   ssh root@192.168.1.250 "curl http://localhost:8080/api/health"
   ssh root@192.168.1.250 "curl -I http://localhost:3000"
   ```

3. **Check logs for errors:**
   ```bash
   ssh root@192.168.1.250 "docker logs app-demo-backend 2>&1 | tail -50"
   ```

4. **Check Traefik routing:**
   ```bash
   ssh root@192.168.1.200 "curl -s -H 'Host: api.oldevops.fr' http://localhost/api/health"
   ```

### SSL Certificate Issues

1. **Check certificate status:**
   ```bash
   ssh root@192.168.1.200 "docker logs traefik 2>&1 | grep -i acme"
   ```

2. **Check acme.json:**
   ```bash
   ssh root@192.168.1.200 "cat /opt/traefik/acme.json | jq '.'"
   ```

3. **Force certificate renewal:**
   ```bash
   ssh root@192.168.1.200 "rm /opt/traefik/acme.json && docker compose restart traefik"
   ```

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   ssh root@192.168.1.250 "docker exec app-demo-db pg_isready -U app_demo"
   ```

2. **Check database logs:**
   ```bash
   ssh root@192.168.1.250 "docker logs app-demo-db"
   ```

3. **Verify database connection from backend:**
   ```bash
   ssh root@192.168.1.250 "docker exec app-demo-backend npx prisma db pull"
   ```

---

## Key File Locations

### Terraform
- **Main config:** `/Users/olabe/Documents/GitHub/Infra-oldevops/infra-oldevops/terraform/main.tf`
- **State:** S3 (OVH): `s3://infraoldevops/terraform/homelab/terraform.tfstate`

### Ansible
- **Inventory:** `ansible/inventory.ini`
- **Vault:** `ansible/vault/secrets.yml` (encrypted)
- **Playbooks:** `ansible/playbooks/`
- **Roles:** `ansible/roles/`

### Container Paths
- **Traefik config:** `/opt/traefik/` (on proxy)
- **App-demo:** `/opt/app-demo/` (on app-demo)
- **Monitoring:** `/opt/prometheus/`, `/opt/grafana/`, etc. (on monitoring)

---

## Emergency Procedures

### Rollback App-Demo Deployment

```bash
# 1. Stop current deployment
ssh root@192.168.1.250 "cd /opt/app-demo && docker compose down"

# 2. Restore previous version (if backed up)
ssh root@192.168.1.250 "cd /opt && mv app-demo app-demo.failed && mv app-demo.backup app-demo"

# 3. Start services
ssh root@192.168.1.250 "cd /opt/app-demo && docker compose up -d"
```

### Restore from Proxmox Snapshot

```bash
# 1. List snapshots
ssh root@proxmox "pct listsnapshot <VMID>"

# 2. Restore snapshot
ssh root@proxmox "pct rollback <VMID> <snapshot-name>"

# 3. Start container
ssh root@proxmox "pct start <VMID>"
```

---

## Credentials

**Location:** `ansible/vault/secrets.yml` (encrypted with Ansible Vault)

**Vault Password File:** `ansible/.vault_pass`

**To view secrets:**
```bash
cd ansible
ansible-vault view vault/secrets.yml --vault-password-file=.vault_pass
```

**To edit secrets:**
```bash
ansible-vault edit vault/secrets.yml --vault-password-file=.vault_pass
```

---

## Monitoring & Alerts

### Health Checks

**App-Demo API:**
```bash
curl -s https://api.oldevops.fr/api/health | jq '.'
```

**Prometheus Targets:**
```bash
curl -s http://192.168.1.202:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

**Traefik Health:**
```bash
curl -s http://192.168.1.200:8080/api/http/services | jq '.[] | {name, status}'
```

### Logs

**Centralized Logging:** Loki (on monitoring container)

**Query Loki:**
```bash
# Via Grafana Explore: https://grafana.oldevops.fr
# Query example: {container_name="app-demo-backend"}
```

---

## Documentation Links

- **Remediation Report:** `docs/remediation/INFRA-REMEDIATION-2026-02-16.md`
- **Architecture Docs:** `docs/architecture/`
- **Session Context:** `docs/sessions/SESSION-CONTEXT-2026-02-16.md`
- **App Demo README:** `app-demo/README.md`

---

**For detailed procedures, see:** `docs/remediation/INFRA-REMEDIATION-2026-02-16.md`
