# Runbook : Disaster Recovery

**Dernière mise à jour** : 2026-02-18
**RTO cible** : < 30 minutes
**RPO cible** : < 24 heures
**Responsable** : Ingénieur Infrastructure (oldevops.fr)

---

## Vue d'ensemble

Ce runbook décrit les procédures de restauration de l'infrastructure oldevops.fr suite à différents scénarios de panne. La stratégie de backup repose sur :

| Niveau | Mécanisme | Fréquence | Rétention |
|--------|-----------|-----------|-----------|
| Snapshots Proxmox | `pct snapshot` via cron | Quotidien 03h00 | 7 jours |
| Dumps base de données | `pct exec` → mysqldump/pg_dump | Quotidien 03h00 | 7 jours |
| Volumes applicatifs | tar via `pct exec` | Quotidien 03h00 | 7 jours |
| Offsite OVH S3 | rclone sync | Quotidien (après backup local) | 30 jours |
| État Terraform | OVH S3 backend | À chaque `terraform apply` | Permanent |
| Code & config | Git (GitHub) | À chaque commit | Permanent |

---

## Infrastructure de Référence

| Container | VMID | IP | Services |
|-----------|------|-----|---------|
| proxy | 200 | 192.168.1.200 | Traefik |
| utilities | 201 | 192.168.1.201 | Vaultwarden, Snipe-IT, NetBox |
| monitoring | 202 | 192.168.1.202 | Prometheus, Grafana, Loki, Zabbix |
| ci-runner | 210 | 192.168.1.210 | GitHub Actions Runner |
| app-demo | 250 | 192.168.1.250 | Application demo |

**Proxmox host** : 192.168.1.50 (`homelab`)
**Backup local** : `/var/backups/infra-oldevops/YYYY-MM-DD/`

---

## Scénarios de Panne

### Scénario A : Panne d'un seul container

**Symptômes** : Un service inaccessible, container en erreur
**Diagnostic** :
```bash
ssh root@192.168.1.50 "pct status <VMID>"
ssh root@<IP_CONTAINER> "docker ps"
```

**Procédure** (RTO ~5 min) :
1. Identifier le dernier snapshot valide :
   ```bash
   ssh root@192.168.1.50 "pct listsnapshot <VMID>"
   ```
2. Rollback du snapshot (depuis Proxmox host) :
   ```bash
   ssh root@192.168.1.50
   /usr/local/bin/restore.sh --container <VMID> --date YYYY-MM-DD
   ```
3. Vérifier les services :
   ```bash
   ssh root@<IP_CONTAINER> "docker ps"
   ./scripts/health-check.sh
   ```

---

### Scénario B : Corruption de données (base de données)

**Symptômes** : Erreurs d'application, données incohérentes
**Diagnostic** :
```bash
# Vérifier l'état des bases
ssh root@192.168.1.201 "docker exec snipeit-db mysqladmin -uroot -p'PASSWORD' status"
ssh root@192.168.1.201 "docker exec netbox-postgres-1 pg_isready -U netbox"
```

**Procédure** (RTO ~15 min) :
1. Identifier le backup valide :
   ```bash
   ls /var/backups/infra-oldevops/
   ```
2. Arrêter les services concernés pour éviter d'autres corruptions :
   ```bash
   ssh root@192.168.1.201 "docker stop snipeit"  # exemple
   ```
3. Restaurer la base :
   ```bash
   ssh root@192.168.1.50
   # Variables d'environnement nécessaires
   export SNIPEIT_MYSQL_USER=snipeit
   export SNIPEIT_MYSQL_PASS=<from vault>
   export NETBOX_PG_PASS=<from vault>
   export ZABBIX_MYSQL_ROOT_PASS=<from vault>
   /usr/local/bin/restore.sh --databases-only --date YYYY-MM-DD
   ```
4. Redémarrer les services et vérifier :
   ```bash
   ssh root@192.168.1.201 "docker start snipeit"
   ./scripts/health-check.sh
   ```

---

### Scénario C : Perte de l'état Terraform

**Symptômes** : `terraform plan` échoue, state manquant ou corrompu
**Diagnostic** :
```bash
cd terraform
terraform state list 2>&1
```

**Procédure** (RTO ~10 min) :
1. Le state est dans OVH S3 (`infraoldevops/terraform/homelab/terraform.tfstate`).
   Lister les versions :
   ```bash
   aws s3api list-object-versions \
     --bucket infraoldevops \
     --prefix terraform/homelab/terraform.tfstate \
     --endpoint-url https://s3.rbx.io.cloud.ovh.net/ \
     --region rbx
   ```
2. Restaurer une version précédente :
   ```bash
   aws s3api get-object \
     --bucket infraoldevops \
     --key terraform/homelab/terraform.tfstate \
     --version-id <VERSION_ID> \
     --endpoint-url https://s3.rbx.io.cloud.ovh.net/ \
     terraform.tfstate.backup
   # Vérifier le contenu puis uploader
   aws s3 cp terraform.tfstate.backup \
     s3://infraoldevops/terraform/homelab/terraform.tfstate \
     --endpoint-url https://s3.rbx.io.cloud.ovh.net/
   ```
3. En dernier recours : recréer l'infrastructure depuis zéro (voir [Scénario D](#scénario-d--perte-totale-du-proxmox-host)).

---

