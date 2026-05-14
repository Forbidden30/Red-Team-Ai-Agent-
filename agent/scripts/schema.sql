-- Schema for the per-engagement case queue.
-- Each row is a candidate finding collected by a sub-agent that the operator hasn't
-- yet triaged into a confirmed finding.
--
-- Location: agent/engagements/<name>/cases.sqlite

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cases (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  source_agent    TEXT    NOT NULL,
  class_guess     TEXT    NOT NULL,
  artifact_ref    TEXT    NOT NULL,
  status          TEXT    NOT NULL CHECK (status IN ('pending','in_review','confirmed','rejected','duplicate')) DEFAULT 'pending',
  confidence      TEXT    NOT NULL CHECK (confidence IN ('low','medium','high')) DEFAULT 'medium',
  finding_id      TEXT,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_cases_status     ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_finding    ON cases(finding_id);
CREATE INDEX IF NOT EXISTS idx_cases_class      ON cases(class_guess);

CREATE TRIGGER IF NOT EXISTS cases_updated
AFTER UPDATE ON cases
FOR EACH ROW
BEGIN
  UPDATE cases SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- Findings table — the confirmed ones.
CREATE TABLE IF NOT EXISTS findings (
  id              TEXT    PRIMARY KEY,            -- e.g. F-01
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  title           TEXT    NOT NULL,
  class           TEXT    NOT NULL,
  severity        TEXT    NOT NULL,               -- Critical / High / Medium / Low / Info
  cvss_vector     TEXT,
  cvss_score      REAL,
  vrt             TEXT,
  affected_asset  TEXT,
  status          TEXT    NOT NULL CHECK (status IN ('open','mitigated','resolved','informational')) DEFAULT 'open',
  body_path       TEXT    NOT NULL                -- path to findings/F-NN.md
);

CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_class  ON findings(class);

-- Events log — append-only.
CREATE TABLE IF NOT EXISTS events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              TEXT    NOT NULL DEFAULT (datetime('now')),
  type            TEXT    NOT NULL,
  payload_json    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_ts   ON events(ts);
