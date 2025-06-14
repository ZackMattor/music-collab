// Repository implementations
export { UserRepository } from './UserRepository';
export { ProjectRepository } from './ProjectRepository';
export { StemRepository } from './StemRepository';
export { StemSegmentRepository } from './StemSegmentRepository';

// Repository interfaces
export * from './interfaces';

// Repository factory for dependency injection
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './UserRepository';
import { ProjectRepository } from './ProjectRepository';
import { StemRepository } from './StemRepository';
import { StemSegmentRepository } from './StemSegmentRepository';

export class RepositoryFactory {
  constructor(private prisma: PrismaClient) {}

  createUserRepository(): UserRepository {
    return new UserRepository(this.prisma);
  }

  createProjectRepository(): ProjectRepository {
    return new ProjectRepository(this.prisma);
  }

  createStemRepository(): StemRepository {
    return new StemRepository(this.prisma);
  }

  createStemSegmentRepository(): StemSegmentRepository {
    return new StemSegmentRepository(this.prisma);
  }
}
