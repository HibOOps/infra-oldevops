const request = require('supertest')
const { signToken } = require('../src/utils/jwt')

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: { findUnique: jest.fn() },
    pricingRule: { findMany: jest.fn().mockResolvedValue([]) },
    product: { findMany: jest.fn().mockResolvedValue([]) },
    price: { findUnique: jest.fn(), update: jest.fn() },
    priceHistory: { create: jest.fn() },
    $transaction: jest.fn().mockResolvedValue([]),
  })),
}))

const app = require('../src/server')
const token = signToken({ id: 1, email: 'admin@pricesync.demo', role: 'admin', name: 'Alice' })

describe('POST /api/sync', () => {
  it('retourne 401 sans token', async () => {
    const res = await request(app).post('/api/sync')
    expect(res.status).toBe(401)
  })

  it('retourne 200 avec updated et unchanged', async () => {
    const res = await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('updated')
    expect(res.body).toHaveProperty('unchanged')
    expect(res.body).toHaveProperty('triggeredAt')
  })
})
