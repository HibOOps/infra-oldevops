const { Router } = require('express')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const router = Router()
const prisma = new PrismaClient()

const updatePriceSchema = z.object({
  price: z.number().positive(),
})

/**
 * @swagger
 * /api/prices:
 *   get:
 *     summary: Prix par produit et/ou canal
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: integer }
 *       - in: query
 *         name: channelId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des prix avec produit et canal
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const where = {}
    if (req.query.productId) where.productId = parseInt(req.query.productId)
    if (req.query.channelId) where.channelId = parseInt(req.query.channelId)

    const prices = await prisma.price.findMany({
      where,
      include: {
        product: true,
        channel: true,
        updatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ product: { category: 'asc' } }, { product: { name: 'asc' } }],
    })
    res.json(prices)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/prices/{productId}/{channelId}:
 *   put:
 *     summary: Mettre à jour un prix et enregistrer dans l'historique
 *     tags: [Prices]
 */
router.put('/:productId/:channelId', requireAuth, validate(updatePriceSchema), async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId)
    const channelId = parseInt(req.params.channelId)
    const { price } = req.validated

    const current = await prisma.price.findUnique({
      where: { productId_channelId: { productId, channelId } },
    })
    if (!current) return res.status(404).json({ error: 'Prix non trouvé' })

    const [updated] = await prisma.$transaction([
      prisma.price.update({
        where: { productId_channelId: { productId, channelId } },
        data: { price, updatedById: req.user.id },
        include: { product: true, channel: true },
      }),
      prisma.priceHistory.create({
        data: {
          productId,
          channelId,
          oldPrice: current.price,
          newPrice: price,
          changedById: req.user.id,
          source: 'manual',
        },
      }),
    ])

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

module.exports = router
