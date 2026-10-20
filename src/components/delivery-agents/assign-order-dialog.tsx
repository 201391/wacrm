'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Truck,
  Bike,
  Zap,
  CheckCircle2,
  Clock,
  Star,
  UserX,
  Phone,
  Package,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react'
import type { Order, DeliveryAgent, VehicleType } from '@/types'
import { toast } from 'sonner'

export interface AssignOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onSuccess: (updatedOrder: Order) => void
}

const VEHICLE_ICON_MAP: Record<VehicleType, React.ComponentType<{ className?: string }>> = {
  BIKE: Bike,
  SCOOTER: Bike,
  VAN: Truck,
  TRUCK: Truck,
  ELECTRIC_AUTO: Zap,
}

export function AssignOrderDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: AssignOrderDialogProps) {
  const [agents, setAgents] = useState<DeliveryAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [availableOnly, setAvailableOnly] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [unassigning, setUnassigning] = useState(false)

  // Fetch delivery agents
  const fetchAgents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/delivery-agents')
      const data = await res.json()
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents)
      }
    } catch (err) {
      console.error('Failed to load delivery agents:', err)
      toast.error('Could not load delivery agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAgents()
      setSearch('')
    }
  }, [open])

  // Filter agents based on search & availableOnly toggle
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (availableOnly && agent.status === 'OFFLINE') {
        return false
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const matchName = agent.name.toLowerCase().includes(q)
        const matchPhone = agent.phone.toLowerCase().includes(q)
        const matchVehicle = agent.vehicle_number.toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchVehicle) return false
      }
      return true
    })
  }, [agents, availableOnly, search])

  if (!order) return null

  const handleAssign = async (agent: DeliveryAgent) => {
    setSubmittingId(agent.id)
    try {
      const res = await fetch(`/api/orders/${order.id}/assign-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agent.id }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to assign agent to order')
      }

      toast.success(`Assigned order #${order.short_code} to ${agent.name}`)
      onSuccess(data.order)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Error assigning agent')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleUnassign = async () => {
    setUnassigning(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/assign-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: null }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to unassign agent')
      }

      toast.success(`Delivery agent removed from order #${order.short_code}`)
      onSuccess(data.order)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Error unassigning agent')
    } finally {
      setUnassigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border-border max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-500" />
              Assign Delivery Agent
            </DialogTitle>
            <Badge variant="outline" className="font-mono text-xs">
              #{order.short_code}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a delivery agent from your fleet to dispatch and fulfill this order.
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary Strip */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 my-2 space-y-2 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-foreground">
                {order.customer_name || 'Store Guest'}
              </p>
              <p className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                <Phone className="h-3 w-3" />
                {order.phone_number || 'Awaiting phone number'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground text-sm">
                ₹{order.total_amount.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {order.shipping_address && (
            <div className="flex items-start gap-1.5 text-muted-foreground pt-1 border-t border-border/50 text-[11px]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
              <span className="line-clamp-2">{order.shipping_address}</span>
            </div>
          )}

          {/* Current Assignment Bar */}
          {order.delivery_agent && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-500">
                  Currently Assigned: {order.delivery_agent.name} ({order.delivery_agent.vehicle_number})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnassign}
                disabled={unassigning}
                className="h-7 text-[11px] text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-2"
              >
                {unassigning ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <UserX className="h-3 w-3 mr-1" />
                )}
                Unassign
              </Button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2 mt-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search agent name, phone, or vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl bg-card border-border"
              />
            </div>
            <Button
              variant={availableOnly ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setAvailableOnly(!availableOnly)}
              className="h-8 text-[11px] rounded-xl font-medium shrink-0"
            >
              {availableOnly ? 'Active / Available' : 'All Agents'}
            </Button>
          </div>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1 min-h-[220px] max-h-[340px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <span className="text-xs">Loading delivery fleet...</span>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl">
              <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-1.5 opacity-60" />
              <p className="text-xs font-semibold text-foreground">No agents found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {search ? 'Try clearing your search query.' : 'No available delivery agents.'}
              </p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const VehicleIcon = VEHICLE_ICON_MAP[agent.vehicle_type] || Truck
              const isAssigned = order.delivery_agent_id === agent.id
              const isBusy = agent.status === 'ON_DELIVERY'
              const isOffline = agent.status === 'OFFLINE'

              return (
                <div
                  key={agent.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAssigned
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : 'border-border/80 bg-card hover:border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={agent.avatar_url || ''} alt={agent.name} />
                      <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                        {agent.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {agent.name}
                        </span>
                        {/* Status Chip */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-medium border ${
                            agent.status === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : agent.status === 'ON_DELIVERY'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              agent.status === 'AVAILABLE'
                                ? 'bg-emerald-500 animate-pulse'
                                : agent.status === 'ON_DELIVERY'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {agent.status === 'AVAILABLE'
                            ? 'Available'
                            : agent.status === 'ON_DELIVERY'
                            ? `On Delivery (${agent.active_orders_count || 1})`
                            : 'Offline'}
                        </span>
                      </div>

                      {/* Contact & Vehicle */}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          {agent.phone}
                        </span>
                        <span className="flex items-center gap-1 text-foreground/80 font-medium">
                          <VehicleIcon className="h-3 w-3 text-muted-foreground" />
                          {agent.vehicle_number}
                        </span>
                      </div>

                      {/* Rating & Performance */}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          {agent.rating ? agent.rating.toFixed(1) : '5.0'}
                        </span>
                        <span>•</span>
                        <span>{agent.total_deliveries || 0} completed trips</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div>
                    {isAssigned ? (
                      <Badge className="bg-emerald-600 text-white font-medium text-xs py-1 px-2.5">
                        <Check className="h-3 w-3 mr-1" />
                        Assigned
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={submittingId === agent.id || isOffline}
                        onClick={() => handleAssign(agent)}
                        className={`rounded-xl text-xs font-semibold h-8 px-3 ${
                          isBusy
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {submittingId === agent.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isBusy ? (
                          'Assign (Busy)'
                        ) : (
                          'Assign'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-xl text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
