import { useCallback } from 'react';
import { useAppContext } from './useAppContext';
import type { Message } from '@/types';
import axios from 'axios';

export function useMessages() {
  const {
    messages,
    setMessages,
    setSelectedMessageId,
    setSelectedMessages,
  } = useAppContext();

  const deleteMessage = useCallback(
    async (messageId: Message['id']) => {
      await axios.delete(`/api/messages/${messageId}`);
      
      setMessages(messages.filter(m => m.id !== messageId));
      setSelectedMessageId(null);
    },
    [messages, setMessages, setSelectedMessageId]
  );

  const deleteMessages = useCallback(
    async (messageIds: Message['id'][]) => {
      await axios.delete('/api/messages', { data: { ids: messageIds } });
      
      setMessages(messages.filter(m => !messageIds.includes(m.id)));
      setSelectedMessages(new Set());
    },
    [messages, setMessages, setSelectedMessages]
  );

  const markMessageAsRead = useCallback(
    async (messageId: Message['id']) => {
      await axios.patch(`/api/messages/${messageId}`, { read: true });
      
      setMessages(
        messages.map(m => (m.id === messageId ? { ...m, read: true } : m))
      );
    },
    [messages, setMessages]
  );

  return {
    messages,
    deleteMessage,
    deleteMessages,
    markMessageAsRead,
  };
}