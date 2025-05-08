<template>
  <div class="rehab-prescription-container">
    <div class="rehab-prescription-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-button">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <h2><el-icon><Briefcase /></el-icon> 运动康复处方生成中心</h2>
      </div>
      <div class="header-right">
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
              <el-dropdown-item command="patientInfo">
                <el-icon><Document /></el-icon> 患者信息管理
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
    
    <div class="rehab-prescription-content">
      <div class="content-layout">
        <!-- 左侧患者信息面板 (占页面1/3宽度) -->
        <div class="patient-info-panel">
          <h3>患者聚合信息</h3>
          <div class="patient-info-placeholder">
            <el-empty description="暂无患者信息" />
          </div>
          <div class="panel-footer">
            <el-button 
              type="primary" 
              @click="aggregatePatientInfo"
              :loading="aggregating"
            >
              <el-icon><DataAnalysis /></el-icon>
              聚合
            </el-button>
          </div>
        </div>
        
        <!-- 右侧处方生成面板 (占页面2/3宽度) -->
        <div class="prescription-panel">
          <div class="prescription-content">
            <template v-if="prescriptionContent">
              <div class="prescription-result">
                <h3>运动康复处方</h3>
                <div class="prescription-text">
                  {{ prescriptionContent }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="prescription-placeholder">
                <el-empty description="点击下方按钮生成运动康复处方">
                  <el-icon class="empty-icon"><Files /></el-icon>
                </el-empty>
              </div>
            </template>
          </div>
          
          <div class="action-buttons">
            <el-button 
              type="primary" 
              :loading="loading" 
              @click="generatePrescription"
              :disabled="loading"
            >
              生成运动康复处方
            </el-button>
            <el-button 
              type="info" 
              @click="regeneratePrescription" 
              :disabled="!prescriptionContent || loading"
            >
              重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

export default {
  name: 'RehabPrescription',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const userInfo = computed(() => userStore.userInfo)
    const loading = ref(false)
    const aggregating = ref(false)
    const prescriptionContent = ref('')
    
    const goBack = () => {
      router.back()
    }
    
    const handleCommand = (command) => {
      if (command === 'chat') {
        router.push('/chat')
      } else if (command === 'video') {
        router.push('/video')
      } else if (command === 'patientInfo') {
        router.push('/patient-info')
      } else if (command === 'userCenter') {
        router.push('/user-center')
      } else if (command === 'logout') {
        userStore.logoutAction()
      }
    }
    
    const aggregatePatientInfo = async () => {
      aggregating.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        ElMessage.success('患者信息聚合成功')
      } catch (error) {
        console.error('聚合患者信息失败:', error)
        ElMessage.error('聚合患者信息失败，请重试')
      } finally {
        aggregating.value = false
      }
    }
    
    const generatePrescription = async () => {
      loading.value = true
      
      try {
        // 这里应该调用API生成处方
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        prescriptionContent.value = `1. 针对腰椎间盘突出症患者的康复运动处方：

- 每日进行低强度腰背部肌肉强化训练，每次20分钟
- 每周进行3次髋关节和下肢柔韧性练习，每次15分钟
- 避免高强度弯腰和扭转动作
- 游泳推荐：每周2次，每次30分钟
- 渐进式步行训练：从每天10分钟开始，2周后增加到30分钟

2. 注意事项：
- 运动前需要充分热身
- 若出现明显疼痛应立即停止
- 保持正确姿势，避免加重症状
- 建议在专业康复师指导下进行初始训练`
        
        ElMessage.success('处方生成成功')
      } catch (error) {
        console.error('生成处方失败:', error)
        ElMessage.error('生成处方失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    const regeneratePrescription = async () => {
      prescriptionContent.value = ''
      await generatePrescription()
    }
    
    onMounted(async () => {
      await userStore.fetchUserInfo()
    })
    
    return {
      userInfo,
      loading,
      aggregating,
      prescriptionContent,
      goBack,
      handleCommand,
      aggregatePatientInfo,
      generatePrescription,
      regeneratePrescription
    }
  }
}
</script>

<style scoped>
.rehab-prescription-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafc;
}

.rehab-prescription-header {
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

.rehab-prescription-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-layout {
  display: flex;
  height: calc(100vh - 120px);
  gap: 20px;
}

.patient-info-panel {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.patient-info-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
  font-weight: 600;
  font-size: 16px;
}

.patient-info-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-footer {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.prescription-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.prescription-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.prescription-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #909399;
}

.prescription-result {
  padding: 16px;
}

.prescription-result h3 {
  color: #303133;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 18px;
}

.prescription-text {
  white-space: pre-line;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px 0 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}
</style> 