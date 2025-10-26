import { z } from 'zod';
import type { User, Project } from 'mailstub-types';

export const userFormSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase()), // Normalize email to lowercase
});

export type UserFormData = z.infer<typeof userFormSchema>;

// Helper function to validate uniqueness within project
export function validateUserUniqueness(
  email: string,
  users: User[],
  projectId: Project['id'],
  currentUserId?: string
) {
  const normalizedEmail = email.toLowerCase();
  const emailExists = users.some(
    u => u.email.toLowerCase() === normalizedEmail && 
    u.projectId === projectId && 
    u.id !== currentUserId
  );

  if (emailExists) {
    return 'A user with this email already exists in this project';
  }

  return null;
}