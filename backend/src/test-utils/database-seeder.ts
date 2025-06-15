import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface TestUser {
  id: string;
  email: string;
  displayName?: string | null;
  avatar?: string | null;
  passwordHash: string;
  defaultTempo: number;
  collaborationNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestUserCredentials {
  email: string;
  displayName?: string;
  password: string;
  avatar?: string | null;
  defaultTempo?: number;
  collaborationNotifications?: boolean;
}

/**
 * Database seeder for integration tests
 * Provides utilities to create test data with proper relationships
 */
export class DatabaseSeeder {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create test users with hashed passwords
   */
  async createUsers(users: TestUserCredentials[]): Promise<TestUser[]> {
    const createdUsers: TestUser[] = [];

    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createData: any = {
        email: userData.email,
        passwordHash,
        displayName: userData.displayName,
        avatar: userData.avatar || null,
        defaultTempo: userData.defaultTempo || 120,
        collaborationNotifications: userData.collaborationNotifications ?? true,
      };
      
      const user = await this.prisma.user.create({
        data: createData,
      });

      createdUsers.push(user);
    }

    return createdUsers;
  }

  /**
   * Create a single test user
   */
  async createUser(userData: TestUserCredentials): Promise<TestUser> {
    const users = await this.createUsers([userData]);
    if (!users[0]) {
      throw new Error('Failed to create user');
    }
    return users[0];
  }

  /**
   * Create test projects with proper ownership
   */
  async createProjects(projects: Array<{
    name: string;
    description?: string;
    ownerId: string;
    tempo?: number;
    timeSignatureNumerator?: number;
    timeSignatureDenominator?: number;
  }>): Promise<Array<{
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt: Date;
    tempo: number;
    timeSignatureNumerator: number;
    timeSignatureDenominator: number;
  }>> {
    const createdProjects = [];

    for (const projectData of projects) {
      const project = await this.prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description || null,
          ownerId: projectData.ownerId,
          tempo: projectData.tempo || 120,
          timeSignatureNumerator: projectData.timeSignatureNumerator || 4,
          timeSignatureDenominator: projectData.timeSignatureDenominator || 4,
        },
      });

      createdProjects.push(project);
    }

    return createdProjects;
  }

  /**
   * Create test project collaborators
   */
  async createProjectCollaborators(collaborators: Array<{
    projectId: string;
    userId: string;
    role: Role;
  }>): Promise<Array<{
    id: string;
    projectId: string;
    userId: string;
    role: Role;
    joinedAt: Date;
  }>> {
    const createdCollaborators = [];

    for (const collaboratorData of collaborators) {
      const collaborator = await this.prisma.projectCollaborator.create({
        data: {
          projectId: collaboratorData.projectId,
          userId: collaboratorData.userId,
          role: collaboratorData.role,
        },
      });

      createdCollaborators.push(collaborator);
    }

    return createdCollaborators;
  }

  /**
   * Get default test users for common scenarios
   */
  static getDefaultTestUsers(): TestUserCredentials[] {
    return [
      {
        email: 'admin@musiccollab.test',
        displayName: 'Admin User',
        password: 'AdminPassword123!',
        defaultTempo: 120,
        collaborationNotifications: true,
      },
      {
        email: 'john@musiccollab.test',
        displayName: 'John Doe',
        password: 'JohnPassword123!',
        defaultTempo: 120,
        collaborationNotifications: true,
      },
      {
        email: 'jane@musiccollab.test',
        displayName: 'Jane Smith',
        password: 'JanePassword123!',
        defaultTempo: 140,
        collaborationNotifications: false,
      },
      {
        email: 'collaborator@musiccollab.test',
        displayName: 'Music Collaborator',
        password: 'CollabPassword123!',
        defaultTempo: 100,
        collaborationNotifications: true,
      },
    ];
  }

  /**
   * Seed database with default test data
   */
  async seedDefaultData(): Promise<{
    users: TestUser[];
  }> {
    const testUsers = DatabaseSeeder.getDefaultTestUsers();
    const users = await this.createUsers(testUsers);

    return {
      users,
    };
  }
}
