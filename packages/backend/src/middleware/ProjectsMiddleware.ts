import { body, param } from 'express-validator';
import { db } from '@/lib/db';

const ProjectsMiddleware = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .custom((value) => {
        const data = db.read();
        const exists = data.projects.some(p => p.name === value);
        if (exists) {
          throw new Error('A project with this name already exists');
        }
        return true;
      }),
  ],

  update: [
    param('id')
      .custom((value) => {
        const data = db.read();
        const exists = data.projects.some(p => p.id === value);
        if (!exists) {
          throw new Error('Project not found');
        }
        return true;
      }),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .custom((value, { req }) => {
        const data = db.read();
        const projectId = req.params?.id;
        const exists = data.projects.some(p => p.name === value && p.id !== projectId);
        if (exists) {
          throw new Error('A project with this name already exists');
        }
        return true;
      }),
  ],

  delete: [
    param('id')
      .custom((value) => {
        const data = db.read();
        const exists = data.projects.some(p => p.id === value);
        if (!exists) {
          throw new Error('Project not found');
        }
        return true;
      }),
  ],

  getAll: [],
};

export default ProjectsMiddleware;