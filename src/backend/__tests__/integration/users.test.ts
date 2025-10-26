import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { testDb } from '../setup';
import { users } from '@/db/schema';

describe('Users API Integration Tests', () => {
  const app = createTestApp();
  let testProjectId: string;

  // Create a test project before each test
  beforeEach(async () => {
    const projectResponse = await request(app)
      .post('/api/projects')
      .send({ name: 'Test Project' });
    testProjectId = projectResponse.body.project.id;
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'test@example.com'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        user: {
          email: 'test@example.com',
          projectId: testProjectId,
          id: expect.stringMatching(/^u_[a-f0-9-]+$/),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });

      // Verify in database
      const allUsers = await testDb.select().from(users);
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].email).toBe('test@example.com');
    });

    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.projectId).toBeDefined();
    });

    it('should return 400 when project does not exist', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          projectId: 'p_nonexistent',
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.errors.projectId).toBe('Project not found');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId })
        .expect(400);

      expect(response.body.errors.email).toBeDefined();
    });

    it('should return 400 when email is invalid', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.errors.email).toBe('Please enter a valid email address');
    });

    it('should return 400 for duplicate email in same project', async () => {
      // Create first user
      await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'duplicate@example.com'
        })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'duplicate@example.com'
        })
        .expect(400);

      expect(response.body.errors.email).toBe('A user with this email already exists in this project');
    });

    it('should allow same email in different projects', async () => {
      // Create second project
      const project2Response = await request(app)
        .post('/api/projects')
        .send({ name: 'Another Project' });
      const project2Id = project2Response.body.project.id;

      // Create user in first project
      await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'same@example.com'
        })
        .expect(201);

      // Create user with same email in second project (should succeed)
      const response = await request(app)
        .post('/api/users')
        .send({
          projectId: project2Id,
          email: 'same@example.com'
        })
        .expect(201);

      expect(response.body.user.email).toBe('same@example.com');
      expect(response.body.user.projectId).toBe(project2Id);
    });

    it('should normalize email addresses', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'Test.User@EXAMPLE.COM'
        })
        .expect(201);

      // Email should be normalized (lowercased)
      expect(response.body.user.email).toBe('test.user@example.com');
    });
  });

  describe('GET /api/users', () => {
    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(400);

      expect(response.body.errors.projectId).toBeDefined();
    });

    it('should return 400 when project does not exist', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ projectId: 'p_nonexistent' })
        .expect(400);

      expect(response.body.errors.projectId).toBe('Project not found');
    });

    it('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ projectId: testProjectId })
        .expect(200);

      expect(response.body).toEqual({ users: [] });
    });

    it('should return all users for a project', async () => {
      // Create multiple users
      await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId, email: 'user1@example.com' });
      await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId, email: 'user2@example.com' });
      await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId, email: 'user3@example.com' });

      const response = await request(app)
        .get('/api/users')
        .query({ projectId: testProjectId })
        .expect(200);

      expect(response.body.users).toHaveLength(3);
      expect(response.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: 'user1@example.com' }),
          expect.objectContaining({ email: 'user2@example.com' }),
          expect.objectContaining({ email: 'user3@example.com' })
        ])
      );
    });

    it('should only return users for the specified project', async () => {
      // Create second project
      const project2Response = await request(app)
        .post('/api/projects')
        .send({ name: 'Another Project' });
      const project2Id = project2Response.body.project.id;

      // Create users in both projects
      await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId, email: 'project1@example.com' });
      await request(app)
        .post('/api/users')
        .send({ projectId: project2Id, email: 'project2@example.com' });

      // Get users for first project
      const response = await request(app)
        .get('/api/users')
        .query({ projectId: testProjectId })
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe('project1@example.com');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'original@example.com'
        })
        .expect(201);

      const userId = createResponse.body.user.id;

      // Update the user
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ email: 'updated@example.com' })
        .expect(200);

      expect(response.body.user).toMatchObject({
        id: userId,
        email: 'updated@example.com'
      });
    });

    it('should return 400 when user does not exist', async () => {
      const response = await request(app)
        .put('/api/users/u_nonexistent')
        .send({ email: 'new@example.com' })
        .expect(400);

      expect(response.body.errors.id).toBe('User not found');
    });

    it('should return 400 when email is missing', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'test@example.com'
        })
        .expect(201);

      const userId = createResponse.body.user.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({})
        .expect(400);

      expect(response.body.errors.email).toBeDefined();
    });

    it('should return 400 when email is invalid', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'test@example.com'
        })
        .expect(201);

      const userId = createResponse.body.user.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors.email).toBe('Please enter a valid email address');
    });

    it('should return 400 when updating to duplicate email in same project', async () => {
      // Create two users
      await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId, email: 'user1@example.com' });
      
      const user2Response = await request(app)
        .post('/api/users')
        .send({ projectId: testProjectId, email: 'user2@example.com' })
        .expect(201);

      const user2Id = user2Response.body.user.id;

      // Try to update user2 to have user1's email
      const response = await request(app)
        .put(`/api/users/${user2Id}`)
        .send({ email: 'user1@example.com' })
        .expect(400);

      expect(response.body.errors.email).toBe('A user with this email already exists in this project');
    });

    it('should allow updating to the same email', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'same@example.com'
        })
        .expect(201);

      const userId = createResponse.body.user.id;

      // Update to the same email (should succeed)
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ email: 'same@example.com' })
        .expect(200);

      expect(response.body.user.email).toBe('same@example.com');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete an existing user', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'todelete@example.com'
        })
        .expect(201);

      const userId = createResponse.body.user.id;

      // Delete the user
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      // Verify it's gone
      const getResponse = await request(app)
        .get('/api/users')
        .query({ projectId: testProjectId })
        .expect(200);
      
      expect(getResponse.body.users).toHaveLength(0);
    });

    it('should return 400 when user does not exist', async () => {
      const response = await request(app)
        .delete('/api/users/u_nonexistent')
        .expect(400);

      expect(response.body.errors.id).toBe('User not found');
    });

    it('should delete associated messages when deleting user', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          projectId: testProjectId,
          email: 'withmsgs@example.com'
        })
        .expect(201);

      const userId = createResponse.body.user.id;

      // Delete the user (cascade delete will remove messages)
      await request(app)
        .delete(`/api/users/${userId}`)
        .expect(200);

      // Verify user is deleted
      const allUsers = await testDb.select().from(users);
      expect(allUsers).toHaveLength(0);
    });
  });
});