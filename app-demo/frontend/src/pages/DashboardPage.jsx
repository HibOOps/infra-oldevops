import { useState, useEffect, useCallback } from 'react'
import KpiCard from '../components/KpiCard'
import SyncStatusBadge from '../components/SyncStatusBadge'
import { useApi } from '../hooks/useApi'
import { getSyncStatus } from '../utils/syncStatus'

export default function DashboardPage({ token }) {
  const { get, post, loading } = useApi(token)
  const [products, setProducts] = useState([])
  const [channels, setChannels] = useState([])
  const [rules, setRules] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  const loadData = useCallback(async () => {
    const [prods, chans, rls] = await Promise.all([
      get('/products?limit=100'),
      get('/channels'),
      get('/rules'),
    ])
    setProducts(prods.data || [])
    setChannels(chans || [])
    setRules(rls || [])
  }, [get])

  useEffect(() => { loadData() }, [loadData])

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await post('/sync')
      setLastSync(new Date().toLocaleString('fr-FR'))
      setSyncResult(result)
      await loadData()
    } finally {
      setSyncing(false)
    }
  }

  const statusCounts = products.reduce((acc, p) => {
    const s = getSyncStatus(p.prices, p.referencePrice)
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  const desynced = products.filter(p => getSyncStatus(p.prices, p.referencePrice) === 'desynced')

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Dashboard</h1>
          {lastSync && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Dernière sync : {lastSync}</p>}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: syncing ? '#94a3b8' : '#6366f1',
            color: '#fff',
            fontWeight: 600,
            cursor: syncing ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {syncing ? '⏳ Synchronisation...' : '🔄 Synchroniser tout'}
        </button>
      </div>

      {syncResult && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '0.875rem', color: '#166534' }}>
          Synchronisation terminée — <strong>{syncResult.updated}</strong> prix mis à jour, <strong>{syncResult.unchanged}</strong> inchangés.
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }} data-testid="kpi-section">
        <KpiCard label="Produits" value={products.length} color="#6366f1" icon="📦" />
        <KpiCard label="Canaux actifs" value={channels.filter(c => c.isActive).length} color="#0ea5e9" icon="🌐" />
        <KpiCard label="Règles actives" value={rules.filter(r => r.isActive).length} color="#8b5cf6" icon="⚙️" />
        <KpiCard label="Désync 🔴" value={statusCounts.desynced || 0} color="#ef4444" icon="⚠️" />
        <KpiCard label="Delta 🟡" value={statusCounts.delta || 0} color="#f59e0b" icon="↕️" />
        <KpiCard label="Sync 🟢" value={statusCounts.synced || 0} color="#22c55e" icon="✅" />
      </div>

      {/* Tableau désync */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Produits en désynchronisation</h2>
          <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '12px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
            {desynced.length} produits
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>
        ) : desynced.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#22c55e', fontSize: '0.9rem' }}>
            ✅ Tous les prix sont synchronisés
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Produit</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Prix de référence</th>
                {channels.map(ch => <th key={ch.id} style={{ ...thStyle, textAlign: 'center' }}>{ch.name}</th>)}
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {desynced.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                  <td style={tdStyle}><code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{p.sku}</code></td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}><span style={{ fontSize: '0.75rem', background: '#f1f5f9', borderRadius: '4px', padding: '2px 8px' }}>{p.category}</span></td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{parseFloat(p.referencePrice).toFixed(2)} €</td>
                  {channels.map(ch => {
                    const priceObj = p.prices?.find(x => x.channelId === ch.id)
                    return (
                      <td key={ch.id} style={{ ...tdStyle, textAlign: 'center' }}>
                        {priceObj ? <strong>{parseFloat(priceObj.price).toFixed(2)} €</strong> : '—'}
                      </td>
                    )
                  })}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <SyncStatusBadge status="desynced" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }
const tdStyle = { padding: '10px 14px', color: '#1e293b' }
