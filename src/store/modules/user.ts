import { defineStore } from 'pinia'
import { reqLogin, reqLogout, reqUserInfo } from '@/api/user'
import type { LoginForm } from '@/api/user/type'

const useUserStore = defineStore('User', {
  state: () => ({
    token: localStorage.getItem('TOKEN') || '',
    username: '',
    avatar: '',
    roles: [] as string[],
    buttons: [] as string[],
    routes: [] as string[],
  }),
  actions: {
    async userLogin(data: LoginForm) {
      const result = await reqLogin(data)

      if (result.code !== 200 || !result.data?.token) {
        return Promise.reject(new Error(result.message || '登录失败'))
      }

      this.token = result.data.token
      localStorage.setItem('TOKEN', result.data.token)
      return result
    },
    async userInfo() {
      const result = await reqUserInfo()

      if (result.code !== 200 || !result.data) {
        return Promise.reject(new Error(result.message || '获取用户信息失败'))
      }

      this.username = result.data.username
      this.avatar = result.data.avatar
      this.roles = result.data.roles
      this.buttons = result.data.buttons
      this.routes = result.data.routes
      return result
    },
    async userLogout() {
      const result = await reqLogout()

      if (result.code !== 200) {
        return Promise.reject(new Error(result.message || '退出登录失败'))
      }

      this.resetUser()
      return result
    },
    resetUser() {
      this.token = ''
      this.username = ''
      this.avatar = ''
      this.roles = []
      this.buttons = []
      this.routes = []
      localStorage.removeItem('TOKEN')
    },
  },
})

export default useUserStore
