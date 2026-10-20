'use client'

import React, { useState, useMemo } from 'react'
import {
  Phone,
  MessageCircle,
  Navigation,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Check,
  Camera,
  PenTool,
  KeyRound,
  FileText,
  AlertCircle,
  Truck
} from 'lucide-react'
import type { Order, DeliveryStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DeliveryTaskListProps {
  orders: Order[]
  onOpenResolution: (order: Order, defaultTab?: 'DELIVERED' | 'CANCELLED') => void
  onQuickStartDelivery: (order: Order) => void
  isStartingDeliveryId: string | null
}

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; className: string; dotClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ASSIGNED: {
    label: 'Assigned',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
    dotClass: 'bg-amber-500',
    icon: Clock,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    className: 'border-blue-500/40 bg-blue-500/10 text-blue-500 animate-pulse',
    dotClass: 'bg-blue-500',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled / Failed',
    className: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
    dotClass: 'bg-rose-500',
    icon: XCircle,
  },
}

export function DeliveryTaskList({
  orders,
  onOpenResolution,
  onQuickStartDelivery,
  isStartingDeliveryId,
}: DeliveryTaskListProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'DELIVERED' | 'CANCELLED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.delivery_status === 'ASSIGNED' || o.delivery_status === 'OUT_FOR_DELIVERY' || !o.delivery_status).length,
      delivered: orders.filter((o) => o.delivery_status === 'DELIVERED').length,
      cancelled: orders.filter((o) => o.delivery_status === 'CANCELLED').length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (activeFilter === 'PENDING') {
        if (order.delivery_status !== 'ASSIGNED' && order.delivery_status !== 'OUT_FOR_DELIVERY' && order.delivery_status) {
          return false
        }
      } else if (activeFilter === 'DELIVERED') {
        if (order.delivery_status !== 'DELIVERED') return false
      } else if (activeFilter === 'CANCELLED') {
        if (order.delivery_status !== 'CANCELLED') return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchCode = order.short_code.toLowerCase().includes(q)
        const matchCustomer = (order.customer_name || '').toLowerCase().includes(q)
        const matchPhone = (order.phone_number || '').includes(q)
        const matchAddress = (order.shipping_address || '').toLowerCase().includes(q)
        const matchItems = (order.items || []).some((i) => i.title.toLowerCase().includes(q))
        if (!matchCode && !matchCustomer && !matchPhone && !matchAddress && !matchItems) {
          return false
        }
      }

      return true
    })
  }, [orders, activeFilter, searchQuery])

  return (
    <div className="space-y-3">
      {/* Search & Quick Filters */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stop #, customer, phone, or address..."
            className="pl-9 pr-3.5 h-10 rounded-xl bg-card border-border/80 text-sm focus-visible:ring-primary/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Stops ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('DELIVERED')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
              activeFilter === 'DELIVERED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            Delivered ({counts.delivered})
          </button>
          <button
            onClick={() => setActiveFilter('CANCELLED')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
              activeFilter === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            Failed ({counts.cancelled})
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40">
          <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <h3 className="font-semibold text-sm text-foreground">No delivery stops found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {searchQuery
              ? 'No stops matched your search query. Try clearing the filter.'
              : 'There are no stops matching the selected status filter.'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-3 rounded-lg text-xs"
            >
              Reset Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, index) => {
            const rawStatus = order.delivery_status || 'ASSIGNED'
            const statusConfig = STATUS_BADGE_CONFIG[rawStatus] || STATUS_BADGE_CONFIG.ASSIGNED
            const StatusIcon = statusConfig.icon

            const isCOD =
              !order.payment_preference ||
              order.payment_preference.toLowerCase().includes('cod') ||
              order.payment_preference.toLowerCase().includes('cash')

            const isPending = rawStatus === 'ASSIGNED' || rawStatus === 'OUT_FOR_DELIVERY'
            const isDelivered = rawStatus === 'DELIVERED'
            const isCancelled = rawStatus === 'CANCELLED'

            const mapsQuery = encodeURIComponent(
              `${order.shipping_address || ''} ${order.customer_name || ''}`
            )
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

            return (
              <div
                key={order.id}
                className={`relative rounded-2xl border transition-all duration-200 bg-card shadow-xs overflow-hidden ${
                  rawStatus === 'OUT_FOR_DELIVERY'
                    ? 'border-blue-500/50 ring-1 ring-blue-500/30'
                    : isDelivered
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : isCancelled
                    ? 'border-rose-500/30 bg-rose-500/[0.02] opacity-85'
                    : 'border-border/80 hover:border-border'
                }`}
              >
                {/* Top Strip: Stop Number, Order ID, Status Badge */}
                <div className="flex items-center justify-between border-b border-border/50 px-3.5 py-2.5 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background font-mono text-xs font-bold shadow-xs">
                      {order.stop_order || index + 1}
                    </span>
                    <span className="font-mono text-xs font-semibold text-foreground">
                      #{order.short_code}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`gap-1 px-2 py-0.5 text-[11px] font-medium ${statusConfig.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusConfig.label}</span>
                  </Badge>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  {/* Customer Details & Quick Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                        {order.customer_name || 'Customer'}
                      </h4>
                      <p className="font-mono text-xs text-muted-foreground mt-0.5">
                        {order.phone_number || 'No phone'}
                      </p>
                    </div>

                    {/* Quick Call & WhatsApp Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {order.phone_number && (
                        <>
                          <a
                            href={`tel:${order.phone_number.replace(/\s+/g, '')}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all"
                            title="Call customer directly"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <a
                            href={`https://wa.me/${order.phone_number.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 hover:bg-green-500/20 active:scale-95 transition-all"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Destination Address with Navigate Button */}
                  <div className="flex items-start justify-between gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">Delivery Destination:</span>{' '}
                        {order.shipping_address || 'Address pending verification'}
                        {order.notes && (
                          <div className="mt-1 text-[11px] text-amber-500 italic">
                            &quot;{order.notes}&quot;
                          </div>
                        )}
                      </div>
                    </div>

                    {order.shipping_address && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 shrink-0 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/30 px-2.5 py-1 text-[11px] font-medium hover:bg-blue-500/20 active:scale-95 transition-all"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Navigate</span>
                      </a>
                    )}
                  </div>

                  {/* Item Summary Breakdown */}
                  <div className="rounded-xl border border-border/50 bg-background/60 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                      <Package className="h-3.5 w-3.5 text-foreground" />
                      <span>Items to Drop ({(order.items || []).length}):</span>
                    </div>
                    <div className="space-y-1">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground font-medium truncate max-w-[240px]">
                            {item.quantity}x {item.title}
                          </span>
                          <span className="font-mono text-muted-foreground shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Status & Due Amount */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Payment Status:</span>
                    {isCOD ? (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1">
                        COD Due: ₹{order.total_amount.toLocaleString('en-IN')}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
                        Prepaid - ₹0 Due
                      </Badge>
                    )}
                  </div>

                  {/* Resolution Notes (If already Delivered or Cancelled) */}
                  {isDelivered && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Delivery Completed
                        </span>
                        <span className="font-mono">
                          Collected: ₹{(order.amount_collected ?? order.total_amount).toLocaleString('en-IN')} ({order.payment_method_collected || 'CASH'})
                        </span>
                      </div>
                      {order.proof_of_delivery_type && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>POD Method: {order.proof_of_delivery_type}</span>
                          {order.upi_reference && <span>• Ref: {order.upi_reference}</span>}
                        </div>
                      )}
                      {order.delivery_notes && (
                        <div className="text-[11px] italic text-muted-foreground">
                          Note: {order.delivery_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {isCancelled && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                      <div className="flex items-center gap-1 font-semibold">
                        <XCircle className="h-3.5 w-3.5" />
                        Undelivered: {order.cancellation_reason || 'Customer Unavailable'}
                      </div>
                      {order.delivery_notes && (
                        <div className="text-[11px] text-muted-foreground">
                          Driver Note: {order.delivery_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Ergonomic Action Buttons */}
                  <div className="pt-1.5 flex items-center gap-2">
                    {rawStatus === 'ASSIGNED' && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => onQuickStartDelivery(order)}
                        disabled={isStartingDeliveryId === order.id}
                        className="flex-1 h-12 rounded-xl text-xs sm:text-sm font-semibold border-blue-500/40 text-blue-500 hover:bg-blue-500/10 active:scale-98"
                      >
                        <Truck className="mr-1.5 h-4 w-4" />
                        {isStartingDeliveryId === order.id ? 'Starting...' : 'Start Delivery'}
                      </Button>
                    )}

                    {isPending && (
                      <Button
                        size="lg"
                        onClick={() => onOpenResolution(order, 'DELIVERED')}
                        className={`h-12 rounded-xl text-xs sm:text-sm font-semibold shadow-md active:scale-98 transition-all ${
                          rawStatus === 'OUT_FOR_DELIVERY'
                            ? 'flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                            : 'flex-1 bg-primary text-primary-foreground'
                        }`}
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Resolve Delivery
                      </Button>
                    )}

                    {!isPending && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenResolution(order, isDelivered ? 'DELIVERED' : 'CANCELLED')}
                        className="w-full h-10 text-xs text-muted-foreground hover:text-foreground"
                      >
                        View / Edit Resolution Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
