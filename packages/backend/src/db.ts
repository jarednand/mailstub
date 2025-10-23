import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import os from 'os';
import fs from 'fs';
import * as schema from 'mailstub-types';

const MAILSTUB_DIR = path.join(os.homedir(), '.mailstub');
const DB_PATH = path.join(MAILSTUB_DIR, 'mailstub.db');

// Ensure ~/.mailstub directory exists
if (!fs.existsSync(MAILSTUB_DIR)) {
  fs.mkdirSync(MAILSTUB_DIR, { recursive: true });
}

// Create SQLite connection
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database (run migrations)
export function initializeDatabase() {
  try {
    // Resolve migrations path relative to this file
    // In dev: src/db.ts -> ../drizzle
    // In prod: dist/db.js -> ../drizzle
    const migrationsFolder = path.join(__dirname, '../drizzle');
    
    console.log('🔍 Looking for migrations at:', migrationsFolder);
    console.log('🔍 Does it exist?', fs.existsSync(migrationsFolder));
    
    migrate(db, { migrationsFolder });
    console.log('✓ Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}