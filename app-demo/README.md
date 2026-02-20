# 🏷️ PriceSync — Synchronisation de prix multi-canaux

Application de démonstration fullstack : centralisation et synchronisation des prix produits entre plusieurs canaux de distribution, sur un catalogue de matériel de lutherie.

---

## Use case

La gestion des prix multi-canaux est un pain point réel en retail : un même produit peut avoir des prix différents selon le canal (magasin physique, boutique en ligne, marketplace), créant des désynchronisations difficiles à suivre manuellement. PriceSync centralise cette gestion.

---

## Architecture

```
┌─────────────┐    HTTP/80     ┌──────────────────────────────────┐
│   Traefik   │ ─────────────▶ │  React 18 + Vite (Nginx)         │
│  (reverse   │                │  demo.oldevops.fr                 │
│   proxy)    │ ──/api──────▶  │  Node.js / Express API :5000      │
└─────────────┘                │  PostgreSQL 16              :5432  │
                               └──────────────────────────────────┘

Services Docker :
  db        → PostgreSQL 16
  backend   → Node.js / Express + Prisma
  frontend  → React / Nginx
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite 5, React Router v6 |
| Backend | Node.js 20 LTS, Express 4 |
| ORM | Prisma 5 |
| Base de données | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod v3 |
| Tests backend | Jest + Supertest |
| Tests frontend | Vitest + React Testing Library |
| API Docs | Swagger UI |
| Conteneurisation | Docker + Docker Compose |
| Reverse proxy | Traefik |

---

## Schéma des entités

```
User ──────────────────────── crée ──▶ PricingRule
  │                                       │
  │ modifie                               │ applique
  ▼                                       ▼
Price (productId × channelId) ──▶ PriceHistory
  ▲                 ▲
  │                 │
Product          Channel
```

---

## Démarrage rapide

```bash
# Cloner et démarrer
cd app-demo
docker-compose up --build

# L'application sera disponible sur http://localhost:3000
# (ou demo.oldevops.fr via Traefik en production)
```

Le seed data est chargé **automatiquement** au premier démarrage.

---

## Comptes de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@pricesync.demo` | `Admin2024!` | Admin |
| `manager@pricesync.demo` | `Manager2024!` | Manager |
| `viewer@pricesync.demo` | `Viewer2024!` | Viewer |

---

## Données de démonstration

- **20 produits** lutherie (bois, accastillage, mécaniques, cordes, outils, électronique, finition)
- **3 canaux** : Atelier Galileo Paris / galileo-shop.fr / Marketplace Woodcraft
- **7 produits en désync** (écart >10% entre canaux) — visibles immédiatement sur le dashboard
- **2 règles de pricing actives** : Promo Cordes Web -15% / Soldes Bois Marketplace -12%
- **25 entrées d'historique** réparties sur les 30 derniers jours

---

## API — Routes principales

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Authentification |
| GET | `/api/products` | Liste produits (paginée) |
| GET | `/api/channels` | Liste canaux |
| GET | `/api/prices` | Prix par produit/canal |
| PUT | `/api/prices/:productId/:channelId` | Mettre à jour un prix |
| POST | `/api/sync` | Synchronisation globale |
| GET | `/api/rules` | Règles de pricing |
| GET | `/api/history` | Historique des modifications |

Documentation interactive Swagger : `http://localhost:5000/api/docs`

---

## Développement local

```bash
# Backend
cd backend
npm install
cp .env.example .env        # adapter DATABASE_URL
npx prisma migrate dev
node prisma/seed.js
npm run dev

# Frontend
cd frontend
npm install
npm run dev                 # proxied vers localhost:5000

# Tests
cd backend && npm test
cd frontend && npm test
```

---

## Fonctionnalités

| Vue | Description |
|-----|-------------|
| **Dashboard** | KPIs (produits, canaux, règles, désync), tableau des produits en désync, bouton sync globale |
| **Catalogue Produits** | CRUD produits, filtres par catégorie, statut sync |
| **Prix par Canal** | Tableau Produit × Canal, édition inline, badge delta |
| **Règles de Pricing** | CRUD règles (promo, soldes), activation/désactivation, preview |
| **Historique** | Log filtrable (qui/quoi/quand), export CSV |
