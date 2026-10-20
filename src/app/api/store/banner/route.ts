import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireRole } from '@/lib/auth/account'
import {
  type StoreBannerSlide,
  type StoreBannersConfig,
  type PromoBannerCard,
  DEFAULT_BANNER_SLIDES,
  DEFAULT_BANNERS_CONFIG,
  DEFAULT_PROMO_BANNERS,
} from '@/types/banner'

export type { StoreBannerSlide, StoreBannersConfig, PromoBannerCard }
export { DEFAULT_BANNER_SLIDES, DEFAULT_BANNERS_CONFIG, DEFAULT_PROMO_BANNERS }

function getBannerFilePath(): string {
  const dir = path.join(process.cwd(), '.data')
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // ignore
    }
  }
  return path.join(dir, 'banner.json')
}

export function getBannerConfig(): StoreBannersConfig {
  try {
    const file = getBannerFilePath()
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8').trim()
      if (content && content.startsWith('{')) {
        const parsed = JSON.parse(content)
        // Normalize banners array
        let banners =
          Array.isArray(parsed.banners) && parsed.banners.length > 0
            ? parsed.banners
            : DEFAULT_BANNER_SLIDES

        // Normalize promoBanners array
        let promoBanners =
          Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0
            ? parsed.promoBanners
            : DEFAULT_PROMO_BANNERS

        return {
          ...DEFAULT_BANNERS_CONFIG,
          ...parsed,
          banners,
          promoBanners,
          intervalMs: Number(parsed.intervalMs) || 2000,
        }
      }
    }
  } catch (err) {
    console.warn('[store/banner] failed reading banner config, using defaults:', err)
  }
  return {
    ...DEFAULT_BANNERS_CONFIG,
    promoBanners: DEFAULT_PROMO_BANNERS,
  }
}

export function saveBannerConfig(config: Partial<StoreBannersConfig>): StoreBannersConfig {
  const current = getBannerConfig()
  const updated: StoreBannersConfig = {
    ...current,
    ...config,
    banners:
      Array.isArray(config.banners) && config.banners.length > 0
        ? config.banners
        : current.banners,
    promoBanners:
      Array.isArray(config.promoBanners) && config.promoBanners.length > 0
        ? config.promoBanners
        : (current.promoBanners || DEFAULT_PROMO_BANNERS),
    intervalMs: Number(config.intervalMs) || current.intervalMs || 2000,
  }
  try {
    const file = getBannerFilePath()
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[store/banner] failed saving banner config:', err)
  }
  return updated
}

export async function GET() {
  const config = getBannerConfig()
  return NextResponse.json({
    success: true,
    banner: config,
    banners: config.banners,
    promoBanners: config.promoBanners || DEFAULT_PROMO_BANNERS,
    intervalMs: config.intervalMs,
  })
}

export async function POST(request: Request) {
  // SECURITY REQUIREMENT: Only admin can change store banners
  try {
    await requireRole('admin')
  } catch (authErr: any) {
    return NextResponse.json(
      {
        error:
          authErr?.message ||
          'Forbidden: You must be logged in as an administrator to change store banners.',
      },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const updated = saveBannerConfig(body)
    return NextResponse.json({
      success: true,
      banner: updated,
      banners: updated.banners,
      promoBanners: updated.promoBanners,
      intervalMs: updated.intervalMs,
    })
  } catch (err: any) {
    console.error('Error saving banner config:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to update banner' },
      { status: 500 }
    )
  }
}
