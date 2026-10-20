import { describe, it, expect, beforeEach } from 'vitest'
import {
  listDeliveryAgents,
  getDeliveryAgentById,
  createDeliveryAgent,
  updateDeliveryAgent,
  deleteDeliveryAgent,
  assignAgentToOrder,
  getDeliveryAgentStats
} from './store'
import { getOrder, createDraftOrder } from '@/lib/orders/store'

describe('Delivery Agents Store', () => {
  it('should list seed delivery agents with valid metadata', async () => {
    const agents = await listDeliveryAgents()
    expect(agents.length).toBeGreaterThanOrEqual(4)
    const first = agents[0]
    expect(first.name).toBeDefined()
    expect(first.phone).toBeDefined()
    expect(first.vehicle_type).toBeDefined()
    expect(first.vehicle_number).toBeDefined()
  })

  it('should filter delivery agents by status', async () => {
    const available = await listDeliveryAgents({ status: 'AVAILABLE' })
    expect(available.every((a) => a.status === 'AVAILABLE')).toBe(true)

    const onDelivery = await listDeliveryAgents({ status: 'ON_DELIVERY' })
    expect(onDelivery.every((a) => a.status === 'ON_DELIVERY')).toBe(true)
  })

  it('should filter delivery agents by vehicle type', async () => {
    const bikes = await listDeliveryAgents({ vehicle_type: 'BIKE' })
    expect(bikes.every((a) => a.vehicle_type === 'BIKE')).toBe(true)
  })

  it('should filter delivery agents by search query', async () => {
    const found = await listDeliveryAgents({ search: 'Rajesh' })
    expect(found.length).toBeGreaterThan(0)
    expect(found[0].name).toContain('Rajesh')
  })

  it('should create a new delivery agent', async () => {
    const newAgent = await createDeliveryAgent({
      name: 'Harpreet Sandhu',
      phone: '+91 98888 77766',
      email: 'harpreet.s@delivery.jatrra.com',
      vehicle_type: 'BIKE',
      vehicle_number: 'PB 10 CF 9001',
      emergency_contact: '+91 98888 00000',
      notes: 'New joined pilot for Ludhiana zone.',
      status: 'AVAILABLE'
    })

    expect(newAgent.id).toBeDefined()
    expect(newAgent.name).toBe('Harpreet Sandhu')
    expect(newAgent.status).toBe('AVAILABLE')

    const fetched = await getDeliveryAgentById(newAgent.id)
    expect(fetched).not.toBeNull()
    expect(fetched?.name).toBe('Harpreet Sandhu')
  })

  it('should update an existing delivery agent', async () => {
    const agents = await listDeliveryAgents()
    const target = agents[0]

    const updated = await updateDeliveryAgent(target.id, {
      status: 'OFFLINE',
      notes: 'Off duty today for personal leave'
    })

    expect(updated).not.toBeNull()
    expect(updated?.status).toBe('OFFLINE')
    expect(updated?.notes).toBe('Off duty today for personal leave')

    // Restore status
    await updateDeliveryAgent(target.id, {
      status: 'AVAILABLE'
    })
  })

  it('should assign and unassign an agent to an order', async () => {
    // 1. Create a draft order
    const { order } = await createDraftOrder({
      items: [
        {
          product_id: 'prod-1',
          title: 'Balanced Cattle Feed Pellets',
          price: 1249,
          quantity: 1
        }
      ],
      customerName: 'Test Farmer',
      phoneNumber: '+91 99999 88888',
      shippingAddress: 'Field Road, Nabha'
    })

    expect(order.delivery_status).toBe('UNASSIGNED')

    // 2. Assign agent
    const availableAgents = await listDeliveryAgents({ status: 'AVAILABLE' })
    expect(availableAgents.length).toBeGreaterThan(0)
    const agentToAssign = availableAgents[0]

    const assignResult = await assignAgentToOrder(order.id, agentToAssign.id)
    expect(assignResult.order.delivery_agent_id).toBe(agentToAssign.id)
    expect(assignResult.order.delivery_status).toBe('ASSIGNED')
    expect(assignResult.agent?.status).toBe('ON_DELIVERY')

    // 3. Unassign agent
    const unassignResult = await assignAgentToOrder(order.id, null)
    expect(unassignResult.order.delivery_agent_id).toBeNull()
    expect(unassignResult.order.delivery_status).toBe('UNASSIGNED')
  })

  it('should calculate stats correctly', async () => {
    const stats = await getDeliveryAgentStats()
    expect(stats.totalAgents).toBeGreaterThan(0)
    expect(stats.availableAgents).toBeGreaterThanOrEqual(0)
    expect(stats.avgRating).toBeGreaterThanOrEqual(1)
  })

  it('should delete a delivery agent', async () => {
    const agent = await createDeliveryAgent({
      name: 'Temporary Agent',
      phone: '+91 91111 22222',
      vehicle_type: 'SCOOTER',
      vehicle_number: 'PB 02 XY 1111',
      status: 'AVAILABLE'
    })

    const deleted = await deleteDeliveryAgent(agent.id)
    expect(deleted).toBe(true)

    const check = await getDeliveryAgentById(agent.id)
    expect(check).toBeNull()
  })
})
