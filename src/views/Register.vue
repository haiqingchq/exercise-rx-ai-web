<template>
  <div class="auth-container">
    <div class="auth-form">
      <div class="auth-header">
        <h2 class="auth-title">基于多模态大模型的个性化处方生成系统</h2>
        <p>注册新账号</p>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号码" prefix-icon="Phone" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister" style="width: 100%">注册</el-button>
        </el-form-item>
        
        <div class="text-center">
          <span>已有账号？</span>
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { register } from '../api/auth'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  
  setup() {
    const router = useRouter()
    const registerFormRef = ref(null)
    const loading = ref(false)
    
    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      phone: ''
    })
    
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (registerForm.confirmPassword !== '') {
          registerFormRef.value.validateField('confirmPassword')
        }
        callback()
      }
    }
    
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    
    const validatePhone = (rule, value, callback) => {
      const reg = /^1[3-9]\d{9}$/
      if (value === '') {
        callback(new Error('请输入手机号码'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
        { validator: validatePass, trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validatePass2, trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { validator: validatePhone, trigger: 'blur' }
      ]
    }
    
    const handleRegister = () => {
      registerFormRef.value.validate(async (valid) => {
        if (!valid) return
        
        try {
          loading.value = true
          
          // eslint-disable-next-line no-unused-vars
          const { confirmPassword, ...registerData } = registerForm
          await register(registerData)
          
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } catch (error) {
          console.error('注册失败:', error)
          ElMessage.error('注册失败，请稍后重试')
        } finally {
          loading.value = false
        }
      })
    }
    
    return {
      registerForm,
      rules,
      registerFormRef,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.submit-btn {
  margin-top: 10px;
}
</style> 