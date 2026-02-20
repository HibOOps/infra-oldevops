# Runbook : Troubleshooting

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20

---

## Table des Matières

1. [Diagnostic Rapide](#1-diagnostic-rapide)
2. [Problèmes Application PriceSync](#2-problèmes-application-pricesync)
3. [Problèmes Traefik / SSL](#3-problèmes-traefik--ssl)
4. [Problèmes CI/CD](#4-problèmes-cicd)
5. [Problèmes Base de Données](#5-problèmes-base-de-données)
6. [Problèmes Observabilité](#6-problèmes-observabilité)
7. [Commandes de Diagnostic Générales](#7-commandes-de-diagnostic-générales)

---

## 1. Diagnostic Rapide

```bash
# État de tous les containers
ssh root@192.168.1.50 'for vmid in 200 210 220 240 250; do echo "=== $vmid ==="; pct status $vmid; done'

# Services Docker sur chaque container
for host in 192.168.1.200 192.168.1.201 192.168.1.202 192.168.1.250; do
  echo "=== $host ==="
  ssh root@$host 'docker ps --format "{{.Names}}: {{.Status}}"'
done

# Health checks HTTP
for url in vault.oldevops.fr grafana.oldevops.fr status.oldevops.fr demo.oldevops.fr; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$url")
  echo "$code — $url"
done
```

---

## 2. Problèmes Application PriceSync

### `The table public.users does not exist`

**Cause** : La base de données n'a pas été initialisée — `prisma db push` n'a pas été exécuté.

```bash
ssh root@192.168.1.250
cd /opt/app-demo
docker compose exec backend npx prisma db push
docker compose restart backend
```

### Backend ne démarre pas (exit 1)

```bash
ssh root@192.168.1.250
docker logs pricesync-backend --tail=50

# Causes courantes :
# - DATABASE_URL incorrecte → vérifier .env
# - db pas encore healthy → docker inspect pricesync-db
docker inspect pricesync-db --format='{{.State.Health.Status}}'
```

### Frontend : page blanche ou erreur CORS

```bash
# Vérifier que l'API répond
curl -s https://demo.oldevops.fr/api/health

# Vérifier les logs nginx frontend
docker logs pricesync-frontend --tail=30

# CORS : vérifier CORS_ORIGIN dans .env
ssh root@192.168.1.250 'grep CORS_ORIGIN /opt/app-demo/.env'
# Doit être : CORS_ORIGIN=https://demo.oldevops.fr
```

### Seed data manquant après redéploiement

```bash
ssh root@192.168.1.250
cd /opt/app-demo
docker compose exec backend node prisma/seed.js
```

---

## 3. Problèmes Traefik / SSL

### Service inaccessible (502 Bad Gateway)

```bash
ssh root@192.168.1.200
docker logs traefik --tail=50 | grep -i error

# Vérifier que le service backend est accessible depuis proxy
curl -s http://192.168.1.250:5000/api/health  # doit répondre

# Vérifier la config Traefik
cat /opt/traefik/dynamic_conf.yml
```

### Certificat SSL expiré ou invalide

```bash
ssh root@192.168.1.200

# Voir les certificats gérés par Traefik
cat /opt/traefik/acme.json | python3 -m json.tool | grep -A5 "domain"

# Forcer le renouvellement : supprimer le cert et redémarrer
# ⚠️ Ceci force une nouvelle émission (rate limit Let's Encrypt : 5/semaine)
docker restart traefik
```

### Traefik ne route pas (404 Not Found)

```bash
# Vérifier la syntaxe du dynamic_conf.yml
docker run --rm -v /opt/traefik:/etc/traefik traefik:v3 traefik validate

# Recharger Traefik sans downtime
docker kill -s HUP traefik

# Voir tous les routeurs actifs
curl -s http://localhost:8080/api/http/routers | python3 -m json.tool
```

---

## 4. Problèmes CI/CD

### Runner offline dans GitHub Actions

```bash
# Vérifier le statut du service runner
ssh root@192.168.1.210 'systemctl status github-runner'

# Relancer si arrêté
ssh root@192.168.1.210 'systemctl restart github-runner'

# Logs runner
ssh root@192.168.1.210 'journalctl -u github-runner -n 50'
```

### Workflow `app-docker` échoue (Trivy scan)

```
Error: 1 high vulnerabilities found
```

```bash
# Voir les CVEs identifiées dans les logs GitHub Actions
# Mettre à jour l'image de base si une version patchée existe
# Dans backend/Dockerfile :
# FROM node:20-alpine  →  FROM node:22-alpine
```

### Erreur SSH dans le workflow de déploiement

```
Permission denied (publickey)
```

Vérifier que `SSH_PRIVATE_KEY` dans GitHub Secrets correspond à la clé publique autorisée sur le container cible :
```bash
ssh root@192.168.1.250 'cat ~/.ssh/authorized_keys'
```

### `git fetch` — insufficient permission

```bash
# Permissions cassées sur le workspace du runner
ssh root@192.168.1.210 \
  'chown -R runner:runner /home/runner/_work/infra-oldevops/'
```
Puis relancer le workflow depuis l'onglet Actions → Re-run jobs.

---

## 5. Problèmes Base de Données

### PostgreSQL ne démarre pas

```bash
ssh root@192.168.1.250
docker logs pricesync-db --tail=30

# Problèmes courants :
# - Volume corrompu → supprimer et recréer (PERTE DE DONNÉES)
docker compose down
docker volume rm app-demo_pricesync_pgdata
docker compose up -d
# Puis re-seeder :
docker compose exec backend node prisma/seed.js
```

### Connexion refusée depuis le backend

```bash
# Vérifier que db est healthy
docker inspect pricesync-db --format='{{.State.Health.Status}}'

# Tester la connexion manuellement
docker compose exec db psql -U pricesync -d pricesync_db -c '\dt'
```

---

## 6. Problèmes Observabilité

### Grafana : pas de données (No Data)

```bash
ssh root@192.168.1.202

# Vérifier Prometheus scrape targets
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | grep health

# Vérifier Loki
curl -s http://localhost:3100/ready
```

### Loki : pas de logs récents

```bash
# Vérifier Promtail sur le container concerné
ssh root@192.168.1.250  # ou autre container
docker logs promtail --tail=20

# Tester l'envoi de logs
curl -s http://192.168.1.202:3100/loki/api/v1/push \
  -H 'Content-Type: application/json' \
  -d '{"streams":[{"stream":{"host":"test"},"values":[["'$(date +%s)000000000'","test log"]]}]}'
```

---

## 7. Commandes de Diagnostic Générales

```bash
# Ressources d'un container LXC
ssh root@192.168.1.250 'free -h && df -h && docker stats --no-stream'

# Logs système d'un container
ssh root@192.168.1.250 'journalctl -n 100 --no-pager'

# Connectivité réseau inter-containers
ssh root@192.168.1.200 'curl -s http://192.168.1.250:5000/api/health'

# Vérifier les snapshots Proxmox disponibles
ssh root@192.168.1.50 'for vmid in 200 210 220 240 250; do echo "=== CT $vmid ==="; pct listsnapshot $vmid; done'

# Ports en écoute sur un container
ssh root@192.168.1.250 'ss -tlnp'
```
