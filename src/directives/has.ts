import type { Directive } from 'vue'
import pinia from '@/store'
import useUserStore from '@/store/modules/user'

export const has: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const userStore = useUserStore(pinia)
    const permission = binding.value

    if (!permission) {
      return
    }

    if (!userStore.buttons.includes(permission)) {
      el.parentNode?.removeChild(el)
    }
  },
}
