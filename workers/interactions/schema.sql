PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS post_stats (
  post_id TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0)
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT NOT NULL REFERENCES post_stats(post_id),
  visitor_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, visitor_hash)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS post_visits (
  post_id TEXT NOT NULL REFERENCES post_stats(post_id),
  visitor_hash TEXT NOT NULL,
  last_counted_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, visitor_hash)
) WITHOUT ROWID;

-- Keep records and counters atomic, including duplicate/retried requests.
CREATE TRIGGER IF NOT EXISTS post_like_insert
AFTER INSERT ON post_likes BEGIN
  UPDATE post_stats SET likes = likes + 1 WHERE post_id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS post_visit_insert
AFTER INSERT ON post_visits BEGIN
  UPDATE post_stats SET views = views + 1 WHERE post_id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS post_visit_update
AFTER UPDATE OF last_counted_at ON post_visits
WHEN NEW.last_counted_at > OLD.last_counted_at BEGIN
  UPDATE post_stats SET views = views + 1 WHERE post_id = NEW.post_id;
END;
