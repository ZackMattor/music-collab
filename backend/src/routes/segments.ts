import { Router } from 'express';
import { SegmentController } from '../controllers/SegmentController';
import { PrismaClient } from '@prisma/client';
import { createAuthMiddleware } from '../middleware/auth';

export function createSegmentRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const segmentController = new SegmentController(prisma);
  const authenticateToken = createAuthMiddleware(prisma)();

  // All routes require authentication
  router.use(authenticateToken);

  // Segment CRUD operations
  router.get('/projects/:projectId/stems/:stemId/segments', segmentController.getSegments);
  router.get('/projects/:projectId/stems/:stemId/segments/:segmentId', segmentController.getSegment);
  router.post('/projects/:projectId/stems/:stemId/segments', segmentController.createSegment);
  router.put('/projects/:projectId/stems/:stemId/segments/:segmentId', segmentController.updateSegment);
  router.delete('/projects/:projectId/stems/:stemId/segments/:segmentId', segmentController.deleteSegment);

  // Segment filtering and operations
  router.get('/projects/:projectId/stems/:stemId/segments/time-range', segmentController.getSegmentsByTimeRange);
  router.get('/projects/:projectId/stems/:stemId/segments/type/:type', segmentController.getSegmentsByType);
  router.post('/projects/:projectId/stems/:stemId/segments/:segmentId/duplicate', segmentController.duplicateSegment);

  // MIDI note operations
  router.post('/projects/:projectId/stems/:stemId/segments/:segmentId/notes', segmentController.addMidiNote);
  router.put('/projects/:projectId/stems/:stemId/segments/:segmentId/notes/:noteId', segmentController.updateMidiNote);
  router.delete('/projects/:projectId/stems/:stemId/segments/:segmentId/notes/:noteId', segmentController.deleteMidiNote);

  return router;
}
