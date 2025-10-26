import { Request, Response } from 'express';
import { handle } from '@/utils/controller';
import { db } from '@/db';
import { messages, users } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const MessagesController = {
  create(req: Request, res: Response) {
    handle(req, res, async () => {
      const { projectId, sender, receiver, subject, body } = req.body;
      
      // Find the user by email and projectId
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, receiver),
            eq(users.projectId, projectId)
          )
        )
        .limit(1);
      
      if (user.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }
      
      const newMessage = {
        id: `m_${randomUUID()}`,
        projectId,
        userId: user[0].id,
        sender,
        receiver,
        subject,
        body,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.insert(messages).values(newMessage);
      
      return res.status(201).json({ message: newMessage });
    });
  },

  getAll(req: Request, res: Response) {
    handle(req, res, async () => {
      const { userId } = req.query;
      
      const userMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, userId as string));
      
      return res.status(200).json({ messages: userMessages });
    });
  },

  update(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      const { read } = req.body;
      
      const updatedAt = new Date().toISOString();
      
      await db
        .update(messages)
        .set({ read, updatedAt })
        .where(eq(messages.id, id));
      
      // Fetch the updated message
      const updatedMessage = await db
        .select()
        .from(messages)
        .where(eq(messages.id, id))
        .limit(1);
      
      return res.status(200).json({ message: updatedMessage[0] });
    });
  },

  delete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      
      await db.delete(messages).where(eq(messages.id, id));
      
      return res.status(200).json({ message: 'Message deleted successfully' });
    });
  },

  bulkDelete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { ids } = req.body;
      
      await db.delete(messages).where(inArray(messages.id, ids));
      
      return res.status(200).json({ 
        message: `${ids.length} message${ids.length > 1 ? 's' : ''} deleted successfully` 
      });
    });
  },
};

export default MessagesController;