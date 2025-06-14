import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useApi, useApiWithParams } from './useApi'
import type { ApiResponse } from '@/types'

// Mock API responses
const mockSuccessResponse: ApiResponse<string> = {
  success: true,
  data: 'test data',
}

const mockErrorResponse: ApiResponse<string> = {
  success: false,
  error: {
    message: 'Test error message',
    code: 'TEST_ERROR',
  },
}

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useApi', () => {
    it('should initialize with default values', () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockSuccessResponse)
      const { data, error, isLoading, isSuccess } = useApi(mockApiCall)

      expect(data.value).toBe(null)
      expect(error.value).toBe(null)
      expect(isLoading.value).toBe(false)
      expect(isSuccess.value).toBe(false)
    })

    it('should execute API call successfully', async () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockSuccessResponse)
      const mockOnSuccess = vi.fn()
      
      const { data, error, isLoading, isSuccess, execute } = useApi(mockApiCall, {
        onSuccess: mockOnSuccess,
      })

      await execute()
      await nextTick()

      expect(mockApiCall).toHaveBeenCalledOnce()
      expect(data.value).toBe('test data')
      expect(error.value).toBe(null)
      expect(isLoading.value).toBe(false)
      expect(isSuccess.value).toBe(true)
      expect(mockOnSuccess).toHaveBeenCalledWith('test data')
    })

    it('should handle API call errors', async () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockErrorResponse)
      const mockOnError = vi.fn()
      
      const { data, error, isLoading, isSuccess, execute } = useApi(mockApiCall, {
        onError: mockOnError,
      })

      await execute()
      await nextTick()

      expect(mockApiCall).toHaveBeenCalledOnce()
      expect(data.value).toBe(null)
      expect(error.value).toBe('Test error message')
      expect(isLoading.value).toBe(false)
      expect(isSuccess.value).toBe(false)
      expect(mockOnError).toHaveBeenCalledWith(mockErrorResponse.error)
    })

    it('should handle thrown exceptions', async () => {
      const mockError = new Error('Network error')
      const mockApiCall = vi.fn().mockRejectedValue(mockError)
      const mockOnError = vi.fn()
      
      const { data, error, isLoading, isSuccess, execute } = useApi(mockApiCall, {
        onError: mockOnError,
      })

      await execute()
      await nextTick()

      expect(data.value).toBe(null)
      expect(error.value).toBe('Network error')
      expect(isLoading.value).toBe(false)
      expect(isSuccess.value).toBe(false)
      expect(mockOnError).toHaveBeenCalledWith(mockError)
    })

    it('should handle non-Error exceptions', async () => {
      const mockApiCall = vi.fn().mockRejectedValue('String error')
      
      const { error, execute } = useApi(mockApiCall)

      await execute()
      await nextTick()

      expect(error.value).toBe('An unexpected error occurred')
    })

    it('should execute immediately when immediate option is true', async () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockSuccessResponse)
      
      useApi(mockApiCall, { immediate: true })
      
      // Wait for next tick to allow async execution
      await nextTick()
      await nextTick()

      expect(mockApiCall).toHaveBeenCalledOnce()
    })

    it('should reset state correctly', async () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockSuccessResponse)
      
      const { data, error, isLoading, isSuccess, execute, reset } = useApi(mockApiCall)

      await execute()
      await nextTick()

      // Verify state after execution
      expect(data.value).toBe('test data')
      expect(isSuccess.value).toBe(true)

      // Reset and verify
      reset()

      expect(data.value).toBe(null)
      expect(error.value).toBe(null)
      expect(isLoading.value).toBe(false)
      expect(isSuccess.value).toBe(false)
    })

    it('should set loading state during API call', async () => {
      let resolvePromise: (value: ApiResponse<string>) => void
      const mockApiCall = vi.fn().mockReturnValue(
        new Promise<ApiResponse<string>>((resolve) => {
          resolvePromise = resolve
        })
      )

      const { isLoading, execute } = useApi(mockApiCall)
      
      const executePromise = execute()
      await nextTick()

      expect(isLoading.value).toBe(true)

      // Resolve the promise
      resolvePromise!(mockSuccessResponse)
      await executePromise
      await nextTick()

      expect(isLoading.value).toBe(false)
    })
  })

  describe('useApiWithParams', () => {
    interface TestParams {
      id: string
      name: string
    }

    it('should execute with parameters', async () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockSuccessResponse)
      const testParams: TestParams = { id: '123', name: 'test' }
      
      const { data, execute } = useApiWithParams<string, TestParams>(mockApiCall)

      await execute(testParams)
      await nextTick()

      expect(mockApiCall).toHaveBeenCalledWith(testParams)
      expect(data.value).toBe('test data')
    })

    it('should handle errors with parameters', async () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockErrorResponse)
      const testParams: TestParams = { id: '123', name: 'test' }
      
      const { error, execute } = useApiWithParams<string, TestParams>(mockApiCall)

      await execute(testParams)
      await nextTick()

      expect(error.value).toBe('Test error message')
    })

    it('should reset state correctly', () => {
      const mockApiCall = vi.fn().mockResolvedValue(mockSuccessResponse)
      
      const { data, error, isLoading, isSuccess, reset } = useApiWithParams<string, TestParams>(mockApiCall)

      reset()

      expect(data.value).toBe(null)
      expect(error.value).toBe(null)
      expect(isLoading.value).toBe(false)
      expect(isSuccess.value).toBe(false)
    })
  })
})
