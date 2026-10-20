'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  LayoutGrid,
  ChevronDown,
  MessageCircle,
  PhoneCall,
  LayoutDashboard,
  Languages,
} from 'lucide-react'
import { useCart } from './cart-context'
import { useStoreLanguage } from './language-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function StoreHeader() {
  const { openCart, totalCount, subtotal } = useCart()
  const { language, setLanguage, toggleLanguage, t } = useStoreLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [helplineOpen, setHelplineOpen] = useState(false)
  const [wishlistCount] = useState(2)

  const whatsappSupportUrl = `https://wa.me/918815356175?text=${encodeURIComponent(
    language === 'hi'
      ? 'नमस्ते जात्रा, मुझे ग्राहक सहायता चाहिए'
      : 'Hello Jatrra, I need customer support'
  )}`

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/?search=${encodeURIComponent(searchInput.trim())}#popularSection`)
    } else {
      router.push('/#popularSection')
    }
  }

  const handleCategoryClick = (cat: string) => {
    router.push(`/?category=${cat}#popularSection`)
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-2xs">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0b7b3e] flex items-center justify-center text-white shadow-sm shadow-emerald-700/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-tight">
                Jatrra<span className="text-[#0b7b3e]">.</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-wider -mt-1 uppercase">
                {t('brandTagline', 'Farm & Essentials')}
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <div className="relative w-full flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('searchPlaceholder', 'Search for cattle feed, fertilizers, hybrid seeds, tools, kitchen...')}
                className="w-full pl-4 pr-12 py-2 text-xs lg:text-sm bg-[#f1f5f9]/70 hover:bg-[#f1f5f9] focus:bg-white border border-slate-200 focus:border-[#0b7b3e] rounded-lg outline-none transition text-slate-800 placeholder:text-slate-400 shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 w-9 bg-[#0b7b3e] hover:bg-[#086331] text-white rounded-md flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Search products"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-4 text-slate-600 text-xs">
            {/* Prominent Bilingual Language Switcher Toggle */}
            <div
              className="flex items-center rounded-lg bg-emerald-50 border border-emerald-200/90 p-0.5 shadow-2xs"
              title="Change Language / भाषा बदलें"
            >
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${language === 'en'
                  ? 'bg-[#0b7b3e] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-800'
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-0.5 ${language === 'hi'
                  ? 'bg-[#0b7b3e] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-800'
                  }`}
              >
                <span>हिंदी</span>
              </button>
            </div>

            {/* Link back to CRM dashboard */}
            <Link
              href="/dashboard"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#0b7b3e]" />
              <span>{t('crmAdmin', 'CRM Admin')}</span>
            </Link>

            <button
              onClick={() =>
                toast.info(
                  language === 'hi'
                    ? `आपकी विशलिस्ट में ${wishlistCount} कृषि उत्पाद सुरक्षित हैं`
                    : `You have ${wishlistCount} saved agricultural items in your Wishlist`
                )
              }
              className="flex flex-col items-center gap-0.5 hover:text-[#0b7b3e] transition relative cursor-pointer"
            >
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-700" />
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </div>
              <span className="text-[11px] font-medium hidden sm:inline">{t('wishlist', 'Wishlist')}</span>
            </button>

            {/* WhatsApp Customer Support Button */}
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 text-emerald-700 hover:text-emerald-800 transition cursor-pointer group"
              title={language === 'hi' ? 'व्हाट्सएप ग्राहक सहायता' : 'WhatsApp Customer Support'}
            >
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-[#0b7b3e] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse ring-1 ring-white" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 hidden sm:inline whitespace-nowrap">
                {language === 'hi' ? 'कस्टमर सपोर्ट' : 'Support'}
              </span>
            </a>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:text-[#0b7b3e] transition group cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-800 group-hover:text-[#0b7b3e]" />
                <span className="absolute -top-1.5 -right-2 bg-[#0b7b3e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-medium">{t('myCart', 'My Cart')}</span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#0b7b3e] -mt-0.5">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar + Quick Language pill on mobile */}
        <div className="md:hidden px-4 pb-2.5">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search cattle feed, hybrid seeds, tools...')}
              className="w-full pl-3.5 pr-10 py-2 text-xs bg-[#f1f5f9]/80 focus:bg-white border border-slate-200 focus:border-[#0b7b3e] rounded-lg outline-none transition text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 w-8 bg-[#0b7b3e] text-white rounded-md flex items-center justify-center shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Secondary Nav Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs font-medium">
            {/* Left: Categories Dropdown button + Links */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto hide-scrollbar">
              {/* All Categories Dropdown button */}
              <div className="relative group flex-shrink-0">
                <button className="bg-[#0b7b3e] hover:bg-[#086331] text-white px-3 sm:px-3.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs shadow-xs cursor-pointer">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{t('allCategories', 'All Categories')}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover:block z-50">
                  <button
                    onClick={() => handleCategoryClick('cattle-feed')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2 text-slate-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {t('catCattleDairy', '🐄 Cattle & Dairy Feed')}
                  </button>
                  <button
                    onClick={() => handleCategoryClick('seeds-fert')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2 text-slate-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {t('catSeedsFertilizers', '🌾 Seeds & Fertilizers')}
                  </button>
                  <button
                    onClick={() => handleCategoryClick('agri-tools')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2 text-slate-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {t('catToolsSprayers', '🚜 Farm Tools & Sprayers')}
                  </button>
                  <button
                    onClick={() => handleCategoryClick('home-kitchen')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2 text-slate-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {t('catHomeKitchen', '🏡 Home & Kitchen Items')}
                  </button>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="flex items-center gap-4 sm:gap-5 text-slate-600 whitespace-nowrap">
                <Link href="/" className="text-[#0b7b3e] font-bold hover:text-emerald-800">
                  {t('navHome', 'Home')}
                </Link>
                <a href="#popularSection" className="hover:text-[#0b7b3e] transition">
                  {t('navShop', 'Shop')}
                </a>
                <a href="#promoSection" className="hover:text-[#0b7b3e] transition">
                  {t('navDeals', 'Deals')}
                </a>
                <button
                  onClick={() => handleCategoryClick('cattle-feed')}
                  className="hover:text-[#0b7b3e] transition cursor-pointer"
                >
                  {t('navLivestock', 'Livestock')}
                </button>
                <button
                  onClick={() => handleCategoryClick('seeds-fert')}
                  className="hover:text-[#0b7b3e] transition cursor-pointer"
                >
                  {t('navAgriculture', 'Agriculture')}
                </button>
                <button
                  onClick={() => setHelplineOpen(true)}
                  className="hover:text-[#0b7b3e] transition cursor-pointer flex items-center gap-1 text-emerald-700 font-semibold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('farmerHelpline', 'Farmer Helpline')}</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* FARMER HELPLINE DIALOG */}
      <Dialog open={helplineOpen} onOpenChange={setHelplineOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
          <div className="p-4 bg-[#0b7b3e] text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <h4 className="font-bold text-sm">{t('helplineTitle', 'Jatrra Farmer Helpline')}</h4>
            </div>
          </div>
          <div className="p-5 text-xs space-y-3.5">
            <p className="text-slate-600 leading-relaxed">
              {t(
                'helplineDesc',
                'Need veterinary advice, bulk cattle feed quote, or high-yield seed recommendations? Chat directly via WhatsApp with our senior agronomist.'
              )}
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 font-medium text-emerald-900 flex items-center justify-between">
              <span>📞 {language === 'hi' ? 'व्हाट्सएप हेल्पलाइन:' : 'WhatsApp Helpline:'}</span>
              <strong>+91 88153 56175</strong>
            </div>
            <a
              href={`https://wa.me/918815356175?text=${encodeURIComponent(
                language === 'hi'
                  ? 'नमस्ते जात्रा, मुझे कृषि एवं पशु आहार उत्पादों की जानकारी चाहिए'
                  : 'Hello Jatrra, I need assistance with Agri Products'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-xs text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('openWhatsAppChat', 'Open WhatsApp Chat')}</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>



      {/* Floating Mobile Cart Bar when items are in cart */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom duration-300">
          <button
            onClick={openCart}
            className="w-full bg-[#0b7b3e] hover:bg-[#086331] text-white rounded-2xl p-3.5 flex items-center justify-between shadow-xl shadow-emerald-950/30 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-xs">
                {totalCount}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">{t('viewCart', 'View Cart')}</div>
                <div className="text-[10px] text-emerald-100">
                  {t('whatsAppDirectOrder', 'WhatsApp Direct Order')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm">₹{subtotal.toFixed(2)}</span>
              <div className="w-6 h-6 rounded-full bg-white text-[#0b7b3e] flex items-center justify-center font-bold text-xs shadow-xs">
                →
              </div>
            </div>
          </button>
        </div>
      )}
    </>
  )
}
