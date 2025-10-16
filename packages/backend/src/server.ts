import express from 'express';
import path from 'path';
import os from 'os';
import fs from 'fs';
import ProjectsRouter from '@/routers/ProjectsRouter';
import UsersRouter from '@/routers/UsersRouter';
import MessagesRouter from '@/routers/MessagesRouter';

interface ServerOptions {
  dbPath: string;
  port: number;
}

export function startServer(options: ServerOptions) {
  const app = express();
  const routePrefix = '/api';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const APP_NAME = 'MailStub';

  // Create database directory and file if they don't exist
  const dbDir = path.dirname(options.dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log(`📁 Creating directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(options.dbPath)) {
    console.log(`📝 Creating database file at: ${options.dbPath}`);
    const initialData = {
      projects: [],
      users: [],
      messages: []
    };
    fs.writeFileSync(options.dbPath, JSON.stringify(initialData, null, 2));
  }

  // Set database path for other modules to use
  process.env.MAILSTUB_DB_PATH = options.dbPath;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(routePrefix, ProjectsRouter);
  app.use(routePrefix, UsersRouter);
  app.use(routePrefix, MessagesRouter);

  // Serve frontend in production (when using CLI)
  if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.get('/{*splat}', (_, res) =>
      res.sendFile(
        path.resolve(__dirname, '../../', 'frontend', 'dist', 'index.html')
      )
    );
  }

  app.listen(options.port, () => {
    console.log(`✅ ${APP_NAME} server running at http://localhost:${options.port}`);
    console.log(`📧 Open http://localhost:${options.port} to view your emails`);
    console.log(`📊 Database: ${options.dbPath}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });
}

// For development (npm run dev)
if (require.main === module) {
  const defaultDbPath = path.join(os.homedir(), '.mailstub', 'mailstub-db.json');
  
  startServer({
    dbPath: process.env.MAILSTUB_DB_PATH || defaultDbPath,
    port: parseInt(process.env.PORT || '3001', 10)
  });
}