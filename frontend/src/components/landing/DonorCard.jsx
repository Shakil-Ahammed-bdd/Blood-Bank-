import { Link } from 'react-router-dom'

function DonorCard({ donor }) {
  const initials = donor.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join('')
  const registeredAt = donor.createdAt
    ? new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium' }).format(new Date(donor.createdAt))
    : null

  return (
    <article className="donor-card">
      <div className="donor-card-profile">
        <span aria-hidden="true" className="donor-avatar">{initials}</span>
        <div className="donor-card-identity">
          <h3>{donor.fullName}</h3>
          <p className="donor-user-id">User ID: {donor.userId}</p>
          <span className={`donor-availability${donor.isDonorAvailable ? ' is-available' : ''}`}>
            <span aria-hidden="true" className="donor-status-dot" />
            {donor.isDonorAvailable ? 'রক্তদানে প্রস্তুত' : 'এই মুহূর্তে প্রস্তুত নন'}
          </span>
        </div>
      </div>
      <div aria-label={`রক্তের গ্রুপ ${donor.bloodGroup}`} className="donor-group-banner">
        <strong>{donor.bloodGroup}</strong>
        <span>রক্তের গ্রুপ</span>
      </div>
      <dl className="donor-card-details">
        <div><dt>বিভাগ ও জেলা</dt><dd>{donor.division}, {donor.district}</dd></div>
        <div><dt>এলাকা / অবস্থান</dt><dd>{donor.location}</dd></div>
        {registeredAt && <div><dt>নিবন্ধনের তারিখ</dt><dd>{registeredAt}</dd></div>}
      </dl>
      <Link className="donor-profile-button" to={`/donors/${encodeURIComponent(donor.id)}`}>
        প্রোফাইল দেখুন
      </Link>
    </article>
  )
}

export default DonorCard
