import { defineStore } from 'pinia'
import { uploadVideo, getVideoAnalysis } from '../api/video'
import { ElMessage } from 'element-plus'

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoData: null,
    analysisResult: null,
    loading: false,
    uploading: false,
    uploadProgress: 0,
    analyzing: false
  }),
  
  actions: {
    // 上传视频
    async uploadVideoAction(file) {
      try {
        this.uploading = true
        this.uploadProgress = 0
        this.videoData = {
          file: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          status: 'uploading'
        }
        
        const response = await uploadVideo(file)
        
        this.videoData = {
          ...this.videoData,
          id: response.data.videoId,
          url: response.data.videoUrl,
          status: 'uploaded'
        }
        
        ElMessage.success('视频上传成功')
        
        // 自动开始分析
        if (response.data.videoId) {
          await this.getAnalysisResult(response.data.videoId)
        }
        
        return response.data
      } catch (error) {
        console.error('视频上传失败:', error)
        this.videoData = {
          ...this.videoData,
          status: 'failed'
        }
        ElMessage.error('视频上传失败，请重试')
        throw error
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },
    
    // 获取视频分析结果
    async getAnalysisResult(videoId) {
      if (!videoId && this.videoData) {
        videoId = this.videoData.id
      }
      
      if (!videoId) {
        ElMessage.warning('没有可分析的视频')
        return null
      }
      
      try {
        this.analyzing = true
        const response = await getVideoAnalysis(videoId)
        this.analysisResult = response.data
        
        if (response.data.status === 'completed') {
          ElMessage.success('视频分析完成')
        } else if (response.data.status === 'processing') {
          ElMessage.info('视频正在分析中，请稍后刷新查看结果')
          
          // 如果正在处理，可以设置定时任务继续轮询
          setTimeout(() => {
            this.getAnalysisResult(videoId)
          }, 5000)
        }
        
        return response.data
      } catch (error) {
        console.error('获取视频分析结果失败:', error)
        ElMessage.error('获取视频分析结果失败')
        return null
      } finally {
        this.analyzing = false
      }
    },
    
    // 重置状态
    resetState() {
      this.videoData = null
      this.analysisResult = null
      this.uploading = false
      this.analyzing = false
      this.uploadProgress = 0
    }
  }
}) 