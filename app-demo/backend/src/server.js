const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const { errorHandler } = require('./middleware/errorHandler')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const channelRoutes = require('./routes/channels')
const priceRoutes = require('./routes/prices')
const syncRoutes = require('./routes/sync')
const ruleRoutes = require('./routes/rules')
const historyRoutes = require('./routes/history')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'pricesync-backend', timestamp: new Date().toISOString() })
})

// Swagger spec inline
const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'PriceSync API', version: '1.0.0', description: 'API de synchronisation de prix multi-canaux' },
  tags: [
    { name: 'Auth', description: 'Authentification' },
    { name: 'Products', description: 'Catalogue produits' },
    { name: 'Channels', description: 'Canaux de distribution' },
    { name: 'Prices', description: 'Prix par canal' },
    { name: 'Sync', description: 'Synchronisation des prix' },
    { name: 'Rules', description: 'Règles de pricing' },
    { name: 'History', description: 'Historique des modifications' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        tags: ['Auth'],
        security: [],
        responses: { 200: { description: 'Service opérationnel' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@pricesync.demo' },
                  password: { type: 'string', example: 'Admin2024!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token JWT retourné' },
          401: { description: 'Credentials invalides' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register',
        tags: ['Auth'],
        security: [],
        responses: { 201: { description: 'Compte créé' } },
      },
    },
    '/api/products': {
      get: { summary: 'Liste produits', tags: ['Products'], responses: { 200: { description: 'OK' } } },
      post: { summary: 'Créer produit', tags: ['Products'], responses: { 201: { description: 'Créé' } } },
    },
    '/api/products/{id}': {
      get: { summary: 'Détail produit', tags: ['Products'], parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }], responses: { 200: { description: 'OK' } } },
      put: { summary: 'Modifier produit', tags: ['Products'], parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }], responses: { 200: { description: 'OK' } } },
      delete: { summary: 'Supprimer produit', tags: ['Products'], parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }], responses: { 204: { description: 'Supprimé' } } },
    },
    '/api/channels': {
      get: { summary: 'Liste canaux', tags: ['Channels'], responses: { 200: { description: 'OK' } } },
    },
    '/api/prices': {
      get: { summary: 'Prix par produit/canal', tags: ['Prices'], responses: { 200: { description: 'OK' } } },
    },
    '/api/prices/{productId}/{channelId}': {
      put: {
        summary: 'Mettre à jour un prix',
        tags: ['Prices'],
        parameters: [
          { in: 'path', name: 'productId', schema: { type: 'integer' }, required: true },
          { in: 'path', name: 'channelId', schema: { type: 'integer' }, required: true },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { price: { type: 'number' } } } } },
        },
        responses: { 200: { description: 'Prix mis à jour, historique enregistré' } },
      },
    },
    '/api/sync': {
      post: {
        summary: 'Déclencher synchronisation globale',
        tags: ['Sync'],
        responses: {
          200: {
            description: 'Résumé sync',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    updated: { type: 'integer' },
                    unchanged: { type: 'integer' },
                    triggeredAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/rules': {
      get: { summary: 'Liste règles', tags: ['Rules'], responses: { 200: { description: 'OK' } } },
      post: { summary: 'Créer règle', tags: ['Rules'], responses: { 201: { description: 'Créé' } } },
    },
    '/api/rules/{id}': {
      put: { summary: 'Modifier règle', tags: ['Rules'], parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }], responses: { 200: { description: 'OK' } } },
      delete: { summary: 'Supprimer règle', tags: ['Rules'], parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }], responses: { 204: { description: 'Supprimé' } } },
    },
    '/api/history': {
      get: { summary: 'Historique modifications', tags: ['History'], responses: { 200: { description: 'OK' } } },
    },
  },
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/prices', priceRoutes)
app.use('/api/sync', syncRoutes)
app.use('/api/rules', ruleRoutes)
app.use('/api/history', historyRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PriceSync backend running on port ${PORT}`)
    console.log(`Swagger UI: http://localhost:${PORT}/api/docs`)
  })
}

module.exports = app
