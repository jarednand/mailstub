import { useCallback } from 'react';
import { useAppContext } from './useAppContext';
import type { Project } from '@jarednand/mailstub-types';
import axios from 'axios';

export interface CreateProjectData {
  name: string;
}

export interface UpdateProjectData {
  name: string;
}

export function useProjects() {
  const {
    projects,
    setProjects,
    setSelectedProjectId,
    users,
    setUsers,
    messages,
    setMessages,
  } = useAppContext();

  const createProject = useCallback(
    async (data: CreateProjectData) => {
      const response = await axios.post('/api/projects', data);
      const newProject = response.data.project;
      
      setProjects([...projects, newProject]);
      setSelectedProjectId(newProject.id);
      
      return newProject;
    },
    [projects, setProjects, setSelectedProjectId]
  );

  const updateProject = useCallback(
    async (projectId: Project['id'], data: UpdateProjectData) => {
      await axios.put(`/api/projects/${projectId}`, data);
      
      setProjects(
        projects.map(p => (p.id === projectId ? { ...p, ...data } : p))
      );
    },
    [projects, setProjects]
  );

  const deleteProject = useCallback(
    async (projectId: Project['id']) => {
      await axios.delete(`/api/projects/${projectId}`);
      
      const remainingProjects = projects.filter(p => p.id !== projectId);
      setProjects(remainingProjects);
      
      // Clean up related data
      setUsers(users.filter(u => u.projectId !== projectId));
      setMessages(messages.filter(m => m.projectId !== projectId));
      
      // Select next project if current one was deleted
      if (remainingProjects.length > 0) {
        setSelectedProjectId(remainingProjects[0].id);
      } else {
        setSelectedProjectId(null);
      }
    },
    [projects, users, messages, setProjects, setUsers, setMessages, setSelectedProjectId]
  );

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
  };
}