'use client'

import React, { useState, useRef, useMemo } from 'react'
import {
  Upload,
  FileSpreadsheet,
  Link as LinkIcon,
  ClipboardPaste,
  Check,
  AlertTriangle,
  X,
  FileText,
  Download,
  Loader2,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  parseProductCsv,
  parseGoogleSheetsUrl,
  getSampleProductCsv,
  type ParsedProductRow,
  type ParsedProductImportResult,
} from '@/lib/products/parse-product-import'

interface BulkImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: () => void
}

type ImportSourceTab = 'csv' | 'sheets' | 'paste'

export function BulkImportModal({
  open,
  onOpenChange,
  onImportComplete,
}: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<ImportSourceTab>('csv')
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<ParsedProductImportResult | null>(null)

  // Loading states
  const [fetchingSheets, setFetchingSheets] = useState(false)
  const [importing, setImporting] = useState(false)
  const [updateExisting, setUpdateExisting] = useState(true)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Clear / Reset
  const handleReset = () => {
    setParseResult(null)
    setUploadedFileName(null)
    setSheetsUrl('')
    setPastedText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handle CSV file selection or drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const parsed = parseProductCsv(content)
        setParseResult(parsed)
        if (parsed.validRows.length === 0) {
          toast.error('No valid product rows found in this file.')
        } else {
          toast.success(`Parsed ${parsed.validRows.length} valid products from CSV!`)
        }
      }
    }
    reader.readAsText(file)
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const parsed = parseProductCsv(content)
        setParseResult(parsed)
        if (parsed.validRows.length === 0) {
          toast.error('No valid product rows found in this file.')
        } else {
          toast.success(`Parsed ${parsed.validRows.length} valid products!`)
        }
      }
    }
    reader.readAsText(file)
  }

  // Handle fetching Google Sheets
  const handleFetchGoogleSheets = async () => {
    if (!sheetsUrl.trim()) {
      toast.error('Please enter a Google Sheets URL')
      return
    }

    try {
      setFetchingSheets(true)
      const res = await fetch('/api/products/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetsUrl.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch Google Sheet')
      }

      setParseResult(data.parsed)
      setUploadedFileName(`Google Sheet (${data.parsed.validRows.length} items)`)
      toast.success(
        `Successfully loaded ${data.parsed.validRows.length} products from Google Sheets!`
      )
    } catch (err: any) {
      toast.error(err.message || 'Error fetching Google Sheet')
    } finally {
      setFetchingSheets(false)
    }
  }

  // Handle direct text paste parsing
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      toast.error('Please paste CSV or tabular data first.')
      return
    }
    const parsed = parseProductCsv(pastedText)
    setParseResult(parsed)
    setUploadedFileName(`Pasted Text (${parsed.validRows.length} items)`)
    if (parsed.validRows.length === 0) {
      toast.error('Could not find valid product rows in pasted data.')
    } else {
      toast.success(`Parsed ${parsed.validRows.length} products from pasted data!`)
    }
  }

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent = getSampleProductCsv()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'products_bulk_import_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Sample CSV Template downloaded!')
  }

  // Execute bulk import API
  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) {
      toast.error('No valid products to import.')
      return
    }

    try {
      setImporting(true)
      const payload = {
        updateExisting,
        products: parseResult.validRows.map((r) => ({
          title: r.title,
          price: r.price,
          original_price: r.original_price,
          category: r.category,
          weight: r.weight,
          stock: r.stock,
          description: r.description,
          images: r.images,
          badge: r.badge,
          badge_color: r.badge_color,
          is_active: r.is_active,
        })),
      }

      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Bulk import failed')
      }

      const totalDone = (data.createdCount || 0) + (data.updatedCount || 0)
      toast.success(
        `Import complete! ${data.createdCount || 0} created, ${data.updatedCount || 0} updated.`
      )

      onImportComplete?.()
      onOpenChange(false)
      handleReset()
    } catch (err: any) {
      toast.error(err.message || 'Bulk import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  Bulk Import Catalog Products
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Import or update agricultural products in bulk using CSV files or directly from Google Sheets.
                </DialogDescription>
              </div>
            </div>

            {/* Template Download Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSampleCsv}
              className="text-xs gap-1.5 self-start sm:self-auto border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV Template</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Source Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/80 pt-1 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('csv')
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'csv'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted/70 hover:bg-muted text-foreground border border-border/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sheets')
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted/70 hover:bg-muted text-foreground border border-border/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('paste')
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'paste'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted/70 hover:bg-muted text-foreground border border-border/60'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Copy & Paste Data</span>
          </button>
        </div>

        {/* TAB 1: CSV FILE UPLOAD */}
        {activeTab === 'csv' && (
          <div className="space-y-3 pt-2">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-emerald-500/80 bg-muted/20 hover:bg-emerald-500/5 rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .tsv, .txt, text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-foreground block">
                  Click to select CSV file, or drag and drop
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Supports comma-delimited (.csv) and tab-delimited (.tsv) files
                </span>
              </div>
            </div>

            {uploadedFileName && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-foreground">{uploadedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE SHEETS LINK */}
        {activeTab === 'sheets' && (
          <div className="space-y-3 pt-2">
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Paste Public Google Sheets Link</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0.../edit?usp=sharing"
                    className="text-xs h-9 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={fetchingSheets || !sheetsUrl.trim()}
                    onClick={handleFetchGoogleSheets}
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                  >
                    {fetchingSheets ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Fetch & Preview Sheet</span>
                  </Button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-muted-foreground space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How to make your Google Sheet importable:</span>
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground pl-1">
                  <li>In Google Sheets, click the blue <strong>Share</strong> button at the top-right.</li>
                  <li>Under <em>General access</em>, change <strong>Restricted</strong> to <strong>Anyone with the link</strong> (Viewer).</li>
                  <li>Click <strong>Copy link</strong> and paste it into the box above.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COPY & PASTE DATA */}
        {activeTab === 'paste' && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Paste Table Data (from Excel, Google Sheets, or CSV)</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  Tab-delimited or Comma-delimited
                </span>
              </label>
              <Textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Title&#9;Price&#9;Category&#9;Pack Size&#9;Stock&#10;Balanced Cattle Feed Pellets&#9;1249&#9;Cattle Feed&#9;50 kg Pack&#9;45"
                className="text-xs font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!pastedText.trim()}
                  onClick={handleParsePastedText}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Parse Pasted Content</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================= VALIDATION & LIVE PREVIEW TABLE ================= */}
        {parseResult && (
          <div className="space-y-3 pt-3 border-t border-border/80">
            {/* Summary Chips & Update Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs gap-1 border-border bg-card">
                  <span>Total Rows:</span>
                  <strong className="text-foreground">{parseResult.totalRows}</strong>
                </Badge>
                <Badge className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-600 text-white font-semibold">
                  <Check className="w-3 h-3" />
                  <span>{parseResult.validRows.length} Ready to Import</span>
                </Badge>
                {parseResult.invalidRows.length > 0 && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{parseResult.invalidRows.length} Issues / Skipped</span>
                  </Badge>
                )}
              </div>

              {/* Update existing toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span>Update existing products if title matches</span>
              </label>
            </div>

            {/* Preview Table */}
            <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-muted-foreground font-semibold border-b border-border sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Row</th>
                    <th className="p-2.5 w-20">Status</th>
                    <th className="p-2.5">Product Title</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Pack</th>
                    <th className="p-2.5">Price (₹)</th>
                    <th className="p-2.5">Stock</th>
                    <th className="p-2.5">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parseResult.rows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={
                        row.isValid
                          ? 'hover:bg-muted/30 transition'
                          : 'bg-rose-500/10 hover:bg-rose-500/15 transition'
                      }
                    >
                      <td className="p-2.5 text-center text-muted-foreground font-mono">
                        {row.rowNumber}
                      </td>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" /> Valid
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full"
                            title={row.error}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          {row.images && row.images[0] && (
                            <img
                              src={row.images[0]}
                              alt=""
                              className="w-7 h-7 rounded-md object-cover border border-border flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground line-clamp-1">
                              {row.title || <em className="text-muted-foreground">(Empty)</em>}
                            </span>
                            {row.error && (
                              <span className="text-[10px] text-rose-500 block">
                                {row.error}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {row.category}
                        </span>
                      </td>
                      <td className="p-2.5 text-muted-foreground font-medium">{row.weight}</td>
                      <td className="p-2.5 font-bold text-foreground">
                        ₹{row.price}
                        {row.original_price && (
                          <span className="text-[10px] text-muted-foreground line-through ml-1 font-normal">
                            ₹{row.original_price}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-medium">{row.stock}</td>
                      <td className="p-2.5">
                        {row.badge ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            {row.badge}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/80 pt-3">
          <div className="flex items-center gap-2">
            {parseResult && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Preview
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={importing || !parseResult || parseResult.validRows.length === 0}
              onClick={handleExecuteImport}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs cursor-pointer font-bold"
            >
              {importing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>
                Import {parseResult ? parseResult.validRows.length : 0} Products
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
