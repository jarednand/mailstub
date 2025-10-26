import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { testDb } from '../setup';
import { messages } from '@/db/schema';

describe('Messages API Integration Tests', () => {
  const app = createTestApp();
  let testProjectId: string;
  let testUserId: string;
  let testUserEmail: string;

  // Create a test project and user before each test
  beforeEach(async () => {
    // Create project
    const projectResponse = await request(app)
      .post('/api/projects')
      .send({ name: 'Test Project' });
    testProjectId = projectResponse.body.project.id;

    // Create user
    testUserEmail = 'testuser@example.com';
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        projectId: testProjectId,
        email: testUserEmail
      });
    testUserId = userResponse.body.user.id;
  });

  describe('POST /api/messages', () => {
    it('should create a new message with valid data', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test Subject',
          body: '<p>Test body</p>'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        message: {
          projectId: testProjectId,
          userId: testUserId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test Subject',
          body: '<p>Test body</p>',
          read: false,
          id: expect.stringMatching(/^m_[a-f0-9-]+$/),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });

      // Verify in database
      const allMessages = await testDb.select().from(messages);
      expect(allMessages).toHaveLength(1);
    });

    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.projectId).toBeDefined();
    });

    it('should return 400 when project does not exist', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: 'p_nonexistent',
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.projectId).toBe('Project not found');
    });

    it('should return 400 when sender is missing', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.sender).toBeDefined();
    });

    it('should return 400 when sender is invalid email', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'invalid-email',
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.sender).toBe('Sender must be a valid email address');
    });

    it('should return 400 when receiver is missing', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.receiver).toBeDefined();
    });

    it('should return 400 when receiver is invalid email', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: 'invalid-email',
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.receiver).toBe('Receiver must be a valid email address');
    });

    it('should return 400 when receiver is not a user in the project', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: 'nonexistent@example.com',
          subject: 'Test',
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.receiver).toBe('Receiver must be a valid user in this project');
    });

    it('should return 400 when subject is missing', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          body: 'Test'
        })
        .expect(400);

      expect(response.body.errors.subject).toBeDefined();
    });

    it('should return 400 when body is missing', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test'
        })
        .expect(400);

      expect(response.body.errors.body).toBeDefined();
    });

    it('should handle HTML email body', async () => {
      const htmlBody = '<html><body><h1>Welcome</h1><p>This is a test email</p></body></html>';
      
      const response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'HTML Email',
          body: htmlBody
        })
        .expect(201);

      expect(response.body.message.body).toBe(htmlBody);
    });
  });

  describe('GET /api/messages', () => {
    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(400);

      expect(response.body.errors.userId).toBeDefined();
    });

    it('should return 400 when user does not exist', async () => {
      const response = await request(app)
        .get('/api/messages')
        .query({ userId: 'u_nonexistent' })
        .expect(400);

      expect(response.body.errors.userId).toBe('User not found');
    });

    it('should return empty array when no messages exist', async () => {
      const response = await request(app)
        .get('/api/messages')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body).toEqual({ messages: [] });
    });

    it('should return all messages for a user', async () => {
      // Create multiple messages
      await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender1@example.com',
          receiver: testUserEmail,
          subject: 'Message 1',
          body: 'Body 1'
        });
      
      await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender2@example.com',
          receiver: testUserEmail,
          subject: 'Message 2',
          body: 'Body 2'
        });

      const response = await request(app)
        .get('/api/messages')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.messages).toHaveLength(2);
      expect(response.body.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ subject: 'Message 1' }),
          expect.objectContaining({ subject: 'Message 2' })
        ])
      );
    });

    it('should only return messages for the specified user', async () => {
      // Create another user
      const user2Response = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'user2@example.com'
        });
      const user2Id = user2Response.body.user.id;

      // Create messages for both users
      await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'For User 1',
          body: 'Body 1'
        });
      
      await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: 'user2@example.com',
          subject: 'For User 2',
          body: 'Body 2'
        });

      // Get messages for first user
      const response = await request(app)
        .get('/api/messages')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].subject).toBe('For User 1');
    });
  });

  describe('PATCH /api/messages/:id', () => {
    it('should update message read status', async () => {
      // Create a message
      const createResponse = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(201);

      const messageId = createResponse.body.message.id;
      expect(createResponse.body.message.read).toBe(false);

      // Update to read
      const response = await request(app)
        .patch(`/api/messages/${messageId}`)
        .send({ read: true })
        .expect(200);

      expect(response.body.message).toMatchObject({
        id: messageId,
        read: true
      });
    });

    it('should update message to unread', async () => {
      // Create a message
      const createResponse = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(201);

      const messageId = createResponse.body.message.id;

      // Mark as read
      await request(app)
        .patch(`/api/messages/${messageId}`)
        .send({ read: true })
        .expect(200);

      // Mark as unread
      const response = await request(app)
        .patch(`/api/messages/${messageId}`)
        .send({ read: false })
        .expect(200);

      expect(response.body.message.read).toBe(false);
    });

    it('should return 400 when message does not exist', async () => {
      const response = await request(app)
        .patch('/api/messages/m_nonexistent')
        .send({ read: true })
        .expect(400);

      expect(response.body.errors.id).toBe('Message not found');
    });

    it('should return 400 when read is not a boolean', async () => {
      // Create a message
      const createResponse = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Test',
          body: 'Test'
        })
        .expect(201);

      const messageId = createResponse.body.message.id;

      const response = await request(app)
        .patch(`/api/messages/${messageId}`)
        .send({ read: 'yes' })
        .expect(400);

      expect(response.body.errors.read).toBe('Read must be a boolean value');
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete an existing message', async () => {
      // Create a message
      const createResponse = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'To Delete',
          body: 'Test'
        })
        .expect(201);

      const messageId = createResponse.body.message.id;

      // Delete the message
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .expect(200);

      expect(response.body.message).toBe('Message deleted successfully');

      // Verify it's gone
      const getResponse = await request(app)
        .get('/api/messages')
        .query({ userId: testUserId })
        .expect(200);
      
      expect(getResponse.body.messages).toHaveLength(0);
    });

    it('should return 400 when message does not exist', async () => {
      const response = await request(app)
        .delete('/api/messages/m_nonexistent')
        .expect(400);

      expect(response.body.errors.id).toBe('Message not found');
    });
  });

  describe('DELETE /api/messages (bulk delete)', () => {
    it('should delete multiple messages', async () => {
      // Create multiple messages
      const msg1Response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Message 1',
          body: 'Body 1'
        })
        .expect(201);

      const msg2Response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Message 2',
          body: 'Body 2'
        })
        .expect(201);

      const msg3Response = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Message 3',
          body: 'Body 3'
        })
        .expect(201);

      const messageIds = [
        msg1Response.body.message.id,
        msg2Response.body.message.id,
        msg3Response.body.message.id
      ];

      // Delete multiple messages
      const response = await request(app)
        .delete('/api/messages')
        .send({ ids: messageIds })
        .expect(200);

      expect(response.body.message).toBe('3 messages deleted successfully');

      // Verify they're gone
      const getResponse = await request(app)
        .get('/api/messages')
        .query({ userId: testUserId })
        .expect(200);
      
      expect(getResponse.body.messages).toHaveLength(0);
    });

    it('should handle singular vs plural in response message', async () => {
      // Create one message
      const msgResponse = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Single Message',
          body: 'Body'
        })
        .expect(201);

      const messageId = msgResponse.body.message.id;

      // Delete single message via bulk delete
      const response = await request(app)
        .delete('/api/messages')
        .send({ ids: [messageId] })
        .expect(200);

      expect(response.body.message).toBe('1 message deleted successfully');
    });

    it('should return 400 when ids is not an array', async () => {
      const response = await request(app)
        .delete('/api/messages')
        .send({ ids: 'not-an-array' })
        .expect(400);

      expect(response.body.errors.ids).toBe('IDs must be a non-empty array');
    });

    it('should return 400 when ids array is empty', async () => {
      const response = await request(app)
        .delete('/api/messages')
        .send({ ids: [] })
        .expect(400);

      expect(response.body.errors.ids).toBe('IDs must be a non-empty array');
    });

    it('should return 400 when one or more messages not found', async () => {
      // Create one real message
      const msgResponse = await request(app)
        .post('/api/messages')
        .send({
          projectId: testProjectId,
          sender: 'sender@example.com',
          receiver: testUserEmail,
          subject: 'Real Message',
          body: 'Body'
        })
        .expect(201);

      const realMessageId = msgResponse.body.message.id;

      // Try to delete real message + nonexistent message
      const response = await request(app)
        .delete('/api/messages')
        .send({ ids: [realMessageId, 'm_nonexistent'] })
        .expect(400);

      expect(response.body.errors.ids).toBe('One or more messages not found');
    });
  });
});