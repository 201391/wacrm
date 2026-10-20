-- ============================================================
-- 047_ai_gemini_provider.sql — Support Google Gemini AI provider
--
-- Updates:
--   1. `ai_configs.provider` check constraint to include 'gemini'
--   2. `ai_usage_log.provider` check constraint to include 'gemini'
-- ============================================================

ALTER TABLE ai_configs
  DROP CONSTRAINT IF EXISTS ai_configs_provider_check;

ALTER TABLE ai_configs
  ADD CONSTRAINT ai_configs_provider_check
  CHECK (provider IN ('gemini', 'openai', 'anthropic'));

ALTER TABLE ai_usage_log
  DROP CONSTRAINT IF EXISTS ai_usage_log_provider_check;

ALTER TABLE ai_usage_log
  ADD CONSTRAINT ai_usage_log_provider_check
  CHECK (provider IN ('gemini', 'openai', 'anthropic'));
