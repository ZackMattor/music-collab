import { Project } from '@prisma/client';
import { ProjectService } from './ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CreateProjectData, UpdateProjectData } from '../repositories/interfaces';

// Create typed mock functions
const mockFindByOwner = jest.fn();
const mockFindByCollaborator = jest.fn();
const mockFindPublicProjects = jest.fn();
const mockFindById = jest.fn();
const mockUpdateLastAccessed = jest.fn();
const mockFindWithStems = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindMany = jest.fn();

// Mock ProjectRepository
const mockProjectRepository = {
  findByOwner: mockFindByOwner,
  findByCollaborator: mockFindByCollaborator,
  findPublicProjects: mockFindPublicProjects,
  findById: mockFindById,
  updateLastAccessed: mockUpdateLastAccessed,
  findWithStems: mockFindWithStems,
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
  findMany: mockFindMany,
} as unknown as ProjectRepository;

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    // Clear all mock functions
    mockFindByOwner.mockClear();
    mockFindByCollaborator.mockClear();
    mockFindPublicProjects.mockClear();
    mockFindById.mockClear();
    mockUpdateLastAccessed.mockClear();
    mockFindWithStems.mockClear();
    mockCreate.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
    mockFindMany.mockClear();
    
    projectService = new ProjectService(mockProjectRepository);
  });

  describe('getUserProjects', () => {
    it('should return combined and deduplicated user projects', async () => {
      const userId = 'user-1';
      const ownedProjects: Project[] = [
        {
          id: 'project-1',
          name: 'Owned Project',
          description: null,
          ownerId: userId,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastAccessedAt: new Date('2024-01-02'),
          tempo: 120,
          timeSignatureNumerator: 4,
          timeSignatureDenominator: 4,
          length: 0,
          isActive: true,
          isPublic: false,
          version: 1,
          lastSyncAt: new Date('2024-01-01'),
        },
      ];
      const collaboratedProjects: Project[] = [
        {
          id: 'project-2',
          name: 'Collaborated Project',
          description: null,
          ownerId: 'other-user',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastAccessedAt: new Date('2024-01-01'),
          tempo: 120,
          timeSignatureNumerator: 4,
          timeSignatureDenominator: 4,
          length: 0,
          isActive: true,
          isPublic: false,
          version: 1,
          lastSyncAt: new Date('2024-01-01'),
        },
      ];

      mockFindByOwner.mockResolvedValue(ownedProjects);
      mockFindByCollaborator.mockResolvedValue(collaboratedProjects);

      const result = await projectService.getUserProjects(userId);

      expect(mockFindByOwner).toHaveBeenCalledWith(userId);
      expect(mockFindByCollaborator).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('project-1'); // Most recent first
      expect(result[1]?.id).toBe('project-2');
    });
  });

  describe('getOwnedProjects', () => {
    it('should return projects owned by user', async () => {
      const userId = 'user-1';
      const ownedProjects: Project[] = [
        {
          id: 'project-1',
          name: 'Project 1',
          description: null,
          ownerId: userId,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastAccessedAt: new Date('2024-01-01'),
          tempo: 120,
          timeSignatureNumerator: 4,
          timeSignatureDenominator: 4,
          length: 0,
          isActive: true,
          isPublic: false,
          version: 1,
          lastSyncAt: new Date('2024-01-01'),
        },
      ];

      mockFindByOwner.mockResolvedValue(ownedProjects);

      const result = await projectService.getOwnedProjects(userId);

      expect(mockFindByOwner).toHaveBeenCalledWith(userId);
      expect(result).toEqual(ownedProjects);
    });
  });

  describe('getPublicProjects', () => {
    it('should return public projects', async () => {
      const publicProjects: Project[] = [
        {
          id: 'project-1',
          name: 'Public Project',
          description: null,
          ownerId: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastAccessedAt: new Date('2024-01-01'),
          tempo: 120,
          timeSignatureNumerator: 4,
          timeSignatureDenominator: 4,
          length: 0,
          isActive: true,
          isPublic: true,
          version: 1,
          lastSyncAt: new Date('2024-01-01'),
        },
      ];

      mockFindPublicProjects.mockResolvedValue(publicProjects);

      const result = await projectService.getPublicProjects();

      expect(mockFindPublicProjects).toHaveBeenCalled();
      expect(result).toEqual(publicProjects);
    });
  });

  describe('getProjectById', () => {
    it('should return project and update last accessed', async () => {
      const projectId = 'project-1';
      const project: Project = {
        id: projectId,
        name: 'Test Project',
        description: null,
        ownerId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastAccessedAt: new Date('2024-01-01'),
        tempo: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        length: 0,
        isActive: true,
        isPublic: false,
        version: 1,
        lastSyncAt: new Date('2024-01-01'),
      };

      mockFindById.mockResolvedValue(project);
      mockUpdateLastAccessed.mockResolvedValue(project);

      const result = await projectService.getProjectById(projectId);

      expect(mockFindById).toHaveBeenCalledWith(projectId);
      expect(mockUpdateLastAccessed).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(project);
    });

    it('should return null if project not found', async () => {
      const projectId = 'nonexistent';

      mockFindById.mockResolvedValue(null);

      const result = await projectService.getProjectById(projectId);

      expect(mockFindById).toHaveBeenCalledWith(projectId);
      expect(mockUpdateLastAccessed).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create and return new project', async () => {
      const createData: CreateProjectData = {
        name: 'New Project',
        description: 'Test description',
        ownerId: 'user-1',
        tempo: 120,
        isPublic: false,
      };

      const mockCreatedProject: Project = {
        id: 'new-project-id',
        name: createData.name,
        description: createData.description ?? null,
        ownerId: createData.ownerId,
        tempo: createData.tempo ?? 120,
        timeSignatureNumerator: createData.timeSignatureNumerator ?? 4,
        timeSignatureDenominator: createData.timeSignatureDenominator ?? 4,
        isPublic: createData.isPublic ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        length: 0,
        isActive: true,
        version: 1,
        lastSyncAt: new Date(),
      };

      mockCreate.mockResolvedValue(mockCreatedProject);

      const result = await projectService.createProject(createData);

      expect(mockCreate).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('updateProject', () => {
    it('should update and return project when found', async () => {
      const updateData: UpdateProjectData = {
        name: 'Updated Project Name',
        description: 'Updated description',
        tempo: 140,
      };

      const mockUpdatedProject: Project = {
        id: 'project-1',
        name: updateData.name ?? 'Project Name',
        description: updateData.description ?? null,
        ownerId: 'user-1',
        tempo: updateData.tempo ?? 120,
        timeSignatureNumerator: updateData.timeSignatureNumerator ?? 4,
        timeSignatureDenominator: updateData.timeSignatureDenominator ?? 4,
        isPublic: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        length: 0,
        isActive: true,
        version: 1,
        lastSyncAt: new Date(),
      };

      mockUpdate.mockResolvedValue(mockUpdatedProject);

      const result = await projectService.updateProject('project-1', updateData);

      expect(mockUpdate).toHaveBeenCalledWith('project-1', updateData);
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      const projectId = 'project-1';
      const deletedProject: Project = {
        id: projectId,
        name: 'Deleted Project',
        description: null,
        ownerId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastAccessedAt: new Date('2024-01-01'),
        tempo: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        length: 0,
        isActive: true,
        isPublic: false,
        version: 1,
        lastSyncAt: new Date('2024-01-01'),
      };

      mockDelete.mockResolvedValue(deletedProject);

      const result = await projectService.deleteProject(projectId);

      expect(mockDelete).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(deletedProject);
    });
  });
});
