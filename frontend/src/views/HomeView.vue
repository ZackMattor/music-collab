<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Create Music
          <span class="highlight">Together</span>
        </h1>
        <p class="hero-subtitle">
          A collaborative music creation platform that brings musicians together with AI-powered assistance.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="getStarted">
            Get Started
          </button>
          <button class="btn btn-secondary" @click="learnMore">
            Learn More
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="waveform-preview">
          <!-- Placeholder for waveform visualization -->
          <div class="wave-bars">
            <div class="bar" v-for="i in 24" :key="i" :style="{ height: Math.random() * 80 + 20 + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>Real-time Collaboration</h3>
            <p>Work together with other musicians in real-time, sharing ideas and creating music simultaneously.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>AI-Powered Assistant</h3>
            <p>Get help with chord progressions, melody generation, and musical suggestions from our AI assistant.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎹</div>
            <h3>MIDI Editor</h3>
            <p>Create and edit MIDI sequences with our intuitive piano roll editor and virtual instruments.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎧</div>
            <h3>Audio Support</h3>
            <p>Import, edit, and mix audio files alongside MIDI tracks for complete music production.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Status Section -->
    <section class="status">
      <div class="container">
        <h2 class="section-title">Development Status</h2>
        <div class="status-card">
          <h3>🚧 Currently in Development</h3>
          <p>We're actively building this platform. Current progress:</p>
          <ul class="status-list">
            <li class="completed">✅ Development Environment Setup</li>
            <li class="completed">✅ Backend API Foundation</li>
            <li class="current">🔄 Frontend Application (Current Phase)</li>
            <li class="upcoming">⏳ Database & User Management</li>
            <li class="upcoming">⏳ Real-time Collaboration</li>
            <li class="upcoming">⏳ AI Integration</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const getStarted = () => {
  // TODO: Navigate to signup/login when authentication is implemented
  console.log('Get Started clicked - Authentication coming soon!')
}

const learnMore = () => {
  // TODO: Navigate to about page or documentation
  console.log('Learn More clicked - Documentation coming soon!')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  display: flex;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #ffd700;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
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
  background: #ffd700;
  color: #333;
}

.btn-primary:hover {
  background: #ffed4e;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.waveform-preview {
  width: 300px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.wave-bars {
  display: flex;
  align-items: end;
  height: 100%;
  gap: 4px;
}

.bar {
  flex: 1;
  background: #ffd700;
  border-radius: 2px;
  animation: wave 2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.1s);
}

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

.features, .status {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.status {
  background: #f8f9fa;
}

.status-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.status-card h3 {
  color: #333;
  margin-bottom: 1rem;
}

.status-list {
  list-style: none;
  padding: 0;
}

.status-list li {
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.completed {
  color: #28a745;
}

.current {
  color: #007bff;
  font-weight: bold;
}

.upcoming {
  color: #6c757d;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-visual {
    margin-top: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
