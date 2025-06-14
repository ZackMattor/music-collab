<template>
  <div class="about">
    <div class="container">
      <!-- Hero Section -->
      <section class="about-hero">
        <h1>About MusicCollab</h1>
        <p class="hero-subtitle">
          Building the future of collaborative music creation with AI assistance
        </p>
      </section>

      <!-- Vision Section -->
      <section class="vision">
        <h2>Our Vision</h2>
        <p>
          MusicCollab is designed to break down the barriers between musicians, 
          enabling seamless collaboration regardless of location or experience level. 
          By combining real-time collaboration tools with AI-powered assistance, 
          we're creating a platform where creativity can flourish.
        </p>
      </section>

      <!-- Technology Section -->
      <section class="technology">
        <h2>Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>Vue.js 3 with TypeScript</li>
              <li>Vite for fast development</li>
              <li>Pinia for state management</li>
              <li>Vue Router for navigation</li>
              <li>Web Audio API for audio processing</li>
            </ul>
          </div>
          <div class="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Node.js with TypeScript</li>
              <li>Express.js framework</li>
              <li>PostgreSQL database</li>
              <li>Redis for caching</li>
              <li>Socket.IO for real-time features</li>
            </ul>
          </div>
          <div class="tech-category">
            <h3>AI Integration</h3>
            <ul>
              <li>OpenAI API for music generation</li>
              <li>Custom MIDI processing</li>
              <li>Machine learning for recommendations</li>
              <li>Pattern recognition</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Development Status -->
      <section class="development-status">
        <h2>Development Progress</h2>
        <div class="progress-timeline">
          <div class="timeline-item completed">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Phase 1.1: Development Environment</h4>
              <p>Docker setup, database configuration, and development tools</p>
              <span class="status">✅ Completed</span>
            </div>
          </div>
          <div class="timeline-item completed">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Phase 1.2: Backend Scaffolding</h4>
              <p>Express.js API, TypeScript configuration, and testing setup</p>
              <span class="status">✅ Completed</span>
            </div>
          </div>
          <div class="timeline-item current">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Phase 1.3: Frontend Scaffolding</h4>
              <p>Vue.js application with routing, state management, and UI components</p>
              <span class="status">🔄 In Progress</span>
            </div>
          </div>
          <div class="timeline-item upcoming">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Phase 2: Database & Authentication</h4>
              <p>User management, project models, and authentication system</p>
              <span class="status">⏳ Upcoming</span>
            </div>
          </div>
          <div class="timeline-item upcoming">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Phase 3+: Core Features</h4>
              <p>MIDI editor, real-time collaboration, and AI integration</p>
              <span class="status">⏳ Planned</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Open Source Section -->
      <section class="open-source">
        <h2>Open Source</h2>
        <p>
          MusicCollab is being developed as an open-source project. 
          We believe in transparent development and community collaboration.
        </p>
        <div class="open-source-links">
          <a href="#" class="btn btn-primary">View on GitHub</a>
          <a href="#" class="btn btn-outline">Contributing Guide</a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// About page component
</script>

<style scoped>
.about {
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.about-hero {
  text-align: center;
  margin-bottom: 4rem;
}

.about-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

section {
  margin-bottom: 4rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #666;
  margin-bottom: 1rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.tech-category {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tech-category ul {
  list-style: none;
  padding: 0;
}

.tech-category li {
  padding: 0.5rem 0;
  color: #666;
  border-bottom: 1px solid #eee;
}

.tech-category li:last-child {
  border-bottom: none;
}

.progress-timeline {
  position: relative;
  margin-top: 2rem;
}

.progress-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ddd;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 60px;
}

.timeline-marker {
  position: absolute;
  left: 11px;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #ddd;
  background: white;
}

.timeline-item.completed .timeline-marker {
  border-color: #28a745;
  background: #28a745;
}

.timeline-item.current .timeline-marker {
  border-color: #007bff;
  background: #007bff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
}

.timeline-content h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.timeline-content p {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.status {
  font-size: 0.9rem;
  font-weight: 600;
}

.timeline-item.completed .status {
  color: #28a745;
}

.timeline-item.current .status {
  color: #007bff;
}

.timeline-item.upcoming .status {
  color: #6c757d;
}

.open-source {
  text-align: center;
  background: #f8f9fa;
  padding: 3rem 2rem;
  border-radius: 12px;
  margin-top: 3rem;
}

.open-source-links {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .about-hero h1 {
    font-size: 2.5rem;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    padding-left: 50px;
  }

  .open-source-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
