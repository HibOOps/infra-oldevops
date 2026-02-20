import { useState, useEffect, useCallback } from 'react'
import SyncStatusBadge from '../components/SyncStatusBadge'
import { useApi } from '../hooks/useApi'
import { getSyncStatus } from '../utils/syncStatus'

const CATEGORIES = ['Bois', 'Accastillage', 'Mécaniques', 'Cordes', 'Outils', 'Électronique', 'Finition']

export default function ProductsPage({ token }) {
  const { get, post, put, del, loading } = useApi(token)
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ sku: '', name: '', category: 'Bois', referencePrice: '' })

  const load = useCallback(async () => {
    const q = new URLSearchParams({ page, limit: 20, ...(categoryFilter ? { category: categoryFilter } : {}) })
    const data = await get(`/products?${q}`)
    setProducts(data.data)
    setTotal(data.total)
  }, [get, page, categoryFilter])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditing(null); setForm({ sku: '', name: '', category: 'Bois', referencePrice: '' }); setShowForm(true) }
  function openEdit(p) { setEditing(p); setForm({ sku: p.sku, name: p.name, category: p.category, referencePrice: p.referencePrice, description: p.description || '' }); setShowForm(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    const body = { ...form, referencePrice: parseFloat(form.referencePrice) }
    if (editing) { await put(`/products/${editing.id}`, body) }
    else { await post('/products', body) }
    setShowForm(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await del(`/products/${id}`)
    load()
  }

  const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Catalogue Produits <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>({total})</span></h1>
        <button onClick={openCreate} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          + Nouveau produit
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1) }}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, background: categoryFilter === cat ? '#6366f1' : '#f1f5f9', color: categoryFilter === cat ? '#fff' : '#475569' }}>
            {cat || 'Toutes'}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>SKU *</label>
              <input style={inputStyle} value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Nom *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Catégorie *</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Prix de référence (€) *</label>
              <input style={inputStyle} type="number" step="0.01" value={form.referencePrice} onChange={e => setForm(f => ({ ...f, referencePrice: e.target.value }))} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['SKU', 'Nom', 'Catégorie', 'Prix réf.', 'Statut sync', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}><code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{p.sku}</code></td>
                  <td style={{ padding: '10px 14px', color: '#1e293b' }}>{p.name}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ fontSize: '0.75rem', background: '#f1f5f9', borderRadius: '4px', padding: '2px 8px' }}>{p.category}</span></td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{parseFloat(p.referencePrice).toFixed(2)} €</td>
                  <td style={{ padding: '10px 14px' }}><SyncStatusBadge status={getSyncStatus(p.prices, p.referencePrice)} /></td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => openEdit(p)} style={{ marginRight: '8px', padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Éditer</button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding: '14px', display: 'flex', gap: '8px', justifyContent: 'center', borderTop: '1px solid #f1f5f9' }}>
            {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: page === p ? '#6366f1' : '#f1f5f9', color: page === p ? '#fff' : '#475569', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
