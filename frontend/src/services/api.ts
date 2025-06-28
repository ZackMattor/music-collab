import type { ApiResponse, LoginCredentials, RegisterData, User, Project } from '@/types'

// Backend user interface for API responses
interface BackendUser {
  id: string;
  email: string;
  displayName?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  bio?: string | null;
  skillLevel?: string | null;
  genres?: string[];
  instruments?: string[];
  defaultTempo?: number;
  collaborationNotifications?: boolean;
}

// Transform backend user to frontend user format
const transformBackendUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  displayName: backendUser.displayName ?? undefined,
  avatar: backendUser.avatar ?? undefined,
  bio: backendUser.bio ?? undefined,
  musicalPreferences: {
    genres: backendUser.genres || [],
    instruments: backendUser.instruments || [],
    skillLevel: (backendUser.skillLevel as 'beginner' | 'intermediate' | 'advanced' | 'professional') || 'beginner'
  },
  createdAt: new Date(backendUser.createdAt),
  updatedAt: new Date(backendUser.updatedAt)
})

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')

// HTTP Client wrapper
class ApiClient {
  private baseUrl: string
  private timeout: number
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && token && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.handleTokenRefresh()
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options)
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: {
            message: errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            code: errorData.error?.code,
            details: errorData.error?.details,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }
      }

      const data = await response.json()
      
      // Check if backend already returned data in ApiResponse format
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        // Backend already returned ApiResponse format, return as-is
        return data
      }
      
      // Backend returned raw data, wrap it in ApiResponse format
      return {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false)
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          tokenManager.setTokens(data.data)
          return true
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    // Refresh failed, clear tokens
    tokenManager.clearTokens()
    
    // Redirect to auth page if we're not already there
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth'
    }
    
    return false
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT)

// Token management utilities
export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem('musiccollab_access_token')
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('musiccollab_refresh_token')
  },

  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('musiccollab_access_token', tokens.accessToken)
    localStorage.setItem('musiccollab_refresh_token', tokens.refreshToken)
  },

  clearTokens(): void {
    localStorage.removeItem('musiccollab_access_token')
    localStorage.removeItem('musiccollab_refresh_token')
  }
}

// API Services
export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    const response = await apiClient.post<{ user: BackendUser; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', credentials)
    
    if (response.success && response.data) {
      const user = transformBackendUser(response.data.user)
      return {
        ...response,
        data: {
          user,
          tokens: response.data.tokens
        }
      }
    }
    
    return {
      success: false,
      error: response.error || { message: 'Login failed' },
      meta: response.meta || { timestamp: new Date().toISOString() }
    }
  },

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {    
    const response = await apiClient.post<{ user: BackendUser; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', data)
    
    if (response.success && response.data) {
      const user = transformBackendUser(response.data.user)
      return {
        ...response,
        data: {
          user,
          tokens: response.data.tokens
        }
      }
    }
    
    return {
      success: false,
      error: response.error || { message: 'Registration failed' },
      meta: response.meta || { timestamp: new Date().toISOString() }
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {    
    const response = await apiClient.get<{ user: BackendUser }>('/auth/profile')
    
    if (response.success && response.data?.user) {
      const user = transformBackendUser(response.data.user)
      return {
        ...response,
        data: user
      }
    }
    
    return {
      success: false,
      error: response.error || { message: 'Failed to get current user' },
      meta: response.meta || { timestamp: new Date().toISOString() }
    }
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) {
      return {
        success: false,
        error: { message: 'No refresh token available' },
        meta: { timestamp: new Date().toISOString() }
      }
    }

    return apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
  },

  async logout(): Promise<ApiResponse<void>> {
    // Clear tokens locally
    tokenManager.clearTokens()
    
    // TODO: Call backend logout endpoint when implemented
        return {
      success: true,
      meta: { timestamp: new Date().toISOString() }
    }
  }
}

export const projectsApi = {
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>('/projects')
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`/projects/${id}`)
  },

  async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>('/projects', data)
  },

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`/projects/${id}`, data)
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/projects/${id}`)
  }
}

// Health check
export const healthApi = {
  async checkHealth(): Promise<ApiResponse<{ status: string; timestamp: string; environment: string }>> {
    return apiClient.get('/health')
  }
}

export default apiClient
