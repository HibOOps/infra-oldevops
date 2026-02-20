const { Router } = require('express')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const router = Router()
const prisma = new PrismaClient()

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  referencePrice: z.number().positive(),
})

const updateSchema = productSchema.partial()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Liste des produits (paginée)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des produits
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit
    const where = req.query.category ? { category: req.query.category } : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { category: 'asc' },
        include: { prices: { include: { channel: true } } },
      }),
      prisma.product.count({ where }),
    ])

    res.json({ data: products, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Détail d'un produit
 *     tags: [Products]
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { prices: { include: { channel: true } } },
    })
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' })
    res.json(product)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer un produit
 *     tags: [Products]
 */
router.post('/', requireAuth, validate(productSchema), async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.validated })
    res.status(201).json(product)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'SKU déjà existant' })
    next(err)
  }
})

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Modifier un produit
 *     tags: [Products]
 */
router.put('/:id', requireAuth, validate(updateSchema), async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.validated,
    })
    res.json(product)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Produit non trouvé' })
    next(err)
  }
})

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Products]
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Produit non trouvé' })
    next(err)
  }
})

module.exports = router
