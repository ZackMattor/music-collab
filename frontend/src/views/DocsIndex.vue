<template>
  <div class="docs-index">
    <header class="docs-hero">
      <h1>Music Collaboration Platform Documentation</h1>
      <p>
        Complete documentation for the Music Collaboration Platform project, 
        including architecture, development guides, and project planning.
      </p>
    </header>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading documentation...</p>
    </div>

    <div v-else class="docs-overview">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ totalDocs }}</h3>
          <p>Documentation Files</p>
        </div>
        <div class="stat-card">
          <h3>{{ categories.length }}</h3>
          <p>Categories</p>
        </div>
        <div class="stat-card">
          <h3>{{ lastUpdated }}</h3>
          <p>Last Updated</p>
        </div>
      </div>

      <div class="categories-grid">
        <div
          v-for="category in categories"
          :key="category"
          class="category-card"
        >
          <h3 class="category-title">
            {{ formatCategoryTitle(category) }}
          </h3>
          <p class="category-description">
            {{ getCategoryDescription(category) }}
          </p>
          <div class="category-docs">
            <router-link
              v-for="doc in getDocsByCategory(category).slice(0, 5)"
              :key="doc.slug"
              :to="`/docs/${doc.slug}`"
              class="doc-link"
            >
              {{ doc.title }}
            </router-link>
            <div
              v-if="getDocsByCategory(category).length > 5"
              class="more-docs"
            >
              +{{ getDocsByCategory(category).length - 5 }} more documents
            </div>
          </div>
        </div>
      </div>

      <div class="recent-updates">
        <h2>Recent Updates</h2>
        <div class="recent-docs">
          <router-link
            v-for="doc in recentDocs"
            :key="doc.slug"
            :to="`/docs/${doc.slug}`"
            class="recent-doc"
          >
            <div class="doc-info">
              <h4>{{ doc.title }}</h4>
              <p class="doc-category">{{ formatCategoryTitle(doc.category) }}</p>
            </div>
            <div class="doc-date">
              {{ formatDate(doc.lastModified) }}
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { documentationService } from '@/services/documentation'
import type { DocFile } from '@/types'

const docs = ref<DocFile[]>([])
const categories = ref<string[]>([])
const isLoading = ref(true)

const totalDocs = computed(() => docs.value.length)

const lastUpdated = computed(() => {
  if (docs.value.length === 0) return 'N/A'
  
  const mostRecent = docs.value.reduce((latest, doc) => {
    return new Date(doc.lastModified) > new Date(latest.lastModified) ? doc : latest
  })
  
  return formatDate(mostRecent.lastModified)
})

const recentDocs = computed(() => {
  return [...docs.value]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 8)
})

const getDocsByCategory = (category: string) => {
  return docs.value.filter(doc => doc.category === category)
}

const formatCategoryTitle = (category: string) => {
  if (category === 'root') return 'Project Root'
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ')
}

const getCategoryDescription = (category: string) => {
  const descriptions: Record<string, string> = {
    'root': 'Main project documentation including README, requirements, and architecture',
    'backend': 'Backend API documentation, database schemas, and server configuration',
    'frontend': 'Frontend application documentation, components, and user interface guides',
    'e2e-tests': 'End-to-end testing documentation and test specifications',
    'dev-tools': 'Development tools, Docker configuration, and environment setup'
  }
  
  return descriptions[category] || `Documentation for ${formatCategoryTitle(category)}`
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(async () => {
  try {
    const docIndex = await documentationService.loadDocumentation()
    docs.value = docIndex.files
    categories.value = docIndex.categories
  } catch (error) {
    console.error('Failed to load documentation:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.docs-index {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.docs-hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  background: linear-gradient(135deg, var(--color-primary-alpha) 0%, var(--color-background-soft) 100%);
  border-radius: 16px;
}

.docs-hero h1 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.docs-hero p {
  font-size: 1.25rem;
  color: var(--color-text-soft);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
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

.docs-overview {
  /* Overview styles */
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card h3 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: var(--color-text-soft);
  font-weight: 500;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.category-card {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.category-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.category-description {
  color: var(--color-text-soft);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.category-docs {
  /* Category docs styles */
}

.doc-link {
  display: block;
  color: var(--color-primary);
  text-decoration: none;
  padding: 0.5rem 0;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.doc-link:hover {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.more-docs {
  color: var(--color-text-soft);
  font-size: 0.875rem;
  font-style: italic;
  margin-top: 0.5rem;
}

.recent-updates {
  margin-top: 3rem;
}

.recent-updates h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.recent-docs {
  display: grid;
  gap: 1rem;
}

.recent-doc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.recent-doc:hover {
  border-color: var(--color-primary);
  background: var(--color-background-mute);
}

.doc-info h4 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.doc-category {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin: 0;
}

.doc-date {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .docs-hero h1 {
    font-size: 2rem;
  }
  
  .docs-hero p {
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-doc {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
