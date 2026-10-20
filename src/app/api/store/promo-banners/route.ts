import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/account'
import {
  getBannerConfig,
  saveBannerConfig,
  DEFAULT_PROMO_BANNERS,
  type PromoBannerCard,
} from '@/app/api/store/banner/route'

export async function GET() {
  const config = getBannerConfig()
  return NextResponse.json({
    success: true,
    promoBanners: config.promoBanners || DEFAULT_PROMO_BANNERS,
  })
}

export async function POST(request: Request) {
  try {
    await requireRole('admin')
  } catch (authErr: any) {
    return NextResponse.json(
      {
        error:
          authErr?.message ||
          'Forbidden: You must be logged in as an administrator to edit promotional banners.',
      },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const promoBanners: PromoBannerCard[] = Array.isArray(body)
      ? body
      : body.promoBanners || []

    if (!Array.isArray(promoBanners) || promoBanners.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: promoBanners array is required' },
        { status: 400 }
      )
    }

    const updated = saveBannerConfig({ promoBanners })
    return NextResponse.json({
      success: true,
      promoBanners: updated.promoBanners,
    })
  } catch (err: any) {
    console.error('Error saving promo banners:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to update promo banners' },
      { status: 500 }
    )
  }
}
