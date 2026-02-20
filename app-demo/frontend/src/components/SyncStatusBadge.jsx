import { STATUS_COLORS, STATUS_LABEL } from '../utils/syncStatus'

export default function SyncStatusBadge({ status }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#fff',
      backgroundColor: STATUS_COLORS[status] || STATUS_COLORS.unknown,
    }}>
      {STATUS_LABEL[status] || '—'}
    </span>
  )
}
