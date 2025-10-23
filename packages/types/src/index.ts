import { InferSelectModel } from 'drizzle-orm';
import * as schema from './db/schema';

// Export the schema
export * from './db/schema';

// Export inferred types (simple version)
export type Project = InferSelectModel<typeof schema.projects>;
export type User = InferSelectModel<typeof schema.users>;
export type Message = InferSelectModel<typeof schema.messages>;