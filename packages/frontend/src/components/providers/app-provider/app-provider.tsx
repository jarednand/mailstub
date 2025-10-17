import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Project, User, Message } from 'mailstub-types';
import { AppContext } from '@/contexts/AppContext';
import axios from 'axios';
import { toast } from 'sonner';

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('mailstub-theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    // Save to localStorage whenever theme changes
    localStorage.setItem('mailstub-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    
    try {
      const response = await axios.get('/api/projects');
      
      setProjects(response.data.projects);
      
      if (response.data.projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(response.data.projects[0].id);
      }
    } catch(error){
      console.log(error);
      toast.error('Error loading projects.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadUsers = async (projectId: Project['id']) => {
    setIsLoadingUsers(true);
    
    try {
      const response = await axios.get(`/api/users`, { params: { projectId }});
      
      setUsers(response.data.users);
      
      if (response.data.users.length > 0 && !selectedUserId) {
        setSelectedUserId(response.data.users[0].id);
      }
    } catch (error){
      console.log(error);
      toast.error('Error loading users.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadMessages = async (userId: User['id']) => {
    setIsLoadingMessages(true);
    
    try {
      const response = await axios.get(`/api/messages`, { params: { userId }});
      
      setMessages(response.data.messages);
    } catch (error){
      console.log(error);
      toast.error('Error loading messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadUsers(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);

      setSelectedMessageId(null);
      setSelectedMessages(new Set());
    }
  }, [selectedUserId]);

  return (
    <AppContext.Provider
      value={{
        projects,
        users,
        messages,
        selectedProjectId,
        selectedUserId,
        selectedMessageId,
        selectedMessages,
        isLoadingProjects,
        isLoadingUsers,
        isLoadingMessages,
        theme,
        setProjects,
        setUsers,
        setMessages,
        setSelectedProjectId,
        setSelectedUserId,
        setSelectedMessageId,
        setSelectedMessages,
        setIsLoadingMessages,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}