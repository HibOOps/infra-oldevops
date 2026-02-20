# Architecture Overview — Infra-OlDevOps

**Version** : 2.0 (As-Built)
**Dernière mise à jour** : 2026-02-20
**Statut** : ✅ Production

---

## Table des Matières

1. [Résumé](#1-résumé)
2. [Infrastructure LXC](#2-infrastructure-lxc)
3. [Services Déployés](#3-services-déployés)
4. [Architecture Réseau](#4-architecture-réseau)
5. [Pipeline CI/CD](#5-pipeline-cicd)
6. [Observabilité](#6-observabilité)
7. [Sécurité](#7-sécurité)
8. [Références](#8-références)

---

## 1. Résumé

Infra-OlDevOps est une infrastructure homelab transformée en vitrine professionnelle DevOps. Elle démontre une maîtrise complète des pratiques modernes : Infrastructure-as-Code (Terraform + Ansible), CI/CD automatisé (GitHub Actions), application full-stack déployée (PriceSync), observabilité avancée (Prometheus + Loki + Grafana), et disaster recovery automatisé.

**Hébergement** : Proxmox VE sur serveur physique, réseau local 192.168.1.0/24
**Domaine** : `oldevops.fr` (OVH DNS + wildcard SSL Let's Encrypt DNS-01)
**Repository** : [github.com/HibOOps/infra-oldevops](https://github.com/HibOOps/infra-oldevops)

---

## 2. Infrastructure LXC

Cinq containers LXC (Debian 12, mode privilégié + nesting pour Docker) :

| Container | VMID | IP | vCPU | RAM | Disk | Rôle |
|-----------|------|----|------|-----|------|------|
| proxy | 200 | 192.168.1.200 | 2 | 1 GB | 8 GB | Traefik v3 — reverse proxy + SSL |
| utilities | 220 | 192.168.1.201 | 6 | 8 GB | 40 GB | Vaultwarden, Snipe-IT, NetBox |
| monitoring | 240 | 192.168.1.202 | 4 | 6 GB | 50 GB | Prometheus, Grafana, Loki, Zabbix, Uptime Kuma |
| ci-runner | 210 | 192.168.1.210 | 4 | 4 GB | 30 GB | GitHub Actions self-hosted runner |
| app-demo | 250 | 192.168.1.250 | 2 | 2 GB | 20 GB | PriceSync (React + Node.js + PostgreSQL) |

**Total** : 18 vCPU · 21 GB RAM · 148 GB Disk

---

## 3. Services Déployés

| Service | URL | Container | Port interne |
|---------|-----|-----------|-------------|
| Traefik | https://proxy.oldevops.fr | proxy | 80/443 |
| Vaultwarden | https://vault.oldevops.fr | utilities | 8082 |
| Snipe-IT | https://inventory.oldevops.fr | utilities | 8081 |
| NetBox | https://netbox.oldevops.fr | utilities | 8084 |
| Uptime Kuma | https://status.oldevops.fr | monitoring | 3001 |
| Zabbix | https://monitoring.oldevops.fr | monitoring | 8083 |
| Prometheus | https://prometheus.oldevops.fr | monitoring | 9090 |
| Grafana | https://grafana.oldevops.fr | monitoring | 3000 |
| Loki | Interne uniquement | monitoring | 3100 |
| PriceSync (app) | https://demo.oldevops.fr | app-demo | 80 (frontend) |
| PriceSync API | https://demo.oldevops.fr/api | app-demo | 5000 (backend) |

---

## 4. Architecture Réseau

```
Internet (*.oldevops.fr)
        │
        ▼
BBox Router (192.168.1.254)
  Port forward : 80/443 → 192.168.1.200
        │
        ▼
LXC proxy (192.168.1.200)
  Traefik v3 — SSL termination, routing par hostname
        │
        ├──► LXC utilities (192.168.1.201) — services internes
        ├──► LXC monitoring (192.168.1.202) — observabilité
        └──► LXC app-demo (192.168.1.250) — PriceSync
                  │  demo.oldevops.fr      → :80  (nginx/frontend)
                  └  demo.oldevops.fr/api  → :5000 (Express/backend)
```

Routage Traefik : **file provider** (`dynamic_conf.yml`) — pas de Docker socket.
SSL : **Let's Encrypt DNS-01** via OVH API, wildcard `*.oldevops.fr` auto-renouvelé.

→ Voir [network.md](network.md) pour la topologie complète avec ports et règles firewall.

---

## 5. Pipeline CI/CD

Trois workflows GitHub Actions déclenchés automatiquement sur push :

```
git push (app-demo/**)
   │
   ▼
app-build.yml       — lint + tests backend/frontend
   │ (success)
   ▼
app-docker.yml      — build images Docker → ghcr.io + Trivy scan
   │ (success)
   ▼
app-deploy.yml      — SSH → 192.168.1.250 → docker compose pull && up -d
                     → health checks → rollback si échec
```

**Infrastructure** : `terraform-validate.yml` valide sur chaque PR (fmt, validate, tfsec, ansible-lint).

→ Voir [runbooks/deployment.md](../runbooks/deployment.md) pour le workflow complet.

---

## 6. Observabilité

| Couche | Outil | Rôle |
|--------|-------|------|
| Métriques | Prometheus + Node Exporter | CPU/RAM/Disk/réseau par container |
| Logs | Loki + Promtail | Agrégation logs Docker + systemd (7j retention) |
| Dashboards | Grafana | Infrastructure, service health, app metrics, logs |
| Alerting | Prometheus Alertmanager | Alertes sur seuils critiques |
| Uptime | Uptime Kuma | Monitoring HTTP externe |
| Infra | Zabbix | Surveillance infrastructure avancée |

Les dashboards Grafana sont **versionnés en JSON** dans `ansible/roles/grafana/files/`.

---

## 7. Sécurité

- **Périmètre** : Traefik — TLS 1.3 minimum, HSTS, X-Frame-Options, rate limiting 1000 req/min
- **Containers** : UFW (whitelist), Fail2ban (SSH), unattended-upgrades
- **Secrets** : Ansible Vault (infra) + GitHub Secrets (CI/CD), jamais en clair dans Git
- **Scan** : Trivy (images Docker), tfsec (Terraform), pre-commit hooks (detect-secrets)
- **SSL** : Let's Encrypt DNS-01 automatique via OVH API, renouvellement auto Traefik

→ Voir [security.md](security.md) pour le détail complet.

---

## 8. Références

| Document | Description |
|----------|-------------|
| [network.md](network.md) | Topologie réseau, IPs, ports, firewall |
| [tech-stack.md](tech-stack.md) | Technologies et versions |
| [architecture-diagrams.md](architecture-diagrams.md) | Diagrammes Mermaid complets |
| [security.md](security.md) | Architecture sécurité |
| [decisions/](decisions/) | Architecture Decision Records (ADR-001 à ADR-008) |
| [../runbooks/deployment.md](../runbooks/deployment.md) | Procédure de déploiement |
| [../runbooks/disaster-recovery.md](../runbooks/disaster-recovery.md) | Plan de reprise d'activité |
| [brownfield-architecture-overview.md](brownfield-architecture-overview.md) | Document d'architecture complet (design phase) |
