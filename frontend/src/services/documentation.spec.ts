import { describe, it, expect } from 'vitest'
import { documentationService } from './documentation'

describe('DocumentationService', () => {
  it('should load documentation successfully', async () => {
    const docs = await documentationService.loadDocumentation()
    
    expect(docs).toBeDefined()
    expect(docs.files).toBeInstanceOf(Array)
    expect(docs.categories).toBeInstanceOf(Array)
    expect(docs.files.length).toBeGreaterThan(0)
  })

  it('should get document by slug', async () => {
    const doc = await documentationService.getDocumentBySlug('readme')
    
    expect(doc).toBeDefined()
    expect(doc?.title).toBe('Project Overview')
    expect(doc?.slug).toBe('readme')
  })

  it('should return null for non-existent document', async () => {
    const doc = await documentationService.getDocumentBySlug('non-existent')
    
    expect(doc).toBeNull()
  })

  it('should get documents by category', async () => {
    const docs = await documentationService.getDocumentsByCategory('root')
    
    expect(docs).toBeInstanceOf(Array)
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.every(doc => doc.category === 'root')).toBe(true)
  })

  it('should search documents', async () => {
    const results = await documentationService.searchDocuments('project')
    
    expect(results).toBeInstanceOf(Array)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].file).toBeDefined()
    expect(results[0].matches).toBeInstanceOf(Array)
  })

  it('should return empty results for empty search', async () => {
    const results = await documentationService.searchDocuments('')
    
    expect(results).toEqual([])
  })

  it('should get categories', async () => {
    const categories = await documentationService.getCategories()
    
    expect(categories).toBeInstanceOf(Array)
    expect(categories).toContain('root')
    // In test environment, we fall back to mock data which only has 'root'
    // In real environment with API, we would have 'backend' and 'frontend' too
    expect(categories.length).toBeGreaterThan(0)
  })
})
