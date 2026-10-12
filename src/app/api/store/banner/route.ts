import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface BannerConfig {
  tagline: string
  title: string
  highlightedWord: string
  description: string
  imageUrl: string
  badgeCategory: string
  badgeTitle: string
  badgeEmoji: string
}

const DEFAULT_BANNER: BannerConfig = {
  tagline: 'FRESH • RELIABLE • QUALITY',
  title: 'Farm & Rural Essentials Delivered to Your Doorstep',
  highlightedWord: 'Your Doorstep',
  description:
    'Shop lab-verified cattle feed, high-yield hybrid seeds, bio-fertilizers, knapsack sprayers, and sturdy village kitchen cookware. Delivered straight to your doorstep or panchayat.',
  imageUrl:
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  badgeCategory: 'High Efficiency',
  badgeTitle: 'Peak Farm Yield',
  badgeEmoji: '🚜',
}

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

export function getBannerConfig(): BannerConfig {
  try {
    const file = getBannerFilePath()
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      return { ...DEFAULT_BANNER, ...JSON.parse(content) }
    }
  } catch (err) {
    console.warn('[store/banner] failed reading banner config, using defaults:', err)
  }
  return DEFAULT_BANNER
}

export function saveBannerConfig(config: Partial<BannerConfig>): BannerConfig {
  const current = getBannerConfig()
  const updated = { ...current, ...config }
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
  return NextResponse.json({ success: true, banner: config })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const updated = saveBannerConfig(body)
    return NextResponse.json({ success: true, banner: updated })
  } catch (err) {
    console.error('Error saving banner config:', err)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}
