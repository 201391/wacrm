'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Product } from '@/types'

export type StoreLanguage = 'en' | 'hi'

interface Translations {
  [key: string]: {
    en: string
    hi: string
  }
}

const UI_STRINGS: Translations = {
  // Brand & Top Header
  brandTagline: {
    en: 'Farm & Essentials',
    hi: 'कृषि एवं ग्रामीण सामग्री',
  },
  searchPlaceholder: {
    en: 'Search for cattle feed, fertilizers, hybrid seeds, tools, kitchen...',
    hi: 'पशु आहार, खाद, बीज, कृषि उपकरण, घरेलू सामान खोजें...',
  },
  crmAdmin: {
    en: 'CRM Admin',
    hi: 'सीआरएम व्यवस्थापक',
  },
  trackOrder: {
    en: 'Track Order',
    hi: 'ऑर्डर ट्रैक करें',
  },
  wishlist: {
    en: 'Wishlist',
    hi: 'विशलिस्ट',
  },
  account: {
    en: 'Account',
    hi: 'खाता',
  },
  myCart: {
    en: 'My Cart',
    hi: 'मेरी कार्ट',
  },
  deliverTo: {
    en: 'Deliver to:',
    hi: 'डिलीवरी स्थान:',
  },
  farmerHelpline: {
    en: 'Farmer Helpline',
    hi: 'किसान हेल्पलाइन',
  },
  allCategories: {
    en: 'All Categories',
    hi: 'सभी श्रेणियां',
  },
  navHome: {
    en: 'Home',
    hi: 'होम',
  },
  navShop: {
    en: 'Shop',
    hi: 'उत्पाद',
  },
  navDeals: {
    en: 'Deals',
    hi: 'ऑफर्स',
  },
  navLivestock: {
    en: 'Livestock',
    hi: 'पशुपालन',
  },
  navAgriculture: {
    en: 'Agriculture',
    hi: 'कृषि एवं बीज',
  },

  // Category menu in header
  catCattleDairy: {
    en: '🐄 Cattle & Dairy Feed',
    hi: '🐄 पशु आहार व डेयरी पूरक',
  },
  catSeedsFertilizers: {
    en: '🌾 Seeds & Fertilizers',
    hi: '🌾 हाइब्रिड बीज व जैविक खाद',
  },
  catToolsSprayers: {
    en: '🚜 Farm Tools & Sprayers',
    hi: '🚜 कृषि उपकरण व स्प्रेयर पंप',
  },
  catHomeKitchen: {
    en: '🏡 Home & Kitchen Items',
    hi: '🏡 घरेलू व रसोई बर्तन',
  },

  // Hero Section
  heroTagline: {
    en: 'DIRECT RURAL SUPPLY • 100% GENUINE • COD AVAILABLE',
    hi: 'गाँव-गाँव तक सीधी डिलीवरी • 100% असली उत्पाद • कैश ऑन डिलीवरी',
  },
  heroTitleStart: {
    en: 'Farm & Rural Essentials Delivered to',
    hi: 'खेती और पशुपालन का हर सामान पहुंचेगा',
  },
  heroTitleHighlight: {
    en: 'Your Doorstep',
    hi: 'सीधे आपके द्वार',
  },
  heroDescription: {
    en: 'Shop lab-verified cattle feed, high-yield hybrid seeds, bio-fertilizers, knapsack sprayers, and rustic kitchen essentials with instant village delivery.',
    hi: 'लैब-परीक्षित पशु आहार, प्रमाणित हाइब्रिड बीज, बायो खाद, नैपसैक स्प्रेयर पंप और घरेलू बर्तन मंगवाएं — सीधे आपके गाँव व पंचायत तक।',
  },
  exploreCatalog: {
    en: 'Explore Catalog',
    hi: 'उत्पाद देखें',
  },
  orderOnWhatsApp: {
    en: 'Order on WhatsApp',
    hi: 'व्हाट्सएप पर ऑर्डर करें',
  },
  heroSearchPlaceholder: {
    en: 'Search cattle feed, urea, sprayers...',
    hi: 'पशु आहार, खाद, बीज, स्प्रेयर खोजें...',
  },
  searchBtn: {
    en: 'Search',
    hi: 'खोजें',
  },
  badgeFarmerChoice: {
    en: "Farmer's Choice",
    hi: 'किसानों की पहली पसंद',
  },
  badgeHighEfficiency: {
    en: 'High Efficiency',
    hi: 'उत्तम पैदावार',
  },
  badgePeakYield: {
    en: 'Peak Farm Yield',
    hi: 'अधिक उपज व लाभ',
  },

  // Shop by Category section
  shopByCategory: {
    en: 'Shop by Category',
    hi: 'श्रेणी अनुसार खरीदें',
  },
  viewAll: {
    en: 'View All',
    hi: 'सभी देखें',
  },
  cat1Title: {
    en: 'Cattle Feed & Mash',
    hi: 'पशु आहार एवं दलिया',
  },
  cat2Title: {
    en: 'Dairy Calcium & Minerals',
    hi: 'डेयरी कैल्शियम व मिनरल',
  },
  cat3Title: {
    en: 'Certified Hybrid Seeds',
    hi: 'प्रमाणित हाइब्रिड बीज',
  },
  cat4Title: {
    en: 'Bio Fertilizers & NPK',
    hi: 'जैविक खाद एवं NPK',
  },
  cat5Title: {
    en: 'Sprayers & Farm Tools',
    hi: 'स्प्रेयर एवं कृषि उपकरण',
  },
  cat6Title: {
    en: 'Blades & Hardware',
    hi: 'कुट्टी ब्लेड व हार्डवेयर',
  },
  cat7Title: {
    en: 'Home & Kitchen Utensils',
    hi: 'घरेलू व रसोई बर्तन',
  },
  cat8Title: {
    en: 'Veterinary & Care',
    hi: 'पशु चिकित्सा व देखभाल',
  },

  // Popular Products section
  popularProducts: {
    en: 'Popular Products',
    hi: 'लोकप्रिय उत्पाद',
  },
  showingResultsFor: {
    en: 'Showing results for',
    hi: 'खोज परिणाम:',
  },
  clearSearch: {
    en: 'Clear search',
    hi: 'सर्च हटाएं',
  },
  pillAll: {
    en: 'All',
    hi: 'सभी उत्पाद',
  },
  pillCattleFeed: {
    en: 'Cattle Feed',
    hi: 'पशु आहार',
  },
  pillSeedsAgri: {
    en: 'Seeds & Agri',
    hi: 'बीज व कृषि',
  },
  pillToolsSprayers: {
    en: 'Tools & Sprayers',
    hi: 'उपकरण व स्प्रेयर',
  },
  pillHomeKitchen: {
    en: 'Home & Kitchen',
    hi: 'घरेलू सामान',
  },
  loadingProducts: {
    en: 'Loading farm essentials...',
    hi: 'उत्पाद लोड हो रहे हैं...',
  },
  noProductsFound: {
    en: 'No essentials found',
    hi: 'कोई उत्पाद नहीं मिला',
  },
  noProductsDesc: {
    en: 'Try a different search keyword or change category filters.',
    hi: 'कृपया कोई दूसरा शब्द खोजें या अन्य श्रेणी चुनें।',
  },
  addToCart: {
    en: 'Add to Cart',
    hi: 'कार्ट में जोड़ें',
  },
  standardPack: {
    en: 'Standard Pack',
    hi: 'मानक पैक',
  },
  showMoreProducts: {
    en: 'Show More Products',
    hi: 'और उत्पाद देखें',
  },
  showAllProducts: {
    en: 'Show All',
    hi: 'सभी देखें',
  },
  showingCountText: {
    en: 'Showing',
    hi: 'प्रदर्शित',
  },
  ofText: {
    en: 'of',
    hi: 'कुल',
  },
  productsText: {
    en: 'products',
    hi: 'उत्पाद',
  },
  allProductsLoaded: {
    en: 'Showing all available products',
    hi: 'सभी उपलब्ध उत्पाद प्रदर्शित हैं',
  },
  showLessProducts: {
    en: 'Show less (top 10)',
    hi: 'कम दिखाएं (शुरुआती 10)',
  },

  // Three Promotional Banners
  promo1Badge: {
    en: 'High Protein',
    hi: 'उच्च प्रोटीन',
  },
  promo1Title: {
    en: 'Cattle Feed Premix',
    hi: 'पशु आहार प्रीमिक्स दलिया',
  },
  promo1Subtitle: {
    en: 'Up to 25% Off',
    hi: '25% तक की विशेष छूट',
  },
  promo2Badge: {
    en: 'Daily Essentials',
    hi: 'दैनिक आवश्यकता',
  },
  promo2Title: {
    en: 'Dairy Calcium Boosters',
    hi: 'डेयरी कैल्शियम बूस्टर',
  },
  promo2Subtitle: {
    en: 'Better Milk Yield',
    hi: 'दूध उत्पादन एवं फैट बढ़ाएं',
  },
  promo3Badge: {
    en: 'Certified Seeds',
    hi: 'प्रमाणित बीज',
  },
  promo3Title: {
    en: 'High-Yield Hybrid Seeds',
    hi: 'उच्च पैदावार हाइब्रिड बीज',
  },
  promo3Subtitle: {
    en: 'Pure & Natural',
    hi: '100% शुद्ध व अंकुरण गारंटी',
  },
  shopNow: {
    en: 'Shop Now',
    hi: 'अभी खरीदें',
  },

  // Bottom Deals Banner
  bottomBannerTitle: {
    en: 'Daily Fresh Farm Deals',
    hi: 'दैनिक ताज़ा फार्म डील्स',
  },
  bottomBannerDesc: {
    en: 'Save more on high-protein cattle feed, sprayer equipment & bulk certified hybrid seeds.',
    hi: 'उच्च प्रोटीन पशु आहार, स्प्रेयर पंप और प्रमाणित हाइब्रिड बीजों पर भारी बचत का लाभ उठाएं।',
  },
  viewDeals: {
    en: 'View Deals',
    hi: 'डील्स देखें',
  },
  upTo40Off: {
    en: 'Up to 40% OFF',
    hi: '40% तक की भारी छूट',
  },

  // Cart Drawer
  cartTitle: {
    en: 'Shopping Cart',
    hi: 'आपकी शॉपिंग कार्ट',
  },
  freeDeliveryBadge: {
    en: 'Free Village Delivery on orders over ₹999',
    hi: '₹999 से अधिक के ऑर्डर पर गाँव में मुफ्त डिलीवरी',
  },
  cartEmptyTitle: {
    en: 'Your agricultural cart is empty',
    hi: 'आपकी कार्ट अभी खाली है',
  },
  cartEmptyDesc: {
    en: 'Add cattle feed, seeds, sprayers or tools to begin.',
    hi: 'पशु आहार, बीज, स्प्रेयर या घरेलू बर्तन चुनकर शुरू करें।',
  },
  subtotal: {
    en: 'Subtotal',
    hi: 'उप-योग (Subtotal)',
  },
  villageDelivery: {
    en: 'Village Delivery',
    hi: 'गाँव में डिलीवरी',
  },
  free: {
    en: 'FREE',
    hi: 'मुफ्त',
  },
  totalAmount: {
    en: 'Total Amount',
    hi: 'कुल देय राशि',
  },
  whatsAppBuy: {
    en: 'WhatsApp Buy',
    hi: 'व्हाट्सएप से खरीदें',
  },
  checkout: {
    en: 'Checkout',
    hi: 'ऑर्डर करें',
  },

  // Floating mobile cart bar
  viewCart: {
    en: 'View Cart',
    hi: 'कार्ट देखें',
  },
  whatsAppDirectOrder: {
    en: 'WhatsApp Direct Order',
    hi: 'सीधे व्हाट्सएप पर ऑर्डर',
  },

  // Footer
  footerAdvisory: {
    en: 'Farmer Advisory',
    hi: 'किसान सलाह केंद्र',
  },
  footerSupport: {
    en: 'WhatsApp Support',
    hi: 'व्हाट्सएप सहायता',
  },
  footerPrivacy: {
    en: 'Privacy Policy',
    hi: 'गोपनीयता नीति',
  },
  footerTerms: {
    en: 'Terms of Service',
    hi: 'नियम व शर्तें',
  },
  footerTagline: {
    en: '100% Genuine Quality • Fast Village Doorstep Logistics',
    hi: '100% असली गुणवत्ता • गाँव-गाँव तक तेज़ व सुरक्षित डिलीवरी',
  },

  // Modals
  pincodeTitle: {
    en: 'Select Delivery Village / Pincode',
    hi: 'अपना गाँव / पिनकोड चुनें',
  },
  pincodeDesc: {
    en: 'Direct village doorstep logistics active across Madhya Pradesh, Rajasthan, Gujarat, and Maharashtra.',
    hi: 'मध्य प्रदेश, राजस्थान, गुजरात व महाराष्ट्र के गाँवों तक सीधी होम डिलीवरी उपलब्ध है।',
  },
  confirmLocation: {
    en: 'Confirm Location',
    hi: 'स्थान की पुष्टि करें',
  },
  helplineTitle: {
    en: 'Jatrra Farmer Helpline',
    hi: 'जात्रा किसान हेल्पलाइन',
  },
  helplineDesc: {
    en: 'Need veterinary advice, bulk cattle feed quote, or high-yield seed recommendations? Chat directly via WhatsApp with our senior agronomist.',
    hi: 'पशु चिकित्सा सलाह, थोक पशु आहार भाव या उन्नत बीज परामर्श चाहिए? हमारे कृषि विशेषज्ञ से व्हाट्सएप पर सीधे बात करें।',
  },
  openWhatsAppChat: {
    en: 'Open WhatsApp Chat',
    hi: 'व्हाट्सएप चैट शुरू करें',
  },
  verifiedLabAssay: {
    en: 'Verified Lab Assay',
    hi: 'लैब प्रमाणित गुणवत्ता',
  },
}

