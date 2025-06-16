<template>
  <div class="auth-modal-overlay" @click="handleOverlayClick">
    <div class="auth-modal" @click.stop>
      <button @click="closeModal" class="close-button" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="auth-content">
        <LoginForm
          v-if="currentView === 'login'"
          @switch-to-register="currentView = 'register'"
          @login-success="handleAuthSuccess"
        />
        <RegisterForm
          v-else-if="currentView === 'register'"
          @switch-to-login="currentView = 'login'"
          @register-success="handleAuthSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

// Props
interface Props {
  initialView?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  initialView: 'login'
})

// Emits
const emit = defineEmits<{
  close: []
  authSuccess: []
}>()

// State
const currentView = ref<'login' | 'register'>(props.initialView)

// Methods
const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const handleAuthSuccess = () => {
  emit('authSuccess')
  closeModal()
}
</script>

<style scoped>
.auth-modal-overlay {
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

.auth-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  color: #6c757d;
  transition: all 0.2s;
  z-index: 10;
}

.close-button:hover {
  background-color: #f8f9fa;
  color: #343a40;
}

.auth-content {
  padding: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .auth-modal-overlay {
    padding: 0.5rem;
  }
  
  .auth-modal {
    max-height: 95vh;
    border-radius: 8px;
  }
}
</style>
