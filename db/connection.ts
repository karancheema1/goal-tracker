import * as SQLite from 'expo-sqlite';

const DB_NAME = 'goal-tracker.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('count', 'time')),
      target_value INTEGER NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      goal_id TEXT NOT NULL,
      value INTEGER NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_events_goal_id ON events (goal_id);
  `);
}
