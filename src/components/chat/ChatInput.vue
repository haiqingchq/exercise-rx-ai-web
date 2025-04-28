<template>
  <div class="chat-input-container">
    <!-- 文件上传区域 -->
    <div v-if="showUpload" class="upload-area">
      <div class="upload-header">
        <h4>上传文件</h4>
        <el-button type="text" @click="showUpload = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <el-upload
        class="upload-content"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :multiple="false"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持文件格式：图片、PDF、Word、Excel等 (最大10MB)
          </div>
        </template>
      </el-upload>
      
      <div class="upload-footer">
        <el-button @click="showUpload = false">取消</el-button>
        <el-button type="primary" @click="submitFile" :loading="uploading">上传</el-button>
      </div>
    </div>
    
    <div class="input-main">
      <div class="input-tools">
        <el-tooltip content="上传文件" placement="top">
          <el-button type="text" @click="showUpload = true">
            <el-icon><Folder /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
      
      <el-input
        v-model="inputValue"
        type="textarea"
        :rows="2"
        placeholder="输入消息，按 Enter 发送，Shift + Enter 换行"
        resize="none"
        @keydown.enter.prevent="handleEnterPress"
      />
      
      <el-button 
        type="primary" 
        class="send-button" 
        :disabled="!canSend" 
        :loading="sending" 
        @click="sendMessage"
      >
        <el-icon><Position /></el-icon>
        发送
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ChatInput',
  
  props: {
    sending: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['send', 'upload'],
  
  setup(props, { emit }) {
    const inputValue = ref('')
    const showUpload = ref(false)
    const selectedFile = ref(null)
    
    const canSend = computed(() => inputValue.value.trim().length > 0)
    
    // 处理按 Enter 键发送消息
    const handleEnterPress = (e) => {
      // 如果按下 Shift 键，不处理发送
      if (e.shiftKey) return
      
      // 否则发送消息
      sendMessage()
    }
    
    // 发送消息
    const sendMessage = () => {
      if (!canSend.value || props.sending) return
      
      emit('send', inputValue.value)
      inputValue.value = ''
    }
    
    // 处理文件选择
    const handleFileChange = (file) => {
      selectedFile.value = file.raw
    }
    
    // 提交文件
    const submitFile = () => {
      if (!selectedFile.value) {
        ElMessage.warning('请先选择文件')
        return
      }
      
      // 检查文件大小（10MB）
      if (selectedFile.value.size > 10 * 1024 * 1024) {
        ElMessage.error('文件大小不能超过10MB')
        return
      }
      
      emit('upload', selectedFile.value)
      showUpload.value = false
      selectedFile.value = null
    }
    
    return {
      inputValue,
      showUpload,
      canSend,
      handleEnterPress,
      sendMessage,
      handleFileChange,
      submitFile
    }
  }
}
</script>

<style scoped>
.chat-input-container {
  position: relative;
}

.input-main {
  display: flex;
  align-items: flex-end;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-main:focus-within {
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.input-tools {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.input-tools .el-button {
  transition: all 0.3s ease;
}

.input-tools .el-button:hover {
  transform: scale(1.1);
  color: #409eff;
}

.send-button {
  margin-left: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.send-button:not(.is-disabled):hover {
  transform: translateY(-2px) scale(1.05);
}

.send-button:not(.is-disabled):active {
  transform: translateY(0) scale(0.95);
}

.upload-area {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 -2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 12px;
  z-index: 10;
  transform-origin: bottom center;
  animation: slide-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slide-up {
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.upload-header h4 {
  margin: 0;
  transition: color 0.3s ease;
}

.upload-header .el-button {
  transition: all 0.3s ease;
}

.upload-header .el-button:hover {
  transform: rotate(90deg);
}

.upload-content {
  margin-bottom: 16px;
}

.upload-content :deep(.el-upload-dragger) {
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-content :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-content :deep(.el-icon--upload) {
  transition: all 0.5s ease;
}

.upload-content:hover :deep(.el-icon--upload) {
  transform: translateY(-5px);
  color: #409eff;
}

.upload-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-footer .el-button {
  transition: all 0.3s ease;
}

.upload-footer .el-button:hover {
  transform: translateY(-2px);
}

.el-textarea :deep(.el-textarea__inner) {
  transition: all 0.3s ease;
  resize: none;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style> 