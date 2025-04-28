import http from './http'

// 上传视频
export function uploadVideo(file) {
  const formData = new FormData()
  formData.append('video', file)
  return http.post('/video/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // 上传进度事件
    onUploadProgress: progressEvent => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      console.log(percentCompleted)
    }
  })
}

// 获取视频分析结果
export function getVideoAnalysis(videoId) {
  return http.get(`/video/analysis/${videoId}`)
} 