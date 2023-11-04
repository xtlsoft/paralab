import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/problemlist',
      component: () => import('../views/ProblemListView.vue')
    },
    {
      path: '/problem/:problemid(\\d+)',
      component: () => import('../views/ProblemDetailView.vue')
    },
    {
      path: '/problem/:problemid(\\d+)/edit',
      component: () => import('../views/ProblemEditView.vue')
    },
    {
      path: '/submit/:problemid(\\d+)',
      component: () => import('../views/SubmitCodeView.vue')
    },
    {
      path: '/user/:userId(\\d+)',
      component: () => import('../views/UserProfileView.vue')
    },
    {
      path: '/user/:userId(\\d+)/edit',
      component: () => import('../views/EditUserProfileView.vue')
    },
    {
      path: '/login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      component: () => import('../views/RegisterView.vue')
    }
  ]
})

export default router
