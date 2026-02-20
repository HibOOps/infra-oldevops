export function getSyncStatus(prices, referencePrice) {
  if (!prices || prices.length === 0) return 'unknown'
  const ref = parseFloat(referencePrice)
  const maxDelta = Math.max(
    ...prices.map(p => Math.abs((parseFloat(p.price) - ref) / ref) * 100)
  )
  if (maxDelta > 10) return 'desynced'
  if (maxDelta > 3) return 'delta'
  return 'synced'
}

export const STATUS_LABEL = {
  desynced: 'Désync',
  delta: 'Delta',
  synced: 'Sync',
  unknown: '—',
}

export const STATUS_COLORS = {
  desynced: '#ef4444',
  delta: '#f59e0b',
  synced: '#22c55e',
  unknown: '#9ca3af',
}
