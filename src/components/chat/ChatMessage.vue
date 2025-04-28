<template>
  <div class="message-container" :class="[`message-${message.role}`, { 'animate-in': animateIn }]">
    <div class="message-avatar">
      <el-avatar v-if="message.role === 'user'" icon="User" />
      <el-avatar v-else icon="ChatDotRound" :color="'#409EFF'" />
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
        <el-icon><Document /></el-icon>
        <span class="file-name">{{ getFileName }}</span>
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
          style="width: 200px; max-height: 200px;"
        />
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
    const animateIn = ref(false)
    
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
    
    onMounted(() => {
      setTimeout(() => {
        animateIn.value = true
      }, 100)
    })
    
    return {
      formatTime,
      formatContent,
      getFileName,
      animateIn
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 24px;
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
  margin: 0 12px;
  transition: transform 0.3s ease;
}

.message-avatar:hover {
  transform: scale(1.1);
}

.message-content {
  max-width: 70%;
  border-radius: 8px;
  padding: 12px 16px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.message-content:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-user .message-content {
  background-color: #ecf5ff;
  border-radius: 8px 2px 8px 8px;
  transform-origin: right top;
}

.message-assistant .message-content {
  background-color: #f5f7fa;
  border-radius: 2px 8px 8px 8px;
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
    transform: scale(0.8) translateX(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
}

@keyframes pop-in-left {
  0% {
    transform: scale(0.8) translateX(-10px);
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
  margin-bottom: 4px;
}

.message-status.error {
  color: #f56c6c;
}

.message-status .el-icon {
  margin-right: 4px;
  animation: spin 1s linear infinite;
}

.file-message {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.file-message:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.file-name {
  margin: 0 8px;
  word-break: break-all;
}

.file-download {
  margin-left: auto;
  color: #409eff;
  transition: all 0.2s ease;
}

.file-download:hover {
  transform: scale(1.2);
}

.text-message {
  line-height: 1.6;
  word-break: break-word;
  transition: all 0.3s ease;
}

.text-message :deep(pre) {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
  transition: all 0.3s ease;
}

.text-message :deep(pre):hover {
  background-color: #eaedf1;
}

.image-message {
  margin: 8px 0;
}

@media screen and (max-width: 768px) {
  .message-content {
    max-width: 80%;
  }
}
</style>