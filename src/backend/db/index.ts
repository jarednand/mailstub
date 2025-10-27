import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'path';
import os from 'os';
import fs from 'fs';
import * as schema from './schema';

const MAILSTUB_DIR = path.join(os.homedir(), '.mailstub');
const DB_PATH = path.join(MAILSTUB_DIR, 'mailstub.db');

// Ensure ~/.mailstub directory exists
if (!fs.existsSync(MAILSTUB_DIR)) {
  fs.mkdirSync(MAILSTUB_DIR, { recursive: true });
}

// Create libSQL client
const client = createClient({
  url: `file:${DB_PATH}`
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Initialize database (run migrations)
export async function initializeDatabase() {
  try {
    const migrationsFolder = path.join(__dirname, '../../../drizzle');
    await migrate(db, { migrationsFolder });
  } catch (error) {
    throw error;
  }
}