'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { OrderItem, Product } from '@/types'
import { toast } from 'sonner'

interface CheckoutResult {
  order_id: string
  short_code: string
  total_amount: number
  whatsapp_url: string
  support_phone: string
}

interface CartContextValue {
  items: OrderItem[]
  totalCount: number
  subtotal: number
  isOpen: boolean
  isCheckingOut: boolean
  lastCheckout: CheckoutResult | null
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  checkoutOnWhatsApp: () => Promise<void>
  clearLastCheckout: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_STORAGE_KEY = 'wacrm_store_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [lastCheckout, setLastCheckout] = useState<CheckoutResult | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota errors
    }
  }, [items, isHydrated])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === product.id)
      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        }
        return next
      }
      return [
        ...prev,
        {
          product_id: product.id,
          title: product.title,
          price: product.price,
          quantity,
          image_url: product.images?.[0] || null,
        },
      ]
    })
    toast.success(`Added ${product.title} to cart!`)
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const clearLastCheckout = useCallback(() => {
    setLastCheckout(null)
  }, [])

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const checkoutOnWhatsApp = useCallback(async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/orders/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (!res.ok) {
        throw new Error('Failed to create draft order.')
      }

      const data: CheckoutResult = await res.json()
      setLastCheckout(data)

      // Open WhatsApp deep link
      if (typeof window !== 'undefined') {
        const opened = window.open(data.whatsapp_url, '_blank')
        if (!opened) {
          // If popup blocked, redirect directly
          window.location.href = data.whatsapp_url
        }
      }

      toast.success(`Order #${data.short_code} created! Opening WhatsApp...`)
    } catch (err: any) {
      console.error('Checkout error:', err)
      toast.error(err.message || 'Could not initiate WhatsApp checkout.')
    } finally {
      setIsCheckingOut(false)
    }
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        isOpen,
        isCheckingOut,
        lastCheckout,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkoutOnWhatsApp,
        clearLastCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
