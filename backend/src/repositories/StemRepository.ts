import { PrismaClient, Stem } from '@prisma/client';
import { 
  IStemRepository, 
  CreateStemData, 
  UpdateStemData, 
  StemWithSegments,
  FindManyOptions 
} from './interfaces';

export class StemRepository implements IStemRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Stem | null> {
    return this.prisma.stem.findUnique({
      where: { id }
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<Stem[]> {
    const findOptions: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma query options
    
    if (options.skip !== undefined) findOptions.skip = options.skip;
    if (options.take !== undefined) findOptions.take = options.take;
    if (options.orderBy !== undefined) findOptions.orderBy = options.orderBy;
    if (options.where !== undefined) findOptions.where = options.where;
    
    return this.prisma.stem.findMany(findOptions);
  }

  async create(data: CreateStemData): Promise<Stem> {
    // Get the next order number for this project
    const maxOrderStem = await this.prisma.stem.findFirst({
      where: { projectId: data.projectId },
      orderBy: { order: 'desc' }
    });

    const nextOrder = maxOrderStem ? maxOrderStem.order + 1 : 0;

    return this.prisma.stem.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        color: data.color ?? '#3B82F6',
        volume: data.volume ?? 1.0,
        pan: data.pan ?? 0.0,
        isMuted: false,
        isSoloed: false,
        instrumentType: data.instrumentType ?? null,
        midiChannel: data.midiChannel ?? null,
        order: data.order ?? nextOrder,
        lastModifiedBy: data.lastModifiedBy
      }
    });
  }

  async update(id: string, data: UpdateStemData): Promise<Stem> {
    const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any -- Dynamic Prisma update options
      version: { increment: 1 }
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.volume !== undefined) updateData.volume = data.volume;
    if (data.pan !== undefined) updateData.pan = data.pan;
    if (data.isMuted !== undefined) updateData.isMuted = data.isMuted;
    if (data.isSoloed !== undefined) updateData.isSoloed = data.isSoloed;
    if (data.instrumentType !== undefined) updateData.instrumentType = data.instrumentType;
    if (data.midiChannel !== undefined) updateData.midiChannel = data.midiChannel;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.lastModifiedBy !== undefined) updateData.lastModifiedBy = data.lastModifiedBy;

    return this.prisma.stem.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<Stem> {
    return this.prisma.stem.delete({
      where: { id }
    });
  }

  async findByProject(projectId: string): Promise<Stem[]> {
    return this.prisma.stem.findMany({
      where: { projectId },
      orderBy: { order: 'asc' }
    });
  }

  async findWithSegments(id: string): Promise<StemWithSegments | null> {
    return this.prisma.stem.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { startTime: 'asc' }
        }
      }
    });
  }

  async reorderStems(projectId: string, stemOrders: { id: string; order: number }[]): Promise<void> {
    // Use a transaction to ensure all stems are reordered atomically
    await this.prisma.$transaction(
      stemOrders.map(({ id, order }) =>
        this.prisma.stem.update({
          where: { id },
          data: { 
            order,
            version: { increment: 1 }
          }
        })
      )
    );
  }

  async findByInstrumentType(projectId: string, instrumentType: string): Promise<Stem[]> {
    return this.prisma.stem.findMany({
      where: { 
        projectId,
        instrumentType 
      },
      orderBy: { order: 'asc' }
    });
  }
}
