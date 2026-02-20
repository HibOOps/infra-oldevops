import { NavLink, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  function handleLogout() {
    onLogout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#1e293b',
      color: '#fff',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      height: '56px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <span style={{ fontWeight: 700, fontSize: '1.1rem', marginRight: '32px', color: '#e2e8f0' }}>
        🏷️ PriceSync
      </span>
      {[
        { to: '/', label: 'Dashboard' },
        { to: '/products', label: 'Produits' },
        { to: '/prices', label: 'Prix' },
        { to: '/rules', label: 'Règles' },
        { to: '/history', label: 'Historique' },
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            color: isActive ? '#818cf8' : '#94a3b8',
            textDecoration: 'none',
            padding: '0 14px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            fontWeight: isActive ? 600 : 400,
            borderBottom: isActive ? '2px solid #818cf8' : '2px solid transparent',
          })}
        >
          {label}
        </NavLink>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user?.name}</span>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid #475569',
            color: '#94a3b8',
            borderRadius: '6px',
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
