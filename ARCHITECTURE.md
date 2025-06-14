# Music Collaboration Platform - Architecture Document

## Overview

This document outlines the technical architecture, data models, persistence strategy, and synchronization requirements for the music collaboration platform built with TypeScript.

## Technology Stack

### Frontend
- **Framework**: Vue.js 3 with TypeScript
- **Audio Processing**: Web Audio API
- **MIDI Handling**: WebMIDI API + custom MIDI libraries
- **Real-time Communication**: WebSocket (Socket.IO)
- **State Management**: Pinia
- **UI Components**: Custom components with Canvas/WebGL for audio visualization

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (primary) + Redis (caching/sessions)
- **Real-time**: Socket.IO
- **Authentication**: JWT + Passport.js
- **File Storage**: AWS S3 or similar for audio files
- **AI Integration**: OpenAI API

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Collaboration preferences
  preferences: {
    defaultTempo: number;
    collaborationNotifications: boolean;
  };
  
  // Relationships
  ownedProjects: Project[];
  collaboratingProjects: ProjectCollaborator[];
}
```

### Project Model
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  
  // Music metadata
  tempo: number; // BPM
  timeSignature: [number, number]; // [4, 4] for 4/4 time
  length: number; // Total length in milliseconds
  
  // Project state
  isActive: boolean;
  isPublic: boolean;
  
  // Relationships
  owner: User;
  collaborators: ProjectCollaborator[];
  stems: Stem[];
  
  // Synchronization metadata
  version: number;
  lastSyncAt: Date;
}
```

### ProjectCollaborator Model
```typescript
interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'viewer' | 'contributor' | 'admin';
  joinedAt: Date;
  lastActiveAt: Date;
  
  // Permissions
  permissions: {
    canEdit: boolean;
    canAddStems: boolean;
    canDeleteStems: boolean;
    canInviteOthers: boolean;
    canExport: boolean;
  };
  
  // Real-time status
  isOnline: boolean;
  currentActivity?: 'editing' | 'listening' | 'idle';
  
  // Relationships
  project: Project;
  user: User;
}
```

### Stem Model
```typescript
interface Stem {
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
  
  // Relationships
  project: Project;
  segments: StemSegment[];
  
  // Synchronization
  version: number;
  lastModifiedBy: string; // User ID
}
```

### StemSegment Model
```typescript
interface StemSegment {
  id: string;
  stemId: string;
  type: 'midi' | 'audio';
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
  
  // Relationships
  stem: Stem;
  
  // Synchronization
  version: number;
  lastModifiedBy: string; // User ID
  
  // AI metadata (if AI-generated)
  aiMetadata?: {
    prompt: string;
    model: string;
    generatedAt: Date;
    parameters: Record<string, any>;
  };
}
```

### Content Type Definitions
```typescript
interface MidiSegmentContent {
  type: 'midi';
  // MIDI data as JSON (parsed from MIDI file)
  tracks: MidiTrack[];
  ticksPerQuarter: number;
}

interface MidiTrack {
  name?: string;
  channel: number;
  events: MidiEvent[];
}

interface MidiEvent {
  time: number; // Ticks from start
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'programChange';
  note?: number; // 0-127
  velocity?: number; // 0-127
  control?: number; // Control change number
  value?: number; // Control change value
  program?: number; // Program change number
}

interface AudioSegmentContent {
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
```

### Session Model (for real-time collaboration)
```typescript
interface CollaborationSession {
  id: string;
  projectId: string;
  createdAt: Date;
  expiresAt: Date;
  
  // Active participants
  participants: SessionParticipant[];
  
  // Playback synchronization
  playbackState: {
    isPlaying: boolean;
    currentTime: number; // milliseconds
    tempo: number;
    lastUpdatedAt: Date;
    lastUpdatedBy: string; // User ID
  };
  
  // Recent changes (for conflict resolution)
  recentChanges: SessionChange[];
}

interface SessionParticipant {
  userId: string;
  socketId: string;
  joinedAt: Date;
  lastActiveAt: Date;
  role: string;
  
  // Current state
  isListening: boolean;
  currentCursor?: number; // Current playback position they're viewing
}

interface SessionChange {
  id: string;
  userId: string;
  timestamp: Date;
  changeType: 'stem.update' | 'segment.create' | 'segment.update' | 'segment.delete' | 'playback.sync';
  entityId: string; // ID of changed entity
  changes: Record<string, any>; // The actual changes
  version: number; // Version after this change
}
```

