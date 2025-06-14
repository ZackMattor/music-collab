<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="app-header">
      <nav class="navbar">
        <div class="nav-brand">
          <RouterLink to="/" class="brand-link">
            <span class="brand-icon">🎵</span>
            <span class="brand-text">MusicCollab</span>
          </RouterLink>
        </div>
        
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
          <!-- TODO: Add authentication links when auth is implemented -->
          <div class="auth-links">
            <button class="btn btn-outline" @click="handleLogin">Login</button>
            <button class="btn btn-primary" @click="handleSignup">Sign Up</button>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span class="hamburger"></span>
        </button>
      </nav>

      <!-- Mobile menu -->
      <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
        <RouterLink to="/" class="mobile-nav-link" @click="closeMobileMenu">Home</RouterLink>
        <RouterLink to="/about" class="mobile-nav-link" @click="closeMobileMenu">About</RouterLink>
        <div class="mobile-auth-links">
          <button class="btn btn-outline mobile-btn" @click="handleLogin">Login</button>
          <button class="btn btn-primary mobile-btn" @click="handleSignup">Sign Up</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>MusicCollab</h3>
          <p>Collaborative music creation platform with AI assistance.</p>
        </div>
        <div class="footer-section">
          <h4>Features</h4>
          <ul>
            <li>Real-time Collaboration</li>
            <li>AI-Powered Assistant</li>
            <li>MIDI Editor</li>
            <li>Audio Support</li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Development</h4>
          <ul>
            <li>Currently in Beta</li>
            <li>Open Source</li>
            <li>MIT License</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 MusicCollab. Built with Vue.js and TypeScript.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleLogin = () => {
  // TODO: Implement login when authentication is ready
  console.log('Login clicked - Authentication coming soon!')
}

const handleSignup = () => {
  // TODO: Implement signup when authentication is ready
  console.log('Sign Up clicked - Authentication coming soon!')
}
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.brand-icon {
  margin-right: 0.5rem;
  font-size: 2rem;
}

.brand-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
}

.auth-links {
  display: flex;
  gap: 1rem;
  margin-left: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
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
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

/* Mobile menu */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger {
  display: block;
  width: 25px;
  height: 3px;
  background: #333;
  position: relative;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: #333;
  transition: 0.3s;
}

.hamburger::before {
  top: -8px;
}

.hamburger::after {
  top: 8px;
}

.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid #eee;
  padding: 1rem 2rem;
}

.mobile-nav-link {
  display: block;
  text-decoration: none;
  color: #333;
  padding: 0.5rem 0;
  font-weight: 500;
}

.mobile-auth-links {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.mobile-btn {
  flex: 1;
}

/* Main content */
.main-content {
  flex: 1;
}

/* Footer */
.app-footer {
  background: #333;
  color: white;
  padding: 3rem 2rem 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: #ffd700;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  padding: 0.25rem 0;
  color: #ccc;
}

.footer-bottom {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #555;
  text-align: center;
  color: #ccc;
}

/* Responsive design */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu.active {
    display: block;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>
