import { useState } from 'react'

export default function RuleForm({ channels, products, onSubmit, onCancel, initial }) {
  const [form, setForm] = useState(initial || {
    name: '',
    type: 'percentage',
    value: '',
    channelIds: [],
    productIds: [],
    isActive: true,
  })

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function toggleId(field, id) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id)
        ? f[field].filter(x => x !== id)
        : [...f[field], id],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.value || form.channelIds.length === 0) return
    onSubmit({ ...form, value: parseFloat(form.value) })
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: '6px',
    border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} data-testid="rule-form">
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Nom de la règle *</label>
        <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="ex: Promo Cordes Web -15%" required />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Type</label>
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (€)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
            Valeur * {form.type === 'percentage' ? '(ex: -15 pour -15%)' : '(ex: -5 pour -5€)'}
          </label>
          <input style={inputStyle} type="number" step="0.01" value={form.value} onChange={e => set('value', e.target.value)} required />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Canaux ciblés *</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {channels.map(ch => (
            <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.channelIds.includes(ch.id)} onChange={() => toggleId('channelIds', ch.id)} />
              {ch.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
          Produits ciblés <span style={{ fontStyle: 'italic' }}>(vide = tous les produits)</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', maxHeight: '140px', overflowY: 'auto', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          {products.map(p => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
              <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleId('productIds', p.id)} />
              <span>{p.sku}</span>
            </label>
          ))}
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
        <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
        Règle active
      </label>
      {/* Preview */}
      {form.value && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#0369a1' }}>
          Preview : un prix de 50,00 € deviendrait{' '}
          <strong>
            {form.type === 'percentage'
              ? (50 * (1 + parseFloat(form.value) / 100)).toFixed(2)
              : (50 + parseFloat(form.value)).toFixed(2)} €
          </strong>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
          Annuler
        </button>
        <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          {initial ? 'Enregistrer' : 'Créer la règle'}
        </button>
      </div>
    </form>
  )
}
