import type { App } from 'vue'
import { has } from './has'

export default {
  install(app: App) {
    app.directive('has', has)
  },
}
