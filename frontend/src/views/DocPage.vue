<template>
  <div class="doc-page">
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading documentation...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h2>Document Not Found</h2>
      <p>{{ error }}</p>
      <router-link to="/docs" class="btn btn-primary">
        Back to Documentation
      </router-link>
    </div>
    
    <article v-else-if="document" class="document">
      <header class="doc-header">
        <div class="doc-breadcrumb">
          <router-link to="/docs">Documentation</router-link>
          <span class="separator">/</span>
          <span class="category">{{ formatCategory(document.category) }}</span>
          <span class="separator">/</span>
          <span class="current">{{ document.title }}</span>
        </div>
        
        <h1 class="doc-title">{{ document.title }}</h1>
        
        <div class="doc-meta">
          <span class="category-badge">{{ formatCategory(document.category) }}</span>
          <span class="last-modified">
            Last updated: {{ formatDate(document.lastModified) }}
          </span>
        </div>
      </header>
      
      <div class="doc-content" v-html="document.content"></div>
      
      <footer class="doc-footer">
        <div class="doc-navigation">
          <router-link
            v-if="previousDoc"
            :to="`/docs/${previousDoc.slug}`"
            class="nav-link prev-link"
          >
            <span class="nav-direction">← Previous</span>
            <span class="nav-title">{{ previousDoc.title }}</span>
          </router-link>
          
          <router-link
            v-if="nextDoc"
            :to="`/docs/${nextDoc.slug}`"
            class="nav-link next-link"
          >
            <span class="nav-direction">Next →</span>
            <span class="nav-title">{{ nextDoc.title }}</span>
          </router-link>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { documentationService } from '@/services/documentation'
import type { DocFile } from '@/types'

const route = useRoute()

const document = ref<DocFile | null>(null)
const allDocs = ref<DocFile[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const currentSlug = computed(() => {
  const slugParam = route.params.slug
  // Handle both string and array cases (due to :slug+ route parameter)
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam
  console.log('🔗 Current route slug:', slug, 'from params:', route.params.slug)
  return slug
})

const previousDoc = computed(() => {
  if (!document.value || allDocs.value.length === 0) return null
  
  const currentIndex = allDocs.value.findIndex(doc => doc.slug === document.value!.slug)
  return currentIndex > 0 ? allDocs.value[currentIndex - 1] : null
})

const nextDoc = computed(() => {
  if (!document.value || allDocs.value.length === 0) return null
  
  const currentIndex = allDocs.value.findIndex(doc => doc.slug === document.value!.slug)
  return currentIndex < allDocs.value.length - 1 ? allDocs.value[currentIndex + 1] : null
})

const formatCategory = (category: string) => {
  if (category === 'root') return 'Project Root'
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ')
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadDocument = async (slug: string) => {
  isLoading.value = true
  error.value = null
  
  console.log('🔍 Loading document with slug:', slug)
  
  try {
    const doc = await documentationService.getDocumentBySlug(slug)
    console.log('📄 Document found:', doc ? doc.title : 'null')
    
    if (!doc) {
      error.value = `Document with slug "${slug}" not found.`
      document.value = null
    } else {
      document.value = doc
    }
  } catch (err) {
    console.error('❌ Error loading document:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load document'
    document.value = null
  } finally {
    isLoading.value = false
  }
}

const loadAllDocs = async () => {
  try {
    const docIndex = await documentationService.loadDocumentation()
    allDocs.value = docIndex.files.sort((a, b) => a.title.localeCompare(b.title))
  } catch (err) {
    console.error('Failed to load document index:', err)
  }
}

onMounted(async () => {
  await loadAllDocs()
  await loadDocument(currentSlug.value)
})

watch(currentSlug, (newSlug) => {
  if (newSlug) {
    loadDocument(newSlug)
  }
})
</script>

<style scoped>
.doc-page {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: var(--color-text-soft);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
}

.error h2 {
  color: var(--color-warning);
  margin-bottom: 1rem;
}

.document {
  line-height: 1.6;
}

.doc-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.doc-breadcrumb {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin-bottom: 1rem;
}

.doc-breadcrumb a {
  color: var(--color-primary);
  text-decoration: none;
}

.doc-breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
}

.current {
  color: var(--color-text);
}

.doc-title {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.category-badge {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
}

.last-modified {
  color: var(--color-text-soft);
}

.doc-content {
  margin-bottom: 3rem;
}

/* Markdown content styles */
.doc-content :deep(h1),
.doc-content :deep(h2),
.doc-content :deep(h3),
.doc-content :deep(h4),
.doc-content :deep(h5),
.doc-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text);
  font-weight: 600;
  line-height: 1.25;
}

.doc-content :deep(h1) { font-size: 2rem; }
.doc-content :deep(h2) { font-size: 1.5rem; }
.doc-content :deep(h3) { font-size: 1.25rem; }
.doc-content :deep(h4) { font-size: 1.125rem; }

.doc-content :deep(p) {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.doc-content :deep(ul),
.doc-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.doc-content :deep(li) {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.doc-content :deep(code) {
  background: var(--color-background-soft);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.doc-content :deep(pre) {
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
}

.doc-content :deep(pre code) {
  background: none;
  padding: 0;
}

.doc-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: var(--color-text-soft);
}

.doc-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.doc-content :deep(th),
.doc-content :deep(td) {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.doc-content :deep(th) {
  font-weight: 600;
  background: var(--color-background-soft);
}

.doc-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.doc-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-link {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s ease;
  flex: 1;
  max-width: 300px;
}

.nav-link:hover {
  border-color: var(--color-primary);
  background: var(--color-background-mute);
}

.prev-link {
  text-align: left;
}

.next-link {
  text-align: right;
  margin-left: auto;
}

.nav-direction {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin-bottom: 0.25rem;
}

.nav-title {
  font-weight: 500;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .doc-title {
    font-size: 2rem;
  }
  
  .doc-navigation {
    flex-direction: column;
  }
  
  .nav-link {
    max-width: none;
  }
  
  .next-link {
    margin-left: 0;
  }
}
</style>
