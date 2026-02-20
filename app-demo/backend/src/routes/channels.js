const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = Router()
const prisma = new PrismaClient()

/**
 * @swagger
 * /api/channels:
 *   get:
 *     summary: Liste des canaux
 *     tags: [Channels]
 *     responses:
 *       200:
 *         description: Liste des canaux actifs
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { type: 'asc' },
    })
    res.json(channels)
  } catch (err) {
    next(err)
  }
})

module.exports = router
