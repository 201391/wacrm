import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Maximum file size: 50 MB for videos, animated GIFs, and high-res images
export const MAX_BANNER_FILE_SIZE = 50 * 1024 * 1024

export const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/avif',
  // Animated GIF
  'image/gif',
  // Video formats
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
])

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_BANNER_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
        },
        { status: 400 }
      )
    }

    let mimeType = file.type || ''
    const extFromName = file.name.split('.').pop()?.toLowerCase() || ''
    let mediaType: 'image' | 'gif' | 'video' = 'image'

    if (mimeType === 'image/gif' || extFromName === 'gif') {
      mediaType = 'gif'
      if (!mimeType) mimeType = 'image/gif'
    } else if (
      mimeType.startsWith('video/') ||
      ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(extFromName)
    ) {
      mediaType = 'video'
      if (!mimeType) mimeType = 'video/mp4'
    } else if (
      ALLOWED_MIME_TYPES.has(mimeType) ||
      ['jpg', 'jpeg', 'png', 'webp', 'svg', 'avif'].includes(extFromName)
    ) {
      mediaType = 'image'
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file format (${mimeType || extFromName}). Supported formats include Animated GIF (.gif), Video (.mp4, .webm), and Images (.jpg, .png, .webp).`,
        },
        { status: 400 }
      )
    }

    // Save locally into public/uploads/banners so Next.js static asset server can host it directly
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners')
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true })
      } catch {
        // ignore
      }
    }

    // Generate clean unique filename
    const safeBaseName =
      file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40) || 'banner'
    const extension =
      extFromName || (mediaType === 'video' ? 'mp4' : mediaType === 'gif' ? 'gif' : 'png')
    const fileName = `${Date.now()}-${safeBaseName}.${extension}`
    const filePath = path.join(uploadDir, fileName)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/banners/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaType,
      fileName,
      originalName: file.name,
      size: file.size,
    })
  } catch (err: any) {
    console.error('[api/store/banner/upload] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process file upload' },
      { status: 500 }
    )
  }
}
