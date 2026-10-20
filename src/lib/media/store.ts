import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type { MediaFile, MediaListFilter, MediaFileType } from '@/types/media'

// Lazy-initialized admin client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return _adminClient
}

// In-memory cache for ultra-fast queries and offline fallback
const memoryMedia = new Map<string, MediaFile>()
let isSeeded = false

export const DEFAULT_SEED_MEDIA: Omit<MediaFile, 'id' | 'account_id' | 'created_at' | 'updated_at'>[] = [
  {
    file_name: 'balanced-cattle-feed-pellets.jpg',
    file_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 485200,
    folder_category: 'products',
    storage_path: null,
  },
  {
    file_name: 'chelated-mineral-mixture-bucket.jpg',
    file_url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 382400,
    folder_category: 'products',
    storage_path: null,
  },
  {
    file_name: 'calci-gold-liquid-calcium.jpg',
    file_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 341900,
    folder_category: 'products',
    storage_path: null,
  },
  {
    file_name: 'certified-hybrid-mustard-seeds.jpg',
    file_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 512000,
    folder_category: 'products',
    storage_path: null,
  },
  {
    file_name: 'knapsack-battery-sprayer-16l.jpg',
    file_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 615300,
    folder_category: 'products',
    storage_path: null,
  },
  {
    file_name: 'hero-banner-dairy-cattle-feed.jpg',
    file_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1600&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 1048576,
    folder_category: 'banners',
    storage_path: null,
  },
  {
    file_name: 'hero-banner-golden-harvest-seeds.jpg',
    file_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 924000,
    folder_category: 'banners',
    storage_path: null,
  },
  {
    file_name: 'farm-tractor-sprayer-action.mp4',
    file_url: 'https://assets.mixkit.co/videos/preview/mixkit-tractor-harvesting-grain-in-a-field-41581-large.mp4',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 4500000,
    folder_category: 'banners',
    storage_path: null,
  },
  {
    file_name: 'dairy-cows-grazing-pasture.mp4',
    file_url: 'https://assets.mixkit.co/videos/preview/mixkit-cows-grazing-on-a-sunny-field-41578-large.mp4',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 6200000,
    folder_category: 'products',
    storage_path: null,
  },
  {
    file_name: 'Jatrra_Product_Catalog_2026.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'pdf',
    mime_type: 'application/pdf',
    file_size: 1250000,
    folder_category: 'brochures',
    storage_path: null,
  },
  {
    file_name: 'Cattle_Feed_Nutritional_Formulation_Guide.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'pdf',
    mime_type: 'application/pdf',
    file_size: 890000,
    folder_category: 'brochures',
    storage_path: null,
  },
  {
    file_name: 'Knapsack_Sprayer_User_Manual.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'pdf',
    mime_type: 'application/pdf',
    file_size: 640000,
    folder_category: 'brochures',
    storage_path: null,
  },
]

function getMediaDataFilePath(): string {
  const dir = path.join(process.cwd(), '.data')
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // ignore
    }
  }
  return path.join(dir, 'media.json')
}

export function persistMediaToFile() {
  try {
    const file = getMediaDataFilePath()
    const all = Array.from(memoryMedia.values())
    fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[media/store] could not write media file:', err)
  }
}

export function seedMemoryMedia() {
  if (isSeeded && memoryMedia.size > 0) return

  try {
    const file = getMediaDataFilePath()
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      const parsed: MediaFile[] = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((m) => memoryMedia.set(m.id, m))
        isSeeded = true
        return
      }
    }
  } catch (err) {
    console.warn('[media/store] failed loading stored media from disk:', err)
  }

  // Populate seeds
  const now = new Date()
  DEFAULT_SEED_MEDIA.forEach((item, index) => {
    const id = `media-${index + 1}`
    const createdDate = new Date(now.getTime() - (index * 86400000 + 3600000)).toISOString()
    memoryMedia.set(id, {
      ...item,
      id,
      created_at: createdDate,
      updated_at: createdDate,
    })
  })

  isSeeded = true
  persistMediaToFile()
}

/**
 * Determine media file type from mime_type or file extension.
 */
export function inferMediaType(fileName: string, mimeType?: string): MediaFileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const mime = (mimeType || '').toLowerCase()

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'avif'].includes(ext)
  ) {
    return 'image'
  }
  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'ogg', 'mov', 'm4v', '3gp'].includes(ext)
  ) {
    return 'video'
  }
  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf'
  }
  return 'document'
}

export { formatFileSize } from './format'

/**
 * List media files matching optional filters.
 */
