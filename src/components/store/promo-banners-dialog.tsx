'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Check,
  RotateCcw,
  Upload,
  ArrowRight,
  Eye,
  EyeOff,
  Palette,
  Layers,
  Tag,
  Link as LinkIcon,
  Smile,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Folder,
} from 'lucide-react'
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
import { toast } from 'sonner'
import {
  type PromoBannerCard,
  DEFAULT_PROMO_BANNERS,
  PROMO_THEME_STYLES,
} from '@/types/banner'
import { MediaPickerModal } from '@/components/media/media-picker-modal'

interface PromoBannersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (banners: PromoBannerCard[]) => void
}

const BADGE_PRESETS = [
  'High Protein',
  'Daily Essentials',
  'Certified Seeds',
  'Up to 25% Off',
  'Best Seller',
  'Organic',
  'Heavy Duty',
  'Special Deal',
  'Farmer Favorite',
  'Limited Offer',
  '100% Pure',
]

const EMOJI_PRESETS = [
  '🐄',
  '🥛',
  '🌾',
  '🚜',
  '🌱',
  '🍳',
  '🥩',
  '🧀',
  '🍯',
  '📦',
  '🚚',
  '💧',
  '✨',
  '🔥',
  '🏆',
  '🩺',
  '⚙️',
  '🌿',
]

const CATEGORY_OPTIONS = [
  { value: 'cattle-feed', label: '🐄 Cattle Feed & Supplements' },
  { value: 'seeds-fert', label: '🌾 Seeds & Bio-Fertilizers' },
  { value: 'agri-tools', label: '🚜 Sprayers & Farm Tools' },
  { value: 'home-kitchen', label: '🍳 Kitchen & Village Utensils' },
  { value: 'all', label: '📦 All Catalog Products' },
]