// Product Translations Dictionary for Catalog Items
const PRODUCT_TRANSLATIONS: Record<
  string,
  {
    title: string
    description?: string
    weight?: string
    badge?: string
  }
> = {
  'balanced-cattle-feed-pellets': {
    title: 'संतुलित पशु आहार पेलेट्स (22% प्रोटीन)',
    weight: '50 किग्रा बोरी',
    badge: 'बेस्ट सेलर',
    description: '22% बाईपास प्रोटीन एवं फोर्टिफाइड मिनरल्स, गाय-भैंस के अधिक दूध व गाढ़े फैट (SNF) के लिए सर्वश्रेष्ठ।',
  },
  'chelated-mineral-mixture': {
    title: 'कीलेटेड मिनरल मिक्सचर (खनिज मिश्रण)',
    weight: '5 किग्रा बाल्टी',
    badge: 'ऑर्गेनिक',
    description: 'जिंक, कोबाल्ट, सेलेनियम व कॉपर युक्त — बांझपन दूर करने, रोग प्रतिरोधक क्षमता और पशु स्वास्थ्य के लिए।',
  },
  'calci-gold-liquid-calcium': {
    title: 'कैल्सी-गोल्ड लिक्विड कैल्शियम बूस्टर',
    weight: '5 लीटर केन',
    badge: 'अधिक दूध',
    description: 'विटामिन D3 व B12 से समृद्ध — प्रसव के बाद मिल्क फीवर की रोकथाम व दैनिक दूध उत्पादन में वृद्धि।',
  },
  'certified-hybrid-mustard-seed': {
    title: 'प्रमाणित हाइब्रिड सरसों बीज (पूसा बोल्ड)',
    weight: '2 किग्रा पैक',
    badge: 'प्रमाणित',
    description: 'पूसा बोल्ड हाइब्रिड बीज — 42% अधिक तेल की मात्रा, भारी फलियां एवं उत्तम कीट प्रतिरोधक क्षमता।',
  },
  'bio-npk-liquid-biofertilizer': {
    title: 'बायो NPK लिक्विड जैविक खाद',
    weight: '1 लीटर बोतल',
    badge: 'इको बायो',
    description: 'एजोटोबैक्टर व पीएसबी जीवाणु खाद — मिट्टी की प्राकृतिक उर्वरता और फसलों की भरपूर पैदावार हेतु।',
  },
  'knapsack-battery-sprayer-16l': {
    title: 'नैपसैक बैटरी स्प्रेयर पंप (16 लीटर)',
    weight: '16 लीटर टंकी',
    badge: 'हैवी ड्यूटी',
    description: '12V 12Ah डबल बैटरी मोटर, 4 ब्रास नोजल एवं स्टेनलेस स्टील एक्सटेंडेबल रॉड के साथ मजबूत पंप।',
  },
  'forged-chaff-cutter-blade': {
    title: 'कुट्टी मशीन ब्लेड (फोर्ज्ड स्टील जोड़ी)',
    weight: 'जोड़ी (2 पीस)',
    badge: 'कठोर धार',
    description: 'उच्च कार्बन EN-45 स्प्रिंग स्टील — मक्का, बाजरा व हरे चारे की आसान व महीन कुट्टी के लिए।',
  },
  'stainless-steel-milk-can-20l': {
    title: 'स्टेनलेस स्टील दूध की केतली/कैन (20L)',
    weight: '20 लीटर क्षमता',
    badge: 'फूड ग्रेड स्टील',
    description: 'एयरटाइट सिलिकॉन सील ढक्कन एवं मजबूत हैंडल — डेयरी सेंटर तक सुरक्षित व स्वच्छ दूध ले जाने के लिए।',
  },
  'heavy-cast-iron-kadhai-4l': {
    title: 'भारी कच्चा लोहा कढ़ाई (4 लीटर)',
    weight: '3.4 किग्रा ठोस लोहा',
    badge: 'शुद्ध लोहा',
    description: 'प्री-सीजन्ड शुद्ध कच्चा लोहा, पीतल के हैंडल — स्वादिष्ट व पौष्टिक पारंपरिक ग्रामीण भोजन पकाने हेतु।',
  },
  'galvanized-grain-drum-100kg': {
    title: 'अनाज भंडारण जीआई कोठी/ड्रम (100Kg)',
    weight: '100 किग्रा क्षमता',
    badge: 'कीट-रोधी',
    description: 'एंटी-रस्ट जस्ती चद्दर (GI) ड्रम, एयरटाइट लॉक क्लैंप — गेहूं, चना व बीजों को नमी व कीटों से सुरक्षित रखे।',
  },
}

