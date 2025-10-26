import { body, param, query } from 'express-validator';
import { db } from '@/db';
import { messages, projects, users } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

const MessagesMiddleware = {
  create: [
    body('projectId')
      .trim()
      .notEmpty()
      .withMessage('Project ID is required')
      .custom(async (value) => {
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, value))
          .limit(1);
        
        if (project.length === 0) {
          throw new Error('Project not found');
        }
        
        return true;
      }),
    body('sender')
      .trim()
      .notEmpty()
      .withMessage('Sender is required')
      .isEmail()
      .withMessage('Sender must be a valid email address'),
    body('receiver')
      .trim()
      .notEmpty()
      .withMessage('Receiver is required')
      .isEmail()
      .withMessage('Receiver must be a valid email address')
      .custom(async (value, { req }) => {
        const projectId = req.body.projectId;
        
        const user = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.email, value),
              eq(users.projectId, projectId)
            )
          )
          .limit(1);
        
        if (user.length === 0) {
          throw new Error('Receiver must be a valid user in this project');
        }
        
        return true;
      }),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required'),
    body('body')
      .trim()
      .notEmpty()
      .withMessage('Body is required'),
  ],

  update: [
    param('id')
      .custom(async (value) => {
        const message = await db
          .select()
          .from(messages)
          .where(eq(messages.id, value))
          .limit(1);
        
        if (message.length === 0) {
          throw new Error('Message not found');
        }
        
        return true;
      }),
    body('read')
      .isBoolean()
      .withMessage('Read must be a boolean value'),
  ],

  delete: [
    param('id')
      .custom(async (value) => {
        const message = await db
          .select()
          .from(messages)
          .where(eq(messages.id, value))
          .limit(1);
        
        if (message.length === 0) {
          throw new Error('Message not found');
        }
        
        return true;
      }),
  ],

  bulkDelete: [
    body('ids')
      .isArray({ min: 1 })
      .withMessage('IDs must be a non-empty array')
      .custom(async (value: string[]) => {
        // Get all messages with the provided IDs
        const foundMessages = await db
          .select({ id: messages.id })
          .from(messages)
          .where(inArray(messages.id, value));
        
        // Check if all IDs were found
        if (foundMessages.length !== value.length) {
          throw new Error('One or more messages not found');
        }
        
        return true;
      }),
  ],

  getAll: [
    query('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .custom(async (value) => {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, value))
          .limit(1);
        
        if (user.length === 0) {
          throw new Error('User not found');
        }
        
        return true;
      }),
  ],
};

export default MessagesMiddleware;