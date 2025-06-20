import request from 'supertest';
import { app } from './app';

describe('API Versioning Integration', () => {
  describe('Versioned Endpoints', () => {
    it('should require authentication for user endpoints', async () => {
      // Test that user endpoints now require authentication
      const response = await request(app).get('/api/v1/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should require authentication for projects endpoints', async () => {
      const response = await request(app).get('/api/v1/projects');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should return 404 for old unversioned endpoints', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(404);
    });

    it('should return API info with versioned endpoint URLs', async () => {
      const response = await request(app).get('/api/v1');
      
      expect(response.status).toBe(200);
      expect(response.body.endpoints.auth).toBe('/api/v1/auth');
      expect(response.body.endpoints.users).toBe('/api/v1/users');
      expect(response.body.endpoints.projects).toBe('/api/v1/projects');
    });
  });

  describe('Health Check (Non-versioned)', () => {
    it('should still access health check at /health', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});
