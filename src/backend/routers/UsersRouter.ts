import { Router, type Router as ExpressRouter } from 'express';
import UsersMiddleware from '@/middleware/UsersMiddleware';
import UsersController from '@/controllers/UsersController';

const UsersRouter: ExpressRouter = Router();

UsersRouter.post('/users', UsersMiddleware.create, UsersController.create);
UsersRouter.get('/users', UsersMiddleware.getAll, UsersController.getAll);
UsersRouter.put('/users/:id', UsersMiddleware.update, UsersController.update);
UsersRouter.delete('/users/:id', UsersMiddleware.delete, UsersController.delete);

export default UsersRouter;