function BloodGroupCard({ group, index }) {
  return (
    <article
      aria-label={`রক্তের গ্রুপ ${group}`}
      className="blood-group-card"
      style={{ '--card-order': index }}
    >
      <span aria-hidden="true" className="group-drop">
        <svg viewBox="0 0 32 38" fill="none">
          <path d="M16 2C11.5 9 5 15.5 5 22a11 11 0 0 0 22 0C27 15.5 20.5 9 16 2Z" fill="currentColor" />
          <path d="M11.5 22c.2 2.5 1.6 4 4 4.7" stroke="white" strokeLinecap="round" strokeWidth="2" opacity=".65" />
        </svg>
      </span>
      <span className="group-label">রক্তের গ্রুপ</span>
      <strong>{group}</strong>
    </article>
  )
}

export default BloodGroupCard
