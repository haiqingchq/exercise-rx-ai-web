<template>
  <div class="chat-container">
    <header-nav 
      title="智能问诊" 
      icon="ChatDotRound" 
      :show-clear-chat="true"
      @clearChat="clearChat"
    />
    
    <div class="chat-content">
      <!-- 左侧聊天列表区域 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <el-button type="primary" @click="startNewChat" class="new-chat-btn">
            <el-icon><Plus /></el-icon> 新建聊天
          </el-button>
        </div>
        
        <div class="chat-history">
          <div class="history-title">聊天历史</div>
          <el-empty v-if="chatHistoryList.length === 0" description="暂无聊天历史" />
          <div 
            v-for="(chat, index) in chatHistoryList" 
            :key="index" 
            class="history-item"
            :class="{ 'active': currentChatId === chat.session_id }"
            @click="switchChat(chat.session_id)"
          >
            <div class="history-item-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="history-item-content">
              <div class="history-item-title">{{ chat.title || '新的对话' }}</div>
              <div class="history-item-time">{{ formatDate(chat.updated_at || chat.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧聊天内容区域 -->
      <div class="chat-main">
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
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useUserStore } from '../store/user'
import { useChatStore } from '../store/chat'
import ChatMessage from '../components/chat/ChatMessage.vue'
import ChatInput from '../components/chat/ChatInput.vue'
import HeaderNav from '../components/common/HeaderNav.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, ChatDotRound, Document, TopLeft } from '@element-plus/icons-vue'

export default {
  name: 'ChatView',
  
  components: {
    ChatMessage,
    ChatInput,
    HeaderNav,
    Plus,
    ChatDotRound,
    Document,
    TopLeft
  },
  
  setup() {
    const userStore = useUserStore()
    const chatStore = useChatStore()
    
    const messagesContainer = ref(null)
    const hasMoreMessages = ref(false)
    const chatHistoryList = computed(() => chatStore.sortedSessions)
    const currentChatId = ref(null)
    
    // 计算属性
    const messages = computed(() => chatStore.messages)
    const sortedMessages = computed(() => chatStore.sortedMessages)
    const userInfo = computed(() => userStore.userInfo)
    const loading = computed(() => chatStore.loading)
    const uploading = computed(() => chatStore.uploading)
    
    // 获取聊天记录
    const fetchChatHistory = async () => {
      try {
        // 获取所有会话列表
        await chatStore.fetchAllSessions()
        
        // 默认选中第一个聊天
        if (chatHistoryList.value.length > 0) {
          currentChatId.value = chatHistoryList.value[0].session_id
        }
        
        scrollToBottom()
      } catch (error) {
        console.error('获取聊天记录失败:', error)
      }
    }
    
    // 发送消息
    const handleSendMessage = async (content) => {
      try {
        if (!currentChatId.value) {
          ElMessage.warning('请先选择一个聊天会话或创建新的会话')
          return
        }
        await chatStore.sendUserMessage(content, currentChatId.value)
        scrollToBottom()
      } catch (error) {
        console.error('发送消息失败:', error)
      }
    }
    
    // 上传文件
    const handleUploadFile = async (file) => {
      try {
        if (!currentChatId.value) {
          ElMessage.warning('请先选择一个聊天会话或创建新的会话')
          return
        }
        await chatStore.uploadFileAction(file, currentChatId.value)
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
      // 实现加载更多消息的逻辑
      console.log('加载更多消息')
    }
    
    // 清空聊天记录
    const clearChat = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要清空所有聊天记录吗？此操作不可撤销',
          '清空聊天记录',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        await chatStore.clearChatHistory()
      } catch (error) {
        console.log('用户取消了清空聊天记录操作')
      }
    }
    
    // 新建聊天
    const startNewChat = async () => {
      try {
        // 调用API创建新会话
        const response = await chatStore.createNewSession()
        
        // 清空当前聊天内容
        chatStore.clearMessages()
        
        // 获取会话列表（包含新创建的会话）
        await chatStore.fetchAllSessions()
        
        // 设置为当前活动聊天（使用返回的会话ID）
        if (response && response.session_id) {
          currentChatId.value = response.session_id
        }
        
      } catch (error) {
        console.error('新建聊天失败:', error)
      }
    }
    
    // 切换聊天
    const switchChat = async (chatId) => {
      try {
        currentChatId.value = chatId
        // 从服务器加载该聊天的消息
        await chatStore.fetchSessionMessages(chatId)
        scrollToBottom()
      } catch (error) {
        console.error('加载会话消息失败:', error)
      }
    }
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      const now = new Date()
      const chatDate = new Date(date)
      
      // 今天的消息只显示时间
      if (chatDate.toDateString() === now.toDateString()) {
        return chatDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      // 一周内的消息显示星期几
      const daysDiff = Math.floor((now - chatDate) / (1000 * 60 * 60 * 24))
      if (daysDiff < 7) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return weekdays[chatDate.getDay()]
      }
      
      // 其他显示日期
      return chatDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    }
    
    onMounted(() => {
      fetchChatHistory()
      
      // 设置自动滚动到底部
      watch(
        () => messages.value.length,
        () => {
          scrollToBottom()
        }
      )
    })
    
    return {
      messagesContainer,
      messages,
      sortedMessages,
      userInfo,
      loading,
      uploading,
      hasMoreMessages,
      chatHistoryList,
      currentChatId,
      handleSendMessage,
      handleUploadFile,
      handleResend,
      loadMoreMessages,
      clearChat,
      startNewChat,
      switchChat,
      formatDate
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.chat-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧聊天列表样式 */
.chat-sidebar {
  width: 260px;
  background-color: #fff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.new-chat-btn {
  width: 100%;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.history-title {
  padding: 12px 16px;
  font-size: 14px;
  color: #909399;
  font-weight: bold;
  border-bottom: 1px solid #ebeef5;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f2f5;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item.active {
  background-color: #ecf5ff;
}

.history-item-icon {
  margin-right: 12px;
  color: var(--el-color-primary);
}

.history-item-content {
  flex: 1;
  overflow: hidden;
}

.history-item-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-time {
  font-size: 12px;
  color: #909399;
}

/* 右侧聊天内容样式 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.welcome-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.welcome-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  margin-right: 10px;
}

.welcome-description {
  color: #666;
  margin-bottom: 30px;
}

.welcome-tips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.tip-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-header .el-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.card-content {
  color: #666;
  line-height: 1.5;
}

.chat-input-area {
  margin-top: auto;
  padding: 10px 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.load-more {
  text-align: center;
  margin: 10px 0;
}
</style> 