export async function listMediaFiles(filters?: MediaListFilter): Promise<MediaFile[]> {
  seedMemoryMedia()

  // Try fetching from Supabase DB first if connected
  const client = supabaseAdmin()
  if (client) {
    try {
      let query = client.from('media_files').select('*').order('created_at', { ascending: false })

      if (filters?.folderCategory && filters.folderCategory !== 'all') {
        query = query.eq('folder_category', filters.folderCategory)
      }
      if (filters?.fileType && filters.fileType !== 'all') {
        query = query.eq('file_type', filters.fileType)
      }
      if (filters?.search) {
        query = query.ilike('file_name', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (!error && Array.isArray(data) && data.length > 0) {
        // Sync to memory
        data.forEach((m: MediaFile) => memoryMedia.set(m.id, m))
        persistMediaToFile()
        return data
      }
    } catch (err) {
      console.warn('[media/store] DB query failed, falling back to local memory store:', err)
    }
  }

  // Fallback to in-memory store
  let results = Array.from(memoryMedia.values())

  if (filters?.folderCategory && filters.folderCategory !== 'all') {
    results = results.filter((m) => m.folder_category === filters.folderCategory)
  }

  if (filters?.fileType && filters.fileType !== 'all') {
    results = results.filter((m) => m.file_type === filters.fileType)
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim()
    results = results.filter((m) => m.file_name.toLowerCase().includes(q))
  }

  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return results
}

/**
 * Get a single media file by ID.
 */
export async function getMediaFileById(id: string): Promise<MediaFile | null> {
  seedMemoryMedia()

  const client = supabaseAdmin()
  if (client) {
    try {
      const { data, error } = await client
        .from('media_files')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (!error && data) {
        memoryMedia.set(data.id, data)
        return data
      }
    } catch {
      // fallback below
    }
  }

  return memoryMedia.get(id) || null
}

/**
 * Create a new media record.
 */
export async function createMediaFile(input: Partial<MediaFile>): Promise<MediaFile> {
  seedMemoryMedia()

  const now = new Date().toISOString()
  const id = input.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  const fileType = input.file_type || inferMediaType(input.file_name || 'asset', input.mime_type)

  const mediaRecord: MediaFile = {
    id,
    account_id: input.account_id || null,
    file_name: input.file_name || 'untitled_asset',
    file_url: input.file_url || '',
    file_type: fileType,
    mime_type: input.mime_type || 'application/octet-stream',
    file_size: Number(input.file_size) || 0,
    folder_category: input.folder_category || 'uncategorized',
    storage_path: input.storage_path || null,
    created_at: now,
    updated_at: now,
  }

  const client = supabaseAdmin()
  if (client) {
    try {
      const { data, error } = await client
        .from('media_files')
        .insert({
          file_name: mediaRecord.file_name,
          file_url: mediaRecord.file_url,
          file_type: mediaRecord.file_type,
          mime_type: mediaRecord.mime_type,
          file_size: mediaRecord.file_size,
          folder_category: mediaRecord.folder_category,
          storage_path: mediaRecord.storage_path,
        })
        .select('*')
        .single()

      if (!error && data) {
        mediaRecord.id = data.id
      }
    } catch (err) {
      console.warn('[media/store] DB insert failed, saved to local cache:', err)
    }
  }

  memoryMedia.set(mediaRecord.id, mediaRecord)
  persistMediaToFile()
  return mediaRecord
}

/**
 * Update media metadata (e.g. rename or move category).
 */
export async function updateMediaFile(
  id: string,
  updates: Partial<MediaFile>
): Promise<MediaFile | null> {
  seedMemoryMedia()

  const existing = memoryMedia.get(id)
  if (!existing) {
    const fromDb = await getMediaFileById(id)
    if (!fromDb) return null
  }

  const current = memoryMedia.get(id)!
  const updated: MediaFile = {
    ...current,
    ...updates,
    id: current.id,
    updated_at: new Date().toISOString(),
  }

  const client = supabaseAdmin()
  if (client) {
    try {
      await client
        .from('media_files')
        .update({
          file_name: updated.file_name,
          folder_category: updated.folder_category,
          updated_at: updated.updated_at,
        })
        .eq('id', id)
    } catch (err) {
      console.warn('[media/store] DB update failed, updated local cache:', err)
    }
  }

  memoryMedia.set(id, updated)
  persistMediaToFile()
  return updated
}

/**
 * Delete a media file record and its underlying physical file from disk.
 */
export async function deleteMediaFile(id: string): Promise<boolean> {
  seedMemoryMedia()

  const item = memoryMedia.get(id) || (await getMediaFileById(id))
  if (!item) return false

  // Delete physical file from disk if it was stored locally under /uploads/media/
  if (item.file_url && item.file_url.startsWith('/uploads/media/')) {
    try {
      const localFileName = item.file_url.replace('/uploads/media/', '')
      const fullDiskPath = path.join(process.cwd(), 'public', 'uploads', 'media', localFileName)
      if (fs.existsSync(fullDiskPath)) {
        fs.unlinkSync(fullDiskPath)
      }
    } catch (err) {
      console.warn('[media/store] could not unlink local file:', err)
    }
  }

  // Delete from DB if connected
  const client = supabaseAdmin()
  if (client) {
    try {
      await client.from('media_files').delete().eq('id', id)
    } catch (err) {
      console.warn('[media/store] DB delete failed:', err)
    }
  }

  memoryMedia.delete(id)
  persistMediaToFile()
  return true
}
