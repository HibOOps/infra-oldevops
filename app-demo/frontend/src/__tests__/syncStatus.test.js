import { describe, it, expect } from 'vitest'
import { getSyncStatus } from '../utils/syncStatus'

describe('getSyncStatus', () => {
  it('retourne unknown si pas de prix', () => {
    expect(getSyncStatus([], 45)).toBe('unknown')
    expect(getSyncStatus(null, 45)).toBe('unknown')
  })

  it('retourne synced si delta < 3%', () => {
    const prices = [{ price: 45.00 }, { price: 45.50 }]
    expect(getSyncStatus(prices, 45)).toBe('synced')
  })

  it('retourne delta si écart 3-10%', () => {
    const prices = [{ price: 48.00 }, { price: 45.00 }]
    expect(getSyncStatus(prices, 45)).toBe('delta')
  })

  it('retourne desynced si écart > 10%', () => {
    const prices = [{ price: 50.00 }, { price: 42.50 }]
    expect(getSyncStatus(prices, 45)).toBe('desynced')
  })
})
