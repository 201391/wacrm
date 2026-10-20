import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { DriverPortalView } from '@/components/delivery-agents/driver-portal/driver-portal-view'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Driver Portal - Delivery Agent Interface | Jatrra Rural Logistics',
  description:
    'Mobile-first on-field delivery manifest, order resolution, cash & UPI collections, and Proof of Delivery (POD).',
}

export default function DriverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading Driver Portal...</p>
          </div>
        </div>
      }
    >
      <DriverPortalView />
    </Suspense>
  )
}
