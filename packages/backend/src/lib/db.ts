import { createClient, makeId, makeDateTime } from "octavedb";
import { Project, User, Message } from 'mailstub-types';
import path from 'path';
import os from 'os';

type Database = {
  projects: Project[];
  users: User[];
  messages: Message[];
}

// Always default to ~/.mailstub/mailstub-db.json unless custom path provided
const defaultDbPath = path.join(os.homedir(), '.mailstub', 'mailstub-db.json');
const dbPath = process.env.MAILSTUB_DB_PATH || defaultDbPath;

export const db = createClient<Database>(dbPath);

// Custom ID generators with prefixes
export const makeProjectId = () => `p_${makeId()}`;
export const makeUserId = () => `u_${makeId()}`;
export const makeMessageId = () => `m_${makeId()}`;

// Custom resource creators with prefixed IDs
export const makeProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
  const dateTime = makeDateTime();
  
  return {
    ...data,
    id: makeProjectId(),
    createdAt: dateTime,
    updatedAt: dateTime,
  };
};

export const makeUser = (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
  const dateTime = makeDateTime();
  
  return {
    ...data,
    id: makeUserId(),
    createdAt: dateTime,
    updatedAt: dateTime,
  };
};

export const makeMessage = (data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Message => {
  const dateTime = makeDateTime();
  
  return {
    ...data,
    id: makeMessageId(),
    createdAt: dateTime,
    updatedAt: dateTime,
  };
};