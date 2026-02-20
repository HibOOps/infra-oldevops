# Dev Handoff — Story 1.6 : PriceSync

**Document type** : Handoff PM → Dev Agent
**Story** : 1.6 — PriceSync, Application de Démonstration Frontend/Backend
**Statut story** : 🔴 To Do (réimplémentation complète)
**Préparé par** : John (PM Agent)
**Date** : 2026-02-20
**Référence** : [story-1.6.md](./story-1.6.md)

---

## 1. Contexte & Objectif

Tu dois **remplacer** l'application Task Manager existante dans `app-demo/` par **PriceSync** : une application de synchronisation de prix multi-canaux pour le secteur lutherie.

**Pourquoi ce use case ?**
La gestion des prix multi-canaux est un pain point réel en retail. Le contexte lutherie (matériaux, bois, accastillage, cordes) rend la démo niche et mémorable pour un recruteur.

**Ce que la démo doit faire sentir en 30 secondes :**
> "Ce dev sait construire une vraie application métier — pas juste un todo list."

---

## 2. Action Préalable : Nettoyage

**Supprimer entièrement le contenu de `app-demo/`** (tous les fichiers de l'implémentation Task Manager) :

```
app-demo/
├── backend/        ← tout supprimer
├── frontend/       ← tout supprimer
├── docker-compose.yml  ← remplacer
├── .env.example        ← remplacer
└── README.md           ← remplacer
```

---

## 3. Stack Technique Confirmée

Identique à l'implémentation précédente — ne pas dévier :

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React + Vite | 18.x / 5.x |
| Router | React Router | v6 |
| Backend | Node.js + Express | 20.x LTS / 4.x |
| ORM | Prisma | 5.x |
| Base de données | PostgreSQL | 16 |
| Auth | JWT (jsonwebtoken) | — |
| Validation | Zod | v3 |
| Tests Backend | Jest + Supertest | — |
| Tests Frontend | Vitest + React Testing Library | — |
| API Docs | swagger-ui-express + zod-to-openapi | — |
| Conteneurisation | Docker + Docker Compose | — |
| Reverse proxy | Traefik (labels) | — |

---

## 4. Architecture Cible

```
app-demo/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── jest.config.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── server.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── products.js
│       │   ├── channels.js
│       │   ├── prices.js
│       │   ├── sync.js
│       │   ├── rules.js
│       │   └── history.js
│       ├── middleware/
│       │   ├── auth.js          # JWT verify
│       │   ├── validate.js      # Zod middleware
│       │   └── errorHandler.js
│       ├── services/
│       │   └── syncService.js   # Logique sync (voir §7)
│       └── utils/
│           └── jwt.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── vitest.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProductsPage.jsx
        │   ├── PricesPage.jsx
        │   ├── RulesPage.jsx
        │   └── HistoryPage.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── SyncStatusBadge.jsx   # Badge 🟢🟡🔴
        │   ├── PriceMatrix.jsx       # Tableau Produit × Canal
        │   ├── RuleForm.jsx
        │   └── KpiCard.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useApi.js
        └── styles/
            └── index.css
```

---

## 5. Schéma Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int            @id @default(autoincrement())
  email        String         @unique
  passwordHash String         @map("password_hash")
  name         String
  role         Role           @default(viewer)
  createdAt    DateTime       @default(now()) @map("created_at")
  prices       Price[]        @relation("UpdatedBy")
  rules        PricingRule[]  @relation("CreatedBy")
  history      PriceHistory[] @relation("ChangedBy")

  @@map("users")
}

model Channel {
  id          Int            @id @default(autoincrement())
  name        String         @unique
  type        ChannelType
  description String?
  isActive    Boolean        @default(true) @map("is_active")
  createdAt   DateTime       @default(now()) @map("created_at")
  prices      Price[]
  history     PriceHistory[]

  @@map("channels")
}

