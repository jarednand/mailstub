#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const os = require('os');

const program = new Command();

// Default to user's home directory config folder (cross-platform)
const defaultDbPath = path.join(os.homedir(), '.mailstub', 'mailstub-db.json');

program
  .name('mailstub')
  .description('MailStub - Development server for email testing')
  .version('1.0.0');

// Add the start command
program
  .command('start')
  .description('Start the MailStub development server')
  .option('-d, --db <path>', 'path to database JSON file', defaultDbPath)
  .option('-p, --port <number>', 'port number for the server', '8000')
  .action((options) => {
    // Resolve the database path
    const dbPath = path.resolve(options.db);
    const port = parseInt(options.port, 10);

    // Validate port
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('❌ Error: Port must be a number between 1 and 65535');
      process.exit(1);
    }

    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      console.log(`📁 Creating directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database file if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      console.log(`📝 Creating database file at: ${dbPath}`);
      const initialData = {
        projects: [],
        users: [],
        messages: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    }

    console.log('🚀 Starting MailStub server...');
    console.log(`📊 Database: ${dbPath}`);
    console.log(`🌐 Port: ${port}`);
    console.log('');

    // Set NODE_ENV to production when using CLI
    process.env.NODE_ENV = 'production';

    // Start the server - path is relative to ROOT
    try {
      const { startServer } = require('../packages/backend/dist/server');
      startServer({ dbPath, port });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      console.error('');
      console.error('💡 Make sure you have built the project with: pnpm build');
      process.exit(1);
    }
  });

// Show help if no command provided or if invalid command
program.parse(process.argv);

// If no command was provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}