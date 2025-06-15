import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Route guard that requires authentication
 * Redirects to home page if user is not authenticated
 */
export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Check if user is already authenticated
  if (authStore.isAuthenticated) {
    next()
    return
  }
  
  // Try to restore authentication from stored tokens
  await authStore.checkAuthStatus()
  
  if (authStore.isAuthenticated) {
    next()
  } else {
    // Redirect to home with a query parameter indicating login is needed
    next({
      path: '/',
      query: { 
        redirected: 'true',
        returnTo: to.fullPath 
      }
    })
  }
}

/**
 * Route guard that requires no authentication (guest only)
 * Redirects authenticated users away from login/register pages
 */
export const requireGuest = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Check current authentication status
  if (!authStore.isAuthenticated) {
    await authStore.checkAuthStatus()
  }
  
  if (authStore.isAuthenticated) {
    // User is authenticated, redirect to appropriate page
    const returnTo = (from.query.returnTo as string) || '/dashboard'
    next(returnTo)
  } else {
    // User is not authenticated, allow access to guest page
    next()
  }
}

/**
 * Route guard that optionally checks authentication
 * Does not redirect but provides auth status
 */
export const optionalAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Try to restore authentication if not already checked
  if (!authStore.isAuthenticated) {
    await authStore.checkAuthStatus()
  }
  
  // Always proceed regardless of auth status
  next()
}

/**
 * Global navigation guard that handles token refresh
 * Should be applied to all routes that might need fresh tokens
 */
export const handleTokenRefresh = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Only attempt refresh if user is authenticated
  if (authStore.isAuthenticated) {
    try {
      // Attempt to refresh tokens if needed
      // This will be handled by the API client automatically on 401 responses
      await authStore.checkAuthStatus()
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Let the request proceed - the API will handle token issues
    }
  }
  
  next()
}
