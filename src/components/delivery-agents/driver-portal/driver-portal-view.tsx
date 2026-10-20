'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Truck,
  Bike,
  Package,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Smartphone,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react'
import type { Order, DeliveryAgent, DriverManifestStats } from '@/types'
import { DriverHeader } from './driver-header'
import { DriverMetricsSummary } from './driver-metrics-summary'
import { DeliveryTaskList } from './delivery-task-list'
import { DeliveryResolutionSheet } from './delivery-resolution-sheet'
import { useOfflineSync, addOfflineAction, removeOfflineAction } from './offline-manager'
import type { ResolveDeliveryInput } from '@/lib/orders/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function DriverPortalView() {
  const searchParams = useSearchParams()
  const initialAgentId = searchParams.get('agent_id') || 'agent-1'

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId)
  const [agent, setAgent] = useState<DeliveryAgent | null>(null)
  const [availableAgents, setAvailableAgents] = useState<DeliveryAgent[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DriverManifestStats>({
    totalAssigned: 0,
    pendingDelivery: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    codCollected: 0,
    upiCollected: 0,
    totalCashDue: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [isPhoneMockup, setIsPhoneMockup] = useState<boolean>(false)

  // Resolution modal state
  const [resolutionOrder, setResolutionOrder] = useState<Order | null>(null)
  const [resolutionOpen, setResolutionOpen] = useState<boolean>(false)
  const [resolutionInitialTab, setResolutionInitialTab] = useState<'DELIVERED' | 'CANCELLED'>('DELIVERED')
  const [startingDeliveryId, setStartingDeliveryId] = useState<string | null>(null)

  // Offline manager
  const {
    isOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    queue,
    queueCount,
    refreshQueue,
    syncQueue,
    isSyncing,
  } = useOfflineSync()

  // Load available agents for switcher
  const fetchAvailableAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery-agents')
      const data = await res.json()
      if (data.success && Array.isArray(data.agents)) {
        setAvailableAgents(data.agents)
      }
    } catch (err) {
      console.warn('Could not fetch delivery agents list:', err)
    }
  }, [])

  // Load manifest for active agent
  const fetchManifest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/delivery-agents/${encodeURIComponent(selectedAgentId)}/manifest`)
      const data = await res.json()
      if (data.success) {
        setAgent(data.agent || null)
        setOrders(data.orders || [])
        setStats(data.stats)
      } else {
        throw new Error(data.error || 'Failed to load manifest')
      }
    } catch (err: any) {
      console.error('Error loading driver manifest:', err)
      toast.error(err.message || 'Error loading manifest')
    } finally {
      setLoading(false)
    }
  }, [selectedAgentId])

  useEffect(() => {
    fetchAvailableAgents()
  }, [fetchAvailableAgents])

  useEffect(() => {
    fetchManifest()
  }, [fetchManifest])

  // Handle order resolution submission (Online or Offline queue)
  const handleSubmitResolution = async (payload: ResolveDeliveryInput) => {
    // Optimistic local update
    const updatedStatus = payload.delivery_status
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === payload.orderIdOrCode || o.short_code === payload.orderIdOrCode) {
          return {
            ...o,
            delivery_status: updatedStatus,
            status: updatedStatus === 'DELIVERED' ? 'CONFIRMED' : updatedStatus === 'CANCELLED' ? 'CANCELLED' : o.status,
            payment_method_collected: payload.payment_method || o.payment_method_collected,
            amount_collected: payload.amount_collected ?? o.amount_collected,
            upi_reference: payload.upi_reference || o.upi_reference,
            cancellation_reason: payload.cancellation_reason || o.cancellation_reason,
            proof_of_delivery_type: payload.proof_of_delivery_type || o.proof_of_delivery_type,
            proof_of_delivery_data: payload.proof_of_delivery_data || o.proof_of_delivery_data,
            delivery_notes: payload.notes || o.delivery_notes,
            delivered_at: updatedStatus === 'DELIVERED' ? new Date().toISOString() : o.delivered_at,
          }
        }
        return o
      })
    )

    // Recompute stats locally
    setStats((prev) => {
      const isDelivering = updatedStatus === 'DELIVERED'
      const isCancelling = updatedStatus === 'CANCELLED'
      const addedCash = payload.payment_method === 'CASH' ? Number(payload.amount_collected) || 0 : 0
      const addedUpi = payload.payment_method === 'UPI' ? Number(payload.amount_collected) || 0 : 0

      return {
        ...prev,
        pendingDelivery: Math.max(0, prev.pendingDelivery - (isDelivering || isCancelling ? 1 : 0)),
        deliveredCount: isDelivering ? prev.deliveredCount + 1 : prev.deliveredCount,
        cancelledCount: isCancelling ? prev.cancelledCount + 1 : prev.cancelledCount,
        codCollected: prev.codCollected + addedCash,
        upiCollected: prev.upiCollected + addedUpi,
        totalCashDue: Math.max(0, prev.totalCashDue - (addedCash + addedUpi)),
      }
    })

    if (!isOnline) {
      // Offline mode: Queue action locally
      addOfflineAction({
        payload,
        shortCode: resolutionOrder?.short_code || payload.orderIdOrCode,
        customerName: resolutionOrder?.customer_name || 'Customer',
      })
      refreshQueue()
      toast.info(`Offline: Resolution for #${resolutionOrder?.short_code} saved to local queue`)
      return
    }

    // Online mode: Send to API
    const res = await fetch(`/api/orders/${encodeURIComponent(payload.orderIdOrCode)}/resolve-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Server rejected delivery resolution')
    }

    if (data.stats) {
      setStats(data.stats)
    }
  }

  // Quick Action: Transition order from 'ASSIGNED' to 'OUT_FOR_DELIVERY'
  const handleQuickStartDelivery = async (order: Order) => {
    setStartingDeliveryId(order.id)

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, delivery_status: 'OUT_FOR_DELIVERY' } : o))
    )

    try {
      if (!isOnline) {
        addOfflineAction({
          payload: {
            orderIdOrCode: order.id,
            delivery_status: 'OUT_FOR_DELIVERY',
          },
          shortCode: order.short_code,
          customerName: order.customer_name || 'Customer',
        })
        refreshQueue()
        toast.info(`Offline: Started delivery for #${order.short_code}`)
      } else {
        const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/resolve-delivery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_status: 'OUT_FOR_DELIVERY' }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to start delivery')
        }
        if (data.stats) setStats(data.stats)
        toast.success(`Stop #${order.short_code} is now Out for Delivery!`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating stop status')
      fetchManifest()
    } finally {
      setStartingDeliveryId(null)
    }
  }

  // Handle Sync Queue Button
  const handleSyncQueue = async () => {
    try {
      const result = await syncQueue((syncedItem) => {
        toast.success(`Synced order #${syncedItem.shortCode}`)
      })
      if (result.synced > 0) {
        toast.success(`Successfully uploaded ${result.synced} offline updates!`)
        fetchManifest()
      } else if (result.failed > 0) {
        toast.error(`${result.failed} items could not be synced`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Sync error')
    }
  }

  // Open resolution modal
  const handleOpenResolution = (order: Order, defaultTab: 'DELIVERED' | 'CANCELLED' = 'DELIVERED') => {
    setResolutionOrder(order)
    setResolutionInitialTab(defaultTab)
    setResolutionOpen(true)
  }

  return (
    <div className={`min-h-screen bg-slate-950/5 dark:bg-background text-foreground transition-all ${
      isPhoneMockup ? 'py-4 sm:py-8 flex items-center justify-center bg-slate-900/60' : ''
    }`}>
      {/* Phone Mockup Wrapper on Desktop if toggled */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneMockup
            ? 'max-w-[420px] rounded-[42px] border-[10px] border-slate-800 bg-background shadow-2xl overflow-hidden ring-1 ring-border/80'
            : 'max-w-2xl mx-auto'
        }`}
      >
        {/* Mockup Top Speaker Notch */}
        {isPhoneMockup && (
          <div className="flex items-center justify-center pt-2 pb-1 bg-background border-b border-border/20">
            <div className="h-4 w-28 rounded-full bg-slate-800 flex items-center justify-end px-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
            </div>
          </div>
        )}

        {/* Driver Header */}
        <DriverHeader
          agent={agent}
          availableAgents={availableAgents}
          onSelectAgent={(id) => setSelectedAgentId(id)}
          isOnline={isOnline}
          simulatedOffline={simulatedOffline}
          onToggleSimulatedOffline={toggleSimulatedOffline}
          queueCount={queueCount}
          onSyncQueue={handleSyncQueue}
          isSyncing={isSyncing}
          onRefresh={fetchManifest}
          loading={loading}
          isPhoneMockup={isPhoneMockup}
          onTogglePhoneMockup={() => setIsPhoneMockup(!isPhoneMockup)}
        />

        {/* Content Body */}
        <main className="p-3.5 sm:p-5 space-y-4 pb-12">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading driver run manifest...</p>
            </div>
          ) : (
            <>
              {/* Operational Metrics Header Summary */}
              <DriverMetricsSummary stats={stats} />

              {/* Delivery Manifest / Ordered Stops */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Delivery Stops ({orders.length})
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Shift Manifest #{new Date().toISOString().slice(0, 10)}
                  </span>
                </div>

                <DeliveryTaskList
                  orders={orders}
                  onOpenResolution={handleOpenResolution}
                  onQuickStartDelivery={handleQuickStartDelivery}
                  isStartingDeliveryId={startingDeliveryId}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Resolution Sheet / Bottom Drawer Modal */}
      <DeliveryResolutionSheet
        order={resolutionOrder}
        open={resolutionOpen}
        onClose={() => setResolutionOpen(false)}
        onSubmitResolution={handleSubmitResolution}
        initialTab={resolutionInitialTab}
      />
    </div>
  )
}
