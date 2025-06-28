import { Response } from 'express';
import { SegmentService } from '../services/SegmentService';
import { StemSegmentRepository } from '../repositories/StemSegmentRepository';
import { StemRepository } from '../repositories/StemRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { PrismaClient } from '@prisma/client';
import { 
  CreateSegmentData, 
  UpdateSegmentData 
} from '../repositories/interfaces';
import { MidiNote } from '../types/midi';
import { createSuccessResponse, createErrorResponse, asyncHandler } from '../utils';
import { AuthenticatedRequest } from '../types/express';

export class SegmentController {
  private segmentService: SegmentService;

  constructor(private prisma: PrismaClient) {
    const segmentRepository = new StemSegmentRepository(prisma);
    const stemRepository = new StemRepository(prisma);
    const projectRepository = new ProjectRepository(prisma);
    const collaborationRepository = new CollaborationRepository(prisma);
    
    this.segmentService = new SegmentService(
      segmentRepository,
      stemRepository,
      projectRepository,
      collaborationRepository
    );
  }

  /**
   * GET /api/v1/projects/:projectId/stems/:stemId/segments
   * Get all segments for a stem
   */
  getSegments = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { stemId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }
    
    if (!stemId) {
      res.status(400).json(createErrorResponse('Stem ID is required'));
      return;
    }

    const segments = await this.segmentService.getStemSegments(stemId, req.user.id);
    
