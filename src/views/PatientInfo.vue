<template>
  <div class="patient-info-container">
    <div class="patient-info-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-button">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <h2><el-icon><Folder /></el-icon> 患者信息管理</h2>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          class="rehab-btn"
          @click="goToRehabPrescription"
        >
          <el-icon><Briefcase /></el-icon>
          运动康复处方生成
        </el-button>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            <el-avatar :size="32" class="user-avatar">{{ userInfo?.username?.charAt(0) || '用' }}</el-avatar>
            {{ userInfo?.username || '用户' }}
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
              <el-dropdown-item command="userCenter">
                <el-icon><User /></el-icon> 用户中心
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="patient-info-content">
      <el-tabs v-model="activeTab" type="card" class="patient-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <basic-info-tab />
        </el-tab-pane>
        <el-tab-pane label="病史记录" name="history">
          <medical-history-tab />
        </el-tab-pane>
        <el-tab-pane label="检验报告" name="lab">
          <lab-reports-tab />
        </el-tab-pane>
        <el-tab-pane label="医学影像" name="imaging">
          <medical-imaging-tab />
        </el-tab-pane>
        <el-tab-pane label="处方记录" name="prescription">
          <prescription-tab />
        </el-tab-pane>
        <el-tab-pane label="过敏信息" name="allergies">
          <allergies-tab />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import BasicInfoTab from '../components/patient/BasicInfoTab.vue'
import MedicalHistoryTab from '../components/patient/MedicalHistoryTab.vue'
import LabReportsTab from '../components/patient/LabReportsTab.vue'
import MedicalImagingTab from '../components/patient/MedicalImagingTab.vue'
import PrescriptionTab from '../components/patient/PrescriptionTab.vue'
import AllergiesTab from '../components/patient/AllergiesTab.vue'

export default {
  name: 'PatientInfo',
  
  components: {
    BasicInfoTab,
    MedicalHistoryTab,
    LabReportsTab,
    MedicalImagingTab,
    PrescriptionTab,
    AllergiesTab
  },
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const activeTab = ref('basic')
    const userInfo = computed(() => userStore.userInfo)
    
    const goBack = () => {
      router.back()
    }
    
    const goToRehabPrescription = () => {
      router.push('/rehab-prescription')
    }
    
    const handleCommand = (command) => {
      if (command === 'chat') {
        router.push('/chat')
      } else if (command === 'video') {
        router.push('/video')
      } else if (command === 'userCenter') {
        router.push('/user-center')
      } else if (command === 'logout') {
        userStore.logoutAction()
      }
    }
    
    onMounted(async () => {
      await userStore.fetchUserInfo()
    })
    
    return {
      activeTab,
      userInfo,
      goBack,
      goToRehabPrescription,
      handleCommand
    }
  }
}
</script>

<style scoped>
.patient-info-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafc;
}

.patient-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 24px;
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h2 .el-icon {
  font-size: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button {
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-button:hover {
  opacity: 0.8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rehab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.rehab-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.patient-info-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.patient-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav) {
  border-radius: 4px;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  font-size: 15px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

:deep(.el-tabs__content) {
  padding: 16px 0;
}
</style> 