import { z } from 'zod';
import type { Project } from '@jarednand/mailstub-types';

export const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

// Helper function to validate uniqueness (called in component with access to projects list)
export function validateProjectUniqueness(
  data: ProjectFormData,
  projects: Project[],
  currentProjectId?: string
) {
  const errors: { name?: string } = {};

  const nameExists = projects.some(
    p => p.name === data.name && p.id !== currentProjectId
  );
  if (nameExists) {
    errors.name = 'A project with this name already exists';
  }

  return errors;
}