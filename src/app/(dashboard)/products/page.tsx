'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Grid,
  List,
  UploadCloud,
  Check,
  X,
  Store,
  ShieldCheck,
  Tag,
  Edit3,
  Loader2,
  ArrowUp,
  ArrowDown,
  Sliders,
  FileSpreadsheet,
  FileText,
  Folder,
  Globe,
} from 'lucide-react'
import type { Product } from '@/types'
import type { StoreBannerSlide, PromoBannerCard } from '@/types/banner'
import { DEFAULT_PROMO_BANNERS, PROMO_THEME_STYLES } from '@/types/banner'
import { BANNER_PHOTO_PRESETS } from '@/components/store/store-banner-carousel'
import { PromoBannersDialog } from '@/components/store/promo-banners-dialog'
import { BulkImportModal } from '@/components/products/bulk-import-modal'
import { MediaPickerModal } from '@/components/media/media-picker-modal'
import { ProductSeoForm } from '@/components/products/product-seo-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

const CATEGORY_OPTIONS = [
  { value: 'cattle-feed', label: '🐄 Cattle & Dairy Feed' },
  { value: 'seeds-fert', label: '🌾 Seeds & Fertilizers' },
  { value: 'agri-tools', label: '🚜 Farm Tools & Sprayers' },
  { value: 'home-kitchen', label: '🏡 Home & Kitchen Essentials' },
]

const PRESET_IMAGES = [
  {
    label: 'Cattle Feed Pellets',
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    category: 'cattle-feed',
  },
  {
    label: 'Mineral Mixture Bucket',
    url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80',
    category: 'cattle-feed',
  },
  {
    label: 'Liquid Calcium Bottle',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    category: 'cattle-feed',
  },
  {
    label: 'Hybrid Mustard Seeds',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    category: 'seeds-fert',
  },
  {
    label: 'Bio Liquid Fertilizer',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    category: 'seeds-fert',
  },
  {
    label: 'Battery Knapsack Sprayer',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    category: 'agri-tools',
  },
  {
    label: 'Chaff Cutter Blades',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    category: 'agri-tools',
  },
  {
    label: 'Stainless Steel Milk Can',
    url: 'https://images.unsplash.com/photo-1585758855271-21b1920a8360?auto=format&fit=crop&w=600&q=80',
    category: 'cattle-feed',
  },
  {
    label: 'Heavy Cast Iron Kadhai',
    url: 'https://images.unsplash.com/photo-1584990347449-39955747cb98?auto=format&fit=crop&w=600&q=80',
    category: 'home-kitchen',
  },
  {
    label: 'Galvanized Grain Drum',
    url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80',
    category: 'home-kitchen',
  },
]

const BADGE_PRESETS = [
  { label: 'Best Seller', color: 'bg-amber-500 text-white' },
  { label: 'Organic', color: 'bg-emerald-600 text-white' },
  { label: 'High Yield', color: 'bg-blue-600 text-white' },
  { label: 'Certified', color: 'bg-emerald-600 text-white' },
  { label: 'Eco Bio', color: 'bg-emerald-700 text-white' },
  { label: 'Heavy Duty', color: 'bg-purple-600 text-white' },
  { label: 'Hardened', color: 'bg-slate-700 text-white' },
  { label: 'Food Grade', color: 'bg-blue-700 text-white' },
  { label: 'Pure Iron', color: 'bg-orange-600 text-white' },
  { label: 'Pest Proof', color: 'bg-slate-800 text-white' },
]