model Product {
  id             Int            @id @default(autoincrement())
  sku            String         @unique
  name           String
  category       String
  description    String?
  referencePrice Decimal        @map("reference_price") @db.Decimal(10, 2)
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  prices         Price[]
  history        PriceHistory[]

  @@map("products")
}

model Price {
  id          Int      @id @default(autoincrement())
  productId   Int      @map("product_id")
  channelId   Int      @map("channel_id")
  price       Decimal  @db.Decimal(10, 2)
  currency    String   @default("EUR")
  updatedAt   DateTime @updatedAt @map("updated_at")
  updatedById Int?     @map("updated_by")

  product   Product @relation(fields: [productId], references: [id])
  channel   Channel @relation(fields: [channelId], references: [id])
  updatedBy User?   @relation("UpdatedBy", fields: [updatedById], references: [id])

  @@unique([productId, channelId])
  @@map("prices")
}

model PricingRule {
  id          Int       @id @default(autoincrement())
  name        String
  type        RuleType
  value       Decimal   @db.Decimal(10, 2)
  channelIds  Int[]     @map("channel_ids")
  productIds  Int[]     @map("product_ids") // empty array = all products
  startsAt    DateTime? @map("starts_at")
  endsAt      DateTime? @map("ends_at")
  isActive    Boolean   @default(true) @map("is_active")
  createdById Int       @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")

  createdBy User @relation("CreatedBy", fields: [createdById], references: [id])

  @@map("pricing_rules")
}

model PriceHistory {
  id        Int           @id @default(autoincrement())
  productId Int           @map("product_id")
  channelId Int           @map("channel_id")
  oldPrice  Decimal       @map("old_price") @db.Decimal(10, 2)
  newPrice  Decimal       @map("new_price") @db.Decimal(10, 2)
  changedById Int         @map("changed_by")
  changedAt DateTime      @default(now()) @map("changed_at")
  source    HistorySource

  product   Product @relation(fields: [productId], references: [id])
  channel   Channel @relation(fields: [channelId], references: [id])
  changedBy User    @relation("ChangedBy", fields: [changedById], references: [id])

  @@map("price_history")
}

enum Role {
  admin
  manager
  viewer
}

enum ChannelType {
  physical
  ecommerce
  marketplace
}

enum RuleType {
  percentage
  fixed
}

