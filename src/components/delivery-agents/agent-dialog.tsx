'use client'

import React, { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Bike,
  Truck,
  Car,
  Zap,
  Loader2,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react'
import type { DeliveryAgent, CreateDeliveryAgentInput, VehicleType, DeliveryAgentStatus } from '@/types'
import { toast } from 'sonner'

export interface AgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent?: DeliveryAgent | null
  onSuccess: (savedAgent: DeliveryAgent) => void
}

const VEHICLE_OPTIONS: { value: VehicleType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'BIKE', label: 'Motorcycle / Bike', icon: Bike },
  { value: 'SCOOTER', label: 'Scooter (e.g. Activa)', icon: Bike },
  { value: 'VAN', label: 'Cargo Van / Pickup', icon: Truck },
  { value: 'TRUCK', label: 'Heavy Truck / LPT', icon: Truck },
  { value: 'ELECTRIC_AUTO', label: 'Electric Cargo Auto (EV)', icon: Zap },
]

export function AgentDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentDialogProps) {
  const isEditing = !!agent

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType>('BIKE')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [notes, setNotes] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (agent) {
      setName(agent.name || '')
      setPhone(agent.phone || '')
      setEmail(agent.email || '')
      setVehicleType(agent.vehicle_type || 'BIKE')
      setVehicleNumber(agent.vehicle_number || '')
      setEmergencyContact(agent.emergency_contact || '')
      setNotes(agent.notes || '')
      setIsAvailable(agent.status !== 'OFFLINE')
    } else {
      setName('')
      setPhone('')
      setEmail('')
      setVehicleType('BIKE')
      setVehicleNumber('')
      setEmergencyContact('')
      setNotes('')
      setIsAvailable(true)
    }
    setErrors({})
  }, [agent, open])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) {
      errs.name = 'Full name is required'
    }
    if (!phone.trim()) {
      errs.phone = 'Phone number is required'
    } else if (!/^[+0-9\s-]{8,18}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number (e.g., +91 98765 43210)'
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address'
    }
    if (!vehicleNumber.trim()) {
      errs.vehicleNumber = 'Vehicle plate / number is required (e.g., PB 11 AB 4592)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const status: DeliveryAgentStatus = isAvailable
        ? agent && agent.status === 'ON_DELIVERY'
          ? 'ON_DELIVERY'
          : 'AVAILABLE'
        : 'OFFLINE'

      const payload: CreateDeliveryAgentInput = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        emergency_contact: emergencyContact.trim() || null,
        notes: notes.trim() || null,
        status,
      }

      const url = isEditing ? `/api/delivery-agents/${agent.id}` : '/api/delivery-agents'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save delivery agent')
      }

      toast.success(
        isEditing
          ? `Delivery agent "${name}" updated successfully`
          : `Delivery agent "${name}" added to the fleet`
      )
      onSuccess(data.agent)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Error saving delivery agent')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Edit Delivery Agent' : 'Add New Delivery Agent'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? 'Update contact details, vehicle information, and operational notes for this agent.'
              : 'Register a new delivery partner to assign orders and manage village/city dispatches.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="agent-name" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="agent-name"
              type="text"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-9 text-xs rounded-xl bg-card border-border ${
                errors.name ? 'border-rose-500 focus-visible:ring-rose-500' : ''
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Contact: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="agent-phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="agent-phone"
                type="tel"
                placeholder="+91 98112 34567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`h-9 text-xs rounded-xl bg-card border-border font-mono ${
                  errors.phone ? 'border-rose-500 focus-visible:ring-rose-500' : ''
                }`}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agent-email" className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address <span className="text-muted-foreground text-[10px]">(Optional)</span>
              </Label>
              <Input
                id="agent-email"
                type="email"
                placeholder="rajesh.k@delivery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-9 text-xs rounded-xl bg-card border-border ${
                  errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-type" className="text-xs font-semibold flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                Vehicle Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={vehicleType}
                onValueChange={(val) => val && setVehicleType(val as VehicleType)}
              >
                <SelectTrigger id="vehicle-type" className="h-9 text-xs rounded-xl bg-card border-border">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  {VEHICLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vehicle-number" className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Plate / Registration # <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="vehicle-number"
                type="text"
                placeholder="e.g. PB 11 AB 4592"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className={`h-9 text-xs rounded-xl bg-card border-border uppercase font-mono font-medium ${
                  errors.vehicleNumber ? 'border-rose-500 focus-visible:ring-rose-500' : ''
                }`}
              />
              {errors.vehicleNumber && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.vehicleNumber}
                </p>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="emergency-contact" className="text-xs font-semibold">
              Emergency Contact & Relationship <span className="text-muted-foreground text-[10px]">(Optional)</span>
            </Label>
            <Input
              id="emergency-contact"
              type="text"
              placeholder="e.g. +91 98112 99999 (Brother - Mukesh)"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="h-9 text-xs rounded-xl bg-card border-border"
            />
          </div>

          {/* Notes & Operating Zone */}
          <div className="space-y-1.5">
            <Label htmlFor="agent-notes" className="text-xs font-semibold">
              Zone & Operational Notes <span className="text-muted-foreground text-[10px]">(Optional)</span>
            </Label>
            <Textarea
              id="agent-notes"
              placeholder="e.g. Covers Rajpura rural cluster. Suitable for bulk 50kg bags."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs rounded-xl bg-card border-border"
              rows={2}
            />
          </div>

          {/* Availability Switch */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold cursor-pointer">
                Agent Active & Available for Dispatch
              </Label>
              <p className="text-[11px] text-muted-foreground">
                When enabled, the agent will appear in order assignment pickers.
              </p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium min-w-[100px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Delivery Agent'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
