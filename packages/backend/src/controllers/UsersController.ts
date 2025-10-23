import { Request, Response } from 'express';
import { handle } from '@/utils/controller';
import { db } from '@/db';
import { users, messages } from 'mailstub-types';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const UsersController = {
  create(req: Request, res: Response) {
    handle(req, res, async () => {
      const { projectId, email } = req.body;
      
      const newUser = {
        id: `u_${randomUUID()}`,
        projectId,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.insert(users).values(newUser);
      
      return res.status(201).json({ user: newUser });
    });
  },

  getAll(req: Request, res: Response) {
    handle(req, res, async () => {
      const { projectId } = req.query;
      
      const projectUsers = await db
        .select()
        .from(users)
        .where(eq(users.projectId, projectId as string));
      
      return res.status(200).json({ users: projectUsers });
    });
  },

  update(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      const { email } = req.body;
      
      const updatedAt = new Date().toISOString();
      
      await db
        .update(users)
        .set({ email, updatedAt })
        .where(eq(users.id, id));
      
      // Fetch the updated user
      const updatedUser = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return res.status(200).json({ user: updatedUser[0] });
    });
  },

  delete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      
      // Delete associated messages first (foreign key constraint)
      await db.delete(messages).where(eq(messages.userId, id));
      
      // Delete the user
      await db.delete(users).where(eq(users.id, id));
      
      return res.status(200).json({ message: 'User deleted successfully' });
    });
  },
};

export default UsersController;