enum HistorySource {
  manual
  rule
  sync
}
```

---

## 6. Seed Data Complet

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // --- USERS ---
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pricesync.demo' },
    update: {},
    create: {
      email: 'admin@pricesync.demo',
      passwordHash: await bcrypt.hash('Admin2024!', 10),
      name: 'Alice Admin',
      role: 'admin',
    },
  })
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@pricesync.demo' },
    update: {},
    create: {
      email: 'manager@pricesync.demo',
      passwordHash: await bcrypt.hash('Manager2024!', 10),
      name: 'Marc Manager',
      role: 'manager',
    },
  })
  await prisma.user.upsert({
    where: { email: 'viewer@pricesync.demo' },
    update: {},
    create: {
      email: 'viewer@pricesync.demo',
      passwordHash: await bcrypt.hash('Viewer2024!', 10),
      name: 'Victor Viewer',
      role: 'viewer',
    },
  })

  // --- CHANNELS ---
  const chParis = await prisma.channel.upsert({
    where: { name: 'Atelier Galileo Paris' },
    update: {},
    create: {
      name: 'Atelier Galileo Paris',
      type: 'physical',
      description: 'Magasin physique — Paris 11e',
    },
  })
  const chEcom = await prisma.channel.upsert({
    where: { name: 'galileo-shop.fr' },
    update: {},
    create: {
      name: 'galileo-shop.fr',
      type: 'ecommerce',
      description: 'Boutique en ligne officielle',
    },
  })
  const chMarket = await prisma.channel.upsert({
    where: { name: 'Marketplace Woodcraft' },
    update: {},
    create: {
      name: 'Marketplace Woodcraft',
      type: 'marketplace',
      description: 'Plateforme spécialisée lutherie & facture instrumentale',
    },
  })

  // --- PRODUCTS ---
  const productData = [
    { sku: 'LUT-B001', name: 'Blanc Corps Épicéa Solid Top AAA', category: 'Bois', referencePrice: 45.00 },
    { sku: 'LUT-B002', name: 'Blanc Manche Érable Flamé AA', category: 'Bois', referencePrice: 62.00 },
    { sku: 'LUT-B003', name: 'Touche Ébène Guitare 650mm', category: 'Bois', referencePrice: 38.00 },
    { sku: 'LUT-B004', name: 'Blank Corps Acajou Standard', category: 'Bois', referencePrice: 52.00 },
    { sku: 'LUT-A001', name: 'Chevalet Tune-O-Matic Chrome', category: 'Accastillage', referencePrice: 28.00 },
    { sku: 'LUT-A002', name: 'Cordier Trapèze Split Chrome', category: 'Accastillage', referencePrice: 32.00 },
    { sku: 'LUT-A003', name: 'Tremolo Style Strat® Chromé 6 vis', category: 'Accastillage', referencePrice: 31.10 },
    { sku: 'LUT-A004', name: 'Cordier Gibson Style Nickel', category: 'Accastillage', referencePrice: 18.50 },
    { sku: 'LUT-A005', name: 'Sillet Os Guitare Électrique 42mm', category: 'Accastillage', referencePrice: 8.50 },
    { sku: 'LUT-A006', name: 'Sillet Carbone Guitare Classique 52mm', category: 'Accastillage', referencePrice: 12.00 },
    { sku: 'LUT-M001', name: 'Mécaniques Gotoh SD91 Set 3+3 Nickel', category: 'Mécaniques', referencePrice: 72.00 },
    { sku: 'LUT-M002', name: 'Mécaniques Style Kluson 6-en-ligne Chrome', category: 'Mécaniques', referencePrice: 35.00 },
    { sku: 'LUT-M003', name: 'Mécaniques Basse Gotoh GB7 Set 4 Chrome', category: 'Mécaniques', referencePrice: 88.00 },
    { sku: 'LUT-C001', name: 'Jeu Cordes Électrique Pure Nickel 009-042', category: 'Cordes', referencePrice: 7.90 },
    { sku: 'LUT-C002', name: 'Jeu Cordes Acoustique Phosphore Bronze 012-053', category: 'Cordes', referencePrice: 9.50 },
    { sku: 'LUT-C003', name: 'Jeu Cordes Basse 4 Cordes 045-105 Nickel', category: 'Cordes', referencePrice: 14.90 },
    { sku: 'LUT-O001', name: 'Lime Frettes Demi-Ronde Grain Fin 150mm', category: 'Outils', referencePrice: 24.00 },
    { sku: 'LUT-O002', name: 'Rabot à Manche Réglable Lutherie', category: 'Outils', referencePrice: 45.00 },
    { sku: 'LUT-E001', name: 'Potentiomètre 500K Audio CTS USA', category: 'Électronique', referencePrice: 6.50 },
    { sku: 'LUT-F001', name: 'Colle PVA Lutherie Haute Résistance 500ml', category: 'Finition', referencePrice: 12.00 },
  ]

  const products = {}
  for (const p of productData) {
    products[p.sku] = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, referencePrice: p.referencePrice },
    })
  }

  // --- PRICES (par canal, avec deltas intentionnels) ---
  // Format : [sku, parisPrice, ecomPrice, marketPrice]
  const priceMatrix = [
    ['LUT-B001', 48.00, 45.00, 42.50],  // 🔴 désync
    ['LUT-B002', 65.00, 62.00, 62.00],  // 🟡 delta
    ['LUT-B003', 40.00, 38.00, 38.00],  // 🟡 delta
    ['LUT-B004', 55.00, 52.00, 49.00],  // 🔴 désync
    ['LUT-A001', 29.90, 28.00, 25.50],  // 🔴 désync
    ['LUT-A002', 32.00, 32.00, 32.00],  // 🟢 sync
    ['LUT-A003', 33.00, 31.10, 29.90],  // 🟡 delta
    ['LUT-A004', 20.00, 18.50, 18.50],  // 🟡 delta
    ['LUT-A005',  9.00,  8.50,  8.50],  // 🟡 delta
    ['LUT-A006', 12.00, 12.00, 12.00],  // 🟢 sync
    ['LUT-M001', 78.00, 72.00, 68.00],  // 🔴 désync
    ['LUT-M002', 38.00, 35.00, 33.00],  // 🔴 désync
    ['LUT-M003', 92.00, 88.00, 88.00],  // 🟡 delta
    ['LUT-C001',  8.50,  7.90,  7.50],  // 🔴 désync
    ['LUT-C002', 10.50,  9.50,  9.50],  // 🟡 delta
    ['LUT-C003', 15.90, 14.90, 14.90],  // 🟡 delta
    ['LUT-O001', 26.00, 24.00, 24.00],  // 🟡 delta
    ['LUT-O002', 48.00, 45.00, 45.00],  // 🟡 delta
    ['LUT-E001',  7.50,  6.50,  6.50],  // 🟡 delta
    ['LUT-F001', 13.00, 12.00, 11.00],  // 🔴 désync
  ]

  const channelMap = {
    paris: chParis.id,
    ecom: chEcom.id,
    market: chMarket.id,
  }

  for (const [sku, parisP, ecomP, marketP] of priceMatrix) {
    const productId = products[sku].id
    for (const [key, price] of [['paris', parisP], ['ecom', ecomP], ['market', marketP]]) {
      await prisma.price.upsert({
        where: { productId_channelId: { productId, channelId: channelMap[key] } },
        update: { price },
        create: {
          productId,
          channelId: channelMap[key],
          price,
          updatedById: adminUser.id,
        },
      })
    }
  }

  // --- PRICING RULES ---
  const rule1 = await prisma.pricingRule.create({
    data: {
      name: 'Promo Cordes Web -15%',
      type: 'percentage',
      value: -15,
      channelIds: [chEcom.id],
      productIds: [products['LUT-C001'].id, products['LUT-C002'].id, products['LUT-C003'].id],
      isActive: true,
      createdById: adminUser.id,
    },
  })
  const rule2 = await prisma.pricingRule.create({
    data: {
      name: 'Soldes Bois Marketplace -12%',
      type: 'percentage',
      value: -12,
      channelIds: [chMarket.id],
      productIds: [
        products['LUT-B001'].id,
        products['LUT-B002'].id,
        products['LUT-B003'].id,
        products['LUT-B004'].id,
      ],
      isActive: true,
      createdById: adminUser.id,
    },
  })

  // --- PRICE HISTORY (25 entrées réparties sur 30 jours) ---
  const now = new Date()
  const historyEntries = [
    // Modifications manuelles récentes (admin)
    { sku: 'LUT-M001', ch: 'paris', old: 75.00, new: 78.00, userId: adminUser.id, daysAgo: 1, src: 'manual' },
    { sku: 'LUT-B001', ch: 'market', old: 44.00, new: 42.50, userId: managerUser.id, daysAgo: 2, src: 'manual' },
    { sku: 'LUT-C001', ch: 'ecom', old: 8.90, new: 7.90, userId: adminUser.id, daysAgo: 3, src: 'rule' },
    { sku: 'LUT-C002', ch: 'ecom', old: 10.90, new: 9.50, userId: adminUser.id, daysAgo: 3, src: 'rule' },
    { sku: 'LUT-C003', ch: 'ecom', old: 16.90, new: 14.90, userId: adminUser.id, daysAgo: 3, src: 'rule' },
    { sku: 'LUT-B002', ch: 'market', old: 68.00, new: 62.00, userId: adminUser.id, daysAgo: 4, src: 'sync' },
    { sku: 'LUT-B003', ch: 'market', old: 42.00, new: 38.00, userId: adminUser.id, daysAgo: 4, src: 'sync' },
    { sku: 'LUT-A001', ch: 'paris', old: 28.00, new: 29.90, userId: managerUser.id, daysAgo: 5, src: 'manual' },
    { sku: 'LUT-M002', ch: 'market', old: 36.00, new: 33.00, userId: adminUser.id, daysAgo: 6, src: 'manual' },
    { sku: 'LUT-F001', ch: 'market', old: 12.50, new: 11.00, userId: managerUser.id, daysAgo: 7, src: 'manual' },
    { sku: 'LUT-B004', ch: 'paris', old: 53.00, new: 55.00, userId: adminUser.id, daysAgo: 9, src: 'manual' },
    { sku: 'LUT-A003', ch: 'ecom', old: 32.00, new: 31.10, userId: managerUser.id, daysAgo: 10, src: 'manual' },
    { sku: 'LUT-O001', ch: 'paris', old: 24.00, new: 26.00, userId: adminUser.id, daysAgo: 12, src: 'manual' },
    { sku: 'LUT-E001', ch: 'paris', old: 6.90, new: 7.50, userId: adminUser.id, daysAgo: 13, src: 'manual' },
    { sku: 'LUT-C001', ch: 'paris', old: 8.00, new: 8.50, userId: managerUser.id, daysAgo: 14, src: 'manual' },
    { sku: 'LUT-M001', ch: 'ecom', old: 74.00, new: 72.00, userId: adminUser.id, daysAgo: 15, src: 'sync' },
    { sku: 'LUT-B001', ch: 'paris', old: 46.00, new: 48.00, userId: adminUser.id, daysAgo: 17, src: 'manual' },
    { sku: 'LUT-A005', ch: 'paris', old: 8.50, new: 9.00, userId: managerUser.id, daysAgo: 18, src: 'manual' },
    { sku: 'LUT-M003', ch: 'paris', old: 89.00, new: 92.00, userId: adminUser.id, daysAgo: 20, src: 'manual' },
    { sku: 'LUT-B002', ch: 'paris', old: 63.00, new: 65.00, userId: managerUser.id, daysAgo: 21, src: 'manual' },
    { sku: 'LUT-A002', ch: 'paris', old: 34.00, new: 32.00, userId: adminUser.id, daysAgo: 22, src: 'sync' },
    { sku: 'LUT-O002', ch: 'paris', old: 47.00, new: 48.00, userId: adminUser.id, daysAgo: 24, src: 'manual' },
    { sku: 'LUT-C003', ch: 'market', old: 16.00, new: 14.90, userId: managerUser.id, daysAgo: 25, src: 'rule' },
    { sku: 'LUT-A004', ch: 'ecom', old: 20.00, new: 18.50, userId: adminUser.id, daysAgo: 27, src: 'manual' },
    { sku: 'LUT-F001', ch: 'ecom', old: 13.00, new: 12.00, userId: managerUser.id, daysAgo: 29, src: 'manual' },
  ]

  const chKeyMap = { paris: chParis.id, ecom: chEcom.id, market: chMarket.id }
  for (const entry of historyEntries) {
    const d = new Date(now)
    d.setDate(d.getDate() - entry.daysAgo)
    await prisma.priceHistory.create({
      data: {
        productId: products[entry.sku].id,
        channelId: chKeyMap[entry.ch],
        oldPrice: entry.old,
        newPrice: entry.new,
        changedById: entry.userId,
        changedAt: d,
        source: entry.src,
      },
    })
  }

  console.log('✅ Seed PriceSync terminé :')
  console.log('   - 3 utilisateurs (admin / manager / viewer)')
  console.log('   - 3 canaux (Atelier Paris / galileo-shop.fr / Marketplace Woodcraft)')
  console.log('   - 20 produits lutherie')
  console.log('   - 60 entrées Prix (20 produits × 3 canaux)')
  console.log('   - 2 règles de pricing actives')
  console.log('   - 25 entrées historique (30 derniers jours)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 7. Logique Métier Critique : syncService.js

```javascript
// src/services/syncService.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Déclenche la synchronisation globale des prix selon les règles actives.
 *
 * Algorithme :
 * 1. Récupère toutes les règles actives (is_active = true, dans la fenêtre temporelle)
 * 2. Pour chaque règle, calcule le nouveau prix pour chaque (produit × canal) ciblé
 * 3. Met à jour Price si le prix calculé diffère
 * 4. Crée une entrée PriceHistory (source = "sync")
 * 5. Retourne { updated: N, unchanged: M }
 *
 * @param {number} triggeredByUserId - ID de l'utilisateur qui déclenche la sync
 */
