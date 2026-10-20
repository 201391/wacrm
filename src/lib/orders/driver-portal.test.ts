import { describe, expect, it, beforeEach } from 'vitest'
import {
  getDriverManifest,
  resolveOrderDelivery,
  seedDriverManifestIfEmpty,
  resetTestManifestStops,
  getOrder
} from '@/lib/orders/store'

describe('Delivery Agent Interface & Driver Portal Logic', () => {
  const testAccountId = 'test-account-driver-portal'
  const testAgentId = 'agent-1'

  beforeEach(() => {
    resetTestManifestStops(testAccountId, testAgentId)
  })

  it('retrieves driver manifest with ordered stops and operational shift metrics', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)

    expect(manifest).toBeDefined()
    expect(Array.isArray(manifest.orders)).toBe(true)
    expect(manifest.orders.length).toBeGreaterThanOrEqual(6)

    const stats = manifest.stats
    expect(stats.totalAssigned).toBe(manifest.orders.length)
    expect(stats.pendingDelivery).toBeGreaterThan(0)
    expect(stats.deliveredCount).toBeGreaterThanOrEqual(1)
    expect(stats.cancelledCount).toBeGreaterThanOrEqual(1)

    // Verify financial breakdown: COD vs UPI
    expect(typeof stats.codCollected).toBe('number')
    expect(typeof stats.upiCollected).toBe('number')
    expect(typeof stats.totalCashDue).toBe('number')
    expect(stats.codCollected).toBeGreaterThan(0)
  })

  it('marks stop as OUT_FOR_DELIVERY', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)
    const targetOrder = manifest.orders.find((o) => o.delivery_status === 'ASSIGNED') || manifest.orders[0]

    const result = await resolveOrderDelivery(
      {
        orderIdOrCode: targetOrder.id,
        delivery_status: 'OUT_FOR_DELIVERY',
        notes: 'En route to village'
      },
      testAccountId
    )

    expect(result.order.delivery_status).toBe('OUT_FOR_DELIVERY')
    expect(result.order.delivery_notes).toBe('En route to village')
  })

  it('marks COD order as DELIVERED with cash received', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)
    const codOrder = manifest.orders.find(
      (o) =>
        (o.delivery_status === 'ASSIGNED' || o.delivery_status === 'OUT_FOR_DELIVERY') &&
        (o.payment_preference?.includes('COD') || !o.payment_preference)
    )!

    const previousDeliveredCount = manifest.stats.deliveredCount
    const previousCodCollected = manifest.stats.codCollected

    const result = await resolveOrderDelivery(
      {
        orderIdOrCode: codOrder.id,
        delivery_status: 'DELIVERED',
        payment_method: 'CASH',
        amount_collected: codOrder.total_amount,
        proof_of_delivery_type: 'OTP',
        proof_of_delivery_data: '4592',
        notes: 'Handed over directly to farmer'
      },
      testAccountId
    )

    expect(result.order.delivery_status).toBe('DELIVERED')
    expect(result.order.status).toBe('CONFIRMED')
    expect(result.order.payment_method_collected).toBe('CASH')
    expect(result.order.amount_collected).toBe(codOrder.total_amount)
    expect(result.order.proof_of_delivery_type).toBe('OTP')
    expect(result.order.delivered_at).toBeDefined()

    // Manifest stats reflect increment
    expect(result.stats.deliveredCount).toBe(previousDeliveredCount + 1)
    expect(result.stats.codCollected).toBe(previousCodCollected + codOrder.total_amount)
  })

  it('marks COD order as DELIVERED with UPI digital collection & UTR reference', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)
    const pendingOrder = manifest.orders.find(
      (o) => o.delivery_status === 'ASSIGNED' || o.delivery_status === 'OUT_FOR_DELIVERY'
    )!

    const previousUpiCollected = manifest.stats.upiCollected

    const result = await resolveOrderDelivery(
      {
        orderIdOrCode: pendingOrder.id,
        delivery_status: 'DELIVERED',
        payment_method: 'UPI',
        amount_collected: pendingOrder.total_amount,
        upi_reference: 'UPI9837102948',
        proof_of_delivery_type: 'PHOTO',
        proof_of_delivery_data: 'https://images.unsplash.com/sample.jpg'
      },
      testAccountId
    )

    expect(result.order.delivery_status).toBe('DELIVERED')
    expect(result.order.payment_method_collected).toBe('UPI')
    expect(result.order.upi_reference).toBe('UPI9837102948')
    expect(result.stats.upiCollected).toBe(previousUpiCollected + pendingOrder.total_amount)
  })

  it('prevents marking COD order as DELIVERED without selecting payment method or entering amount', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)
    const codOrder = manifest.orders.find(
      (o) => o.payment_preference?.includes('COD')
    )!

    // Missing payment method
    await expect(
      resolveOrderDelivery(
        {
          orderIdOrCode: codOrder.id,
          delivery_status: 'DELIVERED',
          payment_method: undefined as any
        },
        testAccountId
      )
    ).rejects.toThrow('Please select a payment collection method')

    // Invalid negative amount
    await expect(
      resolveOrderDelivery(
        {
          orderIdOrCode: codOrder.id,
          delivery_status: 'DELIVERED',
          payment_method: 'CASH',
          amount_collected: -50
        },
        testAccountId
      )
    ).rejects.toThrow('Please enter a valid payment amount collected')
  })

  it('marks stop as CANCELLED with structured cancellation reason', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)
    const pendingOrder = manifest.orders.find(
      (o) => o.delivery_status === 'ASSIGNED' || o.delivery_status === 'OUT_FOR_DELIVERY'
    )!

    const previousCancelled = manifest.stats.cancelledCount

    const result = await resolveOrderDelivery(
      {
        orderIdOrCode: pendingOrder.id,
        delivery_status: 'CANCELLED',
        cancellation_reason: 'CUSTOMER_REFUSED',
        notes: 'Customer changed mind due to price'
      },
      testAccountId
    )

    expect(result.order.delivery_status).toBe('CANCELLED')
    expect(result.order.status).toBe('CANCELLED')
    expect(result.order.cancellation_reason).toBe('CUSTOMER_REFUSED')
    expect(result.order.delivery_notes).toBe('Customer changed mind due to price')
    expect(result.stats.cancelledCount).toBe(previousCancelled + 1)
  })

  it('rejects cancellation without a structured reason', async () => {
    const manifest = await getDriverManifest(testAgentId, testAccountId)
    const pendingOrder = manifest.orders[0]

    await expect(
      resolveOrderDelivery(
        {
          orderIdOrCode: pendingOrder.id,
          delivery_status: 'CANCELLED',
          cancellation_reason: ''
        },
        testAccountId
      )
    ).rejects.toThrow('Please select a cancellation reason')
  })
})
