'use client'

import React from 'react'
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  QrCode,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import type { DriverManifestStats } from '@/types'

interface DriverMetricsSummaryProps {
  stats: DriverManifestStats
}

export function DriverMetricsSummary({ stats }: DriverMetricsSummaryProps) {
  const {
    totalAssigned,
    pendingDelivery,
    deliveredCount,
    cancelledCount,
    codCollected,
    upiCollected,
    totalCashDue
  } = stats

  const completedCount = deliveredCount + cancelledCount
  const completionPercent = totalAssigned > 0 ? Math.round((deliveredCount / totalAssigned) * 100) : 0

  return (
    <section className="space-y-3.5">
      {/* Shift Progress Bar Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <div className="flex items-center gap-1.5 text-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold">Shift Progress</span>
          </div>
          <span className="text-muted-foreground font-mono">
            <strong className="text-foreground">{deliveredCount}</strong> / {totalAssigned} Delivered ({completionPercent}%)
          </span>
        </div>

        {/* Progress Track */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Core Operational Metric Tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {/* Total Assigned */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              {totalAssigned}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground truncate">
              Assigned Packages
            </div>
          </div>
        </div>

        {/* Pending Delivery */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-500 font-mono">
              {pendingDelivery}
            </div>
            <div className="text-[11px] font-medium text-amber-600/90 dark:text-amber-400/90 truncate">
              Pending Delivery
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-500 font-mono">
              {deliveredCount}
            </div>
            <div className="text-[11px] font-medium text-emerald-600/90 dark:text-emerald-400/90 truncate">
              Delivered Drops
            </div>
          </div>
        </div>

        {/* Cancelled / Returned */}
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-rose-500 font-mono">
              {cancelledCount}
            </div>
            <div className="text-[11px] font-medium text-rose-600/90 dark:text-rose-400/90 truncate">
              Cancelled / Returned
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown: COD vs UPI Collected */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card to-muted/30 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-foreground tracking-tight flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-emerald-500" />
            Active Run Collections
          </span>
          {totalCashDue > 0 && (
            <span className="text-[11px] text-amber-500 font-medium">
              Pending due: ₹{totalCashDue.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Cash on Delivery Collected */}
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 transition-all hover:bg-emerald-500/15">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-medium">Cash (COD)</span>
              <Banknote className="h-3.5 w-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground font-mono">
              ₹{codCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Physical cash in pouch
            </div>
          </div>

          {/* UPI Digital Collected */}
          <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 transition-all hover:bg-blue-500/15">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
              <span className="text-[11px] font-medium">UPI / Digital</span>
              <QrCode className="h-3.5 w-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground font-mono">
              ₹{upiCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Instant digital settlement
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
