import { NextResponse } from 'next/server'
import {
  getDeliveryAgentById,
  updateDeliveryAgent,
  deleteDeliveryAgent
} from '@/lib/delivery-agents/store'
import type { DeliveryAgentStatus, VehicleType } from '@/types'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const agent = await getDeliveryAgentById(id)
    if (!agent) {
      return NextResponse.json({ error: 'Delivery agent not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, agent })
  } catch (err) {
    console.error('[api/delivery-agents/[id]] GET error:', err)
    return NextResponse.json({ error: 'Failed to retrieve delivery agent' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const body = await request.json()

    const agent = await getDeliveryAgentById(id)
    if (!agent) {
      return NextResponse.json({ error: 'Delivery agent not found' }, { status: 404 })
    }

    const updated = await updateDeliveryAgent(id, {
      name: body.name,
      phone: body.phone,
      email: body.email,
      vehicle_type: body.vehicle_type as VehicleType,
      vehicle_number: body.vehicle_number,
      emergency_contact: body.emergency_contact,
      notes: body.notes,
      status: body.status as DeliveryAgentStatus,
      rating: body.rating,
      total_deliveries: body.total_deliveries,
      avatar_url: body.avatar_url
    })

    return NextResponse.json({
      success: true,
      agent: updated
    })
  } catch (err) {
    console.error('[api/delivery-agents/[id]] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update delivery agent' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const deleted = await deleteDeliveryAgent(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Delivery agent not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Delivery agent removed successfully' })
  } catch (err) {
    console.error('[api/delivery-agents/[id]] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete delivery agent' }, { status: 500 })
  }
}
