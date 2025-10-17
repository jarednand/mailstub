import { body, param, query } from 'express-validator';
import { db } from '@/lib/db';

const UsersMiddleware = {
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
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail() // Add this to normalize email case
      .custom((value, { req }) => {
        const data = db.read();
        const normalizedEmail = value.toLowerCase();
        const exists = data.users.some(
          u => u.email.toLowerCase() === normalizedEmail && u.projectId === req.body.projectId
        );
        
        if (exists) {
          throw new Error('A user with this email already exists in this project');
        }
        
        return true;
      }),
  ],

  update: [
    param('id')
      .custom((value) => {
        const data = db.read();
        const exists = data.users.some(u => u.id === value);
        
        if (!exists) {
          throw new Error('User not found');
        }
        
        return true;
      }),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail() // Add this to normalize email case
      .custom((value, { req }) => {
        const data = db.read();
        const userId = req.params?.id;
        const user = data.users.find(u => u.id === userId);
        
        if (!user) {
          throw new Error('User not found');
        }
        
        const normalizedEmail = value.toLowerCase();
        const exists = data.users.some(
          u => u.email.toLowerCase() === normalizedEmail && 
          u.projectId === user.projectId && 
          u.id !== userId
        );
        
        if (exists) {
          throw new Error('A user with this email already exists in this project');
        }
        
        return true;
      }),
  ],

  delete: [
    param('id')
      .custom((value) => {
        const data = db.read();
        const exists = data.users.some(u => u.id === value);
        
        if (!exists) {
          throw new Error('User not found');
        }
        
        return true;
      }),
  ],

  getAll: [
    query('projectId')
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
  ],
};

export default UsersMiddleware;