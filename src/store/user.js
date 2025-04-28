import { defineStore } from 'pinia'
import { getUserInfo, login, logout } from '../api/auth'
import { ElMessage } from 'element-plus'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    loading: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    // 登录
    async loginAction(loginData) {
      try {
        this.loading = true
        const response = await login(loginData)
        this.token = response.data.token
        localStorage.setItem('token', response.data.token)
        await this.fetchUserInfo()
        ElMessage.success('登录成功')
        router.push('/chat')
        return response
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请重试')
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        if (!this.token) return null
        this.loading = true
        const response = await getUserInfo()
        this.userInfo = response.data
        return response.data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // 退出登录
    async logoutAction() {
      try {
        this.loading = true
        await logout()
        this.resetState()
        ElMessage.success('退出成功')
        router.push('/login')
      } catch (error) {
        console.error('退出失败:', error)
        this.resetState()
        router.push('/login')
      } finally {
        this.loading = false
      }
    },
    
    // 重置状态
    resetState() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    }
  }
}) 