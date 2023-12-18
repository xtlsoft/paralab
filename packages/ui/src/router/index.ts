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
      path: '/problem/:problemid(\\d+)/submit',
      component: () => import('../views/SubmitCodeView.vue')
    },
    {
      path: '/contestlist',
      component: () => import('../views/ContestListView.vue')
    },
    {
      path: '/contest/:contestid(\\d+)',
      component: () => import('../views/ContestDetailView.vue')
    },
    {
      path: '/contest/:contestid(\\d+)/edit',
      component: () => import('../views/ContestEditView.vue')
    },
    {
      path: '/contest/:contestid(\\d+)/problem/:problemid(\\d+)',
      component: () => import('../views/ProblemDetailView.vue')
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
