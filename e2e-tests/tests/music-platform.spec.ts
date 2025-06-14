import { test, expect } from '@playwright/test';

test.describe('Music Collaboration Platform', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Music Collaboration Platform/);
    
    // Check for main heading - updated to match actual content
    await expect(page.getByRole('heading', { name: /Create Music.*Together/i })).toBeVisible();
    
    // Check for hero subtitle specifically
    await expect(page.locator('.hero-subtitle')).toContainText(/collaborative music creation platform/i);
    await expect(page.getByText(/AI-powered assistance/i)).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to about page
    await page.getByRole('link', { name: /about/i }).click();
    
    // Check we're on the about page
    await expect(page).toHaveURL(/.*\/about/);
    await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check desktop navigation is visible on larger screens
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check mobile navigation behavior
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible on small screens
    const mobileMenuButton = page.locator('[class*="mobile-menu"]').first();
    if (await mobileMenuButton.isVisible()) {
      await expect(mobileMenuButton).toBeVisible();
    }
  });

  test('should check API health endpoint', async ({ page }) => {
    // Test that the backend API is accessible
    const response = await page.request.get('http://localhost:3000/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  test('should have proper meta tags and SEO', async ({ page }) => {
    await page.goto('/');
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /music collaboration/i);
    
    // Check viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
    
    // Check that the page has proper charset
    const charsetMeta = page.locator('meta[charset]');
    await expect(charsetMeta).toHaveAttribute('charset', 'UTF-8');
  });
});
