import http from './http'

/**
 * 获取用户详细信息
 */
export function getUserDetail() {
  return http({
    url: '/user/detail',
    method: 'get'
  })
}

/**
 * 更新用户基本信息
 * @param {Object} data 用户信息
 */
export function updateUserInfo(data) {
  return http({
    url: '/user/update',
    method: 'post',
    data
  })
}

/**
 * 上传用户病历/病史文件
 * @param {File} file 文件对象
 */
export function uploadMedicalRecord(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return http({
    url: '/user/medical-record/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // 上传进度事件
    onUploadProgress: progressEvent => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      console.log('上传进度:', percentCompleted)
    }
  })
}

/**
 * 获取用户病历/病史文件列表
 */
export function getMedicalRecords() {
  return http({
    url: '/user/medical-records',
    method: 'get'
  })
}

/**
 * 删除用户病历/病史文件
 * @param {String} fileId 文件ID
 */
export function deleteMedicalRecord(fileId) {
  return http({
    url: `/user/medical-record/${fileId}`,
    method: 'delete'
  })
} 