import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/account'
import { bulkCreateOrUpdateProducts } from '@/lib/orders/store'

export async function POST(request: Request) {
  try {
    await requireRole('admin')
  } catch (authErr: any) {
    return NextResponse.json(
      {
        error:
          authErr?.message ||
          'Forbidden: You must be logged in as an administrator to bulk import products.',
      },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const products = Array.isArray(body) ? body : body.products
    const updateExisting = body.updateExisting !== false

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: products array is required' },
        { status: 400 }
      )
    }

    const result = await bulkCreateOrUpdateProducts(products, { updateExisting })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (err: any) {
    console.error('Error during bulk product import:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to bulk import products' },
      { status: 500 }
    )
  }
}
