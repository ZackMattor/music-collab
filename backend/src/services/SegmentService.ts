import { StemSegment } from '@prisma/client';
import { StemSegmentRepository } from '../repositories/StemSegmentRepository';
import { StemRepository } from '../repositories/StemRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { 
  CreateSegmentData, 
  UpdateSegmentData
} from '../repositories/interfaces';
import { 
  MidiSegmentContent, 
  MidiNote, 
  MidiValidator 
} from '../types/midi';
import { AppError } from '../utils/errors';

export interface SegmentPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export class SegmentService {
  constructor(
    private segmentRepository: StemSegmentRepository,
    private stemRepository: StemRepository,
    private projectRepository: ProjectRepository,
    private collaborationRepository: CollaborationRepository
  ) {}

  /**
   * Get all segments for a stem
   */
  async getStemSegments(stemId: string, userId: string): Promise<StemSegment[]> {
    // Verify user has access to the stem
    const stem = await this.stemRepository.findById(stemId);
    if (!stem) {
      throw new AppError('Stem not found', 404);
    }

    await this.verifyProjectAccess(stem.projectId, userId);
    
    return this.segmentRepository.findByStem(stemId);
  }

  /**
   * Get a specific segment by ID
   */
  async getSegmentById(segmentId: string, userId: string): Promise<StemSegment | null> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      return null;
    }

    // Verify user has access to the stem/project
    const stem = await this.stemRepository.findById(segment.stemId);
    if (!stem) {
      throw new AppError('Stem not found', 404);
    }

    await this.verifyProjectAccess(stem.projectId, userId);
    
    return segment;
  }

  /**
   * Create a new segment
   */
  async createSegment(data: CreateSegmentData, userId: string): Promise<StemSegment> {
    // Verify user has permission to edit the stem
    await this.verifySegmentPermission(data.stemId, userId, 'canEdit');

    // Validate timing
    this.validateSegmentTiming(data.startTime, data.endTime);

    // Validate MIDI content if it's a MIDI segment
    if (data.type === 'MIDI' && data.content) {
      const validation = MidiValidator.validateSegmentContent(data.content as MidiSegmentContent);
      if (!validation.valid) {
        throw new AppError(`Invalid MIDI content: ${validation.errors.join(', ')}`, 400);
      }
    }

    // Check for overlapping segments (optional validation)
    await this.checkSegmentOverlap(data.stemId, data.startTime, data.endTime);

    // Set the user as the last modifier
    const segmentData = {
      ...data,
      lastModifiedBy: userId
    };

    return this.segmentRepository.create(segmentData);
  }

  /**
   * Update an existing segment
   */
  async updateSegment(segmentId: string, data: UpdateSegmentData, userId: string): Promise<StemSegment> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    // Verify user has permission to edit
    await this.verifySegmentPermission(segment.stemId, userId, 'canEdit');

    // Validate timing if being updated
    if (data.startTime !== undefined || data.endTime !== undefined) {
      const startTime = data.startTime ?? segment.startTime;
      const endTime = data.endTime ?? segment.endTime;
      this.validateSegmentTiming(startTime, endTime);
      
      // Check for overlapping segments (excluding current segment)
      await this.checkSegmentOverlap(segment.stemId, startTime, endTime, segmentId);
    }

    // Validate MIDI content if being updated
    if (data.content && segment.type === 'MIDI') {
      const validation = MidiValidator.validateSegmentContent(data.content as MidiSegmentContent);
      if (!validation.valid) {
        throw new AppError(`Invalid MIDI content: ${validation.errors.join(', ')}`, 400);
      }
    }

    // Set the user as the last modifier
    const updateData = {
      ...data,
      lastModifiedBy: userId
    };

    return this.segmentRepository.update(segmentId, updateData);
  }

  /**
   * Delete a segment
   */
  async deleteSegment(segmentId: string, userId: string): Promise<StemSegment> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    // Verify user has permission to delete
    await this.verifySegmentPermission(segment.stemId, userId, 'canEdit');

    return this.segmentRepository.delete(segmentId);
  }

  /**
   * Get segments by time range
   */
  async getSegmentsByTimeRange(
    stemId: string, 
    startTime: number, 
    endTime: number, 
    userId: string
  ): Promise<StemSegment[]> {
    // Verify user has access to the stem
    const stem = await this.stemRepository.findById(stemId);
    if (!stem) {
      throw new AppError('Stem not found', 404);
    }

    await this.verifyProjectAccess(stem.projectId, userId);
    
    return this.segmentRepository.findByTimeRange(stemId, startTime, endTime);
  }

  /**
   * Get segments by type (MIDI or AUDIO)
   */
  async getSegmentsByType(
    stemId: string, 
    type: 'MIDI' | 'AUDIO', 
    userId: string
  ): Promise<StemSegment[]> {
    // Verify user has access to the stem
    const stem = await this.stemRepository.findById(stemId);
    if (!stem) {
      throw new AppError('Stem not found', 404);
    }

    await this.verifyProjectAccess(stem.projectId, userId);
    
    return this.segmentRepository.findByType(stemId, type);
  }

  /**
   * Add a MIDI note to a segment
   */
  async addMidiNote(segmentId: string, note: Omit<MidiNote, 'id'>, userId: string): Promise<StemSegment> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    if (segment.type !== 'MIDI') {
      throw new AppError('Cannot add MIDI note to non-MIDI segment', 400);
    }

    // Verify user has permission to edit
    await this.verifySegmentPermission(segment.stemId, userId, 'canEdit');

    // Create note with ID
    const newNote: MidiNote = {
      ...note,
      id: MidiValidator.generateNoteId()
    };

    // Validate the note
    const validation = MidiValidator.validateNote(newNote);
    if (!validation.valid) {
      throw new AppError(`Invalid MIDI note: ${validation.errors.join(', ')}`, 400);
    }

    // Get current content
    const currentContent = segment.content as unknown as MidiSegmentContent;
    const updatedContent: MidiSegmentContent = {
      ...currentContent,
      notes: [...currentContent.notes, newNote]
    };

    // Validate the updated content
    const contentValidation = MidiValidator.validateSegmentContent(updatedContent);
    if (!contentValidation.valid) {
      throw new AppError(`Invalid MIDI content: ${contentValidation.errors.join(', ')}`, 400);
    }

    return this.segmentRepository.update(segmentId, {
      content: updatedContent,
      lastModifiedBy: userId
    });
  }

  /**
   * Update a MIDI note in a segment
   */
  async updateMidiNote(
    segmentId: string, 
    noteId: string, 
    noteData: Partial<Omit<MidiNote, 'id'>>, 
    userId: string
  ): Promise<StemSegment> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    if (segment.type !== 'MIDI') {
      throw new AppError('Cannot update MIDI note in non-MIDI segment', 400);
    }

    // Verify user has permission to edit
    await this.verifySegmentPermission(segment.stemId, userId, 'canEdit');

    // Get current content
    const currentContent = segment.content as unknown as MidiSegmentContent;
    const noteIndex = currentContent.notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      throw new AppError('MIDI note not found', 404);
    }

    // Update the note
    const existingNote = currentContent.notes[noteIndex];
    if (!existingNote) {
      throw new AppError('MIDI note not found', 404);
    }
    
    const updatedNote: MidiNote = {
      id: noteId,
      start: noteData.start ?? existingNote.start,
      duration: noteData.duration ?? existingNote.duration,
      pitch: noteData.pitch ?? existingNote.pitch,
      velocity: noteData.velocity ?? existingNote.velocity,
      ...(noteData.channel !== undefined || existingNote.channel !== undefined 
        ? { channel: noteData.channel ?? existingNote.channel } 
        : {})
    };

    // Validate the updated note
    const validation = MidiValidator.validateNote(updatedNote);
    if (!validation.valid) {
      throw new AppError(`Invalid MIDI note: ${validation.errors.join(', ')}`, 400);
    }

    // Update the content
    const updatedNotes = [...currentContent.notes];
    updatedNotes[noteIndex] = updatedNote;
    
    const updatedContent: MidiSegmentContent = {
      ...currentContent,
      notes: updatedNotes
    };

    return this.segmentRepository.update(segmentId, {
      content: updatedContent,
      lastModifiedBy: userId
    });
  }

  /**
   * Delete a MIDI note from a segment
   */
  async deleteMidiNote(segmentId: string, noteId: string, userId: string): Promise<StemSegment> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    if (segment.type !== 'MIDI') {
      throw new AppError('Cannot delete MIDI note from non-MIDI segment', 400);
    }

    // Verify user has permission to edit
    await this.verifySegmentPermission(segment.stemId, userId, 'canEdit');

    // Get current content
    const currentContent = segment.content as unknown as MidiSegmentContent;
    const noteIndex = currentContent.notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      throw new AppError('MIDI note not found', 404);
    }

    // Remove the note
    const updatedNotes = currentContent.notes.filter(note => note.id !== noteId);
    
    const updatedContent: MidiSegmentContent = {
      ...currentContent,
      notes: updatedNotes
    };

    return this.segmentRepository.update(segmentId, {
      content: updatedContent,
      lastModifiedBy: userId
    });
  }

  /**
   * Duplicate a segment
   */
  async duplicateSegment(segmentId: string, userId: string): Promise<StemSegment> {
    const segment = await this.segmentRepository.findById(segmentId);
    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    // Verify user has permission to edit
    await this.verifySegmentPermission(segment.stemId, userId, 'canEdit');

    // Create new segment data
    const newSegmentData: CreateSegmentData = {
      stemId: segment.stemId,
      type: segment.type,
      name: `${segment.name} (Copy)`,
      startTime: segment.endTime, // Place after original segment
      endTime: segment.endTime + (segment.endTime - segment.startTime), // Same duration
      content: segment.content,
      volume: segment.volume,
      lastModifiedBy: userId,
      ...(segment.fadeIn && { fadeIn: segment.fadeIn }),
      ...(segment.fadeOut && { fadeOut: segment.fadeOut })
    };

    return this.segmentRepository.create(newSegmentData);
  }

  /**
   * Verify user has access to a project
   */
  private async verifyProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is owner
    if (project.ownerId === userId) {
      return;
    }

    // Check if user is a collaborator
    const collaboration = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    if (!collaboration) {
      throw new AppError('Access denied', 403);
    }
  }

  /**
   * Verify user has specific permission for segment operations
   */
  private async verifySegmentPermission(
    stemId: string, 
    userId: string, 
    permission: keyof SegmentPermissions
  ): Promise<void> {
    const stem = await this.stemRepository.findById(stemId);
    if (!stem) {
      throw new AppError('Stem not found', 404);
    }

    const project = await this.projectRepository.findById(stem.projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is owner (has all permissions)
    if (project.ownerId === userId) {
      return;
    }

    // Check collaborator permissions
    const collaboration = await this.collaborationRepository.findByProjectAndUser(stem.projectId, userId);
    if (!collaboration) {
      throw new AppError('Access denied', 403);
    }

    // Check specific permissions
    if (permission === 'canEdit' && !collaboration.canEdit) {
      throw new AppError('Edit permission denied', 403);
    }
  }

  /**
   * Validate segment timing
   */
  private validateSegmentTiming(startTime: number, endTime: number): void {
    if (startTime < 0) {
      throw new AppError('Start time cannot be negative', 400);
    }
    
    if (endTime <= startTime) {
      throw new AppError('End time must be after start time', 400);
    }
    
    if (endTime - startTime > 600000) { // 10 minutes max
      throw new AppError('Segment duration cannot exceed 10 minutes', 400);
    }
  }

  /**
   * Check for overlapping segments (optional validation)
   */
  private async checkSegmentOverlap(
    stemId: string, 
    startTime: number, 
    endTime: number, 
    excludeSegmentId?: string
  ): Promise<void> {
    const overlappingSegments = await this.segmentRepository.findByTimeRange(stemId, startTime, endTime);
    
    const conflicts = overlappingSegments.filter(segment => 
      segment.id !== excludeSegmentId &&
      !(segment.endTime <= startTime || segment.startTime >= endTime)
    );
    
    if (conflicts.length > 0) {
      // For now, just log the warning - overlapping segments might be desired
      console.warn(`Segment overlap detected on stem ${stemId}:`, conflicts.map(s => s.id));
    }
  }
}
