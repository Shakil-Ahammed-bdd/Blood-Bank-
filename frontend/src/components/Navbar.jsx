import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const links = [
  { label: 'হোম', href: '#home' },
  { label: 'আমাদের সম্পর্কে', href: '#about' },
  { label: 'রক্ত খুঁজুন', href: '#find-blood' },
  { label: 'দাতা নিবন্ধন', href: '/register' },
  { label: 'রক্তের আবেদন', href: '#blood-request' },
  { label: 'যোগাযোগ', href: '#contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const homeHref = location.pathname === '/' ? '#home' : '/#home'

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <a
          aria-label="আহ্বান রক্তদান সংস্থা — হোম"
          className="brand"
          href={homeHref}
          onClick={closeMenu}
        >
          <span className="brand-mark">
            <img
              alt=""
              className="brand-logo"
              height="52"
              src="/images/ahoban-logo.png"
              width="52"
            />
          </span>
          <span className="brand-name">
            <span>আহ্বান</span>
            <span>রক্তদান সংস্থা</span>
          </span>
        </a>

        <nav
          aria-label="প্রধান নেভিগেশন"
          className={`primary-nav${menuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
        >
          {links.map((link) => (
            <a
              className="nav-link"
              href={
                location.pathname === '/' || link.href.startsWith('/')
                  ? link.href
                  : `/${link.href}`
              }
              key={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
          <a
            className="nav-donate mobile-donate"
            href="/register"
            onClick={closeMenu}
          >
            রক্ত দান করুন <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <a className="nav-donate desktop-donate" href="/register">
          রক্ত দান করুন <span aria-hidden="true">↗</span>
        </a>

        <button
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
          className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default Navbar
