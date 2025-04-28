import { defineStore } from 'pinia'
import { getChatHistory, sendMessage, uploadFile } from '../api/chat'
import { ElMessage } from 'element-plus'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    loading: false,
    uploading: false,
    uploadProgress: 0
  }),
  
  getters: {
    sortedMessages: (state) => {
      return [...state.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }
  },
  
  actions: {
    // 获取聊天历史
    async fetchChatHistory() {
      try {
        this.loading = true
        const response = await getChatHistory()
        this.messages = response.data
        return response.data
      } catch (error) {
        console.error('获取聊天历史失败:', error)
        ElMessage.error('获取聊天历史失败')
        return []
      } finally {
        this.loading = false
      }
    },
    
    // 发送消息
    async sendUserMessage(content) {
      const tempId = Date.now().toString()
      const message = {
        id: tempId,
        content:content,
        type: 'text',
        role: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      }
      
      // 先添加消息到列表
      this.messages.push(message)
      
      try {
        this.loading = true
        const response = await sendMessage({ "prompt": content })
        
        // 更新消息状态
        const index = this.messages.findIndex(msg => msg.id === tempId)
        if (index !== -1) {
          this.messages[index] = {
            ...this.messages[index],
            id: response.data.id || tempId,
            status: 'sent'
          }
        }
        
        // 添加 AI 回复
        if (response.data.text) {
          this.messages.push({
            id: response.data.id,
            content: response.data.text,
            type: 'text',
            role: 'assistant',
            timestamp: new Date().toISOString(),
            status: 'received'
          })
        }

        console.log(this.messages)
        return response.data
      } catch (error) {
        console.error('发送消息失败:', error)
        
        // 更新消息状态为失败
        const index = this.messages.findIndex(msg => msg.id === tempId)
        if (index !== -1) {
          this.messages[index] = {
            ...this.messages[index],
            status: 'failed'
          }
        }
        
        ElMessage.error('发送消息失败，请重试')
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 上传文件
    async uploadFileAction(file) {
      try {
        this.uploading = true
        this.uploadProgress = 0
        
        // 先添加上传中的消息
        const tempId = Date.now().toString()
        const message = {
          id: tempId,
          content: `正在上传文件: ${file.name}`,
          type: 'file',
          role: 'user',
          timestamp: new Date().toISOString(),
          status: 'uploading',
          file: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        }
        
        this.messages.push(message)
        
        const response = await uploadFile(file)
        
        // 更新消息状态
        const index = this.messages.findIndex(msg => msg.id === tempId)
        if (index !== -1) {
          this.messages[index] = {
            ...this.messages[index],
            id: response.data.id || tempId,
            content: `文件: ${file.name}`,
            status: 'sent',
            file: {
              ...this.messages[index].file,
              url: response.data.fileUrl
            }
          }
        }
        
        // 添加 AI 回复
        if (response.data.reply) {
          this.messages.push({
            id: response.data.replyId,
            content: response.data.reply,
            type: 'text',
            role: 'assistant',
            timestamp: new Date().toISOString(),
            status: 'received'
          })
        }
        
        ElMessage.success('文件上传成功')
        return response.data
      } catch (error) {
        console.error('文件上传失败:', error)
        
        // 更新消息状态为失败
        const index = this.messages.findIndex(msg => msg.status === 'uploading')
        if (index !== -1) {
          this.messages[index] = {
            ...this.messages[index],
            content: `文件上传失败: ${file.name}`,
            status: 'failed'
          }
        }
        
        ElMessage.error('文件上传失败，请重试')
        throw error
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },
    
    // 重发消息
    async resendMessage(messageId) {
      const message = this.messages.find(msg => msg.id === messageId)
      if (!message) return
      
      // 如果是文件消息，需要重新上传
      if (message.type === 'file') {
        // 这里通常需要获取原始文件进行重新上传
        // 由于我们没有存储原始文件对象，这里仅演示逻辑
        ElMessage.info('文件消息重发需要重新选择文件')
        return
      }
      
      // 删除原消息
      this.messages = this.messages.filter(msg => msg.id !== messageId)
      
      // 重新发送文本消息
      return this.sendUserMessage(message.content)
    },
    
    // 清空聊天记录
    clearMessages() {
      this.messages = []
    }
  }
}) 