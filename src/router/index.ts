import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/campaigns',
      name: 'campaigns',
      component: () => import('@/views/campaigns/CampaignListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/campaigns/new',
      name: 'campaign-new',
      component: () => import('@/views/campaigns/CampaignCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/campaigns/:id',
      name: 'campaign-details',
      component: () => import('@/views/campaigns/CampaignDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization if not ready
  if (authStore.isLoading) {
    await authStore.initialize()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if authentication is required
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to home if guest access is required
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
