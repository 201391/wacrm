'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  CheckCircle2,
  XCircle,
  Banknote,
  QrCode,
  Camera,
  PenTool,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react'
import type { Order, PaymentCollectionMethod, ProofOfDeliveryType, CancellationReason } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { ResolveDeliveryInput } from '@/lib/orders/store'

interface DeliveryResolutionSheetProps {
  order: Order | null
  open: boolean
  onClose: () => void
  onSubmitResolution: (payload: ResolveDeliveryInput) => Promise<void>
  initialTab?: 'DELIVERED' | 'CANCELLED'
}

const CANCELLATION_REASONS = [
  { value: 'CUSTOMER_UNAVAILABLE', label: 'Customer unavailable / door locked' },
  { value: 'CUSTOMER_REFUSED', label: 'Customer refused delivery' },
  { value: 'INCORRECT_ADDRESS', label: 'Incorrect address / phone unreachable' },
  { value: 'DAMAGED_PRODUCT', label: 'Damaged product' },
  { value: 'CUSTOMER_RESCHEDULE', label: 'Customer requested reschedule' },
  { value: 'PAYMENT_ISSUE', label: 'Payment not ready / insufficient cash' },
  { value: 'OTHER', label: 'Other operational issue' },
]

const SAMPLE_PACKAGE_PHOTO =
  'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80'

