import { describe, expect, it } from 'vitest'
import { GET } from './route'
import { POST } from './upload/route'
import { GET as GET_ONE, PATCH, DELETE } from './[id]/route'

describe('Media Library API (/api/media)', () => {
  it('GET /api/media returns media list with total count', async () => {
    const req = new Request('http://localhost:3000/api/media')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.media)).toBe(true)
    expect(data.media.length).toBeGreaterThan(0)
    expect(typeof data.total).toBe('number')
  })

  it('GET /api/media supports filtering by type', async () => {
    const req = new Request('http://localhost:3000/api/media?type=video')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.media.every((m: any) => m.file_type === 'video')).toBe(true)
  })

  it('GET /api/media supports searching by filename', async () => {
    const req = new Request('http://localhost:3000/api/media?search=cattle')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.media.some((m: any) => m.file_name.toLowerCase().includes('cattle'))).toBe(true)
  })

  it('POST /api/media/upload rejects requests without files', async () => {
    const formData = new FormData()
    const req = new Request('http://localhost:3000/api/media/upload', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('POST /api/media/upload uploads a file and returns media record', async () => {
    const formData = new FormData()
    const fakeFile = new File(['test image content'], 'test-image.png', {
      type: 'image/png',
    })
    formData.append('file', fakeFile)
    formData.append('category', 'products')

    const req = new Request('http://localhost:3000/api/media/upload', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.media).toBeDefined()
    expect(data.media.file_type).toBe('image')
    expect(data.media.folder_category).toBe('products')
    expect(data.media.file_url).toContain('/uploads/media/')

    const uploadedId = data.media.id

    // Test GET single item
    const getRes = await GET_ONE(
      new Request(`http://localhost:3000/api/media/${uploadedId}`),
      { params: Promise.resolve({ id: uploadedId }) }
    )
    expect(getRes.status).toBe(200)
    const getData = await getRes.json()
    expect(getData.media.id).toBe(uploadedId)

    // Test PATCH rename
    const patchRes = await PATCH(
      new Request(`http://localhost:3000/api/media/${uploadedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: 'renamed-image.png', folder_category: 'banners' }),
      }),
      { params: Promise.resolve({ id: uploadedId }) }
    )
    expect(patchRes.status).toBe(200)
    const patchData = await patchRes.json()
    expect(patchData.media.file_name).toBe('renamed-image.png')
    expect(patchData.media.folder_category).toBe('banners')

    // Test DELETE
    const delRes = await DELETE(
      new Request(`http://localhost:3000/api/media/${uploadedId}`, {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: uploadedId }) }
    )
    expect(delRes.status).toBe(200)
  })
})
