import { NextResponse } from 'next/server'
import { getMediaFileById, updateMediaFile, deleteMediaFile } from '@/lib/media/store'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const media = await getMediaFileById(id)

    if (!media) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      media,
    })
  } catch (err: any) {
    console.error('Error in GET /api/media/[id]:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const body = await request.json()

    const updated = await updateMediaFile(id, {
      file_name: body.file_name?.trim(),
      folder_category: body.folder_category,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      media: updated,
    })
  } catch (err: any) {
    console.error('Error in PATCH /api/media/[id]:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update media file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const deleted = await deleteMediaFile(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Media file deleted successfully from storage and database',
    })
  } catch (err: any) {
    console.error('Error in DELETE /api/media/[id]:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete media file' },
      { status: 500 }
    )
  }
}
