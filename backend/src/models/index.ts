// Database models - TypeScript interfaces that match Prisma schema
// These interfaces represent the shape of data from the database

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Collaboration preferences
  defaultTempo: number;
  collaborationNotifications: boolean;
  
  // Relations (populated when needed)
  ownedProjects?: Project[];
  collaboratingProjects?: ProjectCollaborator[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  
  // Music metadata
  tempo: number; // BPM
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  length: number; // Total length in milliseconds
  
  // Project state
  isActive: boolean;
  isPublic: boolean;
  
  // Synchronization metadata
  version: number;
  lastSyncAt: Date;
  
  // Relations (populated when needed)
  owner?: User;
  collaborators?: ProjectCollaborator[];
  stems?: Stem[];
  sessions?: CollaborationSession[];
}

export interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
  lastActiveAt: Date;
  
  // Permissions
  canEdit: boolean;
  canAddStems: boolean;
  canDeleteStems: boolean;
  canInviteOthers: boolean;
  canExport: boolean;
  
  // Real-time status
  isOnline: boolean;
  currentActivity?: Activity;
  
  // Relations (populated when needed)
  project?: Project;
  user?: User;
}

export interface Stem {
  id: string;
  projectId: string;
  name: string;
  color: string; // Hex color for UI
  createdAt: Date;
  updatedAt: Date;
  
  // Audio properties
  volume: number; // 0.0 to 1.0
  pan: number; // -1.0 (left) to 1.0 (right)
  isMuted: boolean;
  isSoloed: boolean;
  
  // Stem metadata
  instrumentType?: string; // 'drums', 'bass', 'piano', etc.
  midiChannel?: number; // For MIDI stems
  
  // Ordering
  order: number; // Display order in DAW
  
  // Synchronization
  version: number;
  lastModifiedBy: string; // User ID
  
  // Relations (populated when needed)
  project?: Project;
  segments?: StemSegment[];
  modifier?: User;
}

export interface StemSegment {
  id: string;
  stemId: string;
  type: SegmentType;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Timing (in milliseconds from project start)
  startTime: number;
  endTime: number;
  
  // Content-specific data
  content: MidiSegmentContent | AudioSegmentContent;
  
  // Processing
  volume: number; // Segment-specific volume (multiplied with stem volume)
  fadeIn?: number; // Fade in duration in ms
  fadeOut?: number; // Fade out duration in ms
  
  // Synchronization
  version: number;
  lastModifiedBy: string; // User ID
  
  // AI metadata (if AI-generated)
  aiPrompt?: string;
  aiModel?: string;
  aiGeneratedAt?: Date;
  aiParameters?: Record<string, unknown>;
  
  // Relations (populated when needed)
  stem?: Stem;
  modifier?: User;
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  createdAt: Date;
  expiresAt: Date;
  
  // Playback synchronization
  isPlaying: boolean;
  currentTime: number; // milliseconds
  tempo: number;
  lastUpdatedAt: Date;
  lastUpdatedBy?: string; // User ID
  
  // Relations (populated when needed)
  project?: Project;
  participants?: SessionParticipant[];
  changes?: SessionChange[];
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  socketId: string;
  joinedAt: Date;
  lastActiveAt: Date;
  role: string;
  
  // Current state
  isListening: boolean;
  currentCursor?: number; // Current playback position they're viewing
  
  // Relations (populated when needed)
  session?: CollaborationSession;
  user?: User;
}

export interface SessionChange {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  changeType: ChangeType;
  entityId: string; // ID of changed entity
  changes: Record<string, unknown>; // The actual changes
  version: number; // Version after this change
  
  // Relations (populated when needed)
  session?: CollaborationSession;
  user?: User;
}

// Content Type Definitions
export interface MidiSegmentContent {
  type: 'midi';
  // MIDI data as JSON (parsed from MIDI file)
  tracks: MidiTrack[];
  ticksPerQuarter: number;
}

export interface MidiTrack {
  name?: string;
  channel: number;
  events: MidiEvent[];
}

export interface MidiEvent {
  time: number; // Ticks from start
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'programChange';
  note?: number; // 0-127
  velocity?: number; // 0-127
  control?: number; // Control change number
  value?: number; // Control change value
  program?: number; // Program change number
}

export interface AudioSegmentContent {
  type: 'audio';
  fileUrl: string; // S3 URL or similar
  originalFileName: string;
  duration: number; // in milliseconds
  sampleRate: number;
  channels: number;
  format: string; // 'wav', 'mp3', etc.
  
  // Audio analysis data (optional)
  waveformData?: number[]; // For visualization
  peaks?: number[]; // Peak data for waveform display
}

// Enums
export enum Role {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  ADMIN = 'ADMIN'
}

export enum Activity {
  EDITING = 'EDITING',
  LISTENING = 'LISTENING',
  IDLE = 'IDLE'
}

export enum SegmentType {
  MIDI = 'MIDI',
  AUDIO = 'AUDIO'
}

export enum ChangeType {
  STEM_UPDATE = 'STEM_UPDATE',
  SEGMENT_CREATE = 'SEGMENT_CREATE',
  SEGMENT_UPDATE = 'SEGMENT_UPDATE',
  SEGMENT_DELETE = 'SEGMENT_DELETE',
  PLAYBACK_SYNC = 'PLAYBACK_SYNC'
}

// Database operation result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Pagination types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