export function PromoBannersDialog({
  open,
  onOpenChange,
  onSaved,
}: PromoBannersDialogProps) {
  const [banners, setBanners] = useState<PromoBannerCard[]>(DEFAULT_PROMO_BANNERS)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Load latest banners when dialog opens
  useEffect(() => {
    if (!open) return
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/store/banner')
        const data = await res.json()
        if (data.promoBanners && Array.isArray(data.promoBanners) && data.promoBanners.length > 0) {
          setBanners(data.promoBanners)
        } else {
          setBanners(DEFAULT_PROMO_BANNERS)
        }
      } catch (err) {
        console.warn('Failed to load promo banners config:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [open])

  const currentCard: PromoBannerCard = banners[selectedIndex] || banners[0] || DEFAULT_PROMO_BANNERS[0]

  const updateCurrentCard = (updates: Partial<PromoBannerCard>) => {
    setBanners((prev) =>
      prev.map((card, idx) => (idx === selectedIndex ? { ...card, ...updates } : card))
    )
  }

  // Handle uploading custom image for the promo icon
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/store/banner/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed')
      }

      updateCurrentCard({
        icon: data.url,
        iconType: 'image',
      })
      toast.success('Custom banner graphic uploaded!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Save changes via API
  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/store/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoBanners: banners }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('3 Promotional Banners updated successfully!')
        onSaved?.(data.promoBanners || banners)
        // Dispatch custom event for real-time storefront update without reload
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wacrm:promobanners-updated', {
              detail: data.promoBanners || banners,
            })
          )
        }
        onOpenChange(false)
      } else {
        throw new Error(data.error || 'Failed to save banners')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save promotional banners')
    } finally {
      setSaving(false)
    }
  }

  // Reset to original preset cards
  const handleResetDefaults = () => {
    if (confirm('Reset all three promotional banners to original defaults?')) {
      setBanners(DEFAULT_PROMO_BANNERS)
      toast.info('Restored original preset promotional banners.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                Manage 3 Promotional Banners
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Edit and customize the 3 promotional cards shown under products on the storefront.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
            <span className="text-xs text-muted-foreground">Loading banner details...</span>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* ================= 1. LIVE STORE INTERACTIVE PREVIEW ================= */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-0.5">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Storefront Preview (Click any card to edit)</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Cards render 100% true-to-life
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/5 dark:bg-slate-950/40 rounded-xl border border-border/80">
                {banners.map((card, idx) => {
                  const theme = PROMO_THEME_STYLES[card.theme] || PROMO_THEME_STYLES.green
                  const isSelected = selectedIndex === idx
                  return (
                    <div
                      key={card.id || idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative cursor-pointer rounded-xl p-3.5 border transition-all duration-200 select-none ${
                        theme.container
                      } ${
                        isSelected
                          ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-950 shadow-md scale-[1.01]'
                          : 'opacity-85 hover:opacity-100 hover:scale-[1.005]'
                      }`}
                    >
                      {/* Active / Hidden Badge indicator */}
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                        {isSelected && (
                          <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs">
                            Editing
                          </span>
                        )}
                        {!card.active && (
                          <span className="bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" /> Hidden
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 overflow-hidden">
                        <div className="space-y-1.5 max-w-[70%] z-10">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${theme.badge}`}
                          >
                            {card.badge || 'PROMOTION'}
                          </span>
                          <h4 className={`font-extrabold text-xs sm:text-sm leading-snug line-clamp-1 ${theme.title}`}>
                            {card.title || 'Banner Title'}
                          </h4>
                          <div className={`text-[11px] font-extrabold line-clamp-1 ${theme.subtitle}`}>
                            {card.subtitle || 'Offer Details'}
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md shadow-2xs mt-1 ${theme.button}`}
                          >
                            <span>{card.ctaText || 'Shop Now'}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>

                        {/* Graphic Icon */}
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden ${theme.iconBg}`}
                        >
                          {card.iconType === 'image' && card.icon ? (
                            <img
                              src={card.icon}
                              alt={card.title}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-2xl">{card.icon || '🌾'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ================= 2. CARD SELECTOR TABS ================= */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
              {banners.map((card, idx) => (
                <button
                  key={card.id || idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedIndex === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-muted/70 hover:bg-muted text-foreground border border-border/60'
                  }`}
                >
                  <span className="text-base">{card.icon || '🌾'}</span>
                  <span>
                    Card {idx + 1}: {card.title || `Banner ${idx + 1}`}
                  </span>
                  {!card.active && (
                    <span className="text-[10px] opacity-75 font-normal">(Hidden)</span>
                  )}
                </button>
              ))}
            </div>

            {/* ================= 3. ACTIVE CARD EDITOR ================= */}
            <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 space-y-4">
              {/* Row 1: Visibility & Theme Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Card Visibility:</span>
                  <button
                    type="button"
                    onClick={() => updateCurrentCard({ active: !currentCard.active })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      currentCard.active
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {currentCard.active ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible on Store</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden (Off)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span>Theme:</span>
                  </span>
                  {Object.entries(PROMO_THEME_STYLES).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateCurrentCard({ theme: key })}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition cursor-pointer ${
                        currentCard.theme === key
                          ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'border-border bg-background hover:bg-muted text-foreground'
                      }`}
                    >
                      {item.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Badge Text + Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Top Badge Label</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={currentCard.badge}
                    onChange={(e) => updateCurrentCard({ badge: e.target.value })}
                    placeholder="e.g. HIGH PROTEIN"
                    className="h-9 text-xs max-w-sm"
                  />
                </div>
                {/* Badge Presets */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-muted-foreground self-center mr-1">Presets:</span>
                  {BADGE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateCurrentCard({ badge: p })}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        currentCard.badge === p
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-muted/70 hover:bg-muted text-foreground border-border/70'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Headline Title (Main Product / Category)
                  </label>
                  <Input
                    value={currentCard.title}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    placeholder="e.g. Cattle Feed Premix"
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Prominent bold title on the card
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Subtitle / Discount Offer
                  </label>
                  <Input
                    value={currentCard.subtitle}
                    onChange={(e) => updateCurrentCard({ subtitle: e.target.value })}
                    placeholder="e.g. Up to 25% Off"
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Colored highlight text under title
                  </span>
                </div>
              </div>

              {/* Row 4: CTA Button Text & Target Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Action Button Label
                  </label>
                  <Input
                    value={currentCard.ctaText || ''}
                    onChange={(e) => updateCurrentCard({ ctaText: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Target Store Category (Filters & Scrolls)</span>
                  </label>
                  <select
                    value={currentCard.categoryFilter || 'cattle-feed'}
                    onChange={(e) => updateCurrentCard({ categoryFilter: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Graphic Icon (Emoji or Custom Image) */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>Card Graphic Icon (Emoji or Custom Image)</span>
                  </label>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => updateCurrentCard({ iconType: 'emoji' })}
                      className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] transition cursor-pointer ${
                        currentCard.iconType !== 'image'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      Emoji
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCurrentCard({ iconType: 'image' })}
                      className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] transition cursor-pointer ${
                        currentCard.iconType === 'image'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      Image / Graphic
                    </button>
                  </div>
                </div>

                {currentCard.iconType === 'image' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                    <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {currentCard.icon ? (
                        <img
                          src={currentCard.icon}
                          alt="Graphic preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      <Input
                        value={currentCard.icon || ''}
                        onChange={(e) => updateCurrentCard({ icon: e.target.value })}
                        placeholder="Paste image or SVG URL..."
                        className="h-8 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMediaPickerOpen(true)}
                          className="h-7 text-[11px] gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <Folder className="w-3 h-3" />
                          <span>Select from Media Library</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="h-7 text-[11px] gap-1 cursor-pointer"
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>Upload File</span>
                        </Button>
                        <span className="text-[10px] text-muted-foreground">
                          Supports PNG, WebP, SVG, JPG
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Input
                        value={currentCard.icon || '🌾'}
                        onChange={(e) => updateCurrentCard({ icon: e.target.value })}
                        className="h-9 w-20 text-center text-xl font-bold"
                      />
                      <span className="text-xs text-muted-foreground">
                        Select a preset or enter any emoji:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOJI_PRESETS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => updateCurrentCard({ icon: emoji, iconType: 'emoji' })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition cursor-pointer border ${
                            currentCard.icon === emoji
                              ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-2xs'
                              : 'bg-card hover:bg-muted border-border/80'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/70 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 justify-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 3 Banners to Defaults</span>
          </Button>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={handleSave}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Save & Publish Banners</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* MEDIA PICKER MODAL FOR PROMO GRAPHICS */}
    <MediaPickerModal
      open={mediaPickerOpen}
      onOpenChange={setMediaPickerOpen}
      allowedTypes={['image']}
      defaultCategory="banners"
      title="Select Promo Banner Graphic"
      description="Select an image or graphic from your media library for this promotional deal card."
      currentValue={currentCard.icon}
      onSelect={(_item, url) => {
        const finalUrl = Array.isArray(url) ? url[0] : url
        if (finalUrl) {
          updateCurrentCard({ icon: finalUrl, iconType: 'image' })
        }
      }}
    />
  </>
  )
}
