-- ============================================================
-- 044_ecommerce_orders.sql — E-Commerce Storefront & Orders Engine
--
-- Adds:
--   1. Sequence and generator for human-readable order short codes (e.g. ORD-1024).
--   2. `products` table for catalog items with stock, pricing, and multi-tenant isolation.
--   3. `orders` table linked to `contacts` and `conversations`.
--   4. RLS policies allowing public storefront queries for active products,
--      and account members (agents/admins) full management rights.
--   5. Seed products for immediate storefront demonstration.
-- ============================================================

-- ============================================================
-- 1. ORDER SHORT CODE SEQUENCE & HELPER
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_short_code_seq START WITH 1024;

CREATE OR REPLACE FUNCTION generate_order_short_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'ORD-' || nextval('order_short_code_seq')::text;
$$;

-- ============================================================
-- 2. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_products_account_slug UNIQUE (account_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_account_active ON products(account_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read of active products for the storefront
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT
  USING (is_active = true);

-- Allow account members to manage all products for their account
DROP POLICY IF EXISTS "Account members can view all account products" ON products;
CREATE POLICY "Account members can view all account products" ON products
  FOR SELECT
  TO authenticated
  USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS "Account agents can insert products" ON products;
CREATE POLICY "Account agents can insert products" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS "Account agents can update products" ON products;
CREATE POLICY "Account agents can update products" ON products
  FOR UPDATE
  TO authenticated
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS "Account admins can delete products" ON products;
CREATE POLICY "Account admins can delete products" ON products
  FOR DELETE
  TO authenticated
  USING (is_account_member(account_id, 'admin'));

-- ============================================================
-- 3. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL,
  customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  phone_number TEXT,
  customer_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PENDING_WHATSAPP', 'CONFIRMED', 'CANCELLED')) DEFAULT 'DRAFT',
  shipping_address TEXT,
  payment_preference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_orders_account_short_code UNIQUE (account_id, short_code)
);

CREATE INDEX IF NOT EXISTS idx_orders_account_status ON orders(account_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_short_code ON orders(short_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_conversation_id ON orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone_number);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow account members to view orders
DROP POLICY IF EXISTS "Account members can view orders" ON orders;
CREATE POLICY "Account members can view orders" ON orders
  FOR SELECT
  TO authenticated
  USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS "Account agents can manage orders" ON orders;
CREATE POLICY "Account agents can manage orders" ON orders
  FOR ALL
  TO authenticated
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

-- Allow public insertion of draft orders via checkout
DROP POLICY IF EXISTS "Public can create draft orders" ON orders;
CREATE POLICY "Public can create draft orders" ON orders
  FOR INSERT
  WITH CHECK (status IN ('DRAFT', 'PENDING_WHATSAPP'));

-- ============================================================
-- 4. SEED SAMPLE PRODUCTS (IF NONE EXIST)
-- ============================================================
DO $$
DECLARE
  acct_rec RECORD;
BEGIN
  FOR acct_rec IN SELECT id FROM accounts LOOP
    IF NOT EXISTS (SELECT 1 FROM products WHERE account_id = acct_rec.id LIMIT 1) THEN
      INSERT INTO products (account_id, title, slug, price, stock, images, description, is_active)
      VALUES
        (
          acct_rec.id,
          'AeroPulse Wireless Noise-Cancelling Headphones',
          'aeropulse-wireless-headphones',
          149.99,
          35,
          '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"]'::jsonb,
          'Premium active noise-cancelling over-ear headphones with 40-hour battery life, plush memory foam earcups, and crystal-clear microphone audio.',
          true
        ),
        (
          acct_rec.id,
          'Vanguard Chrono Smartwatch Ultra',
          'vanguard-chrono-smartwatch-ultra',
          199.00,
          20,
          '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"]'::jsonb,
          'Aerospace titanium case, sapphire crystal AMOLED display, heart rate and SpO2 tracking, with IP68 waterproof rating for adventure.',
          true
        ),
        (
          acct_rec.id,
          'Lumina Pro Mechanical Studio Keyboard',
          'lumina-pro-mechanical-keyboard',
          119.50,
          45,
          '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"]'::jsonb,
          'Compact 75% hot-swappable tactile mechanical keyboard with custom pre-lubed switches, acoustic dampening foam, and per-key RGB backlighting.',
          true
        ),
        (
          acct_rec.id,
          'Nomad Canvas & Leather Travel Backpack',
          'nomad-canvas-leather-travel-backpack',
          89.00,
          15,
          '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"]'::jsonb,
          'Waxed weather-resistant cotton canvas with full-grain leather straps, padded 16-inch laptop compartment, and concealed passport pocket.',
          true
        ),
        (
          acct_rec.id,
          'HydroPure Insulated Thermal Flask (1L)',
          'hydropure-insulated-thermal-flask-1l',
          34.99,
          60,
          '["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80"]'::jsonb,
          'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks icy cold for 24 hours or steaming hot for 12 hours.',
          true
        );
    END IF;
  END LOOP;
END $$;
