<template>
  <div class="medical-imaging-tab">
    <div class="tab-header">
      <h3>医学影像资料</h3>
      <el-button type="primary" @click="openUploadDialog">
        <el-icon><Upload /></el-icon> 上传影像资料
      </el-button>
    </div>
    
    <!-- 标签页：按影像类型分类 -->
    <el-tabs v-model="activeSubTab" class="imaging-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="X光片" name="xray"></el-tab-pane>
      <el-tab-pane label="CT扫描" name="ct"></el-tab-pane>
      <el-tab-pane label="核磁共振(MRI)" name="mri"></el-tab-pane>
      <el-tab-pane label="超声波" name="ultrasound"></el-tab-pane>
      <el-tab-pane label="其他" name="other"></el-tab-pane>
    </el-tabs>
    
    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchText"
        placeholder="搜索影像名称、部位或描述"
        class="search-input"
        clearable
        @input="filterImages"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="sortBy"
        placeholder="排序方式"
        class="sort-select"
        @change="filterImages"
      >
        <el-option label="最新上传" value="newest" />
        <el-option label="最早上传" value="oldest" />
        <el-option label="按名称排序" value="name" />
      </el-select>
    </div>
    
    <!-- 影像资料列表 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="!filteredImages.length" class="empty-data">
      <el-empty description="暂无影像资料">
        <template #image>
          <el-icon class="empty-icon"><PictureFilled /></el-icon>
        </template>
        <el-button type="primary" @click="openUploadDialog">上传影像资料</el-button>
      </el-empty>
    </div>
    
    <div v-else class="imaging-grid">
      <el-card
        v-for="(image, index) in filteredImages"
        :key="index"
        class="imaging-card"
        shadow="hover"
        :body-style="{ padding: '0' }"
      >
        <div class="image-preview" @click="openPreviewDialog(image)">
          <img :src="image.url" :alt="image.name" class="preview-image">
          <div class="image-type-badge" :class="'type-' + image.type">
            {{ getImageTypeLabel(image.type) }}
          </div>
        </div>
        <div class="image-info">
          <h4 class="image-name">{{ image.name }}</h4>
          <p class="image-description">{{ image.description || '无描述' }}</p>
          <div class="image-meta">
            <span class="image-date">{{ image.uploadDate }}</span>
            <span class="image-body-part">{{ image.bodyPart }}</span>
          </div>
          <div class="image-actions">
            <el-button type="primary" link size="small" @click="openPreviewDialog(image)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button type="success" link size="small" @click="downloadImage(image)">
              <el-icon><Download /></el-icon> 下载
            </el-button>
            <el-popconfirm
              title="确定要删除这个影像资料吗？"
              @confirm="deleteImage(index)"
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
        </div>
      </el-card>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传影像资料"
      width="600px"
      top="5vh"
    >
      <el-form :model="uploadForm" ref="uploadFormRef" :rules="uploadRules" label-width="100px">
        <el-form-item label="影像名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入影像名称" />
        </el-form-item>
        <el-form-item label="影像类型" prop="type">
          <el-select v-model="uploadForm.type" placeholder="请选择影像类型" style="width: 100%">
            <el-option label="X光片" value="xray" />
            <el-option label="CT扫描" value="ct" />
            <el-option label="核磁共振(MRI)" value="mri" />
            <el-option label="超声波" value="ultrasound" />
            <el-option label="其他" value="other" />
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
        <el-form-item label="身体部位" prop="bodyPart">
          <el-input v-model="uploadForm.bodyPart" placeholder="请输入检查的身体部位" />
        </el-form-item>
        <el-form-item label="检查医院" prop="hospital">
          <el-input v-model="uploadForm.hospital" placeholder="请输入检查医院" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入影像描述或诊断结果"
          />
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
            accept="image/png,image/jpeg,image/gif,application/pdf,application/dicom"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持JPEG、PNG、GIF、PDF和DICOM格式，单个文件不超过20MB
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
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="currentImage.name"
      width="70%"
      top="5vh"
      class="preview-dialog"
    >
      <div class="preview-container">
        <img :src="currentImage.url" :alt="currentImage.name" class="preview-full-image">
      </div>
      <div class="preview-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="影像名称">{{ currentImage.name }}</el-descriptions-item>
          <el-descriptions-item label="影像类型">{{ getImageTypeLabel(currentImage.type) }}</el-descriptions-item>
          <el-descriptions-item label="检查日期">{{ currentImage.examDate }}</el-descriptions-item>
          <el-descriptions-item label="上传日期">{{ currentImage.uploadDate }}</el-descriptions-item>
          <el-descriptions-item label="身体部位">{{ currentImage.bodyPart }}</el-descriptions-item>
          <el-descriptions-item label="检查医院">{{ currentImage.hospital }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentImage.description || '无描述' }}</el-descriptions-item>
        </el-descriptions>
        <div class="preview-actions">
          <el-button type="primary" @click="downloadImage(currentImage)">
            <el-icon><Download /></el-icon> 下载影像
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'MedicalImagingTab',
  
  setup() {
    const loading = ref(true)
    const imageList = ref([])
    const activeSubTab = ref('all')
    const searchText = ref('')
    const sortBy = ref('newest')
    
    const uploadDialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const uploadLoading = ref(false)
    const fileList = ref([])
    const currentImage = ref({})
    
    const uploadFormRef = ref(null)
    const uploadForm = reactive({
      name: '',
      type: '',
      examDate: '',
      bodyPart: '',
      hospital: '',
      description: '',
      file: null
    })
    
    const uploadRules = {
      name: [{ required: true, message: '请输入影像名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择影像类型', trigger: 'change' }],
      examDate: [{ required: true, message: '请选择检查日期', trigger: 'change' }],
      bodyPart: [{ required: true, message: '请输入检查的身体部位', trigger: 'blur' }]
    }
    
    // 获取影像类型标签
    const getImageTypeLabel = (type) => {
      const types = {
        xray: 'X光片',
        ct: 'CT扫描',
        mri: '核磁共振',
        ultrasound: '超声波',
        other: '其他'
      }
      return types[type] || '未知'
    }
    
    // 根据当前标签页和搜索条件过滤图像
    const filteredImages = computed(() => {
      let result = [...imageList.value]
      
      // 按类型筛选
      if (activeSubTab.value !== 'all') {
        result = result.filter(img => img.type === activeSubTab.value)
      }
      
      // 按搜索文本筛选
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase()
        result = result.filter(img => 
          img.name.toLowerCase().includes(searchLower) ||
          img.bodyPart.toLowerCase().includes(searchLower) ||
          (img.description && img.description.toLowerCase().includes(searchLower))
        )
      }
      
      // 排序
      result.sort((a, b) => {
        if (sortBy.value === 'newest') {
          return new Date(b.uploadDate) - new Date(a.uploadDate)
        } else if (sortBy.value === 'oldest') {
          return new Date(a.uploadDate) - new Date(b.uploadDate)
        } else if (sortBy.value === 'name') {
          return a.name.localeCompare(b.name)
        }
        return 0
      })
      
      return result
    })
    
    // 获取影像列表
    const fetchImageList = () => {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        imageList.value = [
          {
            id: 1,
            name: '胸部X光片',
            type: 'xray',
            url: 'https://fakeimg.pl/600x400/?text=胸部X光片&font=noto',
            examDate: '2023-01-15',
            uploadDate: '2023-01-16',
            bodyPart: '胸部',
            hospital: '北京协和医院',
            description: '肺部未见明显异常阴影，心脏大小正常，肋骨未见明显异常。'
          },
          {
            id: 2,
            name: '腹部MRI扫描',
            type: 'mri',
            url: 'https://fakeimg.pl/600x400/?text=腹部MRI&font=noto',
            examDate: '2023-02-20',
            uploadDate: '2023-02-21',
            bodyPart: '腹部',
            hospital: '北京301医院',
            description: '肝脏、胆囊、胰腺和脾脏未见异常信号。'
          },
          {
            id: 3,
            name: '头部CT扫描',
            type: 'ct',
            url: 'https://fakeimg.pl/600x400/?text=头部CT&font=noto',
            examDate: '2023-03-10',
            uploadDate: '2023-03-11',
            bodyPart: '头部',
            hospital: '北京协和医院',
            description: '脑实质密度正常，脑室系统大小及形态正常，未见明显异常密度影。'
          },
          {
            id: 4,
            name: '颈部超声波检查',
            type: 'ultrasound',
            url: 'https://fakeimg.pl/600x400/?text=颈部超声波&font=noto',
            examDate: '2023-04-05',
            uploadDate: '2023-04-06',
            bodyPart: '颈部',
            hospital: '北京中医院',
            description: '甲状腺大小形态正常，包膜完整，内部回声均匀。'
          }
        ]
        loading.value = false
      }, 1000)
    }
    
    // 处理标签页点击
    const handleTabClick = () => {
      // 标签页切换时保留搜索条件但重新过滤
    }
    
    // 筛选图像
    const filterImages = () => {
      // 重新过滤图像（通过计算属性自动完成）
    }
    
    // 打开上传对话框
    const openUploadDialog = () => {
      // 重置表单数据
      Object.keys(uploadForm).forEach(key => {
        uploadForm[key] = ''
      })
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
              // 创建文件URL
              const fileURL = URL.createObjectURL(uploadForm.file)
              
              // 添加新的影像记录
              const newImage = {
                id: Date.now(),
                name: uploadForm.name,
                type: uploadForm.type,
                url: fileURL,
                examDate: uploadForm.examDate.toLocaleDateString(),
                uploadDate: new Date().toLocaleDateString(),
                bodyPart: uploadForm.bodyPart,
                hospital: uploadForm.hospital,
                description: uploadForm.description
              }
              
              imageList.value.unshift(newImage)
              uploadDialogVisible.value = false
              ElMessage.success('上传成功')
              uploadLoading.value = false
              
              // 切换到对应标签页
              activeSubTab.value = uploadForm.type
            }, 1500)
          } catch (error) {
            console.error('上传影像资料失败:', error)
            ElMessage.error('上传失败，请重试')
            uploadLoading.value = false
          }
        }
      })
    }
    
    // 打开预览对话框
    const openPreviewDialog = (image) => {
      currentImage.value = image
      previewDialogVisible.value = true
    }
    
    // 下载影像
    const downloadImage = (image) => {
      // 模拟下载
      ElMessage.success(`开始下载: ${image.name}`)
      // 实际项目中应实现真实的下载功能
    }
    
    // 删除影像
    const deleteImage = (index) => {
      const id = filteredImages.value[index].id
      const realIndex = imageList.value.findIndex(img => img.id === id)
      if (realIndex !== -1) {
        imageList.value.splice(realIndex, 1)
        ElMessage.success('删除成功')
      }
    }
    
    onMounted(() => {
      fetchImageList()
    })
    
    return {
      loading,
      activeSubTab,
      searchText,
      sortBy,
      filteredImages,
      uploadDialogVisible,
      previewDialogVisible,
      uploadLoading,
      fileList,
      currentImage,
      uploadFormRef,
      uploadForm,
      uploadRules,
      getImageTypeLabel,
      handleTabClick,
      filterImages,
      openUploadDialog,
      handleFileChange,
      submitUpload,
      openPreviewDialog,
      downloadImage,
      deleteImage
    }
  }
}
</script>

<style scoped>
.medical-imaging-tab {
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

.imaging-tabs {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.sort-select {
  width: 150px;
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

.imaging-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.imaging-card {
  transition: transform 0.3s ease;
  overflow: hidden;
}

.imaging-card:hover {
  transform: translateY(-5px);
}

.image-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview:hover .preview-image {
  transform: scale(1.05);
}

.image-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: #909399;
}

.type-xray {
  background-color: #409EFF;
}

.type-ct {
  background-color: #67C23A;
}

.type-mri {
  background-color: #E6A23C;
}

.type-ultrasound {
  background-color: #F56C6C;
}

.image-info {
  padding: 16px;
}

.image-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-description {
  margin: 0 0 10px;
  font-size: 13px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  color: #909399;
}

.image-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
  padding: 20px;
  min-height: 300px;
}

.preview-full-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.preview-details {
  padding: 0 20px;
}

.preview-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.upload-zone {
  width: 100%;
}
</style> 