interface StoreLanguageContextValue {
  language: StoreLanguage
  setLanguage: (lang: StoreLanguage) => void
  toggleLanguage: () => void
  t: (key: string, fallback?: string) => string
  translateProduct: (product: Product) => Product
}

const StoreLanguageContext = createContext<StoreLanguageContextValue | null>(null)

const LANG_STORAGE_KEY = 'jatrra_store_lang_v1'

export function StoreLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<StoreLanguage>('en')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as StoreLanguage | null
      if (saved === 'hi' || saved === 'en') {
        setLanguageState(saved)
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const setLanguage = useCallback((lang: StoreLanguage) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      // Ignore
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'hi' ? 'en' : 'hi'
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next)
      } catch {
        // Ignore
      }
      return next
    })
  }, [])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const item = UI_STRINGS[key]
      if (item) {
        return item[language] || item.en || fallback || key
      }
      return fallback || key
    },
    [language]
  )

  const translateProduct = useCallback(
    (product: Product): Product => {
      if (language !== 'hi') {
        return product
      }

      // Check slug match or title match
      const translation =
        PRODUCT_TRANSLATIONS[product.slug] ||
        Object.values(PRODUCT_TRANSLATIONS).find(
          (item) => item.title.toLowerCase() === product.title.toLowerCase()
        )

      if (!translation) {
        return product
      }

      return {
        ...product,
        title: translation.title || product.title,
        weight: translation.weight || product.weight,
        badge: translation.badge || product.badge,
        description: translation.description || product.description,
      }
    },
    [language]
  )

  return (
    <StoreLanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        translateProduct,
      }}
    >
      {children}
    </StoreLanguageContext.Provider>
  )
}

export function useStoreLanguage() {
  const ctx = useContext(StoreLanguageContext)
  if (!ctx) {
    throw new Error('useStoreLanguage must be used within StoreLanguageProvider')
  }
  return ctx
}
