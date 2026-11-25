'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TermsOfServiceContent } from './terms-of-service-content'
import { Scale, Check } from 'lucide-react'

interface TermsOfServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsOfServiceDialog({ open, onOpenChange }: TermsOfServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-2xl border-slate-200 shadow-2xl">
        {/* Sticky Accessible Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 bg-white/95 backdrop-blur-xs shrink-0 flex flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[#0b7b3e]" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Jatrra Terms of Service &amp; User Agreement
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Effective Date: 26 Oct 2026 • Jatrra E Commerce
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Terms Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <TermsOfServiceContent showPrintButton={true} />
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-3 sm:p-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between sm:justify-between w-full">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
            Rural E-Commerce &amp; Agricultural Distribution Agreement
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="default"
              onClick={() => onOpenChange(false)}
              className="bg-[#0b7b3e] hover:bg-[#096633] text-white px-5 py-2 text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>I Understand &amp; Close</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
