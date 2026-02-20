const request = require('supertest')
const { signToken } = require('../src/utils/jwt')

const mockProducts = [
  { id: 1, sku: 'LUT-B001', name: 'Blanc Corps Épicéa Solid Top AAA', category: 'Bois', referencePrice: 45.00, prices: [] },
  { id: 2, sku: 'LUT-M001', name: 'Mécaniques Gotoh SD91 Set 3+3 Nickel', category: 'Mécaniques', referencePrice: 72.00, prices: [] },
]

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: { findUnique: jest.fn() },
    product: {
      findMany: jest.fn().mockResolvedValue(mockProducts),
      count: jest.fn().mockResolvedValue(20),
      findUnique: jest.fn().mockResolvedValue(mockProducts[0]),
    },
  })),
}))

const app = require('../src/server')
const token = signToken({ id: 1, email: 'admin@pricesync.demo', role: 'admin', name: 'Alice' })

describe('GET /api/products', () => {
  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(401)
  })

  it('retourne la liste paginée avec token', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('pages')
  })
})
