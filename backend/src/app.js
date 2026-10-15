const cors = require('cors')
const cookieParser = require('cookie-parser')
const express = require('express')

const errorHandler = require('./middleware/error-handler')
const authRoutes = require('./routes/auth.routes')
const donorRoutes = require('./routes/donor.routes')
const healthRoutes = require('./routes/health.routes')
const userRoutes = require('./routes/user.routes')

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/health', healthRoutes)
app.use((req, res, next) => {
  const error = new Error('Route not found.')
  error.statusCode = 404
  next(error)
})
app.use(errorHandler)

module.exports = app
