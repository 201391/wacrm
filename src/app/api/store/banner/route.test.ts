import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { requireRole } from '@/lib/auth/account'

vi.mock('@/lib/auth/account', () => ({
  requireRole: vi.fn(),
  toErrorResponse: vi.fn(),
}))

describe('Store Banners API (/api/store/banner)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns default multiple banners and 2000ms interval', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.banners)).toBe(true)
    expect(data.banners.length).toBeGreaterThan(0)
    expect(data.intervalMs).toBe(2000)
  })

  it('POST rejects non-admin callers with 403 status', async () => {
    vi.mocked(requireRole).mockRejectedValueOnce(
      new Error("This action requires the 'admin' role or higher")
    )

    const req = new Request('http://localhost:3000/api/store/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intervalMs: 2000,
        banners: [
          {
            id: 'test-1',
            title: 'Hacked Banner',
            imageUrl: 'https://example.com/hacked.jpg',
            active: true,
          },
        ],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.error).toContain("admin")
  })

  it('POST allows admin to update multiple banners and 2-second interval', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      userId: 'admin-1',
      accountId: 'acct-1',
      role: 'admin',
    } as any)

    const updatedBanners = [
      {
        id: 'banner-test-1',
        title: 'New Cattle Feed Promotion',
        subtitle: '25% higher milk yield',
        badgeText: 'Dairy Special',
        badgeEmoji: '🐄',
        imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81',
        categoryFilter: 'cattle-feed',
        ctaText: 'Shop Cattle Feed',
        active: true,
      },
      {
        id: 'banner-test-2',
        title: 'Heavy Duty Sprayers',
        subtitle: '1-Year Warranty',
        badgeText: 'Heavy Duty',
        badgeEmoji: '🚜',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9',
        categoryFilter: 'agri-tools',
        ctaText: 'View Sprayers',
        active: true,
      },
    ]

    const req = new Request('http://localhost:3000/api/store/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intervalMs: 2000,
        banners: updatedBanners,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.intervalMs).toBe(2000)
    expect(data.banners.length).toBe(2)
    expect(data.banners[0].title).toBe('New Cattle Feed Promotion')
  })

  it('GET returns default promoBanners (3 cards)', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.promoBanners)).toBe(true)
    expect(data.promoBanners.length).toBe(3)
    expect(data.promoBanners[0].id).toBe('promo-1')
    expect(data.promoBanners[1].id).toBe('promo-2')
    expect(data.promoBanners[2].id).toBe('promo-3')
  })

  it('POST allows admin to update 3 promo banners', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      userId: 'admin-1',
      accountId: 'acct-1',
      role: 'admin',
    } as any)

    const updatedPromos = [
      {
        id: 'promo-1',
        badge: 'Organic Special',
        title: 'Premium Cattle Super Feed',
        subtitle: 'Up to 30% Off Today',
        ctaText: 'Buy Now',
        categoryFilter: 'cattle-feed',
        iconType: 'emoji',
        icon: '🐄',
        theme: 'green',
        active: true,
      },
      {
        id: 'promo-2',
        badge: 'Mega Offer',
        title: 'Calcium Lacto Booster',
        subtitle: 'Max Butterfat & Milk',
        ctaText: 'Order Now',
        categoryFilter: 'cattle-feed',
        iconType: 'emoji',
        icon: '🥛',
        theme: 'amber',
        active: true,
      },
      {
        id: 'promo-3',
        badge: 'Govt Certified',
        title: 'Hybrid Mustard & Wheat Seeds',
        subtitle: 'Tested Germination 99%',
        ctaText: 'Shop Seeds',
        categoryFilter: 'seeds-fert',
        iconType: 'emoji',
        icon: '🌾',
        theme: 'dark',
        active: true,
      },
    ]

    const req = new Request('http://localhost:3000/api/store/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promoBanners: updatedPromos,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.promoBanners.length).toBe(3)
    expect(data.promoBanners[0].badge).toBe('Organic Special')
    expect(data.promoBanners[0].title).toBe('Premium Cattle Super Feed')
  })
})
