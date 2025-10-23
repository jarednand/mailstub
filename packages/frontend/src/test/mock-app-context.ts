import { vi } from 'vitest';
import type { AppContextType } from '@/contexts/AppContext';
import type { Project, User, Message } from 'mailstub-types';

// Helper to generate mock IDs with proper prefixes
const generateMockId = (prefix: 'p' | 'u' | 'm'): string => {
  const uuid = crypto.randomUUID();
  return `${prefix}_${uuid}`;
};

const makeDateTime = () => new Date().toISOString();

export const createMockProject = (overrides?: Partial<Project>): Project => ({
  id: generateMockId('p'),
  name: 'Test Project',
  createdAt: makeDateTime(),
  updatedAt: makeDateTime(),
  ...overrides
});

export const createMockUser = (overrides?: Partial<User>): User => {
  const projectId = overrides?.projectId || generateMockId('p');
  return {
    id: generateMockId('u'),
    projectId,
    email: 'test@example.com',
    createdAt: makeDateTime(),
    updatedAt: makeDateTime(),
    ...overrides
  };
};

export const createMockMessage = (overrides?: Partial<Message>): Message => {
  const projectId = overrides?.projectId || generateMockId('p');
  const userId = overrides?.userId || generateMockId('u');
  return {
    id: generateMockId('m'),
    projectId,
    userId,
    sender: 'sender@example.com',
    receiver: 'receiver@example.com',
    subject: 'Test Subject',
    body: 'Test message body',
    read: false,
    createdAt: makeDateTime(),
    updatedAt: makeDateTime(),
    ...overrides
  };
};

export const createMockAppContext = (
  overrides?: Partial<AppContextType>
): AppContextType => ({
  projects: [],
  users: [],
  messages: [],
  selectedProjectId: null,
  selectedUserId: null,
  selectedMessageId: null,
  selectedMessages: new Set<string>(),
  isLoadingProjects: false,
  isLoadingUsers: false,
  isLoadingMessages: false,
  theme: 'light',
  setProjects: vi.fn(),
  setUsers: vi.fn(),
  setMessages: vi.fn(),
  setSelectedProjectId: vi.fn(),
  setSelectedUserId: vi.fn(),
  setSelectedMessageId: vi.fn(),
  setSelectedMessages: vi.fn(),
  setIsLoadingMessages: vi.fn(),
  toggleTheme: vi.fn(),
  ...overrides
});