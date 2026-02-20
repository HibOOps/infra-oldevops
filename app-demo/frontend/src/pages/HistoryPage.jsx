import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'

const SOURCE_STYLE = {
  manual:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Manuel' },
  rule:    { bg: '#f5f3ff', color: '#6d28d9', label: 'Règle' },
  sync:    { bg: '#f0fdf4', color: '#15803d', label: 'Sync' },
}

export default function HistoryPage({ token }) {
  const { get } = useApi(token)
  const [entries, setEntries] = useState([])
  const [filters, setFilters] = useState({ productId: '', channelId: '', from: '', to: '' })
  const [channels, setChannels] = useState([])
  const [products, setProducts] = useState([])

  const load = useCallback(async () => {
    const q = new URLSearchParams({ limit: 100 })
    if (filters.productId) q.set('productId', filters.productId)
    if (filters.channelId) q.set('channelId', filters.channelId)
    if (filters.from) q.set('from', filters.from)
    if (filters.to) q.set('to', filters.to)
    const data = await get(`/history?${q}`)
    setEntries(data || [])
  }, [get, filters])

  useEffect(() => {
    Promise.all([get('/channels'), get('/products?limit=100')]).then(([chans, prods]) => {
      setChannels(chans || [])
      setProducts((prods?.data || []))
    })
  }, [get])

  useEffect(() => { load() }, [load])

  function exportCsv() {
    const rows = [
      ['Date', 'Produit', 'Canal', 'Ancien prix', 'Nouveau prix', 'Modifié par', 'Source'],
      ...entries.map(e => [
        new Date(e.changedAt).toLocaleString('fr-FR'),
        e.product.sku,
        e.channel.name,
        parseFloat(e.oldPrice).toFixed(2),
        parseFloat(e.newPrice).toFixed(2),
        e.changedBy.name,
        e.source,
      ]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'pricesync-historique.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const inputStyle = { padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Historique des Modifications</h1>
        <button onClick={exportCsv} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Filtres */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select style={inputStyle} value={filters.productId} onChange={e => setFilters(f => ({ ...f, productId: e.target.value }))}>
          <option value="">Tous les produits</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
        </select>
        <select style={inputStyle} value={filters.channelId} onChange={e => setFilters(f => ({ ...f, channelId: e.target.value }))}>
          <option value="">Tous les canaux</option>
          {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" style={inputStyle} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>→</span>
        <input type="date" style={inputStyle} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
        {(filters.productId || filters.channelId || filters.from || filters.to) && (
          <button onClick={() => setFilters({ productId: '', channelId: '', from: '', to: '' })} style={{ ...inputStyle, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>
            Réinitialiser
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>{entries.length} entrée(s)</span>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Date', 'Produit', 'Canal', 'Ancien prix', 'Nouveau prix', 'Delta', 'Modifié par', 'Source'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Aucune modification trouvée</td></tr>
            ) : (
              entries.map((e, i) => {
                const delta = ((parseFloat(e.newPrice) - parseFloat(e.oldPrice)) / parseFloat(e.oldPrice) * 100).toFixed(1)
                const src = SOURCE_STYLE[e.source] || SOURCE_STYLE.manual
                return (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(e.changedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <code style={{ color: '#6366f1', fontSize: '0.75rem' }}>{e.product.sku}</code>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem' }}>{e.channel.name}</td>
                    <td style={{ padding: '10px 14px', color: '#dc2626' }}>{parseFloat(e.oldPrice).toFixed(2)} €</td>
                    <td style={{ padding: '10px 14px', color: '#16a34a', fontWeight: 600 }}>{parseFloat(e.newPrice).toFixed(2)} €</td>
                    <td style={{ padding: '10px 14px', color: parseFloat(delta) < 0 ? '#dc2626' : '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>
                      {parseFloat(delta) > 0 ? '+' : ''}{delta}%
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>{e.changedBy.name}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.75rem', background: src.bg, color: src.color, borderRadius: '10px', padding: '2px 8px', fontWeight: 600 }}>{src.label}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
