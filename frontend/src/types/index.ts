// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
  }
}

// User Types
export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
  bio?: string
  musicalPreferences: {
    genres: string[]
    instruments: string[]
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  }
  createdAt: Date
  updatedAt: Date
}

// Project Types
export interface Project {
  id: string
  title: string
  description?: string
  genre?: string
  tempo?: number
  keySignature?: string
  timeSignature?: string
  ownerId: string
  collaborators: ProjectCollaborator[]
  tracks: Track[]
  status: 'draft' | 'active' | 'completed' | 'archived'
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProjectCollaborator {
  userId: string
  role: 'owner' | 'collaborator' | 'viewer'
  permissions: string[]
  joinedAt: Date
}

// Track Types
export interface Track {
  id: string
  projectId: string
  name: string
  instrument?: string
  isMuted: boolean
  isSolo: boolean
  volume: number
  pan: number
  effects: TrackEffect[]
  audioSegments: AudioSegment[]
  midiData?: ArrayBuffer
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TrackEffect {
  id: string
  type: string
  parameters: Record<string, unknown>
  isEnabled: boolean
  order: number
}

export interface AudioSegment {
  id: string
  trackId: string
  filename: string
  fileUrl: string
  startTime: number
  duration: number
  volume: number
  fadeIn?: number
  fadeOut?: number
  createdBy: string
  createdAt: Date
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  displayName?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Application State Types
export interface AppConfig {
  apiBaseUrl: string
  websocketUrl: string
  appName: string
  appVersion: string
  features: {
    aiGeneration: boolean
    realTimeCollaboration: boolean
    audioRecording: boolean
  }
}

// Documentation Types
export interface DocFile {
  path: string
  title: string
  slug: string
  category: string
  content: string
  frontmatter: Record<string, unknown>
  lastModified: Date
}

export interface DocIndex {
  files: DocFile[]
  categories: string[]
}

export interface DocSearchResult {
  file: DocFile
  matches: Array<{
    text: string
    highlight: string
  }>
}
