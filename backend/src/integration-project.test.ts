import request from 'supertest';
import { app } from './app';
import { DatabaseSeeder } from './test-utils/database-seeder';
import { prisma } from './services/database';

describe('Project API Integration Tests', () => {
  let seeder: DatabaseSeeder;
  let authTokens: { accessToken: string; refreshToken: string };
  let testUser: { id: string; email: string; displayName: string };
  let otherUser: { id: string; email: string; displayName: string };

  beforeAll(async () => {
    seeder = new DatabaseSeeder(prisma);
  });

  beforeEach(async () => {
    // Clean database and seed test data
    await seeder.cleanDatabase();
    
    // Create test users
    const users = await seeder.createUsers([
      {
        email: 'projectowner@test.com',
        displayName: 'Project Owner',
        password: 'password123'
      },
      {
        email: 'collaborator@test.com',
        displayName: 'Collaborator',
        password: 'password123'
      }
    ]);

    testUser = users[0];
    otherUser = users[1];

    // Login to get auth tokens
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });

    authTokens = loginResponse.body.data;
  });

  afterAll(async () => {
    await seeder.cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project for integration testing',
        tempo: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        isPublic: false
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: projectData.name,
        description: projectData.description,
        tempo: projectData.tempo,
        timeSignatureNumerator: projectData.timeSignatureNumerator,
        timeSignatureDenominator: projectData.timeSignatureDenominator,
        isPublic: projectData.isPublic,
        ownerId: testUser.id
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should create project with minimal data', async () => {
      const projectData = {
        name: 'Minimal Project'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(projectData.name);
      expect(response.body.data.ownerId).toBe(testUser.id);
      expect(response.body.data.tempo).toBe(120); // Default value
      expect(response.body.data.isPublic).toBe(false); // Default value
    });

    it('should return 400 for missing project name', async () => {
      const projectData = {
        description: 'Project without name'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe('Project name is required');
    });

    it('should return 400 for invalid tempo', async () => {
      const projectData = {
        name: 'Invalid Tempo Project',
        tempo: 300 // Too high
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe('Tempo must be between 60 and 200 BPM');
    });

    it('should return 401 without authentication', async () => {
      const projectData = {
        name: 'Unauthorized Project'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(projectData)
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('GET /api/v1/projects', () => {
    let testProject1: any;
    let testProject2: any;
    let publicProject: any;

    beforeEach(async () => {
      // Create test projects
      const projects = await seeder.createProjects([
        {
          name: 'Private Project 1',
          description: 'First test project',
          ownerId: testUser.id,
          tempo: 120
        },
        {
          name: 'Private Project 2',
          description: 'Second test project',
          ownerId: testUser.id,
          tempo: 140
        },
        {
          name: 'Public Project',
          description: 'A public project',
          ownerId: otherUser.id,
          tempo: 100
        }
      ]);

      testProject1 = projects[0];
      testProject2 = projects[1];
      publicProject = projects[2];

      // Make one project public
      await prisma.project.update({
        where: { id: publicProject.id },
        data: { isPublic: true }
      });
    });

    it('should get all user projects by default', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.count).toBe(2);
      expect(response.body.meta.type).toBe('all');
      
      const projectNames = response.body.data.map((p: any) => p.name);
      expect(projectNames).toContain('Private Project 1');
      expect(projectNames).toContain('Private Project 2');
    });

    it('should get owned projects only', async () => {
      const response = await request(app)
        .get('/api/v1/projects?type=owned')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.type).toBe('owned');
      
      response.body.data.forEach((project: any) => {
        expect(project.ownerId).toBe(testUser.id);
      });
    });

    it('should get public projects', async () => {
      const response = await request(app)
        .get('/api/v1/projects?type=public')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.type).toBe('public');
      expect(response.body.data[0].name).toBe('Public Project');
      expect(response.body.data[0].isPublic).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('GET /api/v1/projects/:projectId', () => {
    let testProject: any;

    beforeEach(async () => {
      const projects = await seeder.createProjects([
        {
          name: 'Test Project for Get',
          description: 'A project for GET testing',
          ownerId: testUser.id,
          tempo: 130
        }
      ]);
      testProject = projects[0];
    });

    it('should get project by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testProject.id,
        name: testProject.name,
        description: testProject.description,
        tempo: testProject.tempo,
        ownerId: testUser.id
      });
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/v1/projects/nonexistent-id')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('Project not found');
    });

    it('should return 403 for project without access', async () => {
      // Login as other user
      const otherLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: otherUser.email,
          password: 'password123'
        });

      const otherTokens = otherLoginResponse.body.data;

      const response = await request(app)
        .get(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('PUT /api/v1/projects/:projectId', () => {
    let testProject: any;

    beforeEach(async () => {
      const projects = await seeder.createProjects([
        {
          name: 'Test Project for Update',
          description: 'A project for UPDATE testing',
          ownerId: testUser.id,
          tempo: 120
        }
      ]);
      testProject = projects[0];
    });

    it('should update project', async () => {
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated description',
        tempo: 140
      };

      const response = await request(app)
        .put(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testProject.id,
        name: updateData.name,
        description: updateData.description,
        tempo: updateData.tempo,
        ownerId: testUser.id
      });

      // Verify in database
      const updatedProject = await prisma.project.findUnique({
        where: { id: testProject.id }
      });
      expect(updatedProject?.name).toBe(updateData.name);
      expect(updatedProject?.tempo).toBe(updateData.tempo);
    });

    it('should return 400 for invalid update data', async () => {
      const updateData = {
        tempo: 300 // Too high
      };

      const response = await request(app)
        .put(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe('Tempo must be between 60 and 200 BPM');
    });

    it('should return 403 for user without write access', async () => {
      // Login as other user
      const otherLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: otherUser.email,
          password: 'password123'
        });

      const otherTokens = otherLoginResponse.body.data;

      const response = await request(app)
        .put(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .send({ name: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('DELETE /api/v1/projects/:projectId', () => {
    let testProject: any;

    beforeEach(async () => {
      const projects = await seeder.createProjects([
        {
          name: 'Test Project for Delete',
          description: 'A project for DELETE testing',
          ownerId: testUser.id,
          tempo: 120
        }
      ]);
      testProject = projects[0];
    });

    it('should delete project (owner only)', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProject.id);
      expect(response.body.data.deletedAt).toBeDefined();

      // Verify project is deleted from database
      const deletedProject = await prisma.project.findUnique({
        where: { id: testProject.id }
      });
      expect(deletedProject).toBeNull();
    });

    it('should return 403 for non-owner trying to delete', async () => {
      // Login as other user
      const otherLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: otherUser.email,
          password: 'password123'
        });

      const otherTokens = otherLoginResponse.body.data;

      const response = await request(app)
        .delete(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied');

      // Verify project still exists
      const stillExists = await prisma.project.findUnique({
        where: { id: testProject.id }
      });
      expect(stillExists).not.toBeNull();
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/v1/projects/nonexistent-id')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('Project Collaboration Access', () => {
    let projectOwner: any;
    let collaborator: any;
    let testProject: any;

    beforeEach(async () => {
      // Create additional users for collaboration testing
      const users = await seeder.createUsers([
        {
          email: 'owner@test.com',
          displayName: 'Project Owner',
          password: 'password123'
        },
        {
          email: 'collab@test.com',
          displayName: 'Collaborator',
          password: 'password123'
        }
      ]);

      projectOwner = users[0];
      collaborator = users[1];

      // Create project owned by projectOwner
      const projects = await seeder.createProjects([
        {
          name: 'Collaboration Test Project',
          ownerId: projectOwner.id,
          tempo: 120
        }
      ]);
      testProject = projects[0];

      // Add collaborator to project
      await prisma.projectCollaborator.create({
        data: {
          projectId: testProject.id,
          userId: collaborator.id,
          role: 'CONTRIBUTOR',
          canEdit: true,
          canAddStems: true,
          canDeleteStems: false,
          canInviteOthers: false,
          canExport: true
        }
      });
    });

    it('should allow collaborator to read project', async () => {
      // Login as collaborator
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: collaborator.email,
          password: 'password123'
        });

      const collabTokens = loginResponse.body.data;

      const response = await request(app)
        .get(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${collabTokens.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProject.id);
    });

    it('should allow collaborator to update project', async () => {
      // Login as collaborator
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: collaborator.email,
          password: 'password123'
        });

      const collabTokens = loginResponse.body.data;

      const response = await request(app)
        .put(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${collabTokens.accessToken}`)
        .send({ name: 'Updated by Collaborator' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated by Collaborator');
    });

    it('should not allow collaborator to delete project (admin only)', async () => {
      // Login as collaborator
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: collaborator.email,
          password: 'password123'
        });

      const collabTokens = loginResponse.body.data;

      const response = await request(app)
        .delete(`/api/v1/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${collabTokens.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });
});
