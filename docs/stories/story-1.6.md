# Story 1.6 : PriceSync — Application de Démonstration Frontend/Backend

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 🟡 Ready for Review
**Priorité** : P1 (Haute)
**Points d'effort** : 13
**Dépendances** : Story 1.5 (Container provisionné)

---

## Contexte Produit

**PriceSync** est une application de synchronisation de prix multi-canaux conçue pour le secteur retail. Elle centralise les prix produits et les synchronise entre plusieurs canaux de distribution (magasin physique, e-commerce, marketplace). Elle offre une interface de gestion des règles de pricing et un historique complet des modifications avec traçabilité utilisateur.

Ce use case est volontairement **parlant et professionnel** : la gestion des prix multi-canaux est un pain point réel en retail, ce qui rend la démo convaincante pour tout recruteur ou prospect du secteur.

**Canaux fictifs simulés (seed data)** :
- 🏪 **Magasin Paris** — Prix magasin physique (zone Paris)
- 🌐 **E-commerce** — Boutique en ligne (oldevops-shop.fr)
- 📦 **Marketplace Pro** — Plateforme type Amazon/FNAC

---

## User Story

**En tant que** Développeur Fullstack,
**Je veux** une application web moderne (React + API) démontrant une architecture professionnelle sur un use case retail réel,
**Afin de** prouver ma capacité à concevoir et déployer des applications métier complexes sur mon infrastructure.

---

## Critères d'Acceptation

### CA6.1 : Structure du Repository

- Dossier `app-demo/` à la racine du repo avec l'arborescence suivante :
  ```
  app-demo/
  ├── frontend/          # React 18 + Vite
  ├── backend/           # Node.js / Express
  ├── docker-compose.yml # Orchestration 4 services
  ├── .env.example       # Template variables d'env
  └── README.md          # Documentation architecture
  ```
- README dans `app-demo/` documentant l'architecture PriceSync

---

### CA6.2 : Fonctionnalités PriceSync

L'application doit couvrir les 5 vues suivantes (navigation fluide, UI moderne et responsive) :

#### Vue 1 — Dashboard (page d'accueil post-login)
- KPIs synthétiques : nombre de produits, canaux actifs, règles actives, dernière synchronisation
- Tableau des **prix en désynchronisation** : liste des produits dont le prix diffère selon les canaux (delta visible)
- Bouton **"Synchroniser tout"** : déclenche une sync globale (appel API POST /sync)
- Indicateur de statut par canal (vert = synchronisé, orange = delta, rouge = erreur)

#### Vue 2 — Catalogue Produits
- Liste paginée des produits avec : nom, SKU, catégorie, prix de référence, statut sync
- Création / édition / suppression de produit
- Filtres par catégorie (`Bois`, `Accastillage`, `Mécaniques`, `Cordes`, `Outils`, `Électronique`, `Finition`) et statut de synchronisation

#### Vue 3 — Gestion des Prix par Canal
- Tableau croisé **Produit × Canal** affichant le prix actuel pour chaque combinaison
- Édition inline du prix (double-clic ou icône crayon)
- Badge de delta : affiche `+X%` ou `-X%` vs le prix de référence
- Historique rapide (les 3 dernières modifs) accessible en survol ou panel latéral

#### Vue 4 — Règles de Pricing
- Liste des règles actives : promo, soldes, prix par canal
- Création d'une règle avec : nom, type (pourcentage / montant fixe), canal(aux) ciblé(s), produit(s) ciblé(s), date début / fin
- Activation / désactivation d'une règle
- Simulation du prix résultant après application de la règle (preview)
- Exemples de règles démo : "Promo Cordes Web -15%", "Soldes Bois Marketplace -12%"

#### Vue 5 — Historique des Modifications
- Log chronologique : qui a modifié quoi, sur quel produit, quel canal, ancienne valeur → nouvelle valeur, date/heure
- Filtres : par utilisateur, par produit, par canal, par plage de dates
- Export CSV du log (optionnel mais apprécié)

