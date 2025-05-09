<template>
  <div class="patient-info-container">
    <header-nav 
      title="患者信息管理" 
      icon="Folder" 
      :show-back="true"
    />
    
    <div class="patient-info-action">
      <el-button 
        type="primary" 
        @click="goToRehabPrescription"
      >
        <el-icon><Briefcase /></el-icon>
        运动康复处方生成
      </el-button>
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
import HeaderNav from '../components/common/HeaderNav.vue'

export default {
  name: 'PatientInfo',
  
  components: {
    BasicInfoTab,
    MedicalHistoryTab,
    LabReportsTab,
    MedicalImagingTab,
    PrescriptionTab,
    AllergiesTab,
    HeaderNav
  },
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const activeTab = ref('basic')
    const userInfo = computed(() => userStore.userInfo)
    
    const goToRehabPrescription = () => {
      router.push('/rehab-prescription')
    }
    
    onMounted(async () => {
      await userStore.fetchUserInfo()
    })
    
    return {
      activeTab,
      userInfo,
      goToRehabPrescription
    }
  }
}
</script>

<style scoped>
.patient-info-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.patient-info-action {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.patient-info-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.patient-tabs {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>