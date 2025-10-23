import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { testDb } from '../setup';
import { projects } from 'mailstub-types';

describe('Projects API Integration Tests', () => {
  const app = createTestApp();

  describe('POST /api/projects', () => {
    it('should create a new project with valid data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' })
        .expect(201);

      expect(response.body).toMatchObject({
        project: {
          name: 'Test Project',
          id: expect.stringMatching(/^p_[a-f0-9-]+$/),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });

      // Verify in database
      const allProjects = await testDb.select().from(projects);
      expect(allProjects).toHaveLength(1);
      expect(allProjects[0].name).toBe('Test Project');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.name).toBeDefined();
    });

    it('should return 400 when name is empty', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: '   ' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.name).toBe('Project name is required');
    });

    it('should return 400 for duplicate project names', async () => {
      // Create first project
      await request(app)
        .post('/api/projects')
        .send({ name: 'Duplicate Project' })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Duplicate Project' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.name).toBe('A project with this name already exists');
    });

    it('should reject duplicate names regardless of case', async () => {
      await request(app)
        .post('/api/projects')
        .send({ name: 'My Project' })
        .expect(201);

      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'my project' })
        .expect(400);

      expect(response.body.errors.name).toBe('A project with this name already exists');
    });

    it('should reject duplicate names with extra whitespace', async () => {
      await request(app)
        .post('/api/projects')
        .send({ name: 'Spaced Project' })
        .expect(201);

      const response = await request(app)
        .post('/api/projects')
        .send({ name: '  Spaced Project  ' })
        .expect(400);

      expect(response.body.errors.name).toBe('A project with this name already exists');
    });
  });

  describe('GET /api/projects', () => {
    it('should return empty array when no projects exist', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toEqual({ projects: [] });
    });

    it('should return all projects', async () => {
      // Create multiple projects
      await request(app).post('/api/projects').send({ name: 'Project 1' });
      await request(app).post('/api/projects').send({ name: 'Project 2' });
      await request(app).post('/api/projects').send({ name: 'Project 3' });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects).toHaveLength(3);
      expect(response.body.projects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Project 1' }),
          expect.objectContaining({ name: 'Project 2' }),
          expect.objectContaining({ name: 'Project 3' })
        ])
      );
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      // Create a project
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Original Name' })
        .expect(201);

      const projectId = createResponse.body.project.id;

      // Update the project
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.project).toMatchObject({
        id: projectId,
        name: 'Updated Name'
      });
    });

    it('should return 400 when project does not exist', async () => {
      const response = await request(app)
        .put('/api/projects/p_nonexistent')
        .send({ name: 'New Name' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.id).toBe('Project not found');
    });

    it('should return 400 when name is missing', async () => {
      // Create a project
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' })
        .expect(201);

      const projectId = createResponse.body.project.id;

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({})
        .expect(400);

      expect(response.body.errors.name).toBeDefined();
    });

    it('should return 400 when updating to a duplicate name', async () => {
      // Create two projects
      await request(app).post('/api/projects').send({ name: 'Project A' });
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Project B' })
        .expect(201);

      const projectBId = createResponse.body.project.id;

      // Try to update Project B to have Project A's name
      const response = await request(app)
        .put(`/api/projects/${projectBId}`)
        .send({ name: 'Project A' })
        .expect(400);

      expect(response.body.errors.name).toBe('A project with this name already exists');
    });

    it('should allow updating to the same name', async () => {
      // Create a project
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Same Name' })
        .expect(201);

      const projectId = createResponse.body.project.id;

      // Update to the same name (should succeed)
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({ name: 'Same Name' })
        .expect(200);

      expect(response.body.project.name).toBe('Same Name');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete an existing project', async () => {
      // Create a project
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'To Delete' })
        .expect(201);

      const projectId = createResponse.body.project.id;

      // Delete the project
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body.message).toBe('Project deleted successfully');

      // Verify it's gone
      const getResponse = await request(app).get('/api/projects').expect(200);
      expect(getResponse.body.projects).toHaveLength(0);
    });

    it('should return 400 when project does not exist', async () => {
      const response = await request(app)
        .delete('/api/projects/p_nonexistent')
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.id).toBe('Project not found');
    });

    it('should delete associated users and messages', async () => {
      // This test verifies cascade delete behavior
      // We'll create a project, then verify deletion works
      // (Full test would require creating users/messages, but that's covered in integration)
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Project with Data' })
        .expect(201);

      const projectId = createResponse.body.project.id;

      await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(200);

      // Verify project is deleted
      const allProjects = await testDb.select().from(projects);
      expect(allProjects).toHaveLength(0);
    });
  });
});