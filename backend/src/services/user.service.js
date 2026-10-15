const mongoose = require('mongoose')
const User = require('../models/User')
const HttpError = require('../errors/http-error')
const { toPublicUser } = require('./auth.service')

function ensureDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'Profile service is temporarily unavailable.')
  }
}

async function getProfile(userId) {
  ensureDatabase()
  const user = await User.findById(userId)
  if (!user) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The user profile was not found.')
  return toPublicUser(user)
}

async function updateProfile(userId, changes) {
  ensureDatabase()
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: changes },
    { returnDocument: 'after', runValidators: true, context: 'query' },
  )
  if (!user) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The user profile was not found.')
  return toPublicUser(user)
}

module.exports = { getProfile, updateProfile }
