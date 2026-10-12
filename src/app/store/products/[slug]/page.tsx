'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import type { Product } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const { addItem, checkoutOnWhatsApp } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${slug}`)
        const data = await res.json()
        if (data.product) {
          setProduct(data.product)
          setSelectedImage(data.product.images?.[0] || null)
        }
      } catch (err) {
        console.error('Failed loading product details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Product not found</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          This item may have been moved or is currently unavailable.
        </p>
        <Link
          href="/store"
          className={buttonVariants({
            className: 'mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white',
          })}
        >
          Back to Catalog
        </Link>
      </div>
    )
  }

  const handleInstantBuy = () => {
    addItem(product, quantity)
    checkoutOnWhatsApp()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="h-full w-full object-cover transition-all"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-16 w-16" />
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-medium">
                Direct WhatsApp Order
              </Badge>
              {product.stock > 0 ? (
                <span className="text-xs text-muted-foreground">In Stock ({product.stock} units)</span>
              ) : (
                <span className="text-xs text-destructive">Out of Stock</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-foreground">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Free Delivery Included
              </span>
            </div>
          </div>

          <div className="border-t border-b border-border/60 py-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description || 'No detailed description available.'}
            </p>
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity
              </span>
              <div className="flex items-center rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                onClick={() => addItem(product, quantity)}
                variant="outline"
                className="w-full sm:flex-1 h-12 rounded-xl border-border hover:bg-muted font-semibold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                <span>Add to Cart</span>
              </Button>

              <Button
                onClick={handleInstantBuy}
                className="w-full sm:flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Buy Now on WhatsApp</span>
              </Button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-3.5 mt-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Truck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Complimentary insured shipping on all orders</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Cash on Delivery (COD) or UPI confirmation available</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Automated WhatsApp order verification with 24/7 AI concierge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
