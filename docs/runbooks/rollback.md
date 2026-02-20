# Runbook : Procédures de Rollback

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20

---

## Table des Matières

1. [Rollback Application PriceSync](#1-rollback-application-pricesync)
2. [Rollback Configuration Traefik](#2-rollback-configuration-traefik)
3. [Rollback Ansible (Configuration Service)](#3-rollback-ansible-configuration-service)
4. [Rollback Terraform (Infrastructure LXC)](#4-rollback-terraform-infrastructure-lxc)
5. [Rollback via Snapshot Proxmox](#5-rollback-via-snapshot-proxmox)
6. [Décision d'escalade](#6-décision-descalade)

---

## 1. Rollback Application PriceSync

### Rollback automatique (CI/CD)

Le workflow `app-deploy.yml` effectue un rollback automatique si les health checks échouent :

```yaml
# Comportement automatique dans app-deploy.yml
- name: Rollback on health check failure
  run: |
    ssh root@192.168.1.250 \
      "cd /opt/app-demo && docker compose down && docker compose up -d"
```

Cela redémarre avec les images Docker déjà présentes (version précédente).

### Rollback manuel vers une image spécifique

```bash
# 1. Identifier les images disponibles dans GHCR
# Via GitHub → Packages → app-demo-backend

# 2. Sur le serveur app-demo
ssh root@192.168.1.250

# 3. Mettre à jour docker-compose.yml avec le SHA précédent
cd /opt/app-demo

# 4. Forcer un pull + redémarrage
docker compose pull
docker compose up -d

# 5. Vérifier les health checks
docker ps
curl -s http://localhost:5000/api/health
```

**Durée estimée** : < 5 minutes

---

## 2. Rollback Configuration Traefik

Traefik se recharge dynamiquement depuis `dynamic_conf.yml`. Un rollback = revenir au fichier précédent.

```bash
# 1. Se connecter sur le proxy
ssh root@192.168.1.200

# 2. Voir le git log des changements Traefik
# (Le fichier est géré par Ansible depuis le repo Git)
# Identifier le commit précédent dans infra-oldevops

# 3. Restaurer le fichier manuellement
# Copier l'ancienne version dans /opt/traefik/dynamic_conf.yml
cat /opt/traefik/dynamic_conf.yml   # version actuelle

# 4. Modifier pour revenir à l'état précédent
vim /opt/traefik/dynamic_conf.yml

# 5. Traefik se recharge automatiquement (watch sur le fichier)
# Vérifier les logs
docker logs traefik --tail=20

# 6. Tester le routing
curl -I https://vault.oldevops.fr
curl -I https://demo.oldevops.fr
```

**Durée estimée** : < 2 minutes

> ⚠️ Si Traefik refuse de démarrer après un mauvais fichier, valider la config :
> ```bash
> docker run --rm -v /opt/traefik:/etc/traefik traefik:v3 traefik validate
> ```

---

## 3. Rollback Ansible (Configuration Service)

Si un playbook Ansible a cassé un service :

```bash
# Option A : Rejouer le playbook sur le commit précédent
cd /path/to/infra-oldevops
git log --oneline ansible/roles/[role-name]/
git checkout [SHA_PRECEDENT] -- ansible/roles/[role-name]/

ansible-playbook -i inventory.ini playbooks/[playbook].yml --ask-vault-pass

# Option B : Corriger directement sur le serveur (temporaire)
ssh root@192.168.1.201   # ou le container concerné
docker ps                # identifier le container en échec
docker logs [container]  # voir l'erreur
docker restart [container]

# Option C : Relancer le container avec l'ancienne config
docker stop [container]
# modifier /opt/[service]/docker-compose.yml
docker compose up -d
```

**Durée estimée** : 5-10 minutes

---

## 4. Rollback Terraform (Infrastructure LXC)

Terraform modifie rarement les containers existants (ajout seulement). En cas de problème :

```bash
# Vérifier l'état actuel
cd infra-oldevops/terraform
terraform state list

# Voir les changements appliqués récemment
terraform show

# Détruire uniquement une ressource ajoutée par erreur
terraform destroy -target=proxmox_lxc.ci_runner  # exemple

# Ne PAS utiliser terraform destroy sans target — risque de tout supprimer
```

> ⚠️ **Ne jamais** faire `terraform destroy` sans `-target` sur cette infrastructure.

**Durée estimée** : 3-5 minutes

---

## 5. Rollback via Snapshot Proxmox

C'est le rollback le plus complet — retour à un état connu d'un container entier.

### Prérequis
Les snapshots sont créés automatiquement avant chaque déploiement infra par `scripts/create-snapshots.sh`.

```bash
# 1. Se connecter sur Proxmox
ssh root@192.168.1.50

# 2. Lister les snapshots disponibles pour un container
pct listsnapshot 250   # app-demo
pct listsnapshot 200   # proxy
pct listsnapshot 202   # monitoring

# Exemple de sortie :
# auto-backup-2026-02-20-143022  2026-02-20 14:30:22

# 3. Stopper le container
pct stop 250

# 4. Rollback vers le snapshot
pct rollback 250 auto-backup-2026-02-20-143022

# 5. Redémarrer
pct start 250

# 6. Vérifier
pct status 250
ssh root@192.168.1.250 'docker ps'
```

**Durée estimée** : 2-5 minutes par container

> ℹ️ Via l'interface web Proxmox (192.168.1.50:8006) : Container → Snapshots → Rollback

---

## 6. Décision d'escalade

| Symptôme | Action recommandée |
|----------|-------------------|
| App PriceSync KO, autres services OK | [Rollback app](#1-rollback-application-pricesync) |
| Routing Traefik cassé (tous les services KO) | [Rollback Traefik](#2-rollback-configuration-traefik) |
| Un service spécifique KO après Ansible | [Rollback Ansible](#3-rollback-ansible-configuration-service) |
| Container LXC inaccessible | [Snapshot Proxmox](#5-rollback-via-snapshot-proxmox) |
| Tout l'infra KO | Snapshot Proxmox sur tous les containers + vérifier Proxmox host |

En dernier recours : interface Proxmox Web UI sur `192.168.1.50:8006`.
