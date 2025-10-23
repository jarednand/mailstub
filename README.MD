# MailStub

A lightweight email testing tool for developers. Catch and view test emails in a clean interface without sending to real inboxes.

## Features

- 📧 **Organized Projects** - Separate emails by project for easy management
- 👥 **Multiple Users** - Create test users and send to different recipients
- 🎨 **Clean Interface** - Beautiful UI with dark mode support
- 🚀 **Simple Setup** - Start testing emails in minutes
- 💾 **Local Storage** - All data stored locally in SQLite
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

Or using your preferred package manager:

```bash
# pnpm
pnpm add mailstub-client

# yarn
yarn add mailstub-client
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
mailstub start

# Use a custom port
mailstub start --port 3000
```

### Available Options

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

### Custom Server Port

By default, the client connects to `http://localhost:8000`. If you're running MailStub on a different port, update the client configuration:

```typescript
import { createClient } from 'mailstub-client';

// Connect to MailStub running on port 3000
const client = createClient({ port: 3000 });

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

**Disclaimer:** MailStub is designed exclusively for testing purposes. It does not send real emails or provide delivery guarantees, encryption, or compliance features. For production environments, use a proper transactional email service like SendGrid, Postmark, or AWS SES.

## Data Storage

MailStub stores all data in a SQLite database in your home directory:

- **Mac/Linux:** `~/.mailstub/mailstub.db`
- **Windows:** `C:\Users\<YourUsername>\.mailstub\mailstub.db`

This database:

- Contains only test email data
- Uses SQLite for efficient querying and storage
- Is created automatically on first run
- Is unencrypted (never store sensitive information)

**Security Note:** The database should only contain test data. Never use MailStub for production emails or sensitive information.

## Troubleshooting

### Port already in use

If port 8000 is already in use, specify a different port:

```bash
mailstub start --port 3000
```

### Database location

Your database is automatically stored in your home directory (see [Data Storage](#data-storage) section for the exact path). To view or backup your data, you can use any SQLite browser tool.

### Frontend not loading

Make sure you're accessing `http://localhost:8000` (or your custom port) in your browser.

## License

MIT

## Support

- 🐛 [Report Issues](https://github.com/yourusername/mailstub/issues)
- 📖 [Documentation](https://github.com/yourusername/mailstub)

---

Made with ❤️ for developers who need to test emails without the hassle.