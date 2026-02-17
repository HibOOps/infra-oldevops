# Runbook : Déploiement Automatisé Infrastructure (Story 1.3)

**Version** : 1.0
**Dernière mise à jour** : 2026-02-17
**Maintenu par** : Équipe DevOps

---

## Vue d'Ensemble

Ce runbook décrit le workflow GitOps de déploiement automatisé de l'infrastructure `infra-oldevops`. Tout merge vers la branche `main` déclenche le pipeline `deploy-infra.yml` via GitHub Actions.

```
Commit PR → Review → Merge main → Pipeline déclenché → Approbation manuelle → Déploiement
```

---

## Workflow Standard (Happy Path)

### Étape 1 : Préparer le changement d'infrastructure

```bash
# Créer une branche feature
git checkout main
git pull origin main
git checkout -b feat/ma-modification

# Modifier les fichiers Terraform / Ansible
# ...

# Commit et push
git add .
git commit -m "feat: description de la modification"
git push origin feat/ma-modification
```

### Étape 2 : Créer et valider la Pull Request

1. Aller sur GitHub → **New Pull Request** vers `main`
2. Attendre les checks CI automatiques (Terraform validate, Ansible lint, Security scan)
3. Obtenir la review du code (1 reviewer minimum)
4. Merger la PR une fois tous les checks verts

### Étape 3 : Approbation du déploiement

Dès que la PR est mergée sur `main` :
1. Le workflow `Deploy Infrastructure` est déclenché automatiquement
2. Aller sur **GitHub → Actions → Deploy Infrastructure**
3. Le job s'arrête sur l'étape **"Deploy to Production"** avec le statut `Waiting for approval`
4. Cliquer **"Review pending deployments"**
5. Vérifier les détails (commit, auteur, changements Terraform en plan)
6. Cliquer **"Approve and deploy"**

> ⚠️ **Important** : L'approbation déclenche la création des snapshots Proxmox AVANT tout changement. En cas de doute, refuser et vérifier.

### Étape 4 : Suivi du déploiement

Le pipeline exécute dans l'ordre :
| Étape | Description | Durée estimée |
|-------|-------------|---------------|
| Snapshots Proxmox | Backup de 5 containers | ~2 min |
| Terraform Apply | Application des changements infra | ~3-5 min |
| Ansible Traefik | Déploiement reverse proxy | ~2 min |
| Ansible Utilities | Vaultwarden, Snipe-IT, NetBox | ~3 min |
| Ansible Monitoring | Prometheus, Grafana, Zabbix | ~3 min |
| Ansible App Demo | Application de démo (si présente) | ~2 min |
| Health Checks | Vérification HTTP/SSH/Docker | ~1 min |
| Notification | Commentaire sur le commit | ~10s |

**Durée totale estimée** : 15-20 minutes

### Étape 5 : Vérifier la notification

Après succès, un commentaire est automatiquement posté sur le commit avec :
- ✅ Status du déploiement
- Durée totale
- Résultats Terraform (X resources changed)
- Résultats Ansible par service
- Status des health checks

---

## En Cas d'Échec : Rollback Automatique

Si les health checks échouent, **le rollback est automatique** :

1. `rollback.sh` est exécuté avec le nom du snapshot créé au début
2. Les containers sont stoppés, rollback vers snapshot, redémarrés
3. Les health checks sont ré-exécutés pour confirmer la restauration
4. Le workflow se termine avec **status `failure`** même si le rollback réussit

### Vérifier le rollback

```bash
# Connexion sur Proxmox
ssh root@192.168.1.50

# Vérifier les snapshots existants
pct listsnapshot 200
pct listsnapshot 210
pct listsnapshot 240
pct listsnapshot 250

# Vérifier le statut des containers
pct status 200
pct status 210
pct status 220
pct status 240
pct status 250
```

---

## Rollback Manuel

Si le rollback automatique échoue ou si vous devez rollback manuellement :

```bash
# Sur le runner CI ou en local
export PROXMOX_API_TOKEN="<votre_token>"
export PROXMOX_HOST="192.168.1.50"
export PROXMOX_NODE="pve"

# Lister les snapshots disponibles (exemple pour CT 200)
curl -s -H "Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}" \
  "https://192.168.1.50:8006/api2/json/nodes/pve/lxc/200/snapshot" \
  --insecure | python3 -m json.tool

# Exécuter le rollback vers un snapshot spécifique
./scripts/rollback.sh "auto-backup-2026-02-17-143022"
```

---

## Test du Rollback (Phase 9 - CA3.7)

Pour tester le rollback forcé en cas d'échec de health check :

### Option A : Modifier temporairement health-check.sh

```bash
# Sur le runner self-hosted UNIQUEMENT pour le test
# Forcer l'échec du health check sur un service
echo "exit 1" >> scripts/health-check.sh
# Déclencher le déploiement
# Restaurer ensuite
git checkout scripts/health-check.sh
```

### Option B : Arrêter temporairement un service

```bash
# Se connecter sur un container
ssh root@192.168.1.200

# Stopper temporairement Traefik
docker stop traefik

# Le health check va échouer → rollback déclenché
# Après rollback, Traefik redémarre via snapshot restore
```

> ⚠️ **Attention** : Tester le rollback en heures creuses pour minimiser l'impact sur les services.

---

## Health Checks Manuels

```bash
# Vérifier tous les services HTTP
for url in vault.oldevops.fr grafana.oldevops.fr status.oldevops.fr inventory.oldevops.fr proxy.oldevops.fr; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${url}")
  echo "${code} - ${url}"
done

# Vérifier la connectivité SSH
for host in 192.168.1.200 192.168.1.201 192.168.1.202 192.168.1.210 192.168.1.250; do
  ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@${host} 'echo "OK: $(hostname)"'
done

# Vérifier Docker sur chaque container
for host in 192.168.1.200 192.168.1.202 192.168.1.210 192.168.1.250; do
  echo "=== ${host} ==="
  ssh root@${host} 'docker ps --format "{{.Names}}: {{.Status}}"'
done
```

---

## Secrets Requis (GitHub Environment `production`)

| Secret | Description |
|--------|-------------|
| `PROXMOX_API_TOKEN` | Token API Proxmox format `user@realm!tokenid=secret` |
| `PROXMOX_PASSWORD` | Mot de passe admin Proxmox (pour Terraform) |
| `PROXMOX_USERNAME` | Utilisateur Proxmox (pour Terraform) |
| `CONTAINER_PASSWORD` | Mot de passe root des containers LXC |
| `OVH_S3_ACCESS_KEY` | Clé accès OVH S3 (Terraform state backend) |
| `OVH_S3_SECRET_KEY` | Clé secrète OVH S3 |
| `SSH_PRIVATE_KEY` | Clé SSH privée pour accès containers |
| `ANSIBLE_VAULT_PASSWORD` | Mot de passe Ansible Vault |

---

## Contacts et Escalade

- **Problème Terraform State** : Vérifier le lock S3 OVH
- **Runner offline** : Vérifier le container 210 (ci-runner)
- **Proxmox inaccessible** : Accès direct sur 192.168.1.50:8006
- **Rollback échoué** : Restaurer manuellement via interface Proxmox Web UI

---

## Références

- [GitHub Actions - Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [Workflow : `.github/workflows/deploy-infra.yml`](../../.github/workflows/deploy-infra.yml)
- [Script Snapshots : `scripts/create-snapshots.sh`](../../scripts/create-snapshots.sh)
- [Script Health Check : `scripts/health-check.sh`](../../scripts/health-check.sh)
- [Script Rollback : `scripts/rollback.sh`](../../scripts/rollback.sh)
