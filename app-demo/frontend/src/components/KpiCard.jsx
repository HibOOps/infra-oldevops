export default function KpiCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color || '#6366f1'}`,
      minWidth: '160px',
      flex: 1,
    }}>
      <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{label}</div>
    </div>
  )
}
