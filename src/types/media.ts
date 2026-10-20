export type MediaFileType = 'image' | 'video' | 'pdf' | 'document'

export type MediaFolderCategory =
  | 'all'
  | 'products'
  | 'banners'
  | 'brochures'
  | 'uncategorized'

export interface MediaFile {
  id: string
  account_id?: string | null
  file_name: string
  file_url: string
  file_type: MediaFileType
  mime_type: string
  file_size: number
  folder_category: string
  storage_path?: string | null
  created_at: string
  updated_at: string
}

export interface MediaListFilter {
  search?: string
  fileType?: MediaFileType | 'all'
  folderCategory?: string
  accountId?: string
}

export interface MediaUploadResponse {
  success: boolean
  uploaded?: MediaFile[]
  media?: MediaFile
  error?: string
}