---

### CA6.3 : API Backend RESTful

Endpoints minimaux exposés :

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Authentification JWT |
| POST | `/api/auth/register` | Inscription |
| GET | `/api/products` | Liste produits (paginée) |
| POST | `/api/products` | Créer produit |
| PUT | `/api/products/:id` | Modifier produit |
| DELETE | `/api/products/:id` | Supprimer produit |
| GET | `/api/channels` | Liste canaux |
| GET | `/api/prices` | Prix par produit/canal (query params: `?productId=&channelId=`) |
| PUT | `/api/prices/:productId/:channelId` | Mettre à jour un prix |
| POST | `/api/sync` | Déclencher synchronisation globale |
| GET | `/api/rules` | Liste règles de pricing |
| POST | `/api/rules` | Créer une règle |
| PUT | `/api/rules/:id` | Modifier une règle |
| DELETE | `/api/rules/:id` | Supprimer une règle |
| GET | `/api/history` | Log des modifications (filtrable) |

- Authentification JWT sur toutes les routes sauf `/api/auth/*`
- Validation des données (Joi ou Zod)
- Gestion d'erreurs standardisée (codes HTTP appropriés)
- Documentation Swagger/OpenAPI sur `/api/docs`

---

### CA6.4 : Base de Données PostgreSQL

**Schéma des entités** (Prisma recommandé) :

```
User
  id, email, password_hash, name, role (admin|manager|viewer), created_at

Channel
  id, name, type (physical|ecommerce|marketplace), description, is_active, created_at

Product
  id, sku, name, category, description, reference_price, created_at, updated_at

Price
  id, product_id (FK), channel_id (FK), price, currency (EUR), updated_at, updated_by (FK User)
  UNIQUE(product_id, channel_id)

PricingRule
  id, name, type (percentage|fixed), value, channels (JSON array of channel IDs),
  products (JSON array of product IDs, null = all), starts_at, ends_at, is_active,
  created_by (FK User), created_at

PriceHistory
  id, product_id (FK), channel_id (FK), old_price, new_price, changed_by (FK User),
  changed_at, source (manual|rule|sync)
```

**Seed data obligatoire** :

