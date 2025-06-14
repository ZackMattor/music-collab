import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { createHighlighter } from 'shiki'

interface DocFile {
  path: string
  title: string
  slug: string
  category: string
  content: string
  frontmatter: Record<string, any>
  lastModified: Date
}

interface DocIndex {
  files: DocFile[]
  categories: string[]
}

async function createMarkdownProcessor(): Promise<MarkdownIt> {
  // Initialize Shiki highlighter
  let highlighter: any = null
  
  try {
    highlighter = await createHighlighter({
      themes: ['github-light'],
      langs: [
        'typescript', 'javascript', 'json', 'sql', 'bash', 'yaml', 
        'markdown', 'html', 'css', 'vue', 'text', 'dockerfile', 
        'scss', 'shell', 'sh', 'zsh'
      ]
    })
    console.log('✅ Shiki highlighter initialized')
  } catch (error) {
    console.warn('❌ Failed to initialize Shiki highlighter:', error)
  }
  
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (code: string, lang: string): string => {
      if (highlighter && lang) {
        try {
          // Check if the language is supported
          const supportedLangs = highlighter.getLoadedLanguages()
          const normalizedLang = lang.toLowerCase()
          
          // Map common language aliases
          const langMap: Record<string, string> = {
            'sh': 'bash',
            'shell': 'bash',
            'zsh': 'bash',
            'dockerfile': 'docker',
            'scss': 'css'
          }
          
          const targetLang = langMap[normalizedLang] || normalizedLang
          
          if (supportedLangs.includes(targetLang)) {
            return highlighter.codeToHtml(code, {
              lang: targetLang,
              theme: 'github-light'
            })
          }
        } catch (error) {
          console.warn(`Shiki highlighting failed for language ${lang}:`, error)
        }
      }
      
      // Fallback to basic highlighting
      const escapedCode = MarkdownIt().utils.escapeHtml(code)
      return `<pre class="language-${lang || 'text'}"><code>${escapedCode}</code></pre>`
    }
  })

  return md
}

function scanMarkdownFiles(rootDir: string): string[] {
  const files: string[] = []
  
  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, dist, coverage directories
        if (!['node_modules', '.git', 'dist', 'coverage', '.vite', 'playwright-report', 'test-results'].includes(entry.name)) {
          scanDirectory(fullPath)
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(path.relative(rootDir, fullPath))
      }
    }
  }
  
  scanDirectory(rootDir)
  return files
}

function processMarkdownFile(filePath: string, rootDir: string, md: MarkdownIt): DocFile {
  const fullPath = path.join(rootDir, filePath)
  const content = fs.readFileSync(fullPath, 'utf-8')
  const { data: frontmatter, content: markdownContent } = matter(content)
  
  // Generate category from file path
  const pathParts = filePath.split(path.sep)
  const category = pathParts.length > 1 ? pathParts[0] : 'root'
  
  // Generate title from frontmatter or filename
  const title = frontmatter.title || 
               path.basename(filePath, '.md')
                 .replace(/[-_]/g, ' ')
                 .replace(/\b\w/g, l => l.toUpperCase())
  
  // Generate slug for routing
  const slug = filePath
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')
    .toLowerCase()
    .replace(/[^a-z0-9\/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  const stats = fs.statSync(fullPath)
  
  return {
    path: filePath,
    title,
    slug,
    category,
    content: md.render(markdownContent),
    frontmatter,
    lastModified: stats.mtime
  }
}

async function processAllMarkdownFiles(rootDir: string): Promise<DocIndex> {
  const md = await createMarkdownProcessor()
  const markdownFiles = scanMarkdownFiles(rootDir)
  const docFiles = markdownFiles.map(file => processMarkdownFile(file, rootDir, md))
  const categories = [...new Set(docFiles.map(f => f.category))].sort()
  
  return {
    files: docFiles,
    categories
  }
}

export function docsPlugin(): Plugin {
  let docIndex: DocIndex | null = null
  
  return {
    name: 'docs-plugin',
    async buildStart() {
      // Generate docs index at build start
      try {
        const rootDir = path.resolve(process.cwd(), '..')
        console.log('📚 Scanning for markdown files in:', rootDir)
        
        docIndex = await processAllMarkdownFiles(rootDir)
        
        console.log('✅ Processed documentation:', {
          files: docIndex.files.length,
          categories: docIndex.categories.length
        })
      } catch (error) {
        console.error('❌ Error processing docs during build:', error)
      }
    },
    
    resolveId(id) {
      if (id === 'virtual:docs-index') {
        return id
      }
    },
    
    load(id) {
      if (id === 'virtual:docs-index') {
        return `export default ${JSON.stringify(docIndex, null, 2)}`
      }
    },
    
    configureServer(server) {
      // Add API endpoint for development
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/docs' && req.method === 'GET') {
          console.log('📡 Serving docs API request')
          
          if (!docIndex) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Documentation not loaded' }))
            return
          }
          
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify(docIndex, null, 2))
        } else {
          next()
        }
      })
    },
    async generateBundle() {
      // Generate docs index for production build
      try {
        const rootDir = path.resolve(process.cwd(), '..')
        const docIndex = await processAllMarkdownFiles(rootDir)
        
        // Emit the docs index as a static asset
        this.emitFile({
          type: 'asset',
          fileName: 'docs-index.json',
          source: JSON.stringify(docIndex, null, 2)
        })
      } catch (error) {
        console.error('❌ Error generating docs bundle:', error)
      }
    }
  }
}
