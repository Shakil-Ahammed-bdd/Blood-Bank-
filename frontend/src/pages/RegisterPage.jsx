import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import AuthSelect from '../components/auth/AuthSelect'
import { useAuth } from '../contexts/useAuth'
import { bangladeshDivisions, bangladeshLocations } from '../utils/bangladeshLocations'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  bloodGroup: '',
  division: '',
  district: '',
  location: '',
  isDonorAvailable: false,
  isSearchable: false,
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

function RegisterPage() {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function update(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'division' ? { district: '' } : {}),
    }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setError('')
  }

  function validate() {
    const errors = {}
    if (values.fullName.trim().length < 2) errors.fullName = 'কমপক্ষে ২ অক্ষরের নাম লিখুন।'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'সঠিক ইমেইল ঠিকানা লিখুন।'
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(values.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।'
    }
    if (!values.bloodGroup) errors.bloodGroup = 'রক্তের গ্রুপ নির্বাচন করুন।'
    if (!values.division) errors.division = 'বিভাগ নির্বাচন করুন।'
    if (!values.district) errors.district = 'জেলা নির্বাচন করুন।'
    if (values.location.trim().length < 2) errors.location = 'আপনার এলাকা লিখুন।'
    if (Array.from(values.password).length < 12) errors.password = 'পাসওয়ার্ড কমপক্ষে ১২ অক্ষরের হতে হবে।'
    if (new TextEncoder().encode(values.password).length > 72) errors.password = 'পাসওয়ার্ড ৭২ UTF-8 বাইটের বেশি হতে পারবে না।'
    if (values.confirmPassword !== values.password) errors.confirmPassword = 'পাসওয়ার্ড দুটি মিলছে না।'
    if (!values.acceptTerms) errors.acceptTerms = 'নিবন্ধনের আগে সম্মতি প্রয়োজন।'
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setLoading(true)
    setError('')
    try {
      const user = await register(values)
      navigate('/', {
        replace: true,
        state: { notice: `নিবন্ধন সফল হয়েছে। আপনার User ID: ${user.userId}` },
      })
    } catch (requestError) {
      setError(requestError.message)
      setFieldErrors(requestError.fieldErrors || {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="নতুন দাতা"
      subtitle="আপনার তথ্য দিয়ে স্বেচ্ছাসেবী রক্তদাতা হিসেবে যুক্ত হোন।"
      title="দাতা নিবন্ধন"
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        {error && <p aria-live="polite" className="auth-alert" role="alert">{error}</p>}
        <AuthField autoComplete="name" error={fieldErrors.fullName} label="পূর্ণ নাম" name="fullName" onChange={update} placeholder="আপনার নাম" required value={values.fullName} />
        <div className="auth-field">
          <label htmlFor="userId-preview">আপনার User ID</label>
          <input disabled id="userId-preview" value="নিবন্ধনের পর স্বয়ংক্রিয়ভাবে তৈরি হবে" />
          <small>নিবন্ধন সফল হলে আপনার অনন্য ID দেখানো হবে।</small>
        </div>
        <AuthField autoComplete="email" error={fieldErrors.email} label="ইমেইল ঠিকানা" name="email" onChange={update} placeholder="name@example.com" required type="email" value={values.email} />
        <AuthField autoComplete="tel" error={fieldErrors.phone} label="মোবাইল নম্বর" name="phone" onChange={update} placeholder="+880 1XXXXXXXXX" required type="tel" value={values.phone} />
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
        <AuthField autoComplete="address-line1" error={fieldErrors.location} label="এলাকা / অবস্থান" maxLength={100} name="location" onChange={update} placeholder="যেমন: ধানমন্ডি, ঢাকা" required value={values.location} />
        <div className="auth-password-field">
          <AuthField autoComplete="new-password" error={fieldErrors.password} label="পাসওয়ার্ড (কমপক্ষে ১২ অক্ষর)" maxLength={72} name="password" onChange={update} required type={showPassword ? 'text' : 'password'} value={values.password} />
          <button aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'} className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} type="button">
            {showPassword ? 'লুকান' : 'দেখুন'}
          </button>
        </div>
        <AuthField autoComplete="new-password" error={fieldErrors.confirmPassword} label="পাসওয়ার্ড নিশ্চিত করুন" maxLength={72} name="confirmPassword" onChange={update} required type={showPassword ? 'text' : 'password'} value={values.confirmPassword} />
        <label className="auth-checkbox">
          <input checked={values.acceptTerms} name="acceptTerms" onChange={update} type="checkbox" />
          <span>আমি শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত।</span>
        </label>
        {fieldErrors.acceptTerms && <small className="field-error">{fieldErrors.acceptTerms}</small>}
        <label className="auth-checkbox">
          <input checked={values.isDonorAvailable} name="isDonorAvailable" onChange={update} type="checkbox" />
          <span>আমি বর্তমানে রক্তদানে প্রস্তুত।</span>
        </label>
        <label className="auth-checkbox">
          <input checked={values.isSearchable} name="isSearchable" onChange={update} type="checkbox" />
          <span>আমার নাম, রক্তের গ্রুপ ও এলাকা পাবলিক donor search-এ দেখাতে সম্মতি দিচ্ছি। যোগাযোগের তথ্য গোপন থাকবে।</span>
        </label>
        <button className="auth-submit" disabled={loading} type="submit">
          {loading ? 'নিবন্ধন হচ্ছে…' : 'নিবন্ধন করুন'}
        </button>
        <p className="auth-switch">আগে থেকেই অ্যাকাউন্ট আছে? <Link to="/login">লগ ইন করুন</Link></p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
