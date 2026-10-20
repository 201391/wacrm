import { describe, it, expect, beforeEach } from 'vitest'
import {
  createProduct,
  updateProduct,
  getProductById,
  getProductBySlug,
} from '@/lib/orders/store'
import { generateMetadata } from '@/app/store/products/[slug]/page'
import { POST as createProductRoute } from '@/app/api/products/route'
import { PUT as updateProductRoute, GET as getProductRoute } from '@/app/api/products/[slug]/route'

describe('Product SEO & Meta Settings Engine', () => {
  const testAccountId = 'acct-seo-test-123'

  it('persists and sanitizes all SEO fields upon product creation', async () => {
    const rawPayload = {
      title: 'Premium Organic Fertilizer',
      slug: 'premium-organic-fertilizer',
      price: 499,
      category: 'seeds-fert',
      description: '100% natural organic compost enriched with beneficial microbes.',
      meta_title: '<script>alert("xss")</script>Buy Organic Fertilizer Online | Jatrra',
      meta_description: '<b>Best</b> natural compost for kitchen gardens and crops. <img src=x onerror=alert(1)>',
      canonical_url: 'https://jatrra.com/store/products/premium-organic-fertilizer',
      keywords: ['organic fertilizer', 'compost', ' bio manure ', ''],
      og_title: '<h1>Organic Fertilizer 10kg</h1>',
      og_description: 'Top-rated natural organic compost.',
      og_image_url: 'https://example.com/social-fertilizer.jpg',
      twitter_card: 'summary_large_image' as const,
      no_index: false,
      no_follow: true,
      structured_data: {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '128',
        },
      },
    }

    const created = await createProduct(rawPayload, testAccountId)

    expect(created.id).toBeDefined()
    expect(created.title).toBe('Premium Organic Fertilizer')
    // Sanitized: HTML tags stripped
    expect(created.meta_title).toBe('Buy Organic Fertilizer Online | Jatrra')
    expect(created.meta_description).toBe('Best natural compost for kitchen gardens and crops.')
    expect(created.og_title).toBe('Organic Fertilizer 10kg')
    expect(created.canonical_url).toBe('https://jatrra.com/store/products/premium-organic-fertilizer')
    // Trimmed and empty strings removed
    expect(created.keywords).toEqual(['organic fertilizer', 'compost', 'bio manure'])
    expect(created.og_image_url).toBe('https://example.com/social-fertilizer.jpg')
    expect(created.twitter_card).toBe('summary_large_image')
    expect(created.no_index).toBe(false)
    expect(created.no_follow).toBe(true)
    expect(created.structured_data).toEqual({
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '128',
      },
    })
  })

  it('updates SEO settings and supports toggling robots no_index / no_follow', async () => {
    const initial = await createProduct(
      {
        title: 'Draft Product For Staging',
        slug: 'draft-product-staging',
        price: 199,
        no_index: false,
        no_follow: false,
      },
      testAccountId
    )

    expect(initial.no_index).toBe(false)

    // Update with robots directives enabled and custom meta tags
    const updated = await updateProduct(
      initial.id,
      {
        meta_title: 'Draft Staging Product',
        meta_description: 'Hidden staging product not to be indexed by Google',
        no_index: true,
        no_follow: true,
        twitter_card: 'summary',
      },
      testAccountId
    )

    expect(updated).not.toBeNull()
    expect(updated?.meta_title).toBe('Draft Staging Product')
    expect(updated?.no_index).toBe(true)
    expect(updated?.no_follow).toBe(true)
    expect(updated?.twitter_card).toBe('summary')
  })

  it('generates rich Next.js Metadata with Open Graph and Twitter tags in generateMetadata', async () => {
    const product = await createProduct(
      {
        title: 'High Protein Dairy Cattle Feed 50kg',
        slug: 'dairy-cattle-feed-50kg',
        price: 1250,
        description: 'Nutritional bypass protein cattle feed for higher milk yield.',
        meta_title: 'Buy Dairy Cattle Feed 50kg | Best Milk Booster',
        meta_description: 'High energy balanced cattle feed pellets for dairy cows and buffaloes.',
        canonical_url: 'https://jatrra.com/store/products/dairy-cattle-feed-50kg',
        keywords: ['cattle feed', 'milk booster', 'dairy pellets'],
        og_title: 'Dairy Cattle Feed 50kg Special Offer',
        og_description: 'Direct village delivery on balanced dairy feed.',
        og_image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=1200',
        twitter_card: 'summary_large_image',
        no_index: false,
        no_follow: false,
      },
      testAccountId
    )

    const metadata = await generateMetadata(
      { params: Promise.resolve({ slug: product.slug }) },
      {} as any
    )

    expect(metadata.title).toBe('Buy Dairy Cattle Feed 50kg | Best Milk Booster')
    expect(metadata.description).toBe(
      'High energy balanced cattle feed pellets for dairy cows and buffaloes.'
    )
    expect(metadata.alternates?.canonical).toBe(
      'https://jatrra.com/store/products/dairy-cattle-feed-50kg'
    )
    expect(metadata.keywords).toEqual(['cattle feed', 'milk booster', 'dairy pellets'])
    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    })
    expect(metadata.openGraph?.title).toBe('Dairy Cattle Feed 50kg Special Offer')
    expect(metadata.openGraph?.description).toBe('Direct village delivery on balanced dairy feed.')
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=1200',
        width: 1200,
        height: 630,
        alt: 'High Protein Dairy Cattle Feed 50kg',
      },
    ])
    expect((metadata.twitter as any)?.card).toBe('summary_large_image')
  })

  it('falls back gracefully to product title and description when SEO fields are empty', async () => {
    const product = await createProduct(
      {
        title: 'Galvanized Farm Milk Can 20L',
        slug: 'farm-milk-can-20l',
        price: 1850,
        description: 'Heavy duty food grade stainless steel milk container.',
        images: ['https://example.com/milk-can.jpg'],
      },
      testAccountId
    )

    const metadata = await generateMetadata(
      { params: Promise.resolve({ slug: product.slug }) },
      {} as any
    )

    expect(metadata.title).toBe('Galvanized Farm Milk Can 20L | Jatrra Store')
    expect(metadata.description).toContain('Heavy duty food grade stainless steel milk container')
    expect(metadata.openGraph?.title).toBe('Galvanized Farm Milk Can 20L | Jatrra Store')
    expect((metadata.openGraph?.images as any)?.[0]).toMatchObject({
      url: 'https://example.com/milk-can.jpg',
    })
  })

  it('persists SEO attributes via API endpoints (POST /api/products & PUT /api/products/[slug])', async () => {
    // 1. Create via API
    const postReq = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Battery Knapsack Sprayer 16L',
        slug: 'battery-knapsack-sprayer-16l',
        price: 2199,
        category: 'agri-tools',
        meta_title: 'Battery Knapsack Sprayer 16L Online in India',
        meta_description: 'Rechargeable 12V agriculture sprayer for pesticides and foliar spray.',
        canonical_url: 'https://jatrra.com/store/products/battery-knapsack-sprayer-16l',
        keywords: ['knapsack sprayer', 'agriculture battery sprayer'],
        no_index: false,
        no_follow: false,
      }),
    })

    const postRes = await createProductRoute(postReq)
    expect(postRes.status).toBe(200)
    const postData = await postRes.json()
    expect(postData.success).toBe(true)
    expect(postData.product.meta_title).toBe('Battery Knapsack Sprayer 16L Online in India')
    expect(postData.product.keywords).toEqual(['knapsack sprayer', 'agriculture battery sprayer'])

    const productId = postData.product.id

    // 2. Update via API
    const putReq = new Request(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meta_title: 'Updated Sprayer Title for SEO',
        no_index: true,
      }),
    })

    const putRes = await updateProductRoute(putReq, { params: Promise.resolve({ slug: productId }) })
    expect(putRes.status).toBe(200)
    const putData = await putRes.json()
    expect(putData.success).toBe(true)
    expect(putData.product.meta_title).toBe('Updated Sprayer Title for SEO')
    expect(putData.product.no_index).toBe(true)

    // 3. Fetch via GET /api/products/[slug]
    const getReq = new Request(`http://localhost:3000/api/products/${productId}`)
    const getRes = await getProductRoute(getReq, { params: Promise.resolve({ slug: productId }) })
    expect(getRes.status).toBe(200)
    const getData = await getRes.json()
    expect(getData.product.meta_title).toBe('Updated Sprayer Title for SEO')
    expect(getData.product.no_index).toBe(true)
  })
})