async function runSync(triggeredByUserId) {
  const now = new Date()

  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
  })

  let updated = 0
  let unchanged = 0

  for (const rule of rules) {
    // Résoudre les produits ciblés
    const products = rule.productIds.length > 0
      ? await prisma.product.findMany({ where: { id: { in: rule.productIds } } })
      : await prisma.product.findMany()

    for (const product of products) {
      for (const channelId of rule.channelIds) {
        const currentPrice = await prisma.price.findUnique({
          where: { productId_channelId: { productId: product.id, channelId } },
        })
        if (!currentPrice) continue

        let newPrice
        if (rule.type === 'percentage') {
          newPrice = parseFloat(currentPrice.price) * (1 + rule.value / 100)
        } else {
          newPrice = parseFloat(currentPrice.price) + parseFloat(rule.value)
        }
        newPrice = Math.max(0, Math.round(newPrice * 100) / 100)

        if (newPrice === parseFloat(currentPrice.price)) {
          unchanged++
          continue
        }

        await prisma.$transaction([
          prisma.price.update({
            where: { productId_channelId: { productId: product.id, channelId } },
            data: { price: newPrice, updatedById: triggeredByUserId },
          }),
          prisma.priceHistory.create({
            data: {
              productId: product.id,
              channelId,
              oldPrice: currentPrice.price,
              newPrice,
              changedById: triggeredByUserId,
              source: 'sync',
            },
          }),
        ])
        updated++
      }
    }
  }

  return { updated, unchanged, triggeredAt: now }
}

