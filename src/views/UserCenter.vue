<template>
  <div class="user-center-container">
    <div class="user-center-header">
      <div class="header-left">
        <el-button type="text" @click="goBack">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <h2>用户中心</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            {{ userDetail?.username || '用户' }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="chat">智能问诊</el-dropdown-item>
              <el-dropdown-item command="video">视频解析</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="user-center-content">
      <el-row :gutter="20">
        <!-- 左侧用户信息卡片 -->
        <el-col :span="8">
          <el-card class="user-info-card" shadow="hover">
            <div class="user-info-header">
              <el-avatar :size="80" :src="userDetail?.avatar">
                {{ userDetail?.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <h3>{{ userDetail?.realName || userDetail?.username }}</h3>
              <p class="join-date">加入时间: {{ formatDate(userDetail?.joinTime) }}</p>
            </div>
            
            <el-divider />
            
            <div class="user-info-body">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="用户名">{{ userDetail?.username }}</el-descriptions-item>
                <el-descriptions-item label="真实姓名">{{ userDetail?.realName }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ userDetail?.gender }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ userDetail?.age }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ userDetail?.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ userDetail?.email }}</el-descriptions-item>
                <el-descriptions-item label="地址">{{ userDetail?.address }}</el-descriptions-item>
              </el-descriptions>
              
              <div class="action-buttons">
                <el-button type="primary" @click="openEditDialog">
                  <el-icon><Edit /></el-icon>
                  编辑信息
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
                <h3>病历病史管理</h3>
                <el-button type="primary" @click="showUploadDialog">
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
                  <el-button type="primary" @click="showUploadDialog">上传病历</el-button>
                </el-empty>
              </div>
              
              <el-table
                v-else
                :data="sortedMedicalRecords"
                style="width: 100%"
                border
                stripe
              >
                <el-table-column prop="filename" label="文件名" min-width="180">
                  <template #default="{row}">
                    <div class="file-name-cell">
                      <el-icon><Document /></el-icon>
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
                    >
                      <span>{{ row.description.slice(0, 20) }}...</span>
                    </el-tooltip>
                    <span v-else>{{ row.description || '无描述' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="{row}">
                    <el-button 
                      type="primary" 
                      link 
                      @click="showFilePreview(row)"
                    >
                      查看
                    </el-button>
                    <el-popconfirm
                      title="确定要删除这条记录吗？"
                      @confirm="deleteRecord(row.id)"
                    >
                      <template #reference>
                        <el-button type="danger" link>删除</el-button>
                      </template>
                    </el-popconfirm>
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
    >
      <div class="upload-dialog-content">
        <el-form :model="uploadForm" label-width="80px">
          <el-form-item label="文件描述">
            <el-input 
              v-model="uploadForm.description" 
              type="textarea" 
              :rows="2"
              placeholder="请输入对病历的简要描述"
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
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持PDF、JPEG、PNG等常见文件格式，单个文件不超过20MB
                </div>
              </template>
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
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="uploading">
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
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="loading">
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
            <el-button type="primary" @click="downloadFile(previewFile)">下载文件</el-button>
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
  background-color: #f5f7fa;
  overflow: hidden;
}

.user-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }
  }
  
  .user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 4px;
    font-size: 14px;
    color: #606266;
  }
}

.user-center-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.user-info-card {
  height: 100%;
  
  .user-info-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0;
    
    h3 {
      margin: 16px 0 0;
      font-size: 18px;
      color: #333;
    }
    
    .join-date {
      margin: 8px 0 0;
      font-size: 14px;
      color: #909399;
    }
  }
  
  .user-info-body {
    padding: 0 0 16px;
    
    .action-buttons {
      margin-top: 24px;
      text-align: center;
    }
  }
}

.medical-records-card {
  height: 100%;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
  }
  
  .medical-records-content {
    min-height: 300px;
  }
  
  .empty-records {
    padding: 40px 0;
  }
  
  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.loading-container {
  padding: 20px 0;
}

.upload-dialog-content {
  .upload-progress {
    margin-top: 16px;
    
    .progress-text {
      margin-top: 8px;
      text-align: center;
      color: #409EFF;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
      }
    }
    
    .unsupported-preview {
      width: 100%;
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style> 