## Persistence Strategy

### Database Schema (PostgreSQL)

#### Primary Tables
- `users` - User accounts and preferences
- `projects` - Project metadata and settings
- `project_collaborators` - Many-to-many relationship with permissions
- `stems` - Audio/MIDI track containers
- `stem_segments` - Individual audio/MIDI segments
- `collaboration_sessions` - Active real-time sessions

#### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_stems_project_id ON stems(project_id);
CREATE INDEX idx_segments_stem_id ON stem_segments(stem_id);
CREATE INDEX idx_segments_time_range ON stem_segments(start_time, end_time);
CREATE INDEX idx_collaborators_project_user ON project_collaborators(project_id, user_id);

-- Real-time collaboration indexes
CREATE INDEX idx_sessions_project_id ON collaboration_sessions(project_id);
CREATE INDEX idx_sessions_expires_at ON collaboration_sessions(expires_at);
```

### File Storage Strategy

#### Audio Files
- **Storage**: AWS S3 or similar cloud storage
- **Organization**: `/projects/{projectId}/audio/{segmentId}.{format}`
- **Formats**: Support WAV, MP3, FLAC
- **Compression**: Lossless for editing, lossy for streaming

#### MIDI Data
- **Storage**: JSON in PostgreSQL (segments table)
- **Backup**: Also store original MIDI files in S3
- **Processing**: Parse MIDI to JSON for web manipulation

#### Generated Content Cache
- **Location**: Redis for temporary AI-generated content
- **TTL**: 24 hours for generated MIDI/audio before moving to permanent storage
- **Key Pattern**: `ai:generated:{userId}:{prompt_hash}`

## Synchronization Architecture

### Real-time Synchronization Events

#### Event Types
```typescript
type SyncEvent = 
  | ProjectUpdateEvent
  | StemUpdateEvent
  | SegmentUpdateEvent
  | PlaybackSyncEvent
  | UserPresenceEvent
  | ChatMessageEvent;

interface ProjectUpdateEvent {
  type: 'project.update';
  projectId: string;
  userId: string;
  changes: Partial<Project>;
  version: number;
  timestamp: Date;
}

interface StemUpdateEvent {
  type: 'stem.update' | 'stem.create' | 'stem.delete';
  projectId: string;
  stemId: string;
  userId: string;
  changes?: Partial<Stem>;
  version: number;
  timestamp: Date;
}

interface SegmentUpdateEvent {
  type: 'segment.update' | 'segment.create' | 'segment.delete';
  projectId: string;
  stemId: string;
  segmentId: string;
  userId: string;
  changes?: Partial<StemSegment>;
  version: number;
  timestamp: Date;
}

interface PlaybackSyncEvent {
  type: 'playback.sync';
  projectId: string;
  userId: string;
  action: 'play' | 'pause' | 'seek';
  currentTime: number;
  timestamp: Date;
}

interface UserPresenceEvent {
  type: 'user.presence';
  projectId: string;
  userId: string;
  status: 'online' | 'offline' | 'idle';
  activity?: 'editing' | 'listening';
  timestamp: Date;
}
```

### Conflict Resolution Strategy

#### Optimistic Locking
- Each entity (Project, Stem, StemSegment) has a `version` field
- Updates include expected version number
- If version mismatch, resolve conflict or reject

#### Conflict Resolution Rules
1. **Last Writer Wins**: For simple properties (name, color, volume)
2. **Merge Strategy**: For complex objects (MIDI data)
3. **User Notification**: Alert users of conflicts and allow manual resolution
4. **Rollback**: Ability to revert to previous versions

#### Event Ordering
- Use timestamp + user ID for event ordering
- Buffer events for 100ms to handle network delays
- Apply events in chronological order

### Data Flow Architecture

```
Client A ──┐
           ├─► WebSocket Server ──► Event Queue ──► Database
