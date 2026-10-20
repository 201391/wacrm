'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Truck,
  Bike,
  Zap,
  Plus,
  RefreshCw,
  Smartphone,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Clock,
  UserX,
  Phone,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react'
import type { DeliveryAgent, DeliveryAgentStatus, VehicleType, DeliveryAgentStats } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { AgentDialog } from '@/components/delivery-agents/agent-dialog'

const VEHICLE_CONFIG: Record<
  VehicleType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  BIKE: { label: 'Motorcycle / Bike', icon: Bike },
  SCOOTER: { label: 'Scooter', icon: Bike },
  VAN: { label: 'Cargo Van', icon: Truck },
  TRUCK: { label: 'Heavy Truck', icon: Truck },
  ELECTRIC_AUTO: { label: 'Electric Cargo EV', icon: Zap },
}

const STATUS_CONFIG: Record<
  DeliveryAgentStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  AVAILABLE: {
    label: 'Available',
    dotClass: 'bg-emerald-500 animate-pulse',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
  },
  ON_DELIVERY: {
    label: 'On Delivery',
    dotClass: 'bg-amber-500',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
  },
  OFFLINE: {
    label: 'Offline',
    dotClass: 'bg-slate-400',
    badgeClass: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
  },
}

export default function DeliveryAgentsPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([])
  const [stats, setStats] = useState<DeliveryAgentStats>({
    totalAgents: 0,
    availableAgents: 0,
    onDeliveryAgents: 0,
    offlineAgents: 0,
    avgRating: 5.0,
    totalCompletedDeliveries: 0,
  })
  const [loading, setLoading] = useState(true)

  // Search & Filter states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null)

  // Delete confirm dialog
  const [agentToDelete, setAgentToDelete] = useState<DeliveryAgent | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch agents and stats from API
  const fetchDeliveryAgents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (vehicleFilter !== 'ALL') params.set('vehicle_type', vehicleFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/delivery-agents?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        if (Array.isArray(data.agents)) setAgents(data.agents)
        if (data.stats) setStats(data.stats)
      }
    } catch (err) {
      console.error('Error fetching delivery agents:', err)
      toast.error('Failed to load delivery agents')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, vehicleFilter, search])

  useEffect(() => {
    fetchDeliveryAgents()
  }, [fetchDeliveryAgents])

  // Open Add Dialog
  const handleOpenAdd = () => {
    setSelectedAgent(null)
    setDialogOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (agent: DeliveryAgent) => {
    setSelectedAgent(agent)
    setDialogOpen(true)
  }

  // Quick toggle agent availability
  const handleToggleStatus = async (agent: DeliveryAgent) => {
    const nextStatus: DeliveryAgentStatus =
      agent.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'
    try {
      const res = await fetch(`/api/delivery-agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status')
      }
      toast.success(
        `${agent.name} is now ${nextStatus === 'AVAILABLE' ? 'Available' : 'Offline'}`
      )
      fetchDeliveryAgents()
    } catch (err: any) {
      toast.error(err.message || 'Error updating status')
    }
  }

  // Handle agent delete
  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/delivery-agents/${agentToDelete.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete delivery agent')
      }
      toast.success(`Delivery agent "${agentToDelete.name}" removed`)
      setAgentToDelete(null)
      fetchDeliveryAgents()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete agent')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Delivery Agents
            </h1>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
              Fleet Management
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage dispatch partners, vehicle fleets, real-time availability, and order fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDeliveryAgents}
            className="rounded-xl h-9 w-9 p-0 border-border text-muted-foreground hover:text-foreground"
            title="Refresh Fleet"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Link href="/driver" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 text-xs font-semibold border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
            >
              <Smartphone className="mr-1.5 h-3.5 w-3.5" />
              Driver Portal (Mobile)
            </Button>
          </Link>

          <Button
            onClick={handleOpenAdd}
            className="rounded-xl h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Delivery Agent
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet */}
        <div className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Fleet</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.totalAgents}</span>
            <span className="text-xs text-muted-foreground">Registered pilots</span>
          </div>
        </div>

        {/* Available Now */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold">Available Now</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{stats.availableAgents}</span>
            <span className="text-xs text-emerald-500/80">Ready for dispatch</span>
          </div>
        </div>

        {/* On Delivery */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold">On Delivery</span>
            <Clock className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">{stats.onDeliveryAgents}</span>
            <span className="text-xs text-amber-500/80">Active dispatches</span>
          </div>
        </div>

        {/* Performance & Deliveries */}
        <div className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Fleet Rating</span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stats.avgRating.toFixed(1)} / 5.0
            </span>
            <span className="text-xs text-emerald-500 font-medium">
              {stats.totalCompletedDeliveries} trips
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Fleet' },
            { id: 'AVAILABLE', label: 'Available' },
            { id: 'ON_DELIVERY', label: 'On Delivery' },
            { id: 'OFFLINE', label: 'Offline' },
          ].map((item) => (
            <Button
              key={item.id}
              variant={statusFilter === item.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(item.id)}
              className="h-8 rounded-lg text-[11px] px-3 font-medium whitespace-nowrap"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Search & Vehicle Type Dropdown */}
        <div className="flex items-center gap-2">
          {/* Vehicle Type Selector */}
          <div className="w-36 shrink-0">
            <Select value={vehicleFilter} onValueChange={(val) => setVehicleFilter(val || 'ALL')}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-card border-border">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                <SelectItem value="ALL" className="text-xs">All Vehicles</SelectItem>
                <SelectItem value="BIKE" className="text-xs">Motorcycle / Bike</SelectItem>
                <SelectItem value="SCOOTER" className="text-xs">Scooter</SelectItem>
                <SelectItem value="VAN" className="text-xs">Cargo Van / Pickup</SelectItem>
                <SelectItem value="TRUCK" className="text-xs">Heavy Truck</SelectItem>
                <SelectItem value="ELECTRIC_AUTO" className="text-xs">Electric Cargo (EV)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, phone, plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl bg-card border-border"
            />
          </div>
        </div>
      </div>

      {/* Delivery Agents Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border">
              <TableHead className="text-xs font-semibold">Agent</TableHead>
              <TableHead className="text-xs font-semibold">Contact Info</TableHead>
              <TableHead className="text-xs font-semibold">Vehicle & Plate</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Active Load</TableHead>
              <TableHead className="text-xs font-semibold">Performance</TableHead>
              <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                    <span>Loading delivery agents...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 py-6">
                    <Truck className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground">No delivery agents found</p>
                    <p className="text-xs text-muted-foreground">
                      {search || statusFilter !== 'ALL' || vehicleFilter !== 'ALL'
                        ? 'Try clearing your filters or search query.'
                        : 'Add your first delivery agent to start assigning orders.'}
                    </p>
                    {(!search && statusFilter === 'ALL' && vehicleFilter === 'ALL') && (
                      <Button
                        size="sm"
                        onClick={handleOpenAdd}
                        className="mt-2 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <Plus className="mr-1.5 h-3 w-3" />
                        Add First Agent
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => {
                const statusMeta = STATUS_CONFIG[agent.status] || STATUS_CONFIG.OFFLINE
                const vehicleMeta = VEHICLE_CONFIG[agent.vehicle_type] || {
                  label: agent.vehicle_type,
                  icon: Truck,
                }
                const VehicleIcon = vehicleMeta.icon

                return (
                  <TableRow key={agent.id} className="border-border/60 hover:bg-muted/30">
                    {/* Agent Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={agent.avatar_url || ''} alt={agent.name} />
                          <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                            {agent.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{agent.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            ID: {agent.id.replace('agent-', '')}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <a
                          href={`tel:${agent.phone}`}
                          className="text-xs text-foreground hover:text-emerald-500 transition-colors flex items-center gap-1 font-mono"
                        >
                          <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                          {agent.phone}
                        </a>
                        {agent.email ? (
                          <a
                            href={`mailto:${agent.email}`}
                            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            <Mail className="h-2.5 w-2.5" />
                            {agent.email}
                          </a>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic">
                            No email registered
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Vehicle */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <VehicleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {vehicleMeta.label}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono tracking-wider font-semibold py-0 px-1.5 bg-muted/40"
                        >
                          {agent.vehicle_number}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusMeta.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                        {statusMeta.label}
                      </span>
                    </TableCell>

                    {/* Active Load / Assigned Order */}
                    <TableCell>
                      {agent.active_orders_count > 0 ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-amber-500">
                            {agent.active_orders_count} active{' '}
                            {agent.active_orders_count === 1 ? 'order' : 'orders'}
                          </span>
                          {agent.current_order_short_code && (
                            <p className="text-[11px] font-mono text-muted-foreground">
                              Order #{agent.current_order_short_code}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None (Idle)</span>
                      )}
                    </TableCell>

                    {/* Performance / Rating */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-foreground">
                            {agent.rating ? agent.rating.toFixed(1) : '5.0'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {agent.total_deliveries || 0} completed trips
                        </p>
                      </div>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-card">
                          <Link href={`/driver?agent_id=${agent.id}`} target="_blank">
                            <DropdownMenuItem className="text-xs cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium">
                              <Smartphone className="h-3.5 w-3.5 mr-2" />
                              Open Driver View
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(agent)}
                            className="text-xs cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(agent)}
                            className="text-xs cursor-pointer"
                          >
                            {agent.status === 'AVAILABLE' ? (
                              <>
                                <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                Mark as Offline
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                Mark as Available
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setAgentToDelete(agent)}
                            className="text-xs text-rose-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Agent Modal */}
      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSuccess={fetchDeliveryAgents}
      />

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <Dialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-500 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Remove Delivery Agent
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to remove <strong>{agentToDelete.name}</strong> ({agentToDelete.vehicle_number}) from the fleet? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAgentToDelete(null)}
                disabled={deleting}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-xl text-xs min-w-[80px]"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