export function DeliveryResolutionSheet({
  order,
  open,
  onClose,
  onSubmitResolution,
  initialTab = 'DELIVERED',
}: DeliveryResolutionSheetProps) {
  const [resolutionType, setResolutionType] = useState<'DELIVERED' | 'CANCELLED'>(initialTab)

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'PREPAID'>('CASH')
  const [amountCollected, setAmountCollected] = useState<string>('')
  const [tenderedAmount, setTenderedAmount] = useState<string>('')
  const [upiRef, setUpiRef] = useState<string>('')
  const [upiVerified, setUpiVerified] = useState<boolean>(false)
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false)

  // Proof of delivery states
  const [podType, setPodType] = useState<ProofOfDeliveryType>('PHOTO')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [otpValue, setOtpValue] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Cancellation states
  const [cancellationReason, setCancellationReason] = useState<string>('CUSTOMER_UNAVAILABLE')

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Canvas for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const isCOD =
    order &&
    (!order.payment_preference ||
      order.payment_preference.toLowerCase().includes('cod') ||
      order.payment_preference.toLowerCase().includes('cash'))

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setResolutionType(initialTab)
      if (order.delivery_status === 'CANCELLED') {
        setResolutionType('CANCELLED')
      }

      if (isCOD) {
        setPaymentMethod(order.payment_method_collected || 'CASH')
        setAmountCollected(String(order.amount_collected ?? order.total_amount))
      } else {
        setPaymentMethod('PREPAID')
        setAmountCollected('0')
      }

      setTenderedAmount('')
      setUpiRef(order.upi_reference || '')
      setUpiVerified(Boolean(order.upi_reference))
      setPhotoPreview(order.proof_of_delivery_type === 'PHOTO' ? order.proof_of_delivery_data || null : null)
      setNotes(order.delivery_notes || '')
      setCancellationReason(order.cancellation_reason || 'CUSTOMER_UNAVAILABLE')
      setValidationError(null)
      setHasSignature(false)
    }
  }, [order, initialTab, isCOD])

  // Clear signature canvas
  const handleClearSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    setHasSignature(false)
  }, [])

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#10b981'
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setHasSignature(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopyUPI = () => {
    const upiId = 'jatrra.logistics@okaxis'
    navigator.clipboard?.writeText(upiId)
    setCopiedUpi(true)
    toast.success('UPI ID copied to clipboard')
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  // Calculate return change for cash
  const calculatedChange = Math.max(
    0,
    (Number(tenderedAmount) || 0) - (Number(amountCollected) || 0)
  )

  const handleSubmit = async () => {
    if (!order) return
    setValidationError(null)

    // Validation
    if (resolutionType === 'DELIVERED') {
      if (isCOD && paymentMethod !== 'PREPAID') {
        const amt = Number(amountCollected)
        if (isNaN(amt) || amt < 0 || amountCollected.trim() === '') {
          setValidationError('Please enter a valid collected cash amount')
          return
        }
        if (paymentMethod === 'UPI' && !upiVerified && !upiRef.trim()) {
          setValidationError('Please verify UPI payment or enter transaction reference')
          return
        }
      }
    } else {
      if (!cancellationReason) {
        setValidationError('Please select a cancellation reason')
        return
      }
    }

    setSubmitting(true)

    try {
      let podData: string | undefined = undefined
      if (podType === 'PHOTO' && photoPreview) {
        podData = photoPreview
      } else if (podType === 'SIGNATURE' && hasSignature && canvasRef.current) {
        podData = canvasRef.current.toDataURL('image/png')
      } else if (podType === 'OTP' && otpValue.trim()) {
        podData = otpValue.trim()
      }

      const payload: ResolveDeliveryInput = {
        orderIdOrCode: order.id,
        delivery_status: resolutionType === 'DELIVERED' ? 'DELIVERED' : 'CANCELLED',
        payment_method: resolutionType === 'DELIVERED' ? paymentMethod : undefined,
        amount_collected:
          resolutionType === 'DELIVERED'
            ? paymentMethod === 'PREPAID'
              ? 0
              : Number(amountCollected)
            : undefined,
        upi_reference: upiRef ? upiRef.trim() : undefined,
        cancellation_reason: resolutionType === 'CANCELLED' ? cancellationReason : undefined,
        proof_of_delivery_type: resolutionType === 'DELIVERED' ? podType : undefined,
        proof_of_delivery_data: podData,
        notes: notes ? notes.trim() : undefined,
      }

      await onSubmitResolution(payload)

      // Provide haptic feedback if supported on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([60, 40, 60])
      }

      toast.success(
        resolutionType === 'DELIVERED'
          ? `Order #${order.short_code} marked as Delivered!`
          : `Order #${order.short_code} marked as Undelivered`
      )
      onClose()
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit delivery resolution')
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !order) return null

  // UPI payment intent link for QR simulation
  const upiPayUrl = `upi://pay?pa=jatrra.logistics@okaxis&pn=Jatrra%20Logistics&am=${amountCollected || order.total_amount}&cu=INR&tn=Order_${order.short_code}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Body */}
      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-border/80 bg-background shadow-2xl transition-all flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sticky top-0 z-20 flex flex-col items-center pt-2.5 pb-2 bg-background border-b border-border/50">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 mb-2 sm:hidden" />
          <div className="flex items-center justify-between w-full px-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  Order #{order.short_code}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {order.delivery_status || 'ASSIGNED'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {order.customer_name} • {order.shipping_address}
              </p>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Outcome Mode Tabs (Large touch targets) */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50 border border-border/60">
            <button
              type="button"
              onClick={() => {
                setResolutionType('DELIVERED')
                setValidationError(null)
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                resolutionType === 'DELIVERED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Delivered
            </button>
            <button
              type="button"
              onClick={() => {
                setResolutionType('CANCELLED')
                setValidationError(null)
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                resolutionType === 'CANCELLED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <XCircle className="h-4 w-4" />
              Undelivered / Failed
            </button>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* TAB 1: MARK AS DELIVERED */}
          {resolutionType === 'DELIVERED' && (
            <div className="space-y-4">
              {/* Payment Section */}
              <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-emerald-500" />
                    Payment Collection
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    Order Total: ₹{order.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {!isCOD ? (
                  /* Prepaid Order Display */
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                    <div>
                      <div className="font-semibold">Pre-verified Online Payment</div>
                      <div className="text-[11px] text-muted-foreground">
                        Customer paid ₹{order.total_amount} via WhatsApp/Razorpay. No collection required.
                      </div>
                    </div>
                  </div>
                ) : (
                  /* COD Payment Options */
                  <div className="space-y-3">
                    {/* Method Toggle: Cash vs UPI */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('CASH')
                          setValidationError(null)
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          paymentMethod === 'CASH'
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                            : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Banknote className="h-4 w-4" />
                        Exact Cash Received
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('UPI')
                          setValidationError(null)
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          paymentMethod === 'UPI'
                            ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40'
                            : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <QrCode className="h-4 w-4" />
                        UPI / QR Code
                      </button>
                    </div>

                    {/* Cash Mode Details */}
                    {paymentMethod === 'CASH' && (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                            Exact Cash Received (₹) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                              ₹
                            </span>
                            <Input
                              type="number"
                              value={amountCollected}
                              onChange={(e) => setAmountCollected(e.target.value)}
                              placeholder={String(order.total_amount)}
                              className="pl-8 h-11 text-base font-bold font-mono rounded-xl bg-background border-border/80"
                            />
                          </div>
                        </div>

                        {/* Quick Shortcut Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setAmountCollected(String(order.total_amount))}
                            className="px-2.5 py-1 rounded-lg border border-border/70 bg-muted/40 text-[11px] font-medium text-foreground hover:bg-muted"
                          >
                            Exact ₹{order.total_amount}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAmountCollected(String(Math.ceil(order.total_amount / 100) * 100))}
                            className="px-2.5 py-1 rounded-lg border border-border/70 bg-muted/40 text-[11px] font-medium text-foreground hover:bg-muted"
                          >
                            Round Up ₹{Math.ceil(order.total_amount / 100) * 100}
                          </button>
                        </div>

                        {/* Return Change Helper */}
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Cash Tendered by Customer:</span>
                            <Input
                              type="number"
                              value={tenderedAmount}
                              onChange={(e) => setTenderedAmount(e.target.value)}
                              placeholder={`e.g. ₹${Math.ceil(order.total_amount / 500) * 500}`}
                              className="w-32 h-8 text-xs font-mono text-right rounded-lg bg-background"
                            />
                          </div>
                          {Number(tenderedAmount) > Number(amountCollected) && (
                            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-border/40">
                              <span>Return Change to Customer:</span>
                              <span className="font-mono text-sm font-bold">
                                ₹{calculatedChange.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* UPI Mode Details */}
                    {paymentMethod === 'UPI' && (
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                          {/* Simulated / Real QR Code */}
                          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white text-black shadow-xs shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={qrCodeUrl}
                              alt="UPI QR Code"
                              className="h-28 w-28 object-contain"
                              onError={(e) => {
                                // Fallback SVG if external QR service is unreachable
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            <span className="text-[10px] font-mono text-slate-600 mt-1">
                              Scan with GPay/PhonePe
                            </span>
                          </div>

                          <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                            <div>
                              <span className="text-[11px] text-muted-foreground">UPI ID:</span>
                              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                <span className="font-mono font-semibold text-foreground text-xs">
                                  jatrra.logistics@okaxis
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCopyUPI}
                                  className="h-6 w-6 p-0"
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[11px] text-muted-foreground">Amount:</span>
                              <div className="font-mono font-bold text-base text-foreground">
                                ₹{amountCollected || order.total_amount}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* UPI Ref Input */}
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                            UPI Transaction Ref / UTR (Optional)
                          </label>
                          <Input
                            value={upiRef}
                            onChange={(e) => setUpiRef(e.target.value)}
                            placeholder="e.g. 429381749281 or last 4 digits"
                            className="h-9 text-xs font-mono rounded-lg bg-background"
                          />
                        </div>

                        {/* Verification Checkbox */}
                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={upiVerified}
                            onChange={(e) => setUpiVerified(e.target.checked)}
                            className="h-4 w-4 rounded text-blue-600 border-border"
                          />
                          <span className="text-foreground">
                            Payment verified via Soundbox / SMS / Driver Bank App
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Proof of Delivery (POD) Section */}
              <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-primary" />
                    Proof of Delivery (POD)
                  </span>
                  <span className="text-[11px] text-muted-foreground">Optional</span>
                </div>

                {/* POD Type Toggle */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setPodType('PHOTO')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                      podType === 'PHOTO'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📷 Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPodType('SIGNATURE')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                      podType === 'SIGNATURE'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ✍️ Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setPodType('OTP')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                      podType === 'OTP'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🔢 OTP
                  </button>
                </div>

                {/* Photo Upload View */}
                {podType === 'PHOTO' && (
                  <div className="space-y-2">
                    {photoPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-border max-h-48 bg-black/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoPreview}
                          alt="Package delivery photo"
                          className="w-full h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-4 bg-muted/20">
                        <Upload className="h-6 w-6 text-muted-foreground/60 mb-1.5" />
                        <span className="text-xs font-medium text-foreground">
                          Take a photo of the delivered package
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Shows item at customer doorstep or farm gate
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90">
                            <Camera className="h-3.5 w-3.5" />
                            <span>Capture / Browse</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPhotoPreview(SAMPLE_PACKAGE_PHOTO)}
                            className="text-[11px] h-7"
                          >
                            <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
                            Sample Photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Signature Pad View */}
                {podType === 'SIGNATURE' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Customer Signature Pad</span>
                      {hasSignature && (
                        <button
                          type="button"
                          onClick={handleClearSignature}
                          className="text-rose-500 hover:underline flex items-center gap-0.5"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="relative rounded-xl border border-border/80 bg-background overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-28 touch-none bg-muted/10 cursor-crosshair"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/40 text-xs">
                          ✍️ Customer finger / stylus signature here
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer OTP View */}
                {podType === 'OTP' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground block">
                      Customer Delivery OTP
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="4-digit OTP"
                        maxLength={4}
                        className="h-10 text-center font-mono tracking-widest text-base font-bold bg-background rounded-xl"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setOtpValue('4592')}
                        className="text-xs h-10 px-3"
                      >
                        Auto-fill OTP (4592)
                      </Button>
                    </div>
                  </div>
                )}

                {/* Optional Driver Notes */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Driver Remarks / Drop Notes (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Handed to farm caretaker Ramu at gate"
                    className="h-16 text-xs rounded-xl bg-background border-border/80"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARK AS UNDELIVERED / CANCELLED */}
          {resolutionType === 'CANCELLED' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-500/30 bg-card p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                  <XCircle className="h-4 w-4" />
                  <span>Cancellation & Non-Delivery Reason</span>
                </div>

                {/* Structured Cancellation Dropdown / Radio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground block">
                    Select Structured Reason <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CANCELLATION_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Remarks */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Driver Detailed Remarks
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details (e.g. called 3 times, neighbor said customer out of town until Monday)"
                    className="h-20 text-xs rounded-xl bg-background border-border/80"
                  />
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-600 dark:text-amber-400">
                  ⚠️ This stop will be recorded as undelivered. Please return the package safely to the central dispatch hub at the end of your run.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Submission Action Bar */}
        <div className="sticky bottom-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur-md p-3.5 sm:p-4">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full h-12 text-sm font-semibold rounded-xl shadow-lg active:scale-98 transition-all ${
              resolutionType === 'DELIVERED'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Recording Resolution...
              </>
            ) : resolutionType === 'DELIVERED' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Delivery &amp; Record Payment
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Confirm Undelivered / Return to Hub
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