Client B ──┘                           │
                                       ├─► Redis Cache
                                       │
                                       └─► Broadcast to other clients
```

#### Synchronization Process
1. **Client Action**: User makes change locally (optimistic update)
2. **Send Event**: Emit change event to server via WebSocket
3. **Server Validation**: Validate permissions and data integrity
4. **Database Update**: Persist change with version increment
5. **Broadcast**: Send event to all other connected clients
6. **Client Update**: Other clients apply change to local state

### Offline Handling

#### Client-side Strategy
- **Local Storage**: Cache project data in IndexedDB
- **Change Queue**: Queue changes when offline
- **Sync on Reconnect**: Apply queued changes when connection restored
- **Conflict Resolution**: Handle conflicts from offline changes

#### Data Synchronization
- **Full Sync**: On initial load or after extended offline period
- **Delta Sync**: Only sync changes since last known state
- **Version Vectors**: Track version per collaborator for conflict resolution

## API Design

### REST Endpoints
```typescript
// Project management
GET    /api/projects                    // List user's projects
POST   /api/projects                    // Create new project
GET    /api/projects/:id                // Get project details
PUT    /api/projects/:id                // Update project
DELETE /api/projects/:id                // Delete project

// Collaboration
POST   /api/projects/:id/collaborators  // Invite collaborator
GET    /api/projects/:id/collaborators  // List collaborators
PUT    /api/projects/:id/collaborators/:userId // Update permissions
DELETE /api/projects/:id/collaborators/:userId // Remove collaborator

// Stems and Segments
GET    /api/projects/:id/stems          // Get all stems
POST   /api/projects/:id/stems          // Create stem
PUT    /api/stems/:id                   // Update stem
DELETE /api/stems/:id                   // Delete stem

POST   /api/stems/:id/segments          // Create segment
PUT    /api/segments/:id                // Update segment
DELETE /api/segments/:id                // Delete segment

// AI Integration
POST   /api/ai/generate-midi            // Generate MIDI from prompt
POST   /api/ai/generate-chords          // Generate chord progression
POST   /api/ai/analyze-project          // Analyze project and suggest improvements
```

### WebSocket Events
```typescript
// Joining/leaving sessions
'session.join'     // Join collaboration session
'session.leave'    // Leave collaboration session

// Real-time updates
'project.update'   // Project metadata changed
'stem.update'      // Stem properties changed
'segment.update'   // Segment created/updated/deleted

// Playback synchronization
'playback.sync'    // Synchronize play/pause/seek

// User presence
'user.presence'    // User online/offline/activity status
'user.cursor'      // User's current timeline position

// Communication
'chat.message'     // Chat message in session
```

## Performance Considerations

### Database Optimization
- **Connection Pooling**: Limit database connections
- **Query Optimization**: Use proper indexes and query patterns
- **Read Replicas**: Scale read operations
- **Caching**: Redis for session data and frequently accessed projects

### Real-time Performance
- **Event Batching**: Batch multiple events to reduce WebSocket traffic
- **Rate Limiting**: Prevent abuse of real-time updates
- **Room Management**: Use Socket.IO rooms for project-based broadcasting
- **Connection Management**: Handle reconnections gracefully

### Client-side Performance
- **Lazy Loading**: Load project data incrementally
- **Virtual Scrolling**: For large numbers of stems/segments
- **Audio Streaming**: Stream audio data rather than loading entire files
- **Web Workers**: Use workers for heavy audio processing

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Secure token rotation
- **Permission Checking**: Verify permissions on every operation
- **Rate Limiting**: Prevent abuse of API endpoints

### Data Protection
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **File Upload Security**: Validate file types and scan for malware
- **CORS Configuration**: Restrict cross-origin requests

### Real-time Security
- **WebSocket Authentication**: Verify JWT on socket connection
- **Room Access Control**: Ensure users can only join authorized sessions
- **Message Validation**: Validate all WebSocket messages
- **DDoS Protection**: Rate limit WebSocket connections

---

*Document Version: 1.0*  
*Last Updated: June 14, 2025*  
*Status: Draft - Ready for Review*
