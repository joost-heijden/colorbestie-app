ALTER TABLE users
ADD COLUMN IF NOT EXISTS learn_current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS learn_longest_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS learn_last_visit_date date;
