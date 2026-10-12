'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  Heart,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Repeat,
  ArrowRight,
  PackageSearch,
  Star,
  X,
  MessageCircle,
  PhoneCall,
  Loader2,
  Sparkles,
  Edit3,
  Image as ImageIcon,
  Check,
  Languages,
} from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import { useStoreLanguage } from '@/components/store/language-context'
import type { Product } from '@/types'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface BannerConfig {
  tagline: string
  title: string
  highlightedWord: string
  description: string
  imageUrl: string
  badgeCategory: string
  badgeTitle: string
  badgeEmoji: string
}

const DEFAULT_BANNER: BannerConfig = {
  tagline: 'FRESH • RELIABLE • QUALITY',
  title: 'Farm & Rural Essentials Delivered to',
  highlightedWord: 'Your Doorstep',
  description:
    'Shop lab-verified cattle feed, high-yield hybrid seeds, bio-fertilizers, knapsack sprayers, and sturdy village kitchen cookware. Delivered straight to your doorstep or panchayat.',
  imageUrl:
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  badgeCategory: 'High Efficiency',
  badgeTitle: 'Peak Farm Yield',
  badgeEmoji: '🚜',
}

const BANNER_IMAGE_PRESETS = [
  {
    label: 'Modern Tractor & Sprayers (Featured)',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    emoji: '🚜',
    badgeCat: 'High Efficiency',
    badgeTitle: 'Peak Farm Yield',
  },
  {
    label: 'Healthy Dairy Cattle & Cows',
    url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80',
    emoji: '🐄',
    badgeCat: 'Pure Nutrition',
    badgeTitle: 'Peak Milk Yield',
  },
  {
    label: 'Golden Wheat Harvest Field',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    emoji: '🌾',
    badgeCat: 'High Yield',
    badgeTitle: '100% Certified Seeds',
  },
  {
    label: 'Knapsack Battery Sprayers & Gear',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    emoji: '⚙️',
    badgeCat: 'Heavy Duty',
    badgeTitle: 'Farmer Trusted Tools',
  },
]

