#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const os = require('os');

const program = new Command();

program
  .name('mailstub')
  .description('MailStub - Development server for email testing')
  .version('0.1.0');

// Add the start command
program
  .command('start')
  .description('Start the MailStub development server')
  .option('-p, --port <number>', 'port number for the server', '8000')
  .action((options) => {
    const port = parseInt(options.port, 10);

    // Validate port
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('❌ Error: Port must be a number between 1 and 65535');
      process.exit(1);
    }

    console.log('🚀 Starting MailStub server...');
    console.log(`📊 Database: ${path.join(os.homedir(), '.mailstub', 'mailstub.db')}`);
    console.log(`🌐 Port: ${port}`);
    console.log('');

    // Set NODE_ENV to production when using CLI
    process.env.NODE_ENV = 'production';

    // Start the server - path is relative to ROOT
    try {
      const { startServer } = require('../dist/backend/server');
      startServer({ port });
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