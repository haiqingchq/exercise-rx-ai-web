<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-left">
        <h2><el-icon><ChatDotRound /></el-icon> 智能问诊</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            <el-avatar :size="32" class="user-avatar">{{ userInfo?.username?.charAt(0) || '用' }}</el-avatar>
            {{ userInfo?.username || '用户' }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="clearChat">
                <el-icon><Delete /></el-icon> 清空聊天记录
              </el-dropdown-item>
              <el-dropdown-item command="viewVideo">
                <el-icon><Film /></el-icon> 视频解析
              </el-dropdown-item>
              <el-dropdown-item command="userCenter">
                <el-icon><User /></el-icon> 用户中心
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="!messages.length" class="welcome-container">
        <div class="welcome-content">
          <div class="welcome-header">
            <el-icon class="welcome-icon"><ChatDotRound /></el-icon>
            <h3>欢迎使用基于多模态大模型的个性化处方生成系统</h3>
          </div>
          <p class="welcome-description">您可以上传您的病例、医学检查结果等信息，与AI进行对话，获取个性化的处方建议。</p>
          <div class="welcome-tips">
            <el-card class="tip-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Document /></el-icon>
                  <span>上传资料</span>
                </div>
              </template>
              <div class="card-content">
                上传您的病例、检查报告等医疗资料，AI会分析这些信息
              </div>
            </el-card>
            
            <el-card class="tip-card">
              <template #header>
                <div class="card-header">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>详细描述</span>
                </div>
              </template>
              <div class="card-content">
                详细描述您的症状、病史、用药情况等，AI会给出更精准的建议
              </div>
            </el-card>
            
            <el-card class="tip-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Film /></el-icon>
                  <span>视频解析</span>
                </div>
              </template>
              <div class="card-content">
                您还可以上传相关视频进行分析，获取更全面的健康建议
              </div>
            </el-card>
          </div>
        </div>
      </div>
      
      <!-- 聊天消息列表 -->
      <template v-else>
        <chat-message 
          v-for="message in sortedMessages" 
          :key="message.id" 
          :message="message"
          @resend="handleResend"
        />
      </template>
      
      <!-- 加载更多按钮 -->
      <div v-if="hasMoreMessages" class="load-more">
        <el-button type="primary" plain size="small" @click="loadMoreMessages">
          <el-icon><TopLeft /></el-icon> 加载更多消息
        </el-button>
      </div>
    </div>
    
    <div class="chat-input-area">
      <chat-input
        :sending="loading"
        :uploading="uploading"
        @send="handleSendMessage"
        @upload="handleUploadFile"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useUserStore } from '../store/user'
import { useChatStore } from '../store/chat'
import { useRouter } from 'vue-router'
import ChatMessage from '../components/chat/ChatMessage.vue'
import ChatInput from '../components/chat/ChatInput.vue'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'ChatView',
  
  components: {
    ChatMessage,
    ChatInput
  },
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const chatStore = useChatStore()
    
    const messagesContainer = ref(null)
    const hasMoreMessages = ref(false)
    
    // 计算属性
    const messages = computed(() => chatStore.messages)
    const sortedMessages = computed(() => chatStore.sortedMessages)
    const userInfo = computed(() => userStore.userInfo)
    const loading = computed(() => chatStore.loading)
    const uploading = computed(() => chatStore.uploading)
    
    // 获取聊天记录
    const fetchChatHistory = async () => {
      try {
        await chatStore.fetchChatHistory()
        scrollToBottom()
      } catch (error) {
        console.error('获取聊天记录失败:', error)
      }
    }
    
    // 发送消息
    const handleSendMessage = async (content) => {
      try {
        await chatStore.sendUserMessage(content)
        scrollToBottom()
      } catch (error) {
        console.error('发送消息失败:', error)
      }
    }
    
    // 上传文件
    const handleUploadFile = async (file) => {
      try {
        await chatStore.uploadFileAction(file)
        scrollToBottom()
      } catch (error) {
        console.error('上传文件失败:', error)
      }
    }
    
    // 重发消息
    const handleResend = async (messageId) => {
      try {
        await chatStore.resendMessage(messageId)
        scrollToBottom()
      } catch (error) {
        console.error('重发消息失败:', error)
      }
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    // 加载更多消息
    const loadMoreMessages = () => {
      // 此处应该调用加载更多消息的API
      // 由于是演示，这里暂不实现
      hasMoreMessages.value = false
    }
    
    // 处理下拉菜单命令
    const handleCommand = (command) => {
      if (command === 'clearChat') {
        ElMessageBox.confirm('确定要清空所有聊天记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          chatStore.clearMessages()
        }).catch(() => {})
      } else if (command === 'logout') {
        userStore.logoutAction()
      } else if (command === 'viewVideo') {
        router.push('/video')
      } else if (command === 'userCenter') {
        router.push('/user-center')
      }
    }
    
    // 监听消息变化
    watch(messages, () => {
      scrollToBottom()
    })
    
    onMounted(async () => {
      await userStore.fetchUserInfo()
      await fetchChatHistory()
    })
    
    return {
      messages,
      sortedMessages,
      userInfo,
      loading,
      uploading,
      messagesContainer,
      hasMoreMessages,
      handleSendMessage,
      handleUploadFile,
      handleResend,
      loadMoreMessages,
      handleCommand
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafc;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 24px;
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h2 .el-icon {
  font-size: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: #f9fafc;
  background-image: 
    radial-gradient(#e4f0ff 1px, transparent 1px),
    radial-gradient(#e4f0ff 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  scroll-behavior: smooth;
}

.chat-input-area {
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 5;
}

.load-more {
  text-align: center;
  margin: 20px 0;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.welcome-content {
  max-width: 900px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  animation: fadeUp 0.8s ease forwards;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-icon {
  font-size: 48px;
  color: #267eff;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #18a1ff 0%, #267eff 100%);
  color: white;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(38, 126, 255, 0.3);
  animation: pulse 2s infinite;
}

.welcome-content h3 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #303133;
  text-align: center;
  font-weight: 600;
}

.welcome-description {
  color: #606266;
  margin-bottom: 40px;
  text-align: center;
  font-size: 16px;
  line-height: 1.6;
}

.welcome-tips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 30px;
}

.tip-card {
  width: 240px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.tip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #f0f4ff, #e6f0ff);
  padding: 16px;
}

.card-header .el-icon {
  margin-right: 8px;
  color: #267eff;
  font-size: 20px;
}

.card-header span {
  font-weight: 600;
  color: #303133;
}

.card-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  background: white;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(38, 126, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(38, 126, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(38, 126, 255, 0);
  }
}

@media screen and (max-width: 768px) {
  .welcome-content {
    padding: 30px 20px;
  }
  
  .welcome-tips {
    flex-direction: column;
    align-items: center;
  }
  
  .tip-card {
    width: 100%;
    max-width: 320px;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .header-left h2 {
    font-size: 18px;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .chat-input-area {
    padding: 12px 16px;
  }
}
</style> 