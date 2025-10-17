import { useCallback } from 'react';
import { useAppContext } from './useAppContext';
import type { User, Project } from 'mailstub-types';
import axios from 'axios';

export interface CreateUserData {
  projectId: Project['id'];
  email: string;
}

export interface UpdateUserData {
  email: string;
}

export function useUsers() {
  const {
    users,
    setUsers,
    setSelectedUserId,
    messages,
    setMessages,
    selectedProjectId,
  } = useAppContext();

  const createUser = useCallback(
    async (data: CreateUserData) => {
      const response = await axios.post('/api/users', data);
      const newUser = response.data.user;
      
      setUsers([...users, newUser]);
      setSelectedUserId(newUser.id);
      
      return newUser;
    },
    [users, setUsers, setSelectedUserId]
  );

  const updateUser = useCallback(
    async (userId: User['id'], data: UpdateUserData) => {
      await axios.put(`/api/users/${userId}`, data);
      
      setUsers(users.map(u => (u.id === userId ? { ...u, ...data } : u)));
    },
    [users, setUsers]
  );

  const deleteUser = useCallback(
    async (userId: User['id']) => {
      await axios.delete(`/api/users/${userId}`);
      
      setUsers(users.filter(u => u.id !== userId));
      setMessages(messages.filter(m => m.userId !== userId));
      
      // Select next user in current project if current one was deleted
      const projectUsers = users.filter(u => u.projectId === selectedProjectId);
      const nextUser = projectUsers.find(u => u.id !== userId);
      
      setSelectedUserId(nextUser?.id || null);
    },
    [users, messages, selectedProjectId, setUsers, setMessages, setSelectedUserId]
  );

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
  };
}