import { z } from 'zod';
import type { User, Project } from '@jarednand/mailstub-types';

export const userFormSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export type UserFormData = z.infer<typeof userFormSchema>;

// Helper function to validate uniqueness within project
export function validateUserUniqueness(
  email: string,
  users: User[],
  projectId: Project['id'],
  currentUserId?: string
) {
  const emailExists = users.some(
    u => u.email === email && u.projectId === projectId && u.id !== currentUserId
  );

  if (emailExists) {
    return 'A user with this email already exists in this project';
  }

  return null;
}