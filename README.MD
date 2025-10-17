# MailStub

A lightweight email testing tool for developers. Catch and view test emails in a clean interface without sending to real inboxes.

## Features

- 📧 **Organized Projects** - Separate emails by project for easy management
- 👥 **Multiple Users** - Create test users and send to different recipients
- 🎨 **Clean Interface** - Beautiful UI with dark mode support
- 🚀 **Simple Setup** - Start testing emails in minutes
- 💾 **Local Storage** - All data stored locally on your machine
- 🔌 **Easy Integration** - Simple client library for sending test emails

## Installation

Install MailStub globally via npm:

```bash
npm install -g mailstub
```

Or using your preferred package manager:

```bash
# pnpm
pnpm add -g mailstub

# yarn
yarn global add mailstub
```

## Quick Start

### 1. Start the MailStub server

```bash
mailstub start
```

The server will start on `http://localhost:8000` by default.

### 2. Create a project and user

Open your browser to `http://localhost:8000` and:
1. Create your first project (e.g., "My App")
2. Add a test user with an email address (e.g., "user@example.com")
3. Copy your project ID from the UI

### 3. Install the client in your application

```bash
npm install mailstub-client
```

### 4. Send test emails from your app

```typescript
import { client } from 'mailstub-client';

await client.send('p_your-project-id', {
  sender: 'noreply@myapp.com',
  receiver: 'user@example.com',
  subject: 'Welcome to My App!',
  body: '<h1>Hello!</h1><p>Thanks for signing up.</p>'
});
```

Check the MailStub UI to see your test email!

## CLI Options

```bash
# Start with default settings
mailstub

# Specify a custom database path
mailstub start --db ./my-emails.json

# Use a custom port
mailstub start --port 3000

# Combine options
mailstub start --db ~/my-project/emails.json --port 3000
```

### Available Options

- `-d, --db <path>` - Path to database JSON file (default: `~/.mailstub/mailstub-db.json`)
- `-p, --port <number>` - Port number for the server (default: `8000`)
- `-V, --version` - Output the version number
- `-h, --help` - Display help information

## Client API

### `client.send(projectId, options)`

Send a test email to MailStub.

**Parameters:**

- `projectId` (string) - Your project ID (format: `p_xxxxx`)
- `options` (object):
  - `sender` (string) - Full sender email address
  - `receiver` (string) - Recipient email (must be a user in your project)
  - `subject` (string) - Email subject line
  - `body` (string) - Email body (HTML supported)

**Returns:** Promise with the created message object

**Example:**

```typescript
import { client } from 'mailstub-client';

const result = await client.send('p_abc123', {
  sender: 'support@myapp.com',
  receiver: 'testuser@example.com',
  subject: 'Password Reset',
  body: '<p>Click here to reset your password...</p>'
});

console.log(result.message.id); // m_xyz789
```

### Custom Server URL

By default, the client connects to `http://localhost:8000`. To use a different server URL:

```typescript
import { createClient } from 'mailstub-client';

const client = createClient({ baseURL: 'http://localhost:3000' });

await client.send('p_abc123', {
  sender: 'support@myapp.com',
  receiver: 'testuser@example.com',
  subject: 'Password Reset',
  body: '<p>Click here to reset your password...</p>'
});
```

## Usage Guidelines

### ✅ Use MailStub For:

- Local development and testing
- Staging and QA environments
- CI/CD pipeline testing
- Demo environments
- Integration testing without real emails

### ❌ Don't Use MailStub For:

- Production email delivery
- Real customer communications
- Sensitive or PII data
- Compliance-regulated communications
- High-volume or mission-critical sends

**Disclaimer:** MailStub is designed exclusively for testing purposes. It does not provide delivery guarantees, encryption, or compliance features. Use a proper transactional email service (like SendGrid, Postmark, or AWS SES) for production environments.

## Data Storage

MailStub stores test emails in `~/.mailstub/mailstub-db.json` by default. This file:

- Is stored in your home directory
- Contains only test email data
- Is unencrypted (never store sensitive information)
- Can be customized with the `--db` flag

**Security Note:** The database file should only contain test data. Never use MailStub for production emails or sensitive information.

## Troubleshooting

### Port already in use

If port 8000 is already in use, specify a different port:

```bash
mailstub start --port 3000
```

### Cannot find database file

If you specify a custom database path, ensure the directory exists or MailStub will create it automatically.

### Frontend not loading

Make sure you're accessing `http://localhost:8000` (or your custom port) in your browser.

## License

MIT

## Support

- 🐛 [Report Issues](https://github.com/yourusername/mailstub/issues)
- 📖 [Documentation](https://github.com/yourusername/mailstub)

---

Made with ❤️ for developers who need to test emails without the hassle.