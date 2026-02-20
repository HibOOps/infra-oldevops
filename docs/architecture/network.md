# Topologie Réseau — Infra-OlDevOps

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20

---

## Table des Matières

1. [Réseau Physique](#1-réseau-physique)
2. [Containers LXC — Adressage IP](#2-containers-lxc--adressage-ip)
3. [Ports Exposés par Service](#3-ports-exposés-par-service)
4. [Routage Traefik](#4-routage-traefik)
5. [DNS OVH](#5-dns-ovh)
6. [Firewall (UFW)](#6-firewall-ufw)
7. [Flux Réseau CI/CD](#7-flux-réseau-cicd)

---

## 1. Réseau Physique

```
Internet
    │
    ▼
BBox Router — 192.168.1.254 (passerelle)
  NAT : port 80/443 → 192.168.1.200 (proxy)
    │
    ▼
Proxmox VE Host — bridge vmbr0
  Subnet : 192.168.1.0/24
```

**Prérequis réseau** :
- Port 80 et 443 ouverts en entrée sur la BBox, redirigés vers `.200`
- Aucun autre port exposé publiquement

---

## 2. Containers LXC — Adressage IP

| Hostname | IP | VMID | Gateway | DNS |
|----------|----|------|---------|-----|
| proxy | 192.168.1.200 | 200 | 192.168.1.254 | 1.1.1.1 |
| utilities | 192.168.1.201 | 220 | 192.168.1.254 | 1.1.1.1 |
| monitoring | 192.168.1.202 | 240 | 192.168.1.254 | 1.1.1.1 |
| ci-runner | 192.168.1.210 | 210 | 192.168.1.254 | 1.1.1.1 |
| app-demo | 192.168.1.250 | 250 | 192.168.1.254 | 1.1.1.1 |

Tous les containers communiquent directement via le bridge `vmbr0` — pas de réseau overlay.

---

## 3. Ports Exposés par Service

### LXC proxy (192.168.1.200)

| Port | Protocole | Service | Exposé publiquement |
|------|-----------|---------|---------------------|
| 80 | TCP | Traefik HTTP (redirect → HTTPS) | ✅ Oui |
| 443 | TCP | Traefik HTTPS | ✅ Oui |
| 8080 | TCP | Traefik Dashboard | ❌ Non (localhost only) |

### LXC utilities (192.168.1.201)

| Port | Service | Accessible via Traefik |
|------|---------|------------------------|
| 8081 | Snipe-IT | inventory.oldevops.fr |
| 8082 | Vaultwarden | vault.oldevops.fr |
| 8084 | NetBox | netbox.oldevops.fr |

### LXC monitoring (192.168.1.202)

| Port | Service | Accessible via Traefik |
|------|---------|------------------------|
| 3000 | Grafana | grafana.oldevops.fr |
| 3001 | Uptime Kuma | status.oldevops.fr |
| 3100 | Loki | ❌ Interne uniquement |
| 8083 | Zabbix | monitoring.oldevops.fr |
| 9090 | Prometheus | prometheus.oldevops.fr |
| 9100 | Node Exporter | ❌ Interne (scrape Prometheus) |

### LXC ci-runner (192.168.1.210)

| Port | Service | Notes |
|------|---------|-------|
| 22 | SSH | Accès restreint (clés uniquement) |

Pas de ports HTTP exposés — le runner est sortant uniquement (GitHub API).

### LXC app-demo (192.168.1.250)

| Port | Service | Accessible via Traefik |
|------|---------|------------------------|
| 80 | PriceSync Frontend (nginx) | demo.oldevops.fr |
| 5000 | PriceSync Backend (Express) | demo.oldevops.fr/api/* |
| 5432 | PostgreSQL | ❌ Interne uniquement |

---

## 4. Routage Traefik

Traefik utilise un **file provider** (`dynamic_conf.yml`) pour le routage inter-LXC.
Pas de Docker socket — configuration statique mise à jour via Ansible.

### Règles de routage actives

| Routeur | Rule | Service backend | Priorité |
|---------|------|-----------------|----------|
| vaultwarden | `Host(\`vault.oldevops.fr\`)` | http://192.168.1.201:8082 | — |
| snipeit | `Host(\`inventory.oldevops.fr\`)` | http://192.168.1.201:8081 | — |
| netbox | `Host(\`netbox.oldevops.fr\`)` | http://192.168.1.201:8084 | — |
| grafana | `Host(\`grafana.oldevops.fr\`)` | http://192.168.1.202:3000 | — |
| uptime-kuma | `Host(\`status.oldevops.fr\`)` | http://192.168.1.202:3001 | — |
| zabbix | `Host(\`monitoring.oldevops.fr\`)` | http://192.168.1.202:8083 | — |
| prometheus | `Host(\`prometheus.oldevops.fr\`)` | http://192.168.1.202:9090 | — |
| pricesync-api | `Host(\`demo.oldevops.fr\`) && PathPrefix(\`/api\`)` | http://192.168.1.250:5000 | 20 |
| pricesync-frontend | `Host(\`demo.oldevops.fr\`)` | http://192.168.1.250:80 | 10 |

### Middlewares globaux appliqués

- **secure-headers** : HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- **rate-limit** : 1000 req/s burst 500 par IP
- **redirect-to-https** : HTTP → HTTPS automatique

---

## 5. DNS OVH

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | proxy.oldevops.fr | `<IP_PUBLIQUE>` | 300 |
| CNAME | *.oldevops.fr | proxy.oldevops.fr | 300 |

Le wildcard `*.oldevops.fr` couvre automatiquement tous les sous-domaines.
Les certificats SSL sont générés automatiquement par Traefik via **Let's Encrypt DNS-01 (OVH API)**.

Vérification :
```bash
dig demo.oldevops.fr          # doit retourner l'IP publique
dig +short vault.oldevops.fr  # même résultat via CNAME
```

---

## 6. Firewall (UFW)

Règles identiques sur tous les containers :

```bash
# Politique par défaut
ufw default deny incoming
ufw default allow outgoing

# SSH — restreint au réseau local
ufw allow from 192.168.1.0/24 to any port 22

# HTTP/HTTPS — proxy uniquement
# (sur 192.168.1.200 uniquement)
ufw allow 80/tcp
ufw allow 443/tcp

# Ports services — LAN uniquement
ufw allow from 192.168.1.0/24 to any port 3000  # Grafana
ufw allow from 192.168.1.0/24 to any port 9090  # Prometheus
# etc.
```

Fail2ban actif sur SSH (`/etc/fail2ban/jail.local`) : 3 échecs → ban 1h.

---

## 7. Flux Réseau CI/CD

```
GitHub Actions (cloud)
    │
    │  HTTPS (443) — communication runner ↔ GitHub
    ▼
LXC ci-runner (192.168.1.210)
    │
    ├──SSH──► LXC proxy (192.168.1.200)      — Ansible deploy
    ├──SSH──► LXC utilities (192.168.1.201)  — Ansible deploy
    ├──SSH──► LXC monitoring (192.168.1.202) — Ansible deploy
    └──SSH──► LXC app-demo (192.168.1.250)   — docker compose pull && up
```

Le runner est **sortant uniquement** vers GitHub. Aucun port entrant exposé.
Déploiement sur app-demo via SSH (clé `SSH_PRIVATE_KEY` dans GitHub Secrets).
