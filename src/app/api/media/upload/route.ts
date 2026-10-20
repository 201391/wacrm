import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { createMediaFile, inferMediaType } from '@/lib/media/store'
import type { MediaFile } from '@/types/media'

// Max file size: 100MB for video/documents/images
export const MAX_FILE_SIZE = 100 * 1024 * 1024

export const ALLOWED_EXTENSIONS = new Set([
  // Images
  'jpg',
  'jpeg',
  'png',
  'webp',
  'svg',
  'gif',
  'avif',
  // Videos
  'mp4',
  'webm',
  'mov',
  'ogg',
  // Documents
  'pdf',
])

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Folder category tag (default: 'uncategorized')
    const folderCategory = (formData.get('category') as string) || 'uncategorized'
    const accountId = (formData.get('account_id') as string) || undefined

    // Collect all files from formData (supports multiple under 'files' or 'file')
    const rawFiles: File[] = []
    const allEntries = formData.getAll('files')
    if (allEntries.length > 0) {
      allEntries.forEach((entry) => {
        if (entry instanceof File && entry.size > 0) {
          rawFiles.push(entry)
        }
      })
    }

    const singleEntry = formData.get('file')
    if (singleEntry instanceof File && singleEntry.size > 0) {
      rawFiles.push(singleEntry)
    }

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 })
    }

    // Ensure upload directory exists: public/uploads/media
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media')
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true })
      } catch {
        // ignore
      }
    }

    const uploadedRecords: MediaFile[] = []

    for (const file of rawFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the 100MB upload limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          },
          { status: 400 }
        )
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            error: `Unsupported file type for "${file.name}". Supported formats: Images (.jpg, .jpeg, .png, .webp, .svg, .gif), Videos (.mp4, .webm), Documents (.pdf).`,
          },
          { status: 400 }
        )
      }

      // Generate sanitized, collision-free filename
      const safeBaseName =
        file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 50) || 'asset'
      const uniqueFileName = `${Date.now()}-${safeBaseName}.${ext}`
      const targetFilePath = path.join(uploadDir, uniqueFileName)

      // Write to public/uploads/media
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      fs.writeFileSync(targetFilePath, buffer)

      const publicUrl = `/uploads/media/${uniqueFileName}`
      const fileType = inferMediaType(uniqueFileName, file.type)

      // Create database record
      const record = await createMediaFile({
        account_id: accountId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: fileType,
        mime_type: file.type || `application/${ext}`,
        file_size: file.size,
        folder_category: folderCategory,
        storage_path: targetFilePath,
      })

      uploadedRecords.push(record)
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedRecords,
      media: uploadedRecords[0], // Convenience for single-file upload
    })
  } catch (err: any) {
    console.error('Error in POST /api/media/upload:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process file upload' },
      { status: 500 }
    )
  }
}
