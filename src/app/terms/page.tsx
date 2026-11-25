import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StoreLayout } from '@/components/store/store-layout'
import { TermsOfServiceContent } from '@/components/store/terms-of-service-content'

export const metadata: Metadata = {
  title: 'Terms of Service | Jatrra',
  description:
    'Official Terms of Service & User Agreement for Jatrra rural e-commerce and agricultural supplies platform.',
}

export default function TermsPage() {
  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jatrra Store</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <TermsOfServiceContent showPrintButton={true} />
        </div>
      </div>
    </StoreLayout>
  )
}
