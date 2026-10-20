import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'
import fs from 'fs'

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs')
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  }
})

describe('Store Banner Upload API (/api/store/banner/upload)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects requests with no file provided', async () => {
    const formData = new FormData()
    const req = new Request('http://localhost:3000/api/store/banner/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('No file provided')
  })

  it('rejects unsupported file formats', async () => {
    const file = new File(['fake-exe-content'], 'malware.exe', { type: 'application/x-msdownload' })
    const formData = new FormData()
    formData.append('file', file)

    const req = new Request('http://localhost:3000/api/store/banner/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Unsupported file format')
  })

  it('successfully uploads and detects an animated GIF file', async () => {
    const file = new File(['GIF89a...fake gif content'], 'harvest-animation.gif', {
      type: 'image/gif',
    })
    const formData = new FormData()
    formData.append('file', file)

    const req = new Request('http://localhost:3000/api/store/banner/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.mediaType).toBe('gif')
    expect(data.url).toMatch(/^\/uploads\/banners\/\d+-harvest[-_]animation\.gif$/)
  })

  it('successfully uploads and detects an MP4 video file', async () => {
    const file = new File(['fake mp4 bytes'], 'tractor-drone.mp4', {
      type: 'video/mp4',
    })
    const formData = new FormData()
    formData.append('file', file)

    const req = new Request('http://localhost:3000/api/store/banner/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.mediaType).toBe('video')
    expect(data.url).toMatch(/^\/uploads\/banners\/\d+-tractor[-_]drone\.mp4$/)
  })

  it('successfully uploads an image file (PNG/JPG)', async () => {
    const file = new File(['fake png bytes'], 'cow-feed.png', {
      type: 'image/png',
    })
    const formData = new FormData()
    formData.append('file', file)

    const req = new Request('http://localhost:3000/api/store/banner/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.mediaType).toBe('image')
    expect(data.url).toMatch(/^\/uploads\/banners\/\d+-cow[-_]feed\.png$/)
  })
})
