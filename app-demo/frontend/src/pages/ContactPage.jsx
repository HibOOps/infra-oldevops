import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CONTACT_EMAIL = 'olivier.labe@oldevops.fr'

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
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
  },
  card: {
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '44px 40px',
    width: '100%',
    maxWidth: '520px',
    backdropFilter: 'blur(16px)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '20px',
    padding: '4px 14px',
    fontSize: '0.78rem',
    color: '#818cf8',
    marginBottom: '16px',
    letterSpacing: '0.02em',
  },
  h2: {
    fontSize: '1.8rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: '6px',
    color: '#f8fafc',
  },
  sub: {
    color: '#64748b',
    fontSize: '0.88rem',
    marginBottom: '32px',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 500,
    color: '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'inherit',
    boxShadow: '0 0 20px rgba(99,102,241,0.3)',
  },
  successBox: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '10px',
    padding: '16px 20px',
    color: '#10b981',
    fontSize: '0.9rem',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerLink: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
}

export default function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const { email, subject, message } = form
    const body = `De : ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`
    window.open(mailtoUrl, '_blank')
    setSent(true)
  }

  return (
    <div style={s.wrapper}>
      <style>{`
        .back-btn:hover { color: #f8fafc !important; }
        .contact-input:focus, .contact-textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 32px rgba(99,102,241,0.5) !important;
        }
      `}</style>

      <nav style={s.nav}>
        <span style={s.navBrand}>oldevops.fr</span>
        <button
          className="back-btn"
          style={s.backBtn}
          onClick={() => navigate('/')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Retour à l'accueil
        </button>
      </nav>

      <main style={s.main}>
        <div style={s.card}>
          <div style={s.badge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Me contacter
          </div>

          <h2 style={s.h2}>Prendre contact</h2>
          <p style={s.sub}>Je réponds généralement sous 24h — {CONTACT_EMAIL}</p>

          <form onSubmit={handleSubmit}>
            <div style={s.formGroup}>
              <label style={s.label} htmlFor="contact-email">Votre email</label>
              <input
                id="contact-email"
                className="contact-input"
                style={s.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@exemple.fr"
                required
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label} htmlFor="contact-subject">Objet</label>
              <input
                id="contact-subject"
                className="contact-input"
                style={s.input}
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Objet de votre message"
                required
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label} htmlFor="contact-message">Votre message</label>
              <textarea
                id="contact-message"
                className="contact-textarea"
                style={s.textarea}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Bonjour Olivier, ..."
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              style={s.submitBtn}
            >
              Envoyer le message
            </button>
          </form>

          {sent && (
            <div style={s.successBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Votre client mail a été ouvert — merci pour votre message !
            </div>
          )}

          <div style={s.footerLink}>
            <button
              className="back-btn"
              style={{ ...s.backBtn, marginTop: '12px' }}
              onClick={() => navigate('/')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
