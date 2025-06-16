import { Project } from '@prisma/client';
import { ProjectSer      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('project-2'); // Most recent first
      expect(result[1]?.id).toBe('project-1');e } from './ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CreateProjectData, UpdateProjectData } from '../repositories/interfaces';

// Mock ProjectRepository
const mockProjectRepository = {
  findByOwner: jest.fn(),
  findByCollaborator: jest.fn(),
  findPublicProjects: jest.fn(),
  findById: jest.fn(),
  updateLastAccessed: jest.fn(),
  findWithStems: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
} as unknown as ProjectRepository;

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService(mockProjectRepository);
    jest.clearAllMocks();
  });

  describe('getUserProjects', () => {
    it('should return combined and deduplicated user projects', async () => {
      const userId = 'user-1';
      const ownedProjects: Project[] = [
        {
          id: 'project-1',
          name: 'Owned Project',
          ownerId: userId,
          lastAccessedAt: new Date('2024-01-02'),
        } as Project,
      ];
      const collaboratedProjects: Project[] = [
        {
          id: 'project-2',
          name: 'Collaborated Project',
          ownerId: 'other-user',
          lastAccessedAt: new Date('2024-01-01'),
        } as Project,
        // Duplicate project (user owns and collaborates)
        {
          id: 'project-1',
          name: 'Owned Project',
          ownerId: userId,
          lastAccessedAt: new Date('2024-01-02'),
        } as Project,
      ];

      (mockProjectRepository.findByOwner as jest.Mock).mockResolvedValue(ownedProjects);
      (mockProjectRepository.findByCollaborator as jest.Mock).mockResolvedValue(collaboratedProjects);

      const result = await projectService.getUserProjects(userId);

      expect(mockProjectRepository.findByOwner).toHaveBeenCalledWith(userId);
      expect(mockProjectRepository.findByCollaborator).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('project-1'); // Most recent first
      expect(result[1]?.id).toBe('project-2');
    });

    it('should sort projects by last accessed date', async () => {
      const userId = 'user-1';
      const ownedProjects: Project[] = [
        {
          id: 'project-1',
          name: 'Old Project',
          lastAccessedAt: new Date('2024-01-01'),
        } as Project,
      ];
      const collaboratedProjects: Project[] = [
        {
          id: 'project-2',
          name: 'Recent Project',
          lastAccessedAt: new Date('2024-01-03'),
        } as Project,
      ];

      (mockProjectRepository.findByOwner as jest.Mock).mockResolvedValue(ownedProjects);
      (mockProjectRepository.findByCollaborator as jest.Mock).mockResolvedValue(collaboratedProjects);

      const result = await projectService.getUserProjects(userId);

      expect(result[0].id).toBe('project-2'); // Most recent first
      expect(result[1].id).toBe('project-1');
    });
  });

  describe('getOwnedProjects', () => {
    it('should return projects owned by user', async () => {
      const userId = 'user-1';
      const ownedProjects: Project[] = [
        { id: 'project-1', name: 'Project 1', ownerId: userId } as Project,
      ];

      (mockProjectRepository.findByOwner as jest.Mock).mockResolvedValue(ownedProjects);

      const result = await projectService.getOwnedProjects(userId);

      expect(mockProjectRepository.findByOwner).toHaveBeenCalledWith(userId);
      expect(result).toEqual(ownedProjects);
    });
  });

  describe('getPublicProjects', () => {
    it('should return public projects', async () => {
      const publicProjects: Project[] = [
        { id: 'project-1', name: 'Public Project', isPublic: true } as Project,
      ];

      (mockProjectRepository.findPublicProjects as jest.Mock).mockResolvedValue(publicProjects);

      const result = await projectService.getPublicProjects();

      expect(mockProjectRepository.findPublicProjects).toHaveBeenCalled();
      expect(result).toEqual(publicProjects);
    });
  });

  describe('getProjectById', () => {
    it('should return project and update last accessed', async () => {
      const projectId = 'project-1';
      const project: Project = {
        id: projectId,
        name: 'Test Project',
      } as Project;

      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(project);
      (mockProjectRepository.updateLastAccessed as jest.Mock).mockResolvedValue(project);

      const result = await projectService.getProjectById(projectId);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.updateLastAccessed).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(project);
    });

    it('should return null if project not found', async () => {
      const projectId = 'nonexistent';

      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await projectService.getProjectById(projectId);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.updateLastAccessed).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getProjectWithDetails', () => {
    it('should return project with stems and collaborators', async () => {
      const projectId = 'project-1';
      const projectWithDetails = {
        id: projectId,
        name: 'Test Project',
        stems: [],
        collaborators: [],
      };

      (mockProjectRepository.findWithStems as jest.Mock).mockResolvedValue(projectWithDetails);

      const result = await projectService.getProjectWithDetails(projectId);

      expect(mockProjectRepository.findWithStems).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(projectWithDetails);
    });
  });

  describe('createProject', () => {
    it('should create project with valid data', async () => {
      const projectData: CreateProjectData = {
        name: 'New Project',
        description: 'A test project',
        ownerId: 'user-1',
        tempo: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        isPublic: false,
      };

      const createdProject: Project = {
        id: 'project-1',
        ...projectData,
      } as Project;

      (mockProjectRepository.create as jest.Mock).mockResolvedValue(createdProject);

      const result = await projectService.createProject(projectData);

      expect(mockProjectRepository.create).toHaveBeenCalledWith(projectData);
      expect(result).toEqual(createdProject);
    });

    it('should throw error for empty project name', async () => {
      const projectData: CreateProjectData = {
        name: '',
        ownerId: 'user-1',
      };

      await expect(projectService.createProject(projectData)).rejects.toThrow(
        'Project name is required'
      );
    });

    it('should throw error for project name too long', async () => {
      const projectData: CreateProjectData = {
        name: 'A'.repeat(101),
        ownerId: 'user-1',
      };

      await expect(projectService.createProject(projectData)).rejects.toThrow(
        'Project name must be 100 characters or less'
      );
    });

    it('should throw error for description too long', async () => {
      const projectData: CreateProjectData = {
        name: 'Valid Project',
        description: 'A'.repeat(501),
        ownerId: 'user-1',
      };

      await expect(projectService.createProject(projectData)).rejects.toThrow(
        'Project description must be 500 characters or less'
      );
    });

    it('should throw error for invalid tempo', async () => {
      const projectData: CreateProjectData = {
        name: 'Valid Project',
        ownerId: 'user-1',
        tempo: 300, // Too high
      };

      await expect(projectService.createProject(projectData)).rejects.toThrow(
        'Tempo must be between 60 and 200 BPM'
      );
    });

    it('should throw error for invalid time signature', async () => {
      const projectData: CreateProjectData = {
        name: 'Valid Project',
        ownerId: 'user-1',
        timeSignatureNumerator: 50, // Too high
      };

      await expect(projectService.createProject(projectData)).rejects.toThrow(
        'Time signature numerator must be between 1 and 32'
      );
    });
  });

  describe('updateProject', () => {
    it('should update project with valid data', async () => {
      const projectId = 'project-1';
      const updateData: UpdateProjectData = {
        name: 'Updated Project',
        tempo: 140,
      };

      const updatedProject: Project = {
        id: projectId,
        name: 'Updated Project',
        tempo: 140,
      } as Project;

      (mockProjectRepository.update as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectService.updateProject(projectId, updateData);

      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, updateData);
      expect(result).toEqual(updatedProject);
    });

    it('should throw error for empty project name', async () => {
      const projectId = 'project-1';
      const updateData: UpdateProjectData = {
        name: '',
      };

      await expect(projectService.updateProject(projectId, updateData)).rejects.toThrow(
        'Project name cannot be empty'
      );
    });

    it('should throw error for invalid tempo in update', async () => {
      const projectId = 'project-1';
      const updateData: UpdateProjectData = {
        tempo: 50, // Too low
      };

      await expect(projectService.updateProject(projectId, updateData)).rejects.toThrow(
        'Tempo must be between 60 and 200 BPM'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      const projectId = 'project-1';
      const deletedProject: Project = {
        id: projectId,
        name: 'Deleted Project',
      } as Project;

      (mockProjectRepository.delete as jest.Mock).mockResolvedValue(deletedProject);

      const result = await projectService.deleteProject(projectId);

      expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(deletedProject);
    });
  });

  describe('hasProjectAccess', () => {
    it('should return true for project owner', async () => {
      const projectId = 'project-1';
      const userId = 'user-1';
      const project: Project = {
        id: projectId,
        ownerId: userId,
      } as Project;

      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(project);

      const result = await projectService.hasProjectAccess(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return true for collaborator', async () => {
      const projectId = 'project-1';
      const userId = 'user-2';
      const project: Project = {
        id: projectId,
        ownerId: 'user-1',
      } as Project;
      const collaboratedProjects: Project[] = [project];

      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(project);
      (mockProjectRepository.findByCollaborator as jest.Mock).mockResolvedValue(collaboratedProjects);

      const result = await projectService.hasProjectAccess(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return false for non-existent project', async () => {
      const projectId = 'nonexistent';
      const userId = 'user-1';

      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await projectService.hasProjectAccess(projectId, userId);

      expect(result).toBe(false);
    });

    it('should return false for user without access', async () => {
      const projectId = 'project-1';
      const userId = 'user-2';
      const project: Project = {
        id: projectId,
        ownerId: 'user-1',
      } as Project;
      const collaboratedProjects: Project[] = [];

      (mockProjectRepository.findById as jest.Mock).mockResolvedValue(project);
      (mockProjectRepository.findByCollaborator as jest.Mock).mockResolvedValue(collaboratedProjects);

      const result = await projectService.hasProjectAccess(projectId, userId);

      expect(result).toBe(false);
    });
  });
});
