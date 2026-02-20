const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function runSync(triggeredByUserId) {
  const now = new Date()

  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
  })

  let updated = 0
  let unchanged = 0

  for (const rule of rules) {
    const products = rule.productIds.length > 0
      ? await prisma.product.findMany({ where: { id: { in: rule.productIds } } })
      : await prisma.product.findMany()

    for (const product of products) {
      for (const channelId of rule.channelIds) {
        const current = await prisma.price.findUnique({
          where: { productId_channelId: { productId: product.id, channelId } },
        })
        if (!current) continue

        let newPrice
        const currentVal = parseFloat(current.price)
        if (rule.type === 'percentage') {
          newPrice = currentVal * (1 + parseFloat(rule.value) / 100)
        } else {
          newPrice = currentVal + parseFloat(rule.value)
        }
        newPrice = Math.max(0, Math.round(newPrice * 100) / 100)

        if (newPrice === currentVal) {
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
              oldPrice: current.price,
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
