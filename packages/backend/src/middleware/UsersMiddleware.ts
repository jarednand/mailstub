import { body, param, query } from 'express-validator';
import { db } from '@/db';
import { users, projects } from 'mailstub-types';
import { eq, and, sql } from 'drizzle-orm';

const UsersMiddleware = {
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
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const normalizedEmail = value.toLowerCase();
        const projectId = req.body.projectId;
        
        const existingUser = await db
          .select()
          .from(users)
          .where(
            and(
              sql`lower(${users.email}) = ${normalizedEmail}`,
              eq(users.projectId, projectId)
            )
          )
          .limit(1);
        
        if (existingUser.length > 0) {
          throw new Error('A user with this email already exists in this project');
        }
        
        return true;
      }),
  ],

  update: [
    param('id')
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
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const userId = req.params?.id;
        
        // Get the user's project
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (user.length === 0) {
          throw new Error('User not found');
        }
        
        const normalizedEmail = value.toLowerCase();
        const projectId = user[0].projectId;
        
        // Check if another user in the same project has this email
        const existingUser = await db
          .select()
          .from(users)
          .where(
            and(
              sql`lower(${users.email}) = ${normalizedEmail}`,
              eq(users.projectId, projectId),
              sql`${users.id} != ${userId}`
            )
          )
          .limit(1);
        
        if (existingUser.length > 0) {
          throw new Error('A user with this email already exists in this project');
        }
        
        return true;
      }),
  ],

  delete: [
    param('id')
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

  getAll: [
    query('projectId')
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
  ],
};

export default UsersMiddleware;