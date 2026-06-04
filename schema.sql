-- Leadership Diary D1 Schema
-- Run: wrangler d1 execute leadership-diary-db --file=schema.sql

CREATE TABLE IF NOT EXISTS entries (
  id          TEXT    PRIMARY KEY,
  week_index  INTEGER NOT NULL,
  entry_type  TEXT    NOT NULL, -- 'photo' | 'insight' | 'learning' | 'growth' | 'speaker-notes' | 'events' | 'thought'
  title       TEXT,
  content     TEXT,
  image       TEXT,             -- R2 URL for photo entries
  caption     TEXT,
  date        TEXT    NOT NULL,
  timestamp   INTEGER NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entries_week  ON entries(week_index);
CREATE INDEX IF NOT EXISTS idx_entries_time  ON entries(timestamp DESC);
