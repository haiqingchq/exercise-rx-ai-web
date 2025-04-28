import { defineStore } from 'pinia'
// eslint-disable-next-line no-unused-vars
import { getUserDetail, updateUserInfo, uploadMedicalRecord, getMedicalRecords, deleteMedicalRecord } from '../api/user'
import { ElMessage } from 'element-plus'

export const useUserCenterStore = defineStore('userCenter', {
  state: () => ({
    userDetail: null,
    medicalRecords: [],
    loading: false,
    uploading: false,
    uploadProgress: 0
  }),
  
  getters: {
    // 按照上传时间排序的病历记录
    sortedMedicalRecords: (state) => {
      return [...state.medicalRecords].sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
    }
  },
  
  actions: {
    // 获取用户详细信息
    async fetchUserDetail() {
      try {
        this.loading = true
        // 实际应用中应该使用API调用，这里模拟响应
        // const response = await getUserDetail()
        // 模拟数据 - 实际项目中请替换为真实API调用
        const mockResponse = {
          code: 200,
          data: {
            id: '123456',
            username: localStorage.getItem('username') || '用户名',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            realName: '张三',
            gender: '男',
            age: 35,
            phone: '138****1234',
            email: 'zhangsan@example.com',
            address: '北京市朝阳区',
            medicalHistory: '无明显病史',
            joinTime: '2023-01-15'
          }
        }
        this.userDetail = mockResponse.data
        return mockResponse.data
      } catch (error) {
        console.error('获取用户详情失败:', error)
        ElMessage.error('获取用户详情失败')
        return null
      } finally {
        this.loading = false
      }
    },
    
    // 更新用户信息
    async updateUserInfo(userData) {
      try {
        this.loading = true
        // 实际应用中应该使用API调用，这里模拟响应
        // const response = await updateUserInfo(userData)
        // 模拟成功响应
        this.userDetail = {
          ...this.userDetail,
          ...userData
        }
        ElMessage.success('用户信息更新成功')
        return true
      } catch (error) {
        console.error('更新用户信息失败:', error)
        ElMessage.error('更新用户信息失败')
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 上传病历文件
    async uploadMedicalRecord(file) {
      try {
        this.uploading = true
        this.uploadProgress = 0
        
        // 实际应用中应该使用API调用，这里模拟上传进度和响应
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          this.uploadProgress += 10
          if (this.uploadProgress >= 100) {
            clearInterval(progressInterval)
          }
        }, 300)
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // 模拟成功响应
        const mockResponse = {
          code: 200,
          data: {
            id: Date.now().toString(),
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadTime: new Date().toISOString(),
            url: URL.createObjectURL(file)
          }
        }
        
        // 添加到病历记录列表
        this.medicalRecords.push(mockResponse.data)
        
        ElMessage.success('病历上传成功')
        return mockResponse.data
      } catch (error) {
        console.error('上传病历失败:', error)
        ElMessage.error('上传病历失败')
        return null
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },
    
    // 获取病历记录列表
    async fetchMedicalRecords() {
      try {
        this.loading = true
        
        // 实际应用中应该使用API调用，这里模拟响应
        // const response = await getMedicalRecords()
        
        // 如果已有数据则使用现有数据
        if (this.medicalRecords.length > 0) {
          return this.medicalRecords
        }
        
        // 模拟病历数据
        const mockResponse = {
          code: 200,
          data: [
            {
              id: '1',
              filename: '体检报告.pdf',
              fileSize: 2048576,  // 2MB
              fileType: 'application/pdf',
              uploadTime: '2023-05-15T10:30:00Z',
              description: '2023年度体检报告'
            },
            {
              id: '2',
              filename: '心电图检查.jpg',
              fileSize: 1048576,  // 1MB
              fileType: 'image/jpeg',
              uploadTime: '2023-06-20T14:20:00Z',
              description: '心电图检查结果'
            }
          ]
        }
        
        this.medicalRecords = mockResponse.data
        return mockResponse.data
      } catch (error) {
        console.error('获取病历记录失败:', error)
        ElMessage.error('获取病历记录失败')
        return []
      } finally {
        this.loading = false
      }
    },
    
    // 删除病历记录
    async deleteMedicalRecord(fileId) {
      try {
        this.loading = true
        
        // 实际应用中应该使用API调用，这里模拟响应
        // await deleteMedicalRecord(fileId)
        
        // 从列表中移除
        this.medicalRecords = this.medicalRecords.filter(record => record.id !== fileId)
        
        ElMessage.success('病历记录删除成功')
        return true
      } catch (error) {
        console.error('删除病历记录失败:', error)
        ElMessage.error('删除病历记录失败')
        return false
      } finally {
        this.loading = false
      }
    }
  }
}) 