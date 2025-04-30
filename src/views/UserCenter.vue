<template>
  <div class="user-center-container">
    <div class="user-center-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-button">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <h2><el-icon><User /></el-icon> 用户中心</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            <el-avatar :size="32" class="user-avatar">{{ userDetail?.username?.charAt(0)?.toUpperCase() || '用' }}</el-avatar>
            {{ userDetail?.username || '用户' }}
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
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="user-center-content">
      <el-row :gutter="24">
        <!-- 左侧用户信息卡片 -->
        <el-col :span="8">
          <el-card class="user-info-card" shadow="hover">
            <div class="user-info-header">
              <div class="avatar-container">
                <el-avatar :size="90" :src="userDetail?.avatar" class="user-large-avatar">
                  {{ userDetail?.username?.charAt(0)?.toUpperCase() || '用' }}
                </el-avatar>
                <div class="avatar-edit">
                  <el-button circle type="primary" class="edit-avatar-btn">
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </div>
              </div>
              <h3>{{ userDetail?.realName || userDetail?.username }}</h3>
              <p class="join-date">加入时间: {{ formatDate(userDetail?.joinTime) }}</p>
            </div>
            
            <el-divider />
            
            <div class="user-info-body">
              <el-descriptions :column="1" border class="user-descriptions">
                <el-descriptions-item label="用户名">
                  <span class="description-content">{{ userDetail?.username }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="真实姓名">
                  <span class="description-content">{{ userDetail?.realName || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="性别">
                  <span class="description-content">{{ userDetail?.gender || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="年龄">
                  <span class="description-content">{{ userDetail?.age || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  <span class="description-content">{{ userDetail?.phone || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  <span class="description-content">{{ userDetail?.email || '未设置' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="地址">
                  <span class="description-content">{{ userDetail?.address || '未设置' }}</span>
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="action-buttons">
                <el-button type="primary" @click="openEditDialog" class="edit-info-btn">
                  <el-icon><Edit /></el-icon>
                  编辑个人信息
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 右侧病历病史管理 -->
        <el-col :span="16">
          <el-card class="medical-records-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <el-icon><Notebook /></el-icon>
                  <h3>病历病史管理</h3>
                </div>
                <el-button type="primary" @click="showUploadDialog" class="upload-btn">
                  <el-icon><Upload /></el-icon>
                  上传病历
                </el-button>
              </div>
            </template>
            
            <div class="medical-records-content">
              <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="!medicalRecords.length" class="empty-records">
                <el-empty description="暂无病历记录">
                  <template #image>
                    <el-icon class="empty-icon"><DocumentRemove /></el-icon>
                  </template>
                  <el-button type="primary" @click="showUploadDialog" class="upload-empty-btn">
                    <el-icon><Plus /></el-icon> 上传病历
                  </el-button>
                </el-empty>
              </div>
              
              <el-table
                v-else
                :data="sortedMedicalRecords"
                style="width: 100%"
                border
                stripe
                class="records-table"
              >
                <el-table-column prop="filename" label="文件名" min-width="180">
                  <template #default="{row}">
                    <div class="file-name-cell">
                      <el-icon class="file-icon"><Document /></el-icon>
                      <span>{{ row.filename }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="fileSize" label="大小" width="120">
                  <template #default="{row}">
                    {{ formatFileSize(row.fileSize) }}
                  </template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="180">
                  <template #default="{row}">
                    {{ formatDateTime(row.uploadTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="150">
                  <template #default="{row}">
                    <el-tooltip 
                      v-if="row.description && row.description.length > 20"
                      :content="row.description" 
                      placement="top"
                      effect="light"
                    >
                      <span>{{ row.description.slice(0, 20) }}...</span>
                    </el-tooltip>
                    <span v-else>{{ row.description || '无描述' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="{row}">
                    <div class="action-column">
                      <el-button 
                        type="primary" 
                        link 
                        @click="showFilePreview(row)"
                        class="action-btn"
                      >
                        <el-icon><View /></el-icon> 查看
                      </el-button>
                      <el-popconfirm
                        title="确定要删除这条记录吗？"
                        @confirm="deleteRecord(row.id)"
                        confirm-button-type="danger"
                        icon="WarningFilled"
                        icon-color="#F56C6C"
                      >
                        <template #reference>
                          <el-button type="danger" link class="action-btn">
                            <el-icon><Delete /></el-icon> 删除
                          </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 上传病历对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传病历"
      width="500px"
      destroy-on-close
      class="upload-dialog"
    >
      <div class="upload-dialog-content">
        <el-form :model="uploadForm" label-width="80px">
          <el-form-item label="文件描述">
            <el-input 
              v-model="uploadForm.description" 
              type="textarea" 
              :rows="2"
              placeholder="请输入对病历的简要描述"
              resize="none"
            ></el-input>
          </el-form-item>
          
          <el-form-item label="病历文件">
            <el-upload
              class="record-uploader"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :multiple="false"
              :limit="1"
              :file-list="uploadForm.fileList"
            >
              <div class="upload-area-content">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="el-upload__text">
                  拖拽文件到此处或 <em>点击上传</em>
                </div>
                <div class="el-upload__tip">
                  支持PDF、JPEG、PNG等常见文件格式，单个文件不超过20MB
                </div>
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
        
        <div v-if="uploading" class="upload-progress">
          <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : ''" />
          <div class="progress-text">上传中 {{ uploadProgress }}%</div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="uploading" class="submit-btn">
            上传
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑用户信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-form 
        :model="editForm" 
        :rules="editRules" 
        ref="editFormRef" 
        label-width="80px"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="editForm.age" :min="1" :max="120"></el-input-number>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="loading" class="submit-btn">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewFile?.filename"
      width="70%"
      class="preview-dialog"
    >
      <div class="file-preview-container">
        <div v-if="isImageFile(previewFile?.fileType)" class="image-preview">
          <img :src="previewFile?.url" :alt="previewFile?.filename" />
        </div>
        <div v-else-if="isPdfFile(previewFile?.fileType)" class="pdf-preview">
          <iframe :src="previewFile?.url" width="100%" height="500"></iframe>
        </div>
        <div v-else class="unsupported-preview">
          <el-empty description="此文件格式不支持预览">
            <template #image>
              <el-icon class="empty-icon"><DocumentDelete /></el-icon>
            </template>
            <el-button type="primary" @click="downloadFile(previewFile)" class="download-btn">
              <el-icon><Download /></el-icon> 下载文件
            </el-button>
          </el-empty>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useUserCenterStore } from '../store/user-center'
import { ElMessage } from 'element-plus'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const userCenterStore = useUserCenterStore()

// 响应式数据
const uploadDialogVisible = ref(false)
const editDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const previewFile = ref(null)
const editFormRef = ref(null)

// 表单数据
const uploadForm = ref({
  description: '',
  file: null,
  fileList: []
})

const editForm = ref({
  realName: '',
  gender: '',
  age: 0,
  phone: '',
  email: '',
  address: ''
})

// 表单校验规则
const editRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 计算属性
const userDetail = computed(() => userCenterStore.userDetail)
const medicalRecords = computed(() => userCenterStore.medicalRecords)
const sortedMedicalRecords = computed(() => userCenterStore.sortedMedicalRecords)
const loading = computed(() => userCenterStore.loading)
const uploading = computed(() => userCenterStore.uploading)
const uploadProgress = computed(() => userCenterStore.uploadProgress)

// 生命周期钩子
onMounted(async () => {
  await userCenterStore.fetchUserDetail()
  await userCenterStore.fetchMedicalRecords()
})

// 方法
// 返回上一页
const goBack = () => {
  router.back()
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logoutAction()
  } else if (command === 'chat') {
    router.push('/chat')
  } else if (command === 'video') {
    router.push('/video')
  } else if (command === 'patientInfo') {
    router.push('/patient-info')
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 显示上传对话框
const showUploadDialog = () => {
  uploadForm.value = {
    description: '',
    file: null,
    fileList: []
  }
  uploadDialogVisible.value = true
}

// 处理文件选择变化
const handleFileChange = (file) => {
  uploadForm.value.file = file.raw
  uploadForm.value.fileList = [file]
}

// 提交上传
const submitUpload = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  try {
    const result = await userCenterStore.uploadMedicalRecord(uploadForm.value.file)
    if (result) {
      // 如果上传成功，更新文件描述
      const index = userCenterStore.medicalRecords.findIndex(record => record.id === result.id)
      if (index !== -1) {
        userCenterStore.medicalRecords[index].description = uploadForm.value.description
      }
      
      uploadDialogVisible.value = false
      ElMessage.success('病历上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  editForm.value = {
    realName: userDetail.value?.realName || '',
    gender: userDetail.value?.gender || '男',
    age: userDetail.value?.age || 0,
    phone: userDetail.value?.phone || '',
    email: userDetail.value?.email || '',
    address: userDetail.value?.address || ''
  }
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    const result = await userCenterStore.updateUserInfo(editForm.value)
    if (result) {
      editDialogVisible.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 预览文件
const showFilePreview = (file) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 删除记录
const deleteRecord = async (fileId) => {
  try {
    await userCenterStore.deleteMedicalRecord(fileId)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 下载文件
const downloadFile = (file) => {
  if (!file || !file.url) {
    ElMessage.warning('文件不存在或无法下载')
    return
  }
  
  const a = document.createElement('a')
  a.href = file.url
  a.download = file.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 检查文件类型是否为图片
const isImageFile = (fileType) => {
  return fileType && fileType.startsWith('image/')
}

// 检查文件类型是否为PDF
const isPdfFile = (fileType) => {
  return fileType === 'application/pdf'
}
</script>

<style lang="scss" scoped>
.user-center-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafc;
  background-image: 
    radial-gradient(#e4f0ff 1px, transparent 1px),
    radial-gradient(#e4f0ff 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  overflow: hidden;
}

.user-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 24px;
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        font-size: 22px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .back-button {
      display: flex;
      align-items: center;
      color: white;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 6px 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateX(-2px);
      }

      .el-icon {
        margin-right: 4px;
      }
    }
  }
  
  .user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
    font-size: 14px;
    color: white;
    background: rgba(255, 255, 255, 0.15);
    padding: 6px 12px;
    border-radius: 20px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .user-avatar {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-weight: 600;
    }
  }
}

.user-center-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.user-info-card {
  height: 100%;
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .user-info-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    background: linear-gradient(to bottom, #f0f6ff, #ffffff);
    
    .avatar-container {
      position: relative;
      margin-bottom: 8px;

      .user-large-avatar {
        background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
        color: white;
        font-weight: 600;
        font-size: 36px;
        box-shadow: 0 6px 16px rgba(38, 126, 255, 0.3);
        border: 4px solid white;
      }

      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;

        .edit-avatar-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          font-size: 14px;
          background: #267eff;
          border: 2px solid white;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }
      }

      &:hover .edit-avatar-btn {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    h3 {
      margin: 16px 0 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
    
    .join-date {
      margin: 8px 0 0;
      font-size: 14px;
      color: #909399;
    }
  }
  
  .user-info-body {
    padding: 0 16px 24px;
    
    .user-descriptions {
      margin-top: 16px;

      :deep(.el-descriptions__label) {
        background-color: #f5f7fa;
        color: #606266;
        font-weight: 500;
      }

      .description-content {
        color: #303133;
      }
    }
    
    .action-buttons {
      margin-top: 24px;
      text-align: center;

      .edit-info-btn {
        background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
        border: none;
        border-radius: 10px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(38, 126, 255, 0.2);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(38, 126, 255, 0.3);
        }

        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
}

.medical-records-card {
  height: 100%;
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, #f0f4ff, #e6f0ff);
    padding: 16px;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .el-icon {
        font-size: 20px;
        color: #267eff;
      }
    }

    .upload-btn {
      background: #267eff;
      border: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
      }

      .el-icon {
        margin-right: 4px;
      }
    }
  }
  
  .medical-records-content {
    min-height: 300px;
    padding: 16px;
  }
  
  .empty-records {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .empty-icon {
      font-size: 60px;
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    .upload-empty-btn {
      background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
      border: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      margin-top: 16px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
      }
    }
  }
  
  .records-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    :deep(.el-table__header-wrapper th) {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }

    .file-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .file-icon {
        color: #267eff;
        font-size: 18px;
      }
    }

    .action-column {
      display: flex;
      justify-content: space-evenly;

      .action-btn {
        font-size: 13px;
        .el-icon {
          margin-right: 2px;
        }
      }
    }
  }
}

.loading-container {
  padding: 20px 0;
}

.upload-dialog, .edit-dialog, .preview-dialog {
  :deep(.el-dialog__header) {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid #ebeef5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.upload-dialog-content {
  .upload-area-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
  }

  .upload-icon {
    font-size: 48px;
    color: #267eff;
    margin-bottom: 16px;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  :deep(.el-upload-dragger:hover) .upload-icon {
    transform: translateY(-8px);
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: auto;
    padding: 24px;
    border: 2px dashed #dcdfe6;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: rgba(64, 158, 255, 0.02);

    &:hover {
      border-color: #267eff;
      background: rgba(64, 158, 255, 0.05);
      transform: translateY(-2px);
    }
  }

  :deep(.el-upload__text) {
    font-size: 16px;
    color: #606266;
    margin-bottom: 8px;

    em {
      color: #267eff;
      font-style: normal;
      font-weight: 600;
      cursor: pointer;
    }
  }

  :deep(.el-upload__tip) {
    color: #909399;
    font-size: 13px;
    text-align: center;
  }

  .upload-progress {
    margin-top: 24px;
    
    .progress-text {
      margin-top: 8px;
      text-align: center;
      color: #267eff;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .cancel-btn {
    border-radius: 8px;
  }

  .submit-btn {
    background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
    border: none;
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
    }
  }
}

.preview-dialog {
  .file-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    
    .image-preview {
      img {
        max-width: 100%;
        max-height: 600px;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }
    }
    
    .pdf-preview {
      width: 100%;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;

      iframe {
        border: none;
      }
    }
    
    .unsupported-preview {
      width: 100%;
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;

      .empty-icon {
        font-size: 60px;
        color: #c0c4cc;
      }

      .download-btn {
        background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
        border: none;
        border-radius: 8px;
        margin-top: 16px;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
        }

        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .user-center-header {
    padding: 12px 16px;
    
    .header-left {
      gap: 8px;
      
      h2 {
        font-size: 18px;
      }
    }
  }

  .user-center-content {
    padding: 16px;
  }

  .el-row {
    flex-direction: column;
    
    .el-col {
      width: 100%;
      max-width: 100%;
      flex: 0 0 100%;
    }
  }

  .user-info-card, .medical-records-card {
    margin-bottom: 16px;
  }

  .user-info-card .user-info-header {
    padding: 24px 0;
  }

  .medical-records-content {
    min-height: auto;
  }

  .records-table {
    white-space: nowrap;
  }
}
</style> 