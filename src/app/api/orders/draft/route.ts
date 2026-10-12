import { NextResponse } from 'next/server'
import { createDraftOrder } from '@/lib/orders/store'
import type { OrderItem } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customerName, phoneNumber, shippingAddress, accountId, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty. At least one item is required.' },
        { status: 400 }
      )
    }

    // Validate item shapes
    const sanitizedItems: OrderItem[] = items.map((item: any) => ({
      product_id: String(item.product_id || item.productId || 'item-unknown'),
      title: String(item.title || 'Product Item'),
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, Number(item.quantity) || 1),
      image_url: item.image_url || item.imageUrl || null
    }))

    const { order, whatsapp_url, support_phone } = await createDraftOrder({
      items: sanitizedItems,
      customerName,
      phoneNumber,
      shippingAddress,
      accountId,
      notes
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      short_code: order.short_code,
      total_amount: order.total_amount,
      status: order.status,
      whatsapp_url,
      support_phone
    })
  } catch (err) {
    console.error('Error generating draft order:', err)
    return NextResponse.json(
      { error: 'Failed to create draft order' },
      { status: 500 }
    )
  }
}
