import { User, Project, ProjectCollaborator, Stem, StemSegment, CollaborationSession } from '@prisma/client';
import { CreateUserData, UpdateUserData, UserWithProjects } from '../types';

// Base repository interface with common CRUD operations
export interface BaseRepository<T, CreateData, UpdateData> {
  findById(id: string): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  create(data: CreateData): Promise<T>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<T>;
}

export interface FindManyOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: any; // Using any to avoid strict type checking issues with Prisma where clauses
}

// User Repository Interface
export interface IUserRepository extends BaseRepository<User, CreateUserData, UpdateUserData> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findWithProjects(id: string): Promise<UserWithProjects | null>;
  findCollaboratingUsers(projectId: string): Promise<User[]>;
}

// Project Repository Interface
export interface IProjectRepository extends BaseRepository<Project, CreateProjectData, UpdateProjectData> {
  findByOwner(ownerId: string): Promise<Project[]>;
  findByCollaborator(userId: string): Promise<Project[]>;
  findWithStems(id: string): Promise<ProjectWithStems | null>;
  findPublicProjects(): Promise<Project[]>;
  updateLastAccessed(id: string): Promise<Project>;
}

// ProjectCollaborator Repository Interface
export interface IProjectCollaboratorRepository extends BaseRepository<ProjectCollaborator, CreateCollaboratorData, UpdateCollaboratorData> {
  findByProject(projectId: string): Promise<ProjectCollaborator[]>;
  findByUser(userId: string): Promise<ProjectCollaborator[]>;
  findByProjectAndUser(projectId: string, userId: string): Promise<ProjectCollaborator | null>;
  removeCollaborator(projectId: string, userId: string): Promise<ProjectCollaborator | null>;
}

// Stem Repository Interface
export interface IStemRepository extends BaseRepository<Stem, CreateStemData, UpdateStemData> {
  findByProject(projectId: string): Promise<Stem[]>;
  findWithSegments(id: string): Promise<StemWithSegments | null>;
  reorderStems(projectId: string, stemOrders: { id: string; order: number }[]): Promise<void>;
  findByInstrumentType(projectId: string, instrumentType: string): Promise<Stem[]>;
}

// StemSegment Repository Interface
export interface IStemSegmentRepository extends BaseRepository<StemSegment, CreateSegmentData, UpdateSegmentData> {
  findByStem(stemId: string): Promise<StemSegment[]>;
  findByTimeRange(stemId: string, startTime: number, endTime: number): Promise<StemSegment[]>;
  findByType(stemId: string, type: 'MIDI' | 'AUDIO'): Promise<StemSegment[]>;
  findAIGenerated(stemId: string): Promise<StemSegment[]>;
}

// CollaborationSession Repository Interface
export interface ICollaborationSessionRepository extends BaseRepository<CollaborationSession, CreateSessionData, UpdateSessionData> {
  findByProject(projectId: string): Promise<CollaborationSession[]>;
  findActiveSession(projectId: string): Promise<CollaborationSession | null>;
  expireSessions(beforeDate: Date): Promise<number>;
  findWithParticipants(id: string): Promise<SessionWithParticipants | null>;
}

// Type definitions for repository operations
export interface CreateUserData {
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  avatar?: string;
  defaultTempo?: number;
  collaborationNotifications?: boolean;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  defaultTempo?: number;
  collaborationNotifications?: boolean;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  ownerId: string;
  tempo?: number;
  timeSignatureNumerator?: number;
  timeSignatureDenominator?: number;
  isPublic?: boolean;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  tempo?: number;
  timeSignatureNumerator?: number;
  timeSignatureDenominator?: number;
  length?: number;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface CreateCollaboratorData {
  projectId: string;
  userId: string;
  role?: 'VIEWER' | 'CONTRIBUTOR' | 'ADMIN';
  canEdit?: boolean;
  canAddStems?: boolean;
  canDeleteStems?: boolean;
  canInviteOthers?: boolean;
  canExport?: boolean;
}

export interface UpdateCollaboratorData {
  role?: 'VIEWER' | 'CONTRIBUTOR' | 'ADMIN';
  canEdit?: boolean;
  canAddStems?: boolean;
  canDeleteStems?: boolean;
  canInviteOthers?: boolean;
  canExport?: boolean;
  isOnline?: boolean;
  currentActivity?: 'EDITING' | 'LISTENING' | 'IDLE';
}

export interface CreateStemData {
  projectId: string;
  name: string;
  color?: string;
  volume?: number;
  pan?: number;
  instrumentType?: string;
  midiChannel?: number;
  order?: number;
  lastModifiedBy: string;
}

export interface UpdateStemData {
  name?: string;
  color?: string;
  volume?: number;
  pan?: number;
  isMuted?: boolean;
  isSoloed?: boolean;
  instrumentType?: string;
  midiChannel?: number;
  order?: number;
  lastModifiedBy?: string;
}

export interface CreateSegmentData {
  stemId: string;
  type: 'MIDI' | 'AUDIO';
  name: string;
  startTime: number;
  endTime: number;
  content: any; // Using any for JSON content to avoid strict type checking
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  lastModifiedBy: string;
  aiPrompt?: string;
  aiModel?: string;
  aiParameters?: any; // Using any for JSON parameters
}

export interface UpdateSegmentData {
  name?: string;
  startTime?: number;
  endTime?: number;
  content?: any; // Using any for JSON content
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  lastModifiedBy?: string;
}

export interface CreateSessionData {
  projectId: string;
  expiresAt: Date;
  tempo?: number;
}

export interface UpdateSessionData {
  isPlaying?: boolean;
  currentTime?: number;
  tempo?: number;
  lastUpdatedBy?: string;
  expiresAt?: Date;
}

// Extended types with relations
export interface UserWithProjects extends User {
  ownedProjects: Project[];
  collaboratingProjects: ProjectCollaborator[];
}

export interface ProjectWithStems extends Project {
  stems: Stem[];
  collaborators: ProjectCollaborator[];
}

export interface StemWithSegments extends Stem {
  segments: StemSegment[];
}

export interface SessionWithParticipants extends CollaborationSession {
  participants: Array<{
    id: string;
    userId: string;
    user: User;
    socketId: string;
    role: string;
    isListening: boolean;
    currentCursor?: number;
  }>;
}
