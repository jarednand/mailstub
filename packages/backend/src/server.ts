import express from 'express';
import path from 'path';
import os from 'os';
import ProjectsRouter from '@/routers/ProjectsRouter';
import UsersRouter from '@/routers/UsersRouter';
import MessagesRouter from '@/routers/MessagesRouter';
import { initializeDatabase } from '@/db';

console.log('🔍 Starting server initialization...');

interface ServerOptions {
  port: number;
}

export function startServer(options: ServerOptions) {
  console.log('🔍 startServer called with options:', options);
  
  const app = express();
  const routePrefix = '/api';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const APP_NAME = 'MailStub';

  console.log('🔍 About to initialize database...');
  
  // Initialize database (creates ~/.mailstub directory and runs migrations)
  try {
    initializeDatabase();
    console.log('🔍 Database initialized successfully');
  } catch (error) {
    console.error('🔍 Database initialization failed:', error);
    throw error;
  }

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(routePrefix, ProjectsRouter);
  app.use(routePrefix, UsersRouter);
  app.use(routePrefix, MessagesRouter);

  // Serve frontend in production (when using CLI)
  if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.get('/*', (_, res) =>
      res.sendFile(
        path.resolve(__dirname, '../../', 'frontend', 'dist', 'index.html')
      )
    );
  }

  app.listen(options.port, () => {
    console.log(`✅ ${APP_NAME} server running at http://localhost:${options.port}`);
    console.log(`📧 Open http://localhost:${options.port} to view your emails`);
    console.log(`📊 Database: ${path.join(os.homedir(), '.mailstub', 'mailstub.db')}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });
}

// For development (npm run dev)
if (require.main === module) {
  console.log('🔍 Running in development mode');
  startServer({
    port: parseInt(process.env.PORT || '3001', 10)
  });
}