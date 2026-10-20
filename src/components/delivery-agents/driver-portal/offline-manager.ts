'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ResolveDeliveryInput } from '@/lib/orders/store'

export interface OfflineAction {
  id: string
  timestamp: string
  payload: ResolveDeliveryInput
  shortCode: string
  customerName?: string
}

const OFFLINE_QUEUE_KEY = 'wacrm_driver_offline_queue'
const OFFLINE_MODE_OVERRIDE_KEY = 'wacrm_driver_simulated_offline'

export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to read offline queue:', err)
    return []
  }
}

export function saveOfflineQueue(queue: OfflineAction[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to save offline queue:', err)
  }
}

export function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): OfflineAction {
  const newAction: OfflineAction = {
    ...action,
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  }
  const current = getOfflineQueue()
  current.push(newAction)
  saveOfflineQueue(current)
  return newAction
}

export function removeOfflineAction(id: string) {
  const current = getOfflineQueue()
  const filtered = current.filter((item) => item.id !== id)
  saveOfflineQueue(filtered)
}

export function clearOfflineQueue() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}

export function getSimulatedOfflineMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(OFFLINE_MODE_OVERRIDE_KEY) === 'true'
}

export function setSimulatedOfflineMode(value: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(OFFLINE_MODE_OVERRIDE_KEY, value ? 'true' : 'false')
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false)
  const [queue, setQueue] = useState<OfflineAction[]>([])
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Initialize status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)
    setSimulatedOffline(getSimulatedOfflineMode())
    setQueue(getOfflineQueue())

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const effectiveOnline = isOnline && !simulatedOffline

  const toggleSimulatedOffline = useCallback(() => {
    const nextVal = !simulatedOffline
    setSimulatedOffline(nextVal)
    setSimulatedOfflineMode(nextVal)
  }, [simulatedOffline])

  const refreshQueue = useCallback(() => {
    setQueue(getOfflineQueue())
  }, [])

  const syncQueue = useCallback(
    async (onItemSuccess?: (item: OfflineAction) => void) => {
      if (!effectiveOnline) {
        throw new Error('Cannot sync while offline. Reconnect or disable simulated offline mode.')
      }

      const pending = getOfflineQueue()
      if (pending.length === 0) return { synced: 0, failed: 0 }

      setIsSyncing(true)
      let syncedCount = 0
      let failedCount = 0
      const remaining: OfflineAction[] = []

      for (const item of pending) {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(item.payload.orderIdOrCode)}/resolve-delivery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          })

          const data = await res.json()
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Server rejected resolution')
          }

          syncedCount++
          onItemSuccess?.(item)
        } catch (err) {
          console.error(`Failed to sync action for order ${item.shortCode}:`, err)
          failedCount++
          remaining.push(item)
        }
      }

      saveOfflineQueue(remaining)
      setQueue(remaining)
      setIsSyncing(false)

      return { synced: syncedCount, failed: failedCount }
    },
    [effectiveOnline]
  )

  return {
    isOnline: effectiveOnline,
    realNetworkOnline: isOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    queue,
    queueCount: queue.length,
    refreshQueue,
    syncQueue,
    isSyncing
  }
}
