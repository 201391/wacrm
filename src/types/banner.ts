export type BannerMediaType = 'image' | 'gif' | 'video'

export interface StoreBannerSlide {
  id: string
  imageUrl: string
  videoUrl?: string
  mediaType?: BannerMediaType
  title: string
  subtitle?: string
  badgeText?: string
  badgeEmoji?: string
  badgeColor?: string
  categoryFilter?: string
  linkUrl?: string
  ctaText?: string
  active: boolean
}

export function getSlideMediaType(slide: {
  mediaType?: string
  imageUrl?: string
  videoUrl?: string
}): BannerMediaType {
  if (slide.mediaType === 'video') return 'video'
  if (slide.mediaType === 'gif') return 'gif'
  if (slide.mediaType === 'image') return 'image'

  const url = (slide.videoUrl || slide.imageUrl || '').toLowerCase()
  if (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg') ||
    url.endsWith('.mov') ||
    url.endsWith('.m4v') ||
    url.startsWith('data:video/')
  ) {
    return 'video'
  }
  if (url.endsWith('.gif') || url.startsWith('data:image/gif')) {
    return 'gif'
  }
  return 'image'
}

export interface PromoBannerCard {
  id: string
  badge: string
  title: string
  subtitle: string
  ctaText?: string
  categoryFilter?: string
  linkUrl?: string
  iconType?: 'emoji' | 'image'
  icon: string
  theme: 'green' | 'amber' | 'dark' | 'blue' | 'purple' | 'red' | string
  active: boolean
}

export const PROMO_THEME_STYLES: Record<
  string,
  {
    name: string
    container: string
    badge: string
    title: string
    subtitle: string
    button: string
    iconBg: string
  }
> = {
  green: {
    name: 'Mint Emerald (Cattle Feed)',
    container: 'bg-gradient-to-br from-[#dff2e3] to-[#eaf7ee] border-emerald-200/70',
    badge: 'bg-white/70 text-[#086331]',
    title: 'text-slate-900',
    subtitle: 'text-[#086331]',
    button: 'bg-[#0b7b3e] hover:bg-[#086331] text-white',
    iconBg: 'bg-white/60',
  },
  amber: {
    name: 'Warm Orange (Dairy Booster)',
    container: 'bg-gradient-to-br from-[#fde6ce] to-[#fef0e3] border-amber-200/70',
    badge: 'bg-white/70 text-amber-800',
    title: 'text-slate-900',
    subtitle: 'text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    iconBg: 'bg-white/60',
  },
  dark: {
    name: 'Dark Forest (Certified Seeds)',
    container: 'bg-gradient-to-br from-[#1e3a34] to-[#142e27] text-white border-slate-700',
    badge: 'bg-emerald-900/80 text-emerald-300',
    title: 'text-white',
    subtitle: 'text-emerald-400',
    button: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold',
    iconBg: 'bg-white/10',
  },
  blue: {
    name: 'Ocean Blue (Tools & Hardware)',
    container: 'bg-gradient-to-br from-[#dbeafe] to-[#eff6ff] border-blue-200/70',
    badge: 'bg-white/70 text-blue-800',
    title: 'text-slate-900',
    subtitle: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    iconBg: 'bg-white/60',
  },
  purple: {
    name: 'Royal Purple (Organic & Bio)',
    container: 'bg-gradient-to-br from-[#f3e8ff] to-[#faf5ff] border-purple-200/70',
    badge: 'bg-white/70 text-purple-800',
    title: 'text-slate-900',
    subtitle: 'text-purple-700',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    iconBg: 'bg-white/60',
  },
  red: {
    name: 'Coral Rose (Special Offer)',
    container: 'bg-gradient-to-br from-[#ffe4e6] to-[#fff1f2] border-rose-200/70',
    badge: 'bg-white/70 text-rose-800',
    title: 'text-slate-900',
    subtitle: 'text-rose-700',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
    iconBg: 'bg-white/60',
  },
}

