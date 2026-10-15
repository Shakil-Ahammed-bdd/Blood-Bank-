const test = require('node:test')
const assert = require('node:assert/strict')
const { randomBytes, randomUUID } = require('node:crypto')
const mongoose = require('mongoose')

process.env.JWT_SECRET ||= randomBytes(48).toString('base64url')

const app = require('../src/app')
const User = require('../src/models/User')

test('registration, profiles, donor search, and cookie-based authentication lifecycle', async () => {
  const databaseUri =
    process.env.AUTH_TEST_MONGODB_URI ||
    'mongodb://127.0.0.1:27017/blood-bank-auth-test'
  const email = `auth-test-${randomUUID()}@example.test`
  const unavailableEmail = `auth-test-${randomUUID()}@example.test`
  const privateEmail = `auth-test-${randomUUID()}@example.test`
  const makeDetails = (userEmail, overrides = {}) => ({
    fullName: 'Test Donor',
    email: userEmail,
    phone: '01712345678',
    bloodGroup: 'A+',
    division: 'ঢাকা',
    district: 'ঢাকা',
    location: 'ধানমন্ডি',
    isDonorAvailable: true,
    isSearchable: true,
    password: 'a-secure-test-password',
    confirmPassword: 'a-secure-test-password',
    acceptTerms: true,
    ...overrides,
  })
  const userDetails = makeDetails(email)
  const unavailableDetails = makeDetails(unavailableEmail, {
    fullName: 'Unavailable Donor',
    isDonorAvailable: false,
    location: 'গুলশান',
  })
  const privateDetails = makeDetails(privateEmail, {
    fullName: 'Private Donor',
    isSearchable: false,
  })
  const server = app.listen(0, '127.0.0.1')

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve)
      server.once('error', reject)
    })
    await mongoose.connect(databaseUri)
    await User.init()
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const request = (path, options = {}) => fetch(`${baseUrl}/api/auth${path}`, options)

    const rejectedOrigin = await request('/register', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://untrusted.example',
      },
      body: JSON.stringify(userDetails),
    })
    assert.equal(rejectedOrigin.status, 403)

    const invalidRegistration = await request('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...userDetails, phone: 'not-a-phone' }),
    })
    assert.equal(invalidRegistration.status, 400)
    assert.equal((await invalidRegistration.json()).fieldErrors.phone.length > 0, true)
    const missingLocation = await request('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...userDetails, location: '' }),
    })
    assert.equal(missingLocation.status, 400)
    assert.equal((await missingLocation.json()).fieldErrors.location.length > 0, true)

    const registration = await request('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(userDetails),
    })
    assert.equal(registration.status, 201)
    const registered = await registration.json()
    assert.match(registered.user.userId, /^AHB-[A-F0-9]{16}$/)
    assert.equal('passwordHash' in registered.user, false)
    assert.equal('token' in registered, false)
    const registrationCookie = registration.headers.getSetCookie()[0]
    assert.match(registrationCookie, /HttpOnly/i)
    assert.match(registrationCookie, /SameSite=Lax/i)
    assert.match(registrationCookie, /Path=\/api/i)
    const sessionCookie = registrationCookie.split(';')[0]
    await assert.rejects(
      new User({
        userId: registered.user.userId,
        fullName: 'Duplicate ID',
        email: `other-${randomUUID()}@example.test`,
        phone: '01712345678',
        bloodGroup: 'A+',
        division: 'ঢাকা',
        district: 'ঢাকা',
        location: 'ঢাকা',
        passwordHash: 'test-hash',
      }).save(),
      (error) => error.code === 11000 && error.keyPattern.userId === 1,
    )

    const duplicate = await request('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(userDetails),
    })
    assert.equal(duplicate.status, 409)
    assert.equal((await duplicate.json()).code, 'EMAIL_ALREADY_REGISTERED')

    const protectedWithoutCookie = await request('/me')
    assert.equal(protectedWithoutCookie.status, 401)

    const currentUser = await request('/me', { headers: { cookie: sessionCookie } })
    assert.equal(currentUser.status, 200)
    assert.equal((await currentUser.json()).user.email, email)

    const getProfile = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { cookie: sessionCookie },
    })
    assert.equal(getProfile.status, 200)
    const profile = await getProfile.json()
    assert.equal(profile.user.location, 'ধানমন্ডি')
    assert.equal(profile.user.isSearchable, true)
    assert.equal('passwordHash' in profile.user, false)
    assert.equal((await fetch(`${baseUrl}/api/users/profile`)).status, 401)

    const profileUpdate = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({
        fullName: 'Updated Test Donor',
        phone: '01812345678',
        bloodGroup: 'B+',
        division: 'ঢাকা',
        district: 'ঢাকা',
        location: 'উত্তরা',
        isDonorAvailable: true,
        isSearchable: true,
      }),
    })
    assert.equal(profileUpdate.status, 200)
    const updatedProfile = await profileUpdate.json()
    assert.equal(updatedProfile.user.fullName, 'Updated Test Donor')
    assert.equal(updatedProfile.user.location, 'উত্তরা')
    assert.equal(updatedProfile.user.bloodGroup, 'B+')

    const protectedFieldUpdate = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({ userId: 'AHB-0000000000000000' }),
    })
    assert.equal(protectedFieldUpdate.status, 400)
    assert.ok((await protectedFieldUpdate.json()).fieldErrors.userId)
    const invalidLocationUpdate = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({ division: 'চট্টগ্রাম' }),
    })
    assert.equal(invalidLocationUpdate.status, 400)

    const secondRegistration = await request('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(unavailableDetails),
    })
    assert.equal(secondRegistration.status, 201)
    const privateRegistration = await request('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(privateDetails),
    })
    assert.equal(privateRegistration.status, 201)
    const privateUser = await privateRegistration.json()
    await User.updateOne(
      { email },
      { $set: { createdAt: new Date('2026-01-01T00:00:00.000Z') } },
      { timestamps: false },
    )
    await User.updateOne(
      { email: unavailableEmail },
      { $set: { createdAt: new Date('2026-02-01T00:00:00.000Z') } },
      { timestamps: false },
    )
    await User.updateOne(
      { email: privateEmail },
      { $set: { createdAt: new Date('2026-03-01T00:00:00.000Z') } },
      { timestamps: false },
    )

    const availableDonors = await fetch(
      `${baseUrl}/api/donors?${new URLSearchParams({
        availability: 'available',
        bloodGroup: 'B+',
        division: 'ঢাকা',
        district: 'ঢাকা',
        location: 'উত্তরা',
      })}`,
    )
    assert.equal(availableDonors.status, 200)
    const availableResult = await availableDonors.json()
    assert.equal(availableResult.pagination.total, 1)
    assert.equal(availableResult.donors[0].fullName, 'Updated Test Donor')
    assert.equal('email' in availableResult.donors[0], false)
    assert.equal('phone' in availableResult.donors[0], false)

    const unavailableDonors = await fetch(`${baseUrl}/api/donors?availability=unavailable`)
    assert.equal(unavailableDonors.status, 200)
    assert.equal((await unavailableDonors.json()).pagination.total, 1)
    const allPublicDonors = await fetch(`${baseUrl}/api/donors?availability=all&limit=1`)
    const publicResult = await allPublicDonors.json()
    assert.equal(publicResult.pagination.total, 2)
    assert.equal(publicResult.pagination.pages, 2)
    const recentDonors = await fetch(`${baseUrl}/api/donors?sort=recent&availability=all&limit=2`)
    const recentResult = await recentDonors.json()
    assert.equal(recentResult.donors[0].fullName, 'Unavailable Donor')
    assert.equal(recentResult.donors[1].fullName, 'Updated Test Donor')
    assert.equal(new Date(recentResult.donors[0].createdAt) > new Date(recentResult.donors[1].createdAt), true)
    assert.equal('email' in recentResult.donors[0], false)
    const hiddenProfile = await fetch(`${baseUrl}/api/donors/${privateUser.user.id}`)
    assert.equal(hiddenProfile.status, 404)
    const publicProfile = await fetch(`${baseUrl}/api/donors/${registered.user.id}`)
    assert.equal(publicProfile.status, 200)
    assert.equal('email' in (await publicProfile.json()).donor, false)
    const invalidFilters = await fetch(`${baseUrl}/api/donors?limit=500`)
    assert.equal(invalidFilters.status, 400)
    const invalidAvailability = await fetch(`${baseUrl}/api/donors?availability%5B%5D=available`)
    assert.equal(invalidAvailability.status, 400)
    const invalidSort = await fetch(`${baseUrl}/api/donors?sort=oldest`)
    assert.equal(invalidSort.status, 400)

    const invalidLogin = await request('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: email, password: 'incorrect-password' }),
    })
    assert.equal(invalidLogin.status, 401)

    const emailLogin = await request('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: email, password: userDetails.password }),
    })
    assert.equal(emailLogin.status, 200)

    const userIdLogin = await request('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: registered.user.userId, password: userDetails.password }),
    })
    assert.equal(userIdLogin.status, 200)
    const loginCookie = userIdLogin.headers.getSetCookie()[0].split(';')[0]

    const logout = await request('/logout', {
      method: 'POST',
      headers: { cookie: loginCookie },
    })
    assert.equal(logout.status, 204)
    assert.match(logout.headers.getSetCookie()[0], /Expires=/i)
    assert.equal((await request('/me')).status, 401)

    const storedUser = await User.findOne({ email }).select('+passwordHash')
    assert.ok(storedUser.passwordHash.startsWith('$2'))
    assert.notEqual(storedUser.passwordHash, userDetails.password)
  } finally {
    await User.deleteMany({ email: { $in: [email, unavailableEmail, privateEmail] } }).catch(() => {})
    await new Promise((resolve) => server.close(resolve))
    await mongoose.disconnect()
  }
})
