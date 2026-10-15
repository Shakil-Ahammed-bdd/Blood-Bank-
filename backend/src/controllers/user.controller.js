const { getProfile, updateProfile } = require('../services/user.service')
const { validateProfileUpdate } = require('../utils/auth-validation')

async function readProfile(req, res, next) {
  try {
    const user = await getProfile(req.user.id)
    res.json({ status: 'ok', user })
  } catch (error) {
    next(error)
  }
}

async function editProfile(req, res, next) {
  try {
    const changes = validateProfileUpdate(req.body, req.user)
    const user = await updateProfile(req.user.id, changes)
    res.json({ status: 'ok', message: 'Profile updated.', user })
  } catch (error) {
    next(error)
  }
}

module.exports = { editProfile, readProfile }
