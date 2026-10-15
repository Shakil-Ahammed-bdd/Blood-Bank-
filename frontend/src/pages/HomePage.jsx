import BloodGroups from '../components/landing/BloodGroups'
import BloodRequest from '../components/landing/BloodRequest'
import BloodSearch from '../components/landing/BloodSearch'
import RecentDonors from '../components/landing/RecentDonors'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import ImpactStats from '../components/landing/ImpactStats'

function HomePage() {
  return (
    <main>
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
