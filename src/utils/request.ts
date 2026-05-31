import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.token = token
  }

  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    let message = '网络出现问题'

    switch (status) {
      case 401:
        message = 'Token 已过期'
        break
      case 403:
        message = '无权访问'
        break
      case 404:
        message = '请求地址错误'
        break
      case 500:
        message = '服务器错误'
        break
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default request
