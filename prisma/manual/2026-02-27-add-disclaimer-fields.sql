ALTER TABLE users ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS disclaimer_version text;
