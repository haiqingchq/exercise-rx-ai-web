import { defineStore } from 'pinia'
import { getPatientByUserId } from '../api/patient'
import { ElMessage } from 'element-plus'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patientId: null,
    patientInfo: null,
    loading: false
  }),
  
  getters: {
    hasPatientInfo: (state) => !!state.patientId
  },
  
  actions: {
    // 根据用户ID获取患者信息
    async fetchPatientInfoByUserId(userId) {
      try {
        if (!userId) {
          ElMessage.warning('未获取到用户ID，无法获取患者信息')
          return null
        }
        
        this.loading = true
        const response = await getPatientByUserId(userId)
        
        if (response.code === 200 && response.data) {
          this.patientId = response.data.id
          this.patientInfo = response.data
          return response.data
        } else {
          ElMessage.warning('未找到患者信息')
          return null
        }
      } catch (error) {
        console.error('获取患者信息失败:', error)
        ElMessage.error('获取患者信息失败')
        return null
      } finally {
        this.loading = false
      }
    },
    
    // 清空患者信息
    clearPatientInfo() {
      this.patientId = null
      this.patientInfo = null
    }
  }
}) 