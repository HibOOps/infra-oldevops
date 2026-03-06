const client = require('prom-client')

const register = new client.Registry()

client.collectDefaultMetrics({ register, prefix: 'nodejs_' })

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['service', 'method', 'route', 'status'],
  registers: [register],
})

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['service', 'method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
})

const httpActiveConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  labelNames: ['service'],
  registers: [register],
})

const SERVICE = 'pricesync-api'

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next()

  httpActiveConnections.inc({ service: SERVICE })
  const end = httpRequestDuration.startTimer()

  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path
    const labels = {
      service: SERVICE,
      method: req.method,
      route,
      status: String(res.statusCode),
    }
    httpRequestsTotal.inc(labels)
    end(labels)
    httpActiveConnections.dec({ service: SERVICE })
  })

  next()
}

module.exports = { metricsMiddleware, register }
