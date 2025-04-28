<template>
  <div class="chat-input-container">
    <!-- 文件上传区域 -->
    <div v-if="showUpload" class="upload-area">
      <div class="upload-header">
        <h4>上传文件</h4>
        <el-button type="text" @click="showUpload = false" class="close-btn">
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
        <div class="drag-content">
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <div class="el-upload__tip">
            支持文件格式：图片、PDF、Word、Excel等 (最大10MB)
          </div>
        </div>
      </el-upload>
      
      <div class="selected-file-area" v-if="selectedFile">
        <div class="selected-file">
          <el-icon class="file-type-icon"><Document /></el-icon>
          <div class="file-info">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
          <el-button type="text" class="remove-file" @click="selectedFile = null">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div class="upload-footer">
        <el-button @click="showUpload = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="submitFile" :loading="uploading" :disabled="!selectedFile">上传</el-button>
      </div>
    </div>
    
    <div class="input-main">
      <div class="input-tools">
        <el-tooltip content="上传文件" placement="top" :effect="'light'">
          <el-button type="text" @click="showUpload = true" class="tool-btn">
            <el-icon><FolderAdd /></el-icon>
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
        class="message-input"
        ref="messageInput"
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
import { ref, computed, nextTick } from 'vue'
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
    const messageInput = ref(null)
    
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
      
      // 发送完消息后，保持焦点在输入框
      nextTick(() => {
        messageInput.value?.focus()
      })
    }
    
    // 处理文件选择
    const handleFileChange = (file) => {
      selectedFile.value = file.raw
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return ''
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      selectedFile,
      messageInput,
      canSend,
      handleEnterPress,
      sendMessage,
      handleFileChange,
      submitFile,
      formatFileSize
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
  padding: 16px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-main:focus-within {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.input-tools {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.tool-btn {
  height: 40px;
  width: 40px;
  border-radius: 8px;
  font-size: 18px;
  color: #606266;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #267eff;
  transform: translateY(-2px);
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 8px 0;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.3s ease;
  height: auto;
  min-height: 40px;
  resize: none;
  color: #303133;
}

.message-input :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.message-input :deep(.el-textarea__inner::placeholder) {
  color: #909399;
}

.send-button {
  margin-left: 12px;
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  border: none;
}

.send-button .el-icon {
  margin-right: 4px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.send-button:not(.is-disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
}

.send-button:not(.is-disabled):hover .el-icon {
  transform: translateX(-2px);
}

.send-button:not(.is-disabled):active {
  transform: translateY(0);
}

.upload-area {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 16px;
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
  margin-bottom: 20px;
}

.upload-header h4 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.close-btn {
  height: 36px;
  width: 36px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: rotate(90deg);
}

.upload-content {
  margin-bottom: 16px;
}

.upload-content :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 32px 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(64, 158, 255, 0.02);
}

.upload-content :deep(.el-upload-dragger:hover) {
  border-color: #267eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48px;
  color: #267eff;
  margin-bottom: 16px;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.upload-content:hover .upload-icon {
  transform: translateY(-8px);
}

.upload-content :deep(.el-upload__text) {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-content :deep(.el-upload__text em) {
  color: #267eff;
  font-style: normal;
  font-weight: 600;
  cursor: pointer;
}

.upload-content :deep(.el-upload__tip) {
  color: #909399;
  font-size: 13px;
}

.selected-file-area {
  margin: 20px 0;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.05);
  padding: 12px;
}

.selected-file {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-type-icon {
  font-size: 24px;
  color: #267eff;
  background: rgba(64, 158, 255, 0.1);
  height: 44px;
  width: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.remove-file {
  color: #f56c6c;
  height: 36px;
  width: 36px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-file:hover {
  background: rgba(245, 108, 108, 0.1);
  transform: scale(1.1);
}

.upload-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  border-radius: 10px;
  height: 40px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-2px);
}

.upload-footer .el-button--primary {
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  border: none;
  border-radius: 10px;
  height: 40px;
  transition: all 0.3s ease;
}

.upload-footer .el-button--primary:not(.is-disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(38, 126, 255, 0.3);
}

@media screen and (max-width: 768px) {
  .input-main {
    padding: 12px;
    border-radius: 12px;
  }
  
  .upload-area {
    padding: 16px;
    border-radius: 12px;
  }
  
  .upload-header h4 {
    font-size: 16px;
  }
  
  .upload-content :deep(.el-upload-dragger) {
    padding: 24px 16px;
  }
  
  .upload-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }
  
  .tool-btn, .send-button {
    height: 40px;
  }
  
  .send-button {
    padding: 0 16px;
  }
}
</style> 