**Utilisateurs** :
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@pricesync.demo` | `Admin2024!` | admin |
| `manager@pricesync.demo` | `Manager2024!` | manager |
| `viewer@pricesync.demo` | `Viewer2024!` | viewer |

**Canaux** :
| ID | Nom | Type | Description |
|----|-----|------|-------------|
| 1 | Atelier Galileo Paris | physical | Magasin physique — Paris 11e |
| 2 | galileo-shop.fr | ecommerce | Boutique en ligne officielle |
| 3 | Marketplace Woodcraft | marketplace | Plateforme spécialisée lutherie & facture instrumentale |

**Catalogue produits (20 références)** :

| SKU | Nom | Catégorie | Prix de référence |
|-----|-----|-----------|-------------------|
| LUT-B001 | Blanc Corps Épicéa Solid Top AAA | Bois | 45,00 € |
| LUT-B002 | Blanc Manche Érable Flamé AA | Bois | 62,00 € |
| LUT-B003 | Touche Ébène Guitare 650mm | Bois | 38,00 € |
| LUT-B004 | Blank Corps Acajou Standard | Bois | 52,00 € |
| LUT-A001 | Chevalet Tune-O-Matic Chrome | Accastillage | 28,00 € |
| LUT-A002 | Cordier Trapèze Split Chrome | Accastillage | 32,00 € |
| LUT-A003 | Tremolo Style Strat® Chromé 6 vis | Accastillage | 31,10 € |
| LUT-A004 | Cordier Gibson Style Nickel | Accastillage | 18,50 € |
| LUT-A005 | Sillet Os Guitare Électrique 42mm | Accastillage | 8,50 € |
| LUT-A006 | Sillet Carbone Guitare Classique 52mm | Accastillage | 12,00 € |
| LUT-M001 | Mécaniques Gotoh SD91 Set 3+3 Nickel | Mécaniques | 72,00 € |
| LUT-M002 | Mécaniques Style Kluson 6-en-ligne Chrome | Mécaniques | 35,00 € |
| LUT-M003 | Mécaniques Basse Gotoh GB7 Set 4 Chrome | Mécaniques | 88,00 € |
| LUT-C001 | Jeu Cordes Électrique Pure Nickel 009-042 | Cordes | 7,90 € |
| LUT-C002 | Jeu Cordes Acoustique Phosphore Bronze 012-053 | Cordes | 9,50 € |
| LUT-C003 | Jeu Cordes Basse 4 Cordes 045-105 Nickel | Cordes | 14,90 € |
| LUT-O001 | Lime Frettes Demi-Ronde Grain Fin 150mm | Outils | 24,00 € |
| LUT-O002 | Rabot à Manche Réglable Lutherie | Outils | 45,00 € |
| LUT-E001 | Potentiomètre 500K Audio CTS USA | Électronique | 6,50 € |
| LUT-F001 | Colle PVA Lutherie Haute Résistance 500ml | Finition | 12,00 € |

**Prix par canal** (deltas intentionnels pour la démo) :

> Légende : 🔴 = écart >10% vs référence | 🟡 = écart 3-10% | 🟢 = aligné

| SKU | Atelier Paris | galileo-shop.fr | Marketplace Woodcraft | Statut sync |
|-----|:---:|:---:|:---:|:---:|
| LUT-B001 | 48,00 € | 45,00 € | 42,50 € | 🔴 désync |
| LUT-B002 | 65,00 € | 62,00 € | 62,00 € | 🟡 delta |
| LUT-B003 | 40,00 € | 38,00 € | 38,00 € | 🟡 delta |
| LUT-B004 | 55,00 € | 52,00 € | 49,00 € | 🔴 désync |
| LUT-A001 | 29,90 € | 28,00 € | 25,50 € | 🔴 désync |
| LUT-A002 | 32,00 € | 32,00 € | 32,00 € | 🟢 sync |
| LUT-A003 | 33,00 € | 31,10 € | 29,90 € | 🟡 delta |
| LUT-A004 | 20,00 € | 18,50 € | 18,50 € | 🟡 delta |
| LUT-A005 | 9,00 € | 8,50 € | 8,50 € | 🟡 delta |
| LUT-A006 | 12,00 € | 12,00 € | 12,00 € | 🟢 sync |
| LUT-M001 | 78,00 € | 72,00 € | 68,00 € | 🔴 désync |
| LUT-M002 | 38,00 € | 35,00 € | 33,00 € | 🔴 désync |
| LUT-M003 | 92,00 € | 88,00 € | 88,00 € | 🟡 delta |
| LUT-C001 | 8,50 € | 7,90 € | 7,50 € | 🔴 désync |
| LUT-C002 | 10,50 € | 9,50 € | 9,50 € | 🟡 delta |
| LUT-C003 | 15,90 € | 14,90 € | 14,90 € | 🟡 delta |
| LUT-O001 | 26,00 € | 24,00 € | 24,00 € | 🟡 delta |
| LUT-O002 | 48,00 € | 45,00 € | 45,00 € | 🟡 delta |
| LUT-E001 | 7,50 € | 6,50 € | 6,50 € | 🟡 delta |
| LUT-F001 | 13,00 € | 12,00 € | 11,00 € | 🔴 désync |

> Le Dashboard doit afficher **7 produits en état "désync"** (écart >10%) et **11 produits en "delta"** (écart 3-10%) au chargement initial.

**Règles de pricing actives (seed)** :

| Nom | Type | Valeur | Canal(aux) ciblé(s) | Produit(s) ciblé(s) | Période |
|-----|------|--------|--------------------|--------------------|---------|
| Promo Cordes Web -15% | percentage | -15% | galileo-shop.fr | LUT-C001, LUT-C002, LUT-C003 | Toujours active |
| Soldes Bois Marketplace -12% | percentage | -12% | Marketplace Woodcraft | LUT-B001, LUT-B002, LUT-B003, LUT-B004 | Toujours active |

**PriceHistory** : générer 25+ entrées couvrant les 30 derniers jours, avec les 2 utilisateurs et les 3 sources possibles (manual, rule, sync).

---

### CA6.5 : Tests

- **Backend** : Tests d'intégration sur endpoints critiques :
  - `POST /api/auth/login` (happy path + credentials invalides)
  - `GET /api/products` (liste + pagination)
  - `PUT /api/prices/:productId/:channelId` (mise à jour + vérification PriceHistory créé)
  - `POST /api/sync` (vérification réponse 200)
- **Frontend** : Tests unitaires (Vitest + React Testing Library) :
  - Rendu du Dashboard (KPIs affichés)
  - Tableau Prix × Canal (données mockées)
  - Formulaire création règle (validation)
- Coverage minimum : **60%**
- Tests exécutables via `npm test` (backend et frontend)

---

### CA6.6 : Docker Compose Configuration

```yaml
services:
  db:         # PostgreSQL 15
  backend:    # Node.js / Express (port 5000)
  frontend:   # React / Nginx (port 3000)
