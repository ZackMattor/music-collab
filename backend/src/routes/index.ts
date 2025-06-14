import { Router } from 'express';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    message: 'Music Collaboration Platform API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      tracks: '/api/tracks',
      collaborations: '/api/collaborations',
    },
  });
});

// Placeholder routes for future implementation
router.use('/auth', (req, res) => {
  res.json({ message: 'Authentication endpoints - Coming soon' });
});

router.use('/users', (req, res) => {
  res.json({ message: 'User management endpoints - Coming soon' });
});

router.use('/projects', (req, res) => {
  res.json({ message: 'Project management endpoints - Coming soon' });
});

router.use('/tracks', (req, res) => {
  res.json({ message: 'Track management endpoints - Coming soon' });
});

router.use('/collaborations', (req, res) => {
  res.json({ message: 'Collaboration endpoints - Coming soon' });
});

export { router as apiRoutes };
