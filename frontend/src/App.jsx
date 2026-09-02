import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import EntryCreatePage from './pages/EntryCreatePage'
import EntriesPage from './pages/EntriesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ManagementPage from './pages/ManagementPage'
import LoginPage from './pages/LoginPage'
import AuthProvider from './auth/AuthProvider'
import useAuth from './auth/useAuth'

function AuthenticatedApplication() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" role="status">
        <div className="spinner-border text-primary" aria-label="Anmeldung wird geprüft" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <>
      <Navbar user={user} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/entries/new" element={<EntryCreatePage />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/management" element={<ManagementPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthenticatedApplication />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
