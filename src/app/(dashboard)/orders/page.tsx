'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  ExternalLink,
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Edit,
  Save,
  Send,
  Plus,
  RefreshCw,
  Phone,
  User,
  MapPin,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  Filter,
  Check,
  Copy,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { Order, OrderStatus, Product } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
    icon: Clock,
  },
  PENDING_WHATSAPP: {
    label: 'Pending WhatsApp',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
    icon: XCircle,
  },
}

export default function OrdersPage() {
  const { account } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  // Manual override states in detail modal
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressInput, setAddressInput] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Fetch orders and stats
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (search) params.set('search', search)
      if (account?.id) params.set('account_id', account.id)

      const res = await fetch(`/api/orders?${params.toString()}`)
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error('Error fetching orders:', err)
      toast.error('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, account?.id])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.products) setProducts(data.products)
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [fetchOrders, fetchProducts])

  // Open detail dialog
  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order)
    setAddressInput(order.shipping_address || '')
    setEditingAddress(false)
    setCustomMessage(
      `Hi! Just following up regarding your order #${order.short_code} for $${order.total_amount.toFixed(2)}. Would you like us to confirm and dispatch your items?`
    )
    setDetailOpen(true)
  }

  // Update status override
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Status update failed.')
      const data = await res.json()
      toast.success(`Order marked as ${newStatus}`)
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order)
      }
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status.')
    }
  }

  // Save updated address override
  const handleSaveAddress = async () => {
    if (!selectedOrder) return
    setSavingAddress(true)
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address: addressInput }),
      })
      if (!res.ok) throw new Error('Address update failed.')
      const data = await res.json()
      setSelectedOrder(data.order)
      setEditingAddress(false)
      toast.success('Shipping address updated!')
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address.')
    } finally {
      setSavingAddress(false)
    }
  }

  // Initiate WhatsApp Template / Message
  const handleSendWhatsAppMessage = async () => {
    if (!selectedOrder || !customMessage.trim()) return
    const phone = selectedOrder.phone_number
    if (!phone) {
      toast.error('No phone number attached to this order yet.')
      return
    }

    setSendingMessage(true)
    try {
      // Trigger deep-link or direct send
      const cleanPhone = phone.replace(/\D/g, '')
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage.trim())}`
      window.open(waUrl, '_blank')
      toast.success('WhatsApp conversation opened!')
    } finally {
      setSendingMessage(false)
    }
  }

  const copyShortCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied #${code} to clipboard!`)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 text-emerald-500" />
            E-Commerce & Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage online catalog, track draft orders, and review WhatsApp AI confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/store"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: 'outline',
              className: 'rounded-xl border-border bg-card hover:bg-muted font-medium text-xs h-9 gap-1.5',
            })}
          >
            <span>View Live Storefront</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="rounded-xl h-9 w-9 p-0 border-border text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Orders</span>
            <Package className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.totalOrders}</span>
            <span className="text-xs text-muted-foreground">All time</span>
          </div>
        </div>

        {/* Pending WhatsApp Confirmation */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold">Pending WhatsApp</span>
            <Clock className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">{stats.pendingOrders}</span>
            <span className="text-xs text-amber-500/80">Awaiting confirmation</span>
          </div>
        </div>

        {/* Confirmed Orders */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold">Confirmed Orders</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{stats.confirmedOrders}</span>
            <span className="text-xs text-emerald-500/80">Ready to dispatch</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              ${stats.totalRevenue.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-500 font-medium">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Tabs: Orders / Products */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-3">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="orders" className="rounded-lg text-xs font-medium px-4">
              Orders Feed ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-xs font-medium px-4">
              Catalog Products ({products.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'orders' && (
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search code, phone, name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-xl bg-card border-border"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'PENDING_WHATSAPP', 'CONFIRMED', 'CANCELLED'].map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(st)}
                    className="h-8 rounded-lg text-[11px] px-2.5 font-medium whitespace-nowrap"
                  >
                    {st === 'ALL' ? 'All' : st === 'PENDING_WHATSAPP' ? 'Pending' : st === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Orders Feed */}
        <TabsContent value="orders" className="space-y-4 mt-0">
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border">
                  <TableHead className="w-[130px] text-xs font-semibold">Order #</TableHead>
                  <TableHead className="text-xs font-semibold">Customer</TableHead>
                  <TableHead className="text-xs font-semibold">Items & Total</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">WhatsApp Thread</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                        <span>Loading orders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                      No orders found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const statusMeta = STATUS_CONFIG[order.status] || STATUS_CONFIG.DRAFT
                    const StatusIcon = statusMeta.icon

                    return (
                      <TableRow key={order.id} className="border-border/60 hover:bg-muted/30">
                        {/* Order Code */}
                        <TableCell className="font-mono font-medium text-xs">
                          <button
                            type="button"
                            onClick={() => copyShortCode(order.short_code)}
                            className="inline-flex items-center gap-1.5 hover:text-emerald-500 transition-colors group"
                            title="Click to copy code"
                          >
                            <span>#{order.short_code}</span>
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                          </button>
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">
                              {order.customer_name || order.contact?.name || 'Store Guest'}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" />
                              {order.phone_number || 'Awaiting WhatsApp message'}
                            </p>
                          </div>
                        </TableCell>

                        {/* Items & Total */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">
                              ${order.total_amount.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} (
                              {order.items.map((i) => i.title).join(', ')})
                            </p>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusMeta.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusMeta.label}
                          </span>
                        </TableCell>

                        {/* WhatsApp Snippet */}
                        <TableCell>
                          {order.conversation_id ? (
                            <Link
                              href={`/inbox?conversationId=${order.conversation_id}`}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-500 transition-colors group"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="truncate max-w-[140px] text-[11px]">
                                {order.conversation?.last_message_text || 'View thread'}
                              </span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60 italic">
                              Not linked yet
                            </span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetail(order)}
                            className="rounded-lg h-8 text-xs font-medium border-border hover:bg-muted"
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Catalog Products */}
        <TabsContent value="products" className="space-y-4 mt-0">
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border">
                  <TableHead className="text-xs font-semibold">Product</TableHead>
                  <TableHead className="text-xs font-semibold">Slug</TableHead>
                  <TableHead className="text-xs font-semibold">Price</TableHead>
                  <TableHead className="text-xs font-semibold">Stock</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Store Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((prod) => (
                  <TableRow key={prod.id} className="border-border/60 hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 m-auto text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {prod.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs">
                            {prod.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {prod.slug}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      ${Number(prod.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {prod.stock > 0 ? (
                        <span className="text-emerald-500 font-medium">{prod.stock} units</span>
                      ) : (
                        <span className="text-rose-500 font-medium">Out of stock</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/30">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/store/products/${prod.slug}`}
                        target="_blank"
                        className={buttonVariants({
                          variant: 'ghost',
                          size: 'sm',
                          className: 'h-8 rounded-lg text-xs',
                        })}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Detail & Override Dialog */}
      {selectedOrder && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg">
                    Order #{selectedOrder.short_code}
                  </DialogTitle>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_CONFIG[selectedOrder.status]?.className || ''
                    }`}
                  >
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </span>
                </div>
              </div>
              <DialogDescription className="text-xs">
                Created on {new Date(selectedOrder.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 my-2">
              {/* Itemized Breakdown */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-border/60">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 text-xs">
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} x ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-semibold text-foreground">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline text-sm font-bold">
                  <span>Total Amount</span>
                  <span className="text-emerald-500 text-base">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Address (Editable Override) */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Delivery Shipping Address
                  </h4>
                  {!editingAddress ? (
                    <button
                      type="button"
                      onClick={() => setEditingAddress(true)}
                      className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit Address</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                      className="text-xs text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Save className="h-3 w-3" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {editingAddress ? (
                  <Textarea
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter full physical delivery address..."
                    className="text-xs rounded-xl bg-card border-border"
                    rows={3}
                  />
                ) : (
                  <p className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/60">
                    {selectedOrder.shipping_address || (
                      <span className="text-muted-foreground italic">
                        No shipping address provided yet. Customer will be prompted on WhatsApp.
                      </span>
                    )}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Customer Phone:</span>
                    <span className="font-mono font-medium">
                      {selectedOrder.phone_number || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Payment Method:</span>
                    <span className="font-medium">
                      {selectedOrder.payment_preference || 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Manual Override Controls */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status Override
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'CONFIRMED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                    className="rounded-lg text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Manually Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'PENDING_WHATSAPP' ? 'secondary' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PENDING_WHATSAPP')}
                    className="rounded-lg text-xs h-8 border-border"
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                    Mark Pending WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'CANCELLED' ? 'destructive' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    className="rounded-lg text-xs h-8 border-border hover:text-rose-500"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Cancel Order
                  </Button>
                </div>
              </div>

              {/* WhatsApp Template / Message Action */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-emerald-500" />
                  Initiate WhatsApp Template Message
                </h4>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type WhatsApp follow-up message..."
                  className="text-xs rounded-xl bg-card border-border"
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={handleSendWhatsAppMessage}
                  disabled={sendingMessage || !selectedOrder.phone_number}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9"
                >
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Send WhatsApp Message to Customer
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDetailOpen(false)}
                className="w-full rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
