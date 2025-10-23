import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: '../types/src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
});