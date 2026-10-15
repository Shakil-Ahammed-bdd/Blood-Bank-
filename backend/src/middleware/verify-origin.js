const HttpError = require('../errors/http-error')

function verifyOrigin(req, res, next) {
  const origin = req.get('origin')
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173'

  if (origin && origin !== allowedOrigin) {
    return next(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'This request origin is not allowed.'))
  }
  next()
}

module.exports = verifyOrigin
