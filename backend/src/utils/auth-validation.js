const HttpError = require('../errors/http-error')
const locations = require('./bangladesh-locations')

const BLOOD_GROUPS = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(?:\+?88)?01[3-9]\d{8}$/

function validationError(fieldErrors) {
  throw new HttpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fieldErrors)
}

function readString(body, field, fieldErrors, { max = 300, min = 1, trim = true } = {}) {
  const value = body?.[field]
  if (typeof value !== 'string') {
    fieldErrors[field] = 'This field is required.'
    return ''
  }
  const result = trim ? value.trim() : value
  if (result.length < min || result.length > max) {
    fieldErrors[field] = `Enter between ${min} and ${max} characters.`
  }
  return result
}

function validateRegistration(body) {
  const fieldErrors = {}
  const fullName = readString(body, 'fullName', fieldErrors, { min: 2, max: 100 })
  const email = readString(body, 'email', fieldErrors, { max: 254 }).toLowerCase()
  const phone = readString(body, 'phone', fieldErrors, { max: 16 })
  const bloodGroup = readString(body, 'bloodGroup', fieldErrors, { max: 3 })
  const division = readString(body, 'division', fieldErrors, { max: 40 })
  const district = readString(body, 'district', fieldErrors, { max: 40 })
  const location = readString(body, 'location', fieldErrors, { min: 2, max: 100 })
  const password = readString(body, 'password', fieldErrors, { min: 12, max: 72, trim: false })

  if (email && !EMAIL_PATTERN.test(email)) fieldErrors.email = 'Enter a valid email address.'
  if (phone && !PHONE_PATTERN.test(phone.replace(/[\s-]/g, ''))) {
    fieldErrors.phone = 'Enter a valid Bangladesh mobile number.'
  }
  if (bloodGroup && !BLOOD_GROUPS.has(bloodGroup)) {
    fieldErrors.bloodGroup = 'Select a valid blood group.'
  }
  if (division && !Object.hasOwn(locations, division)) {
    fieldErrors.division = 'Select a valid division.'
  } else if (district && !locations[division]?.includes(district)) {
    fieldErrors.district = 'Select a district within the chosen division.'
  }
  if (password && Buffer.byteLength(password, 'utf8') > 72) {
    fieldErrors.password = 'Password must not exceed 72 UTF-8 bytes.'
  }
  if (body?.confirmPassword !== password) {
    fieldErrors.confirmPassword = 'Passwords do not match.'
  }
  if (body?.acceptTerms !== true) {
    fieldErrors.acceptTerms = 'You must accept the terms and privacy policy.'
  }
  for (const field of ['isDonorAvailable', 'isSearchable']) {
    if (body?.[field] !== undefined && typeof body[field] !== 'boolean') {
      fieldErrors[field] = 'Choose a valid donor preference.'
    }
  }
  if (Object.keys(fieldErrors).length) validationError(fieldErrors)

  return {
    fullName,
    email,
    phone: phone.replace(/[\s-]/g, ''),
    bloodGroup,
    division,
    district,
    location,
    isDonorAvailable: body.isDonorAvailable === true,
    isSearchable: body.isSearchable === true,
    password,
  }
}

function validateLogin(body) {
  const fieldErrors = {}
  const identifier = readString(body, 'identifier', fieldErrors, { max: 254 })
  const password = readString(body, 'password', fieldErrors, { max: 72, trim: false })
  if (identifier && !EMAIL_PATTERN.test(identifier) && !/^AHB-[A-F0-9]{16}$/i.test(identifier)) {
    fieldErrors.identifier = 'Enter a valid email address or Ahoban User ID.'
  }
  if (Object.keys(fieldErrors).length) validationError(fieldErrors)
  return { identifier, password }
}

const PROFILE_FIELDS = new Set([
  'fullName',
  'phone',
  'bloodGroup',
  'division',
  'district',
  'location',
  'isDonorAvailable',
  'isSearchable',
])

function validateProfileUpdate(body, currentProfile) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    validationError({ profile: 'Submit profile fields as an object.' })
  }

  const fieldErrors = {}
  const keys = Object.keys(body)
  for (const key of keys) {
    if (!PROFILE_FIELDS.has(key)) fieldErrors[key] = 'This field cannot be changed here.'
  }
  if (keys.length === 0) fieldErrors.profile = 'Provide at least one profile field to update.'

  const input = {}
  for (const field of keys.filter((key) => PROFILE_FIELDS.has(key))) {
    if (field === 'isDonorAvailable' || field === 'isSearchable') {
      if (typeof body[field] !== 'boolean') fieldErrors[field] = 'Choose a valid donor preference.'
      else input[field] = body[field]
      continue
    }

    const limits = {
      fullName: { min: 2, max: 100 },
      phone: { min: 1, max: 16 },
      bloodGroup: { min: 1, max: 3 },
      division: { min: 1, max: 40 },
      district: { min: 1, max: 40 },
      location: { min: 2, max: 100 },
    }[field]
    input[field] = readString(body, field, fieldErrors, limits)
  }

  if (input.phone && !PHONE_PATTERN.test(input.phone.replace(/[\s-]/g, ''))) {
    fieldErrors.phone = 'Enter a valid Bangladesh mobile number.'
  } else if (input.phone) {
    input.phone = input.phone.replace(/[\s-]/g, '')
  }
  if (input.bloodGroup && !BLOOD_GROUPS.has(input.bloodGroup)) {
    fieldErrors.bloodGroup = 'Select a valid blood group.'
  }
  if (input.division && !Object.hasOwn(locations, input.division)) {
    fieldErrors.division = 'Select a valid division.'
  }
  const targetDivision = input.division || currentProfile.division
  const targetDistrict = input.district || currentProfile.district
  if (input.division && !input.district && !locations[input.division]?.includes(targetDistrict)) {
    fieldErrors.district = 'Select a district within the chosen division.'
  } else if (input.district) {
    if (!Object.hasOwn(locations, targetDivision) || !locations[targetDivision]?.includes(targetDistrict)) {
      fieldErrors.district = 'Select a district within the chosen division.'
    }
  }
  if (Object.keys(fieldErrors).length) validationError(fieldErrors)
  return input
}

module.exports = { validateLogin, validateProfileUpdate, validateRegistration }
