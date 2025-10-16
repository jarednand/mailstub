import { body, param, query } from 'express-validator';
import { db } from '@/lib/db';

const MessagesMiddleware = {
  create: [
    body('projectId')
      .trim()
      .notEmpty()
      .withMessage('Project ID is required')
      .custom((value) => {
        const data = db.read();
        const exists = data.projects.some(p => p.id === value);
        if (!exists) {
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
      .custom((value, { req }) => {
        const data = db.read();
        const projectId = req.body.projectId;
        const user = data.users.find(u => u.email === value && u.projectId === projectId);
        if (!user) {
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
      .custom((value) => {
        const data = db.read();
        const exists = data.messages.some(m => m.id === value);
        if (!exists) {
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
      .custom((value) => {
        const data = db.read();
        const exists = data.messages.some(m => m.id === value);
        if (!exists) {
          throw new Error('Message not found');
        }
        return true;
      }),
  ],

  bulkDelete: [
    body('ids')
      .isArray({ min: 1 })
      .withMessage('IDs must be a non-empty array')
      .custom((value) => {
        const data = db.read();
        const allExist = value.every((id: string) => 
          data.messages.some(m => m.id === id)
        );
        if (!allExist) {
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
      .custom((value) => {
        const data = db.read();
        const exists = data.users.some(u => u.id === value);
        if (!exists) {
          throw new Error('User not found');
        }
        return true;
      }),
  ],
};

export default MessagesMiddleware;