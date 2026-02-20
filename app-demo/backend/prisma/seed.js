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
    { sku: 'LUT-A003', name: 'Tremolo Style Strat Chromé 6 vis', category: 'Accastillage', referencePrice: 31.10 },
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
      create: p,
    })
  }

  // --- PRICES (deltas intentionnels pour la démo) ---
  // Format : [sku, parisPrice, ecomPrice, marketPrice]
  const priceMatrix = [
    ['LUT-B001', 48.00, 45.00, 42.50],  // désync >10%
    ['LUT-B002', 65.00, 62.00, 62.00],  // delta 3-10%
    ['LUT-B003', 40.00, 38.00, 38.00],  // delta
    ['LUT-B004', 55.00, 52.00, 49.00],  // désync
    ['LUT-A001', 29.90, 28.00, 25.50],  // désync
    ['LUT-A002', 32.00, 32.00, 32.00],  // sync
    ['LUT-A003', 33.00, 31.10, 29.90],  // delta
    ['LUT-A004', 20.00, 18.50, 18.50],  // delta
    ['LUT-A005',  9.00,  8.50,  8.50],  // delta
    ['LUT-A006', 12.00, 12.00, 12.00],  // sync
    ['LUT-M001', 78.00, 72.00, 68.00],  // désync
    ['LUT-M002', 38.00, 35.00, 33.00],  // désync
    ['LUT-M003', 92.00, 88.00, 88.00],  // delta
    ['LUT-C001',  8.50,  7.90,  7.50],  // désync
    ['LUT-C002', 10.50,  9.50,  9.50],  // delta
    ['LUT-C003', 15.90, 14.90, 14.90],  // delta
    ['LUT-O001', 26.00, 24.00, 24.00],  // delta
    ['LUT-O002', 48.00, 45.00, 45.00],  // delta
    ['LUT-E001',  7.50,  6.50,  6.50],  // delta
    ['LUT-F001', 13.00, 12.00, 11.00],  // désync
  ]

  const channelMap = { paris: chParis.id, ecom: chEcom.id, market: chMarket.id }

  for (const [sku, parisP, ecomP, marketP] of priceMatrix) {
    const productId = products[sku].id
    for (const [key, price] of [['paris', parisP], ['ecom', ecomP], ['market', marketP]]) {
      await prisma.price.upsert({
        where: { productId_channelId: { productId, channelId: channelMap[key] } },
        update: { price },
        create: { productId, channelId: channelMap[key], price, updatedById: adminUser.id },
      })
    }
  }

  // --- PRICING RULES ---
  // Delete existing rules to avoid duplicates on re-seed
  await prisma.pricingRule.deleteMany({})

  await prisma.pricingRule.create({
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
  await prisma.pricingRule.create({
    data: {
      name: 'Soldes Bois Marketplace -12%',
      type: 'percentage',
      value: -12,
      channelIds: [chMarket.id],
      productIds: [
        products['LUT-B001'].id, products['LUT-B002'].id,
        products['LUT-B003'].id, products['LUT-B004'].id,
      ],
      isActive: true,
      createdById: adminUser.id,
    },
  })

  // --- PRICE HISTORY (25 entrées sur 30 jours) ---
  await prisma.priceHistory.deleteMany({})

  const now = new Date()
  const historyEntries = [
    { sku: 'LUT-M001', ch: 'paris',  old: 75.00, nw: 78.00, uid: adminUser.id,   daysAgo: 1,  src: 'manual' },
    { sku: 'LUT-B001', ch: 'market', old: 44.00, nw: 42.50, uid: managerUser.id, daysAgo: 2,  src: 'manual' },
    { sku: 'LUT-C001', ch: 'ecom',   old: 8.90,  nw: 7.90,  uid: adminUser.id,   daysAgo: 3,  src: 'rule'   },
    { sku: 'LUT-C002', ch: 'ecom',   old: 10.90, nw: 9.50,  uid: adminUser.id,   daysAgo: 3,  src: 'rule'   },
    { sku: 'LUT-C003', ch: 'ecom',   old: 16.90, nw: 14.90, uid: adminUser.id,   daysAgo: 3,  src: 'rule'   },
    { sku: 'LUT-B002', ch: 'market', old: 68.00, nw: 62.00, uid: adminUser.id,   daysAgo: 4,  src: 'sync'   },
    { sku: 'LUT-B003', ch: 'market', old: 42.00, nw: 38.00, uid: adminUser.id,   daysAgo: 4,  src: 'sync'   },
    { sku: 'LUT-A001', ch: 'paris',  old: 28.00, nw: 29.90, uid: managerUser.id, daysAgo: 5,  src: 'manual' },
    { sku: 'LUT-M002', ch: 'market', old: 36.00, nw: 33.00, uid: adminUser.id,   daysAgo: 6,  src: 'manual' },
    { sku: 'LUT-F001', ch: 'market', old: 12.50, nw: 11.00, uid: managerUser.id, daysAgo: 7,  src: 'manual' },
    { sku: 'LUT-B004', ch: 'paris',  old: 53.00, nw: 55.00, uid: adminUser.id,   daysAgo: 9,  src: 'manual' },
    { sku: 'LUT-A003', ch: 'ecom',   old: 32.00, nw: 31.10, uid: managerUser.id, daysAgo: 10, src: 'manual' },
    { sku: 'LUT-O001', ch: 'paris',  old: 24.00, nw: 26.00, uid: adminUser.id,   daysAgo: 12, src: 'manual' },
    { sku: 'LUT-E001', ch: 'paris',  old: 6.90,  nw: 7.50,  uid: adminUser.id,   daysAgo: 13, src: 'manual' },
    { sku: 'LUT-C001', ch: 'paris',  old: 8.00,  nw: 8.50,  uid: managerUser.id, daysAgo: 14, src: 'manual' },
    { sku: 'LUT-M001', ch: 'ecom',   old: 74.00, nw: 72.00, uid: adminUser.id,   daysAgo: 15, src: 'sync'   },
    { sku: 'LUT-B001', ch: 'paris',  old: 46.00, nw: 48.00, uid: adminUser.id,   daysAgo: 17, src: 'manual' },
    { sku: 'LUT-A005', ch: 'paris',  old: 8.50,  nw: 9.00,  uid: managerUser.id, daysAgo: 18, src: 'manual' },
    { sku: 'LUT-M003', ch: 'paris',  old: 89.00, nw: 92.00, uid: adminUser.id,   daysAgo: 20, src: 'manual' },
    { sku: 'LUT-B002', ch: 'paris',  old: 63.00, nw: 65.00, uid: managerUser.id, daysAgo: 21, src: 'manual' },
    { sku: 'LUT-A002', ch: 'paris',  old: 34.00, nw: 32.00, uid: adminUser.id,   daysAgo: 22, src: 'sync'   },
    { sku: 'LUT-O002', ch: 'paris',  old: 47.00, nw: 48.00, uid: adminUser.id,   daysAgo: 24, src: 'manual' },
    { sku: 'LUT-C003', ch: 'market', old: 16.00, nw: 14.90, uid: managerUser.id, daysAgo: 25, src: 'rule'   },
    { sku: 'LUT-A004', ch: 'ecom',   old: 20.00, nw: 18.50, uid: adminUser.id,   daysAgo: 27, src: 'manual' },
    { sku: 'LUT-F001', ch: 'ecom',   old: 13.00, nw: 12.00, uid: managerUser.id, daysAgo: 29, src: 'manual' },
  ]

  const chKeyMap = { paris: chParis.id, ecom: chEcom.id, market: chMarket.id }
  for (const e of historyEntries) {
    const d = new Date(now)
    d.setDate(d.getDate() - e.daysAgo)
    await prisma.priceHistory.create({
      data: {
        productId: products[e.sku].id,
        channelId: chKeyMap[e.ch],
        oldPrice: e.old,
        newPrice: e.nw,
        changedById: e.uid,
        changedAt: d,
        source: e.src,
      },
    })
  }

  console.log('Seed PriceSync terminé :')
  console.log('  3 utilisateurs | 3 canaux (Atelier Galileo Paris / galileo-shop.fr / Marketplace Woodcraft) | 20 produits | 60 prix | 2 règles | 25 historiques')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
