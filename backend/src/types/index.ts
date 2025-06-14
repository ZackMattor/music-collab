export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  musicalPreferences: {
    genres: string[];
    instruments: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  tempo?: number;
  keySignature?: string;
  timeSignature?: string;
  ownerId: string;
  collaborators: ProjectCollaborator[];
  tracks: Track[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'collaborator' | 'viewer';
  permissions: string[];
  joinedAt: Date;
}

export interface Track {
  id: string;
  projectId: string;
  name: string;
  instrument?: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
  pan: number;
  effects: TrackEffect[];
  audioSegments: AudioSegment[];
  midiData?: Buffer;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackEffect {
  id: string;
  type: string;
  parameters: Record<string, unknown>;
  isEnabled: boolean;
  order: number;
}

export interface AudioSegment {
  id: string;
  trackId: string;
  filename: string;
  fileUrl: string;
  startTime: number;
  duration: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  createdBy: string;
  createdAt: Date;
}
