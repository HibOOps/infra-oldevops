import { useNavigate } from 'react-router-dom'

const GITHUB_URL = 'https://github.com/HibOOps'
const GITHUB_REPO_URL = 'https://github.com/HibOOps/Infra-oldevops'
const LINKEDIN_URL = 'https://www.linkedin.com/in/olivier-labe/'

const s = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 48px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(15,23,42,0.7)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    fontFamily: 'inherit',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 80px',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: '20px',
    padding: '4px 14px',
    fontSize: '0.8rem',
    color: '#818cf8',
    marginBottom: '28px',
    letterSpacing: '0.02em',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#22d3ee',
    display: 'inline-block',
  },
  h1: {
    fontSize: 'clamp(3rem, 7vw, 5rem)',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #f8fafc 20%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '44px',
  },
  ctaRow: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 0 28px rgba(99,102,241,0.4)',
    fontFamily: 'inherit',
  },
  footer: {
    padding: '18px 48px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#475569',
    fontSize: '0.78rem',
  },
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={s.wrapper}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .home-badge-dot { animation: pulse 2s infinite; }
        .home-hero { animation: fadeUp 0.6s ease both; }
        .nav-btn:hover {
          background: rgba(99,102,241,0.12) !important;
          border-color: rgba(99,102,241,0.5) !important;
          color: #f8fafc !important;
        }
        .nav-btn-linkedin:hover {
          background: rgba(0,119,181,0.12) !important;
          border-color: rgba(0,119,181,0.5) !important;
          color: #38bdf8 !important;
        }
        .nav-btn-github:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.25) !important;
          color: #f8fafc !important;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(99,102,241,0.65) !important;
        }
        .home-footer-link { color: #475569; text-decoration: none; }
        .home-footer-link:hover { color: #94a3b8; }
      `}</style>

      <nav style={s.nav}>
        <span style={s.navBrand}>oldevops.fr</span>

        <div style={s.navRight}>
          {/* Bio */}
          <button
            className="nav-btn"
            style={s.navBtn}
            onClick={() => navigate('/bio')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Bio
          </button>

          {/* Contact */}
          <button
            className="nav-btn"
            style={s.navBtn}
            onClick={() => navigate('/contact')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Contact
          </button>

          {/* LinkedIn */}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn nav-btn-linkedin"
            style={s.navBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
            LinkedIn
          </a>

          {/* GitHub */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn nav-btn-github"
            style={s.navBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      <section style={s.hero} className="home-hero">
        <div style={s.badge}>
          <span className="home-badge-dot" style={s.dot} />
          SysOps DevOps
        </div>

        <h1 style={s.h1}>Olivier Labé</h1>

        <p style={s.subtitle}>Infrastructure as Code · CI/CD · Monitoring · Cloud</p>

        <div style={s.ctaRow}>
          <button
            className="btn-primary"
            style={s.btnPrimary}
            onClick={() => navigate('/portfolio')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            Portfolio DevOps
          </button>
        </div>
      </section>

      <footer style={s.footer}>
        <span>© 2026 Olivier Labé — oldevops.fr</span>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="home-footer-link"
        >
          Source sur GitHub
        </a>
      </footer>
    </div>
  )
}
