import { createApp } from 'vue'
import App from '@/App.vue'
import svgIconPlugin from '@/plugins/svgIcon'
import '@/styles/index.scss'
import router from './router'
const app = createApp(App)

app.use(svgIconPlugin)
app.use(router)
app.mount('#app')
