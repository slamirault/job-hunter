import Database from "better-sqlite3";
import path from "path";

// better-sqlite3 is a synchronous SQLite library for Node.
// Unlike most Node DB libraries that use callbacks/promises,
// this one is synchronous — which makes it way simpler to use.
// Perfect for a local app like this.

const DB_PATH = path.join(__dirname, "..", "data", "jobhunter.db");

const db = new Database(DB_PATH);

// WAL mode = faster reads, safe concurrent access
db.pragma("journal_mode = WAL");
// Enforce foreign keys (SQLite has them off by default!)
db.pragma("foreign_keys = ON");

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      resume TEXT NOT NULL DEFAULT '',
      skills TEXT NOT NULL DEFAULT '',
      preferences TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Seed the single profile row if it doesn't exist
    INSERT OR IGNORE INTO profile (id, name, resume, skills) VALUES (1, '', '', '');

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      url TEXT,
      status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected')),
      salary TEXT,
      contact TEXT,
      notes TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cover_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      prompt TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default db;
