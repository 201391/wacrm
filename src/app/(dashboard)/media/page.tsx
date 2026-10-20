'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  UploadCloud,
  Search,
  Filter,
  Image as ImageIcon,
  Film,
  FileText,
  Copy,
  Check,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  RefreshCw,
  Plus,
  Folder,
  Layers,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { MediaFile, MediaFileType } from '@/types/media'
import { formatFileSize } from '@/lib/media/format'
import { MediaPreviewDialog } from '@/components/media/media-preview-dialog'
import { toast } from 'sonner'

interface UploadProgressItem {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | MediaFileType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Upload Zone State
  const [isDragging, setIsDragging] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<string>('products')
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview Lightbox State
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Rename Dialog State
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [mediaToRename, setMediaToRename] = useState<MediaFile | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [newFileCategory, setNewFileCategory] = useState('')
  const [renaming, setRenaming] = useState(false)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Copied URL state tracker for visual feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch Media Items
  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/media?${params.toString()}`)
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.media)) {
        setMediaList(data.media)
      } else {
        throw new Error(data.error || 'Failed to fetch media assets')
      }
    } catch (err: any) {
      console.error('Error fetching media:', err)
      toast.error('Failed to load media assets')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, categoryFilter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Bulk Upload Handler
  const handleBulkUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (files.length === 0) return

    // Initialize progress items
    const newItems: UploadProgressItem[] = files.map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      progress: 15,
      status: 'uploading',
    }))

    setUploadQueue((prev) => [...newItems, ...prev])

    // Upload in bulk
    const formData = new FormData()
    formData.append('category', uploadCategory)
    files.forEach((f) => formData.append('files', f))

    try {
      // Simulate progressive feedback
      const timer = setInterval(() => {
        setUploadQueue((prev) =>
          prev.map((item) => {
            if (newItems.some((n) => n.id === item.id) && item.status === 'uploading') {
              return { ...item, progress: Math.min(90, item.progress + 25) }
            }
            return item
          })
        )
      }, 250)

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(timer)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload files')
      }

      // Mark items completed
      setUploadQueue((prev) =>
        prev.map((item) => {
          if (newItems.some((n) => n.id === item.id)) {
            return { ...item, progress: 100, status: 'completed' }
          }
          return item
        })
      )

      toast.success(
        data.uploaded?.length > 1
          ? `Successfully uploaded ${data.uploaded.length} assets!`
          : `Asset "${data.media?.file_name}" uploaded successfully!`
      )

      // Refresh list
      fetchMedia()

      // Auto clear completed items after 4 seconds
      setTimeout(() => {
        setUploadQueue((prev) =>
          prev.filter((item) => !newItems.some((n) => n.id === item.id))
        )
      }, 4000)
    } catch (err: any) {
      console.error('Upload failed:', err)
      setUploadQueue((prev) =>
        prev.map((item) => {
          if (newItems.some((n) => n.id === item.id)) {
            return {
              ...item,
              status: 'error',
              error: err.message || 'Upload error',
            }
          }
          return item
        })
      )
      toast.error(err.message || 'File upload failed')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Copy Direct Public URL
  const handleCopyUrl = (item: MediaFile) => {
    const fullUrl = item.file_url.startsWith('http')
      ? item.file_url
      : `${window.location.origin}${item.file_url}`

    navigator.clipboard.writeText(fullUrl)
    setCopiedId(item.id)
    toast.success('Direct public URL copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Open Rename Dialog
  const handleOpenRename = (item: MediaFile) => {
    setMediaToRename(item)
    setNewFileName(item.file_name)
    setNewFileCategory(item.folder_category)
    setRenameDialogOpen(true)
  }

  // Save Rename
  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaToRename || !newFileName.trim()) return

    setRenaming(true)
    try {
      const res = await fetch(`/api/media/${mediaToRename.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: newFileName.trim(),
          folder_category: newFileCategory,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to rename media file')
      }

