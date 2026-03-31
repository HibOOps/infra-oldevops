import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const GITHUB_URL = 'https://github.com/HibOOps'
const GITHUB_REPO_URL = 'https://github.com/HibOOps/Infra-oldevops'
const LINKEDIN_URL = 'https://www.linkedin.com/in/olivier-labe/'

const SERVICES = [
  { icon: '🔀', name: 'Traefik v3',          url: 'proxy.oldevops.fr',      href: 'https://proxy.oldevops.fr',      desc: 'Reverse proxy + SSL wildcard Let\'s Encrypt via DNS-01 OVH' },
  { icon: '📊', name: 'Grafana / Prometheus', url: 'grafana.oldevops.fr',    href: 'https://grafana.oldevops.fr',    desc: 'Dashboards métriques, logs Loki, alerting Alertmanager' },
  { icon: '🔑', name: 'Vaultwarden',          url: 'vault.oldevops.fr',      href: 'https://vault.oldevops.fr',      desc: 'Gestionnaire de mots de passe self-hosted (compatible Bitwarden)' },
  { icon: '🖥️', name: 'Uptime Kuma',          url: 'status.oldevops.fr',     href: 'https://status.oldevops.fr',     desc: 'Monitoring uptime HTTP de tous les services en temps réel' },
  { icon: '📦', name: 'Snipe-IT / NetBox',    url: 'inventory.oldevops.fr',  href: 'https://inventory.oldevops.fr',  desc: 'ITSM : gestion de parc et documentation réseau / DCIM' },
  { icon: '🏃', name: 'GitHub Runner',         url: 'ci-runner (LXC .210)',   href: null,                             desc: 'Runner CI/CD auto-hébergé sur LXC dédié (Debian 12 / Docker)' },
  { icon: '🐙', name: 'Forgejo',               url: 'git.oldevops.fr',        href: 'https://git.oldevops.fr',        desc: 'Forge Git self-hosted — miroir de l\'infra, CI et gestion des dépôts' },
]

const TECH_STACK = [
  { label: 'Infrastructure', pills: [
    { text: 'Proxmox VE 8', accent: 'indigo' },
    { text: 'LXC', accent: 'indigo' },
    { text: 'Debian 12', accent: 'indigo' },
    { text: 'Docker CE 25', accent: 'indigo' },
  ]},
  { label: 'IaC & Automatisation', pills: [
    { text: 'Terraform 1.7+', accent: 'cyan' },
    { text: 'Ansible 2.10+', accent: 'cyan' },
    { text: 'Ansible Vault AES-256', accent: 'cyan' },
    { text: 'OVH S3 (tfstate)', accent: 'cyan' },
  ]},
  { label: 'CI/CD & Sécurité', pills: [
    { text: 'GitHub Actions', accent: 'default' },
    { text: 'Self-hosted Runner', accent: 'default' },
    { text: 'Trivy', accent: 'default' },
    { text: 'tfsec', accent: 'default' },
    { text: 'Fail2ban', accent: 'default' },
    { text: 'UFW', accent: 'default' },
  ]},
  { label: 'Observabilité', pills: [
    { text: 'Prometheus', accent: 'green' },
    { text: 'Grafana 10', accent: 'green' },
    { text: 'Loki', accent: 'green' },
    { text: 'Uptime Kuma', accent: 'green' },
  ]},
  { label: 'App PriceSync', pills: [
    { text: 'Node.js 20', accent: 'indigo' },
    { text: 'React 18 / Vite', accent: 'indigo' },
    { text: 'PostgreSQL 16', accent: 'indigo' },
    { text: 'Prisma ORM', accent: 'indigo' },
    { text: 'JWT / Zod', accent: 'indigo' },
  ]},
]

const METRICS = [
  { value: '6', label: 'Containers LXC', color: '#6366f1' },
  { value: '11+', label: 'Services en production', color: '#6366f1' },
  { value: '4', label: 'Workflows CI/CD', color: '#22d3ee' },
  { value: '<10min', label: 'Temps de déploiement', color: '#22d3ee' },
  { value: '99.9%', label: 'Uptime cible', color: '#10b981' },
  { value: '60%+', label: 'Couverture de tests', color: '#10b981' },
]

