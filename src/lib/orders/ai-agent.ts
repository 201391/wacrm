import { createClient } from '@supabase/supabase-js'
import {
  getOrder,
  updateOrderShippingAddress,
  confirmOrderStatus,
  bindOrderToContactAndConversation
} from './store'
import type { Order } from '@/types'
import { loadAiConfig } from '@/lib/ai/config'
import { engineSendText } from '@/lib/flows/meta-send'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

/**
 * Tool 1: fetch_order_details
 */
export async function toolFetchOrderDetails(orderIdOrCode: string) {
  const order = await getOrder(orderIdOrCode)
  if (!order) {
    return { error: `Order ${orderIdOrCode} not found` }
  }
  return {
    order_id: order.id,
    short_code: order.short_code,
    status: order.status,
    total_amount: order.total_amount,
    items: order.items,
    shipping_address: order.shipping_address,
    payment_preference: order.payment_preference,
    customer_name: order.customer_name,
    phone_number: order.phone_number
  }
}

/**
 * Tool 2: update_shipping_address
 */
export async function toolUpdateShippingAddress(orderIdOrCode: string, addressText: string) {
  const updated = await updateOrderShippingAddress(orderIdOrCode, addressText)
  if (!updated) {
    return { error: `Failed to update shipping address for ${orderIdOrCode}` }
  }
  return {
    success: true,
    order_id: updated.id,
    short_code: updated.short_code,
    shipping_address: updated.shipping_address
  }
}

/**
 * Tool 3: confirm_order_status
 */
export async function toolConfirmOrderStatus(orderIdOrCode: string, paymentPreference: string = 'Cash on Delivery (COD)') {
  const updated = await confirmOrderStatus(orderIdOrCode, paymentPreference)
  if (!updated) {
    return { error: `Failed to confirm order ${orderIdOrCode}` }
  }
  return {
    success: true,
    order_id: updated.id,
    short_code: updated.short_code,
    status: updated.status,
    payment_preference: updated.payment_preference
  }
}

// Function calling definitions for OpenAI-compatible providers
export const ORDER_AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'fetch_order_details',
      description: 'Fetch details of an order including items, total amount, shipping address, and current status.',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'string', description: 'The order ID or short code (e.g. ORD-1024)' }
        },
        required: ['order_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_shipping_address',
      description: 'Update the delivery shipping address for an order once provided by the customer.',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'string', description: 'The order ID or short code' },
          address_text: { type: 'string', description: 'The complete physical delivery address' }
        },
        required: ['order_id', 'address_text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'confirm_order_status',
      description: 'Finalize and confirm the order status once customer confirms their address and payment method.',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'string', description: 'The order ID or short code' },
          payment_preference: {
            type: 'string',
            description: 'Customer payment preference (e.g. Cash on Delivery, UPI, Card)'
          }
        },
        required: ['order_id', 'payment_preference']
      }
    }
  }
]

export interface ProcessOrderTurnArgs {
  accountId: string
  conversationId: string
  contactId: string
  configOwnerUserId: string
  customerPhone: string
  incomingText: string
  order: Order
}

/**
 * Execute tool call by name
 */