export default function ProductsDashboardPage() {
  const { account } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Edit / Create Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formCategory, setFormCategory] = useState('cattle-feed')
  const [formWeight, setFormWeight] = useState('')
  const [formPrice, setFormPrice] = useState<string>('')
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('')
  const [formStock, setFormStock] = useState<string>('50')
  const [formBadge, setFormBadge] = useState('')
  const [formBadgeColor, setFormBadgeColor] = useState('bg-amber-500 text-white')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([])
  const [formBrochureUrl, setFormBrochureUrl] = useState<string>('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  // SEO & Meta Settings State
  const [productTab, setProductTab] = useState<'general' | 'seo'>('general')
  const [formMetaTitle, setFormMetaTitle] = useState('')
  const [formMetaDescription, setFormMetaDescription] = useState('')
  const [formCanonicalUrl, setFormCanonicalUrl] = useState('')
  const [formKeywords, setFormKeywords] = useState<string[]>([])
  const [formOgTitle, setFormOgTitle] = useState('')
  const [formOgDescription, setFormOgDescription] = useState('')
  const [formOgImageUrl, setFormOgImageUrl] = useState('')
  const [formTwitterCard, setFormTwitterCard] = useState<'summary' | 'summary_large_image'>('summary_large_image')
  const [formNoIndex, setFormNoIndex] = useState(false)
  const [formNoFollow, setFormNoFollow] = useState(false)

  // Media Picker Dialog states
  const [productMainImagePickerOpen, setProductMainImagePickerOpen] = useState(false)
  const [productGalleryPickerOpen, setProductGalleryPickerOpen] = useState(false)
  const [productBrochurePickerOpen, setProductBrochurePickerOpen] = useState(false)
  const [productOgPickerOpen, setProductOgPickerOpen] = useState(false)
  const [bannerMediaPickerOpen, setBannerMediaPickerOpen] = useState(false)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Banner Customization State (Multi-Banner with 2-Second Rotation)
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)
  const [bannersList, setBannersList] = useState<StoreBannerSlide[]>([])
  const [bannerIntervalSec, setBannerIntervalSec] = useState(2)
  const [isAddingNewSlide, setIsAddingNewSlide] = useState(false)
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)

  // 3 Promotional Banners State
  const [promoBannersDialogOpen, setPromoBannersDialogOpen] = useState(false)
  const [promoBannersList, setPromoBannersList] = useState<PromoBannerCard[]>(DEFAULT_PROMO_BANNERS)

  // Bulk Import Modal State
  const [bulkImportOpen, setBulkImportOpen] = useState(false)

  // Slide Form Fields
  const [slideFormTitle, setSlideFormTitle] = useState('')
  const [slideFormSubtitle, setSlideFormSubtitle] = useState('')
  const [slideFormBadgeText, setSlideFormBadgeText] = useState('')
  const [slideFormBadgeEmoji, setSlideFormBadgeEmoji] = useState('🌾')
  const [slideFormImageUrl, setSlideFormImageUrl] = useState('')
  const [slideFormCategory, setSlideFormCategory] = useState('all')
  const [slideFormCtaText, setSlideFormCtaText] = useState('Shop Now')

  const fetchProducts = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/products?all=true')
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error('Failed to load products:', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const loadBannerConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/store/banner')
      const data = await res.json()
      if (data.banners && Array.isArray(data.banners)) {
        setBannersList(data.banners)
      }
      if (data.promoBanners && Array.isArray(data.promoBanners)) {
        setPromoBannersList(data.promoBanners)
      }
      if (data.intervalMs) {
        setBannerIntervalSec(Math.round(data.intervalMs / 1000) || 2)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    loadBannerConfig()

    const handlePromoUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setPromoBannersList(e.detail)
      } else {
        loadBannerConfig()
      }
    }
    window.addEventListener('wacrm:promobanners-updated', handlePromoUpdate)
    return () => window.removeEventListener('wacrm:promobanners-updated', handlePromoUpdate)
  }, [fetchProducts, loadBannerConfig])

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBanner(true)
    try {
      const res = await fetch('/api/store/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners: bannersList,
          intervalMs: Math.max(1, bannerIntervalSec) * 1000,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Storefront multiple banners updated successfully!')
        setBannerDialogOpen(false)
      } else {
        throw new Error(data.error || 'Failed to update banners')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update banners')
    } finally {
      setSavingBanner(false)
    }
  }

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setProductTab('general')
    setFormTitle('')
    setFormSlug('')
    setFormCategory('cattle-feed')
    setFormWeight('50 kg Pack')
    setFormPrice('999')
    setFormOriginalPrice('1299')
    setFormStock('50')
    setFormBadge('Best Seller')
    setFormBadgeColor('bg-amber-500 text-white')
    setFormImageUrl('https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80')
    setFormGalleryImages([])
    setFormBrochureUrl('')
    setFormDescription('')
    setFormIsActive(true)
    // SEO fields reset
    setFormMetaTitle('')
    setFormMetaDescription('')
    setFormCanonicalUrl('')
    setFormKeywords([])
    setFormOgTitle('')
    setFormOgDescription('')
    setFormOgImageUrl('')
    setFormTwitterCard('summary_large_image')
    setFormNoIndex(false)
    setFormNoFollow(false)
    setDialogOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setProductTab('general')
    setFormTitle(product.title)
    setFormSlug(product.slug)
    setFormCategory(product.category || 'cattle-feed')
    setFormWeight(product.weight || '')
    setFormPrice(String(product.price))
    setFormOriginalPrice(product.original_price ? String(product.original_price) : '')
    setFormStock(String(product.stock))
    setFormBadge(product.badge || '')
    setFormBadgeColor(product.badge_color || 'bg-amber-500 text-white')
    setFormImageUrl(product.images?.[0] || '')
    setFormGalleryImages(product.images && product.images.length > 1 ? product.images.slice(1) : [])
    setFormBrochureUrl(product.brochure_url || '')
    setFormDescription(product.description || '')
    setFormIsActive(product.is_active)
    // SEO fields hydrate
    setFormMetaTitle(product.meta_title || '')
    setFormMetaDescription(product.meta_description || '')
    setFormCanonicalUrl(product.canonical_url || '')
    setFormKeywords(Array.isArray(product.keywords) ? product.keywords : [])
    setFormOgTitle(product.og_title || '')
    setFormOgDescription(product.og_description || '')
    setFormOgImageUrl(product.og_image_url || '')
    setFormTwitterCard(product.twitter_card || 'summary_large_image')
    setFormNoIndex(Boolean(product.no_index))
    setFormNoFollow(Boolean(product.no_follow))
    setDialogOpen(true)
  }

  // Auto-slugify when typing title in create mode
  const handleTitleChange = (val: string) => {
    setFormTitle(val)
    if (!editingProduct) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setFormSlug(generated)
    }
  }

  // Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Product title is required')
      return
    }

    const priceNum = parseFloat(formPrice)
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price in ₹')
      return
    }

    const origPriceNum = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined
    const stockNum = parseInt(formStock, 10) || 0

    setSaving(true)
    try {
      const allImages = [
        formImageUrl.trim(),
        ...formGalleryImages.map((u) => u.trim()).filter(Boolean),
      ].filter(Boolean)

      const payload = {
        title: formTitle.trim(),
        slug: formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formCategory,
        weight: formWeight.trim() || undefined,
        price: priceNum,
        original_price: origPriceNum,
        stock: stockNum,
        badge: formBadge.trim() || undefined,
        badge_color: formBadgeColor,
        images: allImages.length > 0 ? allImages : [],
        brochure_url: formBrochureUrl.trim() || undefined,
        description: formDescription.trim(),
        is_active: formIsActive,
        // SEO & Meta Settings
        meta_title: formMetaTitle.trim() || undefined,
        meta_description: formMetaDescription.trim() || undefined,
        canonical_url: formCanonicalUrl.trim() || undefined,
        keywords: formKeywords,
        og_title: formOgTitle.trim() || undefined,
        og_description: formOgDescription.trim() || undefined,
        og_image_url: formOgImageUrl.trim() || undefined,
        twitter_card: formTwitterCard,
        no_index: formNoIndex,
        no_follow: formNoFollow,
      }

      if (editingProduct) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update product')
        }
        toast.success(`Updated "${formTitle}" successfully!`)
      } else {
        // Create
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create product')
        }
        toast.success(`Product "${formTitle}" added to catalog!`)
      }

      setDialogOpen(false)
      fetchProducts()
    } catch (err: any) {
      console.error('Error saving product:', err)
      toast.error(err.message || 'Error saving product')
    } finally {
      setSaving(false)
    }
  }

  // Toggle is_active
  const handleToggleActive = async (product: Product) => {
    const nextState = !product.is_active
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: nextState } : p))
    )

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      })
      if (!res.ok) throw new Error('Toggle failed')
      toast.success(
        `"${product.title}" is now ${nextState ? 'visible' : 'hidden'} on storefront.`
      )
    } catch (err) {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !nextState } : p))
      )
      toast.error('Failed to update product visibility')
    }
  }

  // Confirm and Execute Delete
  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product')
      }
      toast.success(`Deleted "${productToDelete.title}"`)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      fetchProducts()
    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      const s = search.toLowerCase().trim()
      if (s) {
        const matchesTitle = p.title.toLowerCase().includes(s)
        const matchesDesc = p.description?.toLowerCase().includes(s) || false
        const matchesSlug = p.slug.toLowerCase().includes(s)
        if (!matchesTitle && !matchesDesc && !matchesSlug) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter === 'active' && !p.is_active) return false
      if (statusFilter === 'inactive' && p.is_active) return false
      if (statusFilter === 'low_stock' && p.stock > 20) return false

      return true
    })
  }, [products, search, categoryFilter, statusFilter])

  // Metric stats
  const totalCount = products.length
  const activeCount = products.filter((p) => p.is_active).length
  const lowStockCount = products.filter((p) => p.stock <= 20).length
  const categoriesCount = new Set(products.map((p) => p.category).filter(Boolean)).size

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Product Catalog Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Add agricultural products, adjust prices, edit images, update stock, and control live storefront visibility.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10',
            })}
          >
            <Store className="w-4 h-4" />
            <span>View Live Store</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPromoBannersDialogOpen(true)}
            className="gap-1.5 text-xs text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 font-semibold shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Edit 3 Promo Banners</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setBannerDialogOpen(true)}
            className="gap-1.5 text-xs text-foreground hover:text-emerald-600"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hero Slider ({bannersList.length})</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={refreshing}
            className="gap-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkImportOpen(true)}
            className="gap-1.5 text-xs text-foreground hover:text-emerald-600 border-border shadow-2xs font-semibold cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bulk Import</span>
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Total Catalog</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalCount}</div>
          <div className="text-[11px] text-muted-foreground">Items in repository</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Live on Storefront</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <div className="text-[11px] text-muted-foreground">Customers can order</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Low / Restock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">{lowStockCount}</div>
          <div className="text-[11px] text-muted-foreground">Stock under 20 units</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Active Categories</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{categoriesCount}</div>
          <div className="text-[11px] text-muted-foreground">Feed, Seeds, Tools & Kitchen</div>
        </div>
      </div>

      {/* Featured 3 Promotional Banners Management Strip */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-teal-500/5 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <span>Storefront Featured Promotional Banners</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {promoBannersList.filter((b) => b.active !== false).length} Active
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                These three promo cards are featured prominently on the storefront directly under catalog products.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setPromoBannersDialogOpen(true)}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Manage 3 Banners</span>
          </Button>
        </div>

        {/* 3 Cards Mini Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {promoBannersList.map((card, idx) => {
            const theme = PROMO_THEME_STYLES[card.theme] || PROMO_THEME_STYLES.green
            return (
              <div
                key={card.id || idx}
                onClick={() => setPromoBannersDialogOpen(true)}
                className={`p-3 rounded-lg border transition hover:shadow-sm cursor-pointer flex items-center justify-between gap-2 ${theme.container} ${
                  card.active === false ? 'opacity-50 grayscale-50' : ''
                }`}
              >
                <div className="space-y-1 max-w-[70%]">
                  <span
                    className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full inline-block ${theme.badge}`}
                  >
                    {card.badge}
                  </span>
                  <div className={`font-extrabold text-xs leading-tight line-clamp-1 ${theme.title}`}>
                    {card.title}
                  </div>
                  <div className={`text-[10px] font-bold line-clamp-1 ${theme.subtitle}`}>
                    {card.subtitle}
                  </div>
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl ${theme.iconBg}`}
                >
                  {card.iconType === 'image' && card.icon ? (
                    <img src={card.icon} alt="" className="w-full h-full object-contain p-1 rounded-full" />
                  ) : (
                    <span>{card.icon}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description or slug..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Hidden Only</option>
            <option value="low_stock">Low Stock (≤ 20)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-input rounded-lg p-0.5 bg-background">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid cards view"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs">Loading product catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center space-y-3 bg-card/40">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/60" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">No products found</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {search || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'Get started by creating your first product.'}
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add New Product
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pack / Size</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Storefront</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => {
                const categoryLabel =
                  CATEGORY_OPTIONS.find((c) => c.value === p.category)?.label || p.category || 'General'

                return (
                  <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                    {/* Thumbnail Image */}
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-muted/60 border border-border/80 overflow-hidden flex items-center justify-center p-1">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              ;(e.target as any).src = 'https://placehold.co/100x100/f1f5f9/0b7b3e?text=Jatrra'
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/60" />
                        )}
                      </div>
                    </TableCell>

                    {/* Title & Badge */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            {p.title}
                          </span>
                          {p.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                p.badge_color || 'bg-amber-500 text-white'
                              }`}
                            >
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span>slug: /{p.slug}</span>
                          {p.rating && (
                            <span className="text-amber-500 font-medium">
                              ★ {p.rating} ({p.reviews || 0})
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">
                        {categoryLabel}
                      </span>
                    </TableCell>

                    {/* Pack/Weight */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {p.weight || 'Standard'}
                      </span>
                    </TableCell>

                    {/* Price in ₹ */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{p.price.toFixed(2)}
                        </span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            ₹{p.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.stock > 20
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : p.stock > 0
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </TableCell>

                    {/* Active toggle */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_active}
                          onCheckedChange={() => handleToggleActive(p)}
                        />
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {p.is_active ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(p)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit product details, images, price"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setProductToDelete(p)
                            setDeleteDialogOpen(true)
                          }}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const categoryLabel =
              CATEGORY_OPTIONS.find((c) => c.value === p.category)?.label || p.category || 'General'

            return (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/3] rounded-lg bg-muted/60 border border-border/80 overflow-hidden flex items-center justify-center p-3 mb-3">
                    {p.badge && (
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                          p.badge_color || 'bg-amber-500 text-white'
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          ;(e.target as any).src = 'https://placehold.co/200x200/f1f5f9/0b7b3e?text=Jatrra'
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
                    )}
                  </div>

                  <div className="text-[11px] text-muted-foreground font-medium mb-1">
                    {categoryLabel}
                  </div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.weight || 'Standard Pack'}</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{p.price.toFixed(2)}
                    </span>
                    {p.original_price && p.original_price > p.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{p.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/70 mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={() => handleToggleActive(p)}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {p.is_active ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(p)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setProductToDelete(p)
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>{editingProduct ? 'Edit Product Details' : 'Add New Agricultural Product'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingProduct
                ? 'Update images, prices, stock levels, and descriptive details for this product.'
                : 'Fill out the form below to publish a new farm or rural essential to the Jatrra storefront.'}
            </DialogDescription>
          </DialogHeader>

          {/* TABS SELECTOR */}
          <div className="flex border-b border-border -mt-1">
            <button
              type="button"
              onClick={() => setProductTab('general')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                productTab === 'general'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>General Information</span>
            </button>
            <button
              type="button"
              onClick={() => setProductTab('seo')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                productTab === 'seo'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>SEO & Meta Settings</span>
              {(formMetaTitle || formMetaDescription || formKeywords.length > 0 || formNoIndex || formNoFollow) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-4 pt-1">
            {productTab === 'general' ? (
              <div className="space-y-4">
                {/* Title & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Balanced Cattle Feed Pellets"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">URL Slug</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="balanced-cattle-feed-pellets"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Category & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pack Size / Weight</label>
                <Input
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  placeholder="e.g. 50 kg Pack, 5 Litre, 16L Tank"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Pricing (INR) & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="1249"
                    required
                    className="pl-7 h-9 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Original / MRP (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="1450"
                    className="pl-7 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Stock Inventory</label>
                <Input
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="45"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Badge & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Promotional Badge</label>
                  <span className="text-[10px] text-muted-foreground">e.g. Best Seller, Organic</span>
                </div>
                <Input
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="Best Seller, High Yield, Eco Bio..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Badge Color Style</label>
                <select
                  value={formBadgeColor}
                  onChange={(e) => setFormBadgeColor(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="bg-amber-500 text-white">Amber (Best Seller)</option>
                  <option value="bg-emerald-600 text-white">Green (Organic / Certified)</option>
                  <option value="bg-blue-600 text-white">Blue (High Yield / Dairy)</option>
                  <option value="bg-purple-600 text-white">Purple (Heavy Duty)</option>
                  <option value="bg-orange-600 text-white">Orange (Pure Iron)</option>
                  <option value="bg-slate-800 text-white">Dark Slate (Pest Proof)</option>
                </select>
              </div>
            </div>

            {/* Main Product Image & Presets */}
            <div className="space-y-2.5 p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Main Product Thumbnail</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProductMainImagePickerOpen(true)}
                  className="h-7 text-xs gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 self-start sm:self-auto font-semibold cursor-pointer"
                >
                  <Folder className="w-3 h-3" />
                  <span>Select from Media Library</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://... or choose from media library"
                  className="h-9 text-xs flex-1 bg-background"
                />
              </div>

              {/* Quick Image Presets */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Quick Agriculture Presets (Click to apply):
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormImageUrl(preset.url)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                        formImageUrl === preset.url
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-card hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Preview Thumbnail */}
              {formImageUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-background rounded-lg border border-border/80">
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-muted p-1 border border-border flex items-center justify-center">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        ;(e.target as any).src = 'https://placehold.co/100x100/f1f5f9/0b7b3e?text=Invalid'
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block">Main Thumbnail Selected</span>
                    <span className="text-[10px]">Displayed on store catalog cards & checkout</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Gallery Images */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Product Gallery Images ({formGalleryImages.length})</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProductGalleryPickerOpen(true)}
                  className="h-7 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add from Media Library</span>
                </Button>
              </div>

              {formGalleryImages.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  No additional gallery images added yet. Click &quot;Add from Media Library&quot; to pick multiple photos.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {formGalleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-background"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Brochure PDF Attachment */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Product Brochure & Specs (PDF)</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProductBrochurePickerOpen(true)}
                  className="h-7 text-xs gap-1.5 border-rose-500/40 text-rose-600 hover:bg-rose-500/10 font-semibold cursor-pointer"
                >
                  <Folder className="w-3 h-3" />
                  <span>Select Brochure PDF</span>
                </Button>
              </div>

              {formBrochureUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded bg-rose-500/10 text-rose-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground block truncate">
                        {formBrochureUrl.split('/').pop() || 'Product_Brochure.pdf'}
                      </span>
                      <a
                        href={formBrochureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        Preview attached PDF
                      </a>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormBrochureUrl('')}
                    className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                    title="Remove brochure"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Optional product specification sheet, nutritional formulation guide, or user manual PDF.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description & Technical Details</label>
              <Textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Nutritional bypass protein value, formulation, application guidelines, or village delivery details..."
                className="text-xs"
              />
            </div>

            {/* Storefront Active Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">
                  Publish to Live Storefront
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  When enabled, this product is immediately visible and orderable by customers at /store.
                </span>
              </div>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
        ) : (
          <ProductSeoForm
            productTitle={formTitle}
            productDescription={formDescription}
            productPrice={formPrice || 0}
            productFeaturedImage={formImageUrl}
            allProducts={products}
            currentProductId={editingProduct?.id}
            metaTitle={formMetaTitle}
            setMetaTitle={setFormMetaTitle}
            metaDescription={formMetaDescription}
            setMetaDescription={setFormMetaDescription}
            canonicalUrl={formCanonicalUrl}
            setCanonicalUrl={setFormCanonicalUrl}
            keywords={formKeywords}
            setKeywords={setFormKeywords}
            slug={formSlug}
            setSlug={setFormSlug}
            ogTitle={formOgTitle}
            setOgTitle={setFormOgTitle}
            ogDescription={formOgDescription}
            setOgDescription={setFormOgDescription}
            ogImageUrl={formOgImageUrl}
            setOgImageUrl={setFormOgImageUrl}
            twitterCard={formTwitterCard}
            setTwitterCard={setFormTwitterCard}
            noIndex={formNoIndex}
            setNoIndex={setFormNoIndex}
            noFollow={formNoFollow}
            setNoFollow={setFormNoFollow}
            onOpenMediaPicker={() => setProductOgPickerOpen(true)}
          />
        )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-base">
              <Trash2 className="w-5 h-5" />
              <span>Delete Product</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{' '}
              <strong className="text-foreground">"{productToDelete?.title}"</strong>? This will remove
              it from both the management dashboard and the customer storefront.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteProduct}
              disabled={deleting}
              className="text-xs"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* CUSTOMIZE BANNER DIALOG */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Edit3 className="w-5 h-5 text-emerald-600" />
                  <span>Customize Storefront Banners</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Manage the multiple banners that automatically rotate on the storefront every {bannerIntervalSec} seconds.
                </DialogDescription>
              </div>

              {/* Banner Type Tabs */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white shadow-2xs cursor-default"
                >
                  🖼️ Hero Slider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBannerDialogOpen(false)
                    setPromoBannersDialogOpen(true)
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md text-foreground hover:bg-background/80 transition cursor-pointer"
                >
                  🎯 3 Promo Cards
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Rotation Speed Setting */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rotation Interval (Seconds)</span>
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Storefront changes banners continuously. Standard setting is 2 seconds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[2, 3, 4, 5].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setBannerIntervalSec(sec)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      bannerIntervalSec === sec
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-card text-foreground hover:bg-muted border-border'
                    }`}
                  >
                    {sec}s {sec === 2 ? '(Default)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Editor / Form */}
            {(isAddingNewSlide || editingSlideId) && (
              <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAddingNewSlide ? 'Add New Banner' : 'Edit Banner'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewSlide(false)
                      setEditingSlideId(null)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Title</label>
                    <Input
                      value={slideFormTitle}
                      onChange={(e) => setSlideFormTitle(e.target.value)}
                      placeholder="e.g. Lab-Verified Cattle Feed"
                      className="h-8 text-xs bg-card"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Category Filter</label>
                    <select
                      value={slideFormCategory}
                      onChange={(e) => setSlideFormCategory(e.target.value)}
                      className="w-full h-8 text-xs bg-card border border-border rounded-md px-2 text-foreground outline-none"
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
                  <label className="text-[11px] font-semibold text-foreground">Subtitle</label>
                  <Input
                    value={slideFormSubtitle}
                    onChange={(e) => setSlideFormSubtitle(e.target.value)}
                    placeholder="e.g. Boost milk yield by up to 25% with certified formulation"
                    className="h-8 text-xs bg-card"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Emoji</label>
                    <Input
                      value={slideFormBadgeEmoji}
                      onChange={(e) => setSlideFormBadgeEmoji(e.target.value)}
                      placeholder="🐄"
                      className="h-8 text-xs bg-card text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Badge Label</label>
                    <Input
                      value={slideFormBadgeText}
                      onChange={(e) => setSlideFormBadgeText(e.target.value)}
                      placeholder="Dairy Special"
                      className="h-8 text-xs bg-card"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">CTA Button</label>
                    <Input
                      value={slideFormCtaText}
                      onChange={(e) => setSlideFormCtaText(e.target.value)}
                      placeholder="Shop Now"
                      className="h-8 text-xs bg-card"
                    />
                  </div>
                </div>

                {/* Image URL + Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Banner Media (Image or Background Video)</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBannerMediaPickerOpen(true)}
                      className="h-6 text-[10px] px-2 gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold cursor-pointer"
                    >
                      <Folder className="w-3 h-3" />
                      <span>Select from Media Library</span>
                    </Button>
                  </div>
                  <Input
                    value={slideFormImageUrl}
                    onChange={(e) => setSlideFormImageUrl(e.target.value)}
                    placeholder="https://... or choose from media library"
                    className="h-8 text-xs bg-card"
                  />

                  {/* Presets */}
                  <div className="pt-1">
                    <span className="text-[10px] font-medium text-muted-foreground block mb-1">
                      Quick Photo Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {BANNER_PHOTO_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setSlideFormImageUrl(p.url)
                            setSlideFormBadgeEmoji(p.emoji)
                            setSlideFormBadgeText(p.badgeText)
                            setSlideFormCategory(p.category)
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                            slideFormImageUrl === p.url
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-card hover:bg-muted text-foreground border-border'
                          }`}
                        >
                          <span>{p.emoji} {p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingNewSlide(false)
                      setEditingSlideId(null)
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!slideFormTitle.trim() || !slideFormImageUrl.trim()) {
                        toast.error('Title and Image URL required')
                        return
                      }
                      if (isAddingNewSlide) {
                        const newSlide: StoreBannerSlide = {
                          id: `banner-${Date.now()}`,
                          title: slideFormTitle.trim(),
                          subtitle: slideFormSubtitle.trim(),
                          badgeText: slideFormBadgeText.trim(),
                          badgeEmoji: slideFormBadgeEmoji.trim() || '🌾',
                          imageUrl: slideFormImageUrl.trim(),
                          categoryFilter: slideFormCategory,
                          ctaText: slideFormCtaText.trim() || 'Shop Now',
                          active: true,
                        }
                        setBannersList((prev) => [...prev, newSlide])
                        setIsAddingNewSlide(false)
                        toast.success('Slide added to list')
                      } else if (editingSlideId) {
                        setBannersList((prev) =>
                          prev.map((b) =>
                            b.id === editingSlideId
                              ? {
                                  ...b,
                                  title: slideFormTitle.trim(),
                                  subtitle: slideFormSubtitle.trim(),
                                  badgeText: slideFormBadgeText.trim(),
                                  badgeEmoji: slideFormBadgeEmoji.trim() || '🌾',
                                  imageUrl: slideFormImageUrl.trim(),
                                  categoryFilter: slideFormCategory,
                                  ctaText: slideFormCtaText.trim() || 'Shop Now',
                                }
                              : b
                          )
                        )
                        setEditingSlideId(null)
                        toast.success('Slide updated')
                      }
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>{isAddingNewSlide ? 'Add to Banners' : 'Update Slide'}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Configured Banners List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configured Banners ({bannersList.length})</span>
                </span>
                {!isAddingNewSlide && !editingSlideId && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsAddingNewSlide(true)
                      setEditingSlideId(null)
                      setSlideFormTitle('Seasonal Farm Essential Offer')
                      setSlideFormSubtitle('Special discount on rural and agricultural supplies')
                      setSlideFormBadgeText('Kisan Deal')
                      setSlideFormBadgeEmoji('🌾')
                      setSlideFormImageUrl(BANNER_PHOTO_PRESETS[0].url)
                      setSlideFormCategory('cattle-feed')
                      setSlideFormCtaText('Shop Now')
                    }}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Banner Slide</span>
                  </Button>
                )}
              </div>

              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
                {bannersList.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className={`p-3 flex items-center justify-between gap-3 transition ${
                      slide.active === false ? 'opacity-60 bg-muted/40' : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-16 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <img
                          src={slide.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground truncate">
                            {slide.badgeEmoji} {slide.title}
                          </span>
                          {slide.badgeText && (
                            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {slide.badgeText}
                            </span>
                          )}
                          {slide.active === false && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{slide.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setBannersList((prev) =>
                            prev.map((b) =>
                              b.id === slide.id ? { ...b, active: b.active === false ? true : false } : b
                            )
                          )
                        }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground transition"
                        title={slide.active === false ? 'Enable' : 'Hide'}
                      >
                        {slide.active === false ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...bannersList]
                          const temp = updated[idx]
                          updated[idx] = updated[idx - 1]
                          updated[idx - 1] = temp
                          setBannersList(updated)
                        }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === bannersList.length - 1}
                        onClick={() => {
                          const updated = [...bannersList]
                          const temp = updated[idx]
                          updated[idx] = updated[idx + 1]
                          updated[idx + 1] = temp
                          setBannersList(updated)
                        }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlideId(slide.id)
                          setIsAddingNewSlide(false)
                          setSlideFormTitle(slide.title || '')
                          setSlideFormSubtitle(slide.subtitle || '')
                          setSlideFormBadgeText(slide.badgeText || '')
                          setSlideFormBadgeEmoji(slide.badgeEmoji || '🌾')
                          setSlideFormImageUrl(slide.imageUrl || '')
                          setSlideFormCategory(slide.categoryFilter || 'all')
                          setSlideFormCtaText(slide.ctaText || 'Shop Now')
                        }}
                        className="px-2 py-1 rounded text-xs font-semibold hover:bg-muted text-foreground"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (bannersList.length <= 1) {
                            toast.error('Must keep at least 1 banner')
                            return
                          }
                          setBannersList((prev) => prev.filter((b) => b.id !== slide.id))
                        }}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBannerDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={savingBanner}
              onClick={handleSaveBanner}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {savingBanner ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Check className="w-3.5 h-3.5 mr-1" />
              )}
              <span>Save Banner Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3 PROMOTIONAL BANNERS MANAGEMENT DIALOG */}
      <PromoBannersDialog
        open={promoBannersDialogOpen}
        onOpenChange={setPromoBannersDialogOpen}
        onSaved={(updated) => setPromoBannersList(updated)}
      />

      {/* BULK IMPORT MODAL (CSV & GOOGLE SHEETS) */}
      <BulkImportModal
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImportComplete={fetchProducts}
      />

      {/* MEDIA PICKER: MAIN PRODUCT THUMBNAIL */}
      <MediaPickerModal
        open={productMainImagePickerOpen}
        onOpenChange={setProductMainImagePickerOpen}
        allowedTypes={['image']}
        defaultCategory="products"
        title="Select Product Thumbnail Image"
        description="Pick a product image from the Media Library or upload a new one directly."
        currentValue={formImageUrl}
        onSelect={(_item, url) => {
          const finalUrl = Array.isArray(url) ? url[0] : url
          if (finalUrl) setFormImageUrl(finalUrl)
        }}
      />

      {/* MEDIA PICKER: PRODUCT GALLERY IMAGES (MULTI-SELECT) */}
      <MediaPickerModal
        open={productGalleryPickerOpen}
        onOpenChange={setProductGalleryPickerOpen}
        allowedTypes={['image']}
        defaultCategory="products"
        multiple={true}
        title="Add Gallery Photos from Media Library"
        description="Select multiple images to appear in the product gallery carousel."
        onSelect={(_items, urls) => {
          const newUrls = Array.isArray(urls) ? urls : [urls]
          setFormGalleryImages((prev) => Array.from(new Set([...prev, ...newUrls])))
        }}
      />

      {/* MEDIA PICKER: PRODUCT BROCHURE PDF */}
      <MediaPickerModal
        open={productBrochurePickerOpen}
        onOpenChange={setProductBrochurePickerOpen}
        allowedTypes={['pdf', 'document']}
        defaultCategory="brochures"
        title="Select Product Brochure PDF"
        description="Select a product brochure, user manual, or technical formulation PDF."
        currentValue={formBrochureUrl}
        onSelect={(_item, url) => {
          const finalUrl = Array.isArray(url) ? url[0] : url
          if (finalUrl) setFormBrochureUrl(finalUrl)
        }}
      />

      {/* MEDIA PICKER: HERO SLIDER BANNER MEDIA */}
      <MediaPickerModal
        open={bannerMediaPickerOpen}
        onOpenChange={setBannerMediaPickerOpen}
        allowedTypes={['image', 'video']}
        defaultCategory="banners"
        title="Select Banner Media from Library"
        description="Choose a desktop/mobile banner image or background video loop from existing media assets."
        currentValue={slideFormImageUrl}
        onSelect={(_item, url) => {
          const finalUrl = Array.isArray(url) ? url[0] : url
          if (finalUrl) setSlideFormImageUrl(finalUrl)
        }}
      />

      {/* MEDIA PICKER: OPEN GRAPH / SOCIAL IMAGE */}
      <MediaPickerModal
        open={productOgPickerOpen}
        onOpenChange={setProductOgPickerOpen}
        allowedTypes={['image']}
        defaultCategory="products"
        title="Select Social Share / Open Graph Image"
        description="Choose a high-resolution 1200x630 banner image for WhatsApp and social link unfurling."
        currentValue={formOgImageUrl}
        onSelect={(_item, url) => {
          const finalUrl = Array.isArray(url) ? url[0] : url
          if (finalUrl) setFormOgImageUrl(finalUrl)
        }}
      />
    </div>
  )
}
