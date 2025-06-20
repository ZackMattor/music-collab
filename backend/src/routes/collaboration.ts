import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { CollaborationController } from '../controllers/CollaborationController';
import { CollaborationService } from '../services/CollaborationService';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { createAuthMiddleware, createProjectAccessMiddleware } from '../middleware/auth';

/**
 * Create collaboration management routes
 * Implements project collaboration functionality with proper authentication and authorization
 */
export function createCollaborationRoutes(prisma: PrismaClient): Router {
  const router = Router();
  
  // Initialize dependencies
  const collaborationRepository = new CollaborationRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const projectRepository = new ProjectRepository(prisma);
  const collaborationService = new CollaborationService(
    collaborationRepository,
    userRepository,
    projectRepository
  );
  const collaborationController = new CollaborationController(collaborationService);
  const authMiddleware = createAuthMiddleware(prisma);
  const projectAccessMiddleware = createProjectAccessMiddleware(prisma);

/**
 * @swagger
 * components:
 *   schemas:
 *     Collaborator:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the collaborator
 *         projectId:
 *           type: string
 *           description: Project ID
 *         userId: 
 *           type: string
 *           description: User ID
 *         role:
 *           type: string
 *           enum: [VIEWER, CONTRIBUTOR, ADMIN]
 *           description: Collaborator role
 *         permissions:
 *           type: object
 *           properties:
 *             canEdit:
 *               type: boolean
 *             canAddStems:
 *               type: boolean
 *             canDeleteStems:
 *               type: boolean
 *             canInviteOthers:
 *               type: boolean
 *             canExport:
 *               type: boolean
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 *         isOnline:
 *           type: boolean
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             displayName:
 *               type: string
 *             avatar:
 *               type: string
 *       example:
 *         id: "cuid123"
 *         projectId: "project456"
 *         userId: "user789"
 *         role: "CONTRIBUTOR"
 *         permissions:
 *           canEdit: true
 *           canAddStems: true
 *           canDeleteStems: false
 *           canInviteOthers: false
 *           canExport: true
 *         joinedAt: "2023-06-20T10:00:00Z"
 *         lastActiveAt: "2023-06-20T11:30:00Z"
 *         isOnline: true
 *         user:
 *           id: "user789"
 *           email: "collaborator@example.com"
 *           displayName: "Jane Collaborator"
 *           avatar: "https://example.com/avatar.jpg"
 * 
 *     InviteCollaboratorRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the user to invite
 *         role:
 *           type: string
 *           enum: [VIEWER, CONTRIBUTOR, ADMIN]
 *           default: CONTRIBUTOR
 *           description: Role to assign to the collaborator
 *         permissions:
 *           type: object
 *           description: Custom permissions (optional, defaults based on role)
 *           properties:
 *             canEdit:
 *               type: boolean
 *             canAddStems:
 *               type: boolean
 *             canDeleteStems:
 *               type: boolean
 *             canInviteOthers:
 *               type: boolean
 *             canExport:
 *               type: boolean
 *       example:
 *         email: "collaborator@example.com"
 *         role: "CONTRIBUTOR"
 *         permissions:
 *           canEdit: true
 *           canAddStems: true
 * 
 *     UpdateCollaboratorRequest:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [VIEWER, CONTRIBUTOR, ADMIN]
 *           description: New role for the collaborator
 *         permissions:
 *           type: object
 *           description: Updated permissions
 *           properties:
 *             canEdit:
 *               type: boolean
 *             canAddStems:
 *               type: boolean
 *             canDeleteStems:
 *               type: boolean
 *             canInviteOthers:
 *               type: boolean
 *             canExport:
 *               type: boolean
 *       example:
 *         role: "ADMIN"
 *         permissions:
 *           canInviteOthers: true
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}/collaborators/invite:
 *   post:
 *     summary: Invite a user to collaborate on a project
 *     tags: [Collaboration]
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
 *             $ref: '#/components/schemas/InviteCollaboratorRequest'
 *     responses:
 *       201:
 *         description: Collaborator invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Collaborator'
 *                 message:
 *                   type: string
 *                   example: "Collaborator invitation sent successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: User is already a collaborator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/collaborators/invite', 
  authMiddleware() as RequestHandler,
  projectAccessMiddleware('write') as RequestHandler,
  collaborationController.inviteCollaborator as RequestHandler
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/collaborators:
 *   get:
 *     summary: Get all collaborators for a project
 *     tags: [Collaboration]
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
 *         description: Project collaborators retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Collaborator'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:projectId/collaborators', 
  authMiddleware() as RequestHandler,
  projectAccessMiddleware('read') as RequestHandler,
  collaborationController.getCollaborators as RequestHandler
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/collaborators/{userId}:
 *   put:
 *     summary: Update a collaborator's role and permissions
 *     tags: [Collaboration]
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of collaborator to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCollaboratorRequest'
 *     responses:
 *       200:
 *         description: Collaborator updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Collaborator'
 *                 message:
 *                   type: string
 *                   example: "Collaborator updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:projectId/collaborators/:userId', 
  authMiddleware() as RequestHandler,
  projectAccessMiddleware('admin') as RequestHandler,
  collaborationController.updateCollaborator as RequestHandler
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/collaborators/{userId}:
 *   delete:
 *     summary: Remove a collaborator from a project
 *     tags: [Collaboration]
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of collaborator to remove
 *     responses:
 *       200:
 *         description: Collaborator removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Collaborator removed successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:projectId/collaborators/:userId', 
  authMiddleware() as RequestHandler,
  projectAccessMiddleware('admin') as RequestHandler,
  collaborationController.removeCollaborator as RequestHandler
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/collaborators/{userId}/leave:
 *   post:
 *     summary: Leave a project as a collaborator
 *     tags: [Collaboration]
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
 *         description: Successfully left the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully left the project"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:projectId/collaborators/:userId/leave', 
  authMiddleware() as RequestHandler,
  projectAccessMiddleware('read') as RequestHandler,
  collaborationController.leaveProject as RequestHandler
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/collaborators/{userId}/permissions:
 *   get:
 *     summary: Get a collaborator's permissions for a project
 *     tags: [Collaboration]
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Collaborator permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [VIEWER, CONTRIBUTOR, ADMIN]
 *                     permissions:
 *                       type: object
 *                       properties:
 *                         canEdit:
 *                           type: boolean
 *                         canAddStems:
 *                           type: boolean
 *                         canDeleteStems:
 *                           type: boolean
 *                         canInviteOthers:
 *                           type: boolean
 *                         canExport:
 *                           type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:projectId/collaborators/:userId/permissions', 
  authMiddleware() as RequestHandler,
  projectAccessMiddleware('read') as RequestHandler,
  collaborationController.getCollaboratorPermissions as RequestHandler
);

  return router;
}
