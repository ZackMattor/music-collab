import request from 'supertest';
import { app } from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('/api/v1/stems Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let projectId: string;
  let stemId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.stemSegment.deleteMany({ where: {} });
    await prisma.stem.deleteMany({ where: {} });
    await prisma.projectCollaborator.deleteMany({ where: {} });
    await prisma.project.deleteMany({ where: {} });
    await prisma.user.deleteMany({ where: { email: 'stem-test@example.com' } });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.stemSegment.deleteMany({ where: {} });
    await prisma.stem.deleteMany({ where: {} });
    await prisma.projectCollaborator.deleteMany({ where: {} });
    await prisma.project.deleteMany({ where: {} });
    await prisma.user.deleteMany({ where: { email: 'stem-test@example.com' } });
    await prisma.$disconnect();
  });

  describe('Authentication Setup', () => {
    it('should register and login a test user', async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'stem-test@example.com',
          displayName: 'Stem Test User',
          password: 'testpassword123'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      authToken = registerResponse.body.data.tokens.accessToken;
      userId = registerResponse.body.data.user.id;

      // Create a test project
      const projectResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for Stems',
          description: 'Project for testing stem functionality',
          isPublic: false
        });

      expect(projectResponse.status).toBe(201);
      projectId = projectResponse.body.data.id;
    });
  });

  describe('POST /api/v1/projects/:projectId/stems', () => {
    it('should create a new stem', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/stems`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Piano Stem',
          color: '#FF0000',
          instrumentType: 'piano',
          volume: 0.8,
          pan: -0.2
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Piano Stem');
      expect(response.body.data.color).toBe('#FF0000');
      expect(response.body.data.instrumentType).toBe('piano');
      expect(response.body.data.volume).toBe(0.8);
      expect(response.body.data.pan).toBe(-0.2);
      expect(response.body.data.projectId).toBe(projectId);
      expect(response.body.data.lastModifiedBy).toBe(userId);
      stemId = response.body.data.id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/stems`)
        .send({
          name: 'Unauthorized Stem'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/stems`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          color: '#00FF00'
          // missing name
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe('Stem name is required');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .post('/api/v1/projects/non-existent-project/stems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Stem'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Stem creation failed');
    });
  });

  describe('GET /api/v1/projects/:projectId/stems', () => {
    it('should get all stems for a project', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stems`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(stemId);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stems`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('GET /api/v1/stems/:stemId', () => {
    it('should get a specific stem', async () => {
      const response = await request(app)
        .get(`/api/v1/stems/${stemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(stemId);
      expect(response.body.data.name).toBe('Test Piano Stem');
    });

    it('should get stem with segments when requested', async () => {
      const response = await request(app)
        .get(`/api/v1/stems/${stemId}?withSegments=true`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('segments');
      expect(Array.isArray(response.body.data.segments)).toBe(true);
    });

    it('should return 404 for non-existent stem', async () => {
      const response = await request(app)
        .get('/api/v1/stems/non-existent-stem')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Stem not found');
    });
  });

  describe('PUT /api/v1/stems/:stemId', () => {
    it('should update stem properties', async () => {
      const response = await request(app)
        .put(`/api/v1/stems/${stemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Piano Stem',
          volume: 0.9,
          isMuted: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Piano Stem');
      expect(response.body.data.volume).toBe(0.9);
      expect(response.body.data.isMuted).toBe(true);
      expect(response.body.data.version).toBe(2); // Version should increment
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/stems/${stemId}`)
        .send({
          name: 'Unauthorized Update'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/projects/:projectId/stems/permissions', () => {
    it('should get stem permissions for project owner', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stems/permissions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        canAddStems: true,
        canDeleteStems: true,
        canEdit: true
      });
    });
  });

  describe('PUT /api/v1/projects/:projectId/stems/reorder', () => {
    let secondStemId: string;

    beforeAll(async () => {
      // Create a second stem for reordering
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/stems`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Second Test Stem',
          instrumentType: 'guitar'
        });
      secondStemId = response.body.data.id;
    });

    it('should reorder stems', async () => {
      const response = await request(app)
        .put(`/api/v1/projects/${projectId}/stems/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stemOrders: [
            { id: stemId, order: 1 },
            { id: secondStemId, order: 0 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Stems reordered successfully');
    });

    it('should validate stemOrders format', async () => {
      const response = await request(app)
        .put(`/api/v1/projects/${projectId}/stems/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stemOrders: [
            { id: stemId } // missing order
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid stem order format');
    });
  });

  describe('GET /api/v1/projects/:projectId/stems/by-instrument/:instrumentType', () => {
    it('should get stems by instrument type', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stems/by-instrument/piano`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].instrumentType).toBe('piano');
    });
  });

  describe('DELETE /api/v1/stems/:stemId', () => {
    it('should delete a stem', async () => {
      const response = await request(app)
        .delete(`/api/v1/stems/${stemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(stemId);
    });

    it('should return 404 for already deleted stem', async () => {
      const response = await request(app)
        .delete(`/api/v1/stems/${stemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Stem deletion failed');
    });
  });

  describe('Permission Testing with Collaborator', () => {
    let collaboratorToken: string;
    let collaboratorId: string;

    beforeAll(async () => {
      // Register collaborator
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'stem-collaborator@example.com',
          displayName: 'Stem Collaborator',
          password: 'testpassword123'
        });

      collaboratorToken = registerResponse.body.data.tokens.accessToken;
      collaboratorId = registerResponse.body.data.user.id;

      // Invite collaborator to project with limited permissions
      await request(app)
        .post(`/api/v1/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'stem-collaborator@example.com',
          role: 'CONTRIBUTOR',
          permissions: {
            canEdit: true,
            canAddStems: true,
            canDeleteStems: false
          }
        });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: 'stem-collaborator@example.com' } });
    });

    it('should allow collaborator to create stems with canAddStems permission', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/stems`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          name: 'Collaborator Stem'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should prevent collaborator from deleting stems without canDeleteStems permission', async () => {
      // Create a stem first
      const createResponse = await request(app)
        .post(`/api/v1/projects/${projectId}/stems`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stem to Delete'
        });

      const newStemId = createResponse.body.data.id;

      // Try to delete with collaborator token
      const deleteResponse = await request(app)
        .delete(`/api/v1/stems/${newStemId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(deleteResponse.status).toBe(403);
      expect(deleteResponse.body.error).toBe('Stem deletion failed');
      expect(deleteResponse.body.message).toContain('permission');
    });

    it('should return correct permissions for collaborator', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stems/permissions`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        canAddStems: true,
        canDeleteStems: false,
        canEdit: true
      });
    });
  });
});
