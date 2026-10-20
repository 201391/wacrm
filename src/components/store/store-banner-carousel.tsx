'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Film,
  Video,
  UploadCloud,
  Play,
  Folder,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useStoreLanguage } from './language-context'
import type { StoreBannerSlide, StoreBannersConfig, BannerMediaType } from '@/types/banner'
import { DEFAULT_BANNER_SLIDES, getSlideMediaType } from '@/types/banner'
import { MediaPickerModal } from '@/components/media/media-picker-modal'

export interface BannerPresetItem {
  type: BannerMediaType
  label: string
  emoji: string
  badgeText: string
  url: string
  category: string
}

export const BANNER_PHOTO_PRESETS: BannerPresetItem[] = [
  // High quality farm images
  {
    type: 'image',
    label: 'Dairy Cattle & Cows',
    emoji: '🐄',
    badgeText: 'Dairy Special',
    url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1600&q=80',
    category: 'cattle-feed',
  },
  {
    type: 'image',
    label: 'Golden Wheat Harvest',
    emoji: '🌾',
    badgeText: 'High Yield',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    category: 'seeds-fert',
  },
  {
    type: 'image',
    label: 'Tractor & Battery Sprayers',
    emoji: '🚜',
    badgeText: 'Heavy Duty',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=80',
    category: 'agri-tools',
  },
  {
    type: 'image',
    label: 'Village Kitchen & Cookware',
    emoji: '🥘',
    badgeText: 'Village Living',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80',
    category: 'home-kitchen',
  },
  {
    type: 'image',
    label: 'Panchayat & Doorstep Delivery',
    emoji: '🚚',
    badgeText: 'Direct Delivery',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1600&q=80',
    category: 'all',
  },
  {
    type: 'image',
    label: 'Certified Grain & Feeds',
    emoji: '📦',
    badgeText: '100% Genuine',
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1600&q=80',
    category: 'cattle-feed',
  },
  // Animated GIFs
  {
    type: 'gif',
    label: 'Sprouting Seedling (GIF)',
    emoji: '🌱',
    badgeText: 'Live Growth',
    url: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    category: 'seeds-fert',
  },
  {
    type: 'gif',
    label: 'Bumper Wheat Wave (GIF)',
    emoji: '🌾',
    badgeText: 'Bumper Crop',
    url: 'https://media.giphy.com/media/l41JRsph73VokN6ik/giphy.gif',
    category: 'seeds-fert',
  },
  // High quality looping MP4 videos
  {
    type: 'video',
    label: 'Agriculture Green Fields (HD Video)',
    emoji: '🌿',
    badgeText: 'Live Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'all',
  },
  {
    type: 'video',
    label: 'Rural Irrigation Stream (HD Video)',
    emoji: '💧',
    badgeText: 'Irrigation Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    category: 'seeds-fert',
  },
]

interface StoreBannerCarouselProps {
  onCategoryFilter?: (categoryId: string) => void
}

