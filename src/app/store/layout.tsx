import React from 'react'
import type { Metadata } from 'next'
import { StoreLayout as StoreLayoutWrapper } from '@/components/store/store-layout'

export const metadata: Metadata = {
  title: 'Jatrra - Farm, Cattle Feed & Rural Essentials | Direct WhatsApp Store',
  description:
    'Shop lab-verified cattle feed, certified hybrid seeds, bio-fertilizers, knapsack sprayers, and rural home kitchen essentials. Fast delivery to your doorstep or panchayat.',
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
}
