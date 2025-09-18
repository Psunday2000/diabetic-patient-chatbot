'use server';

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'local.db');
const dbExists = fs.existsSync(dbPath);

const db = new Database(dbPath, { verbose: console.log });

if (!dbExists) {
  console.log('Creating database schema...');
  db.exec(`
    CREATE TABLE chat_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      startTime TEXT NOT NULL,
      lastActivity TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      text TEXT NOT NULL,
      sender TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      avatar BOOLEAN,
      FOREIGN KEY (sessionId) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );
  `);
  console.log('Database schema created.');
}

export default db;
