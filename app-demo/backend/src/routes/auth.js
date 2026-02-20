const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')
const { signToken } = require('../utils/jwt')
const { validate } = require('../middleware/validate')

const router = Router()
const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authentification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Token JWT
 *       401:
 *         description: Credentials invalides
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription
 *     tags: [Auth]
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.validated
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email déjà utilisé' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, passwordHash, name } })
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    next(err)
  }
})

module.exports = router
