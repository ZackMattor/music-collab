import { Stem, Role } from '@prisma/client';
import { StemService } from './StemService';
import { StemRepository } from '../repositories/StemRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { CreateStemData, UpdateStemData, StemWithSegments } from '../repositories/interfaces';

// Mock repositories
const mockStemRepository = {
  findById: jest.fn(),
  findByProject: jest.fn(),
  findWithSegments: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  reorderStems: jest.fn(),
  findByInstrumentType: jest.fn(),
} as unknown as StemRepository;

const mockProjectRepository = {
  findById: jest.fn(),
} as unknown as ProjectRepository;

const mockCollaborationRepository = {
  findByProjectAndUser: jest.fn(),
} as unknown as CollaborationRepository;

describe('StemService', () => {
  let stemService: StemService;
  let mockStem: Stem;
  let mockStemWithSegments: StemWithSegments;
  let mockProject: {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  let mockCollaborator: {
    id: string;
    projectId: string;
    userId: string;
    role: Role;
    canEdit: boolean;
    canAddStems: boolean;
    canDeleteStems: boolean;
    canInviteOthers: boolean;
    canExport: boolean;
    joinedAt: Date;
    lastActiveAt: Date;
    isOnline: boolean;
    currentActivity: null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    stemService = new StemService(
      mockStemRepository,
      mockProjectRepository,
      mockCollaborationRepository
    );

    mockStem = {
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

    mockStemWithSegments = {
      ...mockStem,
      segments: []
    };

    mockProject = {
      id: 'project-1',
      name: 'Test Project',
      ownerId: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCollaborator = {
      id: 'collab-1',
      projectId: 'project-1',
      userId: 'user-1',
      role: Role.CONTRIBUTOR,
      canEdit: true,
      canAddStems: true,
      canDeleteStems: false,
      canInviteOthers: false,
      canExport: true,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      isOnline: false,
      currentActivity: null,
    };
  });

  describe('getProjectStems', () => {
    it('should return stems for project owner', async () => {
      const stems = [mockStem];
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.findByProject as jest.Mock).mockResolvedValue(stems);

      const result = await stemService.getProjectStems('project-1', 'owner-1');

      expect(result).toEqual(stems);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project-1');
      expect(mockStemRepository.findByProject).toHaveBeenCalledWith('project-1');
    });

    it('should return stems for collaborator', async () => {
      const stems = [mockStem];
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(mockCollaborator);
      (mockStemRepository.findByProject as jest.Mock).mockResolvedValue(stems);

      const result = await stemService.getProjectStems('project-1', 'user-1');

      expect(result).toEqual(stems);
      expect(mockCollaborationRepository.findByProjectAndUser).toHaveBeenCalledWith('project-1', 'user-1');
      expect(mockStemRepository.findByProject).toHaveBeenCalledWith('project-1');
    });

    it('should throw error for non-existent project', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(stemService.getProjectStems('project-1', 'user-1'))
        .rejects.toThrow('Project not found');
    });

    it('should throw error for unauthorized user', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(null);

      await expect(stemService.getProjectStems('project-1', 'user-1'))
        .rejects.toThrow('Access denied: You do not have access to this project');
    });
  });

  describe('getStemById', () => {
    it('should return stem for authorized user', async () => {
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);

      const result = await stemService.getStemById('stem-1', 'owner-1');

      expect(result).toEqual(mockStem);
      expect(mockStemRepository.findById).toHaveBeenCalledWith('stem-1');
    });

    it('should return null for non-existent stem', async () => {
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await stemService.getStemById('stem-1', 'user-1');

      expect(result).toBeNull();
    });

    it('should throw error for unauthorized access', async () => {
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(null);

      await expect(stemService.getStemById('stem-1', 'user-1'))
        .rejects.toThrow('Access denied: You do not have access to this project');
    });
  });

  describe('getStemWithSegments', () => {
    it('should return stem with segments for authorized user', async () => {
      (mockStemRepository.findWithSegments as jest.Mock).mockResolvedValue(mockStemWithSegments);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);

      const result = await stemService.getStemWithSegments('stem-1', 'owner-1');

      expect(result).toEqual(mockStemWithSegments);
      expect(mockStemRepository.findWithSegments).toHaveBeenCalledWith('stem-1');
    });
  });

  describe('createStem', () => {
    const createData: CreateStemData = {
      projectId: 'project-1',
      name: 'New Stem',
      lastModifiedBy: 'user-1'
    };

    it('should create stem for project owner', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.create as jest.Mock).mockResolvedValue(mockStem);

      const result = await stemService.createStem(createData, 'owner-1');

      expect(result).toEqual(mockStem);
      expect(mockStemRepository.create).toHaveBeenCalledWith({
        ...createData,
        lastModifiedBy: 'owner-1'
      });
    });

    it('should create stem for collaborator with canAddStems permission', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(mockCollaborator);
      (mockStemRepository.create as jest.Mock).mockResolvedValue(mockStem);

      const result = await stemService.createStem(createData, 'user-1');

      expect(result).toEqual(mockStem);
      expect(mockStemRepository.create).toHaveBeenCalledWith({
        ...createData,
        lastModifiedBy: 'user-1'
      });
    });

    it('should throw error for collaborator without canAddStems permission', async () => {
      const restrictedCollaborator = { ...mockCollaborator, canAddStems: false };
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(restrictedCollaborator);

      await expect(stemService.createStem(createData, 'user-1'))
        .rejects.toThrow('Access denied: You do not have permission to addstems');
    });
  });

  describe('updateStem', () => {
    const updateData: UpdateStemData = {
      name: 'Updated Stem',
      volume: 0.8
    };

    it('should update stem for authorized user', async () => {
      const updatedStem = { ...mockStem, ...updateData };
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.update as jest.Mock).mockResolvedValue(updatedStem);

      const result = await stemService.updateStem('stem-1', updateData, 'owner-1');

      expect(result).toEqual(updatedStem);
      expect(mockStemRepository.update).toHaveBeenCalledWith('stem-1', {
        ...updateData,
        lastModifiedBy: 'owner-1'
      });
    });

    it('should throw error for non-existent stem', async () => {
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(stemService.updateStem('stem-1', updateData, 'user-1'))
        .rejects.toThrow('Stem not found');
    });

    it('should throw error for user without edit permission', async () => {
      const restrictedCollaborator = { ...mockCollaborator, canEdit: false };
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(restrictedCollaborator);

      await expect(stemService.updateStem('stem-1', updateData, 'user-1'))
        .rejects.toThrow('Access denied: You do not have permission to edit');
    });
  });

  describe('deleteStem', () => {
    it('should delete stem for user with canDeleteStems permission', async () => {
      const collaboratorWithDeletePermission = { ...mockCollaborator, canDeleteStems: true };
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(collaboratorWithDeletePermission);
      (mockStemRepository.delete as jest.Mock).mockResolvedValue(mockStem);

      const result = await stemService.deleteStem('stem-1', 'user-1');

      expect(result).toEqual(mockStem);
      expect(mockStemRepository.delete).toHaveBeenCalledWith('stem-1');
    });

    it('should delete stem for project owner', async () => {
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.delete as jest.Mock).mockResolvedValue(mockStem);

      const result = await stemService.deleteStem('stem-1', 'owner-1');

      expect(result).toEqual(mockStem);
      expect(mockStemRepository.delete).toHaveBeenCalledWith('stem-1');
    });

    it('should throw error for user without canDeleteStems permission', async () => {
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(mockStem);
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(mockCollaborator);

      await expect(stemService.deleteStem('stem-1', 'user-1'))
        .rejects.toThrow('Access denied: You do not have permission to deletestems');
    });
  });

  describe('reorderStems', () => {
    const stemOrders = [
      { id: 'stem-1', order: 1 },
      { id: 'stem-2', order: 0 }
    ];

    it('should reorder stems for authorized user', async () => {
      const stem2 = { ...mockStem, id: 'stem-2' };
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.findById as jest.Mock)
        .mockResolvedValueOnce(mockStem)
        .mockResolvedValueOnce(stem2);
      (mockStemRepository.reorderStems as jest.Mock).mockResolvedValue(undefined);

      await stemService.reorderStems('project-1', stemOrders, 'owner-1');

      expect(mockStemRepository.reorderStems).toHaveBeenCalledWith('project-1', stemOrders);
    });

    it('should throw error for stem not in project', async () => {
      const differentProjectStem = { ...mockStem, projectId: 'different-project' };
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.findById as jest.Mock).mockResolvedValue(differentProjectStem);

      await expect(stemService.reorderStems('project-1', stemOrders, 'owner-1'))
        .rejects.toThrow('Stem stem-1 does not belong to project project-1');
    });
  });

  describe('getStemsByInstrumentType', () => {
    it('should return stems by instrument type for authorized user', async () => {
      const pianoStems = [mockStem];
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockStemRepository.findByInstrumentType as jest.Mock).mockResolvedValue(pianoStems);

      const result = await stemService.getStemsByInstrumentType('project-1', 'piano', 'owner-1');

      expect(result).toEqual(pianoStems);
      expect(mockStemRepository.findByInstrumentType).toHaveBeenCalledWith('project-1', 'piano');
    });
  });

  describe('getStemPermissions', () => {
    it('should return full permissions for project owner', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);

      const result = await stemService.getStemPermissions('project-1', 'owner-1');

      expect(result).toEqual({
        canAddStems: true,
        canDeleteStems: true,
        canEdit: true
      });
    });

    it('should return collaborator permissions', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(mockCollaborator);

      const result = await stemService.getStemPermissions('project-1', 'user-1');

      expect(result).toEqual({
        canAddStems: mockCollaborator.canAddStems,
        canDeleteStems: mockCollaborator.canDeleteStems,
        canEdit: mockCollaborator.canEdit
      });
    });

    it('should throw error for non-collaborator', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(mockProject);
      (mockCollaborationRepository.findByProjectAndUser as jest.Mock).mockResolvedValue(null);

      await expect(stemService.getStemPermissions('project-1', 'user-1'))
        .rejects.toThrow('Access denied: You are not a collaborator on this project');
    });

    it('should throw error for non-existent project', async () => {
      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(stemService.getStemPermissions('project-1', 'user-1'))
        .rejects.toThrow('Project not found');
    });
  });
});
