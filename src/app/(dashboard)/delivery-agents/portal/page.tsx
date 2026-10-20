import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { DriverPortalView } from '@/components/delivery-agents/driver-portal/driver-portal-view'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Driver Portal | Delivery Agent Operations',
  description: 'Mobile-first driver task management and delivery resolution portal.',
}

export default function DeliveryAgentPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading Delivery Portal...</p>
          </div>
        </div>
      }
    >
      <DriverPortalView />
    </Suspense>
  )
}
