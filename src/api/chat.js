import http from './http'

// 获取聊天历史
export function getChatHistory() {
  return http.get('/v1/chat/history')
}

// 获取特定会话的消息
export function getSessionMessages(sessionId) {
  return http.get(`/v1/llm/get_session_messages?session_id=${sessionId}`)
}

// 发送消息
export function sendMessage(data) {
  return http.post('/v1/llm/chat', data)
}

// 上传文件
export function uploadFile(file, sessionId) {
  const formData = new FormData()
  formData.append('file', file)
  if (sessionId) {
    formData.append('session_id', sessionId)
  }
  return http.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 创建新的聊天会话
export function createChatSession() {
  return http.post('/v1/llm/create_session')
}

// 获取所有聊天会话
export function getAllSessions() {
  return http.get('/v1/llm/get_sessions')
} 