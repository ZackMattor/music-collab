import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { StemController } from '../controllers/StemController';
import { StemService } from '../services/StemService';
import { StemRepository } from '../repositories/StemRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { createAuthMiddleware } from '../middleware/auth';

/**
 * Create stem management routes
 * Implements stem CRUD operations with proper authentication and authorization
 */
export function createStemRoutes(prisma: PrismaClient): Router {
  const router = Router();
  
  // Initialize dependencies
  const stemRepository = new StemRepository(prisma);
  const projectRepository = new ProjectRepository(prisma);
  const collaborationRepository = new CollaborationRepository(prisma);
  const stemService = new StemService(stemRepository, projectRepository, collaborationRepository);
  const stemController = new StemController(stemService);
  const authMiddleware = createAuthMiddleware(prisma);

  /**
   * @swagger
   * components:
   *   schemas:
   *     Stem:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           description: Unique identifier for the stem
   *         projectId:
   *           type: string
   *           description: ID of the project this stem belongs to
   *         name:
   *           type: string
   *           description: Name of the stem
   *         color:
   *           type: string
   *           description: Hex color code for the stem
   *           default: "#3B82F6"
   *         volume:
   *           type: number
   *           description: Volume level (0.0 to 1.0)
   *           default: 1.0
   *         pan:
   *           type: number
   *           description: Pan position (-1.0 to 1.0)
   *           default: 0.0
   *         isMuted:
   *           type: boolean
   *           description: Whether the stem is muted
   *           default: false
   *         isSoloed:
   *           type: boolean
   *           description: Whether the stem is soloed
   *           default: false
   *         instrumentType:
   *           type: string
   *           description: Type of instrument
   *           nullable: true
   *         midiChannel:
   *           type: integer
   *           description: MIDI channel (1-16)
   *           nullable: true
   *         order:
   *           type: integer
   *           description: Display order within the project
   *         version:
   *           type: integer
   *           description: Version number for optimistic locking
   *         lastModifiedBy:
   *           type: string
   *           description: ID of the user who last modified the stem
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *     CreateStemRequest:
   *       type: object
   *       required:
   *         - name
   *       properties:
   *         name:
   *           type: string
   *           description: Name of the stem
   *         color:
   *           type: string
   *           description: Hex color code
   *         volume:
   *           type: number
   *           minimum: 0
   *           maximum: 1
   *         pan:
   *           type: number
   *           minimum: -1
   *           maximum: 1
   *         instrumentType:
   *           type: string
   *         midiChannel:
   *           type: integer
   *           minimum: 1
   *           maximum: 16
   *         order:
   *           type: integer
   *     UpdateStemRequest:
   *       type: object
   *       properties:
   *         name:
   *           type: string
   *         color:
   *           type: string
   *         volume:
   *           type: number
   *           minimum: 0
   *           maximum: 1
   *         pan:
   *           type: number
   *           minimum: -1
   *           maximum: 1
   *         isMuted:
   *           type: boolean
   *         isSoloed:
   *           type: boolean
   *         instrumentType:
   *           type: string
   *         midiChannel:
   *           type: integer
   *           minimum: 1
   *           maximum: 16
   *         order:
   *           type: integer
   *     StemPermissions:
   *       type: object
   *       properties:
   *         canAddStems:
   *           type: boolean
   *         canDeleteStems:
   *           type: boolean
   *         canEdit:
   *           type: boolean
   */

  /**
   * @swagger
   * /api/v1/projects/{projectId}/stems:
   *   get:
   *     summary: Get all stems for a project
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     responses:
   *       200:
   *         description: List of stems retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Stem'
   *                 message:
   *                   type: string
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Access denied
   *       404:
   *         description: Project not found
   */
  router.get('/projects/:projectId/stems',
    authMiddleware() as RequestHandler,
    stemController.getProjectStems as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/projects/{projectId}/stems:
   *   post:
   *     summary: Create a new stem
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateStemRequest'
   *     responses:
   *       201:
   *         description: Stem created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Stem'
   *                 message:
   *                   type: string
   *       400:
   *         description: Validation failed
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Project not found
   */
  router.post('/projects/:projectId/stems',
    authMiddleware() as RequestHandler,
    stemController.createStem as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/stems/{stemId}:
   *   get:
   *     summary: Get a specific stem
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: stemId
   *         required: true
   *         schema:
   *           type: string
   *         description: Stem ID
   *       - in: query
   *         name: withSegments
   *         schema:
   *           type: boolean
   *         description: Include stem segments in response
   *     responses:
   *       200:
   *         description: Stem retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Stem'
   *                 message:
   *                   type: string
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Access denied
   *       404:
   *         description: Stem not found
   */
  router.get('/stems/:stemId',
    authMiddleware() as RequestHandler,
    stemController.getStemById as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/stems/{stemId}:
   *   put:
   *     summary: Update a stem
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: stemId
   *         required: true
   *         schema:
   *           type: string
   *         description: Stem ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateStemRequest'
   *     responses:
   *       200:
   *         description: Stem updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Stem'
   *                 message:
   *                   type: string
   *       400:
   *         description: Validation failed
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Stem not found
   */
  router.put('/stems/:stemId',
    authMiddleware() as RequestHandler,
    stemController.updateStem as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/stems/{stemId}:
   *   delete:
   *     summary: Delete a stem
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: stemId
   *         required: true
   *         schema:
   *           type: string
   *         description: Stem ID
   *     responses:
   *       200:
   *         description: Stem deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Stem'
   *                 message:
   *                   type: string
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Stem not found
   */
  router.delete('/stems/:stemId',
    authMiddleware() as RequestHandler,
    stemController.deleteStem as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/projects/{projectId}/stems/reorder:
   *   put:
   *     summary: Reorder stems within a project
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               stemOrders:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     order:
   *                       type: integer
   *     responses:
   *       200:
   *         description: Stems reordered successfully
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Project or stems not found
   */
  router.put('/projects/:projectId/stems/reorder',
    authMiddleware() as RequestHandler,
    stemController.reorderStems as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/projects/{projectId}/stems/permissions:
   *   get:
   *     summary: Get user's stem permissions for a project
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     responses:
   *       200:
   *         description: Permissions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/StemPermissions'
   *                 message:
   *                   type: string
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Access denied
   *       404:
   *         description: Project not found
   */
  router.get('/projects/:projectId/stems/permissions',
    authMiddleware() as RequestHandler,
    stemController.getStemPermissions as RequestHandler
  );

  /**
   * @swagger
   * /api/v1/projects/{projectId}/stems/by-instrument/{instrumentType}:
   *   get:
   *     summary: Get stems by instrument type
   *     tags: [Stems]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *       - in: path
   *         name: instrumentType
   *         required: true
   *         schema:
   *           type: string
   *         description: Instrument type
   *     responses:
   *       200:
   *         description: Stems retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Stem'
   *                 message:
   *                   type: string
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Access denied
   *       404:
   *         description: Project not found
   */
  router.get('/projects/:projectId/stems/by-instrument/:instrumentType',
    authMiddleware() as RequestHandler,
    stemController.getStemsByInstrumentType as RequestHandler
  );

  return router;
}
