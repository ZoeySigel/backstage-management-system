import { createApp } from 'vue'
import App from '@/App.vue'
import svgIconPlugin from '@/plugins/svgIcon'
import 'element-plus/dist/index.css'
import '@/styles/index.scss'
import directives from '@/directives'
import router from './router'
import pinia from './store'
import useUserStore from '@/store/modules/user'
import { setAuthExpiredHandler } from '@/utils/authExpired'
const app = createApp(App)

app.use(svgIconPlugin)
app.use(router)
app.use(pinia)
app.use(directives)

setAuthExpiredHandler(async () => {
  const userStore = useUserStore(pinia)
  const redirect = router.currentRoute.value.fullPath
  userStore.resetUser()

  if (router.currentRoute.value.path !== '/login') {
    await router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
  }
})

app.mount('#app')
