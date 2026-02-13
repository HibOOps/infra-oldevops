function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${status} - ${message}`);
  }

  res.status(status).json({ error: message, status });
}

module.exports = { errorHandler };
