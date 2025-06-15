import { PrismaClient } from '@prisma/client';
import { UserRepository } from './UserRepository';
import { CreateUserData, UpdateUserData } from './interfaces';

// Mock Prisma Client
const mockPrisma = {
  user: {
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

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        passwordHash: 'hashedpassword',
        avatar: null,
        defaultTempo: 120,
        collaborationNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.findById('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find users with default options', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'test1@example.com', username: 'user1' },
        { id: 'user-2', email: 'test2@example.com', username: 'user2' },
      ];

      (mockPrisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userRepository.findMany();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: undefined,
        where: undefined
      });
      expect(result).toEqual(mockUsers);
    });

    it('should find users with pagination options', async () => {
      const options = {
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'desc' as const },
        where: { email: { contains: 'test' } }
      };

      (mockPrisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await userRepository.findMany(options);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(options);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData: CreateUserData = {
        email: 'newuser@example.com',
        username: 'newuser',
        displayName: 'New User',
        passwordHash: 'hashedpassword',
      };

      const mockCreatedUser = {
        id: 'user-3',
        ...createData,
        avatar: null,
        defaultTempo: 120,
        collaborationNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await userRepository.create(createData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          username: createData.username,
          displayName: createData.displayName,
          passwordHash: createData.passwordHash,
          avatar: undefined,
          defaultTempo: 120,
          collaborationNotifications: true
        }
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should create user with custom preferences', async () => {
      const createData: CreateUserData = {
        email: 'newuser@example.com',
        username: 'newuser',
        displayName: 'New User',
        passwordHash: 'hashedpassword',
        avatar: 'avatar-url',
        defaultTempo: 140,
        collaborationNotifications: false,
      };

      (mockPrisma.user.create as jest.Mock).mockResolvedValue({});

      await userRepository.create(createData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          username: createData.username,
          displayName: createData.displayName,
          passwordHash: createData.passwordHash,
          avatar: createData.avatar,
          defaultTempo: createData.defaultTempo,
          collaborationNotifications: createData.collaborationNotifications
        }
      });
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateData: UpdateUserData = {
        displayName: 'Updated Name',
        defaultTempo: 130,
      };

      const mockUpdatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Updated Name',
        passwordHash: 'hashedpassword',
        avatar: null,
        defaultTempo: 130,
        collaborationNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await userRepository.update('user-1', updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const mockDeletedUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      };

      (mockPrisma.user.delete as jest.Mock).mockResolvedValue(mockDeletedUser);

      const result = await userRepository.delete('user-1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      });
      expect(result).toEqual(mockDeletedUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.findByUsername('testuser');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findWithProjects', () => {
    it('should find user with their projects', async () => {
      const mockUserWithProjects = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        ownedProjects: [
          { id: 'project-1', name: 'My Project', ownerId: 'user-1' }
        ],
        collaboratingProjects: [
          {
            id: 'collab-1',
            project: { id: 'project-2', name: 'Shared Project' }
          }
        ]
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithProjects);

      const result = await userRepository.findWithProjects('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          ownedProjects: {
            orderBy: { updatedAt: 'desc' }
          },
          collaboratingProjects: {
            include: {
              project: true
            },
            orderBy: { lastActiveAt: 'desc' }
          }
        }
      });
      expect(result).toEqual(mockUserWithProjects);
    });
  });

  describe('findCollaboratingUsers', () => {
    it('should find all users collaborating on a project', async () => {
      const mockCollaborators = [
        {
          id: 'collab-1',
          user: { id: 'user-1', email: 'user1@example.com', username: 'user1' }
        },
        {
          id: 'collab-2',
          user: { id: 'user-2', email: 'user2@example.com', username: 'user2' }
        }
      ];

      (mockPrisma.projectCollaborator.findMany as jest.Mock).mockResolvedValue(mockCollaborators);

      const result = await userRepository.findCollaboratingUsers('project-1');

      expect(mockPrisma.projectCollaborator.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
        include: { user: true }
      });
      expect(result).toEqual([
        mockCollaborators[0]?.user,
        mockCollaborators[1]?.user
      ]);
    });
  });
});
