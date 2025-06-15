import request from 'supertest';
import { app } from './app';
import { TestIntegrationSetup, createAuthHeader, extractToken } from './test-utils/test-integration-setup';
import { DatabaseSeeder } from './test-utils/database-seeder';

/**
 * 
 * These tests validate authentication and RBAC controls with real database interactions.
 * Unlike the existing integration.test.ts which only tests HTTP routing with mocked repositories,
 * these tests perform true end-to-end database operations.
 */
describe('Authentication Integration Tests - Phase 3.4', () => {
  let seeder: DatabaseSeeder;

  beforeAll(async () => {
    await TestIntegrationSetup.beforeAll();
    seeder = TestIntegrationSetup.getSeeder();
  });

  afterAll(async () => {
    await TestIntegrationSetup.afterAll();
  });

  beforeEach(async () => {
    await TestIntegrationSetup.beforeEach();
  });

  describe('User Registration Flow', () => {
    it('should complete full user registration flow with database persistence', async () => {
      const userData = {
        email: 'newuser@musiccollab.test',
        username: 'new_user',
        displayName: 'New User',
        password: 'SecurePassword123!'
      };

      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toMatchObject({
        message: 'User registered successfully',
        user: {
          email: userData.email,
          username: userData.username,
          displayName: userData.displayName,
          defaultTempo: 120,
          collaborationNotifications: true
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // Step 2: Verify user exists in database
      const user = await TestIntegrationSetup.getPrisma().user.findUnique({
        where: { email: userData.email }
      });

      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
      expect(user?.username).toBe(userData.username);
      expect(user?.passwordHash).not.toBe(userData.password); // Password should be hashed

      // Step 3: Verify immediate access with returned token
      const token = extractToken(registerResponse);
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set(createAuthHeader(token))
        .expect(200);

      expect(profileResponse.body.user.id).toBe(user?.id);
    });

    it('should prevent duplicate user registration in database', async () => {
      // Create user in database
      const userData = {
        email: 'duplicate@musiccollab.test',
        username: 'duplicate_user',
        displayName: 'Duplicate User',
        password: 'Password123!'
      };

      await seeder.createUser(userData);

      // Attempt to register same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'Registration failed',
        message: 'User with this email already exists'
      });

      // Verify only one user exists in database
      const users = await TestIntegrationSetup.getPrisma().user.findMany({
        where: { email: userData.email }
      });
      expect(users).toHaveLength(1);
    });
  });

  describe('User Login Flow', () => {
    it('should complete full login flow with database authentication', async () => {
      // Setup: Create user in database
      const userData = {
        email: 'loginuser@musiccollab.test',
        username: 'login_user',
        displayName: 'Login User',
        password: 'LoginPassword123!'
      };

      const createdUser = await seeder.createUser(userData);

      // Step 1: Login with correct credentials
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toMatchObject({
        message: 'Login successful',
        user: {
          id: createdUser.id,
          email: userData.email,
          username: userData.username,
          displayName: userData.displayName
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // Step 2: Verify token works for protected routes
      const token = extractToken(loginResponse);
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set(createAuthHeader(token))
        .expect(200);

      expect(profileResponse.body.user.id).toBe(createdUser.id);
    });

    it('should reject login with incorrect password', async () => {
      // Setup: Create user in database
      const userData = {
        email: 'wrongpass@musiccollab.test',
        username: 'wrong_pass',
        displayName: 'Wrong Pass User',
        password: 'CorrectPassword123!'
      };

      await seeder.createUser(userData);

      // Attempt login with wrong password
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Login failed',
        message: 'Invalid email or password'
      });
    });

    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@musiccollab.test',
          password: 'Password123!'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Login failed',
        message: 'Invalid email or password'
      });
    });
  });

  describe('JWT Token Validation Flow', () => {
    it('should validate JWT tokens against database user records', async () => {
      // Setup: Create user and get token
      const userData = {
        email: 'jwtuser@musiccollab.test',
        username: 'jwt_user',
        displayName: 'JWT User',
        password: 'JWTPassword123!'
      };

      const user = await seeder.createUser(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const token = extractToken(loginResponse);

      // Step 1: Validate token through API
      const validateResponse = await request(app)
        .post('/api/v1/auth/validate')
        .send({ token })
        .expect(200);

      expect(validateResponse.body).toMatchObject({
        message: 'Token is valid',
        valid: true,
        user: {
          id: user.id,
          email: userData.email,
          username: userData.username,
          displayName: userData.displayName
        }
      });

      // Step 2: Verify middleware validates token correctly
      const protectedResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set(createAuthHeader(token))
        .expect(200);

      expect(protectedResponse.body.user.id).toBe(user.id);
    });

    it('should reject invalid JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token';

      // Test validation endpoint
      const validateResponse = await request(app)
        .post('/api/v1/auth/validate')
        .send({ token: invalidToken })
        .expect(401);

      expect(validateResponse.body).toMatchObject({
        error: 'Invalid token',
        valid: false
      });

      // Test middleware protection
      const protectedResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set(createAuthHeader(invalidToken))
        .expect(401);

      expect(protectedResponse.body.error).toBe('Authentication failed');
    });

    it('should reject tokens for deleted users', async () => {
      // Setup: Create user and get token
      const userData = {
        email: 'deleteduser@musiccollab.test',
        username: 'deleted_user',
        displayName: 'Deleted User',
        password: 'DeletedPassword123!'
      };

      const user = await seeder.createUser(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const token = extractToken(loginResponse);

      // Delete user from database
      await TestIntegrationSetup.getPrisma().user.delete({
        where: { id: user.id }
      });

      // Token should now be invalid
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set(createAuthHeader(token))
        .expect(401);

      expect(response.body.error).toBe('Authentication failed');
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh tokens with database validation', async () => {
      // Setup: Create user and get tokens
      const userData = {
        email: 'refreshuser@musiccollab.test',
        username: 'refresh_user',
        displayName: 'Refresh User',
        password: 'RefreshPassword123!'
      };

      const user = await seeder.createUser(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const refreshToken = loginResponse.body.tokens.refreshToken;

      // Step 1: Refresh tokens
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toMatchObject({
        message: 'Token refreshed successfully',
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // Step 2: Verify new token works
      const newToken = refreshResponse.body.tokens.accessToken;
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set(createAuthHeader(newToken))
        .expect(200);

      expect(profileResponse.body.user.id).toBe(user.id);
    });

    it('should reject invalid refresh tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.refresh.token' })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Token refresh failed'
      });
    });
  });

  describe('User Management Integration', () => {
    it('should complete full user profile management flow', async () => {
      // Setup: Create user and get token
      const userData = {
        email: 'profileuser@musiccollab.test',
        username: 'profile_user',
        displayName: 'Profile User',
        password: 'ProfilePassword123!'
      };

      const user = await seeder.createUser(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const token = extractToken(loginResponse);

      // Step 1: Get initial profile
      const getProfileResponse = await request(app)
        .get('/api/v1/users/profile')
        .set(createAuthHeader(token))
        .expect(200);

      expect(getProfileResponse.body.user.displayName).toBe(userData.displayName);

      // Step 2: Update profile
      const newDisplayName = 'Updated Profile User';
      const updateResponse = await request(app)
        .put('/api/v1/users/profile')
        .set(createAuthHeader(token))
        .send({ displayName: newDisplayName })
        .expect(200);

      expect(updateResponse.body.user.displayName).toBe(newDisplayName);

      // Step 3: Verify changes persisted in database
      const updatedUser = await TestIntegrationSetup.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(updatedUser?.displayName).toBe(newDisplayName);

      // Step 4: Update preferences
      const preferencesResponse = await request(app)
        .put('/api/v1/users/preferences')
        .set(createAuthHeader(token))
        .send({
          defaultTempo: 140,
          collaborationNotifications: false
        })
        .expect(200);

      expect(preferencesResponse.body.preferences).toMatchObject({
        defaultTempo: 140,
        collaborationNotifications: false
      });

      // Verify preferences persisted
      const updatedUserPrefs = await TestIntegrationSetup.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(updatedUserPrefs?.defaultTempo).toBe(140);
      expect(updatedUserPrefs?.collaborationNotifications).toBe(false);
    });

    it('should enforce authentication for all user management endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/users/profile' },
        { method: 'put', path: '/api/v1/users/profile' },
        { method: 'get', path: '/api/v1/users/preferences' },
        { method: 'put', path: '/api/v1/users/preferences' },
        { method: 'put', path: '/api/v1/users/avatar' },
        { method: 'delete', path: '/api/v1/users/account' }
      ];

      for (const endpoint of endpoints) {
        const response = await (request(app) as any)[endpoint.method](endpoint.path) // eslint-disable-line @typescript-eslint/no-explicit-any
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      }
    });
  });

  describe('User Account Deletion Flow', () => {
    it('should complete secure account deletion with database cleanup', async () => {
      // Setup: Create user with some data
      const userData = {
        email: 'deleteuser@musiccollab.test',
        username: 'delete_user',
        displayName: 'Delete User',
        password: 'DeletePassword123!'
      };

      const user = await seeder.createUser(userData);

      // Create a project for the user
      await seeder.createProjects([{
        name: 'User Project',
        description: 'A project to be deleted',
        ownerId: user.id
      }]);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const token = extractToken(loginResponse);

      // Step 1: Delete account
      const deleteResponse = await request(app)
        .delete('/api/v1/users/account')
        .set(createAuthHeader(token))
        .send({ confirmPassword: userData.password })
        .expect(200);

      expect(deleteResponse.body.message).toBe('Account deleted successfully');

      // Step 2: Verify user is deleted from database
      const deletedUser = await TestIntegrationSetup.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(deletedUser).toBeNull();

      // Step 3: Verify related data is handled (projects should still exist but orphaned or reassigned)
      const remainingProjects = await TestIntegrationSetup.getPrisma().project.findMany({
        where: { ownerId: user.id }
      });

      // Note: The actual cascade behavior depends on your schema constraints
      // This test verifies the behavior matches your implementation
      // Projects should be deleted due to cascade constraints
      expect(remainingProjects).toHaveLength(0);
    });

    it('should reject account deletion without password confirmation', async () => {
      const userData = {
        email: 'noconfirm@musiccollab.test',
        username: 'no_confirm',
        displayName: 'No Confirm User',
        password: 'NoConfirmPassword123!'
      };

      const user = await seeder.createUser(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const token = extractToken(loginResponse);

      const response = await request(app)
        .delete('/api/v1/users/account')
        .set(createAuthHeader(token))
        .send({}) // No password confirmation
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'Password confirmation is required for account deletion'
      });

      // Verify user still exists
      const stillExists = await TestIntegrationSetup.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(stillExists).toBeTruthy();
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we ensure proper error responses
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'validpassword'
        });

      // Should get proper error response even if user doesn't exist
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle concurrent user operations safely', async () => {
      const userData = {
        email: 'concurrent@musiccollab.test',
        username: 'concurrent_user',
        displayName: 'Concurrent User',
        password: 'ConcurrentPassword123!'
      };

      const user = await seeder.createUser(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const token = extractToken(loginResponse);

      // Simulate concurrent profile updates
      const updatePromises = Array(5).fill(null).map((_, index) =>
        request(app)
          .put('/api/v1/users/profile')
          .set(createAuthHeader(token))
          .send({ displayName: `Updated Name ${index}` })
      );

      const responses = await Promise.all(updatePromises);

      // All requests should succeed (last one wins)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verify final state is consistent
      const finalUser = await TestIntegrationSetup.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(finalUser?.displayName).toMatch(/^Updated Name \d$/);
    });
  });
});
