import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const http = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:10001/api/backend',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 打印环境变量 - 使用warn确保不被过滤
console.warn('⚠️ 环境变量信息:', {
  NODE_ENV: process.env.NODE_ENV,
  VUE_APP_API_URL: process.env.VUE_APP_API_URL,
  BASE_URL: http.defaults.baseURL
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 获取token，并将其添加到请求头中
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 打印请求信息 - 使用warn确保不被过滤
    console.log('🔄 ===== 请求信息开始 =====')
    console.log('请求方法:', config.method)
    console.log('baseURL:', config.baseURL)
    console.log('url:', config.url)
    console.log('请求路径:', `${config.url}`)
    console.log('请求头:', JSON.stringify(config.headers))
    console.log('请求参数:', config.params || config.data)
    console.log('===== 请求信息结束 =====')
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 打印响应信息 - 使用warn确保不被过滤
    console.warn('✅ ===== 响应信息开始 =====')
    console.warn('响应状态:', response.status)
    console.warn('响应状态文本:', response.statusText)
    console.warn('响应数据:', response.data)
    console.warn('===== 响应信息结束 =====')
    
    const res = response.data
    
    // 如果响应成功但业务状态码不为200，显示错误信息
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      
      // 如果是401，说明token已过期或无效，需要重新登录
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    console.error('错误详情:', {
      message: error.message,
      config: error.config,
      response: error.response
    })
    
    // 处理HTTP错误状态码
    if (error.response) {
      const status = error.response.status
      let message = '未知错误'
      
      if (status === 400) {
        message = '请求参数错误'
      } else if (status === 401) {
        message = '未授权，请重新登录'
        localStorage.removeItem('token')
        router.push('/login')
      } else if (status === 403) {
        message = '拒绝访问'
      } else if (status === 404) {
        message = '请求地址出错'
      } else if (status === 500) {
        message = '服务器内部错误'
      }
      
      ElMessage.error(message)
    } else {
      ElMessage.error('网络异常，请检查您的网络连接')
    }
    
    return Promise.reject(error)
  }
)

// 确认http模块导出前的日志
console.warn('HTTP模块导出前，拦截器已设置完成')

export default http 