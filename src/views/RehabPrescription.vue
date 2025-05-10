<template>
  <div class="rehab-prescription-container">
    <header-nav 
      title="运动康复处方生成中心" 
      icon="Briefcase" 
      :show-back="true"
    />
    
    <div class="rehab-prescription-content">
      <div class="content-layout">
        <!-- 左侧患者信息面板 (占页面1/3宽度) -->
        <div class="patient-info-panel">
          <h3>患者聚合信息</h3>
          
          <template v-if="patientInfo">
            <div class="patient-info-content">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="姓名">{{ patientInfo.name || '未填写' }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ patientInfo.gender || '未填写' }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ calculateAge(patientInfo.birth_date) || '未填写' }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ patientInfo.phone || '未填写' }}</el-descriptions-item>
                <el-descriptions-item label="主要症状">待聚合</el-descriptions-item>
                <el-descriptions-item label="既往病史">待聚合</el-descriptions-item>
                <el-descriptions-item label="体检结果">待聚合</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
          
          <template v-else>
            <div class="patient-info-placeholder">
              <el-empty description="暂无患者信息" />
            </div>
          </template>
          
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
import { useUserStore } from '../store/user'
import { usePatientStore } from '../store/patient'
import { ElMessage } from 'element-plus'
import HeaderNav from '../components/common/HeaderNav.vue'

export default {
  name: 'RehabPrescription',
  
  components: {
    HeaderNav
  },
  
  setup() {
    const userStore = useUserStore()
    const patientStore = usePatientStore()
    
    const userInfo = computed(() => userStore.userInfo)
    const patientId = computed(() => patientStore.patientId)
    const patientInfo = computed(() => patientStore.patientInfo)
    const loading = ref(false)
    const aggregating = ref(false)
    const prescriptionContent = ref('')
    
    // 根据出生日期计算年龄
    const calculateAge = (birthDate) => {
      if (!birthDate) return null
      const today = new Date()
      const birthDay = new Date(birthDate)
      let age = today.getFullYear() - birthDay.getFullYear()
      const monthDiff = today.getMonth() - birthDay.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay.getDate())) {
        age--
      }
      
      return age
    }
    
    const fetchPatientInfo = async () => {
      try {
        // 先获取用户信息（确保有最新的用户信息）
        await userStore.fetchUserInfo()
        
        // 如果已经有用户ID，则获取患者信息
        if (userStore.userInfo?.id) {
          await patientStore.fetchPatientInfoByUserId(userStore.userInfo.id)
          
          if (!patientStore.patientId) {
            console.error('未获取到患者ID')
          }
        } else {
          console.error('未获取到用户ID')
        }
      } catch (error) {
        console.error('获取患者信息失败:', error)
      }
    }
    
    const aggregatePatientInfo = async () => {
      if (!patientId.value) {
        ElMessage.warning('未获取到患者信息，请先获取患者信息')
        return
      }
      
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
      if (!patientId.value) {
        ElMessage.warning('未获取到患者信息，无法生成处方')
        return
      }
      
      loading.value = true
      
      try {
        // 这里应该调用API生成处方，传入患者ID
        // const response = await generatePatientPrescription(patientId.value)
        
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
      await fetchPatientInfo()
    })
    
    return {
      userInfo,
      patientId,
      patientInfo,
      loading,
      aggregating,
      prescriptionContent,
      calculateAge,
      aggregatePatientInfo,
      generatePrescription,
      regeneratePrescription
    }
  }
}
</script>

<style scoped>
.rehab-prescription-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.rehab-prescription-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.content-layout {
  display: flex;
  gap: 20px;
  height: 100%;
}

.patient-info-panel {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.patient-info-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 500;
}

.patient-info-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
}

.patient-info-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.panel-footer {
  display: flex;
  justify-content: center;
}

.prescription-panel {
  flex: 2;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.prescription-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.prescription-result {
  padding: 0 10px;
}

.prescription-result h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
}

.prescription-text {
  white-space: pre-line;
  line-height: 1.8;
  font-size: 14px;
  color: #303133;
}

.prescription-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.empty-icon {
  font-size: 48px;
  color: #c0c4cc;
}

@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
  }
}
</style> 