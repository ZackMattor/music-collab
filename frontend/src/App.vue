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
          <RouterLink to="/docs" class="nav-link">Documentation</RouterLink>
          <!-- Authentication Navigation -->
          <div class="auth-links">
            <template v-if="authStore.isAuthenticated">
              <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
              <RouterLink to="/projects" class="nav-link">Projects</RouterLink>
              <div class="user-menu">
                <button @click="showUserMenu = !showUserMenu" class="user-button">
                  <img 
                    v-if="authStore.user?.avatar" 
                    :src="authStore.user.avatar" 
                    :alt="authStore.user.displayName"
                    class="user-avatar"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ userInitials }}
                  </div>
                </button>
                <div v-if="showUserMenu" class="user-dropdown">
                  <div class="user-info">
                    <p class="user-name">{{ authStore.user?.displayName }}</p>
                    <p class="user-email">{{ authStore.user?.email }}</p>
                  </div>
                  <hr>
                  <button @click="handleLogout" class="dropdown-item logout">Sign Out</button>
                </div>
              </div>
            </template>
            <template v-else>
              <RouterLink to="/auth" class="btn btn-outline">Sign In</RouterLink>
              <RouterLink to="/auth?tab=register" class="btn btn-primary">Sign Up</RouterLink>
            </template>
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
        <RouterLink to="/docs" class="mobile-nav-link" @click="closeMobileMenu">Documentation</RouterLink>
        <div class="mobile-auth-links">
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">Dashboard</RouterLink>
            <button class="btn btn-outline mobile-btn" @click="handleLogout">Sign Out</button>
          </template>
          <template v-else>
            <RouterLink to="/auth" class="btn btn-outline mobile-btn" @click="closeMobileMenu">Sign In</RouterLink>
            <RouterLink to="/auth?tab=register" class="btn btn-primary mobile-btn" @click="closeMobileMenu">Sign Up</RouterLink>
          </template>
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
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Store
const authStore = useAuthStore()

// State
const mobileMenuOpen = ref(false)
const showUserMenu = ref(false)

// Computed
const userInitials = computed(() => {
  if (!authStore.user?.displayName) return '?'
  return authStore.user.displayName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

// Initialize auth status on app load
onMounted(() => {
  authStore.checkAuthStatus()
})

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
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

/* Authentication styles */
.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s;
}

.user-button:hover {
  transform: scale(1.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  border: 2px solid #e5e7eb;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.user-info {
  padding: 1rem;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  font-size: 0.9rem;
}

.user-email {
  color: #718096;
  margin: 0;
  font-size: 0.8rem;
}

.user-dropdown hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f7fafc;
}

.dropdown-item.logout {
  color: #e53e3e;
}

.dropdown-item.logout:hover {
  background-color: #fed7d7;
}
</style>
