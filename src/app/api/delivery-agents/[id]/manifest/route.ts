import { NextResponse } from 'next/server'
import { getDriverManifest } from '@/lib/orders/store'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id') || undefined

    const manifest = await getDriverManifest(id, accountId)

    return NextResponse.json({
      success: true,
      ...manifest
    })
  } catch (err) {
    console.error('[api/delivery-agents/[id]/manifest] GET error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve delivery manifest' },
      { status: 500 }
    )
  }
}
