import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

function ProtectedRoute() {
  const { error, refresh, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <main className="auth-loading" aria-live="polite">অ্যাকাউন্ট যাচাই হচ্ছে…</main>
  }
  if (status === 'error') {
    return (
      <main className="auth-loading" role="alert">
        <p>{error.message}</p>
        <button className="auth-submit" onClick={refresh} type="button">আবার চেষ্টা করুন</button>
      </main>
    )
  }
  if (status !== 'authenticated') {
    return <Navigate replace state={{ from: location }} to="/login" />
  }
  return <Outlet />
}

export default ProtectedRoute
