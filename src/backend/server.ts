import express from 'express';
import path from 'path';
import os from 'os';
import cors from 'cors';
import ProjectsRouter from '@/routers/ProjectsRouter';
import UsersRouter from '@/routers/UsersRouter';
import MessagesRouter from '@/routers/MessagesRouter';
import { initializeDatabase } from '@/db';

console.log('🚀 Starting MailStub server...');

interface ServerOptions {
  port: number;
}

export async function startServer(options: ServerOptions) {
  const app = express();
  const routePrefix = '/api';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const APP_NAME = 'MailStub';

  console.log('🔍 Initializing database...');
  
  // Initialize database (creates ~/.mailstub directory and runs migrations)
  try {
    await initializeDatabase();
    console.log('🔍 Database initialized successfully');
  } catch (error) {
    console.error('🔍 Database initialization failed:', error);
    throw error;
  }

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(routePrefix, ProjectsRouter);
  app.use(routePrefix, UsersRouter);
  app.use(routePrefix, MessagesRouter);

  // Serve frontend in production (when using CLI)
  if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));

    app.get('/{*splat}', (req, res) => {
      // If request has file extension, return 404
      if (path.extname(req.path)) {
        return res.status(404).send('Not found');
      }

      // Serve index.html for SPA routes
      res.sendFile(
        path.resolve(__dirname, '../frontend', 'index.html')
      )
    });
  }

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(options.port, 'localhost');

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${options.port} is already in use`));
      } else {
        reject(error);
      }
    });

    server.on('listening', () => {
      console.log(`✅ ${APP_NAME} server running at http://localhost:${options.port}`);
      console.log(`📊 Database: ${path.join(os.homedir(), '.mailstub', 'mailstub.db')}`);
      
      if (NODE_ENV === 'production') {
        console.log(`📧 Open http://localhost:${options.port} to view your emails`);
      }
      
      console.log('');
      console.log('Press Ctrl+C to stop the server');
      resolve();
    });
  });
}

// For development (npm run dev)
if (require.main === module) {
  console.log('🔍 Running in development mode');
  
  startServer({
    port: parseInt(process.env.PORT || '3001', 10)
  }).catch((error) => {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  });
}