      toast.success('Media details updated successfully!')
      setRenameDialogOpen(false)
      fetchMedia()
    } catch (err: any) {
      toast.error(err.message || 'Error updating media file')
    } finally {
      setRenaming(false)
    }
  }

  // Open Delete Confirmation
  const handleOpenDelete = (item: MediaFile) => {
    setMediaToDelete(item)
    setDeleteDialogOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/media/${mediaToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete file')
      }

      toast.success(`Deleted "${mediaToDelete.file_name}" from storage and database`)
      setDeleteDialogOpen(false)
      fetchMedia()
    } catch (err: any) {
      toast.error(err.message || 'Error deleting file')
    } finally {
      setDeleting(false)
    }
  }

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalFiles = mediaList.length
    const totalBytes = mediaList.reduce((acc, m) => acc + (m.file_size || 0), 0)
    const imagesCount = mediaList.filter((m) => m.file_type === 'image').length
    const videosCount = mediaList.filter((m) => m.file_type === 'video').length
    const pdfsCount = mediaList.filter(
      (m) => m.file_type === 'pdf' || m.file_type === 'document'
    ).length
    return {
      totalFiles,
      totalBytes,
      imagesCount,
      videosCount,
      pdfsCount,
    }
  }, [mediaList])

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Media Library</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Centralized Repository
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Upload, organize, preview, and select high-res images, videos, and product brochure PDFs for your storefront.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Storage Stats Strip */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-2.5 sm:px-4 shadow-2xs self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">
                Total Storage
              </span>
              <span className="font-bold text-foreground">
                {formatFileSize(stats.totalBytes)}
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-xs">
            <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">
              Assets
            </span>
            <span className="font-bold text-foreground">
              {stats.totalFiles} files
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="text-xs hidden sm:block">
            <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">
              Breakdown
            </span>
            <span className="text-[11px] font-medium text-foreground">
              🖼️ {stats.imagesCount} • 🎥 {stats.videosCount} • 📑 {stats.pdfsCount}
            </span>
          </div>
        </div>
      </div>

      {/* DRAG & DROP AND CLICK-TO-BROWSE UPLOAD ZONE */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-foreground">Upload Website & Storefront Media</span>
          </div>

          {/* Destination Folder Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" />
              Folder:
            </span>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              <option value="products">📦 Products (Thumbnails & Gallery)</option>
              <option value="banners">🖼️ Banners (Hero Sliders & Promos)</option>
              <option value="brochures">📑 Brochures & Documentation (PDFs)</option>
              <option value="uncategorized">📂 Uncategorized</option>
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files) {
              handleBulkUpload(e.dataTransfer.files)
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 scale-[1.005]'
              : 'border-border/80 hover:border-emerald-500/70 bg-muted/20 hover:bg-muted/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.svg,.gif,.mp4,.webm,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleBulkUpload(e.target.files)
            }}
          />

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground">
              Drag & Drop your media files here, or <span className="text-emerald-600 underline">browse files</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
              Upload multiple files at once. Supports <strong>Images</strong> (.jpg, .png, .webp, .svg), <strong>Videos</strong> (.mp4, .webm), and <strong>Brochures</strong> (.pdf) up to 100MB each.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
              🖼️ Images
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
              🎥 Videos
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
              📑 Documents
            </span>
          </div>
        </div>

        {/* Upload Progress Queue */}
        {uploadQueue.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border/80 pt-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Active Uploads ({uploadQueue.length})</span>
              <button
                type="button"
                onClick={() => setUploadQueue([])}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border text-xs"
                >
                  <div className="shrink-0">
                    {item.status === 'uploading' && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatFileSize(item.size)}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full transition-all duration-200 ${
                          item.status === 'error'
                            ? 'bg-rose-500'
                            : item.status === 'completed'
                            ? 'bg-emerald-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Real-time Filename Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets by filename..."
              className="h-9 pl-9 text-xs bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* File Type Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/70 rounded-xl text-xs">
              {[
                { id: 'all', label: 'All', icon: Layers },
                { id: 'image', label: 'Images', icon: ImageIcon },
                { id: 'video', label: 'Videos', icon: Film },
                { id: 'pdf', label: 'PDFs', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = typeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTypeFilter(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-background text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchMedia}
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh Media"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Virtual Folder / Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-muted-foreground pt-1 border-t border-border/60">
          <span className="font-semibold text-foreground text-[11px] mr-1 shrink-0 flex items-center gap-1">
            <Folder className="w-3 h-3 text-emerald-600" />
            Folder:
          </span>
          {[
            { id: 'all', label: 'All Folders' },
            { id: 'products', label: '📦 Products' },
            { id: 'banners', label: '🖼️ Banners' },
            { id: 'brochures', label: '📑 Brochures / PDFs' },
            { id: 'uncategorized', label: '📂 Uncategorized' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MEDIA ASSET GRID */}
      {loading && mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Loading Media Library assets...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">No media assets found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {search || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'No media files match your current search or filter criteria. Try clearing filters.'
              : 'Your media library is ready. Upload images, videos, or PDFs above to get started.'}
          </p>
          {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setTypeFilter('all')
                setCategoryFilter('all')
              }}
              className="mt-4 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-emerald-500/60 hover:shadow-md transition-all duration-200"
            >
              {/* Media Thumbnail Container */}
              <div
                onClick={() => {
                  setPreviewMedia(item)
                  setPreviewOpen(true)
                }}
                className="aspect-square w-full bg-muted/60 relative flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {item.file_type === 'image' ? (
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      ;(e.target as any).src =
                        'https://placehold.co/300x300/f1f5f9/0b7b3e?text=Image+Asset'
                    }}
                  />
                ) : item.file_type === 'video' ? (
                  <div className="flex flex-col items-center justify-center p-3 text-center text-primary">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                      <Film className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Video Asset
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center text-rose-600">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      PDF Document
                    </span>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-background/85 backdrop-blur-xs text-foreground shadow-2xs border border-border/50">
                    {item.file_type}
                  </span>
                </div>

                {/* Hover Quick Actions Overlay */}
                <div className="absolute inset-0 bg-background/70 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewMedia(item)
                      setPreviewOpen(true)
                    }}
                    className="p-2 rounded-lg bg-background hover:bg-muted text-foreground shadow-xs border border-border cursor-pointer transition hover:scale-105"
                    title="Preview in Lightbox"
                  >
                    <Eye className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyUrl(item)
                    }}
                    className="p-2 rounded-lg bg-background hover:bg-muted text-foreground shadow-xs border border-border cursor-pointer transition hover:scale-105"
                    title="Copy direct public URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-primary" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenRename(item)
                    }}
                    className="p-2 rounded-lg bg-background hover:bg-muted text-foreground shadow-xs border border-border cursor-pointer transition hover:scale-105"
                    title="Rename / Move Folder"
                  >
                    <Edit2 className="w-4 h-4 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDelete(item)
                    }}
                    className="p-2 rounded-lg bg-background hover:bg-muted text-rose-600 shadow-xs border border-border cursor-pointer transition hover:scale-105"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Asset Card Metadata */}
              <div className="p-3 border-t border-border flex flex-col justify-between flex-1 bg-card">
                <div>
                  <h4
                    className="text-xs font-semibold text-foreground truncate"
                    title={item.file_name}
                  >
                    {item.file_name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{formatFileSize(item.file_size)}</span>
                    <span className="capitalize font-medium px-1.5 py-0.2 rounded bg-muted">
                      {item.folder_category}
                    </span>
                  </div>
                </div>

                {/* Footer Quick Action */}
                <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item)}
                    className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <span className="text-[9px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      <MediaPreviewDialog
        media={previewMedia}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {/* RENAME / EDIT ASSET DIALOG */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-600" />
              <span>Rename & Move Asset</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update the display filename or reorganize this file into another virtual folder.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRename} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">File Name</label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.jpg"
                required
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Virtual Folder Category</label>
              <select
                value={newFileCategory}
                onChange={(e) => setNewFileCategory(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="products">Products</option>
                <option value="banners">Banners</option>
                <option value="brochures">Brochures / PDFs</option>
                <option value="uncategorized">Uncategorized</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={renaming}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {renaming ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete Media Asset</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">"{mediaToDelete?.file_name}"</strong>?
              This will remove the file from storage and delete its metadata record from the database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="text-xs font-semibold"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
