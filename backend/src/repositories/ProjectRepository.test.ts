/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PrismaClient } from '@prisma/client';
import { ProjectRepository } from './ProjectRepository';
import { CreateProjectData, UpdateProjectData } from './interfaces';

// Mock Prisma Client
const mockPrisma = {
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  projectCollaborator: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ProjectRepository', () => {
  let projectRepository: ProjectRepository;

  beforeEach(() => {
    projectRepository = new ProjectRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find project by id', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        ownerId: 'user-1',
        tempo: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        length: 0,
        isActive: true,
        isPublic: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        lastSyncAt: new Date(),
      };

      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectRepository.findById('project-1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' }
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('findMany', () => {
    it('should find projects with pagination', async () => {
      const options = {
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' as const }
      };

      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);

      await projectRepository.findMany(options);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(options);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createData: CreateProjectData = {
        name: 'New Project',
        description: 'A new project',
        ownerId: 'user-1',
        tempo: 140,
        timeSignatureNumerator: 3,
        timeSignatureDenominator: 4,
      };

      const mockCreatedProject = {
        id: 'project-2',
        ...createData,
        length: 0,
        isActive: true,
        isPublic: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        lastSyncAt: new Date(),
      };

      (mockPrisma.project.create as jest.Mock).mockResolvedValue(mockCreatedProject);

      const result = await projectRepository.create(createData);

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: createData.description,
          ownerId: createData.ownerId,
          tempo: 140,
          timeSignatureNumerator: 3,
          timeSignatureDenominator: 4,
          isPublic: false
        }
      });
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const updateData: UpdateProjectData = {
        name: 'Updated Project',
        tempo: 130,
      };

      const mockUpdatedProject = {
        id: 'project-1',
        name: 'Updated Project',
        tempo: 130,
        lastSyncAt: new Date()
      };

      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject);

      const result = await projectRepository.update('project-1', updateData);

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          name: 'Updated Project',
          description: undefined,
          tempo: 130,
          timeSignatureNumerator: undefined,
          timeSignatureDenominator: undefined,
          length: undefined,
          isActive: undefined,
          isPublic: undefined,
          lastSyncAt: expect.any(Date)
        }
      });
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      const mockDeletedProject = {
        id: 'project-1',
        name: 'Deleted Project',
      };

      (mockPrisma.project.delete as jest.Mock).mockResolvedValue(mockDeletedProject);

      const result = await projectRepository.delete('project-1');

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' }
      });
      expect(result).toEqual(mockDeletedProject);
    });
  });

  describe('findByOwner', () => {
    it('should find projects by owner id', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', ownerId: 'user-1' },
        { id: 'project-2', name: 'Project 2', ownerId: 'user-1' }
      ];

      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await projectRepository.findByOwner('user-1');

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        orderBy: { lastAccessedAt: 'desc' }
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('findByCollaborator', () => {
    it('should find projects by collaborator id', async () => {
      const mockCollaborators = [
        { project: { id: 'project-1', name: 'Project 1' } },
        { project: { id: 'project-2', name: 'Project 2' } }
      ];

      (mockPrisma.projectCollaborator.findMany as jest.Mock).mockResolvedValue(mockCollaborators);

      const result = await projectRepository.findByCollaborator('user-1');

      expect(mockPrisma.projectCollaborator.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { project: true },
        orderBy: { lastActiveAt: 'desc' }
      });
      expect(result).toEqual([
        mockCollaborators[0]!.project,
        mockCollaborators[1]!.project
      ]);
    });
  });

  describe('findWithStems', () => {
    it('should find project with stems and collaborators', async () => {
      const mockProjectWithStems = {
        id: 'project-1',
        name: 'Test Project',
        stems: [
          { id: 'stem-1', name: 'Stem 1', segments: [] }
        ],
        collaborators: [
          { user: { id: 'user-1', username: 'collaborator' } }
        ]
      };

      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProjectWithStems);

      const result = await projectRepository.findWithStems('project-1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        include: {
          stems: {
            orderBy: { order: 'asc' },
            include: {
              segments: {
                orderBy: { startTime: 'asc' }
              }
            }
          },
          collaborators: {
            include: { user: true }
          }
        }
      });
      expect(result).toEqual(mockProjectWithStems);
    });
  });

  describe('findPublicProjects', () => {
    it('should find public and active projects', async () => {
      const mockPublicProjects = [
        { id: 'project-1', name: 'Public Project 1', isPublic: true, isActive: true },
        { id: 'project-2', name: 'Public Project 2', isPublic: true, isActive: true }
      ];

      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(mockPublicProjects);

      const result = await projectRepository.findPublicProjects();

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          isPublic: true,
          isActive: true 
        },
        orderBy: { updatedAt: 'desc' }
      });
      expect(result).toEqual(mockPublicProjects);
    });
  });

  describe('updateLastAccessed', () => {
    it('should update last accessed timestamp', async () => {
      const mockUpdatedProject = {
        id: 'project-1',
        name: 'Test Project',
        lastAccessedAt: new Date()
      };

      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject);

      const result = await projectRepository.updateLastAccessed('project-1');

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: { lastAccessedAt: expect.any(Date) }
      });
      expect(result).toEqual(mockUpdatedProject);
    });
  });
});

