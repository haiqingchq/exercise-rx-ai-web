<template>
  <div class="basic-info-tab">
    <div class="tab-header">
      <h3>患者基本信息</h3>
      <el-button type="primary" @click="openEditDialog" class="edit-btn">
        <el-icon><Edit /></el-icon> 编辑信息
      </el-button>
    </div>
    
    <el-card class="info-card" shadow="hover">
      <el-descriptions
        :column="2"
        border
        class="descriptions"
      >
        <el-descriptions-item label="姓名">{{ patientInfo.name || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ patientInfo.gender || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ patientInfo.age || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ patientInfo.birthDate || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ patientInfo.idCard || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="血型">{{ patientInfo.bloodType || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="婚姻状况">{{ patientInfo.maritalStatus || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="职业">{{ patientInfo.occupation || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ patientInfo.phone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ patientInfo.emergencyContact || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系电话">{{ patientInfo.emergencyPhone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="家庭住址" :span="2">{{ patientInfo.address || '未填写' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 编辑信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑患者基本信息"
      width="600px"
    >
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="formData.age" :min="0" :max="150" placeholder="请输入年龄" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="formData.birthDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="血型" prop="bloodType">
          <el-select v-model="formData.bloodType" placeholder="请选择血型" style="width: 100%">
            <el-option label="A型" value="A型" />
            <el-option label="B型" value="B型" />
            <el-option label="AB型" value="AB型" />
            <el-option label="O型" value="O型" />
            <el-option label="未知" value="未知" />
          </el-select>
        </el-form-item>
        <el-form-item label="婚姻状况" prop="maritalStatus">
          <el-select v-model="formData.maritalStatus" placeholder="请选择婚姻状况" style="width: 100%">
            <el-option label="未婚" value="未婚" />
            <el-option label="已婚" value="已婚" />
            <el-option label="离异" value="离异" />
            <el-option label="丧偶" value="丧偶" />
          </el-select>
        </el-form-item>
        <el-form-item label="职业" prop="occupation">
          <el-input v-model="formData.occupation" placeholder="请输入职业" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="紧急联系人" prop="emergencyContact">
          <el-input v-model="formData.emergencyContact" placeholder="请输入紧急联系人" />
        </el-form-item>
        <el-form-item label="紧急联系电话" prop="emergencyPhone">
          <el-input v-model="formData.emergencyPhone" placeholder="请输入紧急联系电话" />
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="formData.address" type="textarea" :rows="2" placeholder="请输入家庭住址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPatientByUserId, updatePatient } from '../../api/patient'
import { useUserStore } from '../../store/user'

export default {
  name: 'BasicInfoTab',
  
  setup() {
    const userStore = useUserStore()
    const patientId = ref(null)
    
    const patientInfo = ref({
      name: '',
      gender: '',
      age: '',
      birthDate: '',
      idCard: '',
      bloodType: '',
      maritalStatus: '',
      occupation: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
      address: ''
    })
    
    const formData = reactive({...patientInfo.value})
    const formRef = ref(null)
    const dialogVisible = ref(false)
    const loading = ref(false)
    
    const rules = {
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
    }
    
    // 获取患者基本信息
    const fetchPatientInfo = async () => {
      try {
        loading.value = true
        // 使用当前登录用户的ID获取患者信息
        const userId = userStore.userInfo?.id
        if (!userId) {
          ElMessage.warning('未获取到用户信息，请重新登录')
          return
        }
        
        const response = await getPatientByUserId(userId)
        if (response.code === 200 && response.data) {
          patientId.value = response.data.id
          // 将API返回的数据映射到组件的数据模型
          patientInfo.value = {
            name: response.data.name || '',
            gender: response.data.gender || '',
            age: calculateAge(response.data.birth_date) || '',
            birthDate: response.data.birth_date || '',
            idCard: response.data.id_card || '',
            bloodType: response.data.blood_type || '',
            maritalStatus: response.data.marital_status || '',
            occupation: response.data.occupation || '',
            phone: response.data.phone || '',
            emergencyContact: response.data.emergency_contact || '',
            emergencyPhone: response.data.emergency_phone || '',
            address: response.data.address || ''
          }
        } else {
          ElMessage.warning('未找到患者信息')
        }
      } catch (error) {
        console.error('获取患者基本信息失败:', error)
        ElMessage.error('获取患者信息失败')
      } finally {
        loading.value = false
      }
    }
    
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
    
    // 打开编辑对话框
    const openEditDialog = () => {
      Object.assign(formData, patientInfo.value)
      dialogVisible.value = true
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            if (!patientId.value) {
              ElMessage.error('未找到患者ID，无法更新信息')
              loading.value = false
              return
            }
            
            // 将表单数据转换为API所需格式
            const patientData = {
              name: formData.name,
              gender: formData.gender,
              birth_date: formData.birthDate,
              id_card: formData.idCard,
              blood_type: formData.bloodType,
              marital_status: formData.maritalStatus,
              occupation: formData.occupation,
              phone: formData.phone,
              emergency_contact: formData.emergencyContact,
              emergency_phone: formData.emergencyPhone,
              address: formData.address
            }
            
            // 调用API更新患者信息
            const response = await updatePatient(patientId.value, patientData)
            
            if (response.code === 200) {
              // 更新成功后更新页面显示的数据
              Object.assign(patientInfo.value, formData)
              dialogVisible.value = false
              ElMessage.success('保存成功')
            } else {
              ElMessage.error(response.message || '保存失败')
            }
          } catch (error) {
            console.error('保存患者基本信息失败:', error)
            ElMessage.error('保存失败，请重试')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    onMounted(() => {
      fetchPatientInfo()
    })
    
    return {
      patientInfo,
      formData,
      formRef,
      dialogVisible,
      loading,
      rules,
      openEditDialog,
      submitForm
    }
  }
}
</script>

<style scoped>
.basic-info-tab {
  padding: 16px 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-card {
  margin-bottom: 24px;
}

.descriptions :deep(.el-descriptions__label) {
  width: 120px;
}

.descriptions :deep(.el-descriptions__content) {
  padding: 12px 16px;
  line-height: 1.6;
}
</style> 