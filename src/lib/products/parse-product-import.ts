import type { Product } from '@/types'

export interface ParsedProductRow {
  rowNumber: number
  isValid: boolean
  error?: string
  title: string
  price: number
  original_price?: number
  category: string
  weight: string
  stock: number
  description: string
  images: string[]
  badge?: string
  badge_color?: string
  is_active: boolean
}

export interface ParsedProductImportResult {
  rows: ParsedProductRow[]
  validRows: ParsedProductRow[]
  invalidRows: ParsedProductRow[]
  totalRows: number
  hasTitleColumn: boolean
  hasPriceColumn: boolean
  detectedDelimiter: string
  headers: string[]
}

/**
 * Normalizes a header string for flexible matching
 * e.g., "Product Name" -> "productname", "Selling_Price (₹)" -> "sellingprice"
 */
function normalizeHeader(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[₹$€£\(\)\[\]\{\}_-]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Cleans numbers with currency symbols, commas, etc.
 * e.g. "₹1,249.00" -> 1249
 */
export function parsePrice(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined
  const cleaned = String(val).replace(/[₹$€£,\s]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? undefined : num
}

/**
 * Intelligent category mapper
 */
export function normalizeCategory(val?: string): string {
  if (!val) return 'cattle-feed'
  const lower = val.toLowerCase().trim()

  if (
    lower === 'cattle-feed' ||
    lower.includes('cattle') ||
    lower.includes('feed') ||
    lower.includes('dairy') ||
    lower.includes('pellet') ||
    lower.includes('calcium') ||
    lower.includes('mineral')
  ) {
    return 'cattle-feed'
  }

  if (
    lower === 'seeds-fert' ||
    lower.includes('seed') ||
    lower.includes('fert') ||
    lower.includes('bio') ||
    lower.includes('npk') ||
    lower.includes('mustard') ||
    lower.includes('wheat') ||
    lower.includes('crop')
  ) {
    return 'seeds-fert'
  }

  if (
    lower === 'agri-tools' ||
    lower.includes('tool') ||
    lower.includes('spray') ||
    lower.includes('knapsack') ||
    lower.includes('hardware') ||
    lower.includes('blade') ||
    lower.includes('tractor')
  ) {
    return 'agri-tools'
  }

  if (
    lower === 'home-kitchen' ||
    lower.includes('kitchen') ||
    lower.includes('utensil') ||
    lower.includes('cookware') ||
    lower.includes('kadhai') ||
    lower.includes('iron') ||
    lower.includes('home')
  ) {
    return 'home-kitchen'
  }

  // Fallback to formatted slug
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'cattle-feed'
}

/**
 * Parse CSV line respecting quotes and escaped quotes
 */
function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Detect delimiter: tab (Google Sheets copy-paste), comma (CSV), or semicolon
 */
function detectDelimiter(firstLine: string): string {
  const tabs = (firstLine.match(/\t/g) || []).length
  const commas = (firstLine.match(/,/g) || []).length
  const semicolons = (firstLine.match(/;/g) || []).length

  if (tabs > commas && tabs > semicolons) return '\t'
  if (semicolons > commas) return ';'
  return ','
}

/**
 * Parse raw CSV or TSV string into structured product import result
 */
export function parseProductCsv(rawText: string): ParsedProductImportResult {
  const text = rawText.trim()
  if (!text) {
    return {
      rows: [],
      validRows: [],
      invalidRows: [],
      totalRows: 0,
      hasTitleColumn: false,
      hasPriceColumn: false,
      detectedDelimiter: ',',
      headers: [],
    }
  }

  // Split lines handling CRLF and LF
  const rawLines = text.split(/\r?\n/)
  const lines = rawLines.map((l) => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return {
      rows: [],
      validRows: [],
      invalidRows: [],
      totalRows: 0,
      hasTitleColumn: false,
      hasPriceColumn: false,
      detectedDelimiter: ',',
      headers: [],
    }
  }

  const delimiter = detectDelimiter(lines[0])
  const headers = parseDelimitedLine(lines[0], delimiter)
  const normHeaders = headers.map(normalizeHeader)

  // Find column indexes
  const titleIdx = normHeaders.findIndex((h) =>
    ['title', 'name', 'product', 'productname', 'producttitle', 'item', 'itemname'].includes(h)
  )
  const priceIdx = normHeaders.findIndex((h) =>
    ['price', 'sellingprice', 'cost', 'rate', 'amount', 'saleprice', 'finalprice'].includes(h)
  )
  const originalPriceIdx = normHeaders.findIndex((h) =>
    [
      'originalprice',
      'mrp',
      'regularprice',
      'listprice',
      'strikeprice',
      'marketprice',
      'oldprice',
    ].includes(h)
  )
  const categoryIdx = normHeaders.findIndex((h) =>
    ['category', 'cat', 'group', 'collection', 'department', 'type'].includes(h)
  )
  const weightIdx = normHeaders.findIndex((h) =>
    ['weight', 'pack', 'packsize', 'size', 'unit', 'packaging', 'volume', 'qtyperpack'].includes(h)
  )
  const stockIdx = normHeaders.findIndex((h) =>
    ['stock', 'qty', 'quantity', 'inventory', 'units', 'count', 'available'].includes(h)
  )
  const descIdx = normHeaders.findIndex((h) =>
    ['description', 'desc', 'details', 'info', 'summary', 'specification'].includes(h)
  )
  const imagesIdx = normHeaders.findIndex((h) =>
    ['image', 'images', 'imageurl', 'photo', 'picture', 'img', 'thumbnail', 'photos'].includes(h)
  )
  const badgeIdx = normHeaders.findIndex((h) =>
    ['badge', 'tag', 'label', 'promotionalbadge', 'badgecategory'].includes(h)
  )
  const badgeColorIdx = normHeaders.findIndex((h) =>
    ['badgecolor', 'color', 'tagcolor', 'badgebg'].includes(h)
  )
  const activeIdx = normHeaders.findIndex((h) =>
    ['active', 'isactive', 'status', 'live', 'publish', 'published', 'enabled'].includes(h)
  )

  const rows: ParsedProductRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseDelimitedLine(lines[i], delimiter)
    const rowNum = i + 1

    const rawTitle = titleIdx >= 0 ? values[titleIdx] : values[0]
    const rawPrice = priceIdx >= 0 ? values[priceIdx] : values[1]

    const title = (rawTitle || '').replace(/^["']|["']$/g, '').trim()
    const parsedPrice = parsePrice(rawPrice)

    const rawOriginalPrice = originalPriceIdx >= 0 ? values[originalPriceIdx] : undefined
    const parsedOriginalPrice = parsePrice(rawOriginalPrice)

    const rawCategory = categoryIdx >= 0 ? values[categoryIdx] : undefined
    const category = normalizeCategory(rawCategory)

    const rawWeight = weightIdx >= 0 ? values[weightIdx] : undefined
    const weight = (rawWeight || '').replace(/^["']|["']$/g, '').trim() || 'Standard Pack'

    const rawStock = stockIdx >= 0 ? values[stockIdx] : undefined
    const stockNum = parseInt(String(rawStock || '').replace(/[^\d]/g, ''), 10)
    const stock = isNaN(stockNum) ? 50 : stockNum

    const rawDesc = descIdx >= 0 ? values[descIdx] : ''
    const description = (rawDesc || '').replace(/^["']|["']$/g, '').trim()

    const rawImages = imagesIdx >= 0 ? values[imagesIdx] : ''
    let images: string[] = []
    if (rawImages) {
      images = rawImages
        .split(/[,|\s]+/)
        .map((img) => img.replace(/^["']|["']$/g, '').trim())
        .filter((img) => img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/'))
    }
    if (images.length === 0) {
      // Curated default agricultural image based on category
      if (category === 'cattle-feed') {
        images = [
          'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
        ]
      } else if (category === 'seeds-fert') {
        images = [
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
        ]
      } else if (category === 'agri-tools') {
        images = [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
        ]
      } else {
        images = [
          'https://images.unsplash.com/photo-1584990347449-39955747cb98?auto=format&fit=crop&w=600&q=80',
        ]
      }
    }

    const rawBadge = badgeIdx >= 0 ? values[badgeIdx] : undefined
    const badge = (rawBadge || '').replace(/^["']|["']$/g, '').trim() || undefined

    const rawBadgeColor = badgeColorIdx >= 0 ? values[badgeColorIdx] : undefined
    const badgeColor =
      (rawBadgeColor || '').replace(/^["']|["']$/g, '').trim() || 'bg-amber-500 text-white'

    let isActive = true
    if (activeIdx >= 0 && values[activeIdx]) {
      const activeStr = values[activeIdx].toLowerCase().trim()
      if (['false', '0', 'no', 'inactive', 'hidden', 'draft'].includes(activeStr)) {
        isActive = false
      }
    }

    // Validation
    let isValid = true
    let error: string | undefined = undefined

    if (!title) {
      isValid = false
      error = 'Missing product title'
    } else if (parsedPrice === undefined || parsedPrice < 0) {
      isValid = false
      error = 'Missing or invalid price'
    }

    rows.push({
      rowNumber: rowNum,
      isValid,
      error,
      title,
      price: parsedPrice ?? 0,
      original_price: parsedOriginalPrice,
      category,
      weight,
      stock,
      description,
      images,
      badge,
      badge_color: badgeColor,
      is_active: isActive,
    })
  }

  const validRows = rows.filter((r) => r.isValid)
  const invalidRows = rows.filter((r) => !r.isValid)

  return {
    rows,
    validRows,
    invalidRows,
    totalRows: rows.length,
    hasTitleColumn: titleIdx >= 0,
    hasPriceColumn: priceIdx >= 0,
    detectedDelimiter: delimiter,
    headers,
  }
}

/**
 * Resolves Google Sheets share/view links into a direct CSV export URL.
 */
export function parseGoogleSheetsUrl(
  inputUrl: string
): { sheetId: string; gid: string; exportUrl: string } | null {
  if (!inputUrl) return null
  const trimmed = inputUrl.trim()

  // 1. Direct CSV link already
  if (
    trimmed.includes('/export?format=csv') ||
    trimmed.includes('/pub?output=csv') ||
    trimmed.includes('/gviz/tq?tqx=out:csv')
  ) {
    return {
      sheetId: 'custom',
      gid: '0',
      exportUrl: trimmed,
    }
  }

  // 2. Standard Google Sheets URL: https://docs.google.com/spreadsheets/d/<SHEET_ID>/...
  const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!sheetIdMatch || !sheetIdMatch[1]) {
    return null
  }

  const sheetId = sheetIdMatch[1]

  // Extract gid (tab id) if present
  let gid = '0'
  const gidMatch = trimmed.match(/[#?&]gid=(\d+)/)
  if (gidMatch && gidMatch[1]) {
    gid = gidMatch[1]
  }

  // We use the gviz/tq export or export?format=csv
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

  return {
    sheetId,
    gid,
    exportUrl,
  }
}

/**
 * Generates ready-to-use sample CSV content with diverse products
 */
export function getSampleProductCsv(): string {
  return [
    'Title,Price,Original Price,Category,Pack Size,Stock,Image URL,Badge,Description,Active',
    'Balanced Cattle Feed Pellets,1249,1450,Cattle Feed,50 kg Pack,45,https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80,Best Seller,"22% crude bypass protein fortified with essential minerals for maximum milk yield.",Yes',
    'Chelated Mineral Mixture,680,790,Cattle Feed,5 kg Bucket,60,https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80,Organic,"Fortified with Zinc, Copper, and Vitamin E for high conception rate and immunity.",Yes',
    'Certified Hybrid Mustard Seed,520,620,Seeds & Agri,2 kg Pack,80,https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80,Certified,"Pusa Bold certified hybrid seed with 42% high oil yield and germination guarantee.",Yes',
    'Bio NPK Liquid Biofertilizer,449,550,Seeds & Agri,1 Litre,50,https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80,Eco Bio,"Liquid consortium of nitrogen, phosphorus, and potassium solubilizing bacteria.",Yes',
    '16L Knapsack Battery Sprayer,1950,2300,Tools & Sprayers,16 Litre,25,https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80,Heavy Duty,"12V heavy continuous duty battery sprayer with double brass nozzles and spare lance.",Yes',
    'Heavy Cast Iron Kadhai,899,1150,Home & Kitchen,3.5 Litre,35,https://images.unsplash.com/photo-1584990347449-39955747cb98?auto=format&fit=crop&w=600&q=80,Pure Iron,"Traditional pre-seasoned heavy iron kadhai for authentic and healthy rural cooking.",Yes',
  ].join('\n')
}
