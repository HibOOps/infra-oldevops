import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import PricesPage from './pages/PricesPage'
import RulesPage from './pages/RulesPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  const { token, user, login, logout, isAuthenticated } = useAuth()

  return (
    <>
      {isAuthenticated && <Navbar user={user} onLogout={logout} />}
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/" element={
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
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </>
  )
}
