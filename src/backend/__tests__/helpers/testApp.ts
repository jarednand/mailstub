import express, { Express } from 'express';
import ProjectsRouter from '@/routers/ProjectsRouter';
import UsersRouter from '@/routers/UsersRouter';
import MessagesRouter from '@/routers/MessagesRouter';

export function createTestApp(): Express {
  const app = express();
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  // Mount routers
  app.use('/api', ProjectsRouter);
  app.use('/api', UsersRouter);
  app.use('/api', MessagesRouter);
  
  return app;
}