```

- Build multi-stage pour backend et frontend
- Health checks pour chaque service
- Volumes persistants pour PostgreSQL (`pricesync_pgdata`)
- Réseau Docker isolé (`pricesync_network`)
- Variables d'environnement externalisées dans `.env`
- Labels Traefik pour exposition via `demo.oldevops.fr`
- Démarrage ordonné : `db → backend → frontend`

---

### CA6.7 : Documentation

README dans `app-demo/` contenant :
- Description du use case PriceSync
- Diagramme d'architecture (ASCII ou Mermaid)
- Schéma des entités (simplifié)
- Instructions d'installation locale (`docker-compose up`)
- Credentials de démo (admin@pricesync.demo / password)
- Liste des routes API principales
- Stack technique

---

## Vérifications d'Intégration

### VI1 : Développement Local
- `docker-compose up` démarre les 3 services (db, backend, frontend)
- Le seed data est chargé automatiquement au premier démarrage
- Hot reload fonctionnel en développement

### VI2 : Ports et Accès
- Ports non exposés publiquement (seulement via Traefik)
- Ports internes : 3000 (frontend), 5000 (backend), 5432 (postgres)
- URL de démo : `demo.oldevops.fr`

### VI3 : Health Checks
- Tous les services passent les health checks
- L'API répond `200 OK` sur `GET /api/health`
- Le frontend charge le Dashboard après login

### VI4 : Cohérence des Données
- Le Dashboard affiche bien des produits en désynchronisation (delta entre canaux)
- L'historique enregistre chaque modification de prix (source = manual)
- La sync globale met à jour les prix selon les règles actives et trace dans l'historique (source = sync)

---

## Définition of Done

- [ ] Tous les CA validés
- [ ] Application accessible via `docker-compose up` avec seed data
- [ ] Dashboard affiche des données cohérentes (deltas, KPIs)
- [ ] Tests passent avec >60% coverage
- [ ] Swagger disponible sur `/api/docs`
- [ ] Documentation README complète avec credentials démo
- [ ] Code review effectué

---

## Notes pour le Dev Agent

### Domaine métier : Lutherie & Facture Instrumentale
Le catalogue produit est celui d'un fournisseur de pièces et matériaux pour luthiers (bois, accastillage, mécaniques, cordes, outils, électronique, finition). Les SKUs, noms et prix de référence sont définis dans CA6.4 — le seed data doit être fidèle à ce catalogue.

### Pivot depuis Task Manager
La story précédente avait implémenté un Task Manager générique. **Toute l'implémentation est à remplacer** par PriceSync. Les fichiers dans `app-demo/` sont à supprimer et recréer.

### Priorités d'implémentation suggérées
1. Schéma Prisma + seed data (avec deltas intentionnels)
2. Endpoints API core (auth, products, channels, prices, history)
3. Endpoint POST /sync (logique de synchronisation des règles)
4. Frontend : Dashboard + Vue Prix × Canal (les plus impactantes visuellement)
5. Frontend : Vue Règles + Historique
6. Tests + Swagger
7. Docker Compose + documentation

### Logique de synchronisation (POST /sync)
La sync doit :
1. Récupérer toutes les règles actives dont `starts_at <= now <= ends_at`
2. Pour chaque règle, calculer le nouveau prix pour chaque (produit, canal) ciblé
3. Mettre à jour `Price` si le prix calculé diffère
4. Créer une entrée `PriceHistory` pour chaque prix modifié (source = "sync")
5. Retourner un résumé : `{ updated: N, unchanged: M }`

---

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.6

### File List
| Fichier | Action | Description |
|---------|--------|-------------|
| `app-demo/docker-compose.yml` | Created | Stack 3 services avec health checks + Traefik labels |
| `app-demo/.env.example` | Created | Template variables d'environnement |
| `app-demo/README.md` | Created | Documentation architecture PriceSync + credentials démo |
| `app-demo/backend/package.json` | Created | Express, Prisma, JWT, Zod, swagger-ui-express, Jest |
| `app-demo/backend/jest.config.js` | Created | Configuration Jest |
| `app-demo/backend/Dockerfile` | Created | Build multi-stage + migrate + seed + start |
| `app-demo/backend/prisma/schema.prisma` | Created | 6 modèles + 4 enums (User, Channel, Product, Price, PricingRule, PriceHistory) |
| `app-demo/backend/prisma/seed.js` | Created | 3 users, 3 canaux, 20 produits lutherie, 60 prix, 2 règles, 25 historiques |
| `app-demo/backend/src/server.js` | Created | Express app + Swagger inline + routes montées |
| `app-demo/backend/src/utils/jwt.js` | Created | signToken / verifyToken |
| `app-demo/backend/src/middleware/auth.js` | Created | JWT verify middleware |
| `app-demo/backend/src/middleware/validate.js` | Created | Zod validation middleware |
| `app-demo/backend/src/middleware/errorHandler.js` | Created | Centralized error handler |
| `app-demo/backend/src/routes/auth.js` | Created | POST /login, POST /register |
| `app-demo/backend/src/routes/products.js` | Created | CRUD /api/products paginé |
| `app-demo/backend/src/routes/channels.js` | Created | GET /api/channels |
| `app-demo/backend/src/routes/prices.js` | Created | GET + PUT /api/prices avec PriceHistory auto |
| `app-demo/backend/src/routes/sync.js` | Created | POST /api/sync |
| `app-demo/backend/src/routes/rules.js` | Created | CRUD /api/rules |
| `app-demo/backend/src/routes/history.js` | Created | GET /api/history filtrable |
| `app-demo/backend/src/services/syncService.js` | Created | Logique sync : règles → calcul → update + history |
| `app-demo/backend/__tests__/health.test.js` | Created | GET /api/health |
| `app-demo/backend/__tests__/auth.test.js` | Created | POST /api/auth/* |
| `app-demo/backend/__tests__/products.test.js` | Created | GET /api/products |
| `app-demo/backend/__tests__/sync.test.js` | Created | POST /api/sync |
| `app-demo/backend/__tests__/prices.test.js` | Created | GET + PUT /api/prices |
| `app-demo/backend/__tests__/history.test.js` | Created | GET /api/history + /api/channels |
| `app-demo/frontend/package.json` | Created | React 18, Vite, React Router, Vitest, RTL |
| `app-demo/frontend/vite.config.js` | Created | Vite + proxy /api → :5000 |
| `app-demo/frontend/vitest.config.js` | Created | Vitest + jsdom + globals |
| `app-demo/frontend/index.html` | Created | Entry HTML |
| `app-demo/frontend/Dockerfile` | Created | Build multi-stage → nginx |
| `app-demo/frontend/nginx.conf` | Created | SPA fallback + proxy /api + cache assets |
| `app-demo/frontend/src/main.jsx` | Created | React root |
| `app-demo/frontend/src/App.jsx` | Created | Routes protégées (5 pages) |
| `app-demo/frontend/src/test-setup.js` | Created | @testing-library/jest-dom setup |
| `app-demo/frontend/src/utils/syncStatus.js` | Created | getSyncStatus() + STATUS_COLORS |
| `app-demo/frontend/src/hooks/useAuth.js` | Created | Token localStorage + login/logout |
| `app-demo/frontend/src/hooks/useApi.js` | Created | fetch wrapper avec auth header |
| `app-demo/frontend/src/styles/index.css` | Created | Reset + variables globales |
| `app-demo/frontend/src/components/Navbar.jsx` | Created | Navigation 5 liens + user info + logout |
| `app-demo/frontend/src/components/ProtectedRoute.jsx` | Created | Auth guard |
| `app-demo/frontend/src/components/KpiCard.jsx` | Created | Carte KPI avec icône + couleur |
| `app-demo/frontend/src/components/SyncStatusBadge.jsx` | Created | Badge 🟢🟡🔴 |
| `app-demo/frontend/src/components/PriceMatrix.jsx` | Created | Tableau Produit × Canal avec édition inline |
| `app-demo/frontend/src/components/RuleForm.jsx` | Created | Form règle + preview simulation |
| `app-demo/frontend/src/pages/LoginPage.jsx` | Created | Login + comptes démo affichés |
| `app-demo/frontend/src/pages/DashboardPage.jsx` | Created | KPIs + désync table + bouton sync |
| `app-demo/frontend/src/pages/ProductsPage.jsx` | Created | CRUD produits + filtres catégorie + pagination |
| `app-demo/frontend/src/pages/PricesPage.jsx` | Created | PriceMatrix + dernières modifs |
| `app-demo/frontend/src/pages/RulesPage.jsx` | Created | CRUD règles + toggle actif |
| `app-demo/frontend/src/pages/HistoryPage.jsx` | Created | Log filtrable + export CSV |
| `app-demo/frontend/src/__tests__/syncStatus.test.js` | Created | getSyncStatus() unit tests |
| `app-demo/frontend/src/__tests__/SyncStatusBadge.test.jsx` | Created | Badge render tests |
| `app-demo/frontend/src/__tests__/KpiCard.test.jsx` | Created | KpiCard render test |
| `app-demo/frontend/src/__tests__/RuleForm.test.jsx` | Created | Form validation + preview + cancel |
| `app-demo/frontend/src/__tests__/PriceMatrix.test.jsx` | Created | Tableau + SKU + badge |
| `app-demo/frontend/src/__tests__/LoginPage.test.jsx` | Created | Login form + success/error flows |
| `app-demo/frontend/src/__tests__/DashboardPage.test.jsx` | Created | KPIs + sync button + résultat |
| `app-demo/frontend/src/__tests__/HistoryPage.test.jsx` | Created | Historique + CSV export |
| `app-demo/frontend/src/__tests__/ProductsPage.test.jsx` | Created | Catalogue + filtres |
| `app-demo/frontend/src/__tests__/RulesPage.test.jsx` | Created | Règles + valeurs |
| `app-demo/frontend/src/__tests__/useAuth.test.js` | Created | Hook auth login/logout/persist |
| `app-demo/frontend/src/__tests__/useApi.test.js` | Created | Hook API get/post/del/error |

### Change Log
- 2026-02-20: Pivot use case — remplacement du Task Manager par PriceSync (redéfinition complète par PM)
- 2026-02-20: Implémentation complète PriceSync — backend (Express + Prisma + Swagger), frontend (React 18, 5 pages), tests (66% frontend / 63% backend), Docker multi-stage

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-02-20