const PIPELINE_STEPS = [
  { label: 'PR ouverte', icon: '📝' },
  { label: 'fmt / validate', icon: '✅' },
  { label: 'tfsec', icon: '🔍' },
  { label: 'lint + tests', icon: '🧪' },
]
const PIPELINE_DEPLOY = [
  { label: 'Build Docker', icon: '🐳' },
  { label: 'Push ghcr.io', icon: '📦' },
  { label: 'Trivy scan', icon: '🛡️' },
  { label: 'SSH Deploy', icon: '🚀' },
  { label: 'Health check', icon: '❤️' },
]

const TIMELINE = [
  { date: 'Jan 2026', label: 'Fondations', desc: 'Proxmox + Terraform LXC + Ansible base', color: '#6366f1' },
  { date: 'Fév 2026', label: 'Services', desc: 'Traefik SSL, Vault, Snipe-IT, NetBox', color: '#6366f1' },
  { date: 'Fév 2026', label: 'App PriceSync', desc: 'API REST + React + PostgreSQL + Tests', color: '#22d3ee' },
  { date: 'Fév 2026', label: 'CI/CD', desc: 'GitHub Actions, Docker, Trivy, déploiement SSH', color: '#22d3ee' },
  { date: 'Mar 2026', label: 'Observabilité', desc: 'Prometheus, Grafana, Loki, Alertmanager', color: '#10b981' },
  { date: 'Mar 2026', label: 'Portfolio', desc: 'Documentation, README, vitrine professionnelle', color: '#10b981' },
  { date: 'Mar 2026', label: 'Forgejo', desc: 'Forge Git self-hosted, miroir infra + SSH LAN', color: '#10b981' },
]


