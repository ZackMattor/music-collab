import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi, tokenManager } from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types'

export { type User }

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // Getters
  const currentUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)
      
      if (response.success && response.data) {
        user.value = response.data.user
        isAuthenticated.value = true
        
        // Store tokens
        tokenManager.setTokens(response.data.tokens)
        
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    isLoading.value = true
    try {
      const response = await authApi.register(userData)
      
      if (response.success && response.data) {
        user.value = response.data.user
        isAuthenticated.value = true
        
        // Store tokens
        tokenManager.setTokens(response.data.tokens)
        
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      user.value = null
      isAuthenticated.value = false
      tokenManager.clearTokens()
    }
  }

  const checkAuthStatus = async () => {
    const accessToken = tokenManager.getAccessToken()
    if (!accessToken) {
      return
    }

    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        user.value = response.data
        isAuthenticated.value = true
      } else {
        // Token might be invalid, clear it
        await logout()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Token might be invalid, clear it
      await logout()
    }
  }

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken()
      if (response.success && response.data) {
        tokenManager.setTokens(response.data)
        return true
      } else {
        // Refresh failed, logout user
        await logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      return false
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
    refreshTokens
  }
})
