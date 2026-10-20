import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  DeliveryAgent,
  DeliveryStatus,
  DriverManifestStats,
  PaymentCollectionMethod,
  CancellationReason,
  ProofOfDeliveryType,
  DeliveryResolution
} from '@/types'
import { normalizePhone } from '@/lib/whatsapp/phone-utils'

// Lazy-initialized admin client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

// Resilient default seed products matching Jatrra Farm & Rural Essentials catalog
export const DEFAULT_SEED_PRODUCTS: Omit<Product, 'id' | 'account_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Balanced Cattle Feed Pellets',
    slug: 'balanced-cattle-feed-pellets',
    category: 'cattle-feed',
    weight: '50 kg Pack',
    rating: 4.8,
    reviews: 214,
    price: 1249,
    original_price: 1450,
    badge: 'Best Seller',
    badge_color: 'bg-amber-500 text-white',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80'
    ],
    description: '22% crude bypass protein with fortified minerals for peak dairy yield and SNF.',
    is_active: true
  },
  {
    title: 'Chelated Mineral Mixture',
    slug: 'chelated-mineral-mixture',
    category: 'cattle-feed',
    weight: '5 kg Bucket',
    rating: 4.9,
    reviews: 182,
    price: 680,
    original_price: 790,
    badge: 'Organic',
    badge_color: 'bg-emerald-600 text-white',
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Chelated Zinc, Cobalt, Selenium and Copper for higher conception rate and immunity.',
    is_active: true
  },
  {
    title: 'Calci-Gold Liquid Calcium',
    slug: 'calci-gold-liquid-calcium',
    category: 'cattle-feed',
    weight: '5 Litre',
    rating: 4.8,
    reviews: 145,
    price: 849,
    original_price: 999,
    badge: 'High Yield',
    badge_color: 'bg-blue-600 text-white',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Enriched with Vitamin D3 & B12. Prevents post-calving milk fever in cows and buffaloes.',
    is_active: true
  },
  {
    title: 'Certified Hybrid Mustard Seed',
    slug: 'certified-hybrid-mustard-seed',
    category: 'seeds-fert',
    weight: '2 kg Pack',
    rating: 4.7,
    reviews: 96,
    price: 520,
    original_price: 620,
    badge: 'Certified',
    badge_color: 'bg-emerald-600 text-white',
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Pusa Bold hybrid seed with 42% high oil yield and superior pest tolerance.',
    is_active: true
  },
  {
    title: 'Bio NPK Liquid Biofertilizer',
    slug: 'bio-npk-liquid-biofertilizer',
    category: 'seeds-fert',
    weight: '1 Litre',
    rating: 4.8,
    reviews: 110,
    price: 320,
    original_price: 399,
    badge: 'Eco Bio',
    badge_color: 'bg-emerald-700 text-white',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Azotobacter and PSB microbial consortium for high organic soil root uptake.',
    is_active: true
  },
  {
    title: 'Knapsack Battery Sprayer 16L',
    slug: 'knapsack-battery-sprayer-16l',
    category: 'agri-tools',
    weight: '16 Litre Tank',
    rating: 4.9,
    reviews: 340,
    price: 2450,
    original_price: 2999,
    badge: 'Heavy Duty',
    badge_color: 'bg-purple-600 text-white',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Dual 12V 12Ah battery motor with 4 brass nozzles and stainless extendable lance.',
    is_active: true
  },
  {
    title: 'Forged Chaff Cutter Blade',
    slug: 'forged-chaff-cutter-blade',
    category: 'agri-tools',
    weight: 'Pair (2 Pcs)',
    rating: 4.7,
    reviews: 84,
    price: 799,
    original_price: 950,
    badge: 'Hardened',
    badge_color: 'bg-slate-700 text-white',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'High-carbon EN-45 spring steel for heavy corn and fodder chaff cutting machines.',
    is_active: true
  },
  {
    title: 'Stainless Steel Milk Can 20L',
    slug: 'stainless-steel-milk-can-20l',
    category: 'cattle-feed',
    weight: '20 Litre',
    rating: 4.8,
    reviews: 130,
    price: 1890,
    original_price: 2250,
    badge: 'Food Grade',
    badge_color: 'bg-blue-700 text-white',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1585758855271-21b1920a8360?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Airtight lid with silicone seal ring, leakproof handle for daily dairy collection.',
    is_active: true
  },
  {
    title: 'Heavy Cast Iron Kadhai 4L',
    slug: 'heavy-cast-iron-kadhai-4l',
    category: 'home-kitchen',
    weight: '3.4 kg Solid',
    rating: 4.9,
    reviews: 420,
    price: 1150,
    original_price: 1399,
    badge: 'Pure Iron',
    badge_color: 'bg-orange-600 text-white',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1584990347449-39955747cb98?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Pre-seasoned virgin cast iron kadai with brass handles for healthy rustic cooking.',
    is_active: true
  },
  {
    title: 'Galvanized Grain Drum 100Kg',
    slug: 'galvanized-grain-drum-100kg',
    category: 'home-kitchen',
    weight: '100 kg Storage',
    rating: 4.8,
    reviews: 175,
    price: 1750,
    original_price: 2100,
    badge: 'Pest Proof',
    badge_color: 'bg-slate-800 text-white',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Anti-rust GI drum with airtight lock clamp for dry seed and wheat preservation.',
    is_active: true
  }
]

// Fallback in-memory & file-backed store for products when DB table is not yet created
const memoryProducts: Map<string, Product> = new Map()
const memoryOrders: Map<string, Order> = new Map()
let orderCounter = 1024

function getStorageFilePath(): string {
  const dir = path.join(process.cwd(), '.data')
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // Ignore directory create errors
    }
  }
  return path.join(dir, 'products.json')
}

function persistProductsToFile() {
  try {
    const file = getStorageFilePath()
    const data = Array.from(memoryProducts.values())
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[orders/store] could not write products file:', err)
  }
}

