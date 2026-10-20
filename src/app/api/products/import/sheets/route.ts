import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/account'
import {
  parseGoogleSheetsUrl,
  parseProductCsv,
} from '@/lib/products/parse-product-import'

export async function POST(request: Request) {
  try {
    await requireRole('admin')
  } catch (authErr: any) {
    return NextResponse.json(
      {
        error:
          authErr?.message ||
          'Forbidden: You must be logged in as an administrator to import from Google Sheets.',
      },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Google Sheets URL is required' },
        { status: 400 }
      )
    }

    const sheetsInfo = parseGoogleSheetsUrl(url)
    if (!sheetsInfo) {
      return NextResponse.json(
        {
          error:
            'Invalid Google Sheets link. Please provide a standard Google Sheets URL (e.g. https://docs.google.com/spreadsheets/d/.../edit).',
        },
        { status: 400 }
      )
    }

    // Fetch the CSV export from Google
    const response = await fetch(sheetsInfo.exportUrl, {
      headers: {
        Accept: 'text/csv, text/plain, */*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      redirect: 'follow',
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Could not fetch Google Sheet (HTTP ${response.status}). Please check your URL and make sure sharing is set to 'Anyone with the link can view'.`,
        },
        { status: 400 }
      )
    }

    const text = await response.text()

    // Check if Google returned an HTML login redirect page instead of CSV
    if (
      text.includes('<html') ||
      text.includes('ServiceLogin') ||
      text.includes('accounts.google.com')
    ) {
      return NextResponse.json(
        {
          error:
            "This Google Sheet is private. In Google Sheets, click 'Share' (top right) and set General access to 'Anyone with the link' (Viewer). Or download as CSV and upload directly.",
        },
        { status: 400 }
      )
    }

    const parsed = parseProductCsv(text)

    return NextResponse.json({
      success: true,
      csvText: text,
      parsed,
    })
  } catch (err: any) {
    console.error('Error fetching Google Sheet:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch Google Sheet' },
      { status: 500 }
    )
  }
}
