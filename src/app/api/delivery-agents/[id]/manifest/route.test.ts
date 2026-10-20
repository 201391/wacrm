import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('Driver Manifest API (/api/delivery-agents/[id]/manifest)', () => {
  it('returns active manifest stops and operational statistics for an agent', async () => {
    const req = new Request('http://localhost:3000/api/delivery-agents/agent-1/manifest')
    const res = await GET(req, {
      params: Promise.resolve({ id: 'agent-1' }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.orders)).toBe(true)
    expect(data.stats).toBeDefined()
    expect(data.stats.totalAssigned).toBeGreaterThan(0)
    expect(typeof data.stats.codCollected).toBe('number')
    expect(typeof data.stats.upiCollected).toBe('number')
  })
})
