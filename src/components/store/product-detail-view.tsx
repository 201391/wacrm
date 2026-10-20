'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  FileText,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import type { Product } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface ProductDetailViewProps {
  initialProduct: Product | null
  slug?: string
}

export function ProductDetailView({ initialProduct, slug }: ProductDetailViewProps) {
  const { addItem, checkoutOnWhatsApp } = useCart()
  const [product] = useState<Product | null>(initialProduct)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialProduct?.images?.[0] || null
  )

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
          href="/"
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
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm flex items-center justify-center p-4">
            {product.badge && (
              <span
                className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10 ${
                  product.badge_color || 'bg-amber-500 text-white'
                }`}
              >
                {product.badge}
              </span>
            )}
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="h-full w-full object-contain transition-all"
                onError={(e) => {
                  ;(e.target as any).src =
                    'https://placehold.co/600x600/f1f5f9/0b7b3e?text=Jatrra+Product'
                }}
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
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all p-1 bg-background cursor-pointer ${
                    selectedImage === img
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                Direct WhatsApp Order
              </Badge>
              {product.stock > 0 ? (
                <span className="text-xs text-muted-foreground">In Stock ({product.stock} units)</span>
              ) : (
                <span className="text-xs text-destructive font-medium">Out of Stock</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.title}
            </h1>

            {product.weight && (
              <p className="text-sm font-medium text-muted-foreground">
                Pack Size: <span className="text-foreground">{product.weight}</span>
              </p>
            )}

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-foreground">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{Number(product.original_price).toFixed(2)}
                </span>
              )}
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Village Doorstep Delivery
              </span>
            </div>
          </div>

          <div className="border-t border-b border-border/60 py-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description & Specifications
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description || 'Nutritional bypass formulations and genuine agricultural essential.'}
            </p>

            {/* Attached Brochure PDF */}
            {product.brochure_url && (
              <div className="pt-2">
                <a
                  href={product.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Download Formulation Specs & Brochure (PDF)</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              </div>
            )}
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
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                className="w-full sm:flex-1 h-12 rounded-xl border-border hover:bg-muted font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <span>Add to Cart</span>
              </Button>

              <Button
                onClick={handleInstantBuy}
                className="w-full sm:flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Buy Now on WhatsApp</span>
              </Button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-3.5 mt-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Doorstep delivery to rural pin codes and dairy farmers</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Genuine factory sealed packing with UPI / Cash on Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Automated WhatsApp confirmation with order tracker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
