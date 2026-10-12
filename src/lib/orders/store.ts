import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Order, OrderItem, OrderStatus, Product } from '@/types'
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

  // Graceful fallback phone matching Jatrra Farmer Helpline (+91 98260-JATRA)
  return '919826000000'
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
        is_active: product.is_active
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
        is_active: updated.is_active
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
 * List orders for Admin Dashboard.
 */
export async function listOrders(options?: {
  accountId?: string
  status?: string
  search?: string
  limit?: number
}): Promise<Order[]> {
  const accountId = options?.accountId || await getDefaultAccountId()

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
