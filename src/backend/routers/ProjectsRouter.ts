import { Router, type Router as ExpressRouter } from 'express';
import ProjectsMiddleware from '@/middleware/ProjectsMiddleware';
import ProjectsController from '@/controllers/ProjectsController';

const ProjectsRouter: ExpressRouter = Router();

ProjectsRouter.post('/projects', ProjectsMiddleware.create, ProjectsController.create);
ProjectsRouter.get('/projects', ProjectsMiddleware.getAll, ProjectsController.getAll);
ProjectsRouter.put('/projects/:id', ProjectsMiddleware.update, ProjectsController.update);
ProjectsRouter.delete('/projects/:id', ProjectsMiddleware.delete, ProjectsController.delete);

export default ProjectsRouter;