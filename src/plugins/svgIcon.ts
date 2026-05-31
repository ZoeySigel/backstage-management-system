import type { App } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

import 'virtual:svg-icons-register'

export default {
  install(app: App) {
    app.component('SvgIcon', SvgIcon)
  },
}
