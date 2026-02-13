# Story 1.6 : Application de Démonstration - Développement Frontend/Backend

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 🔄 In Progress
**Priorité** : P1 (Haute)
**Points d'effort** : 13
**Dépendances** : Story 1.5 (Container provisionné)

---

## User Story

**En tant que** Développeur Fullstack,
**Je veux** une application web moderne (React + API) démontrant une architecture professionnelle,
**Afin de** prouver ma capacité à déployer des applications réelles sur mon infrastructure.

## Critères d'Acceptation

### CA6.1 : Structure du Repository
- Dossier `app-demo/` à la racine du repo
- Sous-dossiers :
  - `frontend/` : Application React
  - `backend/` : API Node.js ou Python
  - `docker-compose.yml` : Orchestration
- README dans `app-demo/` documentant l'architecture

### CA6.2 : Fonctionnalité de l'Application
- Application fonctionnelle démontrant une use case (Todo, Blog, Portfolio)
- Interface utilisateur moderne et responsive
- Au moins 3 pages/vues différentes
- Navigation fluide entre les vues

### CA6.3 : API Backend
- Endpoints RESTful exposés : GET, POST, PUT, DELETE
- Authentification JWT implémentée
- Validation des données (joi, yup, ou pydantic)
- Gestion d'erreurs standardisée (codes HTTP appropriés)
- Documentation API (Swagger/OpenAPI optionnel mais recommandé)

### CA6.4 : Base de Données PostgreSQL
- Schema défini et versionné (migrations)
- ORM utilisé : Prisma, TypeORM, ou SQLAlchemy
- Seed data pour démonstration
- Relations entre entités définies

### CA6.5 : Tests Implémentés
- Frontend : Jest + React Testing Library (tests unitaires)
- Backend : Tests d'intégration des endpoints
- Coverage minimum : 60%
- Tests exécutables via `npm test` ou `pytest`

### CA6.6 : Docker Compose Configuration
- Build multi-stage pour optimisation
- Health checks pour chaque service
- Volumes persistants pour PostgreSQL
- Réseau isolé Docker
- Variables d'environnement externalisées

### CA6.7 : Documentation
- README dans `app-demo/` avec :
  - Architecture (diagramme)
  - Installation locale
  - Commandes de développement
  - Stack technique détaillée

## Vérifications d'Intégration

### VI1 : Développement Local
- L'app peut être développée localement sans Proxmox
- `docker-compose up` démarre tous les services
- Hot reload fonctionnel en développement

### VI2 : Ports Isolés
- Ports non exposés publiquement (seulement via Traefik)
- Ports : 3000 (frontend), 5000 (backend), 5432 (postgres)

### VI3 : Health Checks
- Tous les services passent les health checks
- Démarrage ordonné (db → backend → frontend)

## Définition of Done

- [ ] Tous les CA validés
- [ ] Application accessible via `docker-compose up`
- [ ] Tests passent avec >60% coverage
- [x] Documentation complète
- [ ] Code review effectué

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### File List
| File | Action | Description |
|------|--------|-------------|
| `app-demo/docker-compose.yml` | Created | 3-service stack with health checks, Traefik labels |
| `app-demo/.env.example` | Created | Environment variable template |
| `app-demo/README.md` | Created | Architecture docs, API endpoints, dev commands |
| `app-demo/backend/package.json` | Created | Express, Prisma, JWT, Joi, Jest dependencies |
| `app-demo/backend/src/server.js` | Created | Express app with CORS, routes, error handling |
| `app-demo/backend/src/routes/auth.js` | Created | Register/login with JWT |
| `app-demo/backend/src/routes/tasks.js` | Created | CRUD /api/tasks with auth |
| `app-demo/backend/src/middleware/auth.js` | Created | JWT verification middleware |
| `app-demo/backend/src/middleware/validate.js` | Created | Joi validation middleware |
| `app-demo/backend/src/middleware/errorHandler.js` | Created | Centralized error handler |
| `app-demo/backend/src/utils/jwt.js` | Created | JWT sign/verify helpers |
| `app-demo/backend/prisma/schema.prisma` | Created | User + Task models with relations |
| `app-demo/backend/prisma/seed.js` | Created | Demo user + 5 sample tasks |
| `app-demo/backend/Dockerfile` | Created | Multi-stage build |
| `app-demo/backend/jest.config.js` | Created | Jest config |
| `app-demo/backend/__tests__/health.test.js` | Created | Health endpoint test |
| `app-demo/backend/__tests__/auth.test.js` | Created | Auth endpoints tests with mocked Prisma |
| `app-demo/frontend/package.json` | Created | React 18, Vite, React Router, Vitest |
| `app-demo/frontend/vite.config.js` | Created | Vite config with React plugin, proxy |
| `app-demo/frontend/vitest.config.js` | Created | Vitest config with jsdom |
| `app-demo/frontend/index.html` | Created | Vite entry HTML |
| `app-demo/frontend/src/main.jsx` | Created | React root with BrowserRouter |
| `app-demo/frontend/src/App.jsx` | Created | Routes: login, register, tasks, task detail |
| `app-demo/frontend/src/pages/LoginPage.jsx` | Created | Login form |
| `app-demo/frontend/src/pages/RegisterPage.jsx` | Created | Register form |
| `app-demo/frontend/src/pages/DashboardPage.jsx` | Created | Task list with filters |
| `app-demo/frontend/src/pages/TaskDetailPage.jsx` | Created | Task view/edit/delete |
| `app-demo/frontend/src/components/Navbar.jsx` | Created | Navigation bar |
| `app-demo/frontend/src/components/TaskCard.jsx` | Created | Task card component |
| `app-demo/frontend/src/components/TaskForm.jsx` | Created | Task create/edit form |
| `app-demo/frontend/src/components/ProtectedRoute.jsx` | Created | Auth guard |
| `app-demo/frontend/src/hooks/useAuth.js` | Created | Auth hook |
| `app-demo/frontend/src/hooks/useApi.js` | Created | API fetch hook |
| `app-demo/frontend/src/styles/index.css` | Created | Modern responsive CSS |
| `app-demo/frontend/Dockerfile` | Created | Multi-stage build with nginx |
| `app-demo/frontend/nginx.conf` | Created | Nginx config with API proxy, SPA fallback |
| `app-demo/frontend/__tests__/App.test.jsx` | Created | Basic render test |

### Change Log
- 2026-02-13: Created full-stack Task Manager app (React + Express + PostgreSQL)
- 2026-02-13: Backend: Express with Prisma ORM, JWT auth, Joi validation, CRUD tasks
- 2026-02-13: Frontend: React 18 + Vite, 4 pages, responsive CSS, auth hooks
- 2026-02-13: Docker: Multi-stage builds, docker-compose with health checks + Traefik

### Debug Log References
_No debug issues encountered_

### Completion Notes
- Tests need `npm install` to run (dependencies not installed in dev environment)
- Docker build/run needed to verify full stack integration
- Demo domain: demo.oldevops.fr

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-02-13
