import { NextResponse } from 'next/server'
import { resolveOrderDelivery } from '@/lib/orders/store'
import type { PaymentCollectionMethod, ProofOfDeliveryType } from '@/types'

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const body = await request.json()

    const {
      delivery_status,
      payment_method,
      amount_collected,
      upi_reference,
      cancellation_reason,
      proof_of_delivery_type,
      proof_of_delivery_data,
      notes
    } = body

    if (!delivery_status || !['DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY', 'ASSIGNED'].includes(delivery_status)) {
      return NextResponse.json(
        { error: 'Invalid or missing delivery_status' },
        { status: 400 }
      )
    }

    const result = await resolveOrderDelivery({
      orderIdOrCode: id,
      delivery_status,
      payment_method: payment_method as PaymentCollectionMethod,
      amount_collected: amount_collected !== undefined && amount_collected !== null ? Number(amount_collected) : undefined,
      upi_reference: upi_reference ? String(upi_reference).trim() : undefined,
      cancellation_reason: cancellation_reason ? String(cancellation_reason).trim() : undefined,
      proof_of_delivery_type: proof_of_delivery_type as ProofOfDeliveryType,
      proof_of_delivery_data: proof_of_delivery_data ? String(proof_of_delivery_data) : undefined,
      notes: notes ? String(notes).trim() : undefined
    })

    return NextResponse.json({
      success: true,
      order: result.order,
      stats: result.stats
    })
  } catch (err: any) {
    console.error('[api/orders/[id]/resolve-delivery] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to resolve delivery' },
      { status: 400 }
    )
  }
}
