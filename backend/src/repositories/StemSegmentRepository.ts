import { PrismaClient, StemSegment } from '@prisma/client';
import { 
  IStemSegmentRepository, 
  CreateSegmentData, 
  UpdateSegmentData,
  FindManyOptions 
} from './interfaces';

export class StemSegmentRepository implements IStemSegmentRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<StemSegment | null> {
    return this.prisma.stemSegment.findUnique({
      where: { id }
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<StemSegment[]> {
    const findOptions: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma query options
    
    if (options.skip !== undefined) findOptions.skip = options.skip;
    if (options.take !== undefined) findOptions.take = options.take;
    if (options.orderBy !== undefined) findOptions.orderBy = options.orderBy;
    if (options.where !== undefined) findOptions.where = options.where;
    
    return this.prisma.stemSegment.findMany(findOptions);
  }

  async create(data: CreateSegmentData): Promise<StemSegment> {
    const createData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma create options
      stemId: data.stemId,
      type: data.type,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      content: data.content,
      volume: data.volume ?? 1.0,
      lastModifiedBy: data.lastModifiedBy
    };

    // Only add optional fields if they are provided
    if (data.fadeIn !== undefined) createData.fadeIn = data.fadeIn;
    if (data.fadeOut !== undefined) createData.fadeOut = data.fadeOut;
    if (data.aiPrompt !== undefined) {
      createData.aiPrompt = data.aiPrompt;
      createData.aiGeneratedAt = new Date();
    }
    if (data.aiModel !== undefined) createData.aiModel = data.aiModel;
    if (data.aiParameters !== undefined) createData.aiParameters = data.aiParameters;

    return this.prisma.stemSegment.create({ data: createData });
  }

  async update(id: string, data: UpdateSegmentData): Promise<StemSegment> {
    const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma update options
      version: { increment: 1 } // Increment version for conflict resolution
    };

    // Only add fields that are actually provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.volume !== undefined) updateData.volume = data.volume;
    if (data.fadeIn !== undefined) updateData.fadeIn = data.fadeIn;
    if (data.fadeOut !== undefined) updateData.fadeOut = data.fadeOut;
    if (data.lastModifiedBy !== undefined) updateData.lastModifiedBy = data.lastModifiedBy;

    return this.prisma.stemSegment.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<StemSegment> {
    return this.prisma.stemSegment.delete({
      where: { id }
    });
  }

  async findByStem(stemId: string): Promise<StemSegment[]> {
    return this.prisma.stemSegment.findMany({
      where: { stemId },
      orderBy: { startTime: 'asc' }
    });
  }

  async findByTimeRange(stemId: string, startTime: number, endTime: number): Promise<StemSegment[]> {
    return this.prisma.stemSegment.findMany({
      where: {
        stemId,
        OR: [
          // Segments that start within the range
          {
            startTime: {
              gte: startTime,
              lte: endTime
            }
          },
          // Segments that end within the range
          {
            endTime: {
              gte: startTime,
              lte: endTime
            }
          },
          // Segments that span the entire range
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async findByType(stemId: string, type: 'MIDI' | 'AUDIO'): Promise<StemSegment[]> {
    return this.prisma.stemSegment.findMany({
      where: { 
        stemId,
        type 
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async findAIGenerated(stemId: string): Promise<StemSegment[]> {
    return this.prisma.stemSegment.findMany({
      where: { 
        stemId,
        aiPrompt: { not: null }
      },
      orderBy: { aiGeneratedAt: 'desc' }
    });
  }
}
