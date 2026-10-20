import { describe, expect, it } from 'vitest'
import { POST } from './route'
import { getDriverManifest } from '@/lib/orders/store'

describe('Resolve Delivery API (/api/orders/[id]/resolve-delivery)', () => {
  it('returns 400 when delivery_status is missing or invalid', async () => {
    const req = new Request('http://localhost:3000/api/orders/ord-1021/resolve-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_status: 'INVALID_STATUS' }),
    })

    const res = await POST(req, {
      params: Promise.resolve({ id: 'ord-1021' }),
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('successfully records order delivery via POST', async () => {
    const manifest = await getDriverManifest('agent-1')
    const pendingOrder = manifest.orders.find((o) => o.delivery_status !== 'DELIVERED') || manifest.orders[0]

    const req = new Request(`http://localhost:3000/api/orders/${pendingOrder.id}/resolve-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_status: 'DELIVERED',
        payment_method: 'CASH',
        amount_collected: pendingOrder.total_amount,
        proof_of_delivery_type: 'OTP',
        proof_of_delivery_data: '1234',
        notes: 'Delivered successfully via test',
      }),
    })

    const res = await POST(req, {
      params: Promise.resolve({ id: pendingOrder.id }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.order.delivery_status).toBe('DELIVERED')
    expect(data.order.payment_method_collected).toBe('CASH')
    expect(data.stats).toBeDefined()
  })
})
