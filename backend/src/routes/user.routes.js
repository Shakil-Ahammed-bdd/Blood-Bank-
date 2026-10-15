const express = require('express')
const { editProfile, readProfile } = require('../controllers/user.controller')
const { authenticate } = require('../middleware/authenticate')
const verifyOrigin = require('../middleware/verify-origin')

const router = express.Router()

router.use(authenticate)
router.get('/profile', readProfile)
router.patch('/profile', verifyOrigin, editProfile)

module.exports = router
