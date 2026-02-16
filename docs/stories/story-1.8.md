# Story 1.8 : Application de Démonstration - Pipeline CI/CD

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 🔄 In Progress
**Priorité** : P1 (Haute)
**Points d'effort** : 8
**Dépendances** : Story 1.7 (App intégrée Traefik), Story 1.3 (Pipeline infra)

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** un pipeline complet build/test/deploy pour l'application,
**Afin de** démontrer un workflow de déploiement moderne et automatisé.

## Critères d'Acceptation

### CA8.1 : Workflow Build et Test
- Workflow `.github/workflows/app-build.yml` créé
- Déclenche sur push/PR modifiant `app-demo/**`
- Steps :
  1. Lint frontend (ESLint) et backend (pylint/ruff)
  2. Tests unitaires frontend et backend
  3. Build de production
  4. Vérification des builds
- Matrix strategy si plusieurs versions Node/Python

### CA8.2 : Workflow Docker Build
- Workflow `.github/workflows/app-docker.yml` créé
- Déclenche sur merge vers `main`
- Steps :
  1. Build images Docker (frontend + backend)
  2. Tag avec Git SHA et version (si tag Git)
  3. Push vers GitHub Container Registry (ghcr.io)
  4. Scan de sécurité Trivy
- Images accessibles : `ghcr.io/USER/app-demo-frontend:latest`

### CA8.3 : Workflow Déploiement Application
- Workflow `.github/workflows/app-deploy.yml` créé
- Requiert approbation manuelle (environment `production`)
- Steps :
  1. Pull nouvelles images depuis ghcr.io
  2. SSH vers container 192.168.1.210
  3. `docker-compose pull && docker-compose up -d`
  4. Health checks (curl sur app.oldevops.fr)
  5. Rollback si health checks échouent
- Notification de déploiement (commentaire GitHub)

### CA8.4 : Secrets GitHub
- Secrets configurés :
  - `GHCR_TOKEN` : Token GitHub Container Registry
  - `SSH_PRIVATE_KEY` : Clé pour SSH vers container
  - `APP_ENV_VARS` : Variables d'environnement de l'app
- Secrets utilisés dans les workflows

### CA8.5 : Badges de Status
- Badges ajoutés au README de l'app :
  - Build Status
  - Tests Coverage (si intégration Codecov)
  - Security Scan Status
- Badges cliquables vers workflows

## Vérifications d'Intégration

### VI1 : Isolation des Pipelines
- Pipeline app séparé du pipeline infrastructure
- Pas d'interférence entre workflows

### VI2 : Déploiement Sans Impact
- Le déploiement de l'app n'affecte pas les autres services
- Zero-downtime deployment (nouvelle version démarre avant arrêt ancienne)

### VI3 : Rollback Fonctionnel
- Rollback ramène à la version précédente en <2 min
- Test de rollback effectué avec succès

## Définition of Done

- [ ] Tous les CA validés
- [ ] Pipeline complet testé end-to-end
- [ ] Au moins 1 déploiement automatisé réussi
- [ ] Rollback testé et fonctionnel
- [x] Documentation pipeline créée

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### File List
| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/app-build.yml` | Created | Build & test workflow: lint + test backend/frontend, docker compose build |
| `.github/workflows/app-docker.yml` | Created | Docker build & push to ghcr.io with SHA tags, Trivy security scan |
| `.github/workflows/app-deploy.yml` | Created | Deploy via SSH to 192.168.1.250, health checks, rollback, notifications |
| `app-demo/README.md` | Modified | Added CI/CD badges (Build, Docker, Deploy, Security), fixed domain names |

### Change Log
- 2026-02-14: Created 3 CI/CD workflow files (app-build, app-docker, app-deploy)
- 2026-02-14: Added status badges to app-demo README
- 2026-02-14: Fixed architecture diagram domains (app/api.oldevops.fr)
- 2026-02-14: All YAML validated

### Debug Log References
_No debug issues encountered_

### Completion Notes
- Workflows use GITHUB_TOKEN for ghcr.io (no extra GHCR_TOKEN needed)
- SSH_PRIVATE_KEY secret must be configured in GitHub Settings
- End-to-end pipeline test and rollback test require live environment
- Badge URLs assume repo owner is "olabe" - adjust if different

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-02-14
