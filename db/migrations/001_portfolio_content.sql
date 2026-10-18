-- The site is stored as one JSONB document so an admin save is atomic.
-- This migration can be re-applied safely and preserves any existing content.
CREATE TABLE IF NOT EXISTS portfolio_content (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_content
  ALTER COLUMN updated_at SET DEFAULT NOW();

INSERT INTO portfolio_content (id, data)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
