import type { InferSelectModel } from 'drizzle-orm';
import * as schema from '../../backend/db/schema';

export type Project = InferSelectModel<typeof schema.projects>;
export type User = InferSelectModel<typeof schema.users>;
export type Message = InferSelectModel<typeof schema.messages>;