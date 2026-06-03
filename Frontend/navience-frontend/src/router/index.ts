import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/services/supabase'

import Landing from '@/views/Landing.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import Transaksi from '@/views/Transaksi.vue'
import Anggaran from '@/views/Anggaran.vue'
import Target from '@/views/Target.vue'

const routes = [
  {
    path: '/',
    component: Landing
  },
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
    path: '/dashboard/:userId',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/transaksi/:userId',
    component: Transaksi,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/profile/:userId',
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/anggaran/:userId',
    component: Anggaran,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/target/:userId',
    component: Target,
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
  const userId = session?.user?.id

  if (to.path === '/' && userId) {
    return next({ path: `/dashboard/${userId}` })
  }

  if (to.meta.requiresGuest && userId) {
    return next({ path: `/dashboard/${userId}` })
  }

  if (
    to.meta.requiresAuth &&
    !session
  ) {
    next('/login')
    return
  }

  if (to.meta.requiresAuth && userId && to.params.userId !== userId) {
    return next({ path: `/dashboard/${userId}` })
  }

  next()
})

export default router