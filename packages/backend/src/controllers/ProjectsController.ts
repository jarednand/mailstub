import { Request, Response } from 'express';
import { handle } from '@/utils/controller';
import { db } from '@/db';
import { projects, users, messages } from 'mailstub-types';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const ProjectsController = {
  create(req: Request, res: Response) {
    handle(req, res, async () => {
      const { name } = req.body;
      
      const newProject = {
        id: `p_${randomUUID()}`,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.insert(projects).values(newProject);
      
      return res.status(201).json({ project: newProject });
    });
  },

  getAll(req: Request, res: Response) {
    handle(req, res, async () => {
      const allProjects = await db.select().from(projects);
      
      return res.status(200).json({ projects: allProjects });
    });
  },

  update(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      const { name } = req.body;
      
      const updatedAt = new Date().toISOString();
      
      await db
        .update(projects)
        .set({ name, updatedAt })
        .where(eq(projects.id, id));
      
      // Fetch the updated project
      const updatedProject = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
      
      return res.status(200).json({ project: updatedProject[0] });
    });
  },

  delete(req: Request, res: Response) {
    handle(req, res, async () => {
      const { id } = req.params;
      
      // Delete associated messages first (foreign key constraint)
      await db.delete(messages).where(eq(messages.projectId, id));
      
      // Delete associated users
      await db.delete(users).where(eq(users.projectId, id));
      
      // Delete the project
      await db.delete(projects).where(eq(projects.id, id));
      
      return res.status(200).json({ message: 'Project deleted successfully' });
    });
  },
};

export default ProjectsController;