import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { donorApi } from '../services/api/donorApi'

function DonorProfilePage() {
  const { id } = useParams()
  const [state, setState] = useState({ id: null, donor: null, loading: true, error: '' })

  useEffect(() => {
    let active = true
    donorApi.get(id).then(
      ({ donor: profile }) => {
        if (active) setState({ id, donor: profile, loading: false, error: '' })
      },
      (requestError) => {
        if (active) setState({ id, donor: null, loading: false, error: requestError.message })
      },
    )
    return () => { active = false }
  }, [id])

  const current = state.id === id
  const donor = current ? state.donor : null
  const loading = !current || state.loading
  const error = current ? state.error : ''
  const registeredAt = donor?.createdAt
    ? new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium' }).format(new Date(donor.createdAt))
    : null

  return (
    <main className="donor-directory-page">
      <section aria-labelledby="public-donor-profile-title" className="section donor-directory-section">
        <div className="section-container">
          <Link className="donor-directory-back" to="/donors">← সব ডোনার</Link>
          {loading && <p className="donor-directory-state" role="status">প্রোফাইল লোড হচ্ছে…</p>}
          {!loading && error && (
            <div className="donor-directory-state" role="alert">
              <p>এই দাতার পাবলিক প্রোফাইলটি পাওয়া যায়নি অথবা দৃশ্যমান নয়।</p>
              <Link className="button button-secondary" to="/donors">ডোনার তালিকায় ফিরুন</Link>
            </div>
          )}
          {!loading && donor && (
            <article className="public-donor-profile">
              <header className="public-donor-profile-heading">
                <span aria-hidden="true" className="donor-avatar">
                  {donor.fullName.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join('')}
                </span>
                <div>
                  <span className="section-kicker">পাবলিক দাতা প্রোফাইল</span>
                  <h1 id="public-donor-profile-title">{donor.fullName}</h1>
                  <p>User ID: {donor.userId}</p>
                  <span className={`donor-availability${donor.isDonorAvailable ? ' is-available' : ''}`}>
                    <span aria-hidden="true" className="donor-status-dot" />
                    {donor.isDonorAvailable ? 'রক্তদানে প্রস্তুত' : 'এই মুহূর্তে প্রস্তুত নন'}
                  </span>
                </div>
              </header>
              <div aria-label={`রক্তের গ্রুপ ${donor.bloodGroup}`} className="donor-group-banner">
                <strong>{donor.bloodGroup}</strong>
                <span>রক্তের গ্রুপ</span>
              </div>
              <dl className="donor-card-details">
                <div><dt>বিভাগ</dt><dd>{donor.division}</dd></div>
                <div><dt>জেলা</dt><dd>{donor.district}</dd></div>
                <div><dt>এলাকা / অবস্থান</dt><dd>{donor.location}</dd></div>
                {registeredAt && <div><dt>নিবন্ধনের তারিখ</dt><dd>{registeredAt}</dd></div>}
              </dl>
              <p className="public-donor-privacy">
                এই দাতা পাবলিক প্রোফাইল প্রকাশে সম্মতি দিয়েছেন। ব্যক্তিগত যোগাযোগের তথ্য গোপন রাখা হয়েছে।
              </p>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}

export default DonorProfilePage
