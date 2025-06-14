import { test, expect } from '@playwright/test';

test.describe('Documentation System', () => {
  test('should load documentation index page', async ({ page }) => {
    await page.goto('/docs');
    
    // Check that the documentation page loads
    await expect(page.getByRole('heading', { name: /Music Collaboration Platform Documentation/i })).toBeVisible();
    
    // Check for statistics cards
    await expect(page.getByText(/Documentation Files/i)).toBeVisible();
    await expect(page.getByText(/Categories/i)).toBeVisible();
    
    // Check for category sections
    await expect(page.getByText(/Project Root/i)).toBeVisible();
    await expect(page.getByText(/Backend/i)).toBeVisible();
    await expect(page.getByText(/Frontend/i)).toBeVisible();
  });

  test('should navigate to individual documentation pages', async ({ page }) => {
    await page.goto('/docs');
    
    // Click on a documentation link
    await page.getByText('Project Overview').first().click();
    
    // Check that we're on the document page
    await expect(page).toHaveURL(/.*\/docs\/readme/);
    await expect(page.getByRole('heading', { name: /Project Overview/i })).toBeVisible();
    
    // Check for breadcrumb navigation
    await expect(page.getByText('Documentation')).toBeVisible();
    await expect(page.getByText('Project Root')).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/docs');
    
    // Test search functionality
    const searchInput = page.getByPlaceholder('Search documentation...');
    await searchInput.fill('project');
    
    // Wait for search results
    await expect(page.getByText('Search Results')).toBeVisible();
    
    // Check that search results appear
    const searchResults = page.locator('.search-result');
    await expect(searchResults.first()).toBeVisible();
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/docs');
    
    // Check sidebar is visible on desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.docs-sidebar')).toBeVisible();
    
    // Check mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.docs-sidebar')).toBeVisible(); // Should still be visible but styled differently
  });

  test('should display proper meta information', async ({ page }) => {
    await page.goto('/docs/readme');
    
    // Check for document metadata
    await expect(page.locator('.category-badge')).toBeVisible();
    await expect(page.getByText(/Last updated/i)).toBeVisible();
    
    // Check for proper page structure
    await expect(page.locator('.doc-content')).toBeVisible();
  });
});
