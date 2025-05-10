<template>
  <div class="header-nav">
    <div class="header-left">
      <el-button v-if="showBack" type="text" @click="goBack" class="back-button">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
      <div class="page-title">
        <el-icon v-if="icon"><component :is="icon" /></el-icon>
        <h2>{{ title }}</h2>
      </div>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-dropdown">
          <el-avatar v-if="showAvatar" :size="32" class="user-avatar">{{ userInfo?.username?.charAt(0) || '用' }}</el-avatar>
          {{ userInfo?.username || '用户' }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="showClearChat" command="clearChat">
              <el-icon><Delete /></el-icon> 清空聊天记录
            </el-dropdown-item>
            
            <el-dropdown-item v-if="currentRoute !== 'Chat'" command="chat">
              <el-icon><ChatDotRound /></el-icon> 智能问诊
            </el-dropdown-item>
            
            <el-dropdown-item v-if="currentRoute !== 'PatientInfo'" command="patientInfo">
              <el-icon><Document /></el-icon> 患者信息管理
            </el-dropdown-item>
            
            <el-dropdown-item v-if="currentRoute !== 'RehabPrescription'" command="rehabPrescription">
              <el-icon><Briefcase /></el-icon> 运动康复处方生成
            </el-dropdown-item>
            
            <el-dropdown-item v-if="currentRoute !== 'UserCenter'" command="userCenter">
              <el-icon><User /></el-icon> 用户中心
            </el-dropdown-item>
            
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../store/user'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'HeaderNav',
  
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    showClearChat: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    const userInfo = computed(() => userStore.userInfo)
    const currentRoute = computed(() => route.name)
    
    // 处理下拉菜单命令
    const handleCommand = async (command) => {
      if (command === 'logout') {
        try {
          await ElMessageBox.confirm(
            '确定要退出登录吗？',
            '退出登录',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )
          await userStore.logoutAction()
          router.push('/login')
        } catch (error) {
          // 用户取消了确认对话框
          console.log('用户取消了退出登录操作')
        }
      } else if (command === 'chat') {
        router.push('/chat')
      } else if (command === 'patientInfo') {
        router.push('/patient-info')
      } else if (command === 'rehabPrescription') {
        router.push('/rehab-prescription')
      } else if (command === 'userCenter') {
        router.push('/user-center')
      } else if (command === 'clearChat') {
        emit('clearChat')
      }
    }
    
    // 返回上一页
    const goBack = () => {
      router.back()
    }
    
    return {
      userInfo,
      currentRoute,
      handleCommand,
      goBack
    }
  }
}
</script>

<style scoped>
.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 15px;
  font-size: 14px;
}

.page-title {
  display: flex;
  align-items: center;
}

.page-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  margin-left: 5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.user-avatar {
  margin-right: 8px;
  background-color: var(--el-color-primary);
  color: #fff;
}

.el-icon {
  margin-left: 4px;
}
</style> 