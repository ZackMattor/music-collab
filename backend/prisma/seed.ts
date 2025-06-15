import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcryptjs.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@musiccollab.dev' },
    update: {},
    create: {
      email: 'alice@musiccollab.dev',
      displayName: 'Alice Johnson',
      passwordHash: hashedPassword,
      defaultTempo: 120,
      collaborationNotifications: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@musiccollab.dev' },
    update: {},
    create: {
      email: 'bob@musiccollab.dev',
      displayName: 'Bob Smith',
      passwordHash: hashedPassword,
      defaultTempo: 128,
      collaborationNotifications: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@musiccollab.dev' },
    update: {},
    create: {
      email: 'charlie@musiccollab.dev',
      displayName: 'Charlie Brown',
      passwordHash: hashedPassword,
      defaultTempo: 110,
      collaborationNotifications: false,
    },
  });

  console.log('👤 Created users:', { user1: user1.id, user2: user2.id, user3: user3.id });

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      name: 'Electronic Dance Track',
      description: 'A collaborative EDM project with heavy bass and synth leads',
      ownerId: user1.id,
      tempo: 128,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      length: 240000, // 4 minutes in milliseconds
      isActive: true,
      isPublic: false,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'sample-project-2' },
    update: {},
    create: {
      id: 'sample-project-2',
      name: 'Jazz Fusion Experiment',
      description: 'Exploring jazz harmonies with modern production techniques',
      ownerId: user2.id,
      tempo: 120,
      timeSignatureNumerator: 7,
      timeSignatureDenominator: 8,
      length: 180000, // 3 minutes in milliseconds
      isActive: true,
      isPublic: true,
    },
  });

  console.log('🎵 Created projects:', { project1: project1.id, project2: project2.id });

  // Create project collaborators
  const collaborator1 = await prisma.projectCollaborator.upsert({
    where: {
      projectId_userId: {
        projectId: project1.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      userId: user2.id,
      role: 'CONTRIBUTOR',
      canEdit: true,
      canAddStems: true,
      canDeleteStems: false,
      canInviteOthers: false,
      canExport: true,
    },
  });

  const collaborator2 = await prisma.projectCollaborator.upsert({
    where: {
      projectId_userId: {
        projectId: project2.id,
        userId: user3.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      userId: user3.id,
      role: 'ADMIN',
      canEdit: true,
      canAddStems: true,
      canDeleteStems: true,
      canInviteOthers: true,
      canExport: true,
    },
  });

  console.log('🤝 Created collaborators:', { collaborator1: collaborator1.id, collaborator2: collaborator2.id });

  // Create sample stems
  const stem1 = await prisma.stem.upsert({
    where: { id: 'sample-stem-1' },
    update: {},
    create: {
      id: 'sample-stem-1',
      projectId: project1.id,
      name: 'Kick Drum',
      color: '#FF5722',
      volume: 0.8,
      pan: 0.0,
      isMuted: false,
      isSoloed: false,
      instrumentType: 'drums',
      order: 0,
      lastModifiedBy: user1.id,
    },
  });

  const stem2 = await prisma.stem.upsert({
    where: { id: 'sample-stem-2' },
    update: {},
    create: {
      id: 'sample-stem-2',
      projectId: project1.id,
      name: 'Bass Synth',
      color: '#2196F3',
      volume: 0.7,
      pan: 0.0,
      isMuted: false,
      isSoloed: false,
      instrumentType: 'bass',
      midiChannel: 1,
      order: 1,
      lastModifiedBy: user2.id,
    },
  });

  const stem3 = await prisma.stem.upsert({
    where: { id: 'sample-stem-3' },
    update: {},
    create: {
      id: 'sample-stem-3',
      projectId: project2.id,
      name: 'Piano Chords',
      color: '#4CAF50',
      volume: 0.6,
      pan: -0.2,
      isMuted: false,
      isSoloed: false,
      instrumentType: 'piano',
      midiChannel: 0,
      order: 0,
      lastModifiedBy: user2.id,
    },
  });

  console.log('🎛️ Created stems:', { stem1: stem1.id, stem2: stem2.id, stem3: stem3.id });

  // Create sample MIDI segments
  const midiContent = {
    type: 'midi',
    tracks: [
      {
        name: 'Piano',
        channel: 0,
        events: [
          { time: 0, type: 'noteOn', note: 60, velocity: 80 },
          { time: 480, type: 'noteOff', note: 60, velocity: 0 },
          { time: 480, type: 'noteOn', note: 64, velocity: 75 },
          { time: 960, type: 'noteOff', note: 64, velocity: 0 },
          { time: 960, type: 'noteOn', note: 67, velocity: 70 },
          { time: 1440, type: 'noteOff', note: 67, velocity: 0 },
        ]
      }
    ],
    ticksPerQuarter: 480
  };

  const segment1 = await prisma.stemSegment.upsert({
    where: { id: 'sample-segment-1' },
    update: {},
    create: {
      id: 'sample-segment-1',
      stemId: stem3.id,
      type: 'MIDI',
      name: 'Piano Intro',
      startTime: 0,
      endTime: 8000, // 8 seconds
      content: midiContent,
      volume: 1.0,
      lastModifiedBy: user2.id,
    },
  });

  // Create sample audio segment (mock content)
  const audioContent = {
    type: 'audio',
    fileUrl: 'https://example.com/samples/kick-drum.wav',
    originalFileName: 'kick-drum.wav',
    duration: 1000, // 1 second
    sampleRate: 44100,
    channels: 2,
    format: 'wav',
    waveformData: [0.1, 0.8, 0.6, 0.2, 0.0, -0.2, -0.6, -0.8, -0.1],
    peaks: [0.8, 0.6, 0.4, 0.2]
  };

  const segment2 = await prisma.stemSegment.upsert({
    where: { id: 'sample-segment-2' },
    update: {},
    create: {
      id: 'sample-segment-2',
      stemId: stem1.id,
      type: 'AUDIO',
      name: 'Kick Pattern',
      startTime: 0,
      endTime: 4000, // 4 seconds
      content: audioContent,
      volume: 0.9,
      lastModifiedBy: user1.id,
    },
  });

  console.log('🎼 Created segments:', { segment1: segment1.id, segment2: segment2.id });

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
