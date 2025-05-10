<template>
  <div class="medical-history-tab">
    <div class="tab-header">
      <h3>病史记录</h3>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon> 添加病史
      </el-button>
    </div>
    
    <!-- 病史列表 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="!historyList.length" class="empty-data">
      <el-empty description="暂无病史记录">
        <template #image>
          <el-icon class="empty-icon"><DocumentRemove /></el-icon>
        </template>
        <el-button type="primary" @click="openAddDialog">添加病史</el-button>
      </el-empty>
    </div>
    
    <div v-else class="history-list">
      <el-collapse accordion>
        <el-collapse-item 
          v-for="(item, index) in historyList" 
          :key="index"
          :name="index"
        >
          <template #title>
            <div class="collapse-title">
              <div class="title-left">
                <span class="disease-name">{{ item.diseaseName }}</span>
                <el-tag size="small" effect="plain" class="diagnosis-tag">{{ item.diagnosisType }}</el-tag>
              </div>
              <span class="diagnosis-date">{{ item.diagnosisDate }}</span>
            </div>
          </template>
          <div class="history-item-content">
            <el-descriptions :column="2" border class="history-descriptions">
              <el-descriptions-item label="确诊医院" span="2">{{ item.hospital }}</el-descriptions-item>
              <el-descriptions-item label="主诊医师">{{ item.doctor }}</el-descriptions-item>
              <el-descriptions-item label="治疗状态">
                <el-tag size="small" :type="getTreatmentTagType(item.treatmentStatus)">
                  {{ item.treatmentStatus }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="症状描述" span="2">{{ item.symptoms }}</el-descriptions-item>
              <el-descriptions-item label="治疗方案" span="2">{{ item.treatment }}</el-descriptions-item>
              <el-descriptions-item label="用药情况" span="2">{{ item.medication }}</el-descriptions-item>
              <el-descriptions-item label="备注" span="2">{{ item.notes || '无' }}</el-descriptions-item>
            </el-descriptions>
            
            <div class="history-actions">
              <el-button type="primary" link @click.stop="editHistory(item, index)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-popconfirm
                title="确定要删除这条病史记录吗？"
                @confirm="deleteHistory(index)"
                confirm-button-type="danger"
                icon="WarningFilled"
                icon-color="#F56C6C"
              >
                <template #reference>
                  <el-button type="danger" link @click.stop>
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </template>
              </el-popconfirm>
              
              <!-- 添加附件按钮 -->
              <el-button type="success" link @click.stop="openUploadDialog(index)">
                <el-icon><Upload /></el-icon> 上传相关资料
              </el-button>
            </div>
            
            <!-- 相关附件列表 -->
            <div v-if="item.attachments && item.attachments.length > 0" class="attachment-list">
              <div class="attachment-header">
                <el-icon><Document /></el-icon> 相关资料
              </div>
              <el-table :data="item.attachments" style="width: 100%" border size="small">
                <el-table-column prop="name" label="文件名" min-width="200" />
                <el-table-column prop="uploadTime" label="上传时间" width="180" />
                <el-table-column prop="size" label="大小" width="100" />
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button type="primary" link size="small">
                      <el-icon><Download /></el-icon> 下载
                    </el-button>
                    <el-button type="danger" link size="small" @click.stop="deleteAttachment(index, scope.$index)">
                      <el-icon><Delete /></el-icon> 删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <!-- 添加或编辑病史对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑病史' : '添加病史'"
      width="650px"
    >
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="疾病名称" prop="diseaseName">
          <el-input v-model="formData.diseaseName" placeholder="请输入疾病名称" />
        </el-form-item>
        <el-form-item label="确诊日期" prop="diagnosisDate">
          <el-date-picker
            v-model="formData.diagnosisDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="诊断类型" prop="diagnosisType">
          <el-select v-model="formData.diagnosisType" placeholder="请选择诊断类型" style="width: 100%">
            <el-option label="初诊" value="初诊" />
            <el-option label="复诊" value="复诊" />
            <el-option label="疑似" value="疑似" />
            <el-option label="确诊" value="确诊" />
            <el-option label="随访" value="随访" />
          </el-select>
        </el-form-item>
        <el-form-item label="确诊医院" prop="hospital">
          <el-input v-model="formData.hospital" placeholder="请输入确诊医院" />
        </el-form-item>
        <el-form-item label="主诊医师" prop="doctor">
          <el-input v-model="formData.doctor" placeholder="请输入主诊医师" />
        </el-form-item>
        <el-form-item label="治疗状态" prop="treatmentStatus">
          <el-select v-model="formData.treatmentStatus" placeholder="请选择治疗状态" style="width: 100%">
            <el-option label="未治疗" value="未治疗" />
            <el-option label="治疗中" value="治疗中" />
            <el-option label="已痊愈" value="已痊愈" />
            <el-option label="长期治疗" value="长期治疗" />
          </el-select>
        </el-form-item>
        <el-form-item label="症状描述" prop="symptoms">
          <el-input v-model="formData.symptoms" type="textarea" :rows="2" placeholder="请描述症状" />
        </el-form-item>
        <el-form-item label="治疗方案" prop="treatment">
          <el-input v-model="formData.treatment" type="textarea" :rows="2" placeholder="请输入治疗方案" />
        </el-form-item>
        <el-form-item label="用药情况" prop="medication">
          <el-input v-model="formData.medication" type="textarea" :rows="2" placeholder="请输入用药情况" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="formData.notes" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 上传资料对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传相关资料"
      width="500px"
    >
      <el-upload
        class="upload-zone"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持PDF、图片、Word、Excel等多种格式文件，单个文件不超过10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="uploadLoading">上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { usePatientStore } from '../../store/patient'
// 暂时注释未使用的API导入，等实际使用时再取消注释
// import { getPatientMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../../api/patient'

export default {
  name: 'MedicalHistoryTab',
  
  setup() {
    const patientStore = usePatientStore()
    const loading = ref(true)
    const historyList = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const editIndex = ref(-1)
    const submitLoading = ref(false)
    const uploadDialogVisible = ref(false)
    const currentHistoryIndex = ref(-1)
    const uploadLoading = ref(false)
    const fileList = ref([])
    
    // 使用计算属性获取患者ID
    const patientId = computed(() => patientStore.patientId)
    
    const formRef = ref(null)
    const formData = reactive({
      diseaseName: '',
      diagnosisDate: '',
      diagnosisType: '',
      hospital: '',
      doctor: '',
      treatmentStatus: '',
      symptoms: '',
      treatment: '',
      medication: '',
      notes: '',
      attachments: []
    })
    
    const rules = {
      diseaseName: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
      diagnosisDate: [{ required: true, message: '请选择确诊日期', trigger: 'change' }],
      diagnosisType: [{ required: true, message: '请选择诊断类型', trigger: 'change' }],
      hospital: [{ required: true, message: '请输入确诊医院', trigger: 'blur' }],
      symptoms: [{ required: true, message: '请描述症状', trigger: 'blur' }]
    }
    
    // 根据治疗状态获取标签类型
    const getTreatmentTagType = (status) => {
      switch (status) {
        case '未治疗':
          return 'warning'
        case '治疗中':
          return 'info'
        case '已痊愈':
          return 'success'
        case '长期治疗':
          return 'danger'
        default:
          return ''
      }
    }
    
    // 获取病史记录列表
    const fetchHistoryList = async () => {
      if (!patientId.value) {
        console.error('未获取到患者ID，无法获取病史记录')
        loading.value = false
        return
      }
      
      loading.value = true
      try {
        // 这里应该替换为实际API调用
        // const response = await getPatientMedicalRecords(patientId.value)
        // if (response.code === 200) {
        //   historyList.value = response.data
        // }
        
        // 模拟API调用（暂时保留模拟数据，待实际API接入后替换）
        setTimeout(() => {
          historyList.value = [
            {
              diseaseName: '高血压',
              diagnosisDate: '2022-03-15',
              diagnosisType: '确诊',
              hospital: '北京协和医院',
              doctor: '王医生',
              treatmentStatus: '长期治疗',
              symptoms: '头晕、头痛、耳鸣，血压持续偏高，收缩压在150mmHg以上',
              treatment: '生活方式干预+药物治疗，控制盐分摄入，增加运动，配合药物治疗',
              medication: '缬沙坦胶囊 80mg，每日1次，晨起服用',
              notes: '需要定期测量血压并记录',
              attachments: [
                { name: '血压检测报告.pdf', uploadTime: '2022-03-16', size: '2.5MB' },
                { name: '心电图检查.jpg', uploadTime: '2022-03-16', size: '1.8MB' }
              ]
            },
            {
              diseaseName: '糖尿病',
              diagnosisDate: '2021-05-20',
              diagnosisType: '确诊',
              hospital: '北京301医院',
              doctor: '李医生',
              treatmentStatus: '长期治疗',
              symptoms: '多饮、多尿、多食、消瘦，空腹血糖偏高',
              treatment: '饮食控制+药物治疗，控制碳水化合物摄入，定期监测血糖',
              medication: '二甲双胍片 0.5g，每日3次，饭后服用',
              notes: '需要定期监测血糖水平，控制饮食',
              attachments: []
            }
          ]
          loading.value = false
        }, 1000)
      } catch (error) {
        console.error('获取病史记录失败:', error)
        ElMessage.error('获取病史记录失败')
        loading.value = false
      }
    }
    
    // 打开添加对话框
    const openAddDialog = () => {
      isEdit.value = false
      editIndex.value = -1
      
      // 重置表单数据
      Object.keys(formData).forEach(key => {
        formData[key] = ''
      })
      formData.attachments = []
      
      dialogVisible.value = true
    }
    
    // 编辑病史
    const editHistory = (item, index) => {
      isEdit.value = true
      editIndex.value = index
      
      // 填充表单数据
      Object.keys(formData).forEach(key => {
        formData[key] = item[key]
      })
      
      dialogVisible.value = true
    }
    
    // 删除病史
    const deleteHistory = (index) => {
      historyList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          if (!patientId.value) {
            ElMessage.error('未获取到患者ID，无法保存病史记录')
            return
          }
          
          submitLoading.value = true
          
          try {
            // 这里应该替换为实际API调用
            // const data = {
            //   patient_id: patientId.value,
            //   disease_name: formData.diseaseName,
            //   diagnosis_date: formData.diagnosisDate,
            //   diagnosis_type: formData.diagnosisType,
            //   hospital: formData.hospital,
            //   doctor: formData.doctor,
            //   treatment_status: formData.treatmentStatus,
            //   symptoms: formData.symptoms,
            //   treatment: formData.treatment,
            //   medication: formData.medication,
            //   notes: formData.notes
            // }
            
            // if (isEdit.value) {
            //   await updateMedicalRecord(historyList.value[editIndex.value].id, data)
            // } else {
            //   await createMedicalRecord(data)
            // }
            
            // 模拟API调用
            setTimeout(() => {
              if (isEdit.value) {
                // 编辑现有记录
                historyList.value[editIndex.value] = { ...formData }
                ElMessage.success('更新成功')
              } else {
                // 添加新记录
                historyList.value.push({ ...formData, attachments: [] })
                ElMessage.success('添加成功')
              }
              
              dialogVisible.value = false
              submitLoading.value = false
            }, 1000)
          } catch (error) {
            console.error('保存病史记录失败:', error)
            ElMessage.error('操作失败，请重试')
            submitLoading.value = false
          }
        }
      })
    }
    
    // 打开上传对话框
    const openUploadDialog = (index) => {
      currentHistoryIndex.value = index
      fileList.value = []
      uploadDialogVisible.value = true
    }
    
    // 处理文件变化
    const handleFileChange = (file) => {
      console.log('文件变化:', file)
    }
    
    // 提交上传
    const submitUpload = () => {
      if (fileList.value.length === 0) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      
      uploadLoading.value = true
      
      // 模拟上传过程
      setTimeout(() => {
        // 添加附件到对应的病史记录
        if (!historyList.value[currentHistoryIndex.value].attachments) {
          historyList.value[currentHistoryIndex.value].attachments = []
        }
        
        fileList.value.forEach(file => {
          historyList.value[currentHistoryIndex.value].attachments.push({
            name: file.name,
            uploadTime: new Date().toLocaleDateString(),
            size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
          })
        })
        
        uploadLoading.value = false
        uploadDialogVisible.value = false
        ElMessage.success('上传成功')
        fileList.value = []
      }, 1500)
    }
    
    // 删除附件
    const deleteAttachment = (historyIndex, attachmentIndex) => {
      historyList.value[historyIndex].attachments.splice(attachmentIndex, 1)
      ElMessage.success('删除成功')
    }
    
    onMounted(() => {
      if (patientId.value) {
        fetchHistoryList()
      } else {
        // 如果患者ID不存在，则等待患者store加载完成
        const unwatch = watch(
          () => patientId.value,
          (newVal) => {
            if (newVal) {
              fetchHistoryList()
              unwatch() // 获取到ID后取消监听
            }
          }
        )
      }
    })
    
    return {
      loading,
      historyList,
      dialogVisible,
      isEdit,
      submitLoading,
      formRef,
      formData,
      rules,
      uploadDialogVisible,
      uploadLoading,
      fileList,
      getTreatmentTagType,
      openAddDialog,
      editHistory,
      deleteHistory,
      submitForm,
      openUploadDialog,
      handleFileChange,
      submitUpload,
      deleteAttachment
    }
  }
}
</script>

<style scoped>
.medical-history-tab {
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

.loading-container {
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-data {
  padding: 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 60px;
  color: #909399;
}

.history-list {
  margin-bottom: 24px;
}

.collapse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.disease-name {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.diagnosis-tag {
  font-size: 12px;
}

.diagnosis-date {
  color: #909399;
  font-size: 14px;
}

.history-item-content {
  padding: 16px 0;
}

.history-descriptions {
  margin-bottom: 16px;
}

.history-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #ebeef5;
}

.attachment-list {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #ebeef5;
}

.attachment-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #606266;
}

.upload-zone {
  width: 100%;
}
</style> 