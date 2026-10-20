'use client'

import React, { useState, useEffect } from 'react'
import { Sprout } from 'lucide-react'
import { useStoreLanguage } from './language-context'
import { PrivacyPolicyDialog } from './privacy-policy-dialog'

export function StoreFooter() {
  const { t, language, setLanguage } = useStoreLanguage()
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Listen for hash navigation e.g. #privacy or #privacy-policy
  useEffect(() => {
    const handleHashChange = () => {
      if (
        typeof window !== 'undefined' &&
        (window.location.hash === '#privacy' || window.location.hash === '#privacy-policy')
      ) {
        setPrivacyOpen(true)
      }
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0b7b3e] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">Jatrra</span>
              <span suppressHydrationWarning className="text-[11px] text-slate-400 ml-2">
                {language === 'hi' ? 'ग्रामीण एवं कृषि ई-कॉमर्स प्लेटफॉर्म' : 'Rural & Agriculture E-Commerce'}
              </span>
            </div>

            {/* Quick Language Toggle in Footer */}
            <div suppressHydrationWarning className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-[11px]">
              <span className="text-slate-500 font-medium px-1.5">Language / भाषा:</span>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  language === 'en' ? 'bg-white text-[#0b7b3e] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  language === 'hi' ? 'bg-[#0b7b3e] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            <div className="flex items-center gap-6 text-[11px]">
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-[#0b7b3e] transition cursor-pointer font-medium text-slate-500"
              >
                {t('footerPrivacy', 'Privacy Policy')}
              </button>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#0b7b3e] transition">
                {t('footerTerms', 'Terms of Service')}
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#0b7b3e] transition">
                {t('footerAdvisory', 'Farmer Advisory')}
              </a>
              <a
                href="https://wa.me/918815356175?text=Hello%20Jatrra%2C%20I%20need%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0b7b3e] font-semibold text-emerald-700 transition"
              >
                {t('footerSupport', 'WhatsApp Support')}
              </a>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p suppressHydrationWarning>© {new Date().getFullYear()} Jatrra Agri Technologies Pvt Ltd. All rights reserved.</p>
            <p suppressHydrationWarning>{t('footerTagline', '100% Genuine Quality • Fast Village Doorstep Logistics')}</p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Dialog */}
      <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  )
}
