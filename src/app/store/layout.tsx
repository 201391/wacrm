import React, { Suspense } from 'react'
import { CartProvider } from '@/components/store/cart-context'
import { StoreLanguageProvider } from '@/components/store/language-context'
import { CartDrawer } from '@/components/store/cart-drawer'
import { StoreHeader } from '@/components/store/store-header'
import { StoreFooter } from '@/components/store/store-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jatrra - Farm, Cattle Feed & Rural Essentials | Direct WhatsApp Store',
  description:
    'Shop lab-verified cattle feed, certified hybrid seeds, bio-fertilizers, knapsack sprayers, and rural home kitchen essentials. Fast delivery to your doorstep or panchayat.',
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreLanguageProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-[#0b7b3e] selection:text-white">
          <Suspense fallback={<div className="h-28 bg-white border-b border-slate-100 animate-pulse" />}>
            <StoreHeader />
          </Suspense>

          <main className="flex-1">{children}</main>

          <CartDrawer />

          {/* Bilingual Store Footer */}
          <StoreFooter />
        </div>
      </CartProvider>
    </StoreLanguageProvider>
  )
}
