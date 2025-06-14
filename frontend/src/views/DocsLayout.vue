<template>
  <div class="docs-layout">
    <div class="docs-sidebar">
      <div class="docs-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search documentation..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      
      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h4>Search Results</h4>
        <div
          v-for="result in searchResults"
          :key="result.file.slug"
          class="search-result"
          @click="navigateToDoc(result.file.slug)"
        >
          <div class="result-title">{{ result.file.title }}</div>
          <div class="result-category">{{ result.file.category }}</div>
          <div v-if="result.matches.length > 0" class="result-matches">
            <div
              v-for="(match, idx) in result.matches.slice(0, 2)"
              :key="idx"
              class="match-text"
              v-html="highlightMatch(match)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Category Navigation -->
      <div v-else class="docs-navigation">
        <div
          v-for="category in categories"
          :key="category"
          class="nav-category"
        >
          <h4 class="category-title">{{ formatCategoryTitle(category) }}</h4>
          <div
            v-for="doc in getDocsByCategory(category)"
            :key="doc.slug"
            class="nav-item"
            :class="{ active: currentSlug === doc.slug }"
            @click="navigateToDoc(doc.slug)"
          >
            {{ doc.title }}
          </div>
        </div>
      </div>
    </div>

    <div class="docs-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { documentationService } from '@/services/documentation'
import type { DocFile, DocSearchResult } from '@/types'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const searchResults = ref<DocSearchResult[]>([])
const docs = ref<DocFile[]>([])
const categories = ref<string[]>([])
const isLoading = ref(true)

const currentSlug = computed(() => route.params.slug as string)

const getDocsByCategory = (category: string) => {
  return docs.value.filter(doc => doc.category === category)
}

const formatCategoryTitle = (category: string) => {
  if (category === 'root') return 'Project Root'
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ')
}

const navigateToDoc = (slug: string) => {
  router.push(`/docs/${slug}`)
  searchQuery.value = ''
  searchResults.value = []
}

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    searchResults.value = await documentationService.searchDocuments(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

const highlightMatch = (match: DocSearchResult['matches'][0]) => {
  return match.text.replace(
    new RegExp(`(${match.highlight})`, 'gi'),
    '<mark>$1</mark>'
  )
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

// Clear search when navigating
watch(() => route.path, () => {
  searchQuery.value = ''
  searchResults.value = []
})
</script>

<style scoped>
.docs-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background: var(--color-background);
}

.docs-sidebar {
  width: 300px;
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.docs-search {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.search-results {
  margin-bottom: 1.5rem;
}

.search-results h4 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-result {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result:hover {
  border-color: var(--color-primary);
  background: var(--color-background-mute);
}

.result-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.result-category {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-bottom: 0.5rem;
}

.result-matches {
  font-size: 0.75rem;
  color: var(--color-text-soft);
}

.match-text {
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.match-text :deep(mark) {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  padding: 0.1em 0.2em;
  border-radius: 2px;
}

.docs-navigation {
  /* Navigation styles */
}

.nav-category {
  margin-bottom: 1.5rem;
}

.category-title {
  margin: 0 0 0.75rem 0;
  color: var(--color-text);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.nav-item {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-soft);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--color-background-mute);
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  font-weight: 500;
}

.docs-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .docs-layout {
    flex-direction: column;
  }
  
  .docs-sidebar {
    width: 100%;
    max-height: 300px;
  }
}
</style>
