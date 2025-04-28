<template>
  <div class="message-container" :class="[`message-${message.role}`, { 'animate-in': animateIn }]">
    <div class="message-avatar">
      <el-avatar v-if="message.role === 'user'" :size="40" class="user-avatar">
        {{ userInitial }}
      </el-avatar>
      <el-avatar v-else :size="40" class="ai-avatar">
        <el-icon><ChatDotRound /></el-icon>
      </el-avatar>
    </div>
    
    <div class="message-content">
      <!-- 消息状态提示 -->
      <div v-if="message.status === 'sending'" class="message-status">
        <el-icon><Loading /></el-icon>
        <span>正在发送...</span>
      </div>
      <div v-else-if="message.status === 'failed'" class="message-status error">
        <el-icon><CircleClose /></el-icon>
        <span>发送失败</span>
        <el-button type="text" size="small" @click="$emit('resend', message.id)">重新发送</el-button>
      </div>
      
      <!-- 文件消息 -->
      <div v-if="message.type === 'file'" class="file-message">
        <div class="file-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="file-info">
          <span class="file-name">{{ getFileName }}</span>
          <span class="file-size" v-if="message.file && message.file.size">{{ formatFileSize(message.file.size) }}</span>
        </div>
        <a v-if="message.file && message.file.url" :href="message.file.url" target="_blank" class="file-download">
          <el-icon><Download /></el-icon>
        </a>
      </div>
      
      <!-- 图片消息 -->
      <div v-else-if="message.type === 'image'" class="image-message">
        <el-image 
          :src="message.file?.url" 
          :preview-src-list="[message.file?.url]"
          fit="cover"
          loading="lazy"
          :initial-index="0"
          class="message-image"
        >
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
            </div>
          </template>
          <template #error>
            <div class="image-error">
              <el-icon><PictureFilled /></el-icon>
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      
      <!-- 文本消息 -->
      <div v-else class="text-message" v-html="formatContent"></div>
      
      <!-- 消息时间 -->
      <div class="message-time">{{ formatTime }}</div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { marked } from 'marked'
import { useUserStore } from '../../store/user'

export default {
  name: 'ChatMessage',
  
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  
  emits: ['resend'],
  
  setup(props) {
    const userStore = useUserStore()
    const animateIn = ref(false)
    
    // 获取用户名首字母
    const userInitial = computed(() => {
      const username = userStore.userInfo?.username || '用户'
      return username.charAt(0).toUpperCase()
    })
    
    // 格式化时间
    const formatTime = computed(() => {
      const date = new Date(props.message.timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    // 格式化内容（支持markdown）
    const formatContent = computed(() => {
      if (!props.message.content) return ''
      
      if (props.message.role === 'assistant') {
        return marked(props.message.content)
      }
      
      return props.message.content.replace(/\n/g, '<br>')
    })
    
    // 获取文件名
    const getFileName = computed(() => {
      if (props.message.file) {
        return props.message.file.name
      }
      return props.message.content
    })
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return ''
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    onMounted(() => {
      setTimeout(() => {
        animateIn.value = true
      }, 100)
    })
    
    return {
      formatTime,
      formatContent,
      getFileName,
      formatFileSize,
      animateIn,
      userInitial
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 32px;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  will-change: transform, opacity;
}

.message-container.animate-in {
  transform: translateY(0);
  opacity: 1;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 16px;
  transition: transform 0.3s ease;
  align-self: flex-start;
}

.message-avatar:hover {
  transform: scale(1.1);
}

.user-avatar {
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(38, 126, 255, 0.3);
}

.ai-avatar {
  background: linear-gradient(135deg, #7d56f3 0%, #5f6df8 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(95, 109, 248, 0.3);
}

.message-content {
  max-width: 70%;
  padding: 0;
  position: relative;
}

.message-user .message-content {
  transform-origin: right top;
}

.message-assistant .message-content {
  transform-origin: left top;
}

.message-user.animate-in .message-content {
  animation: pop-in-right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.message-assistant.animate-in .message-content {
  animation: pop-in-left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in-right {
  0% {
    transform: scale(0.9) translateX(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
}

@keyframes pop-in-left {
  0% {
    transform: scale(0.9) translateX(-10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  text-align: right;
  transition: opacity 0.3s ease;
  opacity: 0.7;
}

.message-content:hover .message-time {
  opacity: 1;
}

.message-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  padding-left: 4px;
}

.message-status.error {
  color: #f56c6c;
}

.message-status .el-icon {
  margin-right: 4px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.file-message {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.message-user .file-message {
  background: linear-gradient(135deg, #e8f3ff 0%, #d6e9ff 100%);
}

.message-assistant .file-message {
  background: white;
}

.file-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.file-icon {
  background: rgba(64, 158, 255, 0.1);
  color: #267eff;
  height: 40px;
  width: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.file-download {
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  color: #267eff;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.file-download:hover {
  transform: scale(1.1);
  background: rgba(64, 158, 255, 0.2);
}

.text-message {
  line-height: 1.6;
  word-break: break-word;
  transition: all 0.3s ease;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.message-user .text-message {
  background: linear-gradient(135deg, #e8f3ff 0%, #d6e9ff 100%);
  color: #303133;
  border-top-right-radius: 2px;
}

.message-assistant .text-message {
  background: white;
  color: #303133;
  border-top-left-radius: 2px;
}

.text-message :deep(pre) {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.text-message :deep(pre):hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.text-message :deep(code) {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}

.text-message :deep(a) {
  color: #267eff;
  text-decoration: none;
  transition: all 0.2s ease;
}

.text-message :deep(a:hover) {
  text-decoration: underline;
}

.text-message :deep(ul), .text-message :deep(ol) {
  padding-left: 20px;
  margin: 12px 0;
}

.text-message :deep(ul li), .text-message :deep(ol li) {
  margin-bottom: 8px;
}

.text-message :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 16px;
  border-left: 4px solid #267eff;
  background-color: rgba(38, 126, 255, 0.05);
  border-radius: 2px;
}

.image-message {
  margin: 8px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.image-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.message-image {
  max-width: 300px;
  border-radius: 12px;
}

.image-loading, .image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  height: 150px;
  width: 300px;
  border-radius: 12px;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

@media screen and (max-width: 768px) {
  .message-container {
    margin-bottom: 24px;
  }
  
  .message-content {
    max-width: 80%;
  }
  
  .message-avatar {
    margin: 0 8px;
  }
  
  .text-message, .file-message {
    padding: 12px;
  }
  
  .message-image {
    max-width: 240px;
  }
  
  .image-loading, .image-error {
    width: 240px;
    height: 120px;
  }
}
</style>