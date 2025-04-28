<template>
  <div class="video-page">
    <div class="video-header">
      <div class="header-left">
        <el-button type="text" @click="goBack">
          <el-icon><Back /></el-icon>
          返回聊天
        </el-button>
        <h2>视频解析</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            {{ userInfo?.username || '用户' }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="userCenter">用户中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="video-container">
      <el-card class="video-upload-card">
        <template #header>
          <div class="card-header">
            <h3>上传医疗相关视频</h3>
            <p>请上传您的医疗相关视频，系统将对视频内容进行分析并生成诊断报告</p>
          </div>
        </template>
        
        <div class="upload-section" v-if="!videoData || videoData.status === 'failed'">
          <el-upload
            class="video-uploader"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :multiple="false"
            :show-file-list="false"
            accept="video/*"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              拖拽视频到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持MP4、MOV等常见视频格式，单个视频不超过500MB
              </div>
            </template>
          </el-upload>
          
          <div class="upload-actions" v-if="selectedFile">
            <div class="selected-file">
              <el-icon><VideoCameraFilled /></el-icon>
              <span>{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <el-button type="primary" @click="uploadVideo" :loading="uploading">开始上传</el-button>
          </div>
        </div>
        
        <div class="video-progress" v-if="videoData && videoData.status === 'uploading'">
          <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : ''" />
          <div class="progress-text">视频上传中 {{ uploadProgress }}%</div>
        </div>
        
        <div class="video-preview" v-if="videoData && videoData.status === 'uploaded'">
          <div class="video-player">
            <video controls :src="videoData.url" class="video-element"></video>
          </div>
          <div class="video-info">
            <h4>{{ videoData.file.name }}</h4>
            <p>文件大小: {{ formatFileSize(videoData.file.size) }}</p>
            <div class="video-actions">
              <el-button type="primary" @click="resetVideo">上传新视频</el-button>
              <el-button type="info" @click="refreshAnalysis">刷新分析结果</el-button>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="analysis-result-card" v-if="analysisResult">
        <template #header>
          <div class="card-header">
            <h3>视频分析结果</h3>
            <el-tag :type="analysisStatusType" size="small">{{ analysisStatusText }}</el-tag>
          </div>
        </template>
        
        <div class="analysis-loading" v-if="analyzing || analysisResult.status === 'processing'">
          <el-skeleton :rows="6" animated />
          <div class="loading-text">
            <el-icon><Loading /></el-icon>
            视频正在分析中，请稍候...
          </div>
        </div>
        
        <div class="analysis-content" v-else-if="analysisResult.status === 'completed'">
          <!-- 视频概述 -->
          <div class="analysis-section">
            <h4>视频概述</h4>
            <p>{{ analysisResult.summary }}</p>
          </div>
          
          <!-- 关键点 -->
          <div class="analysis-section">
            <h4>关键点</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(point, index) in analysisResult.keyPoints"
                :key="index"
                :timestamp="`${point.timePoint}`"
                placement="top"
              >
                {{ point.description }}
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <!-- 诊断建议 -->
          <div class="analysis-section">
            <h4>诊断建议</h4>
            <div class="diagnosis-content" v-html="formattedDiagnosis"></div>
          </div>
          
          <!-- 后续行动 -->
          <div class="analysis-section">
            <h4>后续行动建议</h4>
            <el-steps direction="vertical" :active="analysisResult.nextSteps.length">
              <el-step 
                v-for="(step, index) in analysisResult.nextSteps" 
                :key="index"
                :title="step.title"
                :description="step.description"
              />
            </el-steps>
          </div>
          
          <!-- 操作按钮 -->
          <div class="analysis-actions">
            <el-button type="primary" @click="goToChat">在聊天中继续讨论</el-button>
            <el-button @click="downloadReport">下载报告</el-button>
          </div>
        </div>
        
        <div class="analysis-error" v-else-if="analysisResult.status === 'failed'">
          <el-empty description="视频分析失败">
            <template #description>
              <p>很抱歉，视频分析失败。错误原因：{{ analysisResult.errorMessage || '未知错误' }}</p>
            </template>
            <el-button type="primary" @click="refreshAnalysis">重新分析</el-button>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useVideoStore } from '../store/video'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'

export default {
  name: 'VideoView',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const videoStore = useVideoStore()
    
    const selectedFile = ref(null)
    
    // 计算属性
    const userInfo = computed(() => userStore.userInfo)
    const videoData = computed(() => videoStore.videoData)
    const analysisResult = computed(() => videoStore.analysisResult)
    const uploading = computed(() => videoStore.uploading)
    const analyzing = computed(() => videoStore.analyzing)
    const uploadProgress = computed(() => videoStore.uploadProgress)
    
    // 分析状态显示
    const analysisStatusType = computed(() => {
      if (!analysisResult.value) return ''
      const status = analysisResult.value.status
      if (status === 'completed') return 'success'
      if (status === 'processing') return 'warning'
      if (status === 'failed') return 'danger'
      return 'info'
    })
    
    const analysisStatusText = computed(() => {
      if (!analysisResult.value) return ''
      const status = analysisResult.value.status
      if (status === 'completed') return '分析完成'
      if (status === 'processing') return '正在分析'
      if (status === 'failed') return '分析失败'
      return '等待分析'
    })
    
    // 格式化诊断结果（支持markdown）
    const formattedDiagnosis = computed(() => {
      if (!analysisResult.value || !analysisResult.value.diagnosis) return ''
      return marked(analysisResult.value.diagnosis)
    })
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // 处理文件选择
    const handleFileChange = (file) => {
      // 检查文件类型
      const isVideo = file.raw.type.indexOf('video/') !== -1
      if (!isVideo) {
        ElMessage.error('请上传视频文件')
        return
      }
      
      // 检查文件大小（500MB）
      const isLt500M = file.raw.size / 1024 / 1024 < 500
      if (!isLt500M) {
        ElMessage.error('视频大小不能超过500MB')
        return
      }
      
      selectedFile.value = file.raw
    }
    
    // 上传视频
    const uploadVideo = async () => {
      if (!selectedFile.value) {
        ElMessage.warning('请先选择视频文件')
        return
      }
      
      try {
        await videoStore.uploadVideoAction(selectedFile.value)
        selectedFile.value = null
      } catch (error) {
        console.error('上传视频失败:', error)
      }
    }
    
    // 刷新分析结果
    const refreshAnalysis = async () => {
      if (!videoData.value || !videoData.value.id) {
        ElMessage.warning('没有可分析的视频')
        return
      }
      
      try {
        await videoStore.getAnalysisResult(videoData.value.id)
      } catch (error) {
        console.error('获取分析结果失败:', error)
      }
    }
    
    // 重置视频
    const resetVideo = () => {
      ElMessageBox.confirm('重新上传将会丢失当前视频及分析结果，确定继续吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        videoStore.resetState()
        selectedFile.value = null
      }).catch(() => {})
    }
    
    // 下载报告
    const downloadReport = () => {
      // 实际项目中应该调用API获取报告下载链接
      ElMessage.info('报告下载功能正在开发中')
    }
    
    // 返回聊天页面
    const goBack = () => {
      router.push('/chat')
    }
    
    // 前往聊天并讨论结果
    const goToChat = () => {
      // 在实际项目中，可能需要将分析结果作为消息发送到聊天中
      router.push('/chat')
    }
    
    // 处理下拉菜单命令
    const handleCommand = (command) => {
      if (command === 'logout') {
        userStore.logoutAction()
      } else if (command === 'userCenter') {
        router.push('/user-center')
      }
    }
    
    onMounted(async () => {
      await userStore.fetchUserInfo()
    })
    
    return {
      userInfo,
      videoData,
      analysisResult,
      selectedFile,
      uploading,
      analyzing,
      uploadProgress,
      analysisStatusType,
      analysisStatusText,
      formattedDiagnosis,
      handleFileChange,
      uploadVideo,
      formatFileSize,
      refreshAnalysis,
      resetVideo,
      downloadReport,
      goBack,
      goToChat,
      handleCommand
    }
  }
}
</script>

