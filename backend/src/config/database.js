const mongoose = require('mongoose')

async function connectDatabase(uri) {
  if (!uri) {
    console.error('MongoDB is not configured. Set MONGODB_URI in the root .env file.')
    return false
  }

  try {
    await mongoose.connect(uri)
    console.info('Connected to MongoDB.')
    return true
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    return false
  }
}

module.exports = connectDatabase
