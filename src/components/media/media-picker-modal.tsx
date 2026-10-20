'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
import {
  Search,
  UploadCloud,
  Check,
  CheckCircle2,
  Film,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Folder,
  Layers,
  Eye,
  Plus,
} from 'lucide-react'
import type { MediaFile, MediaFileType } from '@/types/media'
import { formatFileSize } from '@/lib/media/format'
import { MediaPreviewDialog } from './media-preview-dialog'
import { toast } from 'sonner'

export interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selected: MediaFile | MediaFile[], url: string | string[]) => void
  allowedTypes?: MediaFileType[]
  defaultCategory?: string
  multiple?: boolean
  title?: string
  description?: string
  currentValue?: string | string[]
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  allowedTypes,
  defaultCategory,
  multiple = false,
  title,
  description,
  currentValue,
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse')
  const [mediaList, setMediaList] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(
    allowedTypes && allowedTypes.length === 1 ? allowedTypes[0] : 'all'
  )
  const [categoryFilter, setCategoryFilter] = useState<string>(
    defaultCategory || 'all'
  )

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Uploading state
  const [uploading, setUploading] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<string>(
    defaultCategory || 'products'
  )
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview lightbox inside picker
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Pre-seed selection from currentValue when opened
  useEffect(() => {
    if (open) {
      if (currentValue) {
        const urls = Array.isArray(currentValue) ? currentValue : [currentValue]
        // Will match against loaded media
        if (mediaList.length > 0) {
          const matched = mediaList
            .filter((m) => urls.includes(m.file_url))
            .map((m) => m.id)
          setSelectedIds(new Set(matched))
        }
      } else {
        setSelectedIds(new Set())
      }
    }
  }, [open, currentValue, mediaList])

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/media?${params.toString()}`)
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.media)) {
        setMediaList(data.media)
      } else {
        throw new Error(data.error || 'Failed to load media')
      }
    } catch (err: any) {
      console.error('Error loading media:', err)
      toast.error('Failed to load media library assets')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, categoryFilter])

  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open, fetchMedia])

  // Filter media based on allowedTypes prop
  const displayedMedia = useMemo(() => {
    if (!allowedTypes || allowedTypes.length === 0) return mediaList
    return mediaList.filter((m) => allowedTypes.includes(m.file_type))
  }, [mediaList, allowedTypes])

  const handleToggleSelect = (item: MediaFile) => {
    if (multiple) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(item.id)) {
          next.delete(item.id)
        } else {
          next.add(item.id)
        }
        return next
      })
    } else {
      setSelectedIds(new Set([item.id]))
    }
  }

  const handleConfirmSelection = () => {
    const selectedItems = displayedMedia.filter((m) => selectedIds.has(m.id))
    if (selectedItems.length === 0) {
      toast.error('Please select an asset first')
      return
    }

    if (multiple) {
      const urls = selectedItems.map((m) => m.file_url)
      onSelect(selectedItems, urls)
    } else {
      const single = selectedItems[0]
      onSelect(single, single.file_url)
    }
    onOpenChange(false)
  }

  // Handle direct file upload inside picker modal
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    formData.append('category', uploadCategory)

    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success(
        data.uploaded?.length > 1
          ? `Uploaded ${data.uploaded.length} assets successfully!`
          : `Asset uploaded: ${data.media?.file_name}`
      )

      // Auto-select newly uploaded items
      if (multiple && data.uploaded && data.uploaded.length > 0) {
        onSelect(
          data.uploaded,
          data.uploaded.map((m: MediaFile) => m.file_url)
        )
      } else if (data.media) {
        onSelect(data.media, data.media.file_url)
      }

      // Refresh library & close modal
      await fetchMedia()
      onOpenChange(false)
    } catch (err: any) {
      console.error('Picker upload error:', err)
      toast.error(err.message || 'Error uploading file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 sm:p-5 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <span>{title || 'Media Library Picker'}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {description ||
                    'Select existing files from your central media repository or upload new assets directly.'}
                </DialogDescription>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'browse'
                      ? 'bg-background text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Browse Assets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload New</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* TAB 1: BROWSE MEDIA */}
          {activeTab === 'browse' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search & Filter Toolbar */}
              <div className="p-3 sm:px-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by filename..."
                    className="h-8 pl-8 text-xs bg-background"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Type Filter Buttons */}
                  <div className="flex items-center gap-1 p-0.5 bg-background border border-border rounded-lg text-xs">
                    {(['all', 'image', 'video', 'pdf'] as const).map((t) => {
                      if (allowedTypes && allowedTypes.length > 0 && t !== 'all' && !allowedTypes.includes(t as MediaFileType)) {
                        return null
                      }
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTypeFilter(t)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition capitalize cursor-pointer ${
                            typeFilter === t
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t === 'all'
                            ? 'All'
                            : t === 'image'
                            ? 'Images'
                            : t === 'video'
                            ? 'Videos'
                            : 'PDFs'}
                        </button>
                      )
                    })}
                  </div>

                  {/* Folder Category Dropdown */}
                  <div className="flex items-center gap-1">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">📁 All Folders</option>
                      <option value="products">Products</option>
                      <option value="banners">Banners</option>
                      <option value="brochures">Brochures / PDFs</option>
                      <option value="uncategorized">Uncategorized</option>
                    </select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={fetchMedia}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Refresh library"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {loading && mediaList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-xs">Loading media assets...</span>
                  </div>
                ) : displayedMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">No media assets found</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      {search || typeFilter !== 'all' || categoryFilter !== 'all'
                        ? 'Try adjusting your filters or search query.'
                        : 'Your media library is empty. Upload your first asset to get started!'}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setActiveTab('upload')}
                      className="mt-4 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Asset</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {displayedMedia.map((item) => {
                      const isSelected = selectedIds.has(item.id)
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleSelect(item)}
                          className={`group relative flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all duration-150 select-none ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                              : 'border-border bg-card hover:border-border/80 hover:shadow-xs'
                          }`}
                        >
                          {/* Selection Checkmark */}
                          <div
                            className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-full flex items-center justify-center transition ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-background/80 text-transparent border border-border group-hover:text-muted-foreground'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>

                          {/* Quick Preview Lightbox Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewMedia(item)
                              setPreviewOpen(true)
                            }}
                            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md bg-background/80 hover:bg-background text-foreground shadow-2xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Preview asset"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {/* Thumbnail */}
                          <div className="aspect-square w-full bg-muted/60 relative flex items-center justify-center overflow-hidden">
                            {item.file_type === 'image' ? (
                              <img
                                src={item.file_url}
                                alt={item.file_name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  ;(e.target as any).src =
                                    'https://placehold.co/200x200/f1f5f9/0b7b3e?text=Thumbnail'
                                }}
                              />
                            ) : item.file_type === 'video' ? (
                              <div className="flex flex-col items-center justify-center p-3 text-center text-primary">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                                  <Film className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Video
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center text-rose-600">
                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-1">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  PDF
                                </span>
                              </div>
                            )}

                            {/* Badge */}
                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-xs text-foreground shadow-2xs">
                                {item.file_type}
                              </span>
                            </div>
                          </div>

                          {/* Asset Info */}
                          <div className="p-2 border-t border-border/60 bg-card">
                            <p
                              className="text-xs font-semibold text-foreground truncate"
                              title={item.file_name}
                            >
                              {item.file_name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                              <span>{formatFileSize(item.file_size)}</span>
                              <span className="capitalize truncate max-w-[60px]">
                                {item.folder_category}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Dialog Footer Actions */}
              <DialogFooter className="p-3 sm:px-5 border-t border-border bg-muted/20 flex flex-row items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {selectedIds.size > 0 ? (
                    <span className="font-semibold text-foreground">
                      {selectedIds.size} {selectedIds.size === 1 ? 'asset' : 'assets'} selected
                    </span>
                  ) : (
                    <span>Click an asset to select</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
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
                    disabled={selectedIds.size === 0}
                    onClick={handleConfirmSelection}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Select {selectedIds.size > 1 ? `(${selectedIds.size})` : ''}</span>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}

          {/* TAB 2: UPLOAD DIRECTLY IN PICKER */}
          {activeTab === 'upload' && (
            <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-y-auto">
              <div className="w-full max-w-lg space-y-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assign Destination Folder:</span>
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="products">📦 Products (Catalog / Gallery)</option>
                    <option value="banners">🖼️ Banners (Hero / Sliders)</option>
                    <option value="brochures">📑 Brochures & Documentation (PDF)</option>
                    <option value="uncategorized">📂 Uncategorized</option>
                  </select>
                </div>

                {/* Drag and drop upload box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    if (e.dataTransfer.files) {
                      handleUploadFiles(e.dataTransfer.files)
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                    dragOver
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
                      : 'border-border hover:border-emerald-500/60 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={
                      allowedTypes && allowedTypes.length > 0
                        ? allowedTypes
                            .map((t) =>
                              t === 'image'
                                ? 'image/*'
                                : t === 'video'
                                ? 'video/*'
                                : t === 'pdf'
                                ? 'application/pdf'
                                : '*/*'
                            )
                            .join(',')
                        : 'image/*,video/*,application/pdf'
                    }
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleUploadFiles(e.target.files)
                    }}
                  />

                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    {uploading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <UploadCloud className="w-7 h-7" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {uploading
                        ? 'Uploading & logging asset...'
                        : 'Drag & drop media files here, or click to browse'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports high-resolution Images (.jpg, .png, .webp, .svg), Videos (.mp4, .webm), and PDFs (up to 100MB)
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={uploading}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Processing upload...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Choose File from Device</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox Preview */}
      <MediaPreviewDialog
        media={previewMedia}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}
