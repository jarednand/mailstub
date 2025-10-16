import { Request, Response } from 'express';
import { handle } from '@/utils/controller';
import { db, makeUser } from '@/lib/db';
import { makeDateTime } from 'octavedb';

const UsersController = {
  create(req: Request, res: Response) {
    handle(req, res, async () => {
      const { projectId, email } = req.body;
      
      const data = db.read();
      const newUser = makeUser({ projectId, email });
      
      data.users.push(newUser);
      db.write(data);
      
      return res.status(201).json({ user: newUser });
    });
  },

  getAll(req: Request, res: Response) {
    handle(req, res, async () => {
      const { projectId } = req.query;
      
      const data = db.read();
      const users = data.users.filter(u => u.projectId === projectId);
      
      return res.status(200).json({ users });
    });
  },

  update(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      const { email } = req.body;
      
      const data = db.read();
      const userIndex = data.users.findIndex(u => u.id === id);
      
      data.users[userIndex] = {
        ...data.users[userIndex],
        email,
        updatedAt: makeDateTime(),
      };
      
      db.write(data);
      
      return res.status(200).json({ user: data.users[userIndex] });
    });
  },

  delete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      
      const data = db.read();
      
      // Remove user
      data.users = data.users.filter(u => u.id !== id);
      
      // Remove associated messages
      data.messages = data.messages.filter(m => m.userId !== id);
      
      db.write(data);
      
      return res.status(200).json({ message: 'User deleted successfully' });
    });
  },
};

export default UsersController;