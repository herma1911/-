import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'

// 创建Pinia实例
const pinia = createPinia()

// 配置axios
axios.defaults.baseURL = '/api'
axios.defaults.timeout = 10000

// 请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 未登录或登录过期，跳转到登录页
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// 创建Vue应用
const app = createApp(App)

// 注册插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 全局属性
app.config.globalProperties.$axios = axios

// 挂载应用
app.mount('#app')