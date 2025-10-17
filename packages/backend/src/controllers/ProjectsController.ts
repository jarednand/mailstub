import { Request, Response } from 'express';
import { handle } from '@/utils/controller';
import { db, makeProject, makeDateTime } from '@/lib/db';

const ProjectsController = {
  create(req: Request, res: Response) {
    handle(req, res, async () => {
      const { name } = req.body;
      
      const data = db.read();
      const newProject = makeProject({ name });
      
      data.projects.push(newProject);
      db.write(data);
      
      return res.status(201).json({ project: newProject });
    });
  },

  getAll(req: Request, res: Response) {
    handle(req, res, async () => {
      const data = db.read();
      return res.status(200).json({ projects: data.projects });
    });
  },

  update(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      const { name } = req.body;
      
      const data = db.read();
      const projectIndex = data.projects.findIndex(p => p.id === id);
      
      data.projects[projectIndex] = {
        ...data.projects[projectIndex],
        name,
        updatedAt: makeDateTime(),
      };
      
      db.write(data);
      
      return res.status(200).json({ project: data.projects[projectIndex] });
    });
  },

  delete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      
      const data = db.read();
      
      // Remove project
      data.projects = data.projects.filter(p => p.id !== id);
      
      // Remove associated users and messages
      data.users = data.users.filter(u => u.projectId !== id);
      data.messages = data.messages.filter(m => m.projectId !== id);
      
      db.write(data);
      
      return res.status(200).json({ message: 'Project deleted successfully' });
    });
  },
};

export default ProjectsController;