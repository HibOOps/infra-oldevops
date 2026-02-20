const request = require('supertest')

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockUser = {
    id: 1,
    email: 'admin@pricesync.demo',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Alice Admin',
    role: 'admin',
  }
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockResolvedValue({ ...mockUser, id: 2, email: 'new@test.com' }),
      },
    })),
  }
})

const app = require('../src/server')

describe('POST /api/auth/login', () => {
  it('retourne 400 si email manquant', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'test' })
    expect(res.status).toBe(400)
  })

  it('retourne 401 si mot de passe incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pricesync.demo', password: 'mauvais_mdp' })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/register', () => {
  it('retourne 400 si données invalides', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'invalid' })
    expect(res.status).toBe(400)
  })
})
