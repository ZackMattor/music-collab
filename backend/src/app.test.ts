import request from 'supertest';
import { app } from './app';

describe('Health Check', () => {
  it('should return 200 for /health endpoint', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });
});

describe('API Routes', () => {
  it('should return API information for /api/v1 endpoint', async () => {
    const response = await request(app).get('/api/v1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Music Collaboration Platform API');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('endpoints');
    expect(response.body.endpoints.auth).toBe('/api/v1/auth');
    expect(response.body.endpoints.users).toBe('/api/v1/users');
    expect(response.body.endpoints.projects).toBe('/api/v1/projects');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('message');
  });
});
