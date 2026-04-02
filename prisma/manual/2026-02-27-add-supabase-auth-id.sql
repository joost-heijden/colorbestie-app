-- Phase 4 auth mapping support
-- Applied manually with `prisma db execute` to avoid accidental schema drops from db push.

ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_auth_id text;
CREATE UNIQUE INDEX IF NOT EXISTS users_supabase_auth_id_key ON users (supabase_auth_id) WHERE supabase_auth_id IS NOT NULL;
