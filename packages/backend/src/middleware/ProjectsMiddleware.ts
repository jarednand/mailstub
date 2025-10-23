import { body, param } from 'express-validator';
import { db } from '@/db';
import { projects } from 'mailstub-types';
import { eq, and, sql } from 'drizzle-orm';

const ProjectsMiddleware = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .custom(async (value) => {
        const normalizedName = value.toLowerCase();
        
        // Check if project with this name exists (case-insensitive)
        const existingProject = await db
          .select()
          .from(projects)
          .where(sql`lower(trim(${projects.name})) = ${normalizedName}`)
          .limit(1);

        if (existingProject.length > 0) {
          throw new Error('A project with this name already exists');
        }

        return true;
      }),
  ],

  update: [
    param('id')
      .custom(async (value) => {
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, value))
          .limit(1);
        
        if (project.length === 0) {
          throw new Error('Project not found');
        }

        return true;
      }),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .custom(async (value, { req }) => {
        const projectId = req.params?.id;
        const normalizedName = value.toLowerCase();
        
        // Check if another project has this name
        const existingProject = await db
          .select()
          .from(projects)
          .where(
            and(
              sql`lower(trim(${projects.name})) = ${normalizedName}`,
              sql`${projects.id} != ${projectId}`
            )
          )
          .limit(1);

        if (existingProject.length > 0) {
          throw new Error('A project with this name already exists');
        }

        return true;
      }),
  ],

  delete: [
    param('id')
      .custom(async (value) => {
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, value))
          .limit(1);
        
        if (project.length === 0) {
          throw new Error('Project not found');
        }
        
        return true;
      }),
  ],

  getAll: [],
};

export default ProjectsMiddleware;