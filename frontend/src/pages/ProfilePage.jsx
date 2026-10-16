import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import AuthSelect from '../components/auth/AuthSelect'
import { useAuth } from '../contexts/useAuth'
import { profileApi } from '../services/api/profileApi'
import { experienceApi } from '../services/api/experienceApi'
import { bangladeshDivisions, bangladeshLocations } from '../utils/bangladeshLocations'
import DonorExperienceCard from '../components/landing/DonorExperienceCard'

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

function ProfilePage() {
  const { deleteAccount, user, logout, updateUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [values, setValues] = useState(() => editableValues(user))
  const [editing, setEditing] = useState(() => new URLSearchParams(location.search).get('edit') === '1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [experiences, setExperiences] = useState([])
  const [experiencesLoading, setExperiencesLoading] = useState(true)
  const [photoLoading, setPhotoLoading] = useState(false)
  const editRequested = new URLSearchParams(location.search).get('edit') === '1'

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
    experienceApi.mine().then(
      ({ experiences: posts }) => {
        if (active) setExperiences(posts)
      },
      (requestError) => {
        if (active) setError(requestError.message)
      },
    ).finally(() => {
      if (active) setExperiencesLoading(false)
    })
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

  async function updateProfilePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('প্রোফাইল ছবির আকার সর্বোচ্চ ৫ MB হতে হবে।')
      return
    }
    setPhotoLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const { user: profile } = await profileApi.updatePhoto(formData)
      updateUser(profile)
      setSuccess('প্রোফাইল ছবি সফলভাবে হালনাগাদ হয়েছে।')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPhotoLoading(false)
    }
  }

  function validate() {
    const errors = {}
    if (values.fullName.trim().length < 2 || values.fullName.trim().length > 100) {
      errors.fullName = 'নাম ২ থেকে ১০০ অক্ষরের মধ্যে লিখুন।'
    }
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(values.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।'
    }
    if (!bloodGroups.includes(values.bloodGroup)) errors.bloodGroup = 'রক্তের গ্রুপ নির্বাচন করুন।'
    if (!bangladeshDivisions.includes(values.division)) errors.division = 'বিভাগ নির্বাচন করুন।'
    if (!values.district || !(bangladeshLocations[values.division] || []).includes(values.district)) {
      errors.district = 'বিভাগের অন্তর্গত জেলা নির্বাচন করুন।'
    }
    if (values.location.trim().length < 2 || values.location.trim().length > 100) {
      errors.location = 'এলাকার নাম ২ থেকে ১০০ অক্ষরের মধ্যে লিখুন।'
    }
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
      navigate('/profile', { replace: true })
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
    navigate('/profile', { replace: true })
  }

  async function handleLogout() {
    setLogoutLoading(true)
    setError('')
    try {
      await logout()
      navigate('/', { replace: true, state: { notice: 'আপনি সফলভাবে লগ আউট করেছেন।' } })
    } catch (logoutError) {
      setError(logoutError.message)
      setLogoutLoading(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'আপনার অ্যাকাউন্ট এবং প্রোফাইলের সব তথ্য স্থায়ীভাবে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না। আপনি কি নিশ্চিত?',
    )
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      await deleteAccount()
      navigate('/', { replace: true, state: { notice: 'আপনার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।' } })
    } catch (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
    }
  }

  async function handleDeleteExperience(experience) {
    if (!window.confirm('আপনি কি এই রক্তদানের গল্পটি মুছে ফেলতে চান?')) return
    setError('')
    try {
      await experienceApi.delete(experience.id)
      const { experiences: posts } = await experienceApi.mine()
      setExperiences(posts)
      setSuccess('আপনার অনুভূতি মুছে ফেলা হয়েছে।')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <AuthLayout
      eyebrow="ব্যক্তিগত প্রোফাইল"
      subtitle="আপনার ব্যক্তিগত তথ্য ও donor-search সম্মতি দেখুন বা হালনাগাদ করুন।"
      title={`স্বাগতম, ${user.fullName}`}
    >
      {location.state?.message && <p className="auth-success">{location.state.message}</p>}
      {success && <p aria-live="polite" className="auth-success" role="status">{success}</p>}
      {error && <p aria-live="polite" className="auth-alert" role="alert">{error}</p>}
      {loading ? (
        <p className="profile-loading" role="status">প্রোফাইল লোড হচ্ছে…</p>
      ) : editing || editRequested ? (
        <form className="auth-form profile-edit-form" noValidate onSubmit={saveProfile}>
          <AuthField autoComplete="name" error={fieldErrors.fullName} label="পূর্ণ নাম" maxLength={100} name="fullName" onChange={update} required value={values.fullName} />
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
          <AuthField autoComplete="tel" error={fieldErrors.phone} label="মোবাইল নম্বর" maxLength={16} name="phone" onChange={update} required type="tel" value={values.phone} />
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
          <div className="profile-avatar-editor">
            <span aria-hidden="true" className="donor-avatar profile-avatar-large">
              {user.profilePhotoUrl
                ? <img alt="" src={user.profilePhotoUrl} />
                : user.fullName.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join('')}
            </span>
            <label className="button button-secondary">
              {photoLoading ? 'ছবি আপলোড হচ্ছে…' : 'প্রোফাইল ছবি পরিবর্তন'}
              <input accept="image/jpeg,image/jpg,image/png,image/webp" disabled={photoLoading} onChange={updateProfilePhoto} type="file" />
            </label>
          </div>
          <dl className="profile-details">
            <div><dt>পূর্ণ নাম</dt><dd>{user.fullName}</dd></div>
            <div><dt>User ID</dt><dd>{user.userId}</dd></div>
            <div><dt>ইমেইল</dt><dd>{user.email}</dd></div>
            <div><dt>মোবাইল</dt><dd>{user.phone}</dd></div>
            <div><dt>রক্তের গ্রুপ</dt><dd>{user.bloodGroup}</dd></div>
            <div><dt>বিভাগ</dt><dd>{user.division}</dd></div>
            <div><dt>জেলা</dt><dd>{user.district}</dd></div>
            <div><dt>এলাকা</dt><dd>{user.location || 'উল্লেখ করা হয়নি'}</dd></div>
            <div><dt>দাতা availability</dt><dd>{user.isDonorAvailable ? 'রক্তদানে প্রস্তুত' : 'এই মুহূর্তে প্রস্তুত নন'}</dd></div>
            <div><dt>সার্চে দৃশ্যমানতা</dt><dd>{user.isSearchable ? 'সম্মত — পাবলিক তথ্য দেখা যাবে' : 'অসম্মত — সার্চে দেখা যাবে না'}</dd></div>
            <div><dt>পাবলিক যোগাযোগ</dt><dd>ইমেইল ও ফোন নম্বর অন্যদের দেখানো হয় না।</dd></div>
            <div><dt>নিবন্ধনের তারিখ</dt><dd>{user.createdAt ? new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium' }).format(new Date(user.createdAt)) : 'উপলভ্য নয়'}</dd></div>
          </dl>
          <div className="profile-actions">
            <button className="auth-submit" onClick={() => { setEditing(true); setSuccess('') }} type="button">প্রোফাইল সম্পাদনা</button>
            <button className="auth-secondary" disabled={logoutLoading} onClick={handleLogout} type="button">
              {logoutLoading ? 'লগ আউট হচ্ছে…' : 'লগ আউট'}
            </button>
            <button className="auth-danger" disabled={deleting} onClick={handleDeleteAccount} type="button">
              {deleting ? 'অ্যাকাউন্ট মুছে ফেলা হচ্ছে…' : 'অ্যাকাউন্ট মুছে ফেলুন'}
            </button>
          </div>
          <section aria-labelledby="my-experiences-heading" className="profile-experiences">
            <div className="profile-experiences-heading">
              <div>
                <span className="section-kicker">আপনার রক্তদানের গল্প</span>
                <h2 id="my-experiences-heading">আমার অনুভূতি</h2>
              </div>
              <Link className="button button-secondary" to="/donor-experiences">পোস্ট পরিচালনা</Link>
            </div>
            {experiencesLoading && <p role="status">আপনার পোস্ট লোড হচ্ছে…</p>}
            {!experiencesLoading && experiences.length === 0 && (
              <p>এখনও কোনো অনুভূতি শেয়ার করেননি। <Link to="/donor-experiences">আপনার গল্প শেয়ার করুন</Link></p>
            )}
            {!experiencesLoading && experiences.length > 0 && (
              <div className="experience-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {experiences.map((post) => (
                  <DonorExperienceCard
                    experience={post}
                    key={`${post.id}:${post.updatedAt}:${post.reactionCount}:${post.commentCount}:${post.currentReaction}`}
                    onDelete={handleDeleteExperience}
                    onEdit={(experience) => navigate(`/donor-experiences?edit=${encodeURIComponent(experience.id)}`)}
                    owner
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <p className="auth-switch"><Link to="/">মূল পাতায় ফিরুন</Link></p>
    </AuthLayout>
  )
}

export default ProfilePage
