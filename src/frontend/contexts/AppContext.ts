import { createContext } from "react";
import type { Project, User, Message } from '@/types';

export type AppContextType = {
  projects: Project[];
  users: User[];
  messages: Message[];
  selectedProjectId: Project['id'] | null;
  selectedUserId: User['id'] | null;
  selectedMessageId: Message['id'] | null;
  selectedMessages: Set<string>;
  isLoadingProjects: boolean;
  isLoadingUsers: boolean;
  isLoadingMessages: boolean;
  theme: 'light' | 'dark';
  setProjects: (projects: Project[]) => void;
  setUsers: (users: User[]) => void;
  setMessages: (messages: Message[]) => void;
  setSelectedProjectId: (id: Project['id'] | null) => void;
  setSelectedUserId: (id: User['id'] | null) => void;
  setSelectedMessageId: (id: Message['id'] | null) => void;
  setSelectedMessages: (messages: Set<string>) => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  toggleTheme: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);