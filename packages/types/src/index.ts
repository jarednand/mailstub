import { Resource } from 'octavedb';

export interface Project extends Resource {
  name: string;
}

export interface User extends Resource {
  id: string;
  projectId: Project['id'];
  email: string;
}

export interface Message extends Resource {
  projectId: Project['id'];
  userId: User['id'];
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  read: boolean;
}