import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type {
  DeliveryAgent,
  CreateDeliveryAgentInput,
  UpdateDeliveryAgentInput,
  DeliveryAgentFilters,
  DeliveryAgentStats,
  VehicleType,
  DeliveryAgentStatus,
  Order
} from '@/types'
import { getDefaultAccountId, getOrder, updateOrderDeliveryAgent } from '@/lib/orders/store'

// Lazy-initialized admin client for Supabase
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

const memoryDeliveryAgents: Map<string, DeliveryAgent> = new Map()

const DEFAULT_SEED_AGENTS: Omit<DeliveryAgent, 'account_id' | 'created_at' | 'updated_at'>[] = [
  {
    id: 'agent-1',
    name: 'Rajesh Kumar',
    phone: '+91 98112 34567',
    email: 'rajesh.k@delivery.jatrra.com',
    vehicle_type: 'BIKE',
    vehicle_number: 'PB 11 AB 4592',
    status: 'AVAILABLE',
    active_orders_count: 0,
    current_order_id: null,
    current_order_short_code: null,
    emergency_contact: '+91 98112 99999 (Brother - Mukesh)',
    notes: 'Handles rural routes in Rajpura & Patiala belt. Fast delivery and high customer satisfaction.',
    rating: 4.9,
    total_deliveries: 184,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'agent-2',
    name: 'Amit Sharma',
    phone: '+91 98721 88344',
    email: 'amit.s@delivery.jatrra.com',
    vehicle_type: 'VAN',
    vehicle_number: 'PB 23 X 8810',
    status: 'ON_DELIVERY',
    active_orders_count: 1,
    current_order_id: 'ord-1021',
    current_order_short_code: '1021',
    emergency_contact: '+91 98721 00112 (Wife - Sunita)',
    notes: 'Specializes in heavy 50kg cattle feed sacks. Vehicle equipped with hydraulic trolley ramp.',
    rating: 4.8,
    total_deliveries: 342,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'agent-3',
    name: 'Deepak Verma',
    phone: '+91 97800 55123',
    email: 'deepak.v@delivery.jatrra.com',
    vehicle_type: 'SCOOTER',
    vehicle_number: 'HR 01 Z 3390',
    status: 'AVAILABLE',
    active_orders_count: 0,
    current_order_id: null,
    current_order_short_code: null,
    emergency_contact: '+91 97800 11111 (Father - Ramji)',
    notes: 'Ideal for prompt delivery of liquid calcium bottles, mineral supplements, and certified seed packets.',
    rating: 4.7,
    total_deliveries: 129,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'agent-4',
    name: 'Jaswinder Singh',
    phone: '+91 99155 44778',
    email: 'jaswinder.s@delivery.jatrra.com',
    vehicle_type: 'ELECTRIC_AUTO',
    vehicle_number: 'PB 65 E 1904',
    status: 'AVAILABLE',
    active_orders_count: 0,
    current_order_id: null,
    current_order_short_code: null,
    emergency_contact: '+91 99155 00000 (Family)',
    notes: 'Zero-emission electric cargo vehicle. High payload capacity of up to 400kg for local village clusters.',
    rating: 4.95,
    total_deliveries: 260,
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'agent-5',
    name: 'Vikram Rathore',
    phone: '+91 94141 66200',
    email: 'vikram.r@delivery.jatrra.com',
    vehicle_type: 'TRUCK',
    vehicle_number: 'RJ 14 GA 5512',
    status: 'OFFLINE',
    active_orders_count: 0,
    current_order_id: null,
    current_order_short_code: null,
    emergency_contact: '+91 94141 99991',
    notes: 'Heavy multi-ton truck for inter-district fertilizer shipments. Scheduled vehicle inspection in progress.',
    rating: 4.65,
    total_deliveries: 410,
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80'
  }
]

function getStorageFilePath(): string {
  const dir = path.join(process.cwd(), '.data')
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // Ignore directory create errors
    }
  }
  return path.join(dir, 'delivery-agents.json')
}

function persistDeliveryAgentsToFile() {
  try {
    const file = getStorageFilePath()
    const data = Array.from(memoryDeliveryAgents.values())
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[delivery-agents/store] could not write delivery agents file:', err)
  }
}

function seedMemoryAgents(accountId: string) {
  if (memoryDeliveryAgents.size > 0) return

  try {
    const file = getStorageFilePath()
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      const parsed: DeliveryAgent[] = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((a) => memoryDeliveryAgents.set(a.id, a))
        return
      }
    }
  } catch (err) {
    console.warn('[delivery-agents/store] failed loading stored delivery agents:', err)
  }

  const now = new Date().toISOString()
  DEFAULT_SEED_AGENTS.forEach((agent) => {
    memoryDeliveryAgents.set(agent.id, {
      ...agent,
      account_id: accountId,
      created_at: now,
      updated_at: now
    })
  })

  persistDeliveryAgentsToFile()
}

