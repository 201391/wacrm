'use client'

import React, { useState, useMemo } from 'react'
import {
  Globe,
  Search,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Tag,
  X,
  Plus,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Folder,
  RefreshCw,
  Info,
  ShieldCheck,
  EyeOff,
  Link as LinkIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

export interface ProductSeoFormProps {
  productTitle: string
  productDescription: string
  productPrice: number | string
  productFeaturedImage: string
  allProducts: Product[]
  currentProductId?: string

  // SEO Fields
  metaTitle: string
  setMetaTitle: (val: string) => void
  metaDescription: string
  setMetaDescription: (val: string) => void
  canonicalUrl: string
  setCanonicalUrl: (val: string) => void
  keywords: string[]
  setKeywords: React.Dispatch<React.SetStateAction<string[]>>
  slug: string
  setSlug: (val: string) => void
  ogTitle: string
  setOgTitle: (val: string) => void
  ogDescription: string
  setOgDescription: (val: string) => void
  ogImageUrl: string
  setOgImageUrl: (val: string) => void
  twitterCard: 'summary' | 'summary_large_image'
  setTwitterCard: (val: 'summary' | 'summary_large_image') => void
  noIndex: boolean
  setNoIndex: (val: boolean) => void
  noFollow: boolean
  setNoFollow: (val: boolean) => void

  onOpenMediaPicker?: () => void
}

const POPULAR_KEYWORD_SUGGESTIONS = [
  'cattle feed',
  'dairy nutrition',
  'organic fertilizer',
  'high yield seeds',
  'farm tools',
  'sprayers',
  'village delivery',
  'jatrra farm essentials',
]

export function ProductSeoForm({
  productTitle,
  productDescription,
  productPrice,
  productFeaturedImage,
  allProducts,
  currentProductId,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  canonicalUrl,
  setCanonicalUrl,
  keywords,
  setKeywords,
  slug,
  setSlug,
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImageUrl,
  setOgImageUrl,
  twitterCard,
  setTwitterCard,
  noIndex,
  setNoIndex,
  noFollow,
  setNoFollow,
  onOpenMediaPicker,
}: ProductSeoFormProps) {
  const [keywordInput, setKeywordInput] = useState('')
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile' | 'facebook' | 'twitter'>('desktop')

  // Slug collision check
  const slugTrimmed = slug.trim().toLowerCase()
  const isSlugDuplicate = useMemo(() => {
    if (!slugTrimmed) return false
    return allProducts.some(
      (p) => p.id !== currentProductId && p.slug.trim().toLowerCase() === slugTrimmed
    )
  }, [allProducts, currentProductId, slugTrimmed])

  const defaultCanonical = `https://jatrra.com/store/products/${slugTrimmed || 'product-slug'}`

  // Effective preview values
  const effectiveMetaTitle = (metaTitle.trim() || productTitle.trim() || 'Untitled Product') + ' | Jatrra Store'
  const effectiveMetaDesc =
    metaDescription.trim() ||
    productDescription.trim() ||
    'Order high quality agricultural essentials and dairy feed with village doorstep delivery across India from Jatrra.'
  const effectiveOgTitle = ogTitle.trim() || metaTitle.trim() || productTitle.trim() || 'Untitled Product'
  const effectiveOgDesc =
    ogDescription.trim() ||
    metaDescription.trim() ||
    productDescription.trim() ||
    'Buy directly from Jatrra with fast rural delivery and genuine product guarantees.'
  const effectiveSocialImage =
    ogImageUrl.trim() ||
    productFeaturedImage.trim() ||
    'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80'

  // Keyword chip handlers
  const handleAddKeyword = (kwToAdd?: string) => {
    const raw = kwToAdd !== undefined ? kwToAdd : keywordInput
    const cleaned = raw.replace(/<[^>]*>?/gm, '').trim()
    if (!cleaned) return

    if (!keywords.includes(cleaned)) {
      setKeywords((prev) => [...prev, cleaned])
    }
    if (kwToAdd === undefined) {
      setKeywordInput('')
    }
  }

  const handleKeyDownKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keywordToRemove))
  }

  const handleRegenerateSlug = () => {
    const generated = productTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(generated || `product-${Date.now()}`)
  }

  // Live character counter helper styles
  const titleLen = metaTitle.length
  const descLen = metaDescription.length

  const getTitleStatus = () => {
    if (titleLen === 0) return { label: 'Empty (Will fallback to title)', color: 'text-muted-foreground' }
    if (titleLen < 40) return { label: `${titleLen}/60 chars (Short)`, color: 'text-amber-500' }
    if (titleLen <= 60) return { label: `${titleLen}/60 chars (Optimal)`, color: 'text-emerald-600 font-semibold' }
    return { label: `${titleLen}/60 chars (May truncate on SERP)`, color: 'text-rose-500 font-semibold' }
  }

  const getDescStatus = () => {
    if (descLen === 0) return { label: 'Empty (Will fallback to description)', color: 'text-muted-foreground' }
    if (descLen < 120) return { label: `${descLen}/160 chars (Short)`, color: 'text-amber-500' }
    if (descLen <= 160) return { label: `${descLen}/160 chars (Optimal)`, color: 'text-emerald-600 font-semibold' }
    return { label: `${descLen}/160 chars (May truncate on SERP)`, color: 'text-rose-500 font-semibold' }
  }

  return (
    <div className="space-y-6 pt-1">
      {/* SECTION 1: SEARCH ENGINE METADATA */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Search Engine Meta Tags</h4>
              <p className="text-[11px] text-muted-foreground">
                Configure primary indexing parameters and snippet presentation for Google & Bing.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
            SEO Core
          </Badge>
        </div>

        {/* URL Slug & Permalinks */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              <span>URL Slug / Permalink</span>
            </label>
            <button
              type="button"
              onClick={handleRegenerateSlug}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Auto-generate from Title
            </button>
          </div>
          <div className="flex items-center rounded-lg border border-input bg-background px-3 h-9 text-xs focus-within:ring-1 focus-within:ring-emerald-500">
            <span className="text-muted-foreground select-none font-mono">/store/products/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              placeholder="product-unique-slug"
              className="flex-1 bg-transparent border-0 outline-none px-1 text-foreground font-mono"
            />
          </div>

          {/* Duplicate Slug Indicator */}
          {isSlugDuplicate ? (
            <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Warning: This URL slug is already taken by another product in your catalog!</span>
            </p>
          ) : slugTrimmed ? (
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Permalink is unique and ready for indexing.</span>
            </p>
          ) : null}
        </div>

        {/* Meta Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Meta Title Tag <span className="text-muted-foreground font-normal">(50–60 chars recommended)</span>
            </label>
            <span className={`text-[11px] ${getTitleStatus().color}`}>
              {getTitleStatus().label}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={productTitle || 'Balanced Cattle Feed Pellets 50kg'}
              maxLength={100}
              className="h-9 text-xs"
            />
            {productTitle && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMetaTitle(productTitle.trim())}
                className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0"
                title="Populate from product title"
              >
                Use Title
              </Button>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden mt-1">
            <div
              className={`h-full transition-all ${
                titleLen === 0
                  ? 'bg-transparent'
                  : titleLen < 40
                  ? 'bg-amber-500'
                  : titleLen <= 60
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (titleLen / 60) * 100)}%` }}
            />
          </div>
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Meta Description <span className="text-muted-foreground font-normal">(150–160 chars recommended)</span>
            </label>
            <span className={`text-[11px] ${getDescStatus().color}`}>
              {getDescStatus().label}
            </span>
          </div>
          <Textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={
              productDescription
                ? productDescription.slice(0, 160)
                : 'High-energy cattle feed formulated for high milk yield and health. Order online with door delivery.'
            }
            maxLength={220}
            className="text-xs"
          />
          <div className="flex items-center justify-between pt-0.5">
            <div className="w-3/4 bg-muted rounded-full h-1 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  descLen === 0
                    ? 'bg-transparent'
                    : descLen < 120
                    ? 'bg-amber-500'
                    : descLen <= 160
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
              />
            </div>
            {productDescription && (
              <button
                type="button"
                onClick={() => setMetaDescription(productDescription.replace(/<[^>]*>?/gm, '').trim().slice(0, 160))}
                className="text-[10px] text-emerald-600 hover:underline cursor-pointer font-medium"
              >
                Use Product Description
              </button>
            )}
          </div>
        </div>

        {/* Canonical URL Override */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Canonical URL Override <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            {canonicalUrl && (
              <button
                type="button"
                onClick={() => setCanonicalUrl('')}
                className="text-[10px] text-muted-foreground hover:text-rose-500 cursor-pointer"
              >
                Reset to Default
              </button>
            )}
          </div>
          <Input
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder={defaultCanonical}
            className="h-9 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Specifies the primary canonical master version to prevent duplicate content penalties. Auto-defaults to{' '}
            <code className="text-emerald-600 font-mono">{defaultCanonical}</code> if left blank.
          </p>
        </div>

        {/* Focus / Meta Keywords */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>Focus Keywords / Meta Keywords</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDownKeyword}
              placeholder="Type keyword and press Enter (e.g. bypass protein, dairy feed)"
              className="h-9 text-xs flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddKeyword()}
              className="h-9 text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {/* Keyword Chips */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
            {keywords.length === 0 ? (
              <span className="text-[11px] text-muted-foreground italic">
                No focus keywords added yet. Add 3–5 targeted search queries.
              </span>
            ) : (
              keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-rose-600 rounded-full cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Keyword Suggestions */}
          <div className="pt-1">
            <span className="text-[10px] text-muted-foreground block mb-1">Quick Suggestions:</span>
            <div className="flex flex-wrap gap-1">
              {POPULAR_KEYWORD_SUGGESTIONS.filter((s) => !keywords.includes(s)).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddKeyword(sug)}
                  className="text-[10px] px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Robots Meta Directives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-background">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                <span>No-Index (noindex)</span>
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                Prevent search engines from indexing this page in search results.
              </span>
            </div>
            <Switch checked={noIndex} onCheckedChange={setNoIndex} />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-background">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span>No-Follow (nofollow)</span>
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                Instruct crawlers not to follow outbound links on this product page.
              </span>
            </div>
            <Switch checked={noFollow} onCheckedChange={setNoFollow} />
          </div>
        </div>
      </div>

      {/* SECTION 2: OPEN GRAPH & SOCIAL CARDS */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Open Graph & Social Sharing Cards</h4>
              <p className="text-[11px] text-muted-foreground">
                Controls visual display when shared across WhatsApp, Facebook, LinkedIn, and Twitter/X.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
            Social Rich Media
          </Badge>
        </div>

        {/* OG Title & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">OG Social Title</label>
              <button
                type="button"
                onClick={() => setOgTitle(metaTitle || productTitle)}
                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
              >
                Sync with Title
              </button>
            </div>
            <Input
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder={metaTitle || productTitle || 'Product Social Card Title'}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Twitter Card Type</label>
            <select
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value as 'summary' | 'summary_large_image')}
              className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="summary_large_image">summary_large_image (Large Hero Card - Recommended)</option>
              <option value="summary">summary (Compact Square Thumbnail Card)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">OG Social Description</label>
            <button
              type="button"
              onClick={() => setOgDescription(metaDescription || productDescription)}
              className="text-[10px] text-blue-600 hover:underline cursor-pointer"
            >
              Sync with Description
            </button>
          </div>
          <Textarea
            rows={2}
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            placeholder={metaDescription || productDescription || 'Catchy description shown in WhatsApp & Twitter cards'}
            className="text-xs"
          />
        </div>

        {/* OG Image Upload & Media Library */}
        <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Social Share Banner / OG Image</span>
            </label>
            <div className="flex items-center gap-2">
              {productFeaturedImage && (
                <button
                  type="button"
                  onClick={() => setOgImageUrl(productFeaturedImage)}
                  className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                >
                  Use Featured Image
                </button>
              )}
              {onOpenMediaPicker && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenMediaPicker}
                  className="h-7 text-xs gap-1.5 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold cursor-pointer"
                >
                  <Folder className="w-3 h-3" />
                  <span>Media Library</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="https://... (1200x630px recommended for Facebook/WhatsApp/Twitter)"
              className="h-9 text-xs flex-1 bg-background"
            />
            {ogImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOgImageUrl('')}
                className="h-9 text-xs text-rose-500 hover:text-rose-600"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Social Image Preview */}
          {ogImageUrl ? (
            <div className="flex items-center gap-3 p-2 bg-background rounded-lg border border-border">
              <div className="w-20 h-12 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                <img
                  src={ogImageUrl}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as any).src = 'https://placehold.co/1200x630/0b7b3e/ffffff?text=Social+Card'
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground min-w-0">
                <span className="font-semibold text-foreground block truncate">Custom Social Banner Active</span>
                <span className="text-[10px]">Optimized for 1.91:1 high-resolution link unfurling</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Fallback: If left blank, the product's primary catalog thumbnail (
              <span className="font-mono">{productFeaturedImage ? 'Available' : 'Placeholder'}</span>) will be used automatically.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 3: LIVE SERP & SOCIAL PREVIEWS */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Real-Time Search & Social Preview</h4>
              <p className="text-[11px] text-muted-foreground">
                Preview how your product snippet will render on Google desktop, mobile, and social feeds.
              </p>
            </div>
          </div>

          {/* Device & Platform Switcher */}
          <div className="flex items-center rounded-lg bg-muted p-1 border border-border/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreviewTab('desktop')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                previewTab === 'desktop' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Google Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('mobile')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                previewTab === 'mobile' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('facebook')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                previewTab === 'facebook' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Facebook / WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('twitter')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                previewTab === 'twitter' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Twitter / X Card</span>
            </button>
          </div>
        </div>

        {/* 1. GOOGLE DESKTOP PREVIEW */}
        {previewTab === 'desktop' && (
          <div className="p-4 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-xs space-y-1 font-sans">
            <div className="flex items-center gap-2 text-xs text-[#202124]">
              <div className="w-6 h-6 rounded-full bg-[#0b7b3e] text-white flex items-center justify-center text-[10px] font-bold">
                J
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-xs text-[#202124]">Jatrra India</span>
                <span className="text-[11px] text-[#4d5156] truncate max-w-md">
                  https://jatrra.com › store › products › {slugTrimmed || 'product-slug'}
                </span>
              </div>
            </div>
            <h5 className="text-[#1a0dab] hover:underline cursor-pointer text-lg font-medium leading-snug line-clamp-1 pt-1">
              {effectiveMetaTitle}
            </h5>
            <div className="flex items-center gap-1.5 text-xs text-[#0b7b3e] font-semibold pt-0.5">
              <span>₹{Number(productPrice || 0).toFixed(2)}</span>
              <span>·</span>
              <span className="text-slate-600 font-normal">In stock</span>
              <span>·</span>
              <span className="text-slate-500 font-normal">Fast Village Delivery</span>
            </div>
            <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed pt-0.5">
              {effectiveMetaDesc}
            </p>
          </div>
        )}

        {/* 2. GOOGLE MOBILE PREVIEW */}
        {previewTab === 'mobile' && (
          <div className="max-w-sm mx-auto p-3.5 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm space-y-2 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0b7b3e] text-white flex items-center justify-center text-xs font-bold shrink-0">
                J
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-[#202124] block">Jatrra E-Commerce</span>
                <span className="text-[10px] text-[#4d5156] truncate block">
                  jatrra.com/store/products/{slugTrimmed || 'product-slug'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <h5 className="text-[#1a0dab] font-medium text-sm leading-snug line-clamp-2">
                  {effectiveMetaTitle}
                </h5>
                <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-tight mt-1">
                  {effectiveMetaDesc}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#0b7b3e] font-bold mt-1.5">
                  <span>₹{Number(productPrice || 0).toFixed(2)}</span>
                  <span className="text-slate-400 font-normal">·</span>
                  <span className="text-emerald-700 font-medium">In Stock</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                <img
                  src={effectiveSocialImage}
                  alt="Mobile Thumbnail"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. FACEBOOK / OPEN GRAPH PREVIEW */}
        {previewTab === 'facebook' && (
          <div className="max-w-md mx-auto rounded-xl border border-slate-300 bg-white overflow-hidden shadow-sm font-sans">
            <div className="relative aspect-[1.91/1] bg-slate-100 overflow-hidden">
              <img
                src={effectiveSocialImage}
                alt="Social Card Banner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-[#f2f4f7] border-t border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                JATRRA.COM
              </span>
              <h5 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                {effectiveOgTitle}
              </h5>
              <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                {effectiveOgDesc}
              </p>
            </div>
          </div>
        )}

        {/* 4. TWITTER / X CARD PREVIEW */}
        {previewTab === 'twitter' && (
          <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-black text-white overflow-hidden shadow-sm font-sans">
            {twitterCard === 'summary_large_image' ? (
              <div>
                <div className="relative aspect-[1.91/1] bg-neutral-900 overflow-hidden">
                  <img
                    src={effectiveSocialImage}
                    alt="Twitter Large Card"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-1 bg-neutral-950 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block">jatrra.com</span>
                  <h5 className="text-sm font-bold text-white line-clamp-1">
                    {effectiveOgTitle}
                  </h5>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-tight">
                    {effectiveOgDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 flex gap-3 items-center bg-neutral-950">
                <div className="w-20 h-20 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
                  <img
                    src={effectiveSocialImage}
                    alt="Twitter Summary Card"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] text-neutral-400 block">jatrra.com</span>
                  <h5 className="text-sm font-bold text-white line-clamp-1">
                    {effectiveOgTitle}
                  </h5>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-tight">
                    {effectiveOgDesc}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
