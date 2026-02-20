# Guide : Prise en Main du Projet

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20
**Public** : Nouveaux contributeurs, recruteurs techniques

---

## Table des Matières

1. [Prérequis](#1-prérequis)
2. [Cloner le Projet](#2-cloner-le-projet)
3. [Structure du Projet](#3-structure-du-projet)
4. [Environnements Disponibles](#4-environnements-disponibles)
5. [Premiers Tests](#5-premiers-tests)
6. [Accès aux Services de Production](#6-accès-aux-services-de-production)
7. [Prochaines Étapes](#7-prochaines-étapes)

---

## 1. Prérequis

**Pour explorer le code uniquement** (aucun prérequis infra) :
- Git

**Pour déployer localement l'application** :
- Docker Desktop / Docker Engine
- Docker Compose v2

**Pour modifier l'infrastructure** :
- Terraform ≥ 1.7
- Ansible ≥ 2.10
- Accès SSH au Proxmox (réseau local 192.168.1.0/24)
- Mot de passe Ansible Vault (demander à l'équipe)

---

## 2. Cloner le Projet

```bash
git clone https://github.com/HibOOps/infra-oldevops.git
cd infra-oldevops
```

Structure principale :
```
infra-oldevops/
├── terraform/          # Provisioning containers LXC
├── ansible/            # Configuration des services
├── app-demo/           # Application PriceSync (React + Node.js)
├── docs/               # Documentation (vous êtes ici)
├── scripts/            # Utilitaires (health-check, rollback, backup)
└── .github/workflows/  # Pipelines CI/CD
```

---

## 3. Structure du Projet

### Infrastructure (Terraform + Ansible)

```
terraform/
├── main.tf             # Containers LXC Proxmox
├── modules/
│   └── lxc_container/  # Module réutilisable par container
└── providers.tf        # Provider Proxmox + OVH S3 backend

ansible/
├── inventory.ini       # 5 containers (proxy/utilities/monitoring/ci-runner/app-demo)
├── playbooks/          # Un playbook par service
└── roles/              # Rôles réutilisables (common, traefik, app-demo, loki, ...)
```

### Application (PriceSync)

```
app-demo/
├── backend/
│   ├── src/            # Express routes + middlewares
│   ├── prisma/         # Schéma PostgreSQL + seed data
│   └── __tests__/      # Tests Jest
├── frontend/
│   ├── src/            # Composants React (5 pages)
│   └── src/__tests__/  # Tests Vitest
└── docker-compose.yml  # Stack 3 services (db, backend, frontend)
```

---

## 4. Environnements Disponibles

| Environnement | URL | Notes |
|---------------|-----|-------|
| Production | https://demo.oldevops.fr | Déployé automatiquement depuis `main` |
| Local | http://localhost | `docker compose up` dans `app-demo/` |

---

## 5. Premiers Tests

### Lancer l'application localement

```bash
cd app-demo

# Copier le fichier d'environnement
cp .env.example .env
# Modifier CORS_ORIGIN si besoin (mettre * pour le dev local)

# Démarrer la stack
docker compose up -d

# Vérifier que tout est healthy
docker compose ps

# Accéder à l'app
open http://localhost
# Login : admin@pricesync.demo / Admin2024!
```

### Lancer les tests backend

```bash
cd app-demo/backend
npm install
npm test
```

### Lancer les tests frontend

```bash
cd app-demo/frontend
npm install
npm test
```

---

## 6. Accès aux Services de Production

| Service | URL | Credentials |
|---------|-----|-------------|
| PriceSync App | https://demo.oldevops.fr | admin@pricesync.demo / Admin2024! |
| Grafana | https://grafana.oldevops.fr | admin / (voir Vaultwarden) |
| Prometheus | https://prometheus.oldevops.fr | — |
| Traefik Dashboard | http://192.168.1.200:8080 | LAN uniquement |

> 🔒 Les services internes (Traefik dashboard, Prometheus) ne sont accessibles que depuis le réseau local 192.168.1.0/24.

---

## 7. Prochaines Étapes

Selon votre objectif :

- **Déployer sur l'infra** : lire [local-development.md](local-development.md) + [../runbooks/deployment.md](../runbooks/deployment.md)
- **Modifier du code** : lire [contributing.md](contributing.md)
- **Comprendre l'architecture** : lire [../architecture/overview.md](../architecture/overview.md)
- **Dépanner un problème** : lire [../runbooks/troubleshooting.md](../runbooks/troubleshooting.md)
