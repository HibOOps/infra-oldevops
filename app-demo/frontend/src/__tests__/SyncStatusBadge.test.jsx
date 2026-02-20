import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SyncStatusBadge from '../components/SyncStatusBadge'

describe('SyncStatusBadge', () => {
  it('affiche Désync pour desynced', () => {
    render(<SyncStatusBadge status="desynced" />)
    expect(screen.getByText('Désync')).toBeInTheDocument()
  })

  it('affiche Delta pour delta', () => {
    render(<SyncStatusBadge status="delta" />)
    expect(screen.getByText('Delta')).toBeInTheDocument()
  })

  it('affiche Sync pour synced', () => {
    render(<SyncStatusBadge status="synced" />)
    expect(screen.getByText('Sync')).toBeInTheDocument()
  })
})
