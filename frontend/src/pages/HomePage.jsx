import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import BloodGroups from '../components/landing/BloodGroups'
import BloodRequest from '../components/landing/BloodRequest'
import BloodSearch from '../components/landing/BloodSearch'
import RecentDonors from '../components/landing/RecentDonors'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import ImpactStats from '../components/landing/ImpactStats'

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearNotice, notice: authNotice } = useAuth()
  const notice = location.state?.notice || authNotice

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => {
      if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
      clearNotice()
    }, 6000)
    return () => window.clearTimeout(timeout)
  }, [clearNotice, location.pathname, location.state, navigate, notice])

  return (
    <main>
      {notice && <p aria-live="polite" className="home-notice" role="status">{notice}</p>}
      <Hero />
      <BloodSearch />
      <RecentDonors />
      <BloodRequest />
      <HowItWorks />
      <BloodGroups />
      <ImpactStats />
    </main>
  )
}

export default HomePage
