import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { requireRole } from '@/lib/auth/account'

vi.mock('@/lib/auth/account', () => ({
  requireRole: vi.fn(),
  toErrorResponse: vi.fn(),
}))

describe('Google Sheets Import API (/api/products/import/sheets)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthorized requests with 403', async () => {
    vi.mocked(requireRole).mockRejectedValueOnce(new Error('Forbidden'))
    const req = new Request('http://localhost:3000/api/products/import/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://docs.google.com/spreadsheets/d/123/edit' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('rejects invalid Google Sheets URL', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      userId: 'admin-1',
      accountId: 'acct-1',
      role: 'admin',
    } as any)

    const req = new Request('http://localhost:3000/api/products/import/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/not-a-google-sheet' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid Google Sheets link')
  })

  it('fetches and parses public CSV content from Google Sheets', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      userId: 'admin-1',
      accountId: 'acct-1',
      role: 'admin',
    } as any)

    const mockCsv = 'Title,Price,Category\nOrganic Cattle Feed,1100,cattle-feed\n'
    // Mock global fetch for Google Sheet export
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => mockCsv,
    }) as any

    try {
      const req = new Request('http://localhost:3000/api/products/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.parsed.validRows.length).toBe(1)
      expect(data.parsed.validRows[0].title).toBe('Organic Cattle Feed')
      expect(data.parsed.validRows[0].price).toBe(1100)
    } finally {
      global.fetch = originalFetch
    }
  })
})
