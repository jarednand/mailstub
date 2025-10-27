import { vi } from 'vitest';
import type { User } from '@/types';
import type { CreateUserData, UpdateUserData } from '@/hooks/useUsers';

export interface UseUsersReturn {
  users: User[];
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (userId: User['id'], data: UpdateUserData) => Promise<void>;
  deleteUser: (userId: User['id']) => Promise<void>;
}

export const createMockUseUsers = (
  overrides?: Partial<UseUsersReturn>
): UseUsersReturn => ({
  users: [],
  createUser: vi.fn().mockResolvedValue({
    id: 'u_new',
    projectId: 'p_default',
    email: 'newuser@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  updateUser: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});