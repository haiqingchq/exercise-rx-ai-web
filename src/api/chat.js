import http from './http'

// 获取聊天历史
export function getChatHistory() {
  return http.get('/v1/chat/history')
}

// 发送消息
export function sendMessage(data) {
  return http.post('/v1/llm/chat', data)
}

// 上传文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 