    res.status(200).json(createSuccessResponse({
      segments,
      count: segments.length
    }));
  });

  /**
   * GET /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId
   * Get a specific segment
   */
  getSegment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId) {
      res.status(400).json(createErrorResponse('Segment ID is required'));
      return;
    }

    const segment = await this.segmentService.getSegmentById(segmentId, req.user.id);
    
    if (!segment) {
      res.status(404).json(createErrorResponse('Segment not found'));
      return;
    }
    
    res.status(200).json(createSuccessResponse({ segment }));
  });

  /**
   * POST /api/v1/projects/:projectId/stems/:stemId/segments
   * Create a new segment
   */
  createSegment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { stemId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!stemId) {
      res.status(400).json(createErrorResponse('Stem ID is required'));
      return;
    }

    // Validate required fields
    const { type, name, startTime, endTime, content } = req.body;
    
    if (!type || !name || startTime === undefined || endTime === undefined) {
      res.status(400).json(createErrorResponse('Missing required fields: type, name, startTime, endTime'));
      return;
    }

    if (type !== 'MIDI' && type !== 'AUDIO') {
      res.status(400).json(createErrorResponse('Invalid segment type. Must be MIDI or AUDIO'));
      return;
    }

    const segmentData: CreateSegmentData = {
      stemId,
      type,
      name,
      startTime: Number(startTime),
      endTime: Number(endTime),
      content: content || (type === 'MIDI' ? { type: 'midi', notes: [] } : {}),
      lastModifiedBy: req.user.id,
      ...(req.body.volume !== undefined && { volume: Number(req.body.volume) }),
      ...(req.body.fadeIn !== undefined && { fadeIn: Number(req.body.fadeIn) }),
      ...(req.body.fadeOut !== undefined && { fadeOut: Number(req.body.fadeOut) }),
      ...(req.body.aiPrompt && { aiPrompt: req.body.aiPrompt }),
      ...(req.body.aiModel && { aiModel: req.body.aiModel }),
      ...(req.body.aiParameters && { aiParameters: req.body.aiParameters })
    };

    const segment = await this.segmentService.createSegment(segmentData, req.user.id);
    
    res.status(201).json(createSuccessResponse({ segment }));
  });

  /**
   * PUT /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId
   * Update a segment
   */
  updateSegment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId) {
      res.status(400).json(createErrorResponse('Segment ID is required'));
      return;
    }

    const updateData: UpdateSegmentData = {
      lastModifiedBy: req.user.id,
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.startTime !== undefined && { startTime: Number(req.body.startTime) }),
      ...(req.body.endTime !== undefined && { endTime: Number(req.body.endTime) }),
      ...(req.body.content && { content: req.body.content }),
      ...(req.body.volume !== undefined && { volume: Number(req.body.volume) }),
      ...(req.body.fadeIn !== undefined && { fadeIn: Number(req.body.fadeIn) }),
      ...(req.body.fadeOut !== undefined && { fadeOut: Number(req.body.fadeOut) })
    };

    const segment = await this.segmentService.updateSegment(segmentId, updateData, req.user.id);
    
    res.status(200).json(createSuccessResponse({ segment }));
  });

  /**
   * DELETE /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId
   * Delete a segment
   */
  deleteSegment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId) {
      res.status(400).json(createErrorResponse('Segment ID is required'));
      return;
    }

    const segment = await this.segmentService.deleteSegment(segmentId, req.user.id);
    
    res.status(200).json(createSuccessResponse({ 
      segment,
      message: 'Segment deleted successfully' 
    }));
  });

  /**
   * GET /api/v1/projects/:projectId/stems/:stemId/segments/time-range
   * Get segments by time range
   */
  getSegmentsByTimeRange = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { stemId } = req.params;
    const { startTime, endTime } = req.query;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!stemId) {
      res.status(400).json(createErrorResponse('Stem ID is required'));
      return;
    }

    if (!startTime || !endTime) {
      res.status(400).json(createErrorResponse('startTime and endTime query parameters are required'));
      return;
    }

    const segments = await this.segmentService.getSegmentsByTimeRange(
      stemId, 
      Number(startTime), 
      Number(endTime), 
      req.user.id
    );
    
    res.status(200).json(createSuccessResponse({
      segments,
      count: segments.length,
      timeRange: { startTime: Number(startTime), endTime: Number(endTime) }
    }));
  });

  /**
   * GET /api/v1/projects/:projectId/stems/:stemId/segments/type/:type
   * Get segments by type
   */
  getSegmentsByType = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { stemId, type } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!stemId) {
      res.status(400).json(createErrorResponse('Stem ID is required'));
      return;
    }

    if (type !== 'MIDI' && type !== 'AUDIO') {
      res.status(400).json(createErrorResponse('Invalid segment type. Must be MIDI or AUDIO'));
      return;
    }

    const segments = await this.segmentService.getSegmentsByType(stemId, type, req.user.id);
    
    res.status(200).json(createSuccessResponse({
      segments,
      count: segments.length,
      type
    }));
  });

  /**
   * POST /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId/duplicate
   * Duplicate a segment
   */
  duplicateSegment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId) {
      res.status(400).json(createErrorResponse('Segment ID is required'));
      return;
    }

    const segment = await this.segmentService.duplicateSegment(segmentId, req.user.id);
    
    res.status(201).json(createSuccessResponse({ 
      segment,
      message: 'Segment duplicated successfully' 
    }));
  });

  /**
   * POST /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId/notes
   * Add a MIDI note to a segment
   */
  addMidiNote = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId) {
      res.status(400).json(createErrorResponse('Segment ID is required'));
      return;
    }

    // Validate required fields
    const { start, duration, pitch, velocity } = req.body;
    
    if (start === undefined || duration === undefined || pitch === undefined || velocity === undefined) {
      res.status(400).json(createErrorResponse('Missing required fields: start, duration, pitch, velocity'));
      return;
    }

    const noteData: Omit<MidiNote, 'id'> = {
      start: Number(start),
      duration: Number(duration),
      pitch: Number(pitch),
      velocity: Number(velocity),
      ...(req.body.channel !== undefined && { channel: Number(req.body.channel) })
    };

    const segment = await this.segmentService.addMidiNote(segmentId, noteData, req.user.id);
    
    res.status(201).json(createSuccessResponse({ 
      segment,
      message: 'MIDI note added successfully' 
    }));
  });

  /**
   * PUT /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId/notes/:noteId
   * Update a MIDI note in a segment
   */
  updateMidiNote = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId, noteId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId || !noteId) {
      res.status(400).json(createErrorResponse('Segment ID and Note ID are required'));
      return;
    }

    const noteData: Partial<Omit<MidiNote, 'id'>> = {
      ...(req.body.start !== undefined && { start: Number(req.body.start) }),
      ...(req.body.duration !== undefined && { duration: Number(req.body.duration) }),
      ...(req.body.pitch !== undefined && { pitch: Number(req.body.pitch) }),
      ...(req.body.velocity !== undefined && { velocity: Number(req.body.velocity) }),
      ...(req.body.channel !== undefined && { channel: Number(req.body.channel) })
    };

    const segment = await this.segmentService.updateMidiNote(segmentId, noteId, noteData, req.user.id);
    
    res.status(200).json(createSuccessResponse({ 
      segment,
      message: 'MIDI note updated successfully' 
    }));
  });

  /**
   * DELETE /api/v1/projects/:projectId/stems/:stemId/segments/:segmentId/notes/:noteId
   * Delete a MIDI note from a segment
   */
  deleteMidiNote = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { segmentId, noteId } = req.params;

    if (!req.user?.id) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!segmentId || !noteId) {
      res.status(400).json(createErrorResponse('Segment ID and Note ID are required'));
      return;
    }

    const segment = await this.segmentService.deleteMidiNote(segmentId, noteId, req.user.id);
    
    res.status(200).json(createSuccessResponse({ 
      segment,
      message: 'MIDI note deleted successfully' 
    }));
  });
}
