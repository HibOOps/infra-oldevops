import { useState, useEffect, useCallback } from 'react'
import PriceMatrix from '../components/PriceMatrix'
import { useApi } from '../hooks/useApi'

export default function PricesPage({ token }) {
  const { get, put, loading } = useApi(token)
  const [products, setProducts] = useState([])
  const [channels, setChannels] = useState([])
  const [recentHistory, setRecentHistory] = useState([])

  const load = useCallback(async () => {
    const [prods, chans, hist] = await Promise.all([
      get('/products?limit=100'),
      get('/channels'),
      get('/history?limit=5'),
    ])
    setProducts(prods.data || [])
    setChannels(chans || [])
    setRecentHistory(hist || [])
  }, [get])

  useEffect(() => { load() }, [load])

  async function handleUpdatePrice(productId, channelId, newPrice) {
    await put(`/prices/${productId}/${channelId}`, { price: newPrice })
    await load()
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Gestion des Prix par Canal</h1>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Double-cliquez sur un prix pour l'éditer. La modification est tracée dans l'historique.
        </p>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[['🔴 Désync', 'Écart >10% vs référence', '#fef2f2', '#dc2626'], ['🟡 Delta', 'Écart 3-10%', '#fffbeb', '#d97706'], ['🟢 Sync', 'Écart <3%', '#f0fdf4', '#16a34a']].map(([label, desc, bg, color]) => (
          <div key={label} style={{ background: bg, borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem' }}>
            <strong style={{ color }}>{label}</strong> — <span style={{ color: '#64748b' }}>{desc}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '28px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>
        ) : (
          <PriceMatrix products={products} channels={channels} onUpdatePrice={handleUpdatePrice} />
        )}
      </div>

      {/* Dernières modifications */}
      {recentHistory.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>Dernières modifications</h3>
          </div>
          <div style={{ padding: '0 20px' }}>
            {recentHistory.map(h => (
              <div key={h.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <code style={{ color: '#6366f1', minWidth: '90px' }}>{h.product.sku}</code>
                <span style={{ color: '#64748b' }}>{h.channel.name}</span>
                <span style={{ color: '#dc2626' }}>{parseFloat(h.oldPrice).toFixed(2)} €</span>
                <span>→</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{parseFloat(h.newPrice).toFixed(2)} €</span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '0.75rem' }}>
                  {h.changedBy.name} · {new Date(h.changedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
