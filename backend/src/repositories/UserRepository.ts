import { PrismaClient, User } from '@prisma/client';
import { 
  IUserRepository, 
  CreateUserData, 
  UpdateUserData, 
  UserWithProjects,
  FindManyOptions 
} from './interfaces';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<User[]> {
    const findOptions: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma query options
    
    if (options.skip !== undefined) findOptions.skip = options.skip;
    if (options.take !== undefined) findOptions.take = options.take;
    if (options.orderBy !== undefined) findOptions.orderBy = options.orderBy;
    if (options.where !== undefined) findOptions.where = options.where;
    
    return this.prisma.user.findMany(findOptions);
  }

  async create(data: CreateUserData): Promise<User> {
    const createData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma create options
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      defaultTempo: data.defaultTempo ?? 120,
      collaborationNotifications: data.collaborationNotifications ?? true
    };

    if (data.avatar !== undefined) createData.avatar = data.avatar;

    return this.prisma.user.create({ data: createData });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma update options

    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.defaultTempo !== undefined) updateData.defaultTempo = data.defaultTempo;
    if (data.collaborationNotifications !== undefined) updateData.collaborationNotifications = data.collaborationNotifications;

    return this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  async findWithProjects(id: string): Promise<UserWithProjects | null> {
    return this.prisma.user.findUnique({
      where: { id },
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
  }

  async findCollaboratingUsers(projectId: string): Promise<User[]> {
    const collaborators = await this.prisma.projectCollaborator.findMany({
      where: { projectId },
      include: { user: true }
    });

    return collaborators.map(collaborator => collaborator.user);
  }
}
