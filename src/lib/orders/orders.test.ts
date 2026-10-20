import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createDraftOrder,
  getOrder,
  updateOrderShippingAddress,
  confirmOrderStatus,
  bindOrderToContactAndConversation,
  listProducts
} from './store'
import {
  toolFetchOrderDetails,
  toolUpdateShippingAddress,
  toolConfirmOrderStatus,
  processOrderConfirmationTurn
} from './ai-agent'

vi.mock('@/lib/flows/meta-send', () => ({
  engineSendText: vi.fn().mockResolvedValue({ whatsapp_message_id: 'wamid.TEST_ORDER_SEND' })
}))

vi.mock('@/lib/ai/config', () => ({
  loadAiConfig: vi.fn().mockResolvedValue(null) // test state machine deterministic path
}))

describe('E-Commerce & Orders Engine', () => {
  const sampleItems = [
    {
      product_id: 'prod-1',
      title: 'AeroPulse Wireless Noise-Cancelling Headphones',
      price: 149.99,
      quantity: 1,
      image_url: 'https://example.com/headphones.jpg'
    },
    {
      product_id: 'prod-5',
      title: 'HydroPure Insulated Thermal Flask (1L)',
      price: 34.99,
      quantity: 2,
      image_url: 'https://example.com/flask.jpg'
    }
  ]

  it('lists default seed products when catalog is queried', async () => {
    const products = await listProducts()
    expect(products.length).toBeGreaterThanOrEqual(5)
    expect(products[0]).toHaveProperty('title')
    expect(products[0]).toHaveProperty('slug')
    expect(products[0]).toHaveProperty('price')
  })

  it('creates draft order and generates WhatsApp checkout deep-link', async () => {
    const { order, whatsapp_url, support_phone } = await createDraftOrder({
      items: sampleItems,
      customerName: 'Alex Mercer',
      phoneNumber: '+15551234567'
    })

    expect(order.short_code).toMatch(/^ORD-\d+$/)
    expect(order.status).toBe('PENDING_WHATSAPP')
    // 149.99 * 1 + 34.99 * 2 = 219.97
    expect(order.total_amount).toBe(219.97)
    expect(whatsapp_url).toContain('https://wa.me/')
    expect(whatsapp_url).toContain(encodeURIComponent(`#${order.short_code}`))
    expect(support_phone).toBeDefined()
  })

  it('retrieves order details via toolFetchOrderDetails', async () => {
    const { order } = await createDraftOrder({ items: sampleItems })
    const details = await toolFetchOrderDetails(order.short_code)

    expect(details).not.toHaveProperty('error')
    expect((details as any).short_code).toBe(order.short_code)
    expect((details as any).total_amount).toBe(219.97)
    expect((details as any).items.length).toBe(2)
  })

  it('updates shipping address via toolUpdateShippingAddress', async () => {
    const { order } = await createDraftOrder({ items: sampleItems })
    const result = await toolUpdateShippingAddress(order.short_code, '742 Evergreen Terrace, Springfield')

    expect(result).not.toHaveProperty('error')
    expect((result as any).shipping_address).toBe('742 Evergreen Terrace, Springfield')

    const updated = await getOrder(order.short_code)
    expect(updated?.shipping_address).toBe('742 Evergreen Terrace, Springfield')
  })

  it('confirms order status via toolConfirmOrderStatus', async () => {
    const { order } = await createDraftOrder({ items: sampleItems })
    const result = await toolConfirmOrderStatus(order.short_code, 'Cash on Delivery (COD)')

    expect(result).not.toHaveProperty('error')
    expect((result as any).status).toBe('CONFIRMED')
    expect((result as any).payment_preference).toBe('Cash on Delivery (COD)')

    const updated = await getOrder(order.short_code)
    expect(updated?.status).toBe('CONFIRMED')
  })

  it('binds order to contact and conversation', async () => {
    const { order } = await createDraftOrder({ items: sampleItems })
    const bound = await bindOrderToContactAndConversation(
      order.short_code,
      'contact-uuid-1',
      'conversation-uuid-1',
      '+15559876543'
    )

    expect(bound?.customer_id).toBe('contact-uuid-1')
    expect(bound?.conversation_id).toBe('conversation-uuid-1')
    expect(bound?.phone_number).toBe('15559876543')
  })

  it('processes AI confirmation turns and guides customer through address and confirmation', async () => {
    const { engineSendText } = await import('@/lib/flows/meta-send')
    const { order } = await createDraftOrder({ items: sampleItems })

    // Turn 1: Initial inbound greeting with order code
    await processOrderConfirmationTurn({
      accountId: 'account-1',
      conversationId: 'conv-1',
      contactId: 'contact-1',
      configOwnerUserId: 'admin-1',
      customerPhone: '15551234567',
      incomingText: `Hi! I would like to confirm order #${order.short_code}`,
      order
    })

    expect(engineSendText).toHaveBeenCalled()
    const call1 = vi.mocked(engineSendText).mock.calls[0][0]
    expect(call1.text).toContain(`Order #${order.short_code}`)
    expect(call1.text).toContain('delivery shipping address')

    // Turn 2: Customer provides shipping address
    await processOrderConfirmationTurn({
      accountId: 'account-1',
      conversationId: 'conv-1',
      contactId: 'contact-1',
      configOwnerUserId: 'admin-1',
      customerPhone: '15551234567',
      incomingText: '456 Elm Street, Apt 2B, Metropolis',
      order: (await getOrder(order.short_code))!
    })

    const call2 = vi.mocked(engineSendText).mock.calls[1][0]
    expect(call2.text).toContain('456 Elm Street, Apt 2B, Metropolis')
    expect(call2.text).toContain('CONFIRM')

    // Turn 3: Customer confirms order
    await processOrderConfirmationTurn({
      accountId: 'account-1',
      conversationId: 'conv-1',
      contactId: 'contact-1',
      configOwnerUserId: 'admin-1',
      customerPhone: '15551234567',
      incomingText: 'YES please confirm it with COD',
      order: (await getOrder(order.short_code))!
    })

    const call3 = vi.mocked(engineSendText).mock.calls[2][0]
    expect(call3.text).toContain('Order Confirmed!')
    expect(call3.text).toContain(order.short_code)

    const finalOrder = await getOrder(order.short_code)
    expect(finalOrder?.status).toBe('CONFIRMED')
  })

  it('matches order codes via regex in webhook text', () => {
    const regex1 = /#(ORD-[A-Z0-9]+)/i
    const regex2 = /\b(ORD-[0-9]{4,8})\b/i

    const text1 = 'Hi! I would like to confirm order #ORD-1024'
    const match1 = text1.match(regex1)
    expect(match1).not.toBeNull()
    expect(match1?.[1].toUpperCase()).toBe('ORD-1024')

    const text2 = 'Please check status of ORD-2055'
    const match2 = text2.match(regex2)
    expect(match2).not.toBeNull()
    expect(match2?.[1].toUpperCase()).toBe('ORD-2055')
  })
})
