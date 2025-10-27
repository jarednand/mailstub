import { vi } from 'vitest';
import type { Message } from '@/types';

export interface UseMessagesReturn {
  messages: Message[];
  deleteMessage: (messageId: Message['id']) => Promise<void>;
  deleteMessages: (messageIds: Message['id'][]) => Promise<void>;
  markMessageAsRead: (messageId: Message['id']) => Promise<void>;
}

export const createMockUseMessages = (
  overrides?: Partial<UseMessagesReturn>
): UseMessagesReturn => ({
  messages: [],
  deleteMessage: vi.fn().mockResolvedValue(undefined),
  deleteMessages: vi.fn().mockResolvedValue(undefined),
  markMessageAsRead: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});