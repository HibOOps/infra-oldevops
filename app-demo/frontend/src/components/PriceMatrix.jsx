import { useState } from 'react'
import SyncStatusBadge from './SyncStatusBadge'
import { getSyncStatus } from '../utils/syncStatus'

export default function PriceMatrix({ products, channels, onUpdatePrice }) {
  const [editing, setEditing] = useState(null) // { productId, channelId }
  const [editValue, setEditValue] = useState('')

  function getPrice(product, channelId) {
    return product.prices?.find(p => p.channelId === channelId)
  }

  function startEdit(productId, channelId, currentPrice) {
    setEditing({ productId, channelId })
    setEditValue(String(parseFloat(currentPrice).toFixed(2)))
  }

  async function commitEdit(product, channelId) {
    const newVal = parseFloat(editValue)
    if (!isNaN(newVal) && newVal > 0) {
      await onUpdatePrice(product.id, channelId, newVal)
    }
    setEditing(null)
  }

  function getDeltaPct(price, ref) {
    const pct = ((parseFloat(price) - parseFloat(ref)) / parseFloat(ref)) * 100
    return pct.toFixed(1)
  }

  return (
    <div style={{ overflowX: 'auto' }} data-testid="price-matrix">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Produit</th>
            <th style={thStyle}>Catégorie</th>
            <th style={thStyle}>Réf.</th>
            {channels.map(ch => (
              <th key={ch.id} style={{ ...thStyle, textAlign: 'center' }}>
                {ch.name}
                <div style={{ fontSize: '0.7rem', fontWeight: 400, color: '#94a3b8' }}>{ch.type}</div>
              </th>
            ))}
            <th style={thStyle}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => {
            const status = getSyncStatus(product.prices, product.referencePrice)
            return (
              <tr key={product.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}><code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{product.sku}</code></td>
                <td style={{ ...tdStyle, maxWidth: '180px' }}>{product.name}</td>
                <td style={tdStyle}><span style={{ fontSize: '0.75rem', background: '#f1f5f9', borderRadius: '4px', padding: '2px 8px' }}>{product.category}</span></td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{parseFloat(product.referencePrice).toFixed(2)} €</td>
                {channels.map(ch => {
                  const priceObj = getPrice(product, ch.id)
                  const isEditing = editing?.productId === product.id && editing?.channelId === ch.id
                  const delta = priceObj ? getDeltaPct(priceObj.price, product.referencePrice) : null
                  return (
                    <td key={ch.id} style={{ ...tdStyle, textAlign: 'center', position: 'relative' }}>
                      {priceObj ? (
                        isEditing ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(product, ch.id)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(product, ch.id); if (e.key === 'Escape') setEditing(null) }}
                            style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid #6366f1', textAlign: 'center', fontSize: '0.875rem' }}
                          />
                        ) : (
                          <span
                            title="Double-cliquez pour éditer"
                            onDoubleClick={() => startEdit(product.id, ch.id, priceObj.price)}
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                          >
                            <span style={{ fontWeight: 600 }}>{parseFloat(priceObj.price).toFixed(2)} €</span>
                            <span style={{ fontSize: '0.7rem', color: parseFloat(delta) > 0 ? '#f59e0b' : '#22c55e' }}>
                              {parseFloat(delta) > 0 ? '+' : ''}{delta}%
                            </span>
                          </span>
                        )
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                  )
                })}
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <SyncStatusBadge status={status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '2px solid #e2e8f0',
}

const tdStyle = {
  padding: '10px 12px',
  color: '#1e293b',
  verticalAlign: 'middle',
}
