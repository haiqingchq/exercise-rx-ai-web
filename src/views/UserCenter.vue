<template>
  <div class="user-center-container">
    <div class="user-center-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-button">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <h2><el-icon><User /></el-icon> 用户中心</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            <el-avatar :size="32" class="user-avatar">{{ userDetail?.username?.charAt(0)?.toUpperCase() || '用' }}</el-avatar>
            {{ userDetail?.username || '用户' }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="chat">
                <el-icon><ChatDotRound /></el-icon> 智能问诊
              </el-dropdown-item>
              <el-dropdown-item command="video">
                <el-icon><Film /></el-icon> 视频解析
              </el-dropdown-item>
              <el-dropdown-item command="patientInfo">
                <el-icon><Document /></el-icon> 患者信息管理
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="user-center-content">
      <el-row :gutter="24">
        <!-- 用户信息卡片 -->
        <el-col :span="12" :offset="6">
          <el-card class="user-info-card" shadow="hover">
            <div class="user-info-header">
              <div class="avatar-container">
                <el-avatar :size="90" :src="userDetail?.avatar" class="user-large-avatar">
                  {{ userDetail?.username?.charAt(0)?.toUpperCase() || '用' }}
                </el-avatar>
                <div class="avatar-edit">
                  <el-button circle type="primary" class="edit-avatar-btn">
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </div>
              </div>
              <h3>{{ userDetail?.realName || userDetail?.username }}</h3>
              <p class="join-date">加入时间: {{ formatDate(userDetail?.joinTime) }}</p>
            </div>
            
            <el-divider />
            
            <div class="user-info-body">
              <el-descriptions :column="1" border class="user-descriptions">
                <el-descriptions-item label="用户名">
                  <span class="description-content">{{ userDetail?.username }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="真实姓名">
                  <span class="description-content">{{ userDetail?.realName || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="性别">
                  <span class="description-content">{{ userDetail?.gender || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="年龄">
                  <span class="description-content">{{ userDetail?.age || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  <span class="description-content">{{ userDetail?.phone || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  <span class="description-content">{{ userDetail?.email || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="地址">
                  <span class="description-content">{{ userDetail?.address || '未设置' }}</span>
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="action-buttons">
                <el-button type="primary" @click="openEditDialog" class="action-btn">
                  <el-icon><Edit /></el-icon>
                  编辑个人信息
                </el-button>
                <el-button type="warning" @click="openChangePasswordDialog" class="action-btn">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 编辑用户信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-form 
        :model="editForm" 
        :rules="editRules" 
        ref="editFormRef" 
        label-width="80px"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="editForm.age" :min="1" :max="120"></el-input-number>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="loading" class="submit-btn">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="500px"
      destroy-on-close
      class="password-dialog"
    >
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef" 
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changePasswordVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitChangePassword" :loading="loading" class="submit-btn">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 二次验证对话框 -->
    <el-dialog
      v-model="verificationVisible"
      title="安全验证"
      width="400px"
      destroy-on-close
      class="verification-dialog"
    >
      <div class="verification-content">
        <p class="verification-tip">为了保障您的账户安全，请进行安全验证</p>
        <el-form 
          :model="verificationForm" 
          :rules="verificationRules" 
          ref="verificationFormRef" 
          label-width="0"
        >
          <el-form-item prop="code">
            <el-input 
              v-model="verificationForm.code" 
              placeholder="请输入验证码"
              maxlength="6"
              class="verification-input"
            >
              <template #append>
                <el-button type="primary" :disabled="cooldown > 0" @click="sendVerificationCode">
                  {{ cooldown > 0 ? `${cooldown}秒后重试` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelVerification" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="confirmVerification" :loading="loading" class="submit-btn">
            验证
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useUserCenterStore } from '../store/user-center'
import { ElMessage } from 'element-plus'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const userCenterStore = useUserCenterStore()

// 响应式数据
const editDialogVisible = ref(false)
const changePasswordVisible = ref(false)
const verificationVisible = ref(false)
const editFormRef = ref(null)
const passwordFormRef = ref(null)
const verificationFormRef = ref(null)
const cooldown = ref(0)

// 表单数据
const editForm = ref({
  realName: '',
  gender: '',
  age: 0,
  phone: '',
  email: '',
  address: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const verificationForm = ref({
  code: ''
})

// 表单校验规则
const editRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

const verificationRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 计算属性
const userDetail = computed(() => userCenterStore.userDetail)
const loading = computed(() => userCenterStore.loading)

// 生命周期钩子
onMounted(async () => {
  await userCenterStore.fetchUserDetail()
})

// 方法
// 返回上一页
const goBack = () => {
  router.back()
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logoutAction()
  } else if (command === 'chat') {
    router.push('/chat')
  } else if (command === 'video') {
    router.push('/video')
  } else if (command === 'patientInfo') {
    router.push('/patient-info')
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 打开编辑对话框
const openEditDialog = () => {
  editForm.value = {
    realName: userDetail.value?.realName || '',
    gender: userDetail.value?.gender || '男',
    age: userDetail.value?.age || 0,
    phone: userDetail.value?.phone || '',
    email: userDetail.value?.email || '',
    address: userDetail.value?.address || ''
  }
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    const result = await userCenterStore.updateUserInfo(editForm.value)
    if (result) {
      editDialogVisible.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  changePasswordVisible.value = true
}

// 提交修改密码
const submitChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    // 打开二次验证对话框
    verificationForm.value = { code: '' }
    changePasswordVisible.value = false
    verificationVisible.value = true
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 发送验证码
const sendVerificationCode = () => {
  if (cooldown.value > 0) return
  
  // 模拟发送验证码
  ElMessage.success('验证码已发送至您的手机')
  
  // 启动倒计时
  cooldown.value = 60
  const timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 确认验证
const confirmVerification = async () => {
  if (!verificationFormRef.value) return
  
  try {
    await verificationFormRef.value.validate()
    
    // 模拟验证过程
    ElMessage.success('密码修改成功')
    verificationVisible.value = false
  } catch (error) {
    console.error('验证失败:', error)
  }
}

// 取消验证
const cancelVerification = () => {
  verificationVisible.value = false
  // 可以选择是否重新打开修改密码对话框
  // changePasswordVisible.value = true
}
</script>

<style lang="scss" scoped>
.user-center-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafc;
  background-image: 
    radial-gradient(#e4f0ff 1px, transparent 1px),
    radial-gradient(#e4f0ff 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  overflow: hidden;
}

.user-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 24px;
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        font-size: 22px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .back-button {
      display: flex;
      align-items: center;
      color: white;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 6px 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateX(-2px);
      }

      .el-icon {
        margin-right: 4px;
      }
    }
  }
  
  .user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
    font-size: 14px;
    color: white;
    background: rgba(255, 255, 255, 0.15);
    padding: 6px 12px;
    border-radius: 20px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .user-avatar {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-weight: 600;
    }
  }
}

.user-center-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.user-info-card {
  height: 100%;
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .user-info-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    background: linear-gradient(to bottom, #f0f6ff, #ffffff);
    
    .avatar-container {
      position: relative;
      margin-bottom: 8px;

      .user-large-avatar {
        background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
        color: white;
        font-weight: 600;
        font-size: 36px;
        box-shadow: 0 6px 16px rgba(38, 126, 255, 0.3);
        border: 4px solid white;
      }

      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;

        .edit-avatar-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          font-size: 14px;
          background: #267eff;
          border: 2px solid white;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }
      }

      &:hover .edit-avatar-btn {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    h3 {
      margin: 16px 0 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
    
    .join-date {
      margin: 8px 0 0;
      font-size: 14px;
      color: #909399;
    }
  }
  
  .user-info-body {
    padding: 0 16px 24px;
    
    .user-descriptions {
      margin-top: 16px;

      :deep(.el-descriptions__label) {
        background-color: #f5f7fa;
        color: #606266;
        font-weight: 500;
      }

      .description-content {
        color: #303133;
      }
    }
    
    .action-buttons {
      margin-top: 24px;
      display: flex;
      justify-content: center;
      gap: 16px;

      .action-btn {
        border-radius: 10px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
}

.edit-dialog, .password-dialog, .verification-dialog {
  :deep(.el-dialog__header) {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid #ebeef5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.verification-content {
  .verification-tip {
    margin-bottom: 20px;
    color: #606266;
    font-size: 14px;
    text-align: center;
  }

  .verification-input {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .cancel-btn {
    border-radius: 8px;
  }

  .submit-btn {
    background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
    border: none;
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
    }
  }
}

@media screen and (max-width: 768px) {
  .user-center-header {
    padding: 12px 16px;
    
    .header-left {
      gap: 8px;
      
      h2 {
        font-size: 18px;
      }
    }
  }

  .user-center-content {
    padding: 16px;
  }

  .el-row {
    flex-direction: column;
    
    .el-col {
      width: 100%;
      max-width: 100%;
      flex: 0 0 100%;
    }
  }

  .user-info-card {
    margin-bottom: 16px;
  }

  .user-info-card .user-info-header {
    padding: 24px 0;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
    
    .action-btn {
      width: 100%;
    }
  }
}
</style> 