<style scoped>
.video-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #409eff;
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h2 {
  margin: 0 0 0 16px;
  font-size: 18px;
}

.header-left .el-button {
  color: white;
  transition: all 0.3s ease;
}

.header-left .el-button:hover {
  transform: translateX(-5px);
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.user-dropdown .el-icon {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .el-icon {
  transform: rotate(180deg);
}

.video-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.video-upload-card,
.analysis-result-card {
  margin-bottom: 20px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform: translateY(20px);
  opacity: 0;
  animation: fade-in-up 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
}

.video-upload-card {
  animation-delay: 0.1s;
}

.analysis-result-card {
  animation-delay: 0.3s;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-upload-card:hover,
.analysis-result-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  flex-direction: column;
}

.card-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  position: relative;
}

.card-header h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #409eff;
  transition: width 0.4s ease;
}

.card-header:hover h3::after {
  width: 100px;
}

.card-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.video-uploader {
  width: 100%;
}

.el-upload-dragger {
  transition: all 0.4s cubic-bezier(0.215, 0.610, 0.355, 1);
  overflow: hidden;
}

.el-upload-dragger:hover {
  border-color: #409eff;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.el-icon--upload {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.el-upload-dragger:hover .el-icon--upload {
  transform: translateY(-10px) scale(1.1);
  color: #409eff;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.upload-actions:hover {
  background-color: #ecf5ff;
}

