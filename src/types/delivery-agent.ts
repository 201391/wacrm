export type VehicleType = 'BIKE' | 'SCOOTER' | 'VAN' | 'TRUCK' | 'ELECTRIC_AUTO'

export type DeliveryAgentStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE'

export type DeliveryStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentCollectionMethod = 'CASH' | 'UPI' | 'PREPAID'

export type CancellationReason =
  | 'CUSTOMER_UNAVAILABLE'
  | 'CUSTOMER_REFUSED'
  | 'INCORRECT_ADDRESS'
  | 'DAMAGED_PRODUCT'
  | 'OTHER'

export type ProofOfDeliveryType = 'PHOTO' | 'SIGNATURE' | 'OTP'

export interface DeliveryResolution {
  delivery_status: 'DELIVERED' | 'CANCELLED' | 'OUT_FOR_DELIVERY'
  payment_method?: PaymentCollectionMethod
  amount_collected?: number
  upi_reference?: string
  cancellation_reason?: CancellationReason | string
  proof_of_delivery_type?: ProofOfDeliveryType
  proof_of_delivery_data?: string
  notes?: string
  delivered_at?: string
}

export interface DriverManifestStats {
  totalAssigned: number
  pendingDelivery: number
  deliveredCount: number
  cancelledCount: number
  codCollected: number
  upiCollected: number
  totalCashDue: number
}

export interface DeliveryAgent {
  id: string
  account_id: string
  name: string
  phone: string
  email?: string | null
  vehicle_type: VehicleType
  vehicle_number: string
  status: DeliveryAgentStatus
  active_orders_count: number
  current_order_id?: string | null
  current_order_short_code?: string | null
  emergency_contact?: string | null
  notes?: string | null
  rating: number
  total_deliveries: number
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface CreateDeliveryAgentInput {
  name: string
  phone: string
  email?: string | null
  vehicle_type: VehicleType
  vehicle_number: string
  emergency_contact?: string | null
  notes?: string | null
  status?: DeliveryAgentStatus
  avatar_url?: string | null
}

export interface UpdateDeliveryAgentInput {
  name?: string
  phone?: string
  email?: string | null
  vehicle_type?: VehicleType
  vehicle_number?: string
  emergency_contact?: string | null
  notes?: string | null
  status?: DeliveryAgentStatus
  rating?: number
  total_deliveries?: number
  avatar_url?: string | null
}

export interface DeliveryAgentFilters {
  search?: string
  status?: DeliveryAgentStatus | 'ALL'
  vehicle_type?: VehicleType | 'ALL'
  accountId?: string
}

export interface DeliveryAgentStats {
  totalAgents: number
  availableAgents: number
  onDeliveryAgents: number
  offlineAgents: number
  avgRating: number
  totalCompletedDeliveries: number
}

