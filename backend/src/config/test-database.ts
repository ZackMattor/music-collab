import { PrismaClient } from '@prisma/client';

class TestDatabase {
  private static instance: TestDatabase;
  public prisma: PrismaClient;

  private constructor() {
    // Use the same schema as production, but with SQLite provider
    // The environment variables are set in test-env.ts
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'test' ? [] : ['error'], // Suppress logs in test environment
    });
  }

  public static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
    } catch (error) {
      console.error('❌ Test database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      console.error('❌ Test database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Clean all tables in the test database
   * This ensures test isolation by clearing data between tests
   */
  public async cleanup(): Promise<void> {
    try {
      // Delete in reverse dependency order to handle foreign keys
      await this.prisma.sessionChange.deleteMany();
      await this.prisma.sessionParticipant.deleteMany();
      await this.prisma.collaborationSession.deleteMany();
      await this.prisma.stemSegment.deleteMany();
      await this.prisma.stem.deleteMany();
      await this.prisma.projectCollaborator.deleteMany();
      await this.prisma.project.deleteMany();
      await this.prisma.user.deleteMany();
    } catch (error) {
      console.error('❌ Test database cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Reset the test database to a clean state
   * This includes both schema and data reset
   */
  public async reset(): Promise<void> {
    try {
      // For SQLite, we can just delete all data
      await this.cleanup();
    } catch (error) {
      console.error('❌ Test database reset failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const testDatabase = TestDatabase.getInstance();
export { TestDatabase };