function StoreCatalogContent() {
  const { items, addItem, updateQuantity } = useCart()
  const { t, language, toggleLanguage, translateProduct } = useStoreLanguage()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [heroSearchInput, setHeroSearchInput] = useState('')

  // Banner Config State
  const [banner, setBanner] = useState<BannerConfig>(DEFAULT_BANNER)
  const [editBannerOpen, setEditBannerOpen] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)

  // Banner Edit Form
  const [formBannerTagline, setFormBannerTagline] = useState('')
  const [formBannerTitle, setFormBannerTitle] = useState('')
  const [formBannerHighlighted, setFormBannerHighlighted] = useState('')
  const [formBannerDescription, setFormBannerDescription] = useState('')
  const [formBannerImageUrl, setFormBannerImageUrl] = useState('')
  const [formBannerBadgeCat, setFormBannerBadgeCat] = useState('')
  const [formBannerBadgeTitle, setFormBannerBadgeTitle] = useState('')
  const [formBannerBadgeEmoji, setFormBannerBadgeEmoji] = useState('🚜')

  // Quick View Modal State
  const [quickProduct, setQuickProduct] = useState<Product | null>(null)
  const [quickModalOpen, setQuickModalOpen] = useState(false)

  // Sync category and search from URL searchParams
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    const urlSearch = searchParams.get('search')
    if (urlCategory) setCurrentFilter(urlCategory)
    if (urlSearch) setSearchQuery(urlSearch)
  }, [searchParams])

  // Category Pills dynamically localized
  const categoryPills = useMemo(
    () => [
      { id: 'all', label: t('pillAll', 'All') },
      { id: 'cattle-feed', label: t('pillCattleFeed', 'Cattle Feed') },
      { id: 'seeds-fert', label: t('pillSeedsAgri', 'Seeds & Agri') },
      { id: 'agri-tools', label: t('pillToolsSprayers', 'Tools & Sprayers') },
      { id: 'home-kitchen', label: t('pillHomeKitchen', 'Home & Kitchen') },
    ],
    [t]
  )

  // Fetch banner config from API
  const loadBannerConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/store/banner')
      const data = await res.json()
      if (data.banner) {
        setBanner(data.banner)
      }
    } catch {
      // ignore
    }
  }, [])

  // Fetch products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error('Error fetching catalog products:', err)
      toast.error(language === 'hi' ? 'उत्पाद लोड नहीं हो सके' : 'Could not load products')
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    loadProducts()
    loadBannerConfig()
  }, [loadProducts, loadBannerConfig])

  // Scroll to popular products
  const scrollToProducts = () => {
    const el = document.getElementById('popularSection')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle Hero Search
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(heroSearchInput.trim())
    scrollToProducts()
  }

  // Open Quick Modal
  const handleOpenQuickModal = (product: Product) => {
    setQuickProduct(product)
    setQuickModalOpen(true)
  }

  // Open Edit Banner Dialog
  const handleOpenEditBanner = () => {
    setFormBannerTagline(banner.tagline)
    setFormBannerTitle(banner.title)
    setFormBannerHighlighted(banner.highlightedWord)
    setFormBannerDescription(banner.description)
    setFormBannerImageUrl(banner.imageUrl)
    setFormBannerBadgeCat(banner.badgeCategory)
    setFormBannerBadgeTitle(banner.badgeTitle)
    setFormBannerBadgeEmoji(banner.badgeEmoji)
    setEditBannerOpen(true)
  }

  // Save Banner Config
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBanner(true)
    try {
      const payload: BannerConfig = {
        tagline: formBannerTagline.trim() || DEFAULT_BANNER.tagline,
        title: formBannerTitle.trim() || DEFAULT_BANNER.title,
        highlightedWord: formBannerHighlighted.trim() || DEFAULT_BANNER.highlightedWord,
        description: formBannerDescription.trim() || DEFAULT_BANNER.description,
        imageUrl: formBannerImageUrl.trim() || DEFAULT_BANNER.imageUrl,
        badgeCategory: formBannerBadgeCat.trim() || DEFAULT_BANNER.badgeCategory,
        badgeTitle: formBannerBadgeTitle.trim() || DEFAULT_BANNER.badgeTitle,
        badgeEmoji: formBannerBadgeEmoji.trim() || DEFAULT_BANNER.badgeEmoji,
      }

      const res = await fetch('/api/store/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success && data.banner) {
        setBanner(data.banner)
        toast.success(
          language === 'hi'
            ? 'स्टोर बैनर सफलतापूर्वक अपडेट हो गया!'
            : 'Hero banner updated successfully!'
        )
        setEditBannerOpen(false)
      } else {
        throw new Error('Failed to update banner')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving banner')
    } finally {
      setSavingBanner(false)
    }
  }

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = currentFilter === 'all' || p.category === currentFilter
      const s = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !s ||
        p.title.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s)) ||
        (p.category && p.category.toLowerCase().includes(s))
      return matchesCategory && matchesSearch
    })
  }, [products, currentFilter, searchQuery])

  // Helper to get cart quantity for a product
  const getCartQty = (productId: string) => {
    const found = items.find((i) => i.product_id === productId)
    return found ? found.quantity : 0
  }

  // Banner display strings (localized if default banner)
  const isDefaultBanner = banner.title === DEFAULT_BANNER.title
  const displayTagline = isDefaultBanner && language === 'hi' ? t('heroTagline') : banner.tagline
  const displayTitle = isDefaultBanner && language === 'hi' ? t('heroTitleStart') : banner.title
  const displayHighlighted =
    isDefaultBanner && language === 'hi' ? t('heroTitleHighlight') : banner.highlightedWord
  const displayDescription =
    isDefaultBanner && language === 'hi' ? t('heroDescription') : banner.description
  const displayBadgeCat =
    isDefaultBanner && language === 'hi' ? t('badgeHighEfficiency') : banner.badgeCategory
  const displayBadgeTitle =
    isDefaultBanner && language === 'hi' ? t('badgePeakYield') : banner.badgeTitle

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-8">
      {/* ================= 1. HERO BANNER ================= */}
      <section className="bg-gradient-to-r from-[#eaf6ec] via-[#f1f9f2] to-[#e4f3e7] rounded-2xl p-6 sm:p-8 md:p-10 border border-emerald-100 relative overflow-hidden group">
        {/* Background motif */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

        {/* Top Action Bar in Hero: Quick Language Switcher & Edit Banner Button */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Prominent Hero Language Switch Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-bold shadow-xs border border-emerald-300 backdrop-blur-xs transition hover:text-[#0b7b3e] cursor-pointer"
            title="Toggle English / हिंदी"
          >
            <Languages className="w-3.5 h-3.5 text-[#0b7b3e]" />
            <span>{language === 'hi' ? 'English में देखें' : 'हिंदी में देखें (Hindi)'}</span>
          </button>

          {/* Quick Edit Banner Button */}
          <button
            onClick={handleOpenEditBanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 hover:bg-white text-slate-700 text-xs font-semibold shadow-xs border border-emerald-200/80 backdrop-blur-xs transition hover:text-[#0b7b3e] cursor-pointer"
            title="Change banner title, image, and description"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#0b7b3e]" />
            <span className="hidden sm:inline">Edit Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-[#086331]">
              <span>{displayTagline}</span>
            </div>

            <h1 className="font-extrabold text-2xl sm:text-4xl lg:text-[42px] tracking-tight text-slate-900 leading-[1.18]">
              {displayTitle} <br className="hidden sm:inline" />
              <span className="text-[#0b7b3e]">{displayHighlighted}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg font-normal leading-relaxed">
              {displayDescription}
            </p>

            {/* Embedded Search / CTA */}
            <form onSubmit={handleHeroSearch} className="pt-2 max-w-md">
              <div className="bg-white p-1 rounded-full shadow-xs border border-slate-200/80 flex items-center">
                <Search className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  placeholder={t('heroSearchPlaceholder', 'Search cattle feed, urea, sprayers...')}
                  className="w-full text-xs text-slate-700 outline-none pr-2 bg-transparent"
                />
                <button
                  type="submit"
                  className="bg-[#0b7b3e] hover:bg-[#086331] text-white text-xs font-semibold px-4 py-2 rounded-full transition flex items-center gap-1 shadow-xs flex-shrink-0 cursor-pointer"
                >
                  <span>{t('searchBtn', 'Search')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Feature badges row */}
            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 text-[11px] font-medium border-t border-emerald-200/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0b7b3e]" />
                <span>{language === 'hi' ? '100% असली उत्पाद' : '100% Genuine'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#0b7b3e]" />
                <span>{language === 'hi' ? 'गाँव तक डिलीवरी' : 'Doorstep Delivery'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0b7b3e]" />
                <span>{language === 'hi' ? 'कैश ऑन डिलीवरी' : 'Secure UPI / COD'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[#0b7b3e]" />
                <span>{language === 'hi' ? 'किसान सहायता' : 'Easy Support'}</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Collage */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-white/80 bg-white">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    ;(e.target as any).src =
                      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
                  }}
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -left-3 bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#0b7b3e] flex items-center justify-center font-bold text-xs">
                  {banner.badgeEmoji}
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400">{displayBadgeCat}</div>
                  <div className="text-xs font-bold text-slate-800">{displayBadgeTitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. SHOP BY CATEGORY ================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">
            {t('shopByCategory', 'Shop by Category')}
          </h2>
          <button
            onClick={() => {
              setCurrentFilter('all')
              setSearchQuery('')
              scrollToProducts()
            }}
            className="text-xs font-bold text-[#0b7b3e] hover:text-[#086331] flex items-center gap-1 cursor-pointer"
          >
            <span>{t('viewAll', 'View All')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Grid: 8 rounded pastel cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {/* Cat 1 */}
          <div
            onClick={() => {
              setCurrentFilter('cattle-feed')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-emerald-50/60 p-3 rounded-xl border border-slate-100 hover:border-emerald-500/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#f0f9f1] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🐄</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#0b7b3e] leading-tight">
              {t('cat1Title', 'Cattle Feed & Mash')}
            </span>
          </div>

          {/* Cat 2 */}
          <div
            onClick={() => {
              setCurrentFilter('cattle-feed')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-blue-50/60 p-3 rounded-xl border border-slate-100 hover:border-blue-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#f0f7ff] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🥛</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 leading-tight">
              {t('cat2Title', 'Dairy Calcium & Minerals')}
            </span>
          </div>

          {/* Cat 3 */}
          <div
            onClick={() => {
              setCurrentFilter('seeds-fert')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-amber-50/60 p-3 rounded-xl border border-slate-100 hover:border-amber-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#fef9ee] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🌾</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-amber-700 leading-tight">
              {t('cat3Title', 'Certified Hybrid Seeds')}
            </span>
          </div>

          {/* Cat 4 */}
          <div
            onClick={() => {
              setCurrentFilter('seeds-fert')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-green-50/60 p-3 rounded-xl border border-slate-100 hover:border-green-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#f1fbf3] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🌱</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-green-700 leading-tight">
              {t('cat4Title', 'Bio Fertilizers & NPK')}
            </span>
          </div>

          {/* Cat 5 */}
          <div
            onClick={() => {
              setCurrentFilter('agri-tools')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-orange-50/60 p-3 rounded-xl border border-slate-100 hover:border-orange-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#fff4ec] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🚜</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-orange-700 leading-tight">
              {t('cat5Title', 'Sprayers & Farm Tools')}
            </span>
          </div>

          {/* Cat 6 */}
          <div
            onClick={() => {
              setCurrentFilter('agri-tools')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-cyan-50/60 p-3 rounded-xl border border-slate-100 hover:border-cyan-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#effafb] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">⚙️</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-cyan-700 leading-tight">
              {t('cat6Title', 'Blades & Hardware')}
            </span>
          </div>

          {/* Cat 7 */}
          <div
            onClick={() => {
              setCurrentFilter('home-kitchen')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-rose-50/60 p-3 rounded-xl border border-slate-100 hover:border-rose-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#fff1f2] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🍳</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-rose-700 leading-tight">
              {t('cat7Title', 'Home & Kitchen Utensils')}
            </span>
          </div>

          {/* Cat 8 */}
          <div
            onClick={() => {
              setCurrentFilter('cattle-feed')
              scrollToProducts()
            }}
            className="group cursor-pointer bg-white hover:bg-purple-50/60 p-3 rounded-xl border border-slate-100 hover:border-purple-400/40 text-center transition flex flex-col items-center justify-center shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#faf5ff] flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <span className="text-2xl">🩺</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-purple-700 leading-tight">
              {t('cat8Title', 'Veterinary & Care')}
            </span>
          </div>
        </div>
      </section>

      {/* ================= 3. POPULAR PRODUCTS (5-Column Compact Grid) ================= */}
      <section id="popularSection" className="pt-2">
        {/* Header & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/70 gap-3">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">
              {t('popularProducts', 'Popular Products')}
            </h2>
            {searchQuery && (
              <p className="text-xs text-slate-500 mt-0.5">
                {t('showingResultsFor', 'Showing results for')} "
                <strong className="text-slate-800">{searchQuery}</strong>" (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#0b7b3e] hover:underline"
                >
                  {t('clearSearch', 'Clear search')}
                </button>
                )
              </p>
            )}
          </div>

          {/* Compact Category Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-xs">
            {categoryPills.map((pill) => {
              const active = currentFilter === pill.id
              return (
                <button
                  key={pill.id}
                  onClick={() => setCurrentFilter(pill.id)}
                  className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0b7b3e] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 5-Column Compact Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b7b3e]" />
            <p className="text-xs">{t('loadingProducts', 'Loading farm essentials...')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 mt-4 space-y-2">
            <PackageSearch className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">
              {t('noProductsFound', 'No essentials found')}
            </h4>
            <p className="text-xs text-slate-500">
              {t('noProductsDesc', 'Try a different search keyword or change category filters.')}
            </p>
            <button
              onClick={() => {
                setCurrentFilter('all')
                setSearchQuery('')
              }}
              className="mt-3 px-3.5 py-1.5 bg-[#0b7b3e] hover:bg-[#086331] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {t('viewAll', 'View All Products')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 pt-4">
            {filteredProducts.map((p) => {
              const qty = getCartQty(p.id)
              const item = translateProduct(p)
              const firstImage =
                item.images?.[0] ||
                'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80'

              return (
                <div
                  key={p.id}
                  className="product-card bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200 transition-all duration-200 p-2.5 sm:p-3 flex flex-col justify-between group"
                >
                  {/* Top Image Area */}
                  <div className="relative bg-slate-50/80 rounded-lg p-2 flex items-center justify-center overflow-hidden h-32 sm:h-36">
                    {/* Floating Badge */}
                    {item.badge && (
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs z-10 ${
                          item.badge_color || 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Wishlist Heart */}
                    <button
                      onClick={() =>
                        toast.success(
                          language === 'hi'
                            ? `"${item.title}" को विशलिस्ट में सुरक्षित किया गया!`
                            : `Saved "${item.title}" to Wishlist!`
                        )
                      }
                      className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition p-1 z-10 cursor-pointer"
                      title="Add to Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>

                    {/* Product Image */}
                    <img
                      src={firstImage}
                      alt={item.title}
                      onClick={() => handleOpenQuickModal(p)}
                      className="card-product-img max-h-full max-w-full object-contain cursor-pointer transition-transform duration-250 group-hover:scale-105"
                      onError={(e) => {
                        ;(e.target as any).src = 'https://placehold.co/300x300/f8fafc/0b7b3e?text=Jatrra'
                      }}
                    />
                  </div>

                  {/* Card Content Details */}
                  <div className="pt-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title */}
                      <h4
                        onClick={() => handleOpenQuickModal(p)}
                        className="font-bold text-xs sm:text-[13px] text-slate-900 group-hover:text-[#0b7b3e] transition cursor-pointer line-clamp-1 leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </h4>

                      {/* Pack / Weight Size */}
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {item.weight || t('standardPack', 'Standard Pack')}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                        <span>★</span>
                        <span className="text-slate-800">{item.rating || 4.8}</span>
                        <span className="text-slate-400 font-normal text-[10px]">
                          ({item.reviews || 120})
                        </span>
                      </div>
                    </div>

                    {/* Price & Add to Cart button */}
                    <div className="mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{item.price.toFixed(2)}
                        </span>
                        {item.original_price && item.original_price > item.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{item.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {qty > 0 ? (
                        <div className="w-full flex items-center justify-between bg-emerald-50 rounded-lg p-1 border border-emerald-200">
                          <button
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-6 h-6 rounded bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-emerald-800">{qty}</span>
                          <button
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-6 h-6 rounded bg-[#0b7b3e] text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addItem(item)
                            toast.success(
                              language === 'hi'
                                ? `"${item.title}" कार्ट में जोड़ा गया`
                                : `Added "${item.title}" to cart`
                            )
                          }}
                          className="w-full py-1.5 bg-[#0b7b3e] hover:bg-[#086331] active:scale-[0.98] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{t('addToCart', 'Add to Cart')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ================= 4. THREE PROMOTIONAL BANNER CARDS (Placed below products) ================= */}
      <section id="promoSection" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Promo 1: Light Green Banner */}
        <div className="bg-gradient-to-br from-[#dff2e3] to-[#eaf7ee] rounded-2xl p-5 border border-emerald-200/60 flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2 z-10 max-w-[65%]">
            <span className="text-[10px] font-extrabold text-[#086331] uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full">
              {t('promo1Badge', 'High Protein')}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
              {t('promo1Title', 'Cattle Feed Premix')} <br />
              <span className="text-[#086331] font-extrabold">{t('promo1Subtitle', 'Up to 25% Off')}</span>
            </h3>
            <button
              onClick={() => {
                setCurrentFilter('cattle-feed')
                scrollToProducts()
              }}
              className="bg-[#0b7b3e] hover:bg-[#086331] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>{t('shopNow', 'Shop Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center text-4xl shadow-xs flex-shrink-0 group-hover:scale-110 transition duration-300">
            🐄
          </div>
        </div>

        {/* Promo 2: Warm Orange Banner */}
        <div className="bg-gradient-to-br from-[#fde6ce] to-[#fef0e3] rounded-2xl p-5 border border-amber-200/70 flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2 z-10 max-w-[65%]">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full">
              {t('promo2Badge', 'Daily Essentials')}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
              {t('promo2Title', 'Dairy Calcium Boosters')} <br />
              <span className="text-amber-700 font-extrabold">{t('promo2Subtitle', 'Better Milk Yield')}</span>
            </h3>
            <button
              onClick={() => {
                setCurrentFilter('cattle-feed')
                scrollToProducts()
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>{t('shopNow', 'Shop Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center text-4xl shadow-xs flex-shrink-0 group-hover:scale-110 transition duration-300">
            🥛
          </div>
        </div>

        {/* Promo 3: Dark Slate/Teal Banner */}
        <div className="bg-gradient-to-br from-[#1e3a34] to-[#142e27] text-white rounded-2xl p-5 border border-slate-700 flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2 z-10 max-w-[65%]">
            <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider bg-emerald-900/80 px-2 py-0.5 rounded-full">
              {t('promo3Badge', 'Certified Seeds')}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug">
              {t('promo3Title', 'High-Yield Hybrid Seeds')} <br />
              <span className="text-emerald-400 font-extrabold">{t('promo3Subtitle', 'Pure & Natural')}</span>
            </h3>
            <button
              onClick={() => {
                setCurrentFilter('seeds-fert')
                scrollToProducts()
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>{t('shopNow', 'Shop Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl shadow-xs flex-shrink-0 group-hover:scale-110 transition duration-300">
            🌾
          </div>
        </div>
      </section>

      {/* ================= 5. BOTTOM PROMO BANNER ================= */}
      <section className="bg-gradient-to-r from-[#09572c] via-[#0b7b3e] to-[#085e30] rounded-2xl p-6 sm:p-7 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md overflow-hidden relative">
        <div className="space-y-1 text-center md:text-left z-10">
          <h3 className="font-extrabold text-xl sm:text-2xl">
            {t('bottomBannerTitle', 'Daily Fresh Farm Deals')}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md">
            {t(
              'bottomBannerDesc',
              'Save more on high-protein cattle feed, sprayer equipment & bulk certified hybrid seeds.'
            )}
          </p>
          <div className="pt-2">
            <button
              onClick={scrollToProducts}
              className="bg-white hover:bg-slate-100 text-[#0b7b3e] text-xs font-bold px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>{t('viewDeals', 'View Deals')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Discount Stamp Badge */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex flex-col items-center justify-center font-extrabold shadow-lg rotate-12">
            <span className="text-[9px] uppercase tracking-wide">
              {language === 'hi' ? 'तक' : 'Up to'}
            </span>
            <span className="text-xl sm:text-2xl -my-1 font-black">40%</span>
            <span className="text-[9px] uppercase tracking-wide">
              {language === 'hi' ? 'छूट' : 'OFF'}
            </span>
          </div>
        </div>
      </section>

      {/* ================= EDIT STORE BANNER MODAL ================= */}
      <Dialog open={editBannerOpen} onOpenChange={setEditBannerOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit3 className="w-5 h-5 text-[#0b7b3e]" />
              <span>Customize Storefront Banner</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Change the hero headline, highlighted text, description, and visual image. Changes apply immediately to your live storefront.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBanner} className="space-y-4 pt-2">
            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Small Tagline</label>
              <Input
                value={formBannerTagline}
                onChange={(e) => setFormBannerTagline(e.target.value)}
                placeholder="e.g. FRESH • RELIABLE • QUALITY"
                className="h-9 text-xs"
              />
            </div>

            {/* Main Headline & Highlighted Accent Word */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Headline Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formBannerTitle}
                  onChange={(e) => setFormBannerTitle(e.target.value)}
                  placeholder="e.g. Farm & Rural Essentials Delivered to"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Highlighted Green Word(s) <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formBannerHighlighted}
                  onChange={(e) => setFormBannerHighlighted(e.target.value)}
                  placeholder="e.g. Your Doorstep"
                  required
                  className="h-9 text-xs font-bold text-[#0b7b3e]"
                />
              </div>
            </div>

            {/* Description Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Banner Description</label>
              <Textarea
                rows={3}
                value={formBannerDescription}
                onChange={(e) => setFormBannerDescription(e.target.value)}
                placeholder="Shop lab-verified cattle feed, high-yield hybrid seeds, bio-fertilizers..."
                className="text-xs"
              />
            </div>

            {/* Image URL & Presets */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#0b7b3e]" />
                  <span>Banner Image URL</span>
                </label>
                <span className="text-[10px] text-slate-400">High-resolution photo</span>
              </div>

              <Input
                value={formBannerImageUrl}
                onChange={(e) => setFormBannerImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-9 text-xs bg-white"
              />

              {/* Presets */}
              <div className="pt-1.5 space-y-1">
                <span className="text-[10px] font-medium text-slate-500">
                  Quick Agriculture Presets:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {BANNER_IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setFormBannerImageUrl(p.url)
                        setFormBannerBadgeEmoji(p.emoji)
                        setFormBannerBadgeCat(p.badgeCat)
                        setFormBannerBadgeTitle(p.badgeTitle)
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                        formBannerImageUrl === p.url
                          ? 'bg-[#0b7b3e] text-white border-[#0b7b3e] font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>
                        {p.emoji} {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Thumbnail */}
              {formBannerImageUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <div className="w-20 h-14 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <img
                      src={formBannerImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block">Image Preview</span>
                    <span className="text-[10px] text-slate-400">
                      Aspect ratio 4:3 with rounded corners and floating badge
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Badge Settings */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Badge Emoji</label>
                <Input
                  value={formBannerBadgeEmoji}
                  onChange={(e) => setFormBannerBadgeEmoji(e.target.value)}
                  placeholder="🚜, 🌾, 🐄"
                  className="h-8 text-xs text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Top Label</label>
                <Input
                  value={formBannerBadgeCat}
                  onChange={(e) => setFormBannerBadgeCat(e.target.value)}
                  placeholder="e.g. High Efficiency"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Bottom Value</label>
                <Input
                  value={formBannerBadgeTitle}
                  onChange={(e) => setFormBannerBadgeTitle(e.target.value)}
                  placeholder="e.g. Peak Farm Yield"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditBannerOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingBanner}
                className="text-xs bg-[#0b7b3e] hover:bg-[#086331] text-white font-semibold"
              >
                {savingBanner ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                <span>Save Banner Changes</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= QUICK PREVIEW MODAL ================= */}
      <Dialog open={quickModalOpen} onOpenChange={setQuickModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          {quickProduct && (
            (() => {
              const item = translateProduct(quickProduct)
              return (
                <div>
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-[11px] font-bold text-[#0b7b3e] uppercase tracking-wider">
                      {item.category?.replace('-', ' ') || 'Farm Essential'}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row gap-5 items-center">
                    <div className="w-40 h-40 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1 text-left">
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.weight || t('standardPack', 'Standard Pack')}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          ★ {item.rating || 4.8}
                        </span>
                        <span className="text-slate-400">• {t('verifiedLabAssay', 'Verified Lab Assay')}</span>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-extrabold text-[#0b7b3e]">
                          ₹{item.price.toFixed(2)}
                        </span>
                        {item.original_price && item.original_price > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {item.description ||
                          (language === 'hi'
                            ? 'अधिकतम उपज एवं पशु स्वास्थ्य के लिए प्रीमियम गुणवत्ता वाला कृषि उत्पाद।'
                            : 'Premium quality agricultural formulation for maximum yield and livestock health.')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                    <Button
                      onClick={() => {
                        addItem(item)
                        setQuickModalOpen(false)
                        toast.success(
                          language === 'hi'
                            ? `"${item.title}" कार्ट में जोड़ा गया!`
                            : `Added "${item.title}" to cart!`
                        )
                      }}
                      className="flex-1 py-2.5 bg-[#0b7b3e] hover:bg-[#086331] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t('addToCart', 'Add to Cart')}</span>
                    </Button>
                  </div>
                </div>
              )
            })()
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function StoreCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b7b3e]" />
          <p className="text-sm font-medium">Loading store catalog...</p>
        </div>
      }
    >
      <StoreCatalogContent />
    </React.Suspense>
  )
}