export const DEFAULT_PROMO_BANNERS: PromoBannerCard[] = [
  {
    id: 'promo-1',
    badge: 'High Protein',
    title: 'Cattle Feed Premix',
    subtitle: 'Up to 25% Off',
    ctaText: 'Shop Now',
    categoryFilter: 'cattle-feed',
    iconType: 'emoji',
    icon: '🐄',
    theme: 'green',
    active: true,
  },
  {
    id: 'promo-2',
    badge: 'Daily Essentials',
    title: 'Dairy Calcium Boosters',
    subtitle: 'Better Milk Yield',
    ctaText: 'Shop Now',
    categoryFilter: 'cattle-feed',
    iconType: 'emoji',
    icon: '🥛',
    theme: 'amber',
    active: true,
  },
  {
    id: 'promo-3',
    badge: 'Certified Seeds',
    title: 'High-Yield Hybrid Seeds',
    subtitle: 'Pure & Natural',
    ctaText: 'Shop Now',
    categoryFilter: 'seeds-fert',
    iconType: 'emoji',
    icon: '🌾',
    theme: 'dark',
    active: true,
  },
]

export interface StoreBannersConfig {
  intervalMs: number
  banners: StoreBannerSlide[]
  promoBanners?: PromoBannerCard[]
  // Legacy single banner fields preserved for backward compatibility
  tagline?: string
  title?: string
  highlightedWord?: string
  description?: string
  imageUrl?: string
  badgeCategory?: string
  badgeTitle?: string
  badgeEmoji?: string
}

export const DEFAULT_BANNER_SLIDES: StoreBannerSlide[] = [
  {
    id: 'banner-cattle-feed',
    imageUrl:
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1600&q=80',
    title: 'Lab-Verified Cattle Feed & Boosters',
    subtitle:
      'Boost livestock health & increase daily milk yield by up to 25% with certified protein feeds.',
    badgeText: 'Dairy Special',
    badgeEmoji: '🐄',
    badgeColor: 'bg-emerald-600',
    categoryFilter: 'cattle-feed',
    ctaText: 'Shop Cattle Feed',
    active: true,
  },
  {
    id: 'banner-seeds-agri',
    imageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    title: 'High-Yield Hybrid Seeds & Bio-Fertilizers',
    subtitle:
      '100% germination tested seeds directly from verified farmer co-operatives & university labs.',
    badgeText: 'High Yield',
    badgeEmoji: '🌾',
    badgeColor: 'bg-amber-600',
    categoryFilter: 'seeds-fert',
    ctaText: 'Explore Seeds & Agri',
    active: true,
  },
  {
    id: 'banner-sprayers-tools',
    imageUrl:
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=80',
    title: 'Battery Sprayers & Sturdy Farm Tools',
    subtitle:
      'Continuous 12V knapsack battery sprayers with brass nozzles, spare lances & 1-year warranty.',
    badgeText: 'Heavy Duty',
    badgeEmoji: '🚜',
    badgeColor: 'bg-blue-600',
    categoryFilter: 'agri-tools',
    ctaText: 'View Sprayers & Tools',
    active: true,
  },
  {
    id: 'banner-home-kitchen',
    imageUrl:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80',
    title: 'Traditional Village Cookware & Home Essentials',
    subtitle:
      'Pre-seasoned heavy iron kadais, brass cookware and long-lasting rural kitchen essentials.',
    badgeText: 'Village Living',
    badgeEmoji: '🥘',
    badgeColor: 'bg-orange-600',
    categoryFilter: 'home-kitchen',
    ctaText: 'Shop Home & Kitchen',
    active: true,
  },
  {
    id: 'banner-doorstep-delivery',
    imageUrl:
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1600&q=80',
    title: 'Doorstep & Panchayat Delivery Across Districts',
    subtitle:
      'Fast rural delivery straight to your village. Cash on Delivery (COD) & UPI payment supported.',
    badgeText: 'Direct Delivery',
    badgeEmoji: '🚚',
    badgeColor: 'bg-purple-600',
    categoryFilter: 'all',
    ctaText: 'Browse All Essentials',
    active: true,
  },
]

export const DEFAULT_BANNERS_CONFIG: StoreBannersConfig = {
  intervalMs: 2000,
  banners: DEFAULT_BANNER_SLIDES,
  promoBanners: DEFAULT_PROMO_BANNERS,
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