module.exports = { runSync }
```

---

## 8. Logique Frontend : calcul du statut sync

Le Dashboard et la vue Prix doivent calculer le statut de synchronisation côté frontend :

```javascript
// utils/syncStatus.js
export function getSyncStatus(prices, referencePrice) {
  if (!prices || prices.length === 0) return 'unknown'

  const values = prices.map(p => parseFloat(p.price))
  const maxDelta = Math.max(
    ...values.map(v => Math.abs((v - referencePrice) / referencePrice) * 100)
  )

  if (maxDelta > 10) return 'desynced'   // 🔴
  if (maxDelta > 3)  return 'delta'      // 🟡
  return 'synced'                         // 🟢
}

export const STATUS_COLORS = {
  desynced: '#ef4444',  // red-500
  delta: '#f59e0b',     // amber-500
  synced: '#22c55e',    // green-500
  unknown: '#9ca3af',   // gray-400
}
```

---

## 9. Variables d'Environnement

```bash
# .env.example
DATABASE_URL=postgresql://pricesync:pricesync_password@db:5432/pricesync_db
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 10. Docker Compose

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    container_name: pricesync-db
    environment:
      POSTGRES_DB: pricesync_db
      POSTGRES_USER: pricesync
      POSTGRES_PASSWORD: pricesync_password
    volumes:
      - pricesync_pgdata:/var/lib/postgresql/data
    networks:
      - pricesync_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pricesync -d pricesync_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      target: production
    container_name: pricesync-backend
    environment:
      DATABASE_URL: postgresql://pricesync:pricesync_password@db:5432/pricesync_db
      JWT_SECRET: ${JWT_SECRET:-dev_secret_change_me}
      PORT: 5000
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    networks:
      - pricesync_network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pricesync-api.rule=Host(`demo.oldevops.fr`) && PathPrefix(`/api`)"
      - "traefik.http.services.pricesync-api.loadbalancer.server.port=5000"

  frontend:
    build:
      context: ./frontend
      target: production
    container_name: pricesync-frontend
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - pricesync_network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:80"]
      interval: 15s
      timeout: 5s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pricesync-frontend.rule=Host(`demo.oldevops.fr`)"
      - "traefik.http.services.pricesync-frontend.loadbalancer.server.port=80"

