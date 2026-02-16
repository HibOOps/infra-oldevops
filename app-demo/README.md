# App Demo - Task Manager

[![Build](https://github.com/olabe/Infra-oldevops/actions/workflows/app-build.yml/badge.svg)](https://github.com/olabe/Infra-oldevops/actions/workflows/app-build.yml)
[![Docker](https://github.com/olabe/Infra-oldevops/actions/workflows/app-docker.yml/badge.svg)](https://github.com/olabe/Infra-oldevops/actions/workflows/app-docker.yml)
[![Deploy](https://github.com/olabe/Infra-oldevops/actions/workflows/app-deploy.yml/badge.svg)](https://github.com/olabe/Infra-oldevops/actions/workflows/app-deploy.yml)
[![Security](https://github.com/olabe/Infra-oldevops/actions/workflows/security-scan.yml/badge.svg)](https://github.com/olabe/Infra-oldevops/actions/workflows/security-scan.yml)

Application de demonstration deployee sur l'infrastructure oldevops.

## Architecture

```
                    Internet
                       |
                   Traefik (proxy)
                   /          \
          app.oldevops.fr   api.oldevops.fr
                |                    |
           Frontend (React)    Backend (Express)
           nginx:80            node:8080
                                     |
                               PostgreSQL:5432
```

## Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Frontend | React + Vite | 18.x |
| Backend | Express.js | 4.x |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Auth | JWT (jsonwebtoken) | - |
| Reverse Proxy | Traefik | 3.x |
| Container | Docker Compose | 3.8 |

## Developpement Local

```bash
# Copier les variables d'environnement
cp .env.example .env

# Demarrer tous les services
docker compose up -d

# Voir les logs
docker compose logs -f

# Arreter
docker compose down
```

L'application est accessible sur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8080/api
- Health check : http://localhost:8080/api/health

## Commandes

```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test

# Linting
cd backend && npm run lint
cd frontend && npm run lint

# Prisma migrations
cd backend && npx prisma migrate dev

# Seed database
cd backend && npx prisma db seed
```

## Endpoints API

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | /api/auth/register | Inscription | Non |
| POST | /api/auth/login | Connexion | Non |
| GET | /api/tasks | Liste des taches | Oui |
| POST | /api/tasks | Creer une tache | Oui |
| GET | /api/tasks/:id | Detail d'une tache | Oui |
| PUT | /api/tasks/:id | Modifier une tache | Oui |
| DELETE | /api/tasks/:id | Supprimer une tache | Oui |
| GET | /api/health | Health check | Non |

## Compte Demo

- Email : `demo@oldevops.fr`
- Mot de passe : `password123`
