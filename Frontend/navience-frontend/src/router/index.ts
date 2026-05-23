import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/services/supabase'

import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'


const routes = [
  {
    path: '/login',
    component: Login,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/register',
    component: Register,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (to.meta.requiresGuest && session) {
    return next({ path: '/' })
  }

  if (
    to.meta.requiresAuth &&
    !session
  ) {
    next('/login')
  } else {
    next()
  }
})

export default router