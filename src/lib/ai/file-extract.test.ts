import { describe, it, expect } from 'vitest'
import {
  formatDocumentTitleFromFilename,
  formatCsvForKnowledge,
  stripHtmlToText,
  formatJsonForKnowledge,
  extractTextFromFile,
} from './file-extract'

describe('file-extract', () => {
  it('formats document title from filename', () => {
    expect(formatDocumentTitleFromFilename('company-refund_policy-2026.pdf')).toBe(
      'Company Refund Policy 2026',
    )
    expect(formatDocumentTitleFromFilename('faq_v2.md')).toBe('Faq V2')
    expect(formatDocumentTitleFromFilename('.txt')).toBe('Uploaded Document')
  })

  it('formats CSV into structured records', () => {
    const csv = 'Product,Price,Stock\nCoffee Mug,$12,50\nEspresso Maker,$150,10'
    const formatted = formatCsvForKnowledge(csv)
    expect(formatted).toContain('Table schema (Product, Price, Stock):')
    expect(formatted).toContain('Product: Coffee Mug | Price: $12 | Stock: 50')
    expect(formatted).toContain('Product: Espresso Maker | Price: $150 | Stock: 10')
  })

  it('strips HTML to plain readable text', () => {
    const html = '<h1>Welcome &amp; Hello</h1><p>Our hours are 9am to 5pm.</p><script>alert("bad")</script>'
    const stripped = stripHtmlToText(html)
    expect(stripped).toBe('Welcome & Hello Our hours are 9am to 5pm.')
  })

  it('formats JSON nicely', () => {
    const json = JSON.stringify([{ id: 1, name: 'Service A' }])
    const formatted = formatJsonForKnowledge(json)
    expect(formatted).toContain('Structured Dataset (1 entries):')
    expect(formatted).toContain('"name": "Service A"')
  })

  it('extracts plain markdown and text files', async () => {
    const buffer = Buffer.from('# Shipping Guidelines\nWe ship in 2-3 business days.')
    const result = await extractTextFromFile(buffer, 'shipping-guidelines.md')
    expect(result.title).toBe('Shipping Guidelines')
    expect(result.content).toContain('# Shipping Guidelines')
  })
})
