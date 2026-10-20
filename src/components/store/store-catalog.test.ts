import { describe, expect, it } from 'vitest'

interface MockProduct {
  id: string
  title: string
  category: string
  price: number
}

function filterAndPaginateProducts(
  products: MockProduct[],
  currentFilter: string,
  searchQuery: string,
  visibleCount: number
) {
  const filtered = products.filter((p) => {
    const matchesCategory = currentFilter === 'all' || p.category === currentFilter
    const s = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !s ||
      p.title.toLowerCase().includes(s) ||
      (p.category && p.category.toLowerCase().includes(s))
    return matchesCategory && matchesSearch
  })

  const displayed = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const remainingCount = Math.max(0, filtered.length - visibleCount)

  return {
    totalMatching: filtered.length,
    displayedCount: displayed.length,
    displayed,
    hasMore,
    remainingCount,
  }
}

describe('Store Catalog Pagination & Category Filtering', () => {
  const mockProducts: MockProduct[] = Array.from({ length: 25 }, (_, i) => ({
    id: `prod-${i + 1}`,
    title: `Product ${i + 1}`,
    category: i < 15 ? 'cattle-feed' : 'seeds-fert',
    price: 100 + i * 10,
  }))

  const PAGE_SIZE = 10

  it('shows only 10 products initially when viewing all products', () => {
    const result = filterAndPaginateProducts(mockProducts, 'all', '', PAGE_SIZE)
    expect(result.totalMatching).toBe(25)
    expect(result.displayedCount).toBe(10)
    expect(result.hasMore).toBe(true)
    expect(result.remainingCount).toBe(15)
  })

  it('shows only 10 products when a user clicks on cattle-feed category (15 total)', () => {
    const result = filterAndPaginateProducts(mockProducts, 'cattle-feed', '', PAGE_SIZE)
    expect(result.totalMatching).toBe(15)
    expect(result.displayedCount).toBe(10)
    expect(result.hasMore).toBe(true)
    expect(result.remainingCount).toBe(5)
  })

  it('shows all products when category has 10 or fewer products', () => {
    const result = filterAndPaginateProducts(mockProducts, 'seeds-fert', '', PAGE_SIZE)
    expect(result.totalMatching).toBe(10)
    expect(result.displayedCount).toBe(10)
    expect(result.hasMore).toBe(false)
    expect(result.remainingCount).toBe(0)
  })

  it('increases visible count by 10 when user clicks Show More Products', () => {
    let visibleCount = PAGE_SIZE
    let result = filterAndPaginateProducts(mockProducts, 'cattle-feed', '', visibleCount)
    expect(result.displayedCount).toBe(10)

    // User clicks "Show More Products"
    visibleCount += PAGE_SIZE
    result = filterAndPaginateProducts(mockProducts, 'cattle-feed', '', visibleCount)
    expect(result.displayedCount).toBe(15)
    expect(result.hasMore).toBe(false)
    expect(result.remainingCount).toBe(0)
  })

  it('resets visible count back to 10 when user switches categories', () => {
    let visibleCount = PAGE_SIZE + PAGE_SIZE // 20
    let currentFilter = 'all'

    let result = filterAndPaginateProducts(mockProducts, currentFilter, '', visibleCount)
    expect(result.displayedCount).toBe(20)

    // Switching category resets visibleCount to PAGE_SIZE
    currentFilter = 'cattle-feed'
    visibleCount = PAGE_SIZE
    result = filterAndPaginateProducts(mockProducts, currentFilter, '', visibleCount)
    expect(result.displayedCount).toBe(10)
    expect(result.hasMore).toBe(true)
    expect(result.remainingCount).toBe(5)
  })
})
