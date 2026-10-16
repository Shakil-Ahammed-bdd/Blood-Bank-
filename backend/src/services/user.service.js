const mongoose = require('mongoose')
const User = require('../models/User')
const Experience = require('../models/Experience')
const ExperienceComment = require('../models/ExperienceComment')
const HttpError = require('../errors/http-error')
const { toPublicUser } = require('./auth.service')
const { removeAvatar, storeAvatar } = require('./experience-image-storage')
const { deleteUserInteractions } = require('./experience-social.service')

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

async function getPublicProfile(identifier) {
  ensureDatabase()
  const query = mongoose.isValidObjectId(identifier)
    ? { _id: identifier }
    : { userId: String(identifier).toUpperCase() }
  const user = await User.findOne(query)
    .select('userId fullName bloodGroup division district location isDonorAvailable isSearchable profilePhotoUrl createdAt')
    .lean()
  if (!user) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The public donor profile was not found.')

  let publicProfileDetails = user.isSearchable
  if (!publicProfileDetails) {
    const [hasPublicPost, commentPostIds] = await Promise.all([
      Experience.exists({ userId: user._id, status: 'approved', isPublic: true }),
      ExperienceComment.distinct('experienceId', { userId: user._id }),
    ])
    const hasPublicComment = commentPostIds.length > 0 && await Experience.exists({
      _id: { $in: commentPostIds },
      status: 'approved',
      isPublic: true,
    })
    publicProfileDetails = Boolean(hasPublicPost)
    if (!hasPublicPost && !hasPublicComment) {
      throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The public donor profile was not found.')
    }
  }
  return {
    id: String(user._id),
    userId: user.userId,
    fullName: user.fullName,
    profilePhotoUrl: user.profilePhotoUrl || '',
    ...(publicProfileDetails
      ? {
          bloodGroup: user.bloodGroup,
          division: user.division,
          district: user.district,
          location: user.location,
          isDonorAvailable: user.isDonorAvailable,
          createdAt: user.createdAt,
        }
      : { limitedPublicProfile: true }),
  }
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

async function updateProfilePhoto(userId, file) {
  ensureDatabase()
  const currentUser = await User.findById(userId).select('profilePhotoUrl')
  if (!currentUser) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The user profile was not found.')
  const previousImage = currentUser.profilePhotoUrl
  const imageUrl = await storeAvatar(file)
  let user
  try {
    user = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePhotoUrl: imageUrl } },
      { returnDocument: 'after', runValidators: true },
    )
    if (!user) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The user profile was not found.')
  } catch (error) {
    await removeAvatar(imageUrl)
    throw error
  }
  await removeAvatar(previousImage)
  return toPublicUser(user)
}

async function deleteProfile(userId) {
  ensureDatabase()
  const user = await User.findById(userId)
  if (!user) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The user profile was not found.')
  await deleteUserInteractions(userId)
  await User.deleteOne({ _id: userId })
  await removeAvatar(user.profilePhotoUrl)
}

module.exports = {
  deleteProfile,
  getProfile,
  getPublicProfile,
  updateProfile,
  updateProfilePhoto,
}
