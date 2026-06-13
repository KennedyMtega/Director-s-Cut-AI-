import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'database.sqlite')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY,
      style TEXT NOT NULL,
      style_label TEXT NOT NULL,
      hook TEXT NOT NULL,
      body TEXT NOT NULL,
      caption TEXT NOT NULL,
      cta TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      used_at TEXT,
      post_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      quote_id INTEGER NOT NULL,
      video_path TEXT,
      status TEXT DEFAULT 'pending',
      youtube_url TEXT,
      instagram_status TEXT DEFAULT 'pending',
      scheduled_for TEXT,
      posted_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (quote_id) REFERENCES quotes(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS backgrounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Default settings
  const defaultSettings = [
    ['schedule_time_1', '07:00'],
    ['schedule_time_2', '19:00'],
    ['auto_schedule', '1'],
    ['timezone', 'Africa/Dar_es_Salaam'],
    ['watermark', '@solitude_script'],
  ]
  const upsert = db.prepare(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`
  )
  for (const [key, value] of defaultSettings) upsert.run(key, value)

  // Seed quotes if empty
  const count = (db.prepare('SELECT COUNT(*) as n FROM quotes').get() as { n: number }).n
  if (count === 0) {
    const quotesPath = path.join(process.cwd(), 'data', 'quotes.json')
    if (fs.existsSync(quotesPath)) {
      const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf-8'))
      const insert = db.prepare(
        `INSERT INTO quotes (id, style, style_label, hook, body, caption, cta) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      const insertMany = db.transaction((qs: typeof quotes) => {
        for (const q of qs) insert.run(q.id, q.style, q.style_label, q.hook, q.body, q.caption, q.cta)
      })
      insertMany(quotes)
    }
  }
}

export function getSetting(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string) {
  getDb().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}
