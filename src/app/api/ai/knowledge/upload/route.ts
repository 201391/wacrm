import { NextResponse } from 'next/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { loadEmbeddingsKey } from '@/lib/ai/config'
import { ingestDocument } from '@/lib/ai/knowledge'
import { extractTextFromFile } from '@/lib/ai/file-extract'
import { AiError } from '@/lib/ai/types'

// Max 15MB per file
const MAX_FILE_SIZE = 15 * 1024 * 1024

const SUPPORTED_EXTENSIONS = new Set([
  'txt',
  'md',
  'markdown',
  'csv',
  'tsv',
  'json',
  'html',
  'htm',
  'pdf',
  'log',
  'yaml',
  'yml',
])

/**
 * POST /api/ai/knowledge/upload  (admin+)
 *
 * Accepts one or multiple uploaded files (multipart/form-data), extracts clean
 * text & titles, saves each document to `ai_knowledge_documents`, and chunks/indexes
 * it via `ingestDocument` so the AI Agent can reference it immediately.
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await requireRole('admin')
    const limit = checkRateLimit(`ai-kb-upload:${userId}`, RATE_LIMITS.adminAction)
    if (!limit.success) return rateLimitResponse(limit)

    const formData = await request.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const rawFiles: File[] = []
    const filesList = formData.getAll('files')
    for (const f of filesList) {
      if (f instanceof File && f.size > 0) rawFiles.push(f)
    }

    const singleFile = formData.get('file')
    if (singleFile instanceof File && singleFile.size > 0 && !rawFiles.includes(singleFile)) {
      rawFiles.push(singleFile)
    }

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files provided for upload.' },
        { status: 400 },
      )
    }

    const { key: embeddingsApiKey, corrupt } = await loadEmbeddingsKey(
      supabase,
      accountId,
    )

    const results: Array<{ id: string; title: string; charCount: number }> = []
    const warnings: string[] = []

    for (const file of rawFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          },
          { status: 400 },
        )
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (!SUPPORTED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            error: `Unsupported file extension for "${file.name}". Supported formats: TXT, Markdown (.md), CSV, TSV, JSON, HTML, PDF, YAML, Log.`,
          },
          { status: 400 },
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const { title, content } = await extractTextFromFile(buffer, file.name, file.type)

      if (!content || !content.trim()) {
        warnings.push(`File "${file.name}" had no extractable text and was skipped.`)
        continue
      }

      // Insert document
      const { data: doc, error: docErr } = await supabase
        .from('ai_knowledge_documents')
        .insert({
          account_id: accountId,
          created_by: userId,
          title,
          content: content.trim(),
        })
        .select('id')
        .single()

      if (docErr || !doc) {
        console.error(`[ai/knowledge/upload] insert error for ${file.name}:`, docErr)
        continue
      }

      // Chunk and ingest
      try {
        await ingestDocument(
          supabase,
          accountId,
          { embeddingsApiKey },
          doc.id,
          content.trim(),
        )
      } catch (err) {
        const message = err instanceof AiError ? err.message : 'indexing failed'
        warnings.push(
          `"${title}" saved with keyword search only (semantic indexing failed: ${message}).`,
        )
      }

      results.push({
        id: doc.id,
        title,
        charCount: content.trim().length,
      })
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error:
            warnings.length > 0
              ? warnings.join(' ')
              : 'Failed to extract text or save any uploaded documents.',
        },
        { status: 400 },
      )
    }

    if (corrupt) {
      warnings.push(
        'Saved with keyword search only — embeddings key could not be decrypted.',
      )
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      documents: results,
      warning: warnings.length > 0 ? warnings.join(' | ') : undefined,
    })
  } catch (err) {
    return toErrorResponse(err)
  }
}
