<template>
  <div class="prescription-tab">
    <div class="tab-header">
      <h3>处方记录</h3>
      <el-button type="primary" @click="openUploadDialog">
        <el-icon><Upload /></el-icon> 上传处方
      </el-button>
    </div>
    
    <!-- 处方记录列表 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="!prescriptions.length" class="empty-data">
      <el-empty description="暂无处方记录">
        <template #image>
          <el-icon class="empty-icon"><Document /></el-icon>
        </template>
        <el-button type="primary" @click="openUploadDialog">上传处方</el-button>
      </el-empty>
    </div>
    
    <div v-else class="prescriptions-list">
      <el-collapse accordion>
        <el-collapse-item 
          v-for="(item, index) in prescriptions" 
          :key="index"
          :name="index"
        >
          <template #title>
            <div class="collapse-title">
              <div class="title-left">
                <span class="prescription-name">{{ item.disease }}</span>
                <el-tag size="small" :type="item.status === '进行中' ? 'success' : 'info'" effect="plain">
                  {{ item.status }}
                </el-tag>
              </div>
              <span class="prescription-date">{{ item.date }}</span>
            </div>
          </template>
          <div class="prescription-content">
            <el-descriptions :column="2" border class="prescription-info">
              <el-descriptions-item label="开方医院" span="2">{{ item.hospital }}</el-descriptions-item>
              <el-descriptions-item label="科室">{{ item.department }}</el-descriptions-item>
              <el-descriptions-item label="医师">{{ item.doctor }}</el-descriptions-item>
              <el-descriptions-item label="诊断" span="2">{{ item.diagnosis }}</el-descriptions-item>
            </el-descriptions>
            
            <div class="medications-section">
              <h4>药品清单</h4>
              <el-table :data="item.medications" border style="width: 100%" size="small">
                <el-table-column prop="name" label="药品名称" min-width="150" />
                <el-table-column prop="specification" label="规格" width="120" />
                <el-table-column prop="dosage" label="用量" width="120" />
                <el-table-column prop="frequency" label="用法" width="150" />
                <el-table-column prop="duration" label="疗程" width="100" />
                <el-table-column prop="notes" label="用药说明" min-width="180" show-overflow-tooltip />
              </el-table>
            </div>
            
            <div class="prescription-footer">
              <div class="notes-section" v-if="item.notes">
                <h4>处方备注</h4>
                <p>{{ item.notes }}</p>
              </div>
              
              <div class="prescription-actions">
                <el-button type="primary" link @click.stop="previewPrescription(item)">
                  <el-icon><View /></el-icon> 查看处方
                </el-button>
                <el-button type="success" link @click.stop="downloadPrescription(item)">
                  <el-icon><Download /></el-icon> 下载处方
                </el-button>
                <el-popconfirm
                  title="确定要删除这条处方记录吗？"
                  @confirm="deletePrescription(index)"
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
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <!-- 上传处方对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传处方"
      width="650px"
    >
      <el-form :model="uploadForm" ref="uploadFormRef" :rules="uploadRules" label-width="100px">
        <el-form-item label="疾病名称" prop="disease">
          <el-input v-model="uploadForm.disease" placeholder="请输入疾病名称" />
        </el-form-item>
        <el-form-item label="处方日期" prop="date">
          <el-date-picker
            v-model="uploadForm.date"
            type="date"
            placeholder="选择处方日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="uploadForm.status" placeholder="请选择处方状态" style="width: 100%">
            <el-option label="已完成" value="已完成" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已停用" value="已停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="开方医院" prop="hospital">
          <el-input v-model="uploadForm.hospital" placeholder="请输入医院名称" />
        </el-form-item>
        <el-form-item label="科室" prop="department">
          <el-input v-model="uploadForm.department" placeholder="请输入科室名称" />
        </el-form-item>
        <el-form-item label="医师" prop="doctor">
          <el-input v-model="uploadForm.doctor" placeholder="请输入医师姓名" />
        </el-form-item>
        <el-form-item label="诊断" prop="diagnosis">
          <el-input v-model="uploadForm.diagnosis" placeholder="请输入诊断结果" />
        </el-form-item>
        
        <el-divider>药品清单</el-divider>
        
        <div v-for="(drug, drugIndex) in uploadForm.medications" :key="drugIndex" class="medication-item">
          <div class="medication-header">
            <h4>药品 {{ drugIndex + 1 }}</h4>
            <el-button 
              type="danger" 
              circle 
              size="small"
              @click="removeMedication(drugIndex)"
              v-if="uploadForm.medications.length > 1"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          
          <el-form-item :label="'药品名称'" :prop="`medications.${drugIndex}.name`" :rules="{ required: true, message: '请输入药品名称', trigger: 'blur' }">
            <el-input v-model="drug.name" placeholder="请输入药品名称" />
          </el-form-item>
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item :label="'规格'" :prop="`medications.${drugIndex}.specification`">
                <el-input v-model="drug.specification" placeholder="请输入规格" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="'用量'" :prop="`medications.${drugIndex}.dosage`">
                <el-input v-model="drug.dosage" placeholder="如: 每次1片" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item :label="'用法'" :prop="`medications.${drugIndex}.frequency`">
                <el-input v-model="drug.frequency" placeholder="如: 一日三次" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="'疗程'" :prop="`medications.${drugIndex}.duration`">
                <el-input v-model="drug.duration" placeholder="如: 7天" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item :label="'用药说明'" :prop="`medications.${drugIndex}.notes`">
            <el-input v-model="drug.notes" placeholder="请输入用药说明" />
          </el-form-item>
          
          <el-divider v-if="drugIndex < uploadForm.medications.length - 1" />
        </div>
        
        <div class="add-medication">
          <el-button type="primary" plain @click="addMedication" icon="Plus">添加药品</el-button>
        </div>
        
        <el-form-item label="处方备注" prop="notes">
          <el-input v-model="uploadForm.notes" type="textarea" :rows="2" placeholder="请输入处方备注信息" />
        </el-form-item>
        
        <el-form-item label="上传处方" prop="file">
          <el-upload
            class="upload-zone"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽处方文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持PDF、JPG、PNG格式，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="uploadLoading">上传</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 处方预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="currentPrescription?.disease"
      width="70%"
    >
      <div class="preview-container">
        <div v-if="previewLoading" class="preview-loading">
          <el-icon class="preview-loading-icon"><Loading /></el-icon>
          <p>处方加载中...</p>
        </div>
        <img v-else :src="previewUrl" class="preview-image" alt="处方图片" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'PrescriptionTab',
  
  setup() {
    const loading = ref(true)
    const prescriptions = ref([])
    const uploadDialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const uploadLoading = ref(false)
    const previewLoading = ref(false)
    const fileList = ref([])
    const currentPrescription = ref(null)
    const previewUrl = ref('')
    
    const uploadFormRef = ref(null)
    const uploadForm = reactive({
      disease: '',
      date: '',
      status: '',
      hospital: '',
      department: '',
      doctor: '',
      diagnosis: '',
      medications: [
        {
          name: '',
          specification: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }
      ],
      notes: '',
      file: null
    })
    
    const uploadRules = {
      disease: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
      date: [{ required: true, message: '请选择处方日期', trigger: 'change' }],
      status: [{ required: true, message: '请选择处方状态', trigger: 'change' }],
      hospital: [{ required: true, message: '请输入医院名称', trigger: 'blur' }],
      doctor: [{ required: true, message: '请输入医师姓名', trigger: 'blur' }]
    }
    
    // 获取处方记录列表
    const fetchPrescriptions = () => {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        prescriptions.value = [
          {
            disease: '高血压',
            date: '2023-08-15',
            status: '进行中',
            hospital: '北京协和医院',
            department: '心内科',
            doctor: '王医生',
            diagnosis: '原发性高血压2级，高危',
            medications: [
              {
                name: '缬沙坦胶囊',
                specification: '80mg*7片',
                dosage: '每次1片',
                frequency: '每日1次',
                duration: '长期',
                notes: '早晨饭后服用'
              },
              {
                name: '氨氯地平片',
                specification: '5mg*7片',
                dosage: '每次1片',
                frequency: '每日1次',
                duration: '长期',
                notes: '晚上睡前服用'
              }
            ],
            notes: '血压控制目标：<130/80mmHg，每周自测血压至少2次，记录并下次就诊时带来。'
          },
          {
            disease: '糖尿病',
            date: '2023-07-10',
            status: '进行中',
            hospital: '北京301医院',
            department: '内分泌科',
            doctor: '李医生',
            diagnosis: '2型糖尿病',
            medications: [
              {
                name: '盐酸二甲双胍片',
                specification: '0.5g*10片',
                dosage: '每次1片',
                frequency: '每日3次',
                duration: '长期',
                notes: '饭后服用'
              }
            ],
            notes: '控制饮食，减少碳水化合物摄入，增加运动，每周至少快走3次，每次30分钟。'
          }
        ]
        loading.value = false
      }, 1000)
    }
    
    // 打开上传对话框
    const openUploadDialog = () => {
      // 重置表单数据
      uploadForm.disease = ''
      uploadForm.date = ''
      uploadForm.status = ''
      uploadForm.hospital = ''
      uploadForm.department = ''
      uploadForm.doctor = ''
      uploadForm.diagnosis = ''
      uploadForm.medications = [
        {
          name: '',
          specification: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }
      ]
      uploadForm.notes = ''
      uploadForm.file = null
      
      fileList.value = []
      uploadDialogVisible.value = true
    }
    
    // 添加药品
    const addMedication = () => {
      uploadForm.medications.push({
        name: '',
        specification: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      })
    }
    
    // 移除药品
    const removeMedication = (index) => {
      uploadForm.medications.splice(index, 1)
    }
    
    // 处理文件变化
    const handleFileChange = (file) => {
      uploadForm.file = file.raw
    }
    
    // 提交上传
    const submitUpload = async () => {
      if (!uploadFormRef.value) return
      
      await uploadFormRef.value.validate(async (valid) => {
        if (valid) {
          if (!uploadForm.file) {
            ElMessage.warning('请选择要上传的处方文件')
            return
          }
          
          uploadLoading.value = true
          
          try {
            // 模拟上传过程
            setTimeout(() => {
              // 添加新的处方记录
              const newPrescription = {
                disease: uploadForm.disease,
                date: uploadForm.date.toLocaleDateString(),
                status: uploadForm.status,
                hospital: uploadForm.hospital,
                department: uploadForm.department,
                doctor: uploadForm.doctor,
                diagnosis: uploadForm.diagnosis,
                medications: [...uploadForm.medications],
                notes: uploadForm.notes
              }
              
              prescriptions.value.unshift(newPrescription)
              uploadDialogVisible.value = false
              ElMessage.success('上传成功')
              uploadLoading.value = false
            }, 1500)
          } catch (error) {
            console.error('上传处方失败:', error)
            ElMessage.error('上传失败，请重试')
            uploadLoading.value = false
          }
        }
      })
    }
    
    // 预览处方
    const previewPrescription = (prescription) => {
      currentPrescription.value = prescription
      previewDialogVisible.value = true
      previewLoading.value = true
      
      // 模拟加载预览
      setTimeout(() => {
        // 实际应用中应该是真实的处方图片URL
        previewUrl.value = `https://fakeimg.pl/800x1000/?text=${prescription.disease}处方&font=noto`
        previewLoading.value = false
      }, 1000)
    }
    
    // 下载处方
    const downloadPrescription = (prescription) => {
      // 模拟下载
      ElMessage.success(`开始下载: ${prescription.disease}处方`)
      // 实际项目中应实现真实的下载功能
    }
    
    // 删除处方
    const deletePrescription = (index) => {
      prescriptions.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
    
    onMounted(() => {
      fetchPrescriptions()
    })
    
    return {
      loading,
      prescriptions,
      uploadDialogVisible,
      previewDialogVisible,
      uploadLoading,
      previewLoading,
      fileList,
      currentPrescription,
      previewUrl,
      uploadFormRef,
      uploadForm,
      uploadRules,
      openUploadDialog,
      addMedication,
      removeMedication,
      handleFileChange,
      submitUpload,
      previewPrescription,
      downloadPrescription,
      deletePrescription
    }
  }
}
</script>

<style scoped>
.prescription-tab {
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

.prescriptions-list {
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

.prescription-name {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.prescription-date {
  color: #909399;
  font-size: 14px;
}

.prescription-content {
  padding: 16px 0;
}

.prescription-info {
  margin-bottom: 20px;
}

.medications-section {
  margin-bottom: 20px;
}

.medications-section h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.prescription-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #ebeef5;
}

.notes-section {
  margin-bottom: 16px;
}

.notes-section h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #303133;
}

.notes-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.prescription-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.upload-zone {
  width: 100%;
}

.medication-item {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f9fafc;
  border-radius: 4px;
}

.medication-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.medication-header h4 {
  margin: 0;
  font-size: 15px;
  color: #303133;
}

.add-medication {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.preview-container {
  min-height: 500px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.preview-loading-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 20px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 