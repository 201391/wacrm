import { describe, expect, it } from 'vitest'
import {
  parseProductCsv,
  parsePrice,
  normalizeCategory,
  parseGoogleSheetsUrl,
  getSampleProductCsv,
} from './parse-product-import'

describe('Product Import Parser (parse-product-import)', () => {
  it('parses price with currency symbols and commas', () => {
    expect(parsePrice('₹1,249.00')).toBe(1249)
    expect(parsePrice('1249')).toBe(1249)
    expect(parsePrice('$99.50')).toBe(99.5)
    expect(parsePrice('free')).toBeUndefined()
    expect(parsePrice('')).toBeUndefined()
  })

  it('normalizes categories intelligently', () => {
    expect(normalizeCategory('Cattle & Dairy Feed')).toBe('cattle-feed')
    expect(normalizeCategory('Seeds & Bio-Fertilizers')).toBe('seeds-fert')
    expect(normalizeCategory('Knapsack Sprayers & Farm Tools')).toBe('agri-tools')
    expect(normalizeCategory('Kitchen Utensils')).toBe('home-kitchen')
    expect(normalizeCategory('')).toBe('cattle-feed')
  })

  it('parses standard CSV with quotes and commas', () => {
    const csv = [
      'Title,Price,Original Price,Category,Pack Size,Stock,Badge,Description,Active',
      'Super Cow Feed,1200,1400,Cattle Feed,50kg,20,Organic,"High protein, 24% bypass",Yes',
      'Wheat Seed,450,,Seeds,10kg,50,,Clean wheat seeds,No',
    ].join('\n')

    const result = parseProductCsv(csv)
    expect(result.totalRows).toBe(2)
    expect(result.validRows.length).toBe(2)
    expect(result.hasTitleColumn).toBe(true)
    expect(result.hasPriceColumn).toBe(true)

    const row1 = result.rows[0]
    expect(row1.title).toBe('Super Cow Feed')
    expect(row1.price).toBe(1200)
    expect(row1.original_price).toBe(1400)
    expect(row1.category).toBe('cattle-feed')
    expect(row1.weight).toBe('50kg')
    expect(row1.stock).toBe(20)
    expect(row1.description).toBe('High protein, 24% bypass')
    expect(row1.is_active).toBe(true)

    const row2 = result.rows[1]
    expect(row2.title).toBe('Wheat Seed')
    expect(row2.price).toBe(450)
    expect(row2.original_price).toBeUndefined()
    expect(row2.category).toBe('seeds-fert')
    expect(row2.is_active).toBe(false)
  })

  it('parses TSV (Google Sheets copy-paste data)', () => {
    const tsv = [
      'Product Name\tSelling Price\tMRP\tCategory\tStock',
      'Mineral Mixture Bucket\t680\t790\tCattle Feed\t40',
      'Battery Sprayer\t1950\t2200\tAgri Tools\t15',
    ].join('\n')

    const result = parseProductCsv(tsv)
    expect(result.detectedDelimiter).toBe('\t')
    expect(result.validRows.length).toBe(2)
    expect(result.rows[0].title).toBe('Mineral Mixture Bucket')
    expect(result.rows[0].price).toBe(680)
    expect(result.rows[0].original_price).toBe(790)
    expect(result.rows[1].title).toBe('Battery Sprayer')
    expect(result.rows[1].category).toBe('agri-tools')
  })

  it('marks rows with missing title or invalid price as invalid', () => {
    const csv = [
      'Title,Price',
      ',500',
      'Valid Product,invalid-price',
      'Good Product,250',
    ].join('\n')

    const result = parseProductCsv(csv)
    expect(result.totalRows).toBe(3)
    expect(result.validRows.length).toBe(1)
    expect(result.invalidRows.length).toBe(2)
    expect(result.rows[0].isValid).toBe(false)
    expect(result.rows[0].error).toContain('title')
    expect(result.rows[1].isValid).toBe(false)
    expect(result.rows[1].error).toContain('price')
    expect(result.rows[2].isValid).toBe(true)
  })

  it('converts standard Google Sheets URLs to CSV export links', () => {
    const sheetUrl =
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing#gid=0'
    const parsed = parseGoogleSheetsUrl(sheetUrl)
    expect(parsed).not.toBeNull()
    expect(parsed?.sheetId).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')
    expect(parsed?.gid).toBe('0')
    expect(parsed?.exportUrl).toContain(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&gid=0'
    )
  })

  it('returns valid sample CSV string', () => {
    const sample = getSampleProductCsv()
    const parsed = parseProductCsv(sample)
    expect(parsed.validRows.length).toBeGreaterThanOrEqual(5)
    expect(parsed.invalidRows.length).toBe(0)
  })
})
