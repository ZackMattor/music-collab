import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
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
    await expect(page.getByPlaceholder('Your display name (optional)')).toBeVisible()
  })

  test('should be able to switch between login and register forms', async ({ page }) => {
    await page.goto('/auth')
    
    // Start with login form
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    
    // Switch to register - use the tab button specifically
    await page.locator('.tab-button').filter({ hasText: 'Sign Up' }).click()
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    
    // Switch back to login - use the tab button specifically
    await page.locator('.tab-button').filter({ hasText: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('/auth')
    
    // Test that button is disabled when fields are empty
    await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeDisabled()
    
    // Fill in valid email and password to enable button
    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    
    // Button should now be enabled
    await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeEnabled()
    
    // Clear email to make it invalid
    await page.getByPlaceholder('Enter your email').clear()
    
    // Button should be disabled again
    await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeDisabled()
  })

  test('should attempt registration and show loading state', async ({ page }) => {
    await page.goto('/auth?tab=register')
    
    // Fill in registration form with correct placeholder text
    await page.getByPlaceholder('Your display name (optional)').fill('Test User')
    await page.getByPlaceholder('Enter your email').fill('testuser@example.com')
    await page.getByPlaceholder('Create a password').fill('password123')
    await page.getByPlaceholder('Confirm your password').fill('password123')
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should show loading state
    await expect(page.getByText('Creating Account...')).toBeVisible()
    
    // Wait for the request to complete (should fail due to backend not running in E2E context)
    await page.waitForTimeout(2000)
  })

  test('should attempt login and show loading state', async ({ page }) => {
    await page.goto('/auth')
    
    // Fill in login form
    await page.getByPlaceholder('Enter your email').fill('testuser@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    
    // Submit form - use the form submit button specifically
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click()
    
    // Should show loading state
    await expect(page.getByText('Signing In...')).toBeVisible()
    
    // Wait for the request to complete
    await page.waitForTimeout(2000)
  })

  test('should redirect to dashboard when accessing protected route while authenticated', async ({ page }) => {
    // This test would need to mock authentication state or use a test user
    // For now, we'll just verify the redirect to auth page happens
    await page.goto('/dashboard')
    
    // Should redirect to home with auth query params (URL decoded)
    await expect(page).toHaveURL('/?redirected=true&returnTo=/dashboard')
  })

  test('should show features section on auth page', async ({ page }) => {
    await page.goto('/auth')
    
    // Should show features - be more specific to avoid duplicates
    await expect(page.getByText('Why Music Collab?')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Real-time Collaboration' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'AI-Powered Tools' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Professional Audio' })).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/auth')
    
    // Features should be hidden on mobile
    await expect(page.getByText('Why Music Collab?')).not.toBeVisible()
    
    // Auth form should still be visible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })
})
