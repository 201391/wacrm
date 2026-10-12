'use client'

import React from 'react'
import { useCart } from './cart-context'
import { useStoreLanguage } from './language-context'
import {
  X,
  Trash2,
  ShoppingBag,
  MessageCircle,
  Truck,
  Check,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    removeItem,
    updateQuantity,
    checkoutOnWhatsApp,
    isCheckingOut,
    clearCart,
  } = useCart()

  const { t, language } = useStoreLanguage()

  if (!isOpen) return null

  const handleDirectCheckout = () => {
    if (items.length === 0) {
      toast.error(language === 'hi' ? 'आपकी कार्ट खाली है!' : 'Cart is empty!')
      return
    }
    toast.success(
      language === 'hi'
        ? 'कैश ऑन डिलीवरी / यूपीआई गेटवे पर रीडायरेक्ट कर रहे हैं...'
        : 'Redirecting to Cash on Delivery / UPI gateway...'
    )
    setTimeout(() => {
      toast.success(
        language === 'hi'
          ? 'ऑर्डर सफलतापूर्वक दर्ज हो गया! हम जल्द ही आपके गाँव के पते पर भेजेंगे।'
          : 'Order placed successfully! We will dispatch to your village address soon.'
      )
      clearCart()
      closeCart()
    }, 1200)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={closeCart}
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer */}
      <aside
        role="dialog"
        aria-label="Shopping Cart"
        className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#0b7b3e]" />
            <h3 className="font-bold text-sm text-slate-900">{t('cartTitle', 'Shopping Cart')}</h3>
            <span className="bg-emerald-100 text-[#0b7b3e] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Notice */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('freeDeliveryBadge', 'Free Village Delivery on orders over ₹999')}</span>
          </span>
          <span className="font-bold text-emerald-700 text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded">
            {language === 'hi' ? 'सक्रिय' : 'Active'}
          </span>
        </div>

        {/* Cart Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">
                {t('cartEmptyTitle', 'Your agricultural cart is empty')}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('cartEmptyDesc', 'Add cattle feed, seeds, sprayers or tools to begin.')}
              </p>
              <Button
                onClick={closeCart}
                size="sm"
                className="mt-3 bg-[#0b7b3e] hover:bg-[#086331] text-white text-xs font-semibold cursor-pointer"
              >
                {t('exploreCatalog', 'Explore Catalog')}
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        ;(e.target as any).src = 'https://placehold.co/80x80/f1f5f9/0b7b3e?text=Item'
                      }}
                    />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                  <div className="text-[11px] text-[#0b7b3e] font-extrabold mt-0.5">
                    ₹{item.price.toFixed(2)} × {item.quantity}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-5 h-5 rounded bg-white text-slate-700 text-xs font-bold hover:bg-slate-200 flex items-center justify-center border border-slate-200 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold px-1 text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-5 h-5 rounded bg-[#0b7b3e] text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center transition cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-slate-400 hover:text-rose-500 ml-1 p-1 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t('subtotal', 'Subtotal')}</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>{t('villageDelivery', 'Village Delivery')}</span>
                <span>{t('free', 'FREE')}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                <span>{t('totalAmount', 'Total Amount')}</span>
                <span className="text-[#0b7b3e] text-base">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                onClick={checkoutOnWhatsApp}
                disabled={isCheckingOut}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isCheckingOut ? (language === 'hi' ? 'खुल रहा है...' : 'Opening...') : t('whatsAppBuy', 'WhatsApp Buy')}</span>
              </Button>
              <Button
                onClick={handleDirectCheckout}
                className="py-2.5 px-2 bg-[#0b7b3e] hover:bg-[#086331] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('checkout', 'Checkout')}</span>
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
