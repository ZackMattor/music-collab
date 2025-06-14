import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // Getters
  const currentUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)

  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // TODO: Implement actual authentication when backend is ready
      console.log('Login attempt:', { email, password })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      user.value = {
        id: '1',
        username: 'testuser',
        email: email,
        displayName: 'Test User'
      }
      isAuthenticated.value = true
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: { username: string; email: string; password: string; displayName: string }) => {
    isLoading.value = true
    try {
      // TODO: Implement actual registration when backend is ready
      console.log('Registration attempt:', userData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful registration
      user.value = {
        id: '1',
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName
      }
      isAuthenticated.value = true
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    // TODO: Clear tokens when authentication is implemented
  }

  const checkAuthStatus = async () => {
    // TODO: Check if user is authenticated (e.g., validate JWT token)
    // For now, just check if user data exists in local storage
    const savedUser = localStorage.getItem('musiccollab_user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('musiccollab_user')
      }
    }
  }

  // Auto-save user to localStorage when user changes
  const saveUserToStorage = () => {
    if (user.value) {
      localStorage.setItem('musiccollab_user', JSON.stringify(user.value))
    } else {
      localStorage.removeItem('musiccollab_user')
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Getters
    currentUser,
    isLoggedIn,
    
    // Actions
    login,
    register,
    logout,
    checkAuthStatus,
    saveUserToStorage
  }
})
