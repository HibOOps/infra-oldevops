const { Router } = require('express')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const router = Router()
const prisma = new PrismaClient()

const ruleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['percentage', 'fixed']),
  value: z.number(),
  channelIds: z.array(z.number().int()).min(1),
  productIds: z.array(z.number().int()).default([]),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
})

const updateRuleSchema = ruleSchema.partial()

/**
 * @swagger
 * /api/rules:
 *   get:
 *     summary: Liste des règles de pricing
 *     tags: [Rules]
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })
    res.json(rules)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/rules:
 *   post:
 *     summary: Créer une règle de pricing
 *     tags: [Rules]
 */
router.post('/', requireAuth, validate(ruleSchema), async (req, res, next) => {
  try {
    const { startsAt, endsAt, ...rest } = req.validated
    const rule = await prisma.pricingRule.create({
      data: {
        ...rest,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        createdById: req.user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    })
    res.status(201).json(rule)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/rules/{id}:
 *   put:
 *     summary: Modifier une règle
 *     tags: [Rules]
 */
router.put('/:id', requireAuth, validate(updateRuleSchema), async (req, res, next) => {
  try {
    const { startsAt, endsAt, ...rest } = req.validated
    const data = { ...rest }
    if (startsAt !== undefined) data.startsAt = startsAt ? new Date(startsAt) : null
    if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null

    const rule = await prisma.pricingRule.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    })
    res.json(rule)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Règle non trouvée' })
    next(err)
  }
})

/**
 * @swagger
 * /api/rules/{id}:
 *   delete:
 *     summary: Supprimer une règle
 *     tags: [Rules]
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await prisma.pricingRule.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Règle non trouvée' })
    next(err)
  }
})

module.exports = router
