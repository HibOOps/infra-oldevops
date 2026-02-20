const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { runSync } = require('../services/syncService')

const router = Router()

/**
 * @swagger
 * /api/sync:
 *   post:
 *     summary: Déclencher la synchronisation globale des prix
 *     tags: [Sync]
 *     responses:
 *       200:
 *         description: Résumé de la synchronisation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated: { type: integer }
 *                 unchanged: { type: integer }
 *                 triggeredAt: { type: string, format: date-time }
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const result = await runSync(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
