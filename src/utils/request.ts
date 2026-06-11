import axios from 'axios'
import { ElMessage } from 'element-plus'
import { notifyAuthExpired } from './authExpired'

type ApiResponse = {
  code?: number
  message?: string
}

let lastErrorMessage = ''
let lastErrorTime = 0

const showError = (message: string) => {
  const now = Date.now()

  if (message === lastErrorMessage && now - lastErrorTime < 1500) {
    return
  }

  lastErrorMessage = message
  lastErrorTime = now
  ElMessage.error(message)
}

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5000,
})

request.interceptors.request.use((config) => {
  const token = globalThis.localStorage.getItem('TOKEN')

  if (token) {
    config.headers.token = token
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse

    if (data.code === 401) {
      showError(data.message || '登录状态已过期，请重新登录')
      notifyAuthExpired()
      return Promise.reject(new Error(data.message || 'Token expired'))
    }

    if (data.code === 403) {
      showError(data.message || '没有权限执行此操作')
      return Promise.reject(new Error(data.message || 'Forbidden'))
    }

    return response.data
  },
  (error) => {
    const status = error.response?.status
    let message = '网络连接异常，请稍后重试'

    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else if (!error.response) {
      message = '无法连接服务器，请检查网络'
    } else {
      switch (status) {
        case 401:
          message = '登录状态已过期，请重新登录'
          notifyAuthExpired()
          break
        case 403:
          message = '没有权限访问此资源'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
      }
    }

    showError(message)
    return Promise.reject(error)
  },
)

export default request
