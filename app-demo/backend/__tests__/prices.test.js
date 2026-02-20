const request = require('supertest')
const { signToken } = require('../src/utils/jwt')

const token = signToken({ id: 1, email: 'admin@pricesync.demo', role: 'admin', name: 'Alice' })

const mockPrice = { id: 1, productId: 1, channelId: 1, price: 45.00, currency: 'EUR', updatedById: 1 }

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: { findUnique: jest.fn() },
    price: {
      findMany: jest.fn().mockResolvedValue([mockPrice]),
      findUnique: jest.fn().mockResolvedValue(mockPrice),
      update: jest.fn().mockResolvedValue({ ...mockPrice, price: 50.00, product: { id: 1 }, channel: { id: 1 } }),
    },
    priceHistory: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn().mockImplementation(async (ops) => {
      return Promise.all(ops.map(op => op))
    }),
  })),
}))

const app = require('../src/server')

describe('GET /api/prices', () => {
  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/prices')
    expect(res.status).toBe(401)
  })

  it('retourne la liste des prix avec token', async () => {
    const res = await request(app)
      .get('/api/prices')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('PUT /api/prices/:productId/:channelId', () => {
  it('retourne 400 si price manquant', async () => {
    const res = await request(app)
      .put('/api/prices/1/1')
      .set('Authorization', `Bearer ${token}`)
      .send({})
    expect(res.status).toBe(400)
  })

  it('retourne 400 si price négatif', async () => {
    const res = await request(app)
      .put('/api/prices/1/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: -5 })
    expect(res.status).toBe(400)
  })
})
