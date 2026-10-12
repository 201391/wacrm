import { NextResponse } from 'next/server'
import { listProducts, createProduct } from '@/lib/orders/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const accountId = searchParams.get('account_id') || undefined
    const all = searchParams.get('all') === 'true'

    const products = await listProducts({
      search,
      category,
      accountId,
      activeOnly: !all
    })

    return NextResponse.json({
      success: true,
      products
    })
  } catch (err) {
    console.error('Error fetching products:', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.title || typeof body.price === 'undefined') {
      return NextResponse.json(
        { error: 'Product title and price are required' },
        { status: 400 }
      )
    }

    const newProduct = await createProduct(body)

    return NextResponse.json({
      success: true,
      product: newProduct
    })
  } catch (err) {
    console.error('Error creating product:', err)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
