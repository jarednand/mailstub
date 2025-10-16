import { Request, Response } from 'express';
import { handle } from '@/utils/controller';
import { db, makeMessage } from '@/lib/db';
import { makeDateTime } from 'octavedb';

const MessagesController = {
  create(req: Request, res: Response) {
    handle(req, res, async () => {
      const { projectId, sender, receiver, subject, body } = req.body;
      
      const data = db.read();
      
      // Find the user by email and projectId
      const user = data.users.find(u => u.email === receiver && u.projectId === projectId);
      
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      
      const newMessage = makeMessage({
        projectId,
        userId: user.id,
        sender,
        receiver,
        subject,
        body,
        read: false,
      });
      
      data.messages.push(newMessage);
      db.write(data);
      
      return res.status(201).json({ message: newMessage });
    });
  },

  getAll(req: Request, res: Response) {
    handle(req, res, async () => {
      const { userId } = req.query;
      
      const data = db.read();
      const messages = data.messages.filter(m => m.userId === userId);
      
      return res.status(200).json({ messages });
    });
  },

  update(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      const { read } = req.body;
      
      const data = db.read();
      const messageIndex = data.messages.findIndex(m => m.id === id);
      
      data.messages[messageIndex] = {
        ...data.messages[messageIndex],
        read,
        updatedAt: makeDateTime(),
      };
      
      db.write(data);
      
      return res.status(200).json({ message: data.messages[messageIndex] });
    });
  },

  delete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      
      const data = db.read();
      data.messages = data.messages.filter(m => m.id !== id);
      
      db.write(data);
      
      return res.status(200).json({ message: 'Message deleted successfully' });
    });
  },

  bulkDelete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { ids } = req.body;
      
      const data = db.read();
      data.messages = data.messages.filter(m => !ids.includes(m.id));
      
      db.write(data);
      
      return res.status(200).json({ message: `${ids.length} message${ids.length > 1 ? 's' : ''} deleted successfully` });
    });
  },
};

export default MessagesController;