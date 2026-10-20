-- ============================================================
-- 046_product_seo_meta.sql — Dedicated SEO & Meta Settings for Products
--
-- Adds:
--   1. SEO columns to the `products` table:
--      - `meta_title`: Custom meta title tag (50–60 chars recommended)
--      - `meta_description`: Custom search snippet description (150–160 chars)
--      - `canonical_url`: Custom canonical link override
--      - `keywords`: Array of search keywords / tags
--      - `og_title`: Social card Open Graph title
--      - `og_description`: Social card Open Graph description
--      - `og_image_url`: Social card Open Graph image URL
--      - `twitter_card`: Twitter card format ('summary', 'summary_large_image')
--      - `no_index`: Robots directive to disallow crawler indexing
--      - `no_follow`: Robots directive to disallow crawler link-following
--      - `structured_data`: Optional JSON-LD overrides or schema configuration
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  ADD COLUMN IF NOT EXISTS no_index BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_follow BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS structured_data JSONB;

CREATE INDEX IF NOT EXISTS idx_products_seo_noindex ON products(no_index);
