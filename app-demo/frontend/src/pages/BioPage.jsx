import { useNavigate } from 'react-router-dom'

const CV_PATH = '/assets/cv-olivier-labe.pdf'

const s = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    background: 'none',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '0',
  },
  content: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '64px 48px 80px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(34,211,238,0.1)',
    border: '1px solid rgba(34,211,238,0.3)',
    borderRadius: '20px',
    padding: '4px 14px',
    fontSize: '0.78rem',
    color: '#22d3ee',
    marginBottom: '20px',
    letterSpacing: '0.03em',
  },
  h1: {
    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  role: {
    color: '#6366f1',
    fontWeight: 600,
    marginBottom: '44px',
    fontSize: '1rem',
  },
  langLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#475569',
    marginBottom: '14px',
  },
  bioBlock: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    lineHeight: 1.85,
    marginBottom: '36px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '36px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
  },
  dividerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#334155',
  },
  ctaRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '48px',
  },
  cvBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#818cf8',
    borderRadius: '10px',
    padding: '12px 22px',
    fontSize: '0.9rem',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  contactBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#94a3b8',
    borderRadius: '10px',
    padding: '12px 22px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    fontFamily: 'inherit',
  },
}

export default function BioPage() {
  const navigate = useNavigate()

  return (
    <div style={s.wrapper}>
      <style>{`
        .back-btn:hover { color: #f8fafc !important; }
        .cv-btn:hover {
          background: rgba(99,102,241,0.25) !important;
          border-color: #6366f1 !important;
          color: #fff !important;
        }
        .contact-btn:hover {
          border-color: rgba(99,102,241,0.4) !important;
          color: #f8fafc !important;
        }
      `}</style>

      <nav style={s.nav}>
        <span style={s.navBrand}>oldevops.fr</span>
        <button className="back-btn" style={s.backBtn} onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Retour à l'accueil
        </button>
      </nav>

      <div style={s.content}>
        <div style={s.badge}>À propos</div>
        <h1 style={s.h1}>Olivier Labé</h1>
        <p style={s.role}>SysOps DevOps · Infrastructure as Code · Cloud</p>

        {/* French */}
        <p style={s.langLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          Français
        </p>
        <p style={s.bioBlock}>
          Après 20 ans dans la musique classique, j'ai eu envie de poser mes valises... Découvrir un nouvel
          univers, une nouvelle partition, cette fois-ci numérique. Après une reconversion rapide, une bonne
          étoile m'a permis de rencontrer les bonnes personnes qui m'accompagnent aujourd'hui dans ce nouvel
          univers digital. L'apprentissage est quotidien, la pente est parfois raide mais l'entraide et la
          bienveillance dans ce milieu sont toujours au rendez-vous. N'hésitez pas à prendre contact pour
          échanger ! Tout retour sur cette page est bon à prendre.
        </p>

        {/* Divider */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <div style={s.dividerDot} />
          <div style={s.dividerLine} />
        </div>

        {/* English */}
        <p style={s.langLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          English
        </p>
        <p style={s.bioBlock}>
          After 20 years in classical music, I felt the need to settle down... to discover a new world,
          a new score — this time, a digital one. After a swift career change, a lucky star led me to meet
          the right people who now accompany me in this exciting digital journey. Learning is part of my
          everyday life; the slope can be steep at times, but mutual support and kindness are always there
          along the way.
          <br /><br />
          Feel free to get in touch to exchange ideas! Any feedback on this page is more than welcome.
        </p>

        {/* CTAs */}
        <div style={s.ctaRow}>
          <a href={CV_PATH} download="CV-Olivier-Labe.pdf" className="cv-btn" style={s.cvBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Télécharger le CV (PDF)
          </a>
          <button className="contact-btn" style={s.contactBtn} onClick={() => navigate('/contact')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Me contacter
          </button>
        </div>
      </div>
    </div>
  )
}
