import { PrismaClient, Project } from '@prisma/client';
import { 
  IProjectRepository, 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectWithStems,
  FindManyOptions 
} from './interfaces';

export class ProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id }
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<Project[]> {
    const findOptions: any = {};
    
    if (options.skip !== undefined) findOptions.skip = options.skip;
    if (options.take !== undefined) findOptions.take = options.take;
    if (options.orderBy !== undefined) findOptions.orderBy = options.orderBy;
    if (options.where !== undefined) findOptions.where = options.where;
    
    return this.prisma.project.findMany(findOptions);
  }

  async create(data: CreateProjectData): Promise<Project> {
    const createData: any = {
      name: data.name,
      ownerId: data.ownerId,
      tempo: data.tempo ?? 120,
      timeSignatureNumerator: data.timeSignatureNumerator ?? 4,
      timeSignatureDenominator: data.timeSignatureDenominator ?? 4,
      isPublic: data.isPublic ?? false
    };

    if (data.description !== undefined) createData.description = data.description;

    return this.prisma.project.create({ data: createData });
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const updateData: any = {
      lastSyncAt: new Date()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tempo !== undefined) updateData.tempo = data.tempo;
    if (data.timeSignatureNumerator !== undefined) updateData.timeSignatureNumerator = data.timeSignatureNumerator;
    if (data.timeSignatureDenominator !== undefined) updateData.timeSignatureDenominator = data.timeSignatureDenominator;
    if (data.length !== undefined) updateData.length = data.length;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    return this.prisma.project.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<Project> {
    return this.prisma.project.delete({
      where: { id }
    });
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { lastAccessedAt: 'desc' }
    });
  }

  async findByCollaborator(userId: string): Promise<Project[]> {
    const collaboratorProjects = await this.prisma.projectCollaborator.findMany({
      where: { userId },
      include: { project: true },
      orderBy: { lastActiveAt: 'desc' }
    });

    return collaboratorProjects.map(collaborator => collaborator.project);
  }

  async findWithStems(id: string): Promise<ProjectWithStems | null> {
    return this.prisma.project.findUnique({
      where: { id },
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
  }

  async findPublicProjects(): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { 
        isPublic: true,
        isActive: true 
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async updateLastAccessed(id: string): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data: { lastAccessedAt: new Date() }
    });
  }
}