/**
 * List all delivery agents with optional filters.
 */
export async function listDeliveryAgents(filters?: DeliveryAgentFilters): Promise<DeliveryAgent[]> {
  const accountId = filters?.accountId || (await getDefaultAccountId())
  seedMemoryAgents(accountId)

  try {
    let query = supabaseAdmin()
      .from('delivery_agents')
      .select('*')
      .eq('account_id', accountId)

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status)
    }

    if (filters?.vehicle_type && filters.vehicle_type !== 'ALL') {
      query = query.eq('vehicle_type', filters.vehicle_type)
    }

    if (filters?.search) {
      const s = filters.search.trim()
      query = query.or(`name.ilike.%${s}%,phone.ilike.%${s}%,vehicle_number.ilike.%${s}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error && data && data.length > 0) {
      return data as DeliveryAgent[]
    }
  } catch (err) {
    console.warn('[delivery-agents/store] error listing from DB:', err)
  }

  // Fallback to file & in-memory store
  const allAgents = Array.from(memoryDeliveryAgents.values())
  return allAgents.filter((agent) => {
    if (filters?.status && filters.status !== 'ALL' && agent.status !== filters.status) {
      return false
    }
    if (filters?.vehicle_type && filters.vehicle_type !== 'ALL' && agent.vehicle_type !== filters.vehicle_type) {
      return false
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase().trim()
      const matchName = agent.name.toLowerCase().includes(s)
      const matchPhone = agent.phone.toLowerCase().includes(s)
      const matchVehicle = agent.vehicle_number.toLowerCase().includes(s)
      const matchEmail = (agent.email || '').toLowerCase().includes(s)
      if (!matchName && !matchPhone && !matchVehicle && !matchEmail) {
        return false
      }
    }
    return true
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Retrieve a single delivery agent by ID.
 */
export async function getDeliveryAgentById(id: string): Promise<DeliveryAgent | null> {
  const accountId = await getDefaultAccountId()
  seedMemoryAgents(accountId)

  if (memoryDeliveryAgents.has(id)) {
    return memoryDeliveryAgents.get(id)!
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('delivery_agents')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      memoryDeliveryAgents.set(data.id, data as DeliveryAgent)
      return data as DeliveryAgent
    }
  } catch (err) {
    console.warn('[delivery-agents/store] error fetching agent by id:', err)
  }

  return null
}

/**
 * Create a new delivery agent.
 */
export async function createDeliveryAgent(
  payload: CreateDeliveryAgentInput,
  accountId?: string
): Promise<DeliveryAgent> {
  const resolvedAccountId = accountId || (await getDefaultAccountId())
  seedMemoryAgents(resolvedAccountId)

  const id = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const now = new Date().toISOString()

  const newAgent: DeliveryAgent = {
    id,
    account_id: resolvedAccountId,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || null,
    vehicle_type: payload.vehicle_type || 'BIKE',
    vehicle_number: payload.vehicle_number.trim().toUpperCase(),
    status: payload.status || 'AVAILABLE',
    active_orders_count: 0,
    current_order_id: null,
    current_order_short_code: null,
    emergency_contact: payload.emergency_contact?.trim() || null,
    notes: payload.notes?.trim() || null,
    rating: 5.0,
    total_deliveries: 0,
    avatar_url: payload.avatar_url || null,
    created_at: now,
    updated_at: now
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('delivery_agents')
      .insert(newAgent)
      .select('*')
      .single()

    if (!error && data) {
      newAgent.id = data.id
    }
  } catch (err) {
    console.warn('[delivery-agents/store] could not insert into delivery_agents table:', err)
  }

  memoryDeliveryAgents.set(newAgent.id, newAgent)
  persistDeliveryAgentsToFile()

  return newAgent
}

/**
 * Update an existing delivery agent.
 */
export async function updateDeliveryAgent(
  id: string,
  payload: UpdateDeliveryAgentInput
): Promise<DeliveryAgent | null> {
  const agent = await getDeliveryAgentById(id)
  if (!agent) return null

  if (payload.name !== undefined) agent.name = payload.name.trim()
  if (payload.phone !== undefined) agent.phone = payload.phone.trim()
  if (payload.email !== undefined) agent.email = payload.email ? payload.email.trim() : null
  if (payload.vehicle_type !== undefined) agent.vehicle_type = payload.vehicle_type
  if (payload.vehicle_number !== undefined) agent.vehicle_number = payload.vehicle_number.trim().toUpperCase()
  if (payload.status !== undefined) agent.status = payload.status
  if (payload.emergency_contact !== undefined) agent.emergency_contact = payload.emergency_contact ? payload.emergency_contact.trim() : null
  if (payload.notes !== undefined) agent.notes = payload.notes ? payload.notes.trim() : null
  if (payload.rating !== undefined) agent.rating = payload.rating
  if (payload.total_deliveries !== undefined) agent.total_deliveries = payload.total_deliveries
  if (payload.avatar_url !== undefined) agent.avatar_url = payload.avatar_url
  agent.updated_at = new Date().toISOString()

  try {
    await supabaseAdmin()
      .from('delivery_agents')
      .update(agent)
      .eq('id', id)
  } catch (err) {
    console.warn('[delivery-agents/store] error updating delivery agent in DB:', err)
  }

  memoryDeliveryAgents.set(agent.id, agent)
  persistDeliveryAgentsToFile()

  return agent
}

/**
 * Delete a delivery agent.
 */
export async function deleteDeliveryAgent(id: string): Promise<boolean> {
  const accountId = await getDefaultAccountId()
  seedMemoryAgents(accountId)

  if (!memoryDeliveryAgents.has(id)) {
    return false
  }

  memoryDeliveryAgents.delete(id)
  persistDeliveryAgentsToFile()

  try {
    await supabaseAdmin()
      .from('delivery_agents')
      .delete()
      .eq('id', id)
  } catch (err) {
    console.warn('[delivery-agents/store] error deleting agent from DB:', err)
  }

  return true
}

/**
 * Assign or reassign/unassign an agent to an order.
 * Updates order's delivery agent details AND the agent's active orders count.
 */
export async function assignAgentToOrder(
  orderIdOrCode: string,
  agentId: string | null
): Promise<{ order: Order; agent?: DeliveryAgent | null }> {
  const order = await getOrder(orderIdOrCode)
  if (!order) {
    throw new Error('Order not found')
  }

  const prevAgentId = order.delivery_agent_id

  let newAgent: DeliveryAgent | null = null
  if (agentId) {
    newAgent = await getDeliveryAgentById(agentId)
    if (!newAgent) {
      throw new Error(`Delivery agent with id ${agentId} not found`)
    }
  }

  // Update order delivery assignment
  const updatedOrder = await updateOrderDeliveryAgent(
    order.id,
    newAgent,
    newAgent ? 'ASSIGNED' : 'UNASSIGNED'
  )

  if (!updatedOrder) {
    throw new Error('Failed to update order with delivery agent')
  }

  // Decrement previous agent active count if different
  if (prevAgentId && prevAgentId !== agentId) {
    const prevAgent = await getDeliveryAgentById(prevAgentId)
    if (prevAgent) {
      const nextCount = Math.max(0, (prevAgent.active_orders_count || 1) - 1)
      await updateDeliveryAgent(prevAgent.id, {
        status: nextCount === 0 ? 'AVAILABLE' : prevAgent.status
      })
      prevAgent.active_orders_count = nextCount
      if (nextCount === 0) {
        prevAgent.current_order_id = null
        prevAgent.current_order_short_code = null
      }
      memoryDeliveryAgents.set(prevAgent.id, prevAgent)
      persistDeliveryAgentsToFile()
    }
  }

  // Increment new agent active count & set status to ON_DELIVERY if appropriate
  if (newAgent) {
    newAgent.active_orders_count = (newAgent.active_orders_count || 0) + 1
    newAgent.current_order_id = updatedOrder.id
    newAgent.current_order_short_code = updatedOrder.short_code
    newAgent.status = 'ON_DELIVERY'
    memoryDeliveryAgents.set(newAgent.id, newAgent)
    persistDeliveryAgentsToFile()
  }

  return {
    order: updatedOrder,
    agent: newAgent
  }
}

/**
 * Aggregated statistics for the delivery agents dashboard.
 */
export async function getDeliveryAgentStats(accountId?: string): Promise<DeliveryAgentStats> {
  const agents = await listDeliveryAgents({ accountId })
  const totalAgents = agents.length
  const availableAgents = agents.filter((a) => a.status === 'AVAILABLE').length
  const onDeliveryAgents = agents.filter((a) => a.status === 'ON_DELIVERY').length
  const offlineAgents = agents.filter((a) => a.status === 'OFFLINE').length

  const totalRatingSum = agents.reduce((sum, a) => sum + (a.rating || 5.0), 0)
  const avgRating = totalAgents > 0 ? Math.round((totalRatingSum / totalAgents) * 10) / 10 : 5.0

  const totalCompletedDeliveries = agents.reduce((sum, a) => sum + (a.total_deliveries || 0), 0)

  return {
    totalAgents,
    availableAgents,
    onDeliveryAgents,
    offlineAgents,
    avgRating,
    totalCompletedDeliveries
  }
}