### Scénario D : Perte totale du Proxmox host

**Symptômes** : Host Proxmox inaccessible, perte de l'ensemble des containers
**Durée estimée** : 60-120 minutes

**Prérequis** :
- Nouveau host Proxmox installé (même IP : 192.168.1.50, node name : `homelab`)
- Clé SSH root configurée
- GitHub secrets opérationnels (PROXMOX_API_TOKEN, OVH_S3, ANSIBLE_VAULT_PASSWORD)

**Procédure complète** :
1. **Récupérer le code** :
   ```bash
   git clone https://github.com/HibOOps/infra-oldevops.git
   cd infra-oldevops/infra-oldevops
   ```

2. **Déployer les containers via Terraform** :
   ```bash
   cd terraform
   export AWS_ACCESS_KEY_ID=<OVH_S3_KEY>
   export AWS_SECRET_ACCESS_KEY=<OVH_S3_SECRET>
   terraform init
   terraform apply -auto-approve
   ```

3. **Configurer les containers via Ansible** :
   ```bash
   cd ../ansible
   ansible-playbook -i inventory.ini playbooks/ssh-setup.yml
   ansible-playbook -i inventory.ini playbooks/monitoring.yml -e @vault/secrets.yml --ask-vault-pass
   ansible-playbook -i inventory.ini playbooks/utilities.yml -e @vault/secrets.yml --ask-vault-pass
   ansible-playbook -i inventory.ini playbooks/proxy.yml -e @vault/secrets.yml --ask-vault-pass
   ```

4. **Déployer le backup agent** :
   ```bash
   ansible-playbook -i inventory.ini playbooks/backup.yml -e @vault/secrets.yml --ask-vault-pass
   ```

5. **Restaurer les données depuis OVH S3** :
   ```bash
   ssh root@192.168.1.50
   # Télécharger les backups depuis S3
   rclone sync "ovh-s3:infraoldevops/backups/YYYY-MM-DD/" \
     /var/backups/infra-oldevops/YYYY-MM-DD/ \
     --config /etc/rclone/rclone.conf
   # Restaurer les bases
   export SNIPEIT_MYSQL_USER=... # (from vault)
   /usr/local/bin/restore.sh --databases-only --date YYYY-MM-DD
   ```

6. **Vérification finale** :
   ```bash
   ./scripts/health-check.sh
   ```

---

## Checklist de Validation Post-Recovery

Après toute procédure de restauration, vérifier les points suivants :

### Services HTTP
- [ ] `https://traefik.oldevops.fr` — Traefik dashboard accessible
- [ ] `https://vault.oldevops.fr` — Vaultwarden accessible
- [ ] `https://snipe.oldevops.fr` — Snipe-IT accessible (connexion DB OK)
- [ ] `https://netbox.oldevops.fr` — NetBox accessible
- [ ] `https://monitoring.oldevops.fr` — Zabbix UI
- [ ] `https://grafana.oldevops.fr` — Grafana avec dashboards
- [ ] `https://status.oldevops.fr` — Uptime Kuma

### Observabilité
- [ ] Prometheus: `http://192.168.1.202:9090/targets` — tous les targets UP
- [ ] Loki: labels API retourne les 4 hosts (200, 201, 202, 250)
- [ ] Grafana: dashboards Infrastructure, Application, Logs chargés

### Infrastructure
- [ ] `pct list` sur Proxmox — 5 containers running
- [ ] `terraform state list` — state cohérent avec les containers
- [ ] GitHub Actions Runner CT 210 — connecté et opérationnel

### Backup
- [ ] Backup script actif : `crontab -l | grep backup`
- [ ] Test manuel : `/usr/local/bin/backup-infra.sh --no-snapshot --no-s3`

---

## Commandes Utiles

```bash
# Liste des snapshots disponibles
ssh root@192.168.1.50 "for ct in 200 201 202 210 250; do echo \"CT $ct:\"; pct listsnapshot $ct; done"

# Taille des backups locaux
ssh root@192.168.1.50 "du -sh /var/backups/infra-oldevops/*/"

# Dernière exécution du backup
ssh root@192.168.1.50 "tail -20 /var/backups/infra-oldevops/backup.log"

# Lancer un backup manuel (sans snapshot, sans S3)
ssh root@192.168.1.50 "/usr/local/bin/backup-infra.sh --no-snapshot --no-s3"

# Health check complet
./scripts/health-check.sh

# Rollback complet pré-déploiement (CI/CD)
./scripts/rollback.sh <snapshot_name>
```

---

## Contacts et Escalade

| Rôle | Contact |
|------|---------|
| Ingénieur Infrastructure | olivier.labe@oldevops.fr |
| GitHub Repository | https://github.com/HibOOps/infra-oldevops |
| Proxmox Host | 192.168.1.50 (accès SSH root) |

---

## Historique des Tests de Restoration

| Date | Scénario | VMID | Durée | Résultat | Notes |
|------|----------|------|-------|----------|-------|
| 2026-02-18 | Scénario A — rollback CT 250 (app-demo) | 250 | 45s | ✅ OK | Snapshot `daily-2026-02-18`, données intègres post-rollback |
| 2026-02-18 | DB dump test — Snipe-IT + NetBox + Zabbix | 201, 202 | 2min | ✅ OK | DB dumps créés sans erreur, tailles cohérentes |
