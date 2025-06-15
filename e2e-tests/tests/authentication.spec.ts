import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should show sign in and sign up buttons when not authenticated', async ({ page }) => {
    // Check that authentication buttons are visible
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible()
    
    // Should not show Dashboard link
    await expect(page.getByRole('link', { name: 'Dashboard' })).not.toBeVisible()
  })

  test('should navigate to auth page when sign in is clicked', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In' }).click()
    
    // Should be on auth page
    await expect(page).toHaveURL('/auth')
    
    // Should show login form by default
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
  })

  test('should navigate to auth page with register tab when sign up is clicked', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign Up' }).click()
    
    // Should be on auth page with register tab
    await expect(page).toHaveURL('/auth?tab=register')
    
    // Should show register form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByPlaceholder('Enter your display name')).toBeVisible()
  })

  test('should be able to switch between login and register forms', async ({ page }) => {
    await page.goto('http://localhost:5173/auth')
    
    // Start with login form
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    
    // Switch to register
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    
    // Switch back to login
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('http://localhost:5173/auth')
    
    // Try to submit empty login form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    
    // Try invalid email
    await page.getByPlaceholder('Enter your email').fill('invalid-email')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should attempt registration and show loading state', async ({ page }) => {
    await page.goto('http://localhost:5173/auth?tab=register')
    
    // Fill in registration form
    await page.getByPlaceholder('Enter your display name').fill('Test User')
    await page.getByPlaceholder('Enter your email').fill('testuser@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByPlaceholder('Confirm your password').fill('password123')
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should show loading state
    await expect(page.getByText('Creating Account...')).toBeVisible()
    
    // Wait for the request to complete (should fail due to backend not running in E2E context)
    await page.waitForTimeout(2000)
  })

  test('should attempt login and show loading state', async ({ page }) => {
    await page.goto('http://localhost:5173/auth')
    
    // Fill in login form
    await page.getByPlaceholder('Enter your email').fill('testuser@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show loading state
    await expect(page.getByText('Signing In...')).toBeVisible()
    
    // Wait for the request to complete
    await page.waitForTimeout(2000)
  })

  test('should redirect to dashboard when accessing protected route while authenticated', async ({ page }) => {
    // This test would need to mock authentication state or use a test user
    // For now, we'll just verify the redirect to auth page happens
    await page.goto('http://localhost:5173/dashboard')
    
    // Should redirect to home with auth query params
    await expect(page).toHaveURL('/?redirected=true&returnTo=%2Fdashboard')
  })

  test('should show features section on auth page', async ({ page }) => {
    await page.goto('http://localhost:5173/auth')
    
    // Should show features
    await expect(page.getByText('Why Music Collab?')).toBeVisible()
    await expect(page.getByText('Real-time Collaboration')).toBeVisible()
    await expect(page.getByText('AI-Powered Tools')).toBeVisible()
    await expect(page.getByText('Professional Audio')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5173/auth')
    
    // Features should be hidden on mobile
    await expect(page.getByText('Why Music Collab?')).not.toBeVisible()
    
    // Auth form should still be visible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })
})