volumes:
  pricesync_pgdata:

networks:
  pricesync_network:
    driver: bridge
```

---

## 11. Ordre d'Implémentation Recommandé

Implémenter dans cet ordre pour valider chaque couche avant la suivante :

```
Phase 1 — Fondations données (ne pas démarrer le frontend avant)
  □ prisma/schema.prisma (schéma complet)
  □ prisma/seed.js (seed data complet §6)
  □ Vérifier : npx prisma migrate dev && npx prisma db seed

Phase 2 — API core
  □ server.js (Express + middleware)
  □ routes/auth.js (login/register)
  □ routes/products.js (CRUD)
  □ routes/channels.js (GET only pour la démo)
  □ routes/prices.js (GET + PUT avec création PriceHistory)
  □ routes/history.js (GET filtrable)
  □ Vérifier : GET /api/health, POST /api/auth/login

Phase 3 — Logique métier
  □ services/syncService.js (voir §7)
  □ routes/sync.js (POST /api/sync)
  □ routes/rules.js (CRUD)
  □ Vérifier : POST /api/sync retourne { updated, unchanged }

Phase 4 — Swagger
  □ Documenter tous les endpoints sur /api/docs

Phase 5 — Frontend (5 vues dans l'ordre de valeur)
  □ LoginPage (auth, token storage)
  □ DashboardPage (KPIs + tableau désync + bouton sync)
  □ PricesPage (tableau Produit × Canal avec badge delta)
  □ ProductsPage (liste + CRUD)
  □ RulesPage (liste + form création)
  □ HistoryPage (log filtrable)

Phase 6 — Tests
  □ Backend : auth + products + prices + sync
  □ Frontend : Dashboard + PriceMatrix + RuleForm
  □ Vérifier coverage > 60%

Phase 7 — Docker + Docs
  □ docker-compose.yml
  □ Dockerfiles multi-stage
  □ README.md (avec credentials démo)
  □ Vérifier : docker-compose up → app fonctionnelle sur localhost:3000
```

---

## 12. Critères de Validation Dashboard (VI4)

Au chargement initial après `docker-compose up && seed` :

| KPI | Valeur attendue |
|-----|----------------|
| Produits total | 20 |
| Canaux actifs | 3 |
| Règles actives | 2 |
| Produits désync (🔴) | 7 |
| Produits en delta (🟡) | 11 |
| Produits synchronisés (🟢) | 2 |

Les 7 produits désync attendus : LUT-B001, LUT-B004, LUT-A001, LUT-M001, LUT-M002, LUT-C001, LUT-F001.

---

## 13. Checklist DoD Finale

Avant de marquer la story comme Done :

- [ ] `docker-compose up` démarre sans erreur
- [ ] Seed data chargé automatiquement (20 produits visibles)
- [ ] Login fonctionne avec `admin@pricesync.demo` / `Admin2024!`
- [ ] Dashboard affiche 7 produits en désync
- [ ] Bouton "Synchroniser tout" déclenche POST /sync et rafraîchit l'UI
- [ ] Édition inline d'un prix crée une entrée dans PriceHistory
- [ ] Vue Historique affiche les 25 entrées seed avec filtres
- [ ] Vue Règles affiche les 2 règles seed
- [ ] Swagger accessible sur `/api/docs`
- [ ] `npm test` passe dans backend/ et frontend/
- [ ] Coverage ≥ 60% (backend + frontend)
- [ ] README contient les credentials démo et `docker-compose up`

---

**Fin du handoff PM → Dev**
_Toute question d'implémentation non couverte ici : se référer à [story-1.6.md](./story-1.6.md)_