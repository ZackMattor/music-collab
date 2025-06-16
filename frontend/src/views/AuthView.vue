<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="brand-link">
          <h1>🎵 Music Collab</h1>
        </router-link>
        <p class="auth-subtitle">
          {{ isLogin ? 'Welcome back!' : 'Join our community' }}
        </p>
      </div>

      <div class="auth-forms">
        <div class="form-tabs">
          <button 
            @click="currentTab = 'login'" 
            :class="{ active: currentTab === 'login' }"
            class="tab-button"
          >
            Sign In
          </button>
          <button 
            @click="currentTab = 'register'" 
            :class="{ active: currentTab === 'register' }"
            class="tab-button"
          >
            Sign Up
          </button>
        </div>

        <div class="form-content">
          <LoginForm
            v-if="currentTab === 'login'"
            @login-success="handleAuthSuccess"
            @switch-to-register="currentTab = 'register'"
          />
          <RegisterForm
            v-else
            @register-success="handleAuthSuccess"
            @switch-to-login="currentTab = 'login'"
          />
        </div>
      </div>

      <!-- Features showcase -->
      <div class="features-section">
        <h3>Why Music Collab?</h3>
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icon">🎹</div>
            <h4>Real-time Collaboration</h4>
            <p>Work together with musicians around the world in real-time</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🤖</div>
            <h4>AI-Powered Tools</h4>
            <p>Get creative assistance with AI-generated melodies and harmonies</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🎧</div>
            <h4>Professional Audio</h4>
            <p>High-quality audio processing and mixing capabilities</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

// Router and route
const router = useRouter()
const route = useRoute()

// Store
const authStore = useAuthStore()

// State
const currentTab = ref<'login' | 'register'>('login')

// Computed
const isLogin = computed(() => currentTab.value === 'login')

// Methods
const handleAuthSuccess = () => {
  // Get return URL from query params or default to dashboard
  const returnTo = (route.query.returnTo as string) || '/dashboard'
  router.push(returnTo)
}

// Initialize tab based on route or query params
onMounted(() => {
  // Set initial tab based on route query or path
  if (route.query.tab === 'register' || route.path.includes('register')) {
    currentTab.value = 'register'
  } else if (route.query.tab === 'login' || route.path.includes('login')) {
    currentTab.value = 'login'
  }
  
  // Check if user is already authenticated
  if (authStore.isAuthenticated) {
    handleAuthSuccess()
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 900px;
  width: 100%;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

.auth-header {
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.brand-link {
  text-decoration: none;
  color: inherit;
  margin-bottom: 1rem;
}

.brand-link h1 {
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  color: #4a5568;
  font-size: 1.2rem;
  margin: 0;
}

.auth-forms {
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.form-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #4a5568;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.form-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.form-content :deep(.login-form),
.form-content :deep(.register-form) {
  padding: 0;
  max-width: none;
  width: 100%;
}

.features-section {
  grid-column: 1 / -1;
  padding: 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.features-section h3 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature {
  text-align: center;
  padding: 1rem;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature h4 {
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.feature p {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 1rem;
  }
  
  .auth-header {
    padding: 2rem 1.5rem;
  }
  
  .brand-link h1 {
    font-size: 2rem;
  }
  
  .auth-forms {
    padding: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .features-section {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem 0.5rem;
  }
  
  .auth-container {
    margin: 0;
    border-radius: 8px;
  }
  
  .features-section {
    display: none; /* Hide features on very small screens */
  }
}
</style>
