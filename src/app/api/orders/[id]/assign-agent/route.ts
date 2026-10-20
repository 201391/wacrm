import { NextResponse } from 'next/server'
import { assignAgentToOrder } from '@/lib/delivery-agents/store'

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const body = await request.json()
    const { agent_id } = body

    // agent_id can be string (assign/reassign) or null/empty (unassign)
    const targetAgentId = agent_id && typeof agent_id === 'string' && agent_id.trim() ? agent_id.trim() : null

    const result = await assignAgentToOrder(id, targetAgentId)

    return NextResponse.json({
      success: true,
      order: result.order,
      agent: result.agent || null
    })
  } catch (err: any) {
    console.error('[api/orders/[id]/assign-agent] POST error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to assign delivery agent' },
      { status: 400 }
    )
  }
}
