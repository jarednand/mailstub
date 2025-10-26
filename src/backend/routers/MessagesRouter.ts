import { Router, type Router as ExpressRouter } from 'express';
import MessagesMiddleware from '@/middleware/MessagesMiddleware';
import MessagesController from '@/controllers/MessagesController';

const MessagesRouter: ExpressRouter = Router();

MessagesRouter.post('/messages', MessagesMiddleware.create, MessagesController.create);
MessagesRouter.get('/messages', MessagesMiddleware.getAll, MessagesController.getAll);
MessagesRouter.patch('/messages/:id', MessagesMiddleware.update, MessagesController.update);
MessagesRouter.delete('/messages/:id', MessagesMiddleware.delete, MessagesController.delete);
MessagesRouter.delete('/messages', MessagesMiddleware.bulkDelete, MessagesController.bulkDelete);

export default MessagesRouter;