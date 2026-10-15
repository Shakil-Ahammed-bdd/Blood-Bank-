import { Link } from 'react-router-dom'

function AuthLayout({ children, eyebrow, subtitle, title }) {
  return (
    <main className="auth-page">
      <section aria-labelledby="auth-title" className="auth-card">
        <Link aria-label="আহ্বান রক্তদান সংস্থা — হোমে ফিরুন" className="auth-brand" to="/">
          <img alt="" height="48" src="/images/ahoban-logo.png" width="48" />
          <span><strong>আহ্বান</strong><small>রক্তদান সংস্থা</small></span>
        </Link>
        <div className="auth-heading">
          <span className="auth-eyebrow">{eyebrow}</span>
          <h1 id="auth-title">{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
      <p className="auth-footer">স্বেচ্ছায় রক্তদান, মানবতার বন্ধন</p>
    </main>
  )
}

export default AuthLayout
