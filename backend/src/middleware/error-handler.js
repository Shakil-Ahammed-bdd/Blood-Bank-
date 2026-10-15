function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500

  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({
    status: 'error',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    message:
      statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred.'
        : error.message,
    ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
  })
}

module.exports = errorHandler
