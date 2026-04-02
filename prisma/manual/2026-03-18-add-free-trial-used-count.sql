ALTER TABLE users
ADD COLUMN IF NOT EXISTS free_trial_used_count integer NOT NULL DEFAULT 0;

UPDATE users u
SET free_trial_used_count = sub.cnt
FROM (
  SELECT user_id, COUNT(*)::int AS cnt
  FROM generations
  GROUP BY user_id
) sub
WHERE u.id = sub.user_id
  AND COALESCE(u.free_trial_used_count, 0) = 0;
