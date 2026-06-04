import { createRouter, createWebHashHistory } from 'vue-router'
import { constantRoute } from './routes'
import useUserStore from '@/store/modules/user'
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoute,
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    }
  },
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (token) {
    if (to.path === '/login') {
      return '/'
    }

    if (!userStore.username) {
      try {
        await userStore.userInfo()
      } catch {
        userStore.resetUser()
        return `/login?redirect=${to.fullPath}`
      }
    }

    return true
  }

  if (to.path === '/login') {
    return true
  }

  return `/login?redirect=${to.fullPath}`
})

export default router
