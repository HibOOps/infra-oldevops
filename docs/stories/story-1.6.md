# Story 1.6 : Application de Démonstration - Développement Frontend/Backend

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
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

- [ ] Tous les CA validés ✅
- [ ] Application accessible via `docker-compose up`
- [ ] Tests passent avec >60% coverage
- [ ] Documentation complète
- [ ] Code review effectué

---

**Créé le** : 2026-01-07