export function StoreBannerCarousel({ onCategoryFilter }: StoreBannerCarouselProps) {
  const { canEditSettings, isAdmin, isOwner } = useAuth()
  const { language } = useStoreLanguage()

  // Only users with admin or owner capability can change banners
  const isUserAdmin = Boolean(canEditSettings || isAdmin || isOwner)

  const [banners, setBanners] = useState<StoreBannerSlide[]>(DEFAULT_BANNER_SLIDES)
  const [intervalMs, setIntervalMs] = useState<number>(2000)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [, setLoadingConfig] = useState(true)

  // Admin Dialog State
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [savingBanners, setSavingBanners] = useState(false)
  const [editingSlide, setEditingSlide] = useState<StoreBannerSlide | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Slide Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formBadgeText, setFormBadgeText] = useState('')
  const [formBadgeEmoji, setFormBadgeEmoji] = useState('🌾')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formMediaType, setFormMediaType] = useState<BannerMediaType>('image')
  const [formCategory, setFormCategory] = useState('all')
  const [formCtaText, setFormCtaText] = useState('Shop Now')
  const [formIntervalSeconds, setFormIntervalSeconds] = useState(2)

  // Uploader and Presets UI state
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [presetFilter, setPresetFilter] = useState<'all' | 'image' | 'gif' | 'video'>('all')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Fetch Banners from API
  const loadBanners = useCallback(async () => {
    try {
      setLoadingConfig(true)
      const res = await fetch('/api/store/banner')
      const data = await res.json()
      if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
        setBanners(data.banners)
        if (data.intervalMs) {
          setIntervalMs(Number(data.intervalMs) || 2000)
        }
      }
    } catch (err) {
      console.warn('Failed to load store banners:', err)
    } finally {
      setLoadingConfig(false)
    }
  }, [])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  // Active slides only
  const activeSlides = useMemo(() => {
    const filtered = banners.filter((b) => b.active !== false)
    return filtered.length > 0 ? filtered : DEFAULT_BANNER_SLIDES
  }, [banners])

  // Keep currentIndex in bounds when activeSlides change
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0)
    }
  }, [activeSlides.length, currentIndex])

  // ================= AUTO-ROTATION =================
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
    }, intervalMs || 2000)

    return () => clearInterval(timer)
  }, [activeSlides.length, isPaused, intervalMs])

  // Next / Prev handlers
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)
  }

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
  }

  const handleCtaClick = (slide: StoreBannerSlide) => {
    const targetCat = slide.categoryFilter || 'all'
    if (onCategoryFilter) {
      onCategoryFilter(targetCat)
    }
    const el = document.getElementById('popularSection')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Open Admin Dialog
  const handleOpenAdminDialog = () => {
    setFormIntervalSeconds(Math.round((intervalMs || 2000) / 1000) || 2)
    setEditingSlide(null)
    setIsAddingNew(false)
    setAdminDialogOpen(true)
  }

  // Open Edit Form for a slide
  const handleStartEditSlide = (slide: StoreBannerSlide) => {
    setEditingSlide(slide)
    setIsAddingNew(false)
    setFormTitle(slide.title || '')
    setFormSubtitle(slide.subtitle || '')
    setFormBadgeText(slide.badgeText || '')
    setFormBadgeEmoji(slide.badgeEmoji || '🌾')
    setFormImageUrl(slide.videoUrl || slide.imageUrl || '')
    setFormMediaType(getSlideMediaType(slide))
    setFormCategory(slide.categoryFilter || 'all')
    setFormCtaText(slide.ctaText || 'Shop Now')
  }

  // Open Add New Slide Form
  const handleStartAddNew = () => {
    setEditingSlide(null)
    setIsAddingNew(true)
    setFormTitle('New Farm Essential Offer')
    setFormSubtitle('Special seasonal discount on verified agricultural supplies.')
    setFormBadgeText('Special Deal')
    setFormBadgeEmoji('✨')
    setFormImageUrl(BANNER_PHOTO_PRESETS[0].url)
    setFormMediaType(BANNER_PHOTO_PRESETS[0].type)
    setFormCategory('cattle-feed')
    setFormCtaText('Shop Now')
  }

  // Handle URL change with auto format detection
  const handleUrlChange = (val: string) => {
    setFormImageUrl(val)
    const lower = val.toLowerCase().trim()
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.m4v') ||
      lower.startsWith('data:video/')
    ) {
      setFormMediaType('video')
    } else if (lower.endsWith('.gif') || lower.startsWith('data:image/gif')) {
      setFormMediaType('gif')
    }
  }

  // Handle direct file upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/store/banner/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload media file')
      }

      setFormImageUrl(data.url)
      if (data.mediaType) {
        setFormMediaType(data.mediaType)
      }

      toast.success(
        data.mediaType === 'video'
          ? `Video file uploaded: ${file.name}`
          : data.mediaType === 'gif'
          ? `Animated GIF uploaded: ${file.name}`
          : `Image uploaded: ${file.name}`
      )
    } catch (err: any) {
      toast.error(err.message || 'Error uploading file')
    } finally {
      setUploadingMedia(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Save or Update Slide locally in list
  const handleApplySlideEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formImageUrl.trim()) {
      toast.error('Please enter a title and media file/URL')
      return
    }

    if (isAddingNew) {
      const newSlide: StoreBannerSlide = {
        id: `banner-${Date.now()}`,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        badgeText: formBadgeText.trim(),
        badgeEmoji: formBadgeEmoji.trim() || '🌾',
        imageUrl: formImageUrl.trim(),
        videoUrl: formMediaType === 'video' ? formImageUrl.trim() : undefined,
        mediaType: formMediaType,
        categoryFilter: formCategory,
        ctaText: formCtaText.trim() || 'Shop Now',
        active: true,
      }
      setBanners((prev) => [...prev, newSlide])
      setIsAddingNew(false)
      toast.success(
        formMediaType === 'video'
          ? 'Video banner slide added'
          : formMediaType === 'gif'
          ? 'GIF banner slide added'
          : 'Banner slide added to list'
      )
    } else if (editingSlide) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingSlide.id
            ? {
                ...b,
                title: formTitle.trim(),
                subtitle: formSubtitle.trim(),
                badgeText: formBadgeText.trim(),
                badgeEmoji: formBadgeEmoji.trim() || '🌾',
                imageUrl: formImageUrl.trim(),
                videoUrl: formMediaType === 'video' ? formImageUrl.trim() : undefined,
                mediaType: formMediaType,
                categoryFilter: formCategory,
                ctaText: formCtaText.trim() || 'Shop Now',
              }
            : b
        )
      )
      setEditingSlide(null)
      toast.success('Banner slide updated')
    }
  }

  // Toggle active status
  const handleToggleSlideActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: b.active === false } : b))
    )
  }

  // Delete slide
  const handleDeleteSlide = (id: string) => {
    if (banners.length <= 1) {
      toast.error('You must keep at least one banner slide')
      return
    }
    setBanners((prev) => prev.filter((b) => b.id !== id))
    toast.info('Slide removed')
  }

  // Move slide up/down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= banners.length) return
    const updated = [...banners]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setBanners(updated)
  }

  // Save All Banners to Server
  const handleSaveAllBanners = async () => {
    setSavingBanners(true)
    try {
      const newIntervalMs = Math.max(1, formIntervalSeconds) * 1000
      const payload: Partial<StoreBannersConfig> = {
        intervalMs: newIntervalMs,
        banners,
      }

      const res = await fetch('/api/store/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setBanners(data.banners || banners)
        setIntervalMs(newIntervalMs)
        toast.success(
          language === 'hi'
            ? 'स्टोर बैनर्स सफलतापूर्वक अपडेट हो गए!'
            : 'Storefront banners successfully updated!'
        )
        setAdminDialogOpen(false)
      } else {
        throw new Error(data.error || 'Failed to save banners')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving banners')
    } finally {
      setSavingBanners(false)
    }
  }

  // Localization helper for default banners
  const getLocalizedTitle = (slide: StoreBannerSlide) => {
    if (language !== 'hi') return slide.title
    if (slide.id === 'banner-cattle-feed') return 'प्रमाणित पशु आहार एवं दुग्ध वर्धक'
    if (slide.id === 'banner-seeds-agri') return 'उच्च पैदावार हाइब्रिड बीज एवं जैविक खाद'
    if (slide.id === 'banner-sprayers-tools') return 'आधुनिक बैटरी स्प्रेयर एवं कृषि उपकरण'
    if (slide.id === 'banner-home-kitchen') return 'मजबूत ग्रामीण रसोई एवं घरेलू बर्तन'
    if (slide.id === 'banner-doorstep-delivery') return 'गाँव-गाँव और पंचायत तक सुरक्षित डिलीवरी'
    return slide.title
  }

  const getLocalizedSubtitle = (slide: StoreBannerSlide) => {
    if (language !== 'hi') return slide.subtitle
    if (slide.id === 'banner-cattle-feed')
      return 'पशुओं का स्वास्थ्य सुधारें और दूध उत्पादन 25% तक बढ़ाएं • 100% असली पोषण।'
    if (slide.id === 'banner-seeds-agri')
      return '100% अंकुरण गारंटी • सीधे प्रमाणित किसान सहकारी समितियों एवं कृषि विश्वविद्यालय से।'
    if (slide.id === 'banner-sprayers-tools')
      return 'दमदार 12V बैटरी नेपसैक स्प्रेयर, 1 साल की वारंटी एवं गाँव तक फ्री डिलीवरी।'
    if (slide.id === 'banner-home-kitchen')
      return 'पारंपरिक भारी लोहे की कढ़ाई, पीतल के बर्तन एवं टिकाऊ ग्रामीण घरेलू सामान।'
    if (slide.id === 'banner-doorstep-delivery')
      return 'कैश ऑन डिलीवरी (COD) एवं UPI उपलब्ध • सीधे आपके घर तक 48 घंटे में डिलीवरी।'
    return slide.subtitle
  }

  return (
    <div className="relative w-full">
      {/* ================= HERO CAROUSEL CONTAINER ================= */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-md border border-emerald-950/10 bg-slate-950 h-[300px] sm:h-[350px] md:h-[400px] lg:h-[440px] group transition-all"
      >
        {/* Render Slides with Smooth Transitions */}
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex
          const slideMediaType = getSlideMediaType(slide)
          return (
            <div
              key={slide.id || idx}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Media: Video vs GIF / Image */}
              {slideMediaType === 'video' ? (
                <video
                  src={slide.videoUrl || slide.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              ) : (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                  onError={(e) => {
                    ;(e.target as any).src = BANNER_PHOTO_PRESETS[0].url
                  }}
                />
              )}

              {/* Multi-layer Gradient Overlays for High Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25 sm:bg-gradient-to-r sm:from-black/95 sm:via-black/60 sm:to-black/15 z-10" />

              {/* Slide Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center p-6 sm:p-10 md:p-14 max-w-3xl">
                {/* Badge Pill with Format Indicator */}
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                  {slide.badgeText && (
                    <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/25 shadow-sm">
                      <span>{slide.badgeEmoji || '🌱'}</span>
                      <span>{slide.badgeText}</span>
                    </div>
                  )}
                  {slideMediaType === 'video' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/40 backdrop-blur-md">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Video</span>
                    </span>
                  )}
                  {slideMediaType === 'gif' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 backdrop-blur-md">
                      <Film className="w-2.5 h-2.5" />
                      <span>GIF</span>
                    </span>
                  )}
                </div>

                {/* Banner Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white leading-[1.14] tracking-tight drop-shadow-md mb-2">
                  {getLocalizedTitle(slide)}
                </h2>

                {/* Banner Subtitle */}
                {slide.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 font-normal leading-relaxed max-w-xl drop-shadow-sm mb-4 line-clamp-2 sm:line-clamp-3">
                    {getLocalizedSubtitle(slide)}
                  </p>
                )}

                {/* Action CTA Button */}
                <div className="pt-1 flex items-center gap-3">
                  <button
                    onClick={() => handleCtaClick(slide)}
                    className="bg-[#0b7b3e] hover:bg-[#086331] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-black/40 flex items-center gap-2 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{slide.ctaText || (language === 'hi' ? 'अभी खरीदें' : 'Shop Now')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-white/75 font-medium hidden sm:inline">
                    {language === 'hi' ? `• ${Math.round(intervalMs / 1000)}s ऑटो-बैनर` : `• Auto-rotates every ${Math.round(intervalMs / 1000)}s`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* ================= PREV & NEXT BUTTONS ================= */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous banner"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition shadow-lg opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next banner"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition shadow-lg opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* ================= BOTTOM PAGINATION & TIMER ================= */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20">
          {activeSlides.map((_, idx) => {
            const isActive = idx === currentIndex
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer overflow-hidden relative ${
                  isActive ? 'w-8 sm:w-10 h-2 bg-white/30' : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
              >
                {isActive && (
                  <div
                    key={`timer-${currentIndex}`}
                    style={{ animationDuration: `${intervalMs || 2000}ms` }}
                    className="h-full bg-[#0b7b3e] animate-[fillProgress_linear_forwards] rounded-full"
                  />
                )}
              </button>
            )
          })}

          <span className="text-[10px] font-bold text-white/80 ml-2 hidden sm:inline">
            {currentIndex + 1} / {activeSlides.length}
          </span>
        </div>

        {/* ================= ADMIN ONLY CONTROLS BUTTON ================= */}
        {isUserAdmin && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={handleOpenAdminDialog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold shadow-lg border border-emerald-400/60 backdrop-blur-md transition hover:scale-105 cursor-pointer"
              title="Admin Only: Manage multiple banners with GIF, Video and Image support"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin: Manage Banners ({activeSlides.length})</span>
            </button>
          </div>
        )}
      </section>

      {/* ================= ADMIN BANNER MANAGER MODAL ================= */}
      {isUserAdmin && (
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0b7b3e] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Storefront Banner Manager
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Support for Images, Animated GIFs, and MP4/WebM Videos. Upload files directly or pick from curated presets.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-3">
              {/* Rotation Interval Setting */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0b7b3e]" />
                    <span>Auto-Rotation Speed</span>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Slides rotate continuously. Default is 2 seconds.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 8].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setFormIntervalSeconds(sec)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        formIntervalSeconds === sec
                          ? 'bg-[#0b7b3e] text-white border-[#0b7b3e] shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {sec}s {sec === 2 ? '(Default)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add / Edit Slide Form Section */}
              {(isAddingNew || editingSlide) && (
                <form
                  onSubmit={handleApplySlideEdit}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0b7b3e]" />
                      <span>{isAddingNew ? 'Add New Banner Slide' : 'Edit Banner Slide'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false)
                        setEditingSlide(null)
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* MEDIA FORMAT SELECTOR: Image vs GIF vs Video */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0b7b3e]" />
                        <span>Media Format Option</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Select format type for this banner slide
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormMediaType('image')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          formMediaType === 'image'
                            ? 'bg-emerald-50 border-[#0b7b3e] text-[#0b7b3e] shadow-xs ring-2 ring-[#0b7b3e]/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Standard Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMediaType('gif')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          formMediaType === 'gif'
                            ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-2 ring-purple-600/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span>Animated GIF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMediaType('video')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          formMediaType === 'video'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-2 ring-blue-600/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>Video (MP4 / WebM)</span>
                      </button>
                    </div>
                  </div>

                  {/* DIRECT FILE UPLOAD AREA */}
                  <div className="p-3.5 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0b7b3e]/60 transition text-center space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="banner-file-upload-input"
                      disabled={uploadingMedia}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                          formMediaType === 'video'
                            ? 'bg-blue-100 text-blue-600'
                            : formMediaType === 'gif'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-emerald-100 text-[#0b7b3e]'
                        }`}
                      >
                        {uploadingMedia ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {uploadingMedia
                          ? 'Uploading media file...'
                          : `Upload ${formMediaType === 'video' ? 'Video' : formMediaType === 'gif' ? 'GIF Animation' : 'Image'} File`}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports animated .gif, .mp4, .webm, .png, .jpg, .webp (up to 50MB)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMediaPickerOpen(true)}
                        className="text-xs h-7 font-semibold border-emerald-500/30 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 mr-1" />
                        Select from Media Library
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingMedia}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs h-7 font-semibold border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        {uploadingMedia ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* URL INPUT WITH AUTO-DETECTION */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                      <span>Or Enter Media URL / Local Path:</span>
                      <span className="text-[10px] text-slate-400">
                        Supports direct image, GIF, or MP4 URL
                      </span>
                    </label>
                    <Input
                      value={formImageUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder={
                        formMediaType === 'video'
                          ? 'https://.../video.mp4 or /uploads/banners/...'
                          : formMediaType === 'gif'
                          ? 'https://.../animation.gif or /uploads/banners/...'
                          : 'https://images.unsplash.com/... or /uploads/banners/...'
                      }
                      className="h-8 text-xs bg-white"
                      required
                    />
                  </div>

                  {/* CURATED PRESETS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                        Quick Preset Inspiration:
                      </span>
                      <div className="flex items-center gap-1">
                        {(['all', 'image', 'gif', 'video'] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setPresetFilter(filter)}
                            className={`text-[9px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                              presetFilter === filter
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {filter === 'all'
                              ? 'All'
                              : filter === 'gif'
                              ? '🎞️ GIFs'
                              : filter === 'video'
                              ? '🎥 Videos'
                              : '🖼️ Images'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-slate-100/70 rounded-lg border border-slate-200">
                      {BANNER_PHOTO_PRESETS.filter(
                        (p) => presetFilter === 'all' || p.type === presetFilter
                      ).map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setFormImageUrl(p.url)
                            setFormMediaType(p.type)
                            setFormBadgeEmoji(p.emoji)
                            setFormBadgeText(p.badgeText)
                            setFormCategory(p.category)
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                            formImageUrl === p.url
                              ? 'bg-[#0b7b3e] text-white border-[#0b7b3e] font-bold shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{p.emoji}</span>
                          <span>{p.label}</span>
                          {p.type === 'video' && (
                            <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded font-bold ml-0.5">
                              MP4
                            </span>
                          )}
                          {p.type === 'gif' && (
                            <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded font-bold ml-0.5">
                              GIF
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LIVE PREVIEW OF MEDIA */}
                  {formImageUrl && (
                    <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          {formMediaType === 'video' ? (
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                          ) : formMediaType === 'gif' ? (
                            <Film className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>
                            Live{' '}
                            {formMediaType === 'video'
                              ? 'Video Loop'
                              : formMediaType === 'gif'
                              ? 'Animated GIF'
                              : 'Image'}{' '}
                            Preview:
                          </span>
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            formMediaType === 'video'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : formMediaType === 'gif'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {formMediaType.toUpperCase()} FORMAT
                        </span>
                      </div>

                      <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-900 relative">
                        {formMediaType === 'video' ? (
                          <video
                            src={formImageUrl}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={formImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none flex flex-col justify-end p-3">
                          <span className="text-white text-xs font-bold">
                            {formBadgeEmoji} {formTitle || 'Banner Title'}
                          </span>
                          <span className="text-slate-200 text-[10px] line-clamp-1">
                            {formSubtitle || 'Subtitle description...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLIDE DETAILS (Title, Subtitle, Category, Badges) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Slide Title</label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Lab-Verified Cattle Feed & Boosters"
                        className="h-8 text-xs bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Category Link
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full h-8 text-xs bg-white border border-slate-200 rounded-md px-2 text-slate-700 outline-none"
                      >
                        <option value="all">All Products</option>
                        <option value="cattle-feed">Cattle Feed</option>
                        <option value="seeds-fert">Seeds & Agri</option>
                        <option value="agri-tools">Tools & Sprayers</option>
                        <option value="home-kitchen">Home & Kitchen</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Subtitle / Tagline
                    </label>
                    <Input
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="e.g. Boost milk yield by up to 25% with certified formulation"
                      className="h-8 text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Badge Emoji</label>
                      <Input
                        value={formBadgeEmoji}
                        onChange={(e) => setFormBadgeEmoji(e.target.value)}
                        placeholder="🐄, 🌾, 🚜, 🚚"
                        className="h-8 text-xs bg-white text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Badge Text</label>
                      <Input
                        value={formBadgeText}
                        onChange={(e) => setFormBadgeText(e.target.value)}
                        placeholder="e.g. Dairy Special"
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">CTA Button Text</label>
                      <Input
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="e.g. Shop Now"
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingNew(false)
                        setEditingSlide(null)
                      }}
                      className="text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="text-xs bg-[#0b7b3e] hover:bg-[#086331] text-white font-semibold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>{isAddingNew ? 'Add Slide to Banners' : 'Update Slide'}</span>
                    </Button>
                  </div>
                </form>
              )}

              {/* BANNERS LIST */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0b7b3e]" />
                    <span>Configured Banner Slides ({banners.length})</span>
                  </span>
                  {!isAddingNew && !editingSlide && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleStartAddNew}
                      className="h-7 text-xs bg-[#0b7b3e] hover:bg-[#086331] text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add New Banner</span>
                    </Button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {banners.map((slide, idx) => {
                    const slideMediaType = getSlideMediaType(slide)
                    return (
                      <div
                        key={slide.id || idx}
                        className={`p-3 flex items-center justify-between gap-3 transition ${
                          slide.active === false ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Thumbnail with Format Badges */}
                          <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 relative">
                            {slideMediaType === 'video' ? (
                              <video
                                src={slide.videoUrl || slide.imageUrl}
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={slide.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as any).src = BANNER_PHOTO_PRESETS[0].url
                                }}
                              />
                            )}
                            {slideMediaType === 'video' && (
                              <span className="absolute bottom-0.5 right-0.5 bg-blue-600/90 text-white text-[7px] font-bold px-1 rounded shadow-xs">
                                VIDEO
                              </span>
                            )}
                            {slideMediaType === 'gif' && (
                              <span className="absolute bottom-0.5 right-0.5 bg-purple-600/90 text-white text-[7px] font-bold px-1 rounded shadow-xs">
                                GIF
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {slide.badgeEmoji} {slide.title}
                              </span>
                              {slideMediaType === 'video' && (
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                  🎥 Video
                                </span>
                              )}
                              {slideMediaType === 'gif' && (
                                <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                  🎞️ GIF
                                </span>
                              )}
                              {slide.badgeText && (
                                <span className="text-[10px] font-semibold bg-emerald-50 text-[#0b7b3e] px-1.5 py-0.5 rounded border border-emerald-200">
                                  {slide.badgeText}
                                </span>
                              )}
                              {slide.active === false && (
                                <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{slide.subtitle}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Visibility toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleSlideActive(slide.id)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            title={slide.active === false ? 'Enable slide' : 'Hide slide'}
                          >
                            {slide.active === false ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-[#0b7b3e]" />
                            )}
                          </button>

                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSlide(idx, 'up')}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={idx === banners.length - 1}
                            onClick={() => handleMoveSlide(idx, 'down')}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleStartEditSlide(slide)}
                            className="px-2 py-1 rounded text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdminDialogOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={savingBanners}
                onClick={handleSaveAllBanners}
                className="text-xs bg-[#0b7b3e] hover:bg-[#086331] text-white font-semibold cursor-pointer"
              >
                {savingBanners ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>Save All Changes</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* REUSABLE MEDIA PICKER MODAL */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        allowedTypes={['image', 'video']}
        defaultCategory="banners"
        title="Select Banner Media from Library"
        description="Choose a high-impact banner image or background video loop from existing assets."
        currentValue={formImageUrl}
        onSelect={(_item, url) => {
          const finalUrl = Array.isArray(url) ? url[0] : url
          if (finalUrl) {
            setFormImageUrl(finalUrl)
            const ext = finalUrl.split('.').pop()?.toLowerCase() || ''
            if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
              setFormMediaType('video')
            } else if (ext === 'gif') {
              setFormMediaType('gif')
            } else {
              setFormMediaType('image')
            }
          }
        }}
      />
    </div>
  )
}
