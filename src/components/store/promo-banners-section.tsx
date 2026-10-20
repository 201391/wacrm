'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ArrowRight, ShieldCheck, Sparkles, Edit3 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useStoreLanguage } from './language-context'
import {
  type PromoBannerCard,
  DEFAULT_PROMO_BANNERS,
  PROMO_THEME_STYLES,
} from '@/types/banner'
import { PromoBannersDialog } from './promo-banners-dialog'

interface PromoBannersSectionProps {
  onCategoryFilter?: (categoryId: string) => void
  onScrollToProducts?: () => void
}

export function PromoBannersSection({
  onCategoryFilter,
  onScrollToProducts,
}: PromoBannersSectionProps) {
  const { canEditSettings, isAdmin, isOwner } = useAuth()
  const isUserAdmin = Boolean(canEditSettings || isAdmin || isOwner)
  const { t, language } = useStoreLanguage()

  const [banners, setBanners] = useState<PromoBannerCard[]>(DEFAULT_PROMO_BANNERS)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch promo banners from config
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/store/banner')
      const data = await res.json()
      if (data.promoBanners && Array.isArray(data.promoBanners) && data.promoBanners.length > 0) {
        setBanners(data.promoBanners)
      }
    } catch (err) {
      console.warn('Failed loading promotional banners:', err)
    }
  }, [])

  useEffect(() => {
    fetchBanners()

    // Listen to real-time update events
    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setBanners(e.detail)
      } else {
        fetchBanners()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('wacrm:promobanners-updated', handleUpdate)
      return () => {
        window.removeEventListener('wacrm:promobanners-updated', handleUpdate)
      }
    }
  }, [fetchBanners])

  // Click on CTA button
  const handleCtaClick = (card: PromoBannerCard) => {
    if (card.linkUrl) {
      if (card.linkUrl.startsWith('#')) {
        const el = document.querySelector(card.linkUrl)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = card.linkUrl
      }
      return
    }

    if (card.categoryFilter) {
      onCategoryFilter?.(card.categoryFilter)
    }
    onScrollToProducts?.()
  }

  // Active banners only
  const activeBanners = banners.filter((b) => b.active !== false)
  if (activeBanners.length === 0) return null

  // Grid columns based on active count
  const gridColsClass =
    activeBanners.length === 1
      ? 'grid-cols-1 max-w-lg mx-auto'
      : activeBanners.length === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
      : 'grid-cols-1 md:grid-cols-3'

  return (
    <div className="relative">
      {/* Admin Floating Quick-Edit Bar */}
      {isUserAdmin && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-semibold border border-amber-400/50 shadow-sm backdrop-blur-md transition hover:scale-105 cursor-pointer"
            title="Admin: Edit & Manage these 3 Promotional Banners"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin: Edit 3 Promo Banners</span>
          </button>
        </div>
      )}

      {/* ================= THREE PROMOTIONAL BANNER CARDS ================= */}
      <section id="promoSection" className={`grid ${gridColsClass} gap-4`}>
        {activeBanners.map((card, idx) => {
          const theme = PROMO_THEME_STYLES[card.theme] || PROMO_THEME_STYLES.green

          // Fallback localized labels if using default presets
          const badgeText =
            card.badge ||
            (idx === 0
              ? t('promo1Badge', 'High Protein')
              : idx === 1
              ? t('promo2Badge', 'Daily Essentials')
              : t('promo3Badge', 'Certified Seeds'))

          const titleText =
            card.title ||
            (idx === 0
              ? t('promo1Title', 'Cattle Feed Premix')
              : idx === 1
              ? t('promo2Title', 'Dairy Calcium Boosters')
              : t('promo3Title', 'High-Yield Hybrid Seeds'))

          const subtitleText =
            card.subtitle ||
            (idx === 0
              ? t('promo1Subtitle', 'Up to 25% Off')
              : idx === 1
              ? t('promo2Subtitle', 'Better Milk Yield')
              : t('promo3Subtitle', 'Pure & Natural'))

          const ctaText = card.ctaText || t('shopNow', 'Shop Now')

          return (
            <div
              key={card.id || idx}
              className={`rounded-2xl p-5 border flex items-center justify-between overflow-hidden relative group transition-all duration-300 hover:shadow-md ${theme.container}`}
            >
              <div className="space-y-2 z-10 max-w-[65%]">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${theme.badge}`}
                >
                  {badgeText}
                </span>

                <h3 className={`font-extrabold text-base sm:text-lg leading-snug ${theme.title}`}>
                  {titleText} <br />
                  <span className={`font-extrabold ${theme.subtitle}`}>{subtitleText}</span>
                </h3>

                <button
                  onClick={() => handleCtaClick(card)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-xs cursor-pointer ${theme.button}`}
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Graphic Icon (Emoji or Image) */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xs flex-shrink-0 group-hover:scale-110 transition duration-300 overflow-hidden ${theme.iconBg}`}
              >
                {card.iconType === 'image' && card.icon ? (
                  <img
                    src={card.icon}
                    alt={titleText}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span>{card.icon || (idx === 0 ? '🐄' : idx === 1 ? '🥛' : '🌾')}</span>
                )}
              </div>
            </div>
          )
        })}
      </section>

      {/* Admin Dialog */}
      {isUserAdmin && (
        <PromoBannersDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={(newBanners) => setBanners(newBanners)}
        />
      )}
    </div>
  )
}
