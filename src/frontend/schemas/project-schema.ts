import { z } from 'zod';
import type { Project } from '@/types';

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

  const normalizedName = data.name.trim().toLowerCase();
  const nameExists = projects.some(
    p => p.name.trim().toLowerCase() === normalizedName && p.id !== currentProjectId
  );
  
  if (nameExists) {
    errors.name = 'A project with this name already exists';
  }

  return errors;
}