describe('ProjectRepository', () => {
  let projectRepository: ProjectRepository;

  beforeEach(() => {
    projectRepository = new ProjectRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find project by id', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        ownerId: 'user-1',
        tempo: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        length: 0,
        isActive: true,
        isPublic: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        lastSyncAt: new Date(),
      };

      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectRepository.findById('project-1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' }
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('findMany', () => {
    it('should find projects with pagination', async () => {
      const options = {
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' as const }
      };

      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);

      await projectRepository.findMany(options);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(options);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createData: CreateProjectData = {
        name: 'New Project',
        description: 'A new project',
        ownerId: 'user-1',
        tempo: 140,
        timeSignatureNumerator: 3,
        timeSignatureDenominator: 4,
      };

      const mockCreatedProject = {
        id: 'project-2',
        ...createData,
        length: 0,
        isActive: true,
        isPublic: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        lastSyncAt: new Date(),
      };

      (mockPrisma.project.create as jest.Mock).mockResolvedValue(mockCreatedProject);

      const result = await projectRepository.create(createData);

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: createData.description,
          ownerId: createData.ownerId,
          tempo: createData.tempo,
          timeSignatureNumerator: createData.timeSignatureNumerator,
          timeSignatureDenominator: createData.timeSignatureDenominator,
          isPublic: false,
        }
      });
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const updateData: UpdateProjectData = {
        name: 'Updated Project',
        tempo: 130,
      };

      (mockPrisma.project.update as jest.Mock).mockResolvedValue({});

      await projectRepository.update('project-1', updateData);

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          name: 'Updated Project',
          tempo: 130,
          lastSyncAt: expect.any(Date)
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      const mockDeletedProject = {
        id: 'project-1',
        name: 'Deleted Project',
      };

      (mockPrisma.project.delete as jest.Mock).mockResolvedValue(mockDeletedProject);

      const result = await projectRepository.delete('project-1');

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' }
      });
      expect(result).toEqual(mockDeletedProject);
    });
  });

  describe('findByOwner', () => {
    it('should find projects by owner id', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', ownerId: 'user-1' },
        { id: 'project-2', name: 'Project 2', ownerId: 'user-1' }
      ];

      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await projectRepository.findByOwner('user-1');

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        orderBy: { lastAccessedAt: 'desc' }
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('findByCollaborator', () => {
    it('should find projects by collaborator id', async () => {
      const mockCollaborators = [
        { project: { id: 'project-1', name: 'Project 1' } },
        { project: { id: 'project-2', name: 'Project 2' } }
      ];

      (mockPrisma.projectCollaborator.findMany as jest.Mock).mockResolvedValue(mockCollaborators);

      const result = await projectRepository.findByCollaborator('user-1');

      expect(mockPrisma.projectCollaborator.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { project: true },
        orderBy: { lastActiveAt: 'desc' }
      });
      expect(result).toEqual([
        mockCollaborators[0]!.project,
        mockCollaborators[1]!.project
      ]);
    });
  });

  describe('findWithStems', () => {
    it('should find project with stems and collaborators', async () => {
      const mockProjectWithStems = {
        id: 'project-1',
        name: 'Test Project',
        stems: [
          { id: 'stem-1', name: 'Stem 1', segments: [] }
        ],
        collaborators: [
          { user: { id: 'user-1', username: 'collaborator' } }
        ]
      };

      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProjectWithStems);

      const result = await projectRepository.findWithStems('project-1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        include: {
          stems: {
            orderBy: { order: 'asc' },
            include: {
              segments: {
                orderBy: { startTime: 'asc' }
              }
            }
          },
          collaborators: {
            include: { user: true }
          }
        }
      });
      expect(result).toEqual(mockProjectWithStems);
    });
  });

  describe('findPublicProjects', () => {
    it('should find public and active projects', async () => {
      const mockPublicProjects = [
        { id: 'project-1', name: 'Public Project 1', isPublic: true, isActive: true },
        { id: 'project-2', name: 'Public Project 2', isPublic: true, isActive: true }
      ];

      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(mockPublicProjects);

      const result = await projectRepository.findPublicProjects();

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          isPublic: true,
          isActive: true 
        },
        orderBy: { updatedAt: 'desc' }
      });
      expect(result).toEqual(mockPublicProjects);
    });
  });

  describe('updateLastAccessed', () => {
    it('should update last accessed timestamp', async () => {
      const mockUpdatedProject = {
        id: 'project-1',
        name: 'Test Project',
        lastAccessedAt: new Date()
      };

      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject);

      const result = await projectRepository.updateLastAccessed('project-1');

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: { lastAccessedAt: expect.any(Date) }
      });
      expect(result).toEqual(mockUpdatedProject);
    });
  });
});
