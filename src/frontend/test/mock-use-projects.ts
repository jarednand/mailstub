import { vi } from 'vitest';
import type { Project } from '@/types';
import type { CreateProjectData, UpdateProjectData } from '@/hooks/useProjects';

export interface UseProjectsReturn {
  projects: Project[];
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (projectId: Project['id'], data: UpdateProjectData) => Promise<void>;
  deleteProject: (projectId: Project['id']) => Promise<void>;
}

export const createMockUseProjects = (
  overrides?: Partial<UseProjectsReturn>
): UseProjectsReturn => ({
  projects: [],
  createProject: vi.fn().mockResolvedValue({
    id: 'p_new',
    name: 'New Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  updateProject: vi.fn().mockResolvedValue(undefined),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});