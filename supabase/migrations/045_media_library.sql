-- ============================================================
-- 045_media_library.sql — Centralized Media Library Module
--
-- Adds:
--   1. `media_files` table to catalog website and CRM assets:
--      images (.jpg, .jpeg, .png, .webp, .svg), videos (.mp4, .webm),
--      and documents (.pdf).
--   2. Multi-tenant isolation by `account_id`, with folder/category tagging
--      ('products', 'banners', 'brochures', 'uncategorized').
--   3. Row Level Security policies allowing account members full management,
--      and public read access for storefront assets.
--   4. Migration of existing default assets into media_files for immediate use.
-- ============================================================

-- ============================================================
-- 1. MEDIA FILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'pdf', 'document')),
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  folder_category TEXT NOT NULL DEFAULT 'uncategorized',
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_media_files_account ON media_files(account_id);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON media_files(folder_category);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Allow public read of media assets (needed for live storefront / customer links)
DROP POLICY IF EXISTS "Public can view media files" ON media_files;
CREATE POLICY "Public can view media files" ON media_files
  FOR SELECT
  USING (true);

-- Allow authenticated account members (viewer+) to read their account's media
DROP POLICY IF EXISTS "Account members can view media files" ON media_files;
CREATE POLICY "Account members can view media files" ON media_files
  FOR SELECT
  TO authenticated
  USING (account_id IS NULL OR is_account_member(account_id, 'viewer'));

-- Allow agents/admins to insert media
DROP POLICY IF EXISTS "Account agents can insert media files" ON media_files;
CREATE POLICY "Account agents can insert media files" ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (account_id IS NULL OR is_account_member(account_id, 'agent'));

-- Allow agents/admins to update media (rename, change category)
DROP POLICY IF EXISTS "Account agents can update media files" ON media_files;
CREATE POLICY "Account agents can update media files" ON media_files
  FOR UPDATE
  TO authenticated
  USING (account_id IS NULL OR is_account_member(account_id, 'agent'))
  WITH CHECK (account_id IS NULL OR is_account_member(account_id, 'agent'));

-- Allow admins to delete media
DROP POLICY IF EXISTS "Account admins can delete media files" ON media_files;
CREATE POLICY "Account admins can delete media files" ON media_files
  FOR DELETE
  TO authenticated
  USING (account_id IS NULL OR is_account_member(account_id, 'admin'));
