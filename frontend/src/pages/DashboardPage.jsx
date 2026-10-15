import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import AuthSelect from '../components/auth/AuthSelect'
import { useAuth } from '../contexts/useAuth'
import { profileApi } from '../services/api/profileApi'
import { bangladeshDivisions, bangladeshLocations } from '../utils/bangladeshLocations'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function editableValues(user) {
  return {
    fullName: user.fullName,
    phone: user.phone,
    bloodGroup: user.bloodGroup,
    division: user.division,
    district: user.district,
    location: user.location || '',
    isDonorAvailable: Boolean(user.isDonorAvailable),
    isSearchable: Boolean(user.isSearchable),
  }
}

function DashboardPage() {
  const { user, logout, updateUser } = useAuth()
  const [values, setValues] = useState(() => editableValues(user))
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [logoutLoading, setLogoutLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    profileApi.get().then(
      ({ user: profile }) => {
        if (active) {
          updateUser(profile)
          setValues(editableValues(profile))
          setLoading(false)
        }
      },
      (requestError) => {
        if (active) {
          setError(requestError.message)
          setLoading(false)
        }
      },
    )
    return () => { active = false }
  }, [updateUser])

  function update(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'division' ? { district: '' } : {}),
    }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setError('')
    setSuccess('')
  }

  function validate() {
    const errors = {}
    if (values.fullName.trim().length < 2) errors.fullName = 'কমপক্ষে ২ অক্ষরের নাম লিখুন।'
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(values.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।'
    }
    if (!values.bloodGroup) errors.bloodGroup = 'রক্তের গ্রুপ নির্বাচন করুন।'
    if (!values.division) errors.division = 'বিভাগ নির্বাচন করুন।'
    if (!values.district || !(bangladeshLocations[values.division] || []).includes(values.district)) {
      errors.district = 'বিভাগের অন্তর্গত জেলা নির্বাচন করুন।'
    }
    if (values.location.trim().length < 2) errors.location = 'আপনার এলাকা লিখুন।'
    return errors
  }

  async function saveProfile(event) {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { user: profile } = await profileApi.update(values)
      updateUser(profile)
      setValues(editableValues(profile))
      setEditing(false)
      setSuccess('আপনার প্রোফাইল সফলভাবে হালনাগাদ হয়েছে।')
    } catch (requestError) {
      setError(requestError.message)
      setFieldErrors(requestError.fieldErrors || {})
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setValues(editableValues(user))
    setFieldErrors({})
    setError('')
    setEditing(false)
  }

  async function handleLogout() {
    setLogoutLoading(true)
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (logoutError) {
      setError(logoutError.message)
      setLogoutLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="দাতা ড্যাশবোর্ড"
      subtitle="আপনার তথ্য ও donor-search সম্মতি নিয়ন্ত্রণ করুন।"
      title={`স্বাগতম, ${user.fullName}`}
    >
      {location.state?.message && <p className="auth-success">{location.state.message}</p>}
      {success && <p aria-live="polite" className="auth-success" role="status">{success}</p>}
      {error && <p aria-live="polite" className="auth-alert" role="alert">{error}</p>}
      {loading ? (
        <p className="profile-loading" role="status">প্রোফাইল লোড হচ্ছে…</p>
      ) : editing ? (
        <form className="auth-form profile-edit-form" noValidate onSubmit={saveProfile}>
          <AuthField autoComplete="name" error={fieldErrors.fullName} label="পূর্ণ নাম" name="fullName" onChange={update} required value={values.fullName} />
          <div className="auth-field profile-protected">
            <span>User ID</span>
            <input disabled value={user.userId} />
            <small>নিরাপত্তার জন্য User ID পরিবর্তন করা যাবে না।</small>
          </div>
          <div className="auth-field profile-protected">
            <span>ইমেইল</span>
            <input disabled value={user.email} />
            <small>ইমেইল পরিবর্তনের সুবিধা বর্তমানে নেই।</small>
          </div>
          <AuthField autoComplete="tel" error={fieldErrors.phone} label="মোবাইল নম্বর" name="phone" onChange={update} required type="tel" value={values.phone} />
          <AuthSelect error={fieldErrors.bloodGroup} label="রক্তের গ্রুপ" name="bloodGroup" onChange={update} required value={values.bloodGroup}>
            <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
            {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
          </AuthSelect>
          <AuthSelect error={fieldErrors.division} label="বিভাগ" name="division" onChange={update} required value={values.division}>
            <option value="">বিভাগ নির্বাচন করুন</option>
            {bangladeshDivisions.map((division) => <option key={division} value={division}>{division}</option>)}
          </AuthSelect>
          <AuthSelect disabled={!values.division} error={fieldErrors.district} label="জেলা" name="district" onChange={update} required value={values.district}>
            <option value="">{values.division ? 'জেলা নির্বাচন করুন' : 'আগে বিভাগ নির্বাচন করুন'}</option>
            {(bangladeshLocations[values.division] || []).map((district) => <option key={district} value={district}>{district}</option>)}
          </AuthSelect>
          <AuthField autoComplete="address-line1" error={fieldErrors.location} label="এলাকা / অবস্থান" maxLength={100} name="location" onChange={update} required value={values.location} />
          <label className="auth-checkbox">
            <input checked={values.isDonorAvailable} name="isDonorAvailable" onChange={update} type="checkbox" />
            <span>আমি বর্তমানে রক্তদানে প্রস্তুত।</span>
          </label>
          <label className="auth-checkbox">
            <input checked={values.isSearchable} name="isSearchable" onChange={update} type="checkbox" />
            <span>আমার পরিচিতিমূলক তথ্য donor search-এ প্রকাশে সম্মতি দিচ্ছি।</span>
          </label>
          <button className="auth-submit" disabled={saving} type="submit">
            {saving ? 'সংরক্ষণ হচ্ছে…' : 'পরিবর্তন সংরক্ষণ'}
          </button>
          <button className="auth-secondary" disabled={saving} onClick={cancelEdit} type="button">বাতিল</button>
        </form>
      ) : (
        <>
          <dl className="profile-details">
            <div><dt>User ID</dt><dd>{user.userId}</dd></div>
            <div><dt>ইমেইল</dt><dd>{user.email}</dd></div>
            <div><dt>মোবাইল</dt><dd>{user.phone}</dd></div>
            <div><dt>রক্তের গ্রুপ</dt><dd>{user.bloodGroup}</dd></div>
            <div><dt>বিভাগ / জেলা</dt><dd>{user.division}, {user.district}</dd></div>
            <div><dt>এলাকা</dt><dd>{user.location || 'উল্লেখ করা হয়নি'}</dd></div>
            <div><dt>দাতা availability</dt><dd>{user.isDonorAvailable ? 'রক্তদানে প্রস্তুত' : 'এই মুহূর্তে প্রস্তুত নন'}</dd></div>
            <div><dt>সার্চে দৃশ্যমানতা</dt><dd>{user.isSearchable ? 'সম্মত — পাবলিক তথ্য দেখা যাবে' : 'অসম্মত — সার্চে দেখা যাবে না'}</dd></div>
          </dl>
          <div className="profile-actions">
            <button className="auth-submit" onClick={() => { setEditing(true); setSuccess('') }} type="button">প্রোফাইল সম্পাদনা</button>
            <button className="auth-secondary" disabled={logoutLoading} onClick={handleLogout} type="button">
              {logoutLoading ? 'লগ আউট হচ্ছে…' : 'লগ আউট'}
            </button>
          </div>
        </>
      )}
      <p className="auth-switch"><Link to="/">মূল পাতায় ফিরুন</Link></p>
    </AuthLayout>
  )
}

export default DashboardPage
