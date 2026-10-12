import { NextResponse } from 'next/server'
import {
  getOrder,
  updateOrderShippingAddress,
  updateOrderStatus,
  confirmOrderStatus
} from '@/lib/orders/store'
import type { OrderStatus } from '@/types'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const order = await getOrder(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, order })
  } catch (err) {
    console.error('Error fetching order:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const body = await request.json()
    const { status, shipping_address, payment_preference, notes } = body

    let updatedOrder = await getOrder(id)
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (shipping_address !== undefined) {
      updatedOrder = await updateOrderShippingAddress(id, String(shipping_address))
    }

    if (status !== undefined) {
      if (status === 'CONFIRMED') {
        updatedOrder = await confirmOrderStatus(id, payment_preference || 'Manual confirmation')
      } else {
        updatedOrder = await updateOrderStatus(id, status as OrderStatus, notes)
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })
  } catch (err) {
    console.error('Error updating order:', err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
