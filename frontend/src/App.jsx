import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import EntryCreatePage from './pages/EntryCreatePage'
import AnalyticsPage from './pages/AnalyticsPage'
import ManagementPage from './pages/ManagementPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/entries/new" element={<EntryCreatePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/management" element={<ManagementPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App