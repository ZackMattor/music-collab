import { ref, type Ref } from 'vue'
import type { ApiResponse } from '@/types'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options

  const data: Ref<T | null> = ref(null)
  const error: Ref<string | null> = ref(null)
  const isLoading = ref(false)
  const isSuccess = ref(false)

  const execute = async () => {
    isLoading.value = true
    error.value = null
    isSuccess.value = false

    try {
      const response = await apiCall()
      
      if (response.success && response.data) {
        data.value = response.data
        isSuccess.value = true
        onSuccess?.(response.data)
      } else {
        error.value = response.error?.message || 'An error occurred'
        onError?.(response.error)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
      onError?.(err)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
    isLoading.value = false
    isSuccess.value = false
  }

  // Execute immediately if requested
  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    isLoading,
    isSuccess,
    execute,
    reset
  }
}

// Specialized hook for API calls that need to be reactive to parameters
export function useApiWithParams<T, P>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options

  const data: Ref<T | null> = ref(null)
  const error: Ref<string | null> = ref(null)
  const isLoading = ref(false)
  const isSuccess = ref(false)

  const execute = async (params: P) => {
    isLoading.value = true
    error.value = null
    isSuccess.value = false

    try {
      const response = await apiCall(params)
      
      if (response.success && response.data) {
        data.value = response.data
        isSuccess.value = true
        onSuccess?.(response.data)
      } else {
        error.value = response.error?.message || 'An error occurred'
        onError?.(response.error)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
      onError?.(err)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
    isLoading.value = false
    isSuccess.value = false
  }

  return {
    data,
    error,
    isLoading,
    isSuccess,
    execute,
    reset
  }
}
