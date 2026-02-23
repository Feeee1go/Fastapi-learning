import axios from 'axios'
import type { AxiosInstance } from 'axios'
import router from '@/router'

// Base API client. 使用 /api 作为基础路径，由 Vite 的代理处理跨域
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器：在需要时注入本地存储的 JWT token
api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      // @ts-ignore
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch {
    // 忽略本地存储访问错误
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器：统一处理 401/403 等状态码（可扩展）
api.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      // 认证失败：清除 token 并跳转登录页
      try {
        localStorage.removeItem('token')
      } catch {}
      router.replace({ name: 'login' }).catch(() => {})
    }
    return Promise.reject(error)
  }
)

export default api
