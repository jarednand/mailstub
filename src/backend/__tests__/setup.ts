import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '@/db/schema';
import path from 'path';

// Create in-memory database for tests
let client: ReturnType<typeof createClient>;
export let testDb: ReturnType<typeof drizzle>;

// Initialize test database
client = createClient({ url: ':memory:' });
testDb = drizzle(client, { schema });

// Mock the db module BEFORE any imports
vi.mock('@/db', () => ({
  db: testDb,
  initializeDatabase: vi.fn()
}));

beforeAll(async () => {
  // Run migrations
  await migrate(testDb, { migrationsFolder: path.join(__dirname, '../../../drizzle') });
});

beforeEach(async () => {
  // Clear all tables before each test
  await testDb.delete(schema.messages);
  await testDb.delete(schema.users);
  await testDb.delete(schema.projects);
});

afterAll(() => {
  // Close database connection
  client.close();
});