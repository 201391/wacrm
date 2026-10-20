import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { requireRole } from '@/lib/auth/account'

vi.mock('@/lib/auth/account', () => ({
  requireRole: vi.fn(),
  toErrorResponse: vi.fn(),
}))

describe('Store Promo Banners API (/api/store/promo-banners)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns default promo banners list', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.promoBanners)).toBe(true)
    expect(data.promoBanners.length).toBeGreaterThanOrEqual(3)
  })

  it('POST rejects unauthorized requests with 403', async () => {
    vi.mocked(requireRole).mockRejectedValueOnce(new Error('Forbidden'))
    const req = new Request('http://localhost:3000/api/store/promo-banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoBanners: [] }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('POST allows admin to update promotional cards', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      userId: 'admin-1',
      accountId: 'acct-1',
      role: 'admin',
    } as any)

    const updatedPromos = [
      {
        id: 'promo-1',
        badge: 'High Protein Plus',
        title: 'Cattle Feed Premix Max',
        subtitle: 'Up to 30% Off',
        ctaText: 'Shop Now',
        categoryFilter: 'cattle-feed',
        iconType: 'emoji' as const,
        icon: '🐄',
        theme: 'green',
        active: true,
      },
      {
        id: 'promo-2',
        badge: 'Daily Essentials',
        title: 'Dairy Calcium Boosters',
        subtitle: 'Better Milk Yield',
        ctaText: 'Shop Now',
        categoryFilter: 'cattle-feed',
        iconType: 'emoji' as const,
        icon: '🥛',
        theme: 'amber',
        active: true,
      },
      {
        id: 'promo-3',
        badge: 'Certified Seeds',
        title: 'High-Yield Hybrid Seeds',
        subtitle: 'Pure & Natural',
        ctaText: 'Shop Now',
        categoryFilter: 'seeds-fert',
        iconType: 'emoji' as const,
        icon: '🌾',
        theme: 'dark',
        active: true,
      },
    ]

    const req = new Request('http://localhost:3000/api/store/promo-banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoBanners: updatedPromos }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.promoBanners[0].title).toBe('Cattle Feed Premix Max')
  })
})
