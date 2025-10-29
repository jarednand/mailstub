#!/usr/bin/env node

const { Command } = require('commander');

const program = new Command();

program
  .name('mailstub')
  .description('MailStub - Development server for email testing')
  .version('0.1.1');

program
  .command('start')
  .description('Start the MailStub development server')
  .option('-p, --port <number>', 'port number for the server', '8000')
  .action(async (options) => {
    const port = parseInt(options.port, 10);

    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('❌ Error: Port must be a number between 1 and 65535');
      process.exit(1);
    }

    process.env.NODE_ENV = 'production';

    try {
      const { startServer } = require('../dist/backend/server');
      await startServer({ port });
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}