-- ============================================================
-- 043_default_currency_inr.sql
--
-- Set default currency across the system to INR (Indian Rupee)
-- ============================================================

ALTER TABLE accounts
  ALTER COLUMN default_currency SET DEFAULT 'INR';

ALTER TABLE deals
  ALTER COLUMN currency SET DEFAULT 'INR';

UPDATE accounts
  SET default_currency = 'INR'
  WHERE default_currency = 'USD' OR default_currency IS NULL;

UPDATE deals
  SET currency = 'INR'
  WHERE currency = 'USD' OR currency IS NULL;
