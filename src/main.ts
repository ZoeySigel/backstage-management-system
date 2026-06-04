import { createApp } from 'vue'
import App from '@/App.vue'
import svgIconPlugin from '@/plugins/svgIcon'
import 'element-plus/dist/index.css'
import '@/styles/index.scss'
import router from './router'
import pinia from './store'
const app = createApp(App)

app.use(svgIconPlugin)
app.use(router)
app.use(pinia)
app.mount('#app')
