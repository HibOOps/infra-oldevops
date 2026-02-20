const request = require('supertest')
const { signToken } = require('../src/utils/jwt')

const token = signToken({ id: 1, email: 'admin@pricesync.demo', role: 'admin', name: 'Alice' })

const mockHistory = [
  {
    id: 1, productId: 1, channelId: 1, oldPrice: 44, newPrice: 42.5,
    changedById: 1, changedAt: new Date(), source: 'manual',
    product: { id: 1, sku: 'LUT-B001', name: 'Épicéa' },
    channel: { id: 1, name: 'Atelier Galileo Paris', type: 'physical' },
    changedBy: { id: 1, name: 'Alice Admin', email: 'admin@pricesync.demo' },
  },
]

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: { findUnique: jest.fn() },
    priceHistory: { findMany: jest.fn().mockResolvedValue(mockHistory) },
  })),
}))

const app = require('../src/server')

describe('GET /api/history', () => {
  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/history')
    expect(res.status).toBe(401)
  })

  it('retourne le log historique avec token', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('source')
    expect(res.body[0].source).toBe('manual')
  })

  it('accepte les query params de filtre', async () => {
    const res = await request(app)
      .get('/api/history?channelId=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/channels', () => {
  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/channels')
    expect(res.status).toBe(401)
  })
})
