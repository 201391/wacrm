'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ExternalLink,
  Copy,
  Check,
  Download,
  FileText,
  Film,
  Image as ImageIcon,
} from 'lucide-react'
import type { MediaFile } from '@/types/media'
import { formatFileSize } from '@/lib/media/format'
import { toast } from 'sonner'

interface MediaPreviewDialogProps {
  media: MediaFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MediaPreviewDialog({
  media,
  open,
  onOpenChange,
}: MediaPreviewDialogProps) {
  const [copied, setCopied] = React.useState(false)

  if (!media) return null

  const handleCopy = () => {
    const fullUrl = media.file_url.startsWith('http')
      ? media.file_url
      : `${window.location.origin}${media.file_url}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success('Direct URL copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getFullUrl = () => {
    if (typeof window === 'undefined') return media.file_url
    return media.file_url.startsWith('http')
      ? media.file_url
      : `${window.location.origin}${media.file_url}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              {media.file_type === 'image' && <ImageIcon className="w-4 h-4" />}
              {media.file_type === 'video' && <Film className="w-4 h-4" />}
              {(media.file_type === 'pdf' || media.file_type === 'document') && (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold truncate text-foreground">
                {media.file_name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <span className="uppercase font-bold tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-muted">
                  {media.file_type}
                </span>
                <span>•</span>
                <span>{formatFileSize(media.file_size)}</span>
                <span>•</span>
                <span className="capitalize">{media.folder_category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </Button>
            <a
              href={getFullUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 text-xs gap-1.5')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>
          </div>
        </DialogHeader>

        {/* Media Preview Container */}
        <div className="flex-1 bg-muted/40 min-h-[300px] max-h-[65vh] flex items-center justify-center p-4 overflow-auto">
          {media.file_type === 'image' && (
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={media.file_url}
                alt={media.file_name}
                className="max-h-[60vh] max-w-full object-contain rounded-md shadow-sm border border-border"
                onError={(e) => {
                  ;(e.target as any).src =
                    'https://placehold.co/600x400/f1f5f9/0b7b3e?text=Failed+to+load+image'
                }}
              />
            </div>
          )}

          {media.file_type === 'video' && (
            <div className="w-full max-w-2xl rounded-lg overflow-hidden border border-border bg-black shadow-lg">
              <video
                src={media.file_url}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[60vh]"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>
          )}

          {(media.file_type === 'pdf' || media.file_type === 'document') && (
            <div className="w-full h-[55vh] flex flex-col items-center justify-center p-6 text-center bg-card rounded-lg border border-border">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {media.file_name}
              </h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-md">
                PDF Document ({formatFileSize(media.file_size)}). You can view the document directly in a browser tab or download it to your device.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={getFullUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in PDF Viewer
                </a>
                <a
                  href={getFullUrl()}
                  download={media.file_name}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Details Footer */}
        <div className="p-3 bg-muted/20 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="truncate max-w-md">
            <span className="font-medium text-foreground">Direct URL: </span>
            <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground select-all">
              {media.file_url}
            </code>
          </div>
          <div>
            <span>Uploaded: {new Date(media.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