function pillStyle(accent) {
  const map = {
    indigo:  { background: 'rgba(99,102,241,0.1)',  border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' },
    cyan:    { background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' },
    green:   { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' },
    default: { background: '#1e293b',               border: '1px solid #334155',              color: '#cbd5e1' },
  }
  return {
    ...map[accent],
    borderRadius: '20px',
    padding: '5px 14px',
    fontSize: '0.8rem',
    display: 'inline-block',
  }
}

export default function PortfolioPage() {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState('loading')
  const [navOpen, setNavOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.ok ? setApiStatus('online') : setApiStatus('degraded'))
      .catch(() => setApiStatus('offline'))
  }, [])

  useEffect(() => {
    if (!navOpen) return
    function handleOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [navOpen])

  return (
    <div style={{ background: '#0f172a', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .port-nav-back:hover { color: #f8fafc !important; }
        .port-nav-link:hover { color: #f8fafc !important; }
        .port-nav-gh:hover   { border-color: #6366f1 !important; color: #f8fafc !important; }
        .service-card:hover  { border-color: #6366f1 !important; transform: translateY(-2px); }
        .btn-primary-port:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(99,102,241,0.6) !important; }
        .btn-ghost-port:hover   { border-color: #6366f1 !important; background: rgba(99,102,241,0.08) !important; }
.port-nav-links { display: flex; gap: 20px; align-items: center; }
        .port-nav-hamburger { display: none; }
        @media (max-width: 767px) {
          .port-nav-links { display: none; }
          .port-nav-hamburger {
            display: flex; align-items: center; justify-content: center;
            margin-left: auto; background: none; border: 1px solid rgba(255,255,255,0.15);
            color: #94a3b8; border-radius: 6px; width: 40px; height: 40px;
            cursor: pointer; font-size: 1.3rem; font-family: inherit; flex-shrink: 0;
            transition: border-color 0.2s, color 0.2s;
          }
          .port-nav-hamburger:hover { border-color: #6366f1; color: #f8fafc; }
          .port-nav-mobile-panel {
            position: absolute; top: 100%; left: 0; right: 0;
            background: rgba(10,22,40,0.98); border-bottom: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(16px); z-index: 99;
            display: flex; flex-direction: column; padding: 8px 0 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          }
          .port-nav-mobile-link {
            color: #94a3b8; text-decoration: none; padding: 13px 20px;
            font-size: 0.9rem; display: block; border-left: 3px solid transparent;
            transition: color 0.15s, border-color 0.15s; min-height: 44px;
          }
          .port-nav-mobile-link:hover { color: #f8fafc; border-left-color: #6366f1; }
          .port-nav-mobile-gh {
            color: #94a3b8; text-decoration: none; padding: 13px 20px;
            font-size: 0.9rem; display: flex; align-items: center; gap: 8px;
            border-left: 3px solid transparent; border-top: 1px solid rgba(255,255,255,0.08);
            margin-top: 4px; min-height: 44px; transition: color 0.15s, border-color 0.15s;
          }
          .port-nav-mobile-gh:hover { color: #f8fafc; border-left-color: #6366f1; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 48px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
        height: '56px',
        gap: '12px',
      }}>
        <button
          className="port-nav-back"
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', background: 'none', border: 'none', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Accueil
        </button>

        {/* Desktop links */}
        <div className="port-nav-links">
          {['#services', '#stack', '#cicd', '#metrics'].map(href => (
            <a key={href} href={href} className="port-nav-link"
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.83rem', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
              { { '#services': 'Services', '#stack': 'Stack', '#cicd': 'CI/CD', '#metrics': 'Métriques' }[href] }
            </a>
          ))}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="port-nav-gh"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.83rem', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', transition: 'border-color 0.2s, color 0.2s', whiteSpace: 'nowrap' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        {/* Hamburger button */}
        <button
          className="port-nav-hamburger"
          onClick={() => setNavOpen(o => !o)}
          aria-label="Menu de navigation"
          aria-expanded={navOpen}
          data-testid="port-hamburger"
        >
          {navOpen ? '✕' : '☰'}
        </button>

        {/* Mobile dropdown panel */}
        {navOpen && (
          <div className="port-nav-mobile-panel">
            {[
              ['#services', 'Services'],
              ['#stack', 'Stack technique'],
              ['#cicd', 'Pipeline CI/CD'],
              ['#metrics', 'Métriques'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="port-nav-mobile-link" onClick={() => setNavOpen(false)}>
                {label}
              </a>
            ))}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="port-nav-mobile-gh" onClick={() => setNavOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 48px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.78rem', color: '#22d3ee', marginBottom: '24px', letterSpacing: '0.03em' }}>
          Infrastructure DevOps Portfolio
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px', background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Olivier Labé
        </h1>
        <p style={{ fontSize: '1rem', color: '#6366f1', fontWeight: 600, marginBottom: '14px' }}>
          SysOps DevOps · IaC · CI/CD · Observabilité
        </p>
        <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '36px', maxWidth: '560px', margin: '0 auto 36px' }}>
          Infrastructure complète déployée sur Proxmox bare-metal avec Terraform et Ansible.
          6 containers LXC, 11+ services en production, pipeline CI/CD complet et observabilité full-stack.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer"
            className="btn-primary-port"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 24px rgba(99,102,241,0.35)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            Voir le code source
          </a>
          <button
            className="btn-ghost-port"
            onClick={() => navigate('/login')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: 'inherit', transition: 'border-color 0.2s, background 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Tester PriceSync App
          </button>
        </div>
      </div>

      {/* ── Services ── */}
      <section id="services" style={{ background: '#0a1628', padding: '60px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 48px' }}>
          <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Infrastructure</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '28px' }}>Services déployés</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {SERVICES.map(svc => {
              const cardStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', transition: 'border-color 0.2s, transform 0.2s', display: 'block', textDecoration: 'none', color: 'inherit' }
              const inner = (
                <>
                  <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{svc.icon}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>{svc.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6366f1', marginBottom: '8px' }}>{svc.url}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{svc.desc}</div>
                </>
              )
              return svc.href
                ? <a key={svc.name} href={svc.href} target="_blank" rel="noopener noreferrer" className="service-card" style={cardStyle}>{inner}</a>
                : <div key={svc.name} className="service-card" style={{ ...cardStyle, cursor: 'default' }}>{inner}</div>
            })}
          </div>
        </div>
      </section>

      {/* ── Project Spotlight ── */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 48px' }}>
        <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Projet phare</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '24px' }}>Application PriceSync</p>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '28px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 280px' }}>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>Synchronisation de prix multi-canaux</p>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '16px' }}>
              Application full-stack développée de A à Z : API REST Express + Prisma + PostgreSQL,
              frontend React 18 / Vite, tests Jest + Vitest, pipeline CI/CD complet avec build Docker,
              scan Trivy et déploiement automatisé via SSH sur LXC unprivilégié.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              {['Node.js 20', 'React 18', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Tests 60%+'].map(t => (
                <span key={t} style={pillStyle(t === 'Tests 60%+' ? 'green' : t === 'Docker' || t === 'GitHub Actions' ? 'cyan' : 'indigo')}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Code source', href: GITHUB_REPO_URL },
                { label: 'Demo live', href: 'https://demo.oldevops.fr/login' },
                { label: 'API Docs', href: 'https://demo.oldevops.fr/api-docs' },
              ].map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6366f1', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', padding: '5px 12px' }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>
            En production
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section id="timeline" style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 48px' }}>
        <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Chronologie</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '32px' }}>Timeline du projet</p>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '86px', top: 0, bottom: 0, width: '1px', background: '#1e293b' }} />
          {TIMELINE.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px', position: 'relative' }}>
              <div style={{ width: '80px', flexShrink: 0, textAlign: 'right', fontSize: '0.72rem', color: '#475569', paddingTop: '10px' }}>{item.date}</div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, border: `2px solid ${item.color}40`, flexShrink: 0, marginTop: '10px', zIndex: 1, boxShadow: `0 0 8px ${item.color}60` }} />
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 16px', flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section id="stack" style={{ background: '#0a1628', padding: '60px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 48px' }}>
          <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Technologies</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '28px' }}>Stack technique</p>
          {TECH_STACK.map(group => (
            <div key={group.label} style={{ marginBottom: '22px' }}>
              <p style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{group.label}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {group.pills.map(p => (
                  <span key={p.text} style={pillStyle(p.accent)}>{p.text}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CI/CD ── */}
      <section id="cicd" style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 48px' }}>
        <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Automatisation</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '28px' }}>Pipeline CI/CD</p>
        {[
          { label: 'Pull Request', steps: PIPELINE_STEPS },
          { label: 'Push main', steps: PIPELINE_DEPLOY },
        ].map(pipeline => (
          <div key={pipeline.label} style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{pipeline.label}</p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0' }}>
              {pipeline.steps.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '9px 15px', fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                    {step.icon} {step.label}
                  </div>
                  {i < pipeline.steps.length - 1 && (
                    <span style={{ color: '#334155', padding: '0 6px', fontSize: '1rem' }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Metrics ── */}
      <section id="metrics" style={{ background: '#0a1628', padding: '60px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Résultats mesurables</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>Métriques clés</p>
            </div>
            <div data-testid="api-status-badge" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: apiStatus === 'online' ? 'rgba(16,185,129,0.1)' : apiStatus === 'loading' ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${apiStatus === 'online' ? 'rgba(16,185,129,0.4)' : apiStatus === 'loading' ? 'rgba(99,102,241,0.4)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: '20px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600,
              color: apiStatus === 'online' ? '#10b981' : apiStatus === 'loading' ? '#818cf8' : '#ef4444',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              API PriceSync — {apiStatus === 'online' ? 'En ligne' : apiStatus === 'loading' ? 'Vérification…' : 'Hors ligne'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
            {METRICS.map(m => (
              <div key={m.label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '22px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: m.color, lineHeight: 1, marginBottom: '8px' }}>{m.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section style={{ padding: '64px 48px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Intéressé par mon profil ?</p>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '28px' }}>Retrouvez l'intégralité du code source sur GitHub ou contactez-moi directement.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            className="btn-primary-port"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 24px rgba(99,102,241,0.3)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
            Voir mon GitHub
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
            className="btn-ghost-port"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(8px)', transition: 'border-color 0.2s, background 0.2s' }}>
            LinkedIn
          </a>
          <button
            className="btn-ghost-port"
            onClick={() => navigate('/contact')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: 'inherit', transition: 'border-color 0.2s, background 0.2s' }}>
            Me contacter
          </button>
        </div>
        <p style={{ marginTop: '40px', color: '#334155', fontSize: '0.78rem' }}>© 2026 Olivier Labé — oldevops.fr</p>
      </section>
    </div>
  )
}
