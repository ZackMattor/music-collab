import type { DocIndex, DocFile, DocSearchResult } from '@/types'

class DocumentationService {
  private docIndex: DocIndex | null = null
  private isLoading = false

  async loadDocumentation(): Promise<DocIndex> {
    if (this.docIndex) {
      return this.docIndex
    }

    if (this.isLoading) {
      // Wait for existing load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (!this.docIndex) {
        throw new Error('Failed to load documentation after waiting')
      }
      return this.docIndex
    }

    try {
      this.isLoading = true
      
      let response: Response
      
      if (import.meta.env.DEV) {
        // In development, use the dev server API
        console.log('🔍 Loading documentation from dev API...')
        response = await fetch('/api/docs')
      } else {
        // In production, load from static asset
        console.log('🔍 Loading documentation from static asset...')
        response = await fetch('/docs-index.json')
      }

      if (!response.ok) {
        throw new Error(`Failed to load documentation: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Loaded documentation:', {
        files: data.files?.length || 0,
        categories: data.categories?.length || 0
      })

      this.docIndex = data
      return this.docIndex as DocIndex
    } catch (error) {
      console.error('❌ Error loading documentation:', error)
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data...')
      this.docIndex = this.getMockData()
      return this.docIndex as DocIndex
    } finally {
      this.isLoading = false
    }
  }

  private getMockData(): DocIndex {
    return {
      files: [
        {
          path: 'README.md',
          title: 'Project Overview',
          slug: 'readme',
          category: 'root',
          content: '<h1>Music Collaboration Platform</h1><p>This is the main project documentation...</p>',
          frontmatter: {},
          lastModified: new Date()
        },
        {
          path: 'REQUIREMENTS.md',
          title: 'Project Requirements',
          slug: 'requirements',
          category: 'root',
          content: '<h1>Requirements</h1><p>Detailed project requirements...</p>',
          frontmatter: {},
          lastModified: new Date()
        },
        {
          path: 'ARCHITECTURE.md',
          title: 'System Architecture',
          slug: 'architecture',
          category: 'root',
          content: '<h1>Architecture</h1><p>System architecture documentation...</p>',
          frontmatter: {},
          lastModified: new Date()
        },
        {
          path: 'PROJECT-PLAN.md',
          title: 'Project Plan',
          slug: 'project-plan',
          category: 'root',
          content: '<h1>Project Plan</h1><p>Development phases and timeline...</p>',
          frontmatter: {},
          lastModified: new Date()
        }
      ],
      categories: ['root']
    }
  }

  async getDocumentBySlug(slug: string): Promise<DocFile | null> {
    console.log('🔍 Looking for document with slug:', slug)
    const docs = await this.loadDocumentation()
    console.log('📚 Available slugs:', docs.files.map(f => f.slug))
    const found = docs.files.find(file => file.slug === slug)
    console.log('📄 Found document:', found ? found.title : 'null')
    return found || null
  }

  async getDocumentsByCategory(category: string): Promise<DocFile[]> {
    const docs = await this.loadDocumentation()
    return docs.files.filter(file => file.category === category)
  }

  async searchDocuments(query: string): Promise<DocSearchResult[]> {
    if (!query.trim()) {
      return []
    }

    const docs = await this.loadDocumentation()
    const results: DocSearchResult[] = []
    const searchTerms = query.toLowerCase().split(/\s+/)

    for (const file of docs.files) {
      const searchableText = `${file.title} ${file.content}`.toLowerCase()
      const matches: DocSearchResult['matches'] = []

      // Check if all search terms are present
      const hasAllTerms = searchTerms.every(term => searchableText.includes(term))
      
      if (hasAllTerms) {
        // Find specific matches with context
        for (const term of searchTerms) {
          const regex = new RegExp(`(.{0,50})(${term})(.{0,50})`, 'gi')
          let match

          while ((match = regex.exec(searchableText)) !== null) {
            const [, before, matched, after] = match
            matches.push({
              text: `${before}${matched}${after}`,
              highlight: matched
            })
            
            // Limit matches per term
            if (matches.length >= 3) break
          }
        }

        results.push({ file, matches })
      }
    }

    // Sort by relevance (title matches first, then by number of matches)
    results.sort((a, b) => {
      const aTitle = a.file.title.toLowerCase()
      const bTitle = b.file.title.toLowerCase()
      const aInTitle = searchTerms.some(term => aTitle.includes(term))
      const bInTitle = searchTerms.some(term => bTitle.includes(term))

      if (aInTitle && !bInTitle) return -1
      if (!aInTitle && bInTitle) return 1
      
      return b.matches.length - a.matches.length
    })

    return results.slice(0, 20) // Limit to top 20 results
  }

  async getCategories(): Promise<string[]> {
    const docs = await this.loadDocumentation()
    return docs.categories
  }
}

export const documentationService = new DocumentationService()
