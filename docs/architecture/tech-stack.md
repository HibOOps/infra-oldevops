# Stack Technique — Infra-OlDevOps

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20

---

## Table des Matières

1. [Infrastructure](#1-infrastructure)
2. [Automatisation](#2-automatisation)
3. [CI/CD](#3-cicd)
4. [Application PriceSync](#4-application-pricesync)
5. [Observabilité](#5-observabilité)
6. [Sécurité](#6-sécurité)
7. [Services Opérationnels](#7-services-opérationnels)

---

## 1. Infrastructure

| Technologie | Version | Rôle |
|-------------|---------|------|
| Proxmox VE | 8.x | Hyperviseur — gestion des containers LXC |
| LXC | (kernel) | Containers légers — isolation sans overhead VM |
| Debian | 12 (Bookworm) | OS base de tous les containers |
| Docker CE | 25.x | Runtime containers applicatifs |
| Docker Compose | v2 plugin | Orchestration multi-containers |

**Choix LXC vs VM** : voir [decisions/ADR-001-lxc-containers.md](decisions/ADR-001-lxc-containers.md)

---

## 2. Automatisation

| Technologie | Version | Rôle |
|-------------|---------|------|
| Terraform | 1.7+ | Provisioning infrastructure (containers LXC) |
| Terraform Proxmox Provider | 2.9.14 | Provider Proxmox pour Terraform |
| Ansible | 2.10+ | Configuration et déploiement des services |
| Ansible Vault | (inclus) | Chiffrement des secrets AES-256 |
| OVH S3 | — | Backend Terraform state (bucket `infra-oldevops-tfstate`) |

**Structure Ansible** :

```
ansible/
├── inventory.ini           # Inventaire statique (5 containers)
├── playbooks/              # Playbooks par service
├── roles/                  # Rôles réutilisables
│   ├── common/             # Docker CE + dépendances système
│   ├── traefik/            # Reverse proxy + SSL
│   ├── app-demo/           # PriceSync stack
│   ├── loki/               # Agrégation logs
│   ├── promtail/           # Agents collecte logs
│   ├── grafana/            # Dashboards + provisioning
│   ├── prometheus/         # Métriques
│   ├── github-runner/      # CI runner auto-hébergé
│   └── ...
└── vars/proxmox-1.yml      # Variables infrastructure
```

---

## 3. CI/CD

| Technologie | Version | Rôle |
|-------------|---------|------|
| GitHub Actions | — | Orchestration CI/CD |
| Self-Hosted Runner | 2.321.0 | Runner sur LXC ci-runner (.210) |
| GitHub Container Registry | — | Stockage images Docker (`ghcr.io`) |
| Trivy | latest | Scan de vulnérabilités images Docker |
| tfsec | 1.28.5 | Analyse sécurité Terraform |
| ansible-lint | 6.22.2 | Lint playbooks Ansible |

**Workflows actifs** :

| Fichier | Déclencheur | Action |
|---------|-------------|--------|
| `terraform-validate.yml` | PR | fmt, validate, tfsec |
| `app-build.yml` | PR (app-demo/**) | lint + tests backend/frontend |
| `app-docker.yml` | push main (app-demo/**) | build → ghcr.io → Trivy scan |
| `app-deploy.yml` | après app-docker | SSH deploy → health checks |

---

## 4. Application PriceSync

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 20 (Alpine) | Runtime JavaScript |
| Express | 4.21.x | Framework API REST |
| Prisma | 5.22.x | ORM PostgreSQL |
| PostgreSQL | 16 (Alpine) | Base de données relationnelle |
| JSON Web Token (jsonwebtoken) | 9.0.x | Authentification JWT |
| Zod | 3.23.x | Validation schémas API |
| swagger-ui-express | 5.0.x | Documentation API interactive |
| bcryptjs | 2.4.x | Hashage mots de passe |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.x | Framework UI |
| Vite | 5.x | Build tool + dev server |
| React Router | 6.x | Routing SPA |
| nginx | 1.x (Alpine) | Serving static + proxy `/api` |

### Tests

| Technologie | Rôle |
|-------------|------|
| Jest | Tests backend (intégration) |
| Supertest | Tests HTTP backend |
| Vitest | Tests frontend (unitaires) |
| React Testing Library | Tests composants React |

**URL** : https://demo.oldevops.fr
**Credentials démo** : admin@pricesync.demo / Admin2024!

---

## 5. Observabilité

| Technologie | Version | Rôle |
|-------------|---------|------|
| Prometheus | 2.x | Collecte et stockage métriques (15j rétention) |
| Node Exporter | 1.x | Métriques système (CPU/RAM/Disk) par container |
| Grafana | 10.x | Dashboards — métriques + logs |
| Loki | 2.x | Agrégation logs centralisée (7j rétention) |
| Promtail | 2.x | Agent collecte logs (1 par container) |
| Zabbix | 6.x | Monitoring infrastructure avancé |
| Uptime Kuma | 1.x | Monitoring uptime services HTTP |

**Dashboards Grafana versionnés** (JSON dans `ansible/roles/grafana/files/`) :
- Infrastructure Overview — CPU/RAM/Disk
- Service Health — uptime/latency
- Application Metrics — API PriceSync
- Log Explorer — Loki multi-container

---

## 6. Sécurité

| Technologie | Rôle |
|-------------|------|
| Let's Encrypt (ACME) | Certificats SSL automatiques |
| OVH DNS API | Challenge DNS-01 pour wildcard |
| UFW | Firewall whitelist sur chaque container |
| Fail2ban | Protection brute-force SSH |
| pre-commit | Hooks anti-secrets (detect-secrets) |
| Ansible Vault (AES-256) | Chiffrement secrets infrastructure |
| GitHub Secrets | Secrets CI/CD |

---

## 7. Services Opérationnels

| Service | Version | URL |
|---------|---------|-----|
| Traefik | v3 | https://proxy.oldevops.fr |
| Vaultwarden | latest | https://vault.oldevops.fr |
| Snipe-IT | latest | https://inventory.oldevops.fr |
| NetBox | 3.x | https://netbox.oldevops.fr |
| Uptime Kuma | 1.x | https://status.oldevops.fr |
| Zabbix | 6.x | https://monitoring.oldevops.fr |
| Prometheus | 2.x | https://prometheus.oldevops.fr |
| Grafana | 10.x | https://grafana.oldevops.fr |
