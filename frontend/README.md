# Music Collaboration Platform - Frontend

The frontend application for the Music Collaboration Platform, built with Vue.js 3, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Frontend runs on http://localhost:5173
```

## 🏗️ Architecture

The frontend follows Vue.js 3 best practices with Composition API:

```
src/
├── App.vue                 # Root application component
├── main.ts                 # Application entry point
├── assets/                 # Static assets (CSS, images)
│   ├── base.css           # Base styles and CSS variables
│   ├── main.css           # Global styles
│   └── logo.svg           # Application logo
├── components/             # Reusable Vue components
│   ├── HelloWorld.vue     # Example component
│   ├── TheWelcome.vue     # Welcome section
│   └── icons/             # SVG icon components
├── composables/            # Vue composables (reusable logic)
│   └── useApi.ts          # API interaction composable
├── plugins/                # Vite plugins and utilities
│   └── docs-plugin.ts     # Documentation processing plugin
├── router/                 # Vue Router configuration
│   └── index.ts           # Route definitions
├── services/               # API services and external integrations
│   ├── api.ts             # Base API service
│   └── documentation.ts   # Documentation service
├── stores/                 # Pinia state management
│   ├── auth.ts            # Authentication state
│   └── counter.ts         # Example store
├── types/                  # TypeScript type definitions
│   └── index.ts           # Shared type definitions
└── views/                  # Page-level components
    ├── HomeView.vue       # Landing page
    ├── AboutView.vue      # About page
    ├── DocsLayout.vue     # Documentation layout
    ├── DocsIndex.vue      # Documentation index
    └── DocPage.vue        # Individual document viewer
```

## 🎨 User Interface

### Current Pages
- **Landing Page** (`/`) - Platform overview and hero section
- **About Page** (`/about`) - Technology stack and development status
- **Documentation** (`/docs`) - Interactive project documentation system

### Key Features
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark/Light Theme**: Automatic theme switching based on system preference
- **Documentation System**: Live markdown processing with search and navigation
- **Component Library**: Reusable Vue 3 components with TypeScript
- **Progressive Enhancement**: Works without JavaScript for basic functionality

### Design System
```css
/* CSS Custom Properties (CSS Variables) */
:root {
  --color-primary: #646cff;
  --color-secondary: #42b883;
  --color-background: #ffffff;
  --color-text: #213547;
  --color-border: #e5e7eb;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  
  /* Typography */
  --font-family: Inter, system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Analyze bundle size
npm run build-analyze
```

## 🧪 Testing

The frontend uses Vitest for unit testing with Vue Test Utils:

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
- Tests are co-located with components: `Component.vue` → `Component.spec.ts`
- Testing utilities in `src/test-utils/`
- Mock data and fixtures in `src/__mocks__/`

### Example Test
```typescript
// src/components/HelloWorld.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from './HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
```

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_MOCK_API=false

# Documentation
VITE_DOCS_BASE_PATH=/docs
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { docsPlugin } from './src/plugins/docs-plugin'

export default defineConfig({
  plugins: [
    vue(),
    docsPlugin(), // Custom documentation processing
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

## 📱 Responsive Design

### Breakpoints
```scss
// Mobile first approach
$breakpoint-sm: 640px;   // Small tablets
$breakpoint-md: 768px;   // Tablets
$breakpoint-lg: 1024px;  // Desktops
$breakpoint-xl: 1280px;  // Large desktops
```

### Mobile Features
- Touch-friendly navigation
- Responsive typography scaling
- Optimized images and assets
- Offline-capable (Service Worker ready)

## 🎯 State Management

### Pinia Stores
```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  
  const login = async (credentials) => {
    // Login logic
  }
  
  const logout = () => {
    user.value = null
  }
  
  return { user, isAuthenticated, login, logout }
})
```

### State Architecture
- **Authentication**: User login state and session management
- **Projects**: Project data and collaboration state
- **UI**: Theme, navigation, and interface state
- **Audio**: Playback state and audio processing

## 🔗 API Integration

### Base API Service
```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT,
})

api.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### Composables for API
```typescript
// src/composables/useApi.ts
import { ref, computed } from 'vue'
import api from '@/services/api'

export function useApi<T>() {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  
  const execute = async (request: Promise<any>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await request
      data.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return { data, error, loading, execute }
}
```

## 📚 Documentation System

The frontend includes a built-in documentation system that:

- **Scans** all markdown files in the project
- **Processes** them with syntax highlighting (Shiki)
- **Serves** them through a searchable web interface
- **Updates** automatically during development

### Features
- Full-text search across all documents
- Category-based organization
- Responsive navigation with breadcrumbs
- Syntax highlighting for code blocks
- Mobile-friendly interface

### Usage
```typescript
// Access documentation programmatically
import { documentationService } from '@/services/documentation'

const docs = await documentationService.loadDocumentation()
const searchResults = documentationService.searchDocuments('API')
```

## 🚀 Performance

### Optimization Strategies
- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Caching**: HTTP caching headers and service worker

### Bundle Size
```bash
# Analyze bundle size
npm run build-analyze

# Check build output
npm run build
```

### Performance Metrics
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

## 🐳 Docker Support

```dockerfile
# Multi-stage build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 📊 Development Status

### ✅ Completed (Phase 1)
- Vue.js 3 application setup with Composition API
- TypeScript configuration and strict mode
- Vite build system with hot reload
- Vue Router with dynamic routing
- Pinia state management
- Responsive UI components
- Documentation system with markdown processing
- Testing infrastructure with Vitest
- Linting and formatting setup

### 🔄 In Progress (Phase 2)
- Enhanced component library
- API integration with backend
- Form validation and error handling
- Loading states and UX improvements

### 📅 Coming Soon
- **Phase 3**: User authentication UI
- **Phase 4**: Project management interface
- **Phase 5**: Audio/MIDI track editor
- **Phase 6**: Real-time collaboration features
- **Phase 7**: Audio visualization and effects
- **Phase 8**: AI integration interface

## 🤝 Contributing

### Component Development
```vue
<!-- Example Vue 3 Component -->
<template>
  <div class="example-component">
    <h2>{{ title }}</h2>
    <button @click="handleClick">{{ buttonText }}</button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Click me'
})

const emit = defineEmits<{
  click: [value: string]
}>()

const handleClick = () => {
  emit('click', 'Button clicked!')
}
</script>

<style scoped>
.example-component {
  padding: var(--space-md);
}
</style>
```

### Code Standards
- **Vue 3**: Composition API with `<script setup>`
- **TypeScript**: Strict mode with proper typing
- **ESLint**: Vue.js recommended rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 🔧 Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**TypeScript errors:**
```bash
# Run type checking
npm run type-check
```

**Component not updating:**
```bash
# Check for reactive data issues
# Use ref() for primitives, reactive() for objects
```

**Routing issues:**
```bash
# Check router configuration in src/router/index.ts
# Verify component imports and lazy loading
```

### Development Tips
- Use Vue DevTools browser extension
- Enable Vite debug mode: `DEBUG=vite:* npm run dev`
- Check browser console for warnings
- Use `yarn why <package>` to debug dependency issues

## 📚 Additional Resources

- [Vue.js 3 Documentation](https://vuejs.org/guide/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vitest Testing Framework](https://vitest.dev/)
- [Vue.js Best Practices](https://vuejs.org/style-guide/)

---

*For more information, see the [main project README](../README.md) and [project documentation](http://localhost:5173/docs).*
