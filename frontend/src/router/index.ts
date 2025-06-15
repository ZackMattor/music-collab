import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { requireAuth, requireGuest, optionalAuth } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: optionalAuth
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      beforeEnter: optionalAuth
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      beforeEnter: requireGuest
    },
    {
      path: '/login',
      redirect: '/auth'
    },
    {
      path: '/register',
      redirect: '/auth?tab=register'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/docs',
      component: () => import('../views/DocsLayout.vue'),
      beforeEnter: optionalAuth,
      children: [
        {
          path: '',
          name: 'docs-index',
          component: () => import('../views/DocsIndex.vue'),
        },
        {
          path: ':slug+',
          name: 'doc-page',
          component: () => import('../views/DocPage.vue'),
        },
      ],
    },
  ],
})

export default router
