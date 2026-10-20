'use client'

import React from 'react'
import Link from 'next/link'
import {
  Truck,
  Bike,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  Monitor,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import type { DeliveryAgent, VehicleType } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DriverHeaderProps {
  agent: DeliveryAgent | null
  availableAgents: DeliveryAgent[]
  onSelectAgent: (agentId: string) => void
  isOnline: boolean
  simulatedOffline: boolean
  onToggleSimulatedOffline: () => void
  queueCount: number
  onSyncQueue: () => void
  isSyncing: boolean
  onRefresh: () => void
  loading: boolean
  isPhoneMockup: boolean
  onTogglePhoneMockup: () => void
}

const VEHICLE_ICONS: Record<VehicleType, React.ComponentType<{ className?: string }>> = {
  BIKE: Bike,
  SCOOTER: Bike,
  VAN: Truck,
  TRUCK: Truck,
  ELECTRIC_AUTO: Zap,
}

export function DriverHeader({
  agent,
  availableAgents,
  onSelectAgent,
  isOnline,
  simulatedOffline,
  onToggleSimulatedOffline,
  queueCount,
  onSyncQueue,
  isSyncing,
  onRefresh,
  loading,
  isPhoneMockup,
  onTogglePhoneMockup,
}: DriverHeaderProps) {
  const VehicleIcon = agent ? VEHICLE_ICONS[agent.vehicle_type] || Bike : Bike

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors">
      {/* Offline Alert Strip if Offline or Pending Syncs */}
      {(!isOnline || queueCount > 0) && (
        <div
          className={`flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
            !isOnline
              ? 'bg-amber-500/20 text-amber-300 border-b border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-b border-emerald-500/20'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>
                  Offline Mode {simulatedOffline ? '(Simulated)' : '(No Connection)'} • Changes saved to local queue
                </span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span>Online • {queueCount} actions pending upload</span>
              </>
            )}
          </div>
          {queueCount > 0 && isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={onSyncQueue}
              disabled={isSyncing}
              className="h-6 px-2 text-[11px] border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Sync (${queueCount})`}
            </Button>
          )}
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-6">
        {/* Left: Driver Identity & Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/delivery-agents"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
            title="Return to Delivery Fleet Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 text-left rounded-xl p-1.5 transition-all hover:bg-muted/60 active:scale-98 focus:outline-none cursor-pointer">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-emerald-500/40 shadow-sm">
                  <AvatarImage src={agent?.avatar_url || ''} alt={agent?.name || 'Driver'} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold text-sm">
                    {agent?.name ? agent.name.slice(0, 2).toUpperCase() : 'DA'}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate max-w-[130px] sm:max-w-[200px] text-foreground">
                    {agent?.name || 'Select Driver'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <VehicleIcon className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[11px] truncate">{agent?.vehicle_number || 'PB 11 AB 4592'}</span>
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Switch Active Driver Profile
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableAgents.map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  onClick={() => onSelectAgent(a.id)}
                  className={`flex items-center gap-2.5 py-2 cursor-pointer ${
                    agent?.id === a.id ? 'bg-primary/10 text-primary font-medium' : ''
                  }`}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={a.avatar_url || ''} />
                    <AvatarFallback className="text-[10px]">{a.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold truncate">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{a.vehicle_number}</span>
                  </div>
                  {agent?.id === a.id && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Network status & controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline Mode Toggle Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleSimulatedOffline}
            title={simulatedOffline ? 'Disable simulated offline mode' : 'Simulate offline dead-zone'}
            className={`h-8 px-2 text-xs rounded-lg transition-colors ${
              simulatedOffline
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {simulatedOffline ? (
              <WifiOff className="h-4 w-4 text-amber-400" />
            ) : (
              <Wifi className="h-4 w-4 text-emerald-400" />
            )}
            <span className="hidden sm:inline ml-1.5 text-[11px]">
              {simulatedOffline ? 'Offline Active' : 'Go Offline'}
            </span>
          </Button>

          {/* Desktop Only: Toggle Mobile Frame */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onTogglePhoneMockup}
            className="hidden md:flex h-8 px-2 text-xs rounded-lg text-muted-foreground hover:text-foreground"
            title={isPhoneMockup ? 'Switch to Full Screen' : 'Switch to Phone Mockup (390px)'}
          >
            {isPhoneMockup ? (
              <Monitor className="h-4 w-4 text-primary" />
            ) : (
              <Smartphone className="h-4 w-4" />
            )}
            <span className="ml-1.5 text-[11px]">{isPhoneMockup ? 'Full View' : 'Phone Mode'}</span>
          </Button>

          {/* Refresh Manifest */}
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0 rounded-lg border-border/60 hover:bg-muted active:scale-95"
            title="Refresh Manifest Stops"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </header>
  )
}
