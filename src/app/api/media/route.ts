import { NextResponse } from 'next/server'
import { listMediaFiles } from '@/lib/media/store'
import type { MediaFileType } from '@/types/media'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const fileType = (searchParams.get('type') as MediaFileType | 'all') || 'all'
    const folderCategory = searchParams.get('category') || 'all'
    const accountId = searchParams.get('account_id') || undefined

    const media = await listMediaFiles({
      search,
      fileType,
      folderCategory,
      accountId,
    })

    return NextResponse.json({
      success: true,
      media,
      total: media.length,
    })
  } catch (err: any) {
    console.error('Error in GET /api/media:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch media assets' },
      { status: 500 }
    )
  }
}
