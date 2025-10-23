import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from 'mailstub-types';
import path from 'path';

// Create in-memory database for tests
let sqlite: Database.Database;
export let testDb: ReturnType<typeof drizzle>;

// Initialize test database
sqlite = new Database(':memory:');
testDb = drizzle(sqlite, { schema });

// Mock the db module BEFORE any imports
vi.mock('@/db', () => ({
  db: testDb,
  initializeDatabase: vi.fn()
}));

beforeAll(() => {
  // Run migrations
  migrate(testDb, { migrationsFolder: path.join(__dirname, '../../drizzle') });
});

beforeEach(() => {
  // Clear all tables before each test
  testDb.delete(schema.messages).run();
  testDb.delete(schema.users).run();
  testDb.delete(schema.projects).run();
});

afterAll(() => {
  // Close database connection
  sqlite.close();
});