import { PDFParse } from 'pdf-parse'

/**
 * Clean a filename into a human-readable document title:
 * e.g. "product-catalog-2026_v2.pdf" -> "Product Catalog 2026 V2"
 */
export function formatDocumentTitleFromFilename(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, '')
  const cleaned = baseName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return 'Uploaded Document'

  // Title Case words
  return cleaned
    .split(' ')
    .map((word) => {
      if (word.length <= 1) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Format CSV or TSV content into clean, readable text records for LLMs.
 */
export function formatCsvForKnowledge(csvText: string, delimiter = ','): string {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return ''
  if (lines.length === 1) return lines[0]

  // Parse header
  const header = parseDelimitedLine(lines[0], delimiter)

  // Format up to first 1000 rows as structured records
  const formattedRows: string[] = []
  for (let i = 1; i < lines.length && i <= 1000; i++) {
    const cols = parseDelimitedLine(lines[i], delimiter)
    const rowDetails = header
      .map((colName, idx) => `${colName || `Column ${idx + 1}`}: ${cols[idx] ?? ''}`)
      .join(' | ')
    formattedRows.push(`- Record #${i}: ${rowDetails}`)
  }

  const result = [
    `Table schema (${header.join(', ')}):`,
    `Total rows: ${lines.length - 1}`,
    '',
    ...formattedRows,
  ].join('\n')

  return result
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  // Simple CSV/TSV parser supporting quoted fields
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/**
 * Strip HTML tags, style, script, and decode common entities
 */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format JSON content into readable documentation
 */
export function formatJsonForKnowledge(jsonText: string): string {
  try {
    const parsed = JSON.parse(jsonText)
    if (Array.isArray(parsed)) {
      return (
        `Structured Dataset (${parsed.length} entries):\n\n` +
        JSON.stringify(parsed, null, 2)
      )
    }
    return JSON.stringify(parsed, null, 2)
  } catch {
    return jsonText
  }
}

/**
 * Extract clean text content from a file buffer.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  _mimeType?: string,
): Promise<{ title: string; content: string }> {
  const title = formatDocumentTitleFromFilename(fileName)
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  // 1. PDF Documents
  if (ext === 'pdf') {
    try {
      const parser = new PDFParse({ data: buffer })
      const textResult = await parser.getText()
      let extracted = ''
      if (typeof textResult === 'string') {
        extracted = textResult
      } else if (textResult && typeof textResult === 'object') {
        // PDFParse returns { text: '...', pages: [...] } or similar
        extracted = (textResult as any).text || (textResult as any).pages?.map((p: any) => p.text).join('\n') || ''
      }
      extracted = extracted.trim()
      if (extracted) {
        return { title, content: extracted }
      }
    } catch (pdfErr) {
      console.warn(`[extractTextFromFile] PDF parsing failed for ${fileName}:`, pdfErr)
    }
  }

  // 2. CSV / TSV Files
  if (ext === 'csv') {
    const text = buffer.toString('utf-8')
    return { title, content: formatCsvForKnowledge(text, ',') }
  }
  if (ext === 'tsv') {
    const text = buffer.toString('utf-8')
    return { title, content: formatCsvForKnowledge(text, '\t') }
  }

  // 3. JSON Files
  if (ext === 'json') {
    const text = buffer.toString('utf-8')
    return { title, content: formatJsonForKnowledge(text) }
  }

  // 4. HTML Files
  if (ext === 'html' || ext === 'htm') {
    const text = buffer.toString('utf-8')
    return { title, content: stripHtmlToText(text) }
  }

  // 5. Default text / markdown / log / yaml / etc.
  const rawText = buffer.toString('utf-8').trim()
  return { title, content: rawText }
}
