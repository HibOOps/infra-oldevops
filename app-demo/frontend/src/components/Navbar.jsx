import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Produits' },
  { to: '/prices', label: 'Prix' },
  { to: '/rules', label: 'Règles' },
  { to: '/history', label: 'Historique' },
]

const desktopLinkStyle = ({ isActive }) => ({
  color: isActive ? '#818cf8' : '#94a3b8',
  textDecoration: 'none',
  padding: '0 14px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.9rem',
  fontWeight: isActive ? 600 : 400,
  borderBottom: isActive ? '2px solid #818cf8' : '2px solid transparent',
  whiteSpace: 'nowrap',
})

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef(null)

  function handleLogout() {
    onLogout()
    setIsOpen(false)
    navigate('/login')
  }

  function handleLinkClick() {
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return
    function handleOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen])

  return (
    <nav
      ref={navRef}
      style={{
        background: '#1e293b',
        color: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '1.1rem', marginRight: '32px', color: '#e2e8f0', flexShrink: 0 }}>
        🏷️ PriceSync
      </span>

      {/* Desktop links */}
      <div className="navbar-desktop-links">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={desktopLinkStyle}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Desktop user */}
      <div className="navbar-desktop-user">
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

      {/* Hamburger button */}
      <button
        className="navbar-hamburger"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Menu de navigation"
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown panel */}
      {isOpen && (
        <div className="navbar-mobile-panel">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => 'navbar-mobile-link' + (isActive ? ' active' : '')}
              style={{ fontFamily: 'inherit' }}
              onClick={handleLinkClick}
            >
              {label}
            </NavLink>
          ))}
          <div className="navbar-mobile-user">
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user?.name}</span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #475569',
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                minHeight: '44px',
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
