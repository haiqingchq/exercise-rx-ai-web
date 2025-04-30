<template>
  <div class="lab-reports-tab">
    <div class="tab-header">
      <h3>检验报告</h3>
      <el-button type="primary" @click="openUploadDialog">
        <el-icon><Upload /></el-icon> 上传检验报告
      </el-button>
    </div>
    
    <!-- 检验报告列表 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="!reports.length" class="empty-data">
      <el-empty description="暂无检验报告">
        <template #image>
          <el-icon class="empty-icon"><DocumentRemove /></el-icon>
        </template>
        <el-button type="primary" @click="openUploadDialog">上传检验报告</el-button>
      </el-empty>
    </div>
    
    <div v-else class="reports-list">
      <el-table :data="reports" style="width: 100%" border stripe>
        <el-table-column prop="reportName" label="报告名称" min-width="180">
          <template #default="{row}">
            <div class="report-name-cell">
              <el-icon class="report-icon"><Document /></el-icon>
              <span>{{ row.reportName }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="reportType" label="报告类型" width="120">
          <template #default="{row}">
            <el-tag size="small" :type="getReportTagType(row.reportType)">
              {{ row.reportType }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="examDate" label="检查日期" width="120" sortable />
        
        <el-table-column prop="uploadDate" label="上传日期" width="120" sortable />
        
        <el-table-column prop="hospital" label="检查医院" min-width="150" />
        
        <el-table-column prop="fileFormat" label="文件格式" width="100">
          <template #default="{row}">
            <el-tag size="small" effect="plain">{{ row.fileFormat }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{row, $index}">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="previewReport(row)">
                <el-icon><View /></el-icon> 查看
              </el-button>
              <el-button type="success" link size="small" @click="downloadReport(row)">
                <el-icon><Download /></el-icon> 下载
              </el-button>
              <el-button type="info" link size="small" @click="showReportDetails(row)">
                <el-icon><InfoFilled /></el-icon> 详情
              </el-button>
              <el-popconfirm
                title="确定要删除这个检验报告吗？"
                @confirm="deleteReport($index)"
                confirm-button-type="danger"
                icon="WarningFilled"
                icon-color="#F56C6C"
              >
                <template #reference>
                  <el-button type="danger" link size="small">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传检验报告"
      width="600px"
    >
      <el-form :model="uploadForm" ref="uploadFormRef" :rules="uploadRules" label-width="100px">
        <el-form-item label="报告名称" prop="reportName">
          <el-input v-model="uploadForm.reportName" placeholder="请输入报告名称" />
        </el-form-item>
        
        <el-form-item label="报告类型" prop="reportType">
          <el-select v-model="uploadForm.reportType" placeholder="请选择报告类型" style="width: 100%">
            <el-option label="血常规" value="血常规" />
            <el-option label="尿常规" value="尿常规" />
            <el-option label="生化检查" value="生化检查" />
            <el-option label="免疫检查" value="免疫检查" />
            <el-option label="微生物检查" value="微生物检查" />
            <el-option label="病理检查" value="病理检查" />
            <el-option label="基因检测" value="基因检测" />
            <el-option label="其他检查" value="其他检查" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="检查日期" prop="examDate">
          <el-date-picker
            v-model="uploadForm.examDate"
            type="date"
            placeholder="选择检查日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="检查医院" prop="hospital">
          <el-input v-model="uploadForm.hospital" placeholder="请输入检查医院" />
        </el-form-item>
        
        <el-form-item label="医师备注" prop="doctorComment">
          <el-input
            v-model="uploadForm.doctorComment"
            type="textarea"
            :rows="3"
            placeholder="请输入医师的诊断或备注意见"
          />
        </el-form-item>
        
        <el-form-item label="异常项目" prop="abnormalItems">
          <el-select
            v-model="uploadForm.abnormalItems"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择报告中的异常项目"
            style="width: 100%"
          >
            <el-option
              v-for="item in abnormalOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="上传文件" prop="file">
          <el-upload
            class="upload-zone"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
            accept=".pdf,.jpg,.jpeg,.png,.xml,.doc,.docx,.xls,.xlsx"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持PDF、图片、Word、Excel和XML格式，单个文件不超过20MB
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
    
    <!-- 报告详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="检验报告详情"
      width="700px"
    >
      <template v-if="currentReport">
        <el-descriptions :column="2" border direction="vertical" class="details-descriptions">
          <el-descriptions-item label="报告名称">{{ currentReport.reportName }}</el-descriptions-item>
          <el-descriptions-item label="报告类型">
            <el-tag size="small" :type="getReportTagType(currentReport.reportType)">
              {{ currentReport.reportType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检查日期">{{ currentReport.examDate }}</el-descriptions-item>
          <el-descriptions-item label="上传日期">{{ currentReport.uploadDate }}</el-descriptions-item>
          <el-descriptions-item label="检查医院">{{ currentReport.hospital }}</el-descriptions-item>
          <el-descriptions-item label="文件格式">
            <el-tag size="small" effect="plain">{{ currentReport.fileFormat }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="医师备注" :span="2">
            {{ currentReport.doctorComment || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="currentReport.abnormalItems && currentReport.abnormalItems.length" class="abnormal-items">
          <h4>异常检测项</h4>
          <el-table :data="currentReport.abnormalItems" border style="width: 100%">
            <el-table-column prop="name" label="项目名称" min-width="150" />
            <el-table-column prop="value" label="检测值" width="100" />
            <el-table-column prop="reference" label="参考范围" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{row}">
                <el-tag 
                  size="small" 
                  :type="row.status === '偏高' ? 'danger' : (row.status === '偏低' ? 'warning' : '')"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="preview-actions">
          <el-button type="primary" @click="previewReport(currentReport)">
            <el-icon><View /></el-icon> 查看报告
          </el-button>
          <el-button type="success" @click="downloadReport(currentReport)">
            <el-icon><Download /></el-icon> 下载报告
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="currentReport?.reportName"
      width="80%"
      top="5vh"
      class="preview-dialog"
    >
      <div class="preview-container">
        <div v-if="isPreviewReady" class="preview-content">
          <iframe v-if="isPdf" :src="previewUrl" class="pdf-preview"></iframe>
          <img v-else-if="isImage" :src="previewUrl" class="image-preview" />
          <div v-else class="unsupported-preview">
            <el-icon class="preview-icon"><Document /></el-icon>
            <p>此文件格式不支持在线预览，请下载后查看</p>
            <el-button type="primary" @click="downloadReport(currentReport)">
              <el-icon><Download /></el-icon> 下载报告
            </el-button>
          </div>
        </div>
        <div v-else class="preview-loading">
          <el-icon class="preview-loading-icon"><Loading /></el-icon>
          <p>报告加载中...</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'LabReportsTab',
  
  setup() {
    const loading = ref(true)
    const reports = ref([])
    const uploadDialogVisible = ref(false)
    const detailsDialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const uploadLoading = ref(false)
    const fileList = ref([])
    const currentReport = ref(null)
    const isPreviewReady = ref(false)
    const previewUrl = ref('')
    
    const uploadFormRef = ref(null)
    const uploadForm = reactive({
      reportName: '',
      reportType: '',
      examDate: '',
      hospital: '',
      doctorComment: '',
      abnormalItems: [],
      file: null
    })
    
    const uploadRules = {
      reportName: [{ required: true, message: '请输入报告名称', trigger: 'blur' }],
      reportType: [{ required: true, message: '请选择报告类型', trigger: 'change' }],
      examDate: [{ required: true, message: '请选择检查日期', trigger: 'change' }],
      hospital: [{ required: true, message: '请输入检查医院', trigger: 'blur' }]
    }
    
    // 异常项目选项
    const abnormalOptions = [
      { label: '血红蛋白', value: '血红蛋白' },
      { label: '白细胞', value: '白细胞' },
      { label: '血小板', value: '血小板' },
      { label: '红细胞', value: '红细胞' },
      { label: '血糖', value: '血糖' },
      { label: '甘油三酯', value: '甘油三酯' },
      { label: '总胆固醇', value: '总胆固醇' },
      { label: '高密度脂蛋白', value: '高密度脂蛋白' },
      { label: '低密度脂蛋白', value: '低密度脂蛋白' },
      { label: '尿酸', value: '尿酸' },
      { label: '肌酐', value: '肌酐' },
      { label: '尿素氮', value: '尿素氮' },
      { label: 'ALT', value: 'ALT' },
      { label: 'AST', value: 'AST' },
      { label: '总蛋白', value: '总蛋白' },
      { label: '白蛋白', value: '白蛋白' }
    ]
    
    // 判断当前预览的是否为PDF
    const isPdf = computed(() => {
      return currentReport.value && currentReport.value.fileFormat === 'PDF'
    })
    
    // 判断当前预览的是否为图片
    const isImage = computed(() => {
      const imgFormats = ['JPG', 'JPEG', 'PNG', 'GIF']
      return currentReport.value && imgFormats.includes(currentReport.value.fileFormat)
    })
    
    // 根据报告类型获取标签样式
    const getReportTagType = (type) => {
      const typeMap = {
        '血常规': 'danger',
        '尿常规': 'warning',
        '生化检查': 'success',
        '免疫检查': 'info',
        '微生物检查': 'danger',
        '病理检查': 'warning',
        '基因检测': 'primary',
        '其他检查': ''
      }
      return typeMap[type] || ''
    }
    
    // 获取检验报告列表
    const fetchReports = () => {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        reports.value = [
          {
            id: 1,
            reportName: '血常规检查报告',
            reportType: '血常规',
            examDate: '2023-05-10',
            uploadDate: '2023-05-11',
            hospital: '北京协和医院',
            fileFormat: 'PDF',
            doctorComment: '部分指标异常，建议复查',
            abnormalItems: [
              { name: '血红蛋白', value: '95g/L', reference: '110-160g/L', status: '偏低' },
              { name: '白细胞', value: '11.2×10^9/L', reference: '4-10×10^9/L', status: '偏高' }
            ]
          },
          {
            id: 2,
            reportName: '肝功能检查报告',
            reportType: '生化检查',
            examDate: '2023-04-20',
            uploadDate: '2023-04-22',
            hospital: '北京301医院',
            fileFormat: 'PDF',
            doctorComment: '肝功能正常',
            abnormalItems: []
          },
          {
            id: 3,
            reportName: '尿常规检查报告',
            reportType: '尿常规',
            examDate: '2023-03-15',
            uploadDate: '2023-03-15',
            hospital: '北京中医院',
            fileFormat: 'JPG',
            doctorComment: '',
            abnormalItems: [
              { name: '尿蛋白', value: '1+', reference: '阴性', status: '异常' }
            ]
          }
        ]
        loading.value = false
      }, 1000)
    }
    
    // 打开上传对话框
    const openUploadDialog = () => {
      // 重置表单数据
      Object.keys(uploadForm).forEach(key => {
        uploadForm[key] = ''
      })
      uploadForm.abnormalItems = []
      fileList.value = []
      uploadDialogVisible.value = true
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
            ElMessage.warning('请选择要上传的文件')
            return
          }
          
          uploadLoading.value = true
          
          try {
            // 模拟上传过程
            setTimeout(() => {
              // 获取文件扩展名
              const fileName = uploadForm.file.name
              const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toUpperCase()
              
              // 添加新的报告记录
              const newReport = {
                id: Date.now(),
                reportName: uploadForm.reportName,
                reportType: uploadForm.reportType,
                examDate: uploadForm.examDate.toLocaleDateString(),
                uploadDate: new Date().toLocaleDateString(),
                hospital: uploadForm.hospital,
                fileFormat: fileExt,
                doctorComment: uploadForm.doctorComment,
                abnormalItems: uploadForm.abnormalItems.map(item => {
                  // 这里简化处理，实际应用中应该有更详细的异常项目数据
                  return {
                    name: item,
                    value: '异常',
                    reference: '正常范围',
                    status: '异常'
                  }
                })
              }
              
              reports.value.unshift(newReport)
              uploadDialogVisible.value = false
              ElMessage.success('上传成功')
              uploadLoading.value = false
            }, 1500)
          } catch (error) {
            console.error('上传检验报告失败:', error)
            ElMessage.error('上传失败，请重试')
            uploadLoading.value = false
          }
        }
      })
    }
    
    // 查看报告详情
    const showReportDetails = (report) => {
      currentReport.value = report
      detailsDialogVisible.value = true
    }
    
    // 预览报告
    const previewReport = (report) => {
      currentReport.value = report
      isPreviewReady.value = false
      previewDialogVisible.value = true
      
      // 模拟加载预览
      setTimeout(() => {
        // 实际应用中这里应该是真实的文件URL
        if (report.fileFormat === 'PDF') {
          previewUrl.value = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
        } else if (['JPG', 'JPEG', 'PNG', 'GIF'].includes(report.fileFormat)) {
          previewUrl.value = `https://fakeimg.pl/800x1000/?text=${report.reportName}&font=noto`
        }
        isPreviewReady.value = true
      }, 1000)
    }
    
    // 下载报告
    const downloadReport = (report) => {
      // 模拟下载
      ElMessage.success(`开始下载: ${report.reportName}`)
      // 实际项目中应实现真实的下载功能
    }
    
    // 删除报告
    const deleteReport = (index) => {
      reports.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
    
    onMounted(() => {
      fetchReports()
    })
    
    return {
      loading,
      reports,
      uploadDialogVisible,
      detailsDialogVisible,
      previewDialogVisible,
      uploadLoading,
      fileList,
      currentReport,
      isPreviewReady,
      previewUrl,
      isPdf,
      isImage,
      uploadFormRef,
      uploadForm,
      uploadRules,
      abnormalOptions,
      getReportTagType,
      openUploadDialog,
      handleFileChange,
      submitUpload,
      showReportDetails,
      previewReport,
      downloadReport,
      deleteReport
    }
  }
}
</script>

<style scoped>
.lab-reports-tab {
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

.reports-list {
  margin-bottom: 24px;
}

.report-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-icon {
  color: #409EFF;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.upload-zone {
  width: 100%;
}

.abnormal-items {
  margin-top: 24px;
}

.abnormal-items h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.preview-container {
  min-height: 500px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-content {
  width: 100%;
  height: 100%;
}

.pdf-preview {
  width: 100%;
  height: 70vh;
  border: none;
}

.image-preview {
  max-width: 100%;
  max-height: 70vh;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.preview-icon {
  font-size: 60px;
  color: #909399;
  margin-bottom: 20px;
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

.details-descriptions {
  margin-bottom: 24px;
}
</style> 