import { NextResponse } from 'next/server'
import { listOrders, getOrderStats } from '@/lib/orders/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const accountId = searchParams.get('account_id') || undefined

    const [orders, stats] = await Promise.all([
      listOrders({ status, search, accountId }),
      getOrderStats(accountId)
    ])

    return NextResponse.json({
      success: true,
      orders,
      stats
    })
  } catch (err) {
    console.error('Error fetching orders:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
