<template>
  <div class="auth-container">
    <div class="auth-form">
      <div class="auth-header">
        <h2 class="auth-title">基于多模态大模型的个性化处方生成系统</h2>
        <p>登录您的账号</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
        
        <div class="text-center">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

export default {
  name: 'LoginView',
  
  setup() {
    const userStore = useUserStore()
    const loginFormRef = ref(null)
    const loading = ref(false)
    
    const loginForm = reactive({
      username: 'admin',
      password: 'admin123'
    })
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
      ]
    }
    
    const handleLogin = () => {
      loginFormRef.value.validate(async (valid) => {
        if (!valid) return
        
        try {
          loading.value = true
          await userStore.loginAction(loginForm)
        } catch (error) {
          console.error('登录失败:', error)
          ElMessage.error('登录失败，请检查用户名和密码')
        } finally {
          loading.value = false
        }
      })
    }
    
    return {
      loginForm,
      rules,
      loginFormRef,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.submit-btn {
  margin-top: 10px;
}
</style> 