import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { requireRole } from '@/lib/auth/account'

vi.mock('@/lib/auth/account', () => ({
  requireRole: vi.fn(),
  toErrorResponse: vi.fn(),
}))

describe('Products Bulk Import API (/api/products/bulk)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthorized requests with 403', async () => {
    vi.mocked(requireRole).mockRejectedValueOnce(new Error('Forbidden'))
    const req = new Request('http://localhost:3000/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: [] }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates and updates products in bulk for admin', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      userId: 'admin-1',
      accountId: 'acct-1',
      role: 'admin',
    } as any)

    const importPayload = {
      updateExisting: true,
      products: [
        {
          title: 'Imported Cattle Feed Concentrate',
          price: 1350,
          original_price: 1550,
          category: 'cattle-feed',
          weight: '50 kg Bag',
          stock: 60,
          description: 'High bypass protein feed for milk cows',
          badge: 'New Import',
          is_active: true,
        },
        {
          title: 'Imported Bio Fungicide',
          price: 380,
          category: 'seeds-fert',
          weight: '500 ml',
          stock: 40,
          is_active: true,
        },
      ],
    }

    const req = new Request('http://localhost:3000/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importPayload),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.createdCount + data.updatedCount).toBe(2)
  })
})
