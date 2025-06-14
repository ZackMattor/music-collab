import { PrismaClient, StemSegment, SegmentType } from '@prisma/client';
import { StemSegmentRepository } from './StemSegmentRepository';
import { CreateSegmentData, UpdateSegmentData } from './interfaces';

// Mock PrismaClient
const mockPrisma = {
  stemSegment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
} as unknown as PrismaClient;

describe('StemSegmentRepository', () => {
  let repository: StemSegmentRepository;
  let mockSegment: StemSegment;

  beforeEach(() => {
    repository = new StemSegmentRepository(mockPrisma);
    jest.clearAllMocks();

    mockSegment = {
      id: 'segment-1',
      stemId: 'stem-1',
      type: SegmentType.AUDIO,
      name: 'Test Segment',
      startTime: 0,
      endTime: 1000,
      content: { notes: [] },
      volume: 1.0,
      fadeIn: null,
      fadeOut: null,
      version: 1,
      lastModifiedBy: 'user-1',
      aiPrompt: null,
      aiModel: null,
      aiGeneratedAt: null,
      aiParameters: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('findById', () => {
    it('should find segment by id', async () => {
      (mockPrisma.stemSegment.findUnique as jest.Mock).mockResolvedValue(mockSegment);

      const result = await repository.findById('segment-1');

      expect(mockPrisma.stemSegment.findUnique).toHaveBeenCalledWith({
        where: { id: 'segment-1' }
      });
      expect(result).toEqual(mockSegment);
    });

    it('should return null if segment not found', async () => {
      (mockPrisma.stemSegment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find many segments with no options', async () => {
      const segments = [mockSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findMany();

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: undefined,
        where: undefined
      });
      expect(result).toEqual(segments);
    });

    it('should find many segments with pagination options', async () => {
      const segments = [mockSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findMany({
        skip: 10,
        take: 5,
        orderBy: { startTime: 'asc' },
        where: { stemId: 'stem-1' }
      });

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { startTime: 'asc' },
        where: { stemId: 'stem-1' }
      });
      expect(result).toEqual(segments);
    });
  });

  describe('create', () => {
    it('should create a new segment', async () => {
      const createData: CreateSegmentData = {
        stemId: 'stem-1',
        type: SegmentType.AUDIO,
        name: 'New Segment',
        startTime: 0,
        endTime: 2000,
        content: { waveform: 'data' },
        volume: 0.8,
        lastModifiedBy: 'user-1'
      };

      (mockPrisma.stemSegment.create as jest.Mock).mockResolvedValue(mockSegment);

      const result = await repository.create(createData);

      expect(mockPrisma.stemSegment.create).toHaveBeenCalledWith({
        data: {
          stemId: 'stem-1',
          type: SegmentType.AUDIO,
          name: 'New Segment',
          startTime: 0,
          endTime: 2000,
          content: { waveform: 'data' },
          volume: 0.8,
          lastModifiedBy: 'user-1'
        }
      });
      expect(result).toEqual(mockSegment);
    });

    it('should create AI-generated segment with timestamp', async () => {
      const createData: CreateSegmentData = {
        stemId: 'stem-1',
        type: SegmentType.MIDI,
        name: 'AI Generated Segment',
        startTime: 1000,
        endTime: 3000,
        content: { notes: [{ note: 'C4', start: 0, duration: 500 }] },
        lastModifiedBy: 'user-1',
        aiPrompt: 'Generate a piano melody',
        aiModel: 'music-ai-v1',
        aiParameters: { temperature: 0.8 }
      };

      const aiSegment = { ...mockSegment, aiPrompt: 'Generate a piano melody' };
      (mockPrisma.stemSegment.create as jest.Mock).mockResolvedValue(aiSegment);

      const result = await repository.create(createData);

      expect(mockPrisma.stemSegment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          aiPrompt: 'Generate a piano melody',
          aiModel: 'music-ai-v1',
          aiGeneratedAt: expect.any(Date),
          aiParameters: { temperature: 0.8 }
        })
      });
      expect(result).toEqual(aiSegment);
    });

    it('should use default volume of 1.0 when not provided', async () => {
      const createData: CreateSegmentData = {
        stemId: 'stem-1',
        type: SegmentType.AUDIO,
        name: 'Default Volume Segment',
        startTime: 0,
        endTime: 1000,
        content: {},
        lastModifiedBy: 'user-1'
      };

      (mockPrisma.stemSegment.create as jest.Mock).mockResolvedValue(mockSegment);

      await repository.create(createData);

      expect(mockPrisma.stemSegment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          volume: 1.0
        })
      });
    });
  });

  describe('update', () => {
    it('should update segment and increment version', async () => {
      const updateData: UpdateSegmentData = {
        name: 'Updated Segment',
        volume: 0.5,
        lastModifiedBy: 'user-2'
      };

      const updatedSegment = { ...mockSegment, ...updateData, version: 2 };
      (mockPrisma.stemSegment.update as jest.Mock).mockResolvedValue(updatedSegment);

      const result = await repository.update('segment-1', updateData);

      expect(mockPrisma.stemSegment.update).toHaveBeenCalledWith({
        where: { id: 'segment-1' },
        data: {
          name: 'Updated Segment',
          startTime: undefined,
          endTime: undefined,
          content: undefined,
          volume: 0.5,
          fadeIn: undefined,
          fadeOut: undefined,
          lastModifiedBy: 'user-2',
          version: { increment: 1 }
        }
      });
      expect(result).toEqual(updatedSegment);
    });
  });

  describe('delete', () => {
    it('should delete segment by id', async () => {
      (mockPrisma.stemSegment.delete as jest.Mock).mockResolvedValue(mockSegment);

      const result = await repository.delete('segment-1');

      expect(mockPrisma.stemSegment.delete).toHaveBeenCalledWith({
        where: { id: 'segment-1' }
      });
      expect(result).toEqual(mockSegment);
    });
  });

  describe('findByStem', () => {
    it('should find segments by stem id ordered by start time', async () => {
      const segments = [mockSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findByStem('stem-1');

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        where: { stemId: 'stem-1' },
        orderBy: { startTime: 'asc' }
      });
      expect(result).toEqual(segments);
    });
  });

  describe('findByTimeRange', () => {
    it('should find segments within time range', async () => {
      const segments = [mockSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findByTimeRange('stem-1', 500, 1500);

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        where: {
          stemId: 'stem-1',
          OR: [
            {
              startTime: {
                gte: 500,
                lte: 1500
              }
            },
            {
              endTime: {
                gte: 500,
                lte: 1500
              }
            },
            {
              AND: [
                { startTime: { lte: 500 } },
                { endTime: { gte: 1500 } }
              ]
            }
          ]
        },
        orderBy: { startTime: 'asc' }
      });
      expect(result).toEqual(segments);
    });
  });

  describe('findByType', () => {
    it('should find segments by type (AUDIO)', async () => {
      const segments = [mockSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findByType('stem-1', 'AUDIO');

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        where: { 
          stemId: 'stem-1',
          type: 'AUDIO'
        },
        orderBy: { startTime: 'asc' }
      });
      expect(result).toEqual(segments);
    });

    it('should find segments by type (MIDI)', async () => {
      const midiSegment = { ...mockSegment, type: SegmentType.MIDI };
      const segments = [midiSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findByType('stem-1', 'MIDI');

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        where: { 
          stemId: 'stem-1',
          type: 'MIDI'
        },
        orderBy: { startTime: 'asc' }
      });
      expect(result).toEqual(segments);
    });
  });

  describe('findAIGenerated', () => {
    it('should find AI-generated segments ordered by generation time', async () => {
      const aiSegment = { 
        ...mockSegment, 
        aiPrompt: 'Generate melody',
        aiGeneratedAt: new Date()
      };
      const segments = [aiSegment];
      (mockPrisma.stemSegment.findMany as jest.Mock).mockResolvedValue(segments);

      const result = await repository.findAIGenerated('stem-1');

      expect(mockPrisma.stemSegment.findMany).toHaveBeenCalledWith({
        where: { 
          stemId: 'stem-1',
          aiPrompt: { not: null }
        },
        orderBy: { aiGeneratedAt: 'desc' }
      });
      expect(result).toEqual(segments);
    });
  });
});
