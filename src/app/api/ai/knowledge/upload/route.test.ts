import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  checkRateLimit: vi.fn(),
  loadEmbeddingsKey: vi.fn(),
  ingestDocument: vi.fn(),
  extractTextFromFile: vi.fn(),
}))

vi.mock('@/lib/auth/account', () => ({
  requireRole: mocks.requireRole,
  toErrorResponse: (err: unknown) => {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  rateLimitResponse: () => new Response('rate limited', { status: 429 }),
  RATE_LIMITS: { adminAction: {} },
}))

vi.mock('@/lib/ai/config', () => ({
  loadEmbeddingsKey: mocks.loadEmbeddingsKey,
}))

vi.mock('@/lib/ai/knowledge', () => ({
  ingestDocument: mocks.ingestDocument,
}))

vi.mock('@/lib/ai/file-extract', () => ({
  extractTextFromFile: mocks.extractTextFromFile,
}))

import { POST } from './route'

function makeMockSupabase() {
  const insertMock = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: { id: 'doc-uploaded-1' },
        error: null,
      }),
    }),
  })

  return {
    from: vi.fn((table: string) => {
      if (table === 'ai_knowledge_documents') {
        return { insert: insertMock }
      }
      return {}
    }),
    insertMock,
  }
}

describe('POST /api/ai/knowledge/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.checkRateLimit.mockReturnValue({ success: true })
    mocks.loadEmbeddingsKey.mockResolvedValue({ key: 'test-emb-key', corrupt: false })
  })

  it('rejects requests with no files', async () => {
    const mockDb = makeMockSupabase()
    mocks.requireRole.mockResolvedValue({
      supabase: mockDb,
      accountId: 'acc-1',
      userId: 'user-1',
    })

    const formData = new FormData()
    const req = new Request('http://localhost/api/ai/knowledge/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('No files provided for upload.')
  })

  it('extracts, inserts, and ingests uploaded document', async () => {
    const mockDb = makeMockSupabase()
    mocks.requireRole.mockResolvedValue({
      supabase: mockDb,
      accountId: 'acc-1',
      userId: 'user-1',
    })
    mocks.extractTextFromFile.mockResolvedValue({
      title: 'Company Policy',
      content: 'Here is the company policy content.',
    })

    const formData = new FormData()
    const file = new File(['Hello text'], 'company_policy.txt', { type: 'text/plain' })
    formData.append('files', file)

    const req = new Request('http://localhost/api/ai/knowledge/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.count).toBe(1)
    expect(json.documents[0].title).toBe('Company Policy')
    expect(mocks.ingestDocument).toHaveBeenCalledWith(
      mockDb,
      'acc-1',
      { embeddingsApiKey: 'test-emb-key' },
      'doc-uploaded-1',
      'Here is the company policy content.',
    )
  })
})
