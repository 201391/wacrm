import { NextResponse } from 'next/server'
import { getProductBySlug, getProductById, updateProduct, deleteProduct } from '@/lib/orders/store'

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id') || undefined

    // Lookup by id first, then slug
    let product = await getProductById(slug, accountId)
    if (!product) {
      product = await getProductBySlug(slug, accountId)
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (err) {
    console.error('Error fetching product by slug/id:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params
    const body = await request.json()

    // Find actual id if slug was passed
    let id = slug
    const prod = await getProductById(slug) || await getProductBySlug(slug)
    if (prod) {
      id = prod.id
    }

    const updated = await updateProduct(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (err) {
    console.error('Error updating product:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params
    const body = await request.json()

    let id = slug
    const prod = await getProductById(slug) || await getProductBySlug(slug)
    if (prod) {
      id = prod.id
    }

    const updated = await updateProduct(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (err) {
    console.error('Error updating product:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params
    let id = slug
    const prod = await getProductById(slug) || await getProductBySlug(slug)
    if (prod) {
      id = prod.id
    }

    const deleted = await deleteProduct(id)
    return NextResponse.json({ success: true, deleted })
  } catch (err) {
    console.error('Error deleting product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
