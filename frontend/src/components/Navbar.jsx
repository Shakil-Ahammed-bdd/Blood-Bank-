import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const links = [
  { label: 'হোম', href: '#home' },
  { label: 'আমাদের সম্পর্কে', href: '#about' },
  { label: 'রক্ত খুঁজুন', href: '#find-blood' },
  { label: 'রক্তের আবেদন', href: '#blood-request' },
  { label: 'রক্তদাতার অনুভূতি', href: '/donor-experiences' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, status, user } = useAuth()
  const authenticated = status === 'authenticated'
  const homeHref = location.pathname === '/' ? '#home' : '/#home'
  const initials = user?.fullName.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join('')

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setProfileOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
    setProfileOpen(false)
  }

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
      closeMenu()
      navigate('/', { replace: true, state: { notice: 'আপনি সফলভাবে লগ আউট করেছেন।' } })
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  function profileLinks(mobile = false) {
    return (
      <>
        <Link className={mobile ? 'nav-link' : 'profile-menu-link'} onClick={closeMenu} role={mobile ? undefined : 'menuitem'} to="/profile">
          My Profile
        </Link>
        <Link className={mobile ? 'nav-link' : 'profile-menu-link'} onClick={closeMenu} role={mobile ? undefined : 'menuitem'} to="/profile?edit=1">
          Edit Profile
        </Link>
        <button className={mobile ? 'nav-link mobile-logout' : 'profile-menu-link profile-menu-logout'} onClick={handleLogout} role={mobile ? undefined : 'menuitem'} type="button">
          Logout
        </button>
      </>
    )
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link
          aria-label="আহ্বান রক্তদান সংস্থা — হোম"
          className="brand"
          onClick={closeMenu}
          to={homeHref}
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
        </Link>

        <nav
          aria-label="প্রধান নেভিগেশন"
          className={`primary-nav${menuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
        >
          {links.map((link) => (
            link.href.startsWith('/') ? (
              <Link className="nav-link" key={link.href} onClick={closeMenu} to={link.href}>
                {link.label}
              </Link>
            ) : (
              <a
                className="nav-link"
                href={location.pathname === '/' ? link.href : `/${link.href}`}
                key={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            )
          ))}
          {authenticated ? (
            <div className="mobile-profile-links">
              <span className="mobile-profile-name">{user.fullName}</span>
              {profileLinks(true)}
              {logoutError && <p className="profile-menu-error" role="alert">{logoutError}</p>}
            </div>
          ) : status === 'unauthenticated' ? (
            <div className="mobile-auth-links">
              <Link className="nav-link" onClick={closeMenu} to="/login">Login</Link>
              <Link className="nav-link" onClick={closeMenu} to="/register">Registration</Link>
            </div>
          ) : null}
          <Link
            className="nav-donate mobile-donate"
            onClick={closeMenu}
            to="/register"
          >
            রক্ত দান করুন <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <div className="desktop-nav-actions">
          <Link
            className="nav-donate desktop-donate"
            to="/register"
          >
            রক্ত দান করুন <span aria-hidden="true">↗</span>
          </Link>
          {authenticated ? (
            <div className="nav-profile">
              <button
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="nav-profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                type="button"
              >
                <span aria-hidden="true" className="nav-avatar">{initials}</span>
                <span className="nav-profile-name">{user.fullName}</span>
                <span aria-hidden="true" className="nav-profile-chevron">⌄</span>
              </button>
              {profileOpen && (
                <div className="profile-menu" role="menu">
                  {profileLinks()}
                  {logoutError && <p className="profile-menu-error" role="alert">{logoutError}</p>}
                </div>
              )}
            </div>
          ) : status === 'unauthenticated' ? (
            <div className="nav-guest-actions">
              <Link className="nav-login-link" to="/login">Login</Link>
              <Link className="nav-register-link" to="/register">Registration</Link>
            </div>
          ) : null}
        </div>

        {authenticated && (
          <button
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            aria-label={`প্রোফাইল মেনু, ${user.fullName}`}
            className="mobile-profile-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true" className="nav-avatar">{initials}</span>
            <span className="mobile-header-name">{user.fullName}</span>
          </button>
        )}

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
