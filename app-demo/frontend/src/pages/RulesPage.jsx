import { useState, useEffect, useCallback } from 'react'
import RuleForm from '../components/RuleForm'
import { useApi } from '../hooks/useApi'

const TYPE_LABEL = { percentage: 'Pourcentage', fixed: 'Montant fixe' }

export default function RulesPage({ token }) {
  const { get, post, put, del } = useApi(token)
  const [rules, setRules] = useState([])
  const [channels, setChannels] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    const [rls, chans, prods] = await Promise.all([get('/rules'), get('/channels'), get('/products?limit=100')])
    setRules(rls || [])
    setChannels(chans || [])
    setProducts((prods?.data || []))
  }, [get])

  useEffect(() => { load() }, [load])

  async function handleSubmit(formData) {
    if (editing) { await put(`/rules/${editing.id}`, formData) }
    else { await post('/rules', formData) }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleToggle(rule) {
    await put(`/rules/${rule.id}`, { isActive: !rule.isActive })
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette règle ?')) return
    await del(`/rules/${id}`)
    load()
  }

  function openEdit(rule) {
    setEditing(rule)
    setShowForm(true)
  }

  function getChannelNames(ids) {
    return ids.map(id => channels.find(c => c.id === id)?.name || id).join(', ')
  }
  function getProductSkus(ids) {
    if (ids.length === 0) return 'Tous les produits'
    return ids.map(id => products.find(p => p.id === id)?.sku || id).join(', ')
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Règles de Pricing</h1>
        <button onClick={() => { setEditing(null); setShowForm(true) }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          + Nouvelle règle
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>{editing ? 'Modifier la règle' : 'Nouvelle règle de pricing'}</h3>
          <RuleForm
            channels={channels}
            products={products}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null) }}
            initial={editing ? {
              name: editing.name,
              type: editing.type,
              value: editing.value,
              channelIds: editing.channelIds,
              productIds: editing.productIds,
              isActive: editing.isActive,
            } : null}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rules.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Aucune règle de pricing configurée
          </div>
        )}
        {rules.map(rule => (
          <div key={rule.id} style={{
            background: '#fff', borderRadius: '12px', padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${rule.isActive ? '#6366f1' : '#cbd5e1'}`,
            opacity: rule.isActive ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{rule.name}</h3>
                  <span style={{ fontSize: '0.75rem', background: rule.isActive ? '#ede9fe' : '#f1f5f9', color: rule.isActive ? '#7c3aed' : '#94a3b8', borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span><strong>Type :</strong> {TYPE_LABEL[rule.type]}</span>
                  <span><strong>Valeur :</strong> <span style={{ color: parseFloat(rule.value) < 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {parseFloat(rule.value) > 0 ? '+' : ''}{parseFloat(rule.value)}{rule.type === 'percentage' ? '%' : '€'}
                  </span></span>
                  <span><strong>Canaux :</strong> {getChannelNames(rule.channelIds)}</span>
                  <span><strong>Produits :</strong> {getProductSkus(rule.productIds)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                  Créée par {rule.createdBy?.name} · {new Date(rule.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => handleToggle(rule)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {rule.isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => openEdit(rule)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Éditer
                </button>
                <button onClick={() => handleDelete(rule.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
