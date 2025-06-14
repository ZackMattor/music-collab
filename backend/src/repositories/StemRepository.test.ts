import { PrismaClient } from '@prisma/client';
import { StemRepository } from './StemRepository';
import { CreateStemData, UpdateStemData } from './interfaces';

// Mock Prisma Client
const mockPrisma = {
  stem: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

describe('StemRepository', () => {
  let stemRepository: StemRepository;

  beforeEach(() => {
    stemRepository = new StemRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find stem by id', async () => {
      const mockStem = {
        id: 'stem-1',
        projectId: 'project-1',
        name: 'Test Stem',
        color: '#3B82F6',
        volume: 1.0,
        pan: 0.0,
        isMuted: false,
        isSoloed: false,
        instrumentType: 'piano',
        midiChannel: 1,
        order: 0,
        version: 1,
        lastModifiedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.stem.findUnique as jest.Mock).mockResolvedValue(mockStem);

      const result = await stemRepository.findById('stem-1');

      expect(mockPrisma.stem.findUnique).toHaveBeenCalledWith({
        where: { id: 'stem-1' }
      });
      expect(result).toEqual(mockStem);
    });
  });

  describe('findMany', () => {
    it('should find stems with options', async () => {
      const options = {
        where: { projectId: 'project-1' },
        orderBy: { order: 'asc' as const }
      };

      (mockPrisma.stem.findMany as jest.Mock).mockResolvedValue([]);

      await stemRepository.findMany(options);

      expect(mockPrisma.stem.findMany).toHaveBeenCalledWith(options);
    });
  });

  describe('create', () => {
    it('should create a new stem', async () => {
      const createData: CreateStemData = {
        projectId: 'project-1',
        name: 'New Stem',
        color: '#FF0000',
        instrumentType: 'guitar',
        lastModifiedBy: 'user-1',
      };

      const mockCreatedStem = {
        id: 'stem-2',
        ...createData,
        volume: 1.0,
        pan: 0.0,
        isMuted: false,
        isSoloed: false,
        midiChannel: null,
        order: 0,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.stem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.stem.create as jest.Mock).mockResolvedValue(mockCreatedStem);

      const result = await stemRepository.create(createData);

      expect(mockPrisma.stem.create).toHaveBeenCalledWith({
        data: {
          projectId: createData.projectId,
          name: createData.name,
          color: createData.color,
          volume: 1.0,
          pan: 0.0,
          isMuted: false,
          isSoloed: false,
          instrumentType: createData.instrumentType || null,
          midiChannel: null,
          order: 0,
          lastModifiedBy: createData.lastModifiedBy,
        }
      });
      expect(result).toEqual(mockCreatedStem);
    });

    it('should create stem with custom audio properties', async () => {
      const createData: CreateStemData = {
        projectId: 'project-1',
        name: 'Custom Stem',
        volume: 0.8,
        pan: -0.5,
        order: 5,
        lastModifiedBy: 'user-1',
      };

      (mockPrisma.stem.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.stem.create as jest.Mock).mockResolvedValue({});

      await stemRepository.create(createData);

      expect(mockPrisma.stem.create).toHaveBeenCalledWith({
        data: {
          projectId: createData.projectId,
          name: createData.name,
          color: '#3B82F6',
          volume: createData.volume,
          pan: createData.pan,
          isMuted: false,
          isSoloed: false,
          instrumentType: null,
          midiChannel: null,
          order: createData.order,
          lastModifiedBy: createData.lastModifiedBy,
        }
      });
    });
  });

  describe('update', () => {
    it('should update stem', async () => {
      const updateData: UpdateStemData = {
        name: 'Updated Stem',
        volume: 0.9,
        isMuted: true,
        lastModifiedBy: 'user-2',
      };

      const mockUpdatedStem = {
        id: 'stem-1',
        name: 'Updated Stem',
        volume: 0.9,
        isMuted: true,
        lastModifiedBy: 'user-2',
        version: 2,
        updatedAt: new Date(),
      };

      (mockPrisma.stem.update as jest.Mock).mockResolvedValue(mockUpdatedStem);

      const result = await stemRepository.update('stem-1', updateData);

      expect(mockPrisma.stem.update).toHaveBeenCalledWith({
        where: { id: 'stem-1' },
        data: {
          name: updateData.name,
          volume: updateData.volume,
          isMuted: updateData.isMuted,
          lastModifiedBy: updateData.lastModifiedBy,
          version: { increment: 1 },
        }
      });
      expect(result).toEqual(mockUpdatedStem);
    });
  });

  describe('delete', () => {
    it('should delete stem', async () => {
      const mockDeletedStem = {
        id: 'stem-1',
        name: 'Deleted Stem',
      };

      (mockPrisma.stem.delete as jest.Mock).mockResolvedValue(mockDeletedStem);

      const result = await stemRepository.delete('stem-1');

      expect(mockPrisma.stem.delete).toHaveBeenCalledWith({
        where: { id: 'stem-1' }
      });
      expect(result).toEqual(mockDeletedStem);
    });
  });

  describe('findByProject', () => {
    it('should find stems by project id', async () => {
      const mockStems = [
        { id: 'stem-1', projectId: 'project-1', name: 'Stem 1', order: 0 },
        { id: 'stem-2', projectId: 'project-1', name: 'Stem 2', order: 1 }
      ];

      (mockPrisma.stem.findMany as jest.Mock).mockResolvedValue(mockStems);

      const result = await stemRepository.findByProject('project-1');

      expect(mockPrisma.stem.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
        orderBy: { order: 'asc' }
      });
      expect(result).toEqual(mockStems);
    });
  });

  describe('findWithSegments', () => {
    it('should find stem with its segments', async () => {
      const mockStemWithSegments = {
        id: 'stem-1',
        name: 'Test Stem',
        segments: [
          { id: 'segment-1', name: 'Segment 1', startTime: 0 },
          { id: 'segment-2', name: 'Segment 2', startTime: 1000 }
        ]
      };

      (mockPrisma.stem.findUnique as jest.Mock).mockResolvedValue(mockStemWithSegments);

      const result = await stemRepository.findWithSegments('stem-1');

      expect(mockPrisma.stem.findUnique).toHaveBeenCalledWith({
        where: { id: 'stem-1' },
        include: {
          segments: {
            orderBy: { startTime: 'asc' }
          }
        }
      });
      expect(result).toEqual(mockStemWithSegments);
    });
  });

  describe('reorderStems', () => {
    it('should reorder multiple stems', async () => {
      const stemOrders = [
        { id: 'stem-1', order: 2 },
        { id: 'stem-2', order: 1 }
      ];

      (mockPrisma.$transaction as jest.Mock).mockResolvedValue([]);

      await stemRepository.reorderStems('project-1', stemOrders);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.any(Array)
      );
    });
  });

  describe('findByInstrumentType', () => {
    it('should find stems by instrument type', async () => {
      const mockStems = [
        { id: 'stem-1', instrumentType: 'piano', order: 0 },
        { id: 'stem-2', instrumentType: 'piano', order: 1 }
      ];

      (mockPrisma.stem.findMany as jest.Mock).mockResolvedValue(mockStems);

      const result = await stemRepository.findByInstrumentType('project-1', 'piano');

      expect(mockPrisma.stem.findMany).toHaveBeenCalledWith({
        where: { 
          projectId: 'project-1',
          instrumentType: 'piano'
        },
        orderBy: { order: 'asc' }
      });
      expect(result).toEqual(mockStems);
    });
  });
});
