import { NextResponse } from 'next/server'
import {
  listDeliveryAgents,
  getDeliveryAgentStats,
  createDeliveryAgent
} from '@/lib/delivery-agents/store'
import type { DeliveryAgentStatus, VehicleType } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = (searchParams.get('status') as DeliveryAgentStatus | 'ALL') || undefined
    const vehicle_type = (searchParams.get('vehicle_type') as VehicleType | 'ALL') || undefined
    const accountId = searchParams.get('account_id') || undefined

    const [agents, stats] = await Promise.all([
      listDeliveryAgents({ search, status, vehicle_type, accountId }),
      getDeliveryAgentStats(accountId)
    ])

    return NextResponse.json({
      success: true,
      agents,
      stats
    })
  } catch (err) {
    console.error('[api/delivery-agents] GET error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve delivery agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      email,
      vehicle_type,
      vehicle_number,
      emergency_contact,
      notes,
      status,
      avatar_url,
      account_id
    } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Delivery agent full name is required' },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Valid phone number is required' },
        { status: 400 }
      )
    }

    if (!vehicle_number || typeof vehicle_number !== 'string' || !vehicle_number.trim()) {
      return NextResponse.json(
        { error: 'Vehicle number / plate identifier is required' },
        { status: 400 }
      )
    }

    const agent = await createDeliveryAgent(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? String(email).trim() : null,
        vehicle_type: (vehicle_type as VehicleType) || 'BIKE',
        vehicle_number: String(vehicle_number).trim(),
        emergency_contact: emergency_contact ? String(emergency_contact).trim() : null,
        notes: notes ? String(notes).trim() : null,
        status: (status as DeliveryAgentStatus) || 'AVAILABLE',
        avatar_url: avatar_url ? String(avatar_url).trim() : null
      },
      account_id
    )

    return NextResponse.json({
      success: true,
      agent
    }, { status: 201 })
  } catch (err) {
    console.error('[api/delivery-agents] POST error:', err)
    return NextResponse.json(
      { error: 'Failed to create delivery agent' },
      { status: 500 }
    )
  }
}
