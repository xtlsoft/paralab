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
      path: '/problem/:problemid',
      component: () => import('../views/ProblemDetailView.vue')
    },
    {
      path: '/submit/:problemid',
      component: () => import('../views/SubmitCodeView.vue')
    },
    {
      path: '/user/:userid',
      component: () => import('../views/UserProfileView.vue')
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
