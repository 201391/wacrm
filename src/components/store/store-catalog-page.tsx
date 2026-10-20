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
  Languages,
  ChevronDown,
} from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import { useStoreLanguage } from '@/components/store/language-context'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { StoreBannerCarousel } from '@/components/store/store-banner-carousel'
import { PromoBannersSection } from '@/components/store/promo-banners-section'

const PAGE_SIZE = 10

function StoreCatalogContent() {
  const { items, addItem, updateQuantity } = useCart()
  const { t, language, toggleLanguage, translateProduct } = useStoreLanguage()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // Quick View Modal State
  const [quickProduct, setQuickProduct] = useState<Product | null>(null)
  const [quickModalOpen, setQuickModalOpen] = useState(false)

  // Handler for category filtering that resets visibleCount
  const handleCategoryFilter = useCallback((cat: string) => {
    setCurrentFilter(cat)
    setVisibleCount(PAGE_SIZE)
  }, [])

  // Sync category and search from URL searchParams
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    const urlSearch = searchParams.get('search')
    if (urlCategory) setCurrentFilter(urlCategory)
    if (urlSearch) setSearchQuery(urlSearch)
  }, [searchParams])

  // Reset visibleCount back to PAGE_SIZE whenever category or search filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [currentFilter, searchQuery])

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
  }, [loadProducts])

  // Scroll to popular products
  const scrollToProducts = () => {
    const el = document.getElementById('popularSection')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Open Quick Modal
  const handleOpenQuickModal = (product: Product) => {
    setQuickProduct(product)
    setQuickModalOpen(true)
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

  // Slice products to only display visibleCount (default 10)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMore = visibleCount < filteredProducts.length
  const remainingCount = Math.max(0, filteredProducts.length - visibleCount)

  // Helper to get cart quantity for a product
  const getCartQty = (productId: string) => {
    const found = items.find((i) => i.product_id === productId)
    return found ? found.quantity : 0
  }


  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-8">
      {/* ================= 1. MULTI-BANNER ROTATING CAROUSEL (2s INTERVAL) ================= */}
      <StoreBannerCarousel
        onCategoryFilter={(cat) => {
          handleCategoryFilter(cat)
          setSearchQuery('')
        }}
      />

      {/* ================= 2. SHOP BY CATEGORY ================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">
            {t('shopByCategory', 'Shop by Category')}
          </h2>
          <button
            onClick={() => {
              handleCategoryFilter('all')
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
              handleCategoryFilter('cattle-feed')
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
              handleCategoryFilter('cattle-feed')
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
              handleCategoryFilter('seeds-fert')
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
              handleCategoryFilter('seeds-fert')
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
              handleCategoryFilter('agri-tools')
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
              handleCategoryFilter('agri-tools')
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
              handleCategoryFilter('home-kitchen')
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
              handleCategoryFilter('cattle-feed')
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
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">
                {t('popularProducts', 'Popular Products')}
              </h2>
              {filteredProducts.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0b7b3e] border border-emerald-200/60">
                  {filteredProducts.length > PAGE_SIZE && visibleCount < filteredProducts.length
                    ? `${displayedProducts.length}/${filteredProducts.length}`
                    : filteredProducts.length}
                </span>
              )}
            </div>
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
                  onClick={() => handleCategoryFilter(pill.id)}
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
                handleCategoryFilter('all')
                setSearchQuery('')
              }}
              className="mt-3 px-3.5 py-1.5 bg-[#0b7b3e] hover:bg-[#086331] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {t('viewAll', 'View All Products')}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 pt-4">
              {displayedProducts.map((p) => {
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

            {/* Show More Products Pagination Controls */}
            {filteredProducts.length > PAGE_SIZE && (
              <div className="mt-8 pt-4 pb-2 flex flex-col items-center justify-center space-y-3">
                {/* Progress count & subtle visual bar */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-600">
                    {language === 'hi' ? (
                      <>
                        कुल <strong className="text-slate-900">{filteredProducts.length}</strong> में से{' '}
                        <strong className="text-[#0b7b3e]">{displayedProducts.length}</strong> उत्पाद प्रदर्शित
                      </>
                    ) : (
                      <>
                        Showing <strong className="text-[#0b7b3e]">{displayedProducts.length}</strong> of{' '}
                        <strong className="text-slate-900">{filteredProducts.length}</strong> products
                      </>
                    )}
                  </p>
                  {/* Visual progress bar */}
                  <div className="w-48 sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#0b7b3e] transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((displayedProducts.length / filteredProducts.length) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Buttons Container */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  {hasMore ? (
                    <>
                      <button
                        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="group px-6 py-2.5 bg-[#0b7b3e] hover:bg-[#086331] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {language === 'hi'
                            ? `और उत्पाद देखें (+${Math.min(PAGE_SIZE, remainingCount)})`
                            : `Show More Products (+${Math.min(PAGE_SIZE, remainingCount)})`}
                        </span>
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      </button>

                      {remainingCount > PAGE_SIZE && (
                        <button
                          onClick={() => setVisibleCount(filteredProducts.length)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                        >
                          {language === 'hi'
                            ? `सभी देखें (${filteredProducts.length})`
                            : `Show All (${filteredProducts.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          {language === 'hi'
                            ? `सभी ${filteredProducts.length} उत्पाद प्रदर्शित हैं`
                            : `Showing all ${filteredProducts.length} products`}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setVisibleCount(PAGE_SIZE)
                          scrollToProducts()
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-[#0b7b3e] underline transition cursor-pointer"
                      >
                        {language === 'hi' ? 'कम दिखाएं (शुरुआती 10)' : 'Show less (top 10)'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================= 4. THREE PROMOTIONAL BANNER CARDS (Placed below products) ================= */}
      <PromoBannersSection
        onCategoryFilter={(cat) => handleCategoryFilter(cat)}
        onScrollToProducts={scrollToProducts}
      />

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
