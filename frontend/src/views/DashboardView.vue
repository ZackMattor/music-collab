<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="user-info">
        <span>Welcome back, {{ user?.displayName }}!</span>
        <button @click="showProfile = true" class="profile-button">
          <img 
            v-if="user?.avatar" 
            :src="user.avatar" 
            :alt="user.displayName"
            class="user-avatar"
          />
          <div v-else class="avatar-placeholder">
            {{ avatarInitials }}
          </div>
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="welcome-section">
        <h2>🎵 Welcome to Music Collab!</h2>
        <p>Your creative journey starts here. Start a new project or collaborate with others.</p>
        
        <div class="quick-actions">
          <button class="action-button primary">
            <span class="button-icon">🎹</span>
            New Project
          </button>
          <button class="action-button secondary">
            <span class="button-icon">👥</span>
            Find Collaborators
          </button>
          <button class="action-button secondary">
            <span class="button-icon">📚</span>
            Browse Templates
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎼</div>
          <div class="stat-content">
            <h3>0</h3>
            <p>Projects</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🤝</div>
          <div class="stat-content">
            <h3>0</h3>
            <p>Collaborations</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎧</div>
          <div class="stat-content">
            <h3>0</h3>
            <p>Tracks</p>
          </div>
        </div>
      </div>

      <div class="recent-section">
        <h3>Recent Activity</h3>
        <div class="empty-state">
          <div class="empty-icon">🎵</div>
          <h4>No recent activity</h4>
          <p>Start by creating your first project or joining a collaboration!</p>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <div v-if="showProfile" class="modal-overlay" @click="showProfile = false">
      <div class="modal-content" @click.stop>
        <button @click="showProfile = false" class="modal-close">&times;</button>
        <UserProfile />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import UserProfile from '@/components/auth/UserProfile.vue'

// Store
const authStore = useAuthStore()

// State
const showProfile = ref(false)

// Computed
const user = computed(() => authStore.currentUser)

const avatarInitials = computed(() => {
  if (!user.value?.displayName) return '?'
  return user.value.displayName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  color: #2d3748;
  font-size: 1.8rem;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  color: #4a5568;
  font-weight: 500;
}

.profile-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-section h2 {
  color: #2d3748;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.welcome-section p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-button.secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.action-button.secondary:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.button-icon {
  font-size: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-content h3 {
  color: #2d3748;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
}

.stat-content p {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.recent-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-section h3 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f7fafc;
  color: #2d3748;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .user-info {
    justify-content: space-between;
  }
  
  .dashboard-content {
    padding: 1rem;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