async function executeToolCall(toolName: string, args: Record<string, any>) {
  switch (toolName) {
    case 'fetch_order_details':
      return toolFetchOrderDetails(args.order_id)
    case 'update_shipping_address':
      return toolUpdateShippingAddress(args.order_id, args.address_text)
    case 'confirm_order_status':
      return toolConfirmOrderStatus(args.order_id, args.payment_preference)
    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}

/**
 * State-machine fallback for deterministic, instant, zero-cost WhatsApp conversation turns.
 */
async function runDeterministicOrderTurn(
  incomingText: string,
  order: Order
): Promise<string> {
  const text = incomingText.trim().toLowerCase()
  const itemsSummary = order.items
    .map(i => `• ${i.quantity}x *${i.title}* - ₹${(Number(i.price) * i.quantity).toFixed(2)}`)
    .join('\n')

  // Check if order is already confirmed
  if (order.status === 'CONFIRMED') {
    return `🎉 Order *#${order.short_code}* is already confirmed and in processing!\n\n📍 *Shipping to:* ${order.shipping_address || 'Address on file'}\n💰 *Total:* ₹${order.total_amount.toFixed(2)}\n\nIf you need any adjustments, please let our team know.`
  }

  // 1. Initial greeting / order reference received from deep link
  const isInitialTrigger =
    text.includes('confirm order') ||
    text.includes(order.short_code.toLowerCase()) ||
    (text.startsWith('hi') && !order.shipping_address && text.length < 50)

  if (isInitialTrigger && !order.shipping_address) {
    return (
      `👋 Hi there! Thank you for reaching out to confirm your order!\n\n` +
      `📦 *Order #${order.short_code} Details:*\n${itemsSummary}\n\n` +
      `💰 *Total Amount:* ₹${order.total_amount.toFixed(2)}\n\n` +
      `📍 To complete your delivery, please reply with your *full delivery shipping address* (Street, City, Postal Code).`
    )
  }

  // 2. Check for confirmation keywords
  const isConfirmIntent = [
    'yes',
    'confirm',
    'proceed',
    'ok',
    'cod',
    'cash on delivery',
    'sure',
    'yep',
    'place order',
    'correct'
  ].some(k => text === k || text.startsWith(k + ' ') || text.endsWith(' ' + k) || text.includes(k))

  if (isConfirmIntent && order.shipping_address) {
    await toolConfirmOrderStatus(order.id, 'Cash on Delivery (COD)')
    return (
      `🎉 *Order Confirmed!* Thank you!\n\n` +
      `Your order *#${order.short_code}* has been successfully placed.\n\n` +
      `📦 *Items:* ${order.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}\n` +
      `💰 *Total:* ₹${order.total_amount.toFixed(2)} (Cash on Delivery)\n` +
      `📍 *Delivery Address:* ${order.shipping_address}\n\n` +
      `🚚 Our team is packing your items now. We will notify you here once your shipment is on the way!`
    )
  }

  // 3. Customer provided an address
  if (!order.shipping_address || text.length > 5) {
    await toolUpdateShippingAddress(order.id, incomingText.trim())
    return (
      `📍 *Delivery Address Received:*\n` +
      `"${incomingText.trim()}"\n\n` +
      `💰 *Total Amount:* ₹${order.total_amount.toFixed(2)}\n` +
      `💳 *Payment:* Cash on Delivery (COD)\n\n` +
      `Reply *YES* or *CONFIRM* to finalize and dispatch your order!`
    )
  }

  // Default clarification prompt
  return (
    `📦 *Order #${order.short_code}*\n` +
    `Total: ₹${order.total_amount.toFixed(2)}\n` +
    (order.shipping_address
      ? `Delivery address: ${order.shipping_address}\n\nPlease reply *CONFIRM* to place your order.`
      : `Please provide your full *delivery address* so we can confirm your order.`)
  )
}

/**
 * Primary Order Confirmation Turn Handler.
 * Tries LLM Tool/Function calling when account BYO key is configured;
 * seamlessly falls back to the deterministic state machine.
 */
export async function processOrderConfirmationTurn(args: ProcessOrderTurnArgs): Promise<void> {
  const {
    accountId,
    conversationId,
    contactId,
    configOwnerUserId,
    customerPhone,
    incomingText,
    order
  } = args

  // Ensure order is bound to this contact & conversation
  await bindOrderToContactAndConversation(
    order.id,
    contactId,
    conversationId,
    customerPhone
  )

  let replyText = ''

  try {
    const db = supabaseAdmin()
    const aiConfig = await loadAiConfig(db, accountId)

    if (aiConfig && aiConfig.provider === 'openai' && aiConfig.apiKey) {
      // Execute with OpenAI Function Calling
      const systemPrompt = `You are the friendly WhatsApp E-Commerce Sales & Order Confirmation Assistant.
Your goal is to guide the customer to verify their order details, obtain their shipping address, and confirm their order.
Current Order Short Code: ${order.short_code}
Current Status: ${order.status}
Current Total: $${order.total_amount}

Guidelines:
1. Greet the customer and summarize their order items and total.
2. If no shipping address is present, ask for their full delivery shipping address.
3. When the customer provides their address, invoke \`update_shipping_address\` tool with order_id "${order.short_code}" and the address text.
4. Once the address is set, ask them to confirm the order with their preferred payment method (e.g. Cash on Delivery).
5. When the customer confirms, call \`confirm_order_status\` tool with order_id "${order.short_code}" and payment preference.
6. Provide a celebratory confirmation summary with their Order ID (#${order.short_code}).
Keep responses concise, clear, and styled for WhatsApp with *bolding* and emoji.`

      const openAiUrl = 'https://api.openai.com/v1/chat/completions'
      const response = await fetch(openAiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiConfig.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: incomingText }
          ],
          tools: ORDER_AGENT_TOOLS,
          tool_choice: 'auto',
          max_tokens: 500
        }),
        signal: AbortSignal.timeout(20000)
      })

      if (response.ok) {
        const data = await response.json()
        const choice = data.choices?.[0]?.message

        if (choice?.tool_calls && choice.tool_calls.length > 0) {
          // Execute requested tool calls
          const toolResults: any[] = []
          for (const call of choice.tool_calls) {
            const parsedArgs = JSON.parse(call.function.arguments || '{}')
            // Default order_id if missing
            if (!parsedArgs.order_id) parsedArgs.order_id = order.short_code
            const result = await executeToolCall(call.function.name, parsedArgs)
            toolResults.push({
              tool_call_id: call.id,
              role: 'tool',
              name: call.function.name,
              content: JSON.stringify(result)
            })
          }

          // Follow-up completion with tool output
          const secondResponse = await fetch(openAiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${aiConfig.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: aiConfig.model || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: incomingText },
                choice,
                ...toolResults
              ],
              max_tokens: 500
            }),
            signal: AbortSignal.timeout(15000)
          })

          if (secondResponse.ok) {
            const secondData = await secondResponse.json()
            replyText = secondData.choices?.[0]?.message?.content || ''
          }
        } else if (choice?.content) {
          replyText = choice.content
        }
      }
    }
  } catch (err) {
    console.warn('[orders/ai-agent] LLM tool-calling error, falling back to state machine:', err)
  }

  // Fallback to state machine if LLM was skipped or returned empty
  if (!replyText || !replyText.trim()) {
    replyText = await runDeterministicOrderTurn(incomingText, order)
  }

  // Send reply through WhatsApp engine and persist to CRM conversation
  try {
    await engineSendText({
      accountId,
      userId: configOwnerUserId,
      conversationId,
      contactId,
      text: replyText,
      aiGenerated: true
    })
  } catch (sendErr) {
    console.warn('[orders/ai-agent] engineSendText error (fallback to local message insert):', sendErr)
    // Local fallback insert for dev environments where Meta is not connected
    try {
      const db = supabaseAdmin()
      await db.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'bot',
        content_type: 'text',
        content_text: replyText,
        message_id: `order_bot_${Date.now()}`,
        status: 'delivered',
        ai_generated: true
      })
      await db.from('conversations').update({
        last_message_text: replyText,
        last_message_at: new Date().toISOString()
      }).eq('id', conversationId)
    } catch (dbErr) {
      console.error('[orders/ai-agent] message persistence failed:', dbErr)
    }
  }
}
