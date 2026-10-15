import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DonorsPage from './pages/DonorsPage'
import DonorProfilePage from './pages/DonorProfilePage'
import Navbar from './components/Navbar'

function LandingPage() {
  return (
    <AppLayout>
      <Navbar />
      <HomePage />
    </AppLayout>
  )
}

function DonorDirectoryRoute() {
  return (
    <AppLayout>
      <Navbar />
      <DonorsPage />
    </AppLayout>
  )
}

function DonorProfileRoute() {
  return (
    <AppLayout>
      <Navbar />
      <DonorProfilePage />
    </AppLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<LandingPage />} path="/" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<DonorDirectoryRoute />} path="/donors" />
          <Route element={<DonorProfileRoute />} path="/donors/:id" />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardPage />} path="/dashboard" />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