.selected-file {
  display: flex;
  align-items: center;
}

.selected-file .el-icon {
  margin-right: 8px;
  color: #409eff;
  transition: transform 0.3s ease;
}

.upload-actions:hover .selected-file .el-icon {
  transform: scale(1.2);
}

.file-size {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.video-progress {
  padding: 20px;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  color: #606266;
  transition: color 0.3s ease;
}

.el-progress-bar__inner {
  transition: width 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
}

.video-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.video-player {
  width: 100%;
  max-width: 720px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.video-player:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: scale(1.01);
}

.video-element {
  width: 100%;
  border-radius: 4px;
  display: block;
}

.video-info {
  text-align: center;
  margin-bottom: 16px;
}

.video-info h4 {
  margin: 8px 0;
  transition: color 0.3s ease;
}

.video-info:hover h4 {
  color: #409eff;
}

.video-info p {
  color: #909399;
  margin: 0 0 16px 0;
}

.video-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.video-actions .el-button {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.video-actions .el-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.video-actions .el-button:active {
  transform: translateY(0) scale(0.95);
}

.analysis-loading {
  padding: 20px 0;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  color: #909399;
}

.loading-text .el-icon {
  margin-right: 8px;
  animation: rotating 2s linear infinite;
}

.analysis-section {
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(20px);
  animation: fade-in-up 0.5s ease forwards;
}

.analysis-section:nth-child(1) {
  animation-delay: 0.1s;
}

.analysis-section:nth-child(2) {
  animation-delay: 0.3s;
}

.analysis-section:nth-child(3) {
  animation-delay: 0.5s;
}

.analysis-section:nth-child(4) {
  animation-delay: 0.7s;
}

.analysis-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  transition: all 0.3s ease;
  position: relative;
}

.analysis-section h4::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #409eff;
  transition: width 0.4s ease;
}

.analysis-section:hover h4::after {
  width: 100px;
}

.diagnosis-content {
  line-height: 1.6;
}

.diagnosis-content :deep(p) {
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.diagnosis-content :deep(p:hover) {
  background-color: #f5f7fa;
  padding-left: 8px;
}

.diagnosis-content :deep(ul), .diagnosis-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

.analysis-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  animation-delay: 1s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.el-timeline-item {
  position: relative;
  padding-bottom: 20px;
  transition: all 0.3s ease;
}

.el-timeline-item:hover {
  transform: translateX(5px);
}

.el-timeline-item__node {
  transition: all 0.3s ease;
}

.el-timeline-item:hover .el-timeline-item__node {
  transform: scale(1.2);
  background-color: #409eff;
}

.el-timeline-item__wrapper {
  transition: all 0.3s ease;
}

.el-timeline-item:hover .el-timeline-item__wrapper {
  transform: translateX(5px);
}

.el-step {
  transition: all 0.3s ease;
}

.el-step:hover {
  transform: translateX(5px);
}

.el-step__title {
  transition: all 0.3s ease;
}

.el-step:hover .el-step__title {
  color: #409eff;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 768px) {
  .video-container {
    padding: 12px;
  }
  
  .upload-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selected-file {
    margin-bottom: 12px;
  }
  
  .video-actions {
    flex-direction: column;
  }
}
</style>