function seedMemoryProducts(accountId: string) {
  if (memoryProducts.size > 0) return

  // Attempt to read from file first
  try {
    const file = getStorageFilePath()
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      const parsed: Product[] = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((p) => memoryProducts.set(p.id, p))
        return
      }
    }
  } catch (err) {
    console.warn('[orders/store] failed loading stored products from disk:', err)
  }

  // Fallback to default seeds
  const now = new Date().toISOString()
  DEFAULT_SEED_PRODUCTS.forEach((p, idx) => {
    const id = `prod-${idx + 1}`
    memoryProducts.set(id, {
      ...p,
      id,
      account_id: accountId,
      created_at: now,
      updated_at: now
    })
  })

  persistProductsToFile()
}

function getOrdersFilePath(): string {
  const dir = path.join(process.cwd(), '.data')
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // Ignore
    }
  }
  return path.join(dir, 'orders.json')
}

export function persistOrdersToFile() {
  try {
    const file = getOrdersFilePath()
    const uniqueOrders = Array.from(new Set(memoryOrders.values()))
    fs.writeFileSync(file, JSON.stringify(uniqueOrders, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[orders/store] could not write orders file:', err)
  }
}

export function seedMemoryOrders(accountId: string) {
  if (memoryOrders.size > 0) return

  try {
    const file = getOrdersFilePath()
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      const parsed: Order[] = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((o) => {
          memoryOrders.set(o.id, o)
          memoryOrders.set(o.short_code, o)
        })
        return
      }
    }
  } catch (err) {
    console.warn('[orders/store] failed loading stored orders:', err)
  }

  // Seed realistic demo rural orders
  const now = new Date()
  const defaultDemoOrders: Order[] = [
    {
      id: 'ord-1024',
      account_id: accountId,
      short_code: '1024',
      customer_name: 'Gurpreet Singh',
      phone_number: '+91 98765 43210',
      items: [
        {
          product_id: 'prod-1',
          title: 'Balanced Cattle Feed Pellets',
          price: 1249,
          quantity: 2,
          image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80'
        },
        {
          product_id: 'prod-2',
          title: 'Chelated Mineral Mixture',
          price: 680,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 3178,
      status: 'CONFIRMED',
      shipping_address: 'Village Kheri Gurna, Near Old Gurudwara, Rajpura, Punjab 140401',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Please deliver after 4 PM when tractors return from fields.',
      created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      delivery_agent_id: null,
      delivery_agent: null,
      delivery_status: 'UNASSIGNED'
    },
    {
      id: 'ord-1025',
      account_id: accountId,
      short_code: '1025',
      customer_name: 'Manoj Patel',
      phone_number: '+91 98220 11223',
      items: [
        {
          product_id: 'prod-3',
          title: 'Calci-Gold Liquid Calcium',
          price: 849,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 849,
      status: 'CONFIRMED',
      shipping_address: 'Dairy Farm Plot 14, Anand Bypass, Anand, Gujarat 388001',
      payment_preference: 'UPI on Delivery',
      notes: 'Urgent for milking cows.',
      created_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      delivery_agent_id: null,
      delivery_agent: null,
      delivery_status: 'UNASSIGNED'
    },
    {
      id: 'ord-1026',
      account_id: accountId,
      short_code: '1026',
      customer_name: 'Suresh Verma',
      phone_number: '+91 94140 77889',
      items: [
        {
          product_id: 'prod-4',
          title: 'Certified Hybrid Mustard Seed',
          price: 520,
          quantity: 4,
          image_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 2080,
      status: 'PENDING_WHATSAPP',
      shipping_address: 'Kishan Mandi Shop #4, Alwar, Rajasthan 301001',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Awaiting farmer confirmation via WhatsApp.',
      created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      delivery_agent_id: null,
      delivery_agent: null,
      delivery_status: 'UNASSIGNED'
    }
  ]

  defaultDemoOrders.forEach((o) => {
    memoryOrders.set(o.id, o)
    memoryOrders.set(o.short_code, o)
  })

  persistOrdersToFile()
}

// Helper to resolve an account ID
export async function getDefaultAccountId(): Promise<string> {
  try {
    const { data: accounts } = await supabaseAdmin()
      .from('accounts')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)

    if (accounts && accounts.length > 0) {
      return accounts[0].id
    }
  } catch (err) {
    console.warn('[orders/store] could not query accounts:', err)
  }
  return 'dbca4278-0890-4bf7-b07c-08adf6e42f7a' // default fallback account
}

/**
 * Resolve the WhatsApp support phone number for deep links.
 */
export async function getSupportPhoneNumber(accountId?: string): Promise<string> {
  const envPhone = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_PHONE || process.env.WHATSAPP_SUPPORT_PHONE
  if (envPhone && envPhone.trim()) {
    return normalizePhone(envPhone.trim())
  }

  try {
    const query = supabaseAdmin().from('whatsapp_config').select('phone_number_id, phone_number')
    if (accountId) {
      query.eq('account_id', accountId)
    }
    const { data: configs } = await query.limit(1)
    if (configs && configs.length > 0) {
      const cfg = configs[0]
      const phone = cfg.phone_number || cfg.phone_number_id
      if (phone) return normalizePhone(String(phone))
    }
  } catch (err) {
    console.warn('[orders/store] could not fetch whatsapp_config:', err)
  }

  // Graceful fallback phone matching Jatrra Farmer Helpline (+91 8815356175)
  return '918815356175'
}

/**
 * List products with optional category, search, and account filtering.
 */
export async function listProducts(options?: {
  accountId?: string
  category?: string
  search?: string
  activeOnly?: boolean
}): Promise<Product[]> {
  const accountId = options?.accountId || await getDefaultAccountId()
  seedMemoryProducts(accountId)

  try {
    let query = supabaseAdmin()
      .from('products')
      .select('*')
      .eq('account_id', accountId)

    if (options?.activeOnly !== false) {
      query = query.eq('is_active', true)
    }

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category)
    }

    if (options?.search) {
      query = query.ilike('title', `%${options.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        ...row,
        price: Number(row.price),
        original_price: row.original_price ? Number(row.original_price) : undefined,
        images: Array.isArray(row.images) ? row.images : []
      }))
    }
  } catch (err) {
    console.warn('[orders/store] failed reading products table, using fallback:', err)
  }

  // Fallback to memory
  const results = Array.from(memoryProducts.values()).filter(p => {
    if (options?.activeOnly !== false && !p.is_active) return false
    if (options?.category && options.category !== 'all' && p.category !== options.category) return false
    if (options?.search) {
      const s = options.search.toLowerCase()
      const inTitle = p.title.toLowerCase().includes(s)
      const inDesc = p.description?.toLowerCase().includes(s) || false
      const inCat = p.category?.toLowerCase().includes(s) || false
      if (!inTitle && !inDesc && !inCat) return false
    }
    return true
  })
  return results
}

/**
 * Get product by slug.
 */
export async function getProductBySlug(slug: string, accountId?: string): Promise<Product | null> {
  const targetAccountId = accountId || await getDefaultAccountId()
  seedMemoryProducts(targetAccountId)

  try {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select('*')
      .eq('account_id', targetAccountId)
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      return {
        ...data,
        price: Number(data.price),
        original_price: data.original_price ? Number(data.original_price) : undefined,
        images: Array.isArray(data.images) ? data.images : []
      }
    }
  } catch (err) {
    console.warn('[orders/store] failed querying product by slug:', err)
  }

  // Check fallback
  for (const prod of memoryProducts.values()) {
    if (prod.slug === slug) return prod
  }
  return null
}

/**
 * Get product by ID.
 */
export async function getProductById(id: string, accountId?: string): Promise<Product | null> {
  const targetAccountId = accountId || await getDefaultAccountId()
  seedMemoryProducts(targetAccountId)

  try {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select('*')
      .eq('account_id', targetAccountId)
      .eq('id', id)
      .maybeSingle()

    if (!error && data) {
      return {
        ...data,
        price: Number(data.price),
        original_price: data.original_price ? Number(data.original_price) : undefined,
        images: Array.isArray(data.images) ? data.images : []
      }
    }
  } catch (err) {
    console.warn('[orders/store] failed querying product by id:', err)
  }

  return memoryProducts.get(id) || null
}

/**
 * Sanitize metadata string by completely stripping script/style tags, HTML tags, and trimming.
 */
export function sanitizeMetaText(str?: string | null): string | null {
  if (!str) return null
  let cleaned = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  cleaned = cleaned.replace(/<[^>]*>?/gm, '')
  cleaned = cleaned.trim()
  return cleaned || null
}

/**
 * Create a new product.
 */
export async function createProduct(
  input: Partial<Product>,
  accountId?: string
): Promise<Product> {
  const targetAccountId = accountId || input.account_id || await getDefaultAccountId()
  seedMemoryProducts(targetAccountId)

  const now = new Date().toISOString()
  const id = input.id || `prod-${Date.now()}`
  const rawSlug = input.slug || input.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `prod-${Date.now()}`

  const product: Product = {
    id,
    account_id: targetAccountId,
    title: input.title || 'Untitled Product',
    slug: rawSlug,
    category: input.category || 'cattle-feed',
    price: Number(input.price) || 0,
    original_price: input.original_price ? Number(input.original_price) : undefined,
    stock: input.stock !== undefined ? Number(input.stock) : 50,
    weight: input.weight || 'Standard Pack',
    rating: Number(input.rating) || 4.8,
    reviews: Number(input.reviews) || 0,
    badge: input.badge || undefined,
    badge_color: input.badge_color || 'bg-brand-600 text-white',
    images: Array.isArray(input.images) && input.images.length > 0 ? input.images : [
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80'
    ],
    description: input.description || '',
    brochure_url: input.brochure_url || null,
    // SEO fields
    meta_title: sanitizeMetaText(input.meta_title),
    meta_description: sanitizeMetaText(input.meta_description),
    canonical_url: input.canonical_url?.trim() || null,
    keywords: Array.isArray(input.keywords) ? input.keywords.map((k) => k.trim()).filter(Boolean) : [],
    og_title: sanitizeMetaText(input.og_title),
    og_description: sanitizeMetaText(input.og_description),
    og_image_url: input.og_image_url?.trim() || null,
    twitter_card: input.twitter_card === 'summary' ? 'summary' : 'summary_large_image',
    no_index: Boolean(input.no_index),
    no_follow: Boolean(input.no_follow),
    structured_data: input.structured_data || null,
    is_active: input.is_active !== undefined ? Boolean(input.is_active) : true,
    created_at: now,
    updated_at: now
  }

  // Attempt database insert
  try {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .insert({
        id: product.id.startsWith('prod-') ? undefined : product.id,
        account_id: product.account_id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        images: product.images,
        description: product.description,
        is_active: product.is_active,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
        canonical_url: product.canonical_url,
        keywords: product.keywords,
        og_title: product.og_title,
        og_description: product.og_description,
        og_image_url: product.og_image_url,
        twitter_card: product.twitter_card,
        no_index: product.no_index,
        no_follow: product.no_follow,
        structured_data: product.structured_data
      })
      .select('*')
      .single()

    if (!error && data) {
      product.id = data.id
    }
  } catch (err) {
    console.warn('[orders/store] could not write to products table in DB:', err)
  }

  memoryProducts.set(product.id, product)
  persistProductsToFile()
  return product
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  accountId?: string
): Promise<Product | null> {
  const targetAccountId = accountId || await getDefaultAccountId()
  seedMemoryProducts(targetAccountId)

  const existing = memoryProducts.get(id)
  if (!existing) {
    return null
  }

  const updated: Product = {
    ...existing,
    ...updates,
    id: existing.id,
    account_id: existing.account_id,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    original_price: updates.original_price !== undefined ? (updates.original_price ? Number(updates.original_price) : undefined) : existing.original_price,
    stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
    images: Array.isArray(updates.images) ? updates.images : existing.images,
    brochure_url: updates.brochure_url !== undefined ? updates.brochure_url : existing.brochure_url,
    meta_title: updates.meta_title !== undefined ? sanitizeMetaText(updates.meta_title) : existing.meta_title,
    meta_description: updates.meta_description !== undefined ? sanitizeMetaText(updates.meta_description) : existing.meta_description,
    canonical_url: updates.canonical_url !== undefined ? (updates.canonical_url ? updates.canonical_url.trim() : null) : existing.canonical_url,
    keywords: Array.isArray(updates.keywords) ? updates.keywords.map((k) => k.trim()).filter(Boolean) : existing.keywords,
    og_title: updates.og_title !== undefined ? sanitizeMetaText(updates.og_title) : existing.og_title,
    og_description: updates.og_description !== undefined ? sanitizeMetaText(updates.og_description) : existing.og_description,
    og_image_url: updates.og_image_url !== undefined ? (updates.og_image_url ? updates.og_image_url.trim() : null) : existing.og_image_url,
    twitter_card: updates.twitter_card !== undefined ? updates.twitter_card : existing.twitter_card,
    no_index: updates.no_index !== undefined ? Boolean(updates.no_index) : existing.no_index,
    no_follow: updates.no_follow !== undefined ? Boolean(updates.no_follow) : existing.no_follow,
    structured_data: updates.structured_data !== undefined ? updates.structured_data : existing.structured_data,
    updated_at: new Date().toISOString()
  }

  // Attempt DB update
  try {
    await supabaseAdmin()
      .from('products')
      .update({
        title: updated.title,
        slug: updated.slug,
        price: updated.price,
        stock: updated.stock,
        images: updated.images,
        description: updated.description,
        is_active: updated.is_active,
        meta_title: updated.meta_title,
        meta_description: updated.meta_description,
        canonical_url: updated.canonical_url,
        keywords: updated.keywords,
        og_title: updated.og_title,
        og_description: updated.og_description,
        og_image_url: updated.og_image_url,
        twitter_card: updated.twitter_card,
        no_index: updated.no_index,
        no_follow: updated.no_follow,
        structured_data: updated.structured_data
      })
      .eq('id', id)
  } catch (err) {
    console.warn('[orders/store] could not update products table in DB:', err)
  }

  memoryProducts.set(id, updated)
  persistProductsToFile()
  return updated
}

/**
 * Delete a product.
 */
export async function deleteProduct(id: string, accountId?: string): Promise<boolean> {
  const targetAccountId = accountId || await getDefaultAccountId()
  seedMemoryProducts(targetAccountId)

  const had = memoryProducts.delete(id)

  try {
    await supabaseAdmin()
      .from('products')
      .delete()
      .eq('id', id)
  } catch (err) {
    console.warn('[orders/store] could not delete from products table in DB:', err)
  }

  if (had) {
    persistProductsToFile()
  }
  return had
}

export interface BulkProductImportSummary {
  total: number
  createdCount: number
  updatedCount: number
  failedCount: number
  products: Product[]
  errors: { row: number; title: string; reason: string }[]
}

/**
 * Bulk create or update products from CSV / Google Sheets imports.
 */
export async function bulkCreateOrUpdateProducts(
  items: Partial<Product>[],
  options: { updateExisting?: boolean; accountId?: string } = {}
): Promise<BulkProductImportSummary> {
  const targetAccountId = options.accountId || (await getDefaultAccountId())
  seedMemoryProducts(targetAccountId)

  const updateExisting = options.updateExisting ?? true
  const created: Product[] = []
  let updatedCount = 0
  let createdCount = 0
  let failedCount = 0
  const errors: { row: number; title: string; reason: string }[] = []

  // Build lookup index of existing products by slug and lowercase title
  const existingBySlug = new Map<string, Product>()
  const existingByTitle = new Map<string, Product>()
  for (const p of memoryProducts.values()) {
    if (p.slug) existingBySlug.set(p.slug.toLowerCase(), p)
    if (p.title) existingByTitle.set(p.title.trim().toLowerCase(), p)
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item.title || typeof item.price === 'undefined' || isNaN(Number(item.price))) {
      failedCount++
      errors.push({
        row: i + 1,
        title: item.title || 'Unknown',
        reason: 'Missing required title or valid price',
      })
      continue
    }

    const cleanTitle = item.title.trim()
    const cleanSlug =
      item.slug?.trim().toLowerCase() ||
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    const existingMatch = updateExisting
      ? existingBySlug.get(cleanSlug) || existingByTitle.get(cleanTitle.toLowerCase())
      : null

    if (existingMatch) {
      // Update existing
      const updated = await updateProduct(
        existingMatch.id,
        {
          title: cleanTitle,
          price: Number(item.price),
          original_price:
            item.original_price !== undefined ? Number(item.original_price) : existingMatch.original_price,
          stock: item.stock !== undefined ? Number(item.stock) : existingMatch.stock,
          category: item.category || existingMatch.category,
          weight: item.weight || existingMatch.weight,
          description: item.description !== undefined ? item.description : existingMatch.description,
          images:
            Array.isArray(item.images) && item.images.length > 0 ? item.images : existingMatch.images,
          badge: item.badge !== undefined ? item.badge : existingMatch.badge,
          badge_color: item.badge_color || existingMatch.badge_color,
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : existingMatch.is_active,
        },
        targetAccountId
      )

      if (updated) {
        updatedCount++
        created.push(updated)
      } else {
        failedCount++
      }
    } else {
      // Create new
      try {
        const newProduct = await createProduct(
          {
            ...item,
            title: cleanTitle,
            slug: cleanSlug,
            price: Number(item.price),
            account_id: targetAccountId,
          },
          targetAccountId
        )

        createdCount++
        created.push(newProduct)
        if (newProduct.slug) existingBySlug.set(newProduct.slug.toLowerCase(), newProduct)
        existingByTitle.set(cleanTitle.toLowerCase(), newProduct)
      } catch (err: any) {
        failedCount++
        errors.push({
          row: i + 1,
          title: cleanTitle,
          reason: err?.message || 'Creation failed',
        })
      }
    }
  }

  return {
    total: items.length,
    createdCount,
    updatedCount,
    failedCount,
    products: created,
    errors,
  }
}

/**
 * Generate human-readable short code (e.g. ORD-1024).
 */
export async function generateOrderShortCode(): Promise<string> {
  try {
    const { data } = await supabaseAdmin().rpc('generate_order_short_code')
    if (data && typeof data === 'string') return data
  } catch {
    // Sequence not yet available in DB
  }
  orderCounter += 1
  return `ORD-${orderCounter}`
}

export interface CreateDraftOrderParams {
  items: OrderItem[]
  customerName?: string
  phoneNumber?: string
  shippingAddress?: string
  accountId?: string
  notes?: string
}

/**
 * Creates a draft order and generates WhatsApp checkout deep link.
 */
export async function createDraftOrder(params: CreateDraftOrderParams): Promise<{
  order: Order
  whatsapp_url: string
  support_phone: string
}> {
  const accountId = params.accountId || await getDefaultAccountId()
  const shortCode = await generateOrderShortCode()
  const totalAmount = params.items.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0)
  const now = new Date().toISOString()
  const supportPhone = await getSupportPhoneNumber(accountId)

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    account_id: accountId,
    short_code: shortCode,
    customer_name: params.customerName || null,
    phone_number: params.phoneNumber ? normalizePhone(params.phoneNumber) : null,
    items: params.items,
    total_amount: Math.round(totalAmount * 100) / 100,
    status: 'PENDING_WHATSAPP',
    shipping_address: params.shippingAddress || null,
    payment_preference: null,
    notes: params.notes || null,
    delivery_agent_id: null,
    delivery_agent: null,
    delivery_status: 'UNASSIGNED',
    created_at: now,
    updated_at: now
  }

  // Try DB persistence
  try {
    const { data, error } = await supabaseAdmin()
      .from('orders')
      .insert({
        account_id: newOrder.account_id,
        short_code: newOrder.short_code,
        customer_name: newOrder.customer_name,
        phone_number: newOrder.phone_number,
        items: newOrder.items,
        total_amount: newOrder.total_amount,
        status: newOrder.status,
        shipping_address: newOrder.shipping_address,
        notes: newOrder.notes
      })
      .select('*')
      .single()

    if (!error && data) {
      newOrder.id = data.id
    }
  } catch (err) {
    console.warn('[orders/store] could not insert into orders table, persisting in memory:', err)
  }

  // Always keep in memory map as well for hot lookups
  memoryOrders.set(newOrder.short_code, newOrder)
  memoryOrders.set(newOrder.id, newOrder)

  // Construct WhatsApp dynamic deep-link matching Jatrra format
  let messageText = `Hello Jatrra! I want to order #${newOrder.short_code}:\n`
  newOrder.items.forEach((item, idx) => {
    messageText += `${idx + 1}. ${item.title} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`
  })
  messageText += `\nTotal: ₹${newOrder.total_amount.toFixed(2)}`
  if (newOrder.shipping_address) {
    messageText += `\nDelivery Address: ${newOrder.shipping_address}`
  }
  const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(messageText)}`

  return {
    order: newOrder,
    whatsapp_url: whatsappUrl,
    support_phone: supportPhone
  }
}

/**
 * Get order by ID or Short Code
 */
export async function getOrder(idOrCode: string): Promise<Order | null> {
  const accountId = await getDefaultAccountId()
  seedMemoryOrders(accountId)

  // Check memory first
  if (memoryOrders.has(idOrCode)) {
    return memoryOrders.get(idOrCode)!
  }

  try {
    const isShortCode = idOrCode.toUpperCase().startsWith('ORD-')
    const query = supabaseAdmin()
      .from('orders')
      .select('*, contacts(id, name, phone), conversations(id, last_message_text)')

    if (isShortCode) {
      query.eq('short_code', idOrCode.toUpperCase())
    } else {
      query.eq('id', idOrCode)
    }

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      const order: Order = {
        ...data,
        total_amount: Number(data.total_amount),
        items: Array.isArray(data.items) ? data.items : [],
        contact: data.contacts,
        conversation: data.conversations
      }
      memoryOrders.set(order.short_code, order)
      memoryOrders.set(order.id, order)
      return order
    }
  } catch (err) {
    console.warn('[orders/store] failed querying order:', err)
  }

  return null
}

/**
 * Find an active/pending order by conversation ID.
 */
export async function getPendingOrderByConversation(conversationId: string): Promise<Order | null> {
  for (const order of memoryOrders.values()) {
    if (order.conversation_id === conversationId && order.status === 'PENDING_WHATSAPP') {
      return order
    }
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('orders')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('status', 'PENDING_WHATSAPP')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      const order: Order = {
        ...data,
        total_amount: Number(data.total_amount),
        items: Array.isArray(data.items) ? data.items : []
      }
      memoryOrders.set(order.short_code, order)
      memoryOrders.set(order.id, order)
      return order
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[orders/store] error looking up pending order by conversation:', err)
    }
  }

  return null
}

/**
 * Bind sender contact and conversation to an existing order.
 */
export async function bindOrderToContactAndConversation(
  shortCodeOrId: string,
  contactId: string,
  conversationId: string,
  phoneNumber: string
): Promise<Order | null> {
  const order = await getOrder(shortCodeOrId)
  if (!order) return null

  order.customer_id = contactId
  order.conversation_id = conversationId
  order.phone_number = normalizePhone(phoneNumber)
  if (order.status === 'DRAFT') {
    order.status = 'PENDING_WHATSAPP'
  }
  order.updated_at = new Date().toISOString()

  // Update in memory
  memoryOrders.set(order.short_code, order)
  memoryOrders.set(order.id, order)

  // Update in DB
  try {
    await supabaseAdmin()
      .from('orders')
      .update({
        customer_id: order.customer_id,
        conversation_id: order.conversation_id,
        phone_number: order.phone_number,
        status: order.status,
        updated_at: order.updated_at
      })
      .eq('id', order.id)
  } catch (err) {
    console.warn('[orders/store] failed updating order binding in DB:', err)
  }

  return order
}

/**
 * Update order shipping address.
 */
export async function updateOrderShippingAddress(
  orderIdOrCode: string,
  shippingAddress: string
): Promise<Order | null> {
  const order = await getOrder(orderIdOrCode)
  if (!order) return null

  order.shipping_address = shippingAddress.trim()
  order.updated_at = new Date().toISOString()

  memoryOrders.set(order.short_code, order)
  memoryOrders.set(order.id, order)

  try {
    await supabaseAdmin()
      .from('orders')
      .update({
        shipping_address: order.shipping_address,
        updated_at: order.updated_at
      })
      .eq('id', order.id)
  } catch (err) {
    console.warn('[orders/store] failed updating shipping address in DB:', err)
  }

  return order
}

/**
 * Confirm order status with payment preference.
 */
export async function confirmOrderStatus(
  orderIdOrCode: string,
  paymentPreference: string = 'Cash on Delivery (COD)'
): Promise<Order | null> {
  const order = await getOrder(orderIdOrCode)
  if (!order) return null

  order.status = 'CONFIRMED'
  order.payment_preference = paymentPreference
  order.updated_at = new Date().toISOString()

  memoryOrders.set(order.short_code, order)
  memoryOrders.set(order.id, order)

  try {
    await supabaseAdmin()
      .from('orders')
      .update({
        status: 'CONFIRMED',
        payment_preference: order.payment_preference,
        updated_at: order.updated_at
      })
      .eq('id', order.id)
  } catch (err) {
    console.warn('[orders/store] failed confirming order in DB:', err)
  }

  return order
}

/**
 * Update order status manually (e.g. from Admin Dashboard).
 */
export async function updateOrderStatus(
  orderIdOrCode: string,
  status: OrderStatus,
  notes?: string
): Promise<Order | null> {
  const order = await getOrder(orderIdOrCode)
  if (!order) return null

  order.status = status
  if (notes) order.notes = notes
  order.updated_at = new Date().toISOString()

  memoryOrders.set(order.short_code, order)
  memoryOrders.set(order.id, order)

  try {
    await supabaseAdmin()
      .from('orders')
      .update({
        status,
        notes: order.notes,
        updated_at: order.updated_at
      })
      .eq('id', order.id)
  } catch (err) {
    console.warn('[orders/store] failed updating order status in DB:', err)
  }

  return order
}

/**
 * Assign or update delivery agent on an order.
 */
export async function updateOrderDeliveryAgent(
  orderIdOrCode: string,
  agent: DeliveryAgent | null,
  deliveryStatus?: DeliveryStatus
): Promise<Order | null> {
  const order = await getOrder(orderIdOrCode)
  if (!order) return null

  order.delivery_agent_id = agent ? agent.id : null
  order.delivery_agent = agent || null
  order.delivery_status = deliveryStatus || (agent ? 'ASSIGNED' : 'UNASSIGNED')
  order.updated_at = new Date().toISOString()

  memoryOrders.set(order.short_code, order)
  memoryOrders.set(order.id, order)
  persistOrdersToFile()

  try {
    await supabaseAdmin()
      .from('orders')
      .update({
        delivery_agent_id: order.delivery_agent_id,
        delivery_status: order.delivery_status,
        updated_at: order.updated_at
      })
      .eq('id', order.id)
  } catch (err) {
    console.warn('[orders/store] failed updating order delivery agent in DB:', err)
  }

  return order
}

/**
 * List orders for Admin Dashboard.
 */
export async function listOrders(options?: {
  accountId?: string
  status?: string
  search?: string
  limit?: number
}): Promise<Order[]> {
  const accountId = options?.accountId || await getDefaultAccountId()
  seedMemoryOrders(accountId)

  try {
    let query = supabaseAdmin()
      .from('orders')
      .select('*, contacts(id, name, phone), conversations(id, last_message_text, last_message_at)')
      .eq('account_id', accountId)

    if (options?.status && options.status !== 'ALL') {
      query = query.eq('status', options.status)
    }

    if (options?.search) {
      query = query.or(`short_code.ilike.%${options.search}%,phone_number.ilike.%${options.search}%,customer_name.ilike.%${options.search}%`)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(options?.limit || 50)

    if (!error && data) {
      return data.map((row: any) => ({
        ...row,
        total_amount: Number(row.total_amount),
        items: Array.isArray(row.items) ? row.items : [],
        contact: row.contacts,
        conversation: row.conversations
      }))
    }
  } catch (err) {
    console.warn('[orders/store] error listing orders from DB:', err)
  }

  // Fallback to memory
  const list = Array.from(new Set(memoryOrders.values())).filter(o => {
    if (options?.status && options.status !== 'ALL' && o.status !== options.status) return false
    if (options?.search) {
      const s = options.search.toLowerCase()
      const matchCode = o.short_code.toLowerCase().includes(s)
      const matchPhone = (o.phone_number || '').includes(s)
      const matchName = (o.customer_name || '').toLowerCase().includes(s)
      if (!matchCode && !matchPhone && !matchName) return false
    }
    return true
  })

  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Compute order analytics for admin metrics.
 */
export async function getOrderStats(accountId?: string) {
  const orders = await listOrders({ accountId })
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'PENDING_WHATSAPP').length
  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length
  const totalRevenue = orders
    .filter(o => o.status === 'CONFIRMED')
    .reduce((sum, o) => sum + o.total_amount, 0)

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    cancelledOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100
  }
}

export const DEFAULT_AGENT_MANIFEST_STOPS: (accountId: string) => Order[] = (accountId) => {
  const now = new Date()
  return [
    {
      id: 'ord-1021',
      account_id: accountId,
      short_code: '1021',
      customer_name: 'Harpreet Kaur',
      phone_number: '+91 98141 23456',
      items: [
        {
          product_id: 'prod-1',
          title: 'Balanced Cattle Feed Pellets (50kg)',
          price: 1249,
          quantity: 2,
          image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 2498,
      status: 'CONFIRMED',
      shipping_address: 'House 42, Green Avenue, Model Town, Patiala, Punjab 147001',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Near Gurudwara gate. Ring doorbell twice.',
      created_at: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      delivery_agent_id: 'agent-1',
      delivery_status: 'OUT_FOR_DELIVERY',
      stop_order: 1
    },
    {
      id: 'ord-1022',
      account_id: accountId,
      short_code: '1022',
      customer_name: 'Balwinder Singh',
      phone_number: '+91 98722 34567',
      items: [
        {
          product_id: 'prod-6',
          title: 'Knapsack Battery Sprayer 16L',
          price: 2450,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
        },
        {
          product_id: 'prod-5',
          title: 'Bio NPK Liquid Biofertilizer 1L',
          price: 320,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 2770,
      status: 'CONFIRMED',
      shipping_address: 'Kisan Sewa Kendra, Near Main Bus Stand, Sanaur, Punjab 147103',
      payment_preference: 'Prepaid (Razorpay / UPI)',
      notes: 'Prepaid parcel. Please collect signature from shop manager.',
      created_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      delivery_agent_id: 'agent-1',
      delivery_status: 'ASSIGNED',
      stop_order: 2
    },
    {
      id: 'ord-1023',
      account_id: accountId,
      short_code: '1023',
      customer_name: 'Jasbir Dhillon',
      phone_number: '+91 98881 98765',
      items: [
        {
          product_id: 'prod-3',
          title: 'Calci-Gold Liquid Calcium 5L',
          price: 849,
          quantity: 2,
          image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
        },
        {
          product_id: 'prod-2',
          title: 'Chelated Mineral Mixture 5kg',
          price: 680,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 2378,
      status: 'CONFIRMED',
      shipping_address: 'Dhillon Dairy Farm, Village Bahadurgarh, Patiala, Punjab 147021',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Call 10 minutes before arrival so farm dogs can be secured.',
      created_at: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      delivery_agent_id: 'agent-1',
      delivery_status: 'ASSIGNED',
      stop_order: 3
    },
    {
      id: 'ord-1024',
      account_id: accountId,
      short_code: '1024',
      customer_name: 'Gurpreet Singh',
      phone_number: '+91 98765 43210',
      items: [
        {
          product_id: 'prod-1',
          title: 'Balanced Cattle Feed Pellets (50kg)',
          price: 1249,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80'
        },
        {
          product_id: 'prod-2',
          title: 'Chelated Mineral Mixture 5kg',
          price: 680,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 1929,
      status: 'CONFIRMED',
      shipping_address: 'Village Kheri Gurna, Near Old Tubewell, Rajpura, Punjab 140401',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Deliver at farm barn.',
      created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      delivery_agent_id: 'agent-1',
      delivery_status: 'ASSIGNED',
      stop_order: 4
    },
    {
      id: 'ord-1019',
      account_id: accountId,
      short_code: '1019',
      customer_name: 'Satnam Singh',
      phone_number: '+91 97811 55443',
      items: [
        {
          product_id: 'prod-4',
          title: 'Certified Hybrid Mustard Seed 2kg',
          price: 520,
          quantity: 3,
          image_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 1560,
      status: 'CONFIRMED',
      shipping_address: 'Main Grain Market, Shop 18, Samana, Punjab 147101',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Morning delivery completed.',
      created_at: new Date(now.getTime() - 7 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      delivery_agent_id: 'agent-1',
      delivery_status: 'DELIVERED',
      stop_order: 5,
      payment_method_collected: 'CASH',
      amount_collected: 1560,
      delivered_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString()
    },
    {
      id: 'ord-1018',
      account_id: accountId,
      short_code: '1018',
      customer_name: 'Kuldeep Yadav',
      phone_number: '+91 94160 12345',
      items: [
        {
          product_id: 'prod-6',
          title: 'Knapsack Battery Sprayer 16L',
          price: 2450,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total_amount: 2450,
      status: 'CANCELLED',
      shipping_address: 'Flat 304, Royal City Apartments, Sirhind Road, Patiala, Punjab 147004',
      payment_preference: 'Cash on Delivery (COD)',
      notes: 'Security said customer out of town. Phone unreachable.',
      created_at: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      delivery_agent_id: 'agent-1',
      delivery_status: 'CANCELLED',
      stop_order: 6,
      cancellation_reason: 'CUSTOMER_UNAVAILABLE',
      delivery_notes: 'Door locked, tried calling 3 times with no answer.'
    }
  ]
}

export function seedDriverManifestIfEmpty(accountId: string, agentId: string = 'agent-1') {
  seedMemoryOrders(accountId)
  const existingForAgent = Array.from(new Set(memoryOrders.values())).filter(
    (o) => o.delivery_agent_id === agentId
  )
  if (existingForAgent.length === 0) {
    const defaultStops = DEFAULT_AGENT_MANIFEST_STOPS(accountId)
    defaultStops.forEach((o) => {
      memoryOrders.set(o.id, o)
      memoryOrders.set(o.short_code, o)
    })
    persistOrdersToFile()
  }
}

export function resetTestManifestStops(accountId: string = 'test-account-driver-portal', agentId: string = 'agent-1') {
  seedMemoryOrders(accountId)
  const defaultStops = DEFAULT_AGENT_MANIFEST_STOPS(accountId)
  defaultStops.forEach((o) => {
    memoryOrders.set(o.id, { ...o })
    memoryOrders.set(o.short_code, { ...o })
  })
}


/**
 * Retrieve driver manifest (ordered stops & operational shift stats).
 */
export async function getDriverManifest(
  agentId: string = 'agent-1',
  accountId?: string
): Promise<{
  agent: DeliveryAgent | null
  orders: Order[]
  stats: DriverManifestStats
}> {
  const resolvedAccountId = accountId || (await getDefaultAccountId())
  seedDriverManifestIfEmpty(resolvedAccountId, agentId)

  // Fetch agent info
  let agent: DeliveryAgent | null = null
  try {
    const { getDeliveryAgentById } = await import('@/lib/delivery-agents/store')
    agent = await getDeliveryAgentById(agentId)
  } catch (err) {
    console.warn('[orders/store] could not load agent details:', err)
  }

  // Find all orders assigned to this agent (or all if agentId === 'ALL')
  const allOrders = Array.from(new Set(memoryOrders.values()))
  const orders = allOrders
    .filter((o) => agentId === 'ALL' || o.delivery_agent_id === agentId)
    .sort((a, b) => (a.stop_order || 99) - (b.stop_order || 99))

  const totalAssigned = orders.length
  const pendingDelivery = orders.filter(
    (o) => o.delivery_status === 'ASSIGNED' || o.delivery_status === 'OUT_FOR_DELIVERY' || !o.delivery_status
  ).length
  const deliveredCount = orders.filter((o) => o.delivery_status === 'DELIVERED').length
  const cancelledCount = orders.filter((o) => o.delivery_status === 'CANCELLED').length

  const codCollected = orders
    .filter((o) => o.delivery_status === 'DELIVERED' && o.payment_method_collected === 'CASH')
    .reduce((sum, o) => sum + (o.amount_collected || 0), 0)

  const upiCollected = orders
    .filter((o) => o.delivery_status === 'DELIVERED' && o.payment_method_collected === 'UPI')
    .reduce((sum, o) => sum + (o.amount_collected || 0), 0)

  const totalCashDue = orders
    .filter(
      (o) =>
        (o.delivery_status === 'ASSIGNED' || o.delivery_status === 'OUT_FOR_DELIVERY') &&
        (!o.payment_preference ||
          o.payment_preference.toLowerCase().includes('cod') ||
          o.payment_preference.toLowerCase().includes('cash'))
    )
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const stats: DriverManifestStats = {
    totalAssigned,
    pendingDelivery,
    deliveredCount,
    cancelledCount,
    codCollected,
    upiCollected,
    totalCashDue
  }

  return {
    agent,
    orders,
    stats
  }
}

export interface ResolveDeliveryInput {
  orderIdOrCode: string
  delivery_status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'ASSIGNED'
  payment_method?: PaymentCollectionMethod
  amount_collected?: number
  upi_reference?: string
  cancellation_reason?: string
  proof_of_delivery_type?: ProofOfDeliveryType
  proof_of_delivery_data?: string
  notes?: string
}

/**
 * Resolve order delivery outcome (Delivered / Cancelled / Out for Delivery)
 * with payment verification and Proof of Delivery.
 */
export async function resolveOrderDelivery(
  input: ResolveDeliveryInput,
  accountId?: string
): Promise<{ order: Order; stats: DriverManifestStats }> {
  const resolvedAccountId = accountId || (await getDefaultAccountId())
  seedMemoryOrders(resolvedAccountId)

  const order = await getOrder(input.orderIdOrCode)
  if (!order) {
    throw new Error(`Order ${input.orderIdOrCode} not found`)
  }

  const isCOD =
    !order.payment_preference ||
    order.payment_preference.toLowerCase().includes('cod') ||
    order.payment_preference.toLowerCase().includes('cash')

  // Validation
  if (input.delivery_status === 'DELIVERED') {
    if (isCOD && input.payment_method !== 'PREPAID') {
      if (!input.payment_method || (input.payment_method !== 'CASH' && input.payment_method !== 'UPI')) {
        throw new Error('Please select a payment collection method (Cash or UPI) for COD order')
      }
      if (
        input.amount_collected === undefined ||
        input.amount_collected === null ||
        isNaN(Number(input.amount_collected)) ||
        Number(input.amount_collected) < 0
      ) {
        throw new Error('Please enter a valid payment amount collected')
      }
    }
  }

  if (input.delivery_status === 'CANCELLED' && !input.cancellation_reason) {
    throw new Error('Please select a cancellation reason')
  }

  // Update order fields
  order.delivery_status = input.delivery_status
  order.updated_at = new Date().toISOString()

  if (input.delivery_status === 'DELIVERED') {
    order.status = 'CONFIRMED'
    order.payment_method_collected = input.payment_method || (isCOD ? 'CASH' : 'PREPAID')
    order.amount_collected = input.amount_collected ?? (order.payment_method_collected === 'PREPAID' ? 0 : order.total_amount)
    order.upi_reference = input.upi_reference || null
    order.proof_of_delivery_type = input.proof_of_delivery_type || null
    order.proof_of_delivery_data = input.proof_of_delivery_data || null
    order.delivery_notes = input.notes || order.delivery_notes || null
    order.delivered_at = new Date().toISOString()
  } else if (input.delivery_status === 'CANCELLED') {
    order.status = 'CANCELLED'
    order.cancellation_reason = input.cancellation_reason || 'CUSTOMER_UNAVAILABLE'
    order.delivery_notes = input.notes || order.delivery_notes || null
  } else if (input.delivery_status === 'OUT_FOR_DELIVERY') {
    if (input.notes) order.delivery_notes = input.notes
  }

  memoryOrders.set(order.id, order)
  memoryOrders.set(order.short_code, order)
  persistOrdersToFile()

  // Update database if present
  try {
    await supabaseAdmin()
      .from('orders')
      .update({
        delivery_status: order.delivery_status,
        status: order.status,
        payment_method_collected: order.payment_method_collected,
        amount_collected: order.amount_collected,
        upi_reference: order.upi_reference,
        cancellation_reason: order.cancellation_reason,
        proof_of_delivery_type: order.proof_of_delivery_type,
        proof_of_delivery_data: order.proof_of_delivery_data,
        delivery_notes: order.delivery_notes,
        delivered_at: order.delivered_at,
        updated_at: order.updated_at
      })
      .eq('id', order.id)
  } catch (err) {
    console.warn('[orders/store] could not update order delivery resolution in DB:', err)
  }

  // Synchronize agent state & statistics
  if (order.delivery_agent_id) {
    try {
      const { getDeliveryAgentById, updateDeliveryAgent } = await import('@/lib/delivery-agents/store')
      const agent = await getDeliveryAgentById(order.delivery_agent_id)
      if (agent) {
        if (input.delivery_status === 'DELIVERED') {
          const nextActive = Math.max(0, (agent.active_orders_count || 1) - 1)
          await updateDeliveryAgent(agent.id, {
            total_deliveries: (agent.total_deliveries || 0) + 1,
            status: nextActive === 0 ? 'AVAILABLE' : agent.status
          })
          agent.active_orders_count = nextActive
        } else if (input.delivery_status === 'CANCELLED') {
          const nextActive = Math.max(0, (agent.active_orders_count || 1) - 1)
          await updateDeliveryAgent(agent.id, {
            status: nextActive === 0 ? 'AVAILABLE' : agent.status
          })
          agent.active_orders_count = nextActive
        } else if (input.delivery_status === 'OUT_FOR_DELIVERY') {
          await updateDeliveryAgent(agent.id, {
            status: 'ON_DELIVERY'
          })
        }
      }
    } catch (err) {
      console.warn('[orders/store] failed updating agent metrics:', err)
    }
  }

  const manifest = await getDriverManifest(order.delivery_agent_id || 'agent-1', resolvedAccountId)

  return {
    order,
    stats: manifest.stats
  }
}

