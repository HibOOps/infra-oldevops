import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import BioPage from './pages/BioPage'
import ContactPage from './pages/ContactPage'
import PortfolioPage from './pages/PortfolioPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import PricesPage from './pages/PricesPage'
import RulesPage from './pages/RulesPage'
import HistoryPage from './pages/HistoryPage'

const PUBLIC_PATHS = ['/', '/bio', '/contact', '/portfolio', '/login']

export default function App() {
  const { token, user, login, logout, isAuthenticated } = useAuth()
  const location = useLocation()

  const showNavbar = isAuthenticated && !PUBLIC_PATHS.includes(location.pathname)

  return (
    <>
      {showNavbar && <Navbar user={user} onLogout={logout} />}
      <Routes>
        {/* Public pages */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/bio"       element={<BioPage />} />
        <Route path="/contact"   element={<ContactPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/login"     element={<LoginPage onLogin={login} />} />

        {/* Protected PriceSync app */}
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardPage token={token} />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ProductsPage token={token} />
          </ProtectedRoute>
        } />
        <Route path="/prices" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PricesPage token={token} />
          </ProtectedRoute>
        } />
        <Route path="/rules" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <RulesPage token={token} />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <HistoryPage token={token} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
      </Routes>
    </>
  )
}
