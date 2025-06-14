import type { ApiResponse, LoginCredentials, RegisterData, User, Project } from '@/types'

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')

// HTTP Client wrapper
class ApiClient {
  private baseUrl: string
  private timeout: number

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
    const token = localStorage.getItem('musiccollab_token')
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: {
            message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            code: errorData.error?.code,
            details: errorData.error?.details,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }
      }

      const data = await response.json()
      return data
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

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
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

// API Services
export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: any }>> {
    // TODO: Replace with actual API call when backend authentication is implemented
    console.log('Mock login API call:', credentials)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      data: {
        user: {
          id: '1',
          username: 'testuser',
          email: credentials.email,
          displayName: 'Test User',
          musicalPreferences: {
            genres: [],
            instruments: [],
            skillLevel: 'intermediate'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token'
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }
  },

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: any }>> {
    // TODO: Replace with actual API call when backend authentication is implemented
    console.log('Mock register API call:', data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      data: {
        user: {
          id: '1',
          username: data.username,
          email: data.email,
          displayName: data.displayName,
          musicalPreferences: {
            genres: [],
            instruments: [],
            skillLevel: 'beginner'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token'
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // TODO: Replace with actual API call
    return apiClient.get<User>('/auth/me')
  },

  async refreshToken(): Promise<ApiResponse<any>> {
    // TODO: Replace with actual API call
    return apiClient.post<any>('/auth/refresh')
  }
}

export const projectsApi = {
  async getProjects(): Promise<ApiResponse<Project[]>> {
    // TODO: Replace with actual API call when backend projects API is implemented
    console.log('Mock get projects API call')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'My First Song',
          description: 'A test project for the music collaboration platform',
          genre: 'Electronic',
          tempo: 120,
          keySignature: 'C Major',
          timeSignature: '4/4',
          ownerId: '1',
          collaborators: [],
          tracks: [],
          status: 'active',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      meta: {
        timestamp: new Date().toISOString()
      }
    }
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    // TODO: Replace with actual API call
    return apiClient.get<Project>(`/projects/${id}`)
  },

  async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    // TODO: Replace with actual API call
    return apiClient.post<Project>('/projects', data)
  },

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    // TODO: Replace with actual API call
    return apiClient.put<Project>(`/projects/${id}`, data)
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    // TODO: Replace with actual API call
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
