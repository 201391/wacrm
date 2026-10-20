import React from 'react'
import type { Metadata, ResolvingMetadata } from 'next'
import { getProductBySlug, getProductById } from '@/lib/orders/store'
import { ProductDetailView } from '@/components/store/product-detail-view'
import type { Product } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generate SEO & Social Metadata for public storefront product pages.
 */
export async function generateMetadata(
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await props.params

  // Lookup product by slug or ID
  let product: Product | null = await getProductBySlug(slug)
  if (!product) {
    product = await getProductById(slug)
  }

  if (!product) {
    return {
      title: 'Product Not Found | Jatrra Store',
      description: 'The requested agricultural product could not be located in our catalog.',
      robots: { index: false, follow: false },
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jatrra.com'
  const fallbackImage =
    'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80'

  const effectiveTitle = product.meta_title?.trim() || `${product.title} | Jatrra Store`
  const effectiveDesc =
    product.meta_description?.trim() ||
    product.description?.replace(/<[^>]*>?/gm, '').trim() ||
    `Order ${product.title} online with genuine quality guarantee and fast village doorstep delivery.`
  const canonicalUrl =
    product.canonical_url?.trim() || `${siteUrl}/store/products/${product.slug}`
  const ogImageUrl = product.og_image_url?.trim() || product.images?.[0] || fallbackImage
  const ogTitle = product.og_title?.trim() || effectiveTitle
  const ogDescription = product.og_description?.trim() || effectiveDesc

  return {
    title: effectiveTitle,
    description: effectiveDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: product.keywords && product.keywords.length > 0 ? product.keywords : undefined,
    robots: {
      index: !product.no_index,
      follow: !product.no_follow,
      googleBot: {
        index: !product.no_index,
        follow: !product.no_follow,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: 'Jatrra Rural Agriculture',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: product.twitter_card === 'summary' ? 'summary' : 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  }
}

/**
 * Public storefront product page with Schema.org Product JSON-LD output.
 */
export default async function ProductDetailPage(props: PageProps) {
  const { slug } = await props.params

  let product: Product | null = await getProductBySlug(slug)
  if (!product) {
    product = await getProductById(slug)
  }

  // Schema.org Product JSON-LD structured data
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description || product.meta_description || product.title,
        image:
          product.images && product.images.length > 0
            ? product.images
            : [product.og_image_url].filter(Boolean),
        sku: product.id,
        category: product.category,
        brand: {
          '@type': 'Brand',
          name: 'Jatrra',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.price,
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: product.canonical_url || `https://jatrra.com/store/products/${product.slug}`,
          seller: {
            '@type': 'Organization',
            name: 'Jatrra',
          },
        },
        ...(product.structured_data || {}),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailView initialProduct={product} slug={slug} />
    </>
  )
}
