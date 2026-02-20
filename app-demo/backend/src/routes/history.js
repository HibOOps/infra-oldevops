const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = Router()
const prisma = new PrismaClient()

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Historique des modifications de prix
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: integer }
 *       - in: query
 *         name: channelId
 *         schema: { type: integer }
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Log chronologique des modifications
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const where = {}
    if (req.query.productId) where.productId = parseInt(req.query.productId)
    if (req.query.channelId) where.channelId = parseInt(req.query.channelId)
    if (req.query.userId) where.changedById = parseInt(req.query.userId)
    if (req.query.from || req.query.to) {
      where.changedAt = {}
      if (req.query.from) where.changedAt.gte = new Date(req.query.from)
      if (req.query.to) where.changedAt.lte = new Date(req.query.to)
    }

    const limit = Math.min(200, parseInt(req.query.limit) || 50)

    const entries = await prisma.priceHistory.findMany({
      where,
      take: limit,
      orderBy: { changedAt: 'desc' },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        channel: { select: { id: true, name: true, type: true } },
        changedBy: { select: { id: true, name: true, email: true } },
      },
    })
    res.json(entries)
  } catch (err) {
    next(err)
  }
})

module.exports = router
