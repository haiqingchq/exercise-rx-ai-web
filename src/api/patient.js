import http from './http'

/**
 * 患者基本信息管理API
 */

// 创建患者信息, 创建用户的时候，就会在数据库中创建一条患者记录，所以这个api是不需要用的。
export function createPatient(data) {
  return http({
    url: '/v1/patients/',
    method: 'post',
    data
  })
}

// 获取患者列表
export function getPatients(params) {
  return http({
    url: '/v1/patients/',
    method: 'get',
    params
  })
}

// 获取患者详情
export function getPatient(patientId) {
  return http({
    url: `/v1/patients/${patientId}`,
    method: 'get'
  })
}

// 更新患者信息
export function updatePatient(patientId, data) {
  return http({
    url: `/v1/patients/${patientId}`,
    method: 'put',
    data
  })
}

// 删除患者信息
export function deletePatient(patientId) {
  return http({
    url: `/v1/patients/${patientId}`,
    method: 'delete'
  })
}

// 根据用户ID获取患者信息
export function getPatientByUserId(userId) {
  return http({
    url: `/v1/patients/user/${userId}`,
    method: 'get'
  })
}

// 搜索患者
export function searchPatients(query, limit = 10) {
  return http({
    url: '/v1/patients/search/',
    method: 'get',
    params: { query, limit }
  })
}

/**
 * 病史记录管理API
 */

// 创建病史记录
export function createMedicalRecord(data) {
  return http({
    url: '/v1/medical-records/',
    method: 'post',
    data
  })
}

// 获取病史记录列表
export function getMedicalRecords(params) {
  return http({
    url: '/v1/medical-records/',
    method: 'get',
    params
  })
}

// 获取病史记录详情
export function getMedicalRecord(recordId) {
  return http({
    url: `/v1/medical-records/${recordId}`,
    method: 'get'
  })
}

// 更新病史记录
export function updateMedicalRecord(recordId, data) {
  return http({
    url: `/v1/medical-records/${recordId}`,
    method: 'put',
    data
  })
}

// 删除病史记录
export function deleteMedicalRecord(recordId) {
  return http({
    url: `/v1/medical-records/${recordId}`,
    method: 'delete'
  })
}

// 获取患者的所有病史记录
export function getPatientMedicalRecords(patientId, params) {
  return http({
    url: `/v1/medical-records/patient/${patientId}`,
    method: 'get',
    params
  })
}

/**
 * 医学影像管理API
 */

// 创建医学影像
export function createMedicalImage(data) {
  return http({
    url: '/v1/medical-images/',
    method: 'post',
    data
  })
}

// 获取医学影像列表
export function getMedicalImages(params) {
  return http({
    url: '/v1/medical-images/',
    method: 'get',
    params
  })
}

// 获取医学影像详情
export function getMedicalImage(imageId) {
  return http({
    url: `/v1/medical-images/${imageId}`,
    method: 'get'
  })
}

// 更新医学影像
export function updateMedicalImage(imageId, data) {
  return http({
    url: `/v1/medical-images/${imageId}`,
    method: 'put',
    data
  })
}

// 删除医学影像
export function deleteMedicalImage(imageId) {
  return http({
    url: `/v1/medical-images/${imageId}`,
    method: 'delete'
  })
}

// 获取患者的所有医学影像
export function getPatientMedicalImages(patientId, params) {
  return http({
    url: `/v1/medical-images/patient/${patientId}`,
    method: 'get',
    params
  })
}

/**
 * 检验报告管理API
 */

// 创建检验报告
export function createMedicalReport(data) {
  return http({
    url: '/v1/medical-reports/',
    method: 'post',
    data
  })
}

// 获取检验报告列表
export function getMedicalReports(params) {
  return http({
    url: '/v1/medical-reports/',
    method: 'get',
    params
  })
}

// 获取检验报告详情
export function getMedicalReport(reportId) {
  return http({
    url: `/v1/medical-reports/${reportId}`,
    method: 'get'
  })
}

// 更新检验报告
export function updateMedicalReport(reportId, data) {
  return http({
    url: `/v1/medical-reports/${reportId}`,
    method: 'put',
    data
  })
}

// 删除检验报告
export function deleteMedicalReport(reportId) {
  return http({
    url: `/v1/medical-reports/${reportId}`,
    method: 'delete'
  })
}

// 获取患者的所有检验报告
export function getPatientMedicalReports(patientId, params) {
  return http({
    url: `/v1/medical-reports/patient/${patientId}`,
    method: 'get',
    params
  })
}

/**
 * 过敏信息管理API
 */

// 创建过敏信息
export function createAllergy(data) {
  return http({
    url: '/v1/allergies/',
    method: 'post',
    data
  })
}

// 获取过敏信息列表
export function getAllergies(params) {
  return http({
    url: '/v1/allergies/',
    method: 'get',
    params
  })
}

// 获取过敏信息详情
export function getAllergy(allergyId) {
  return http({
    url: `/v1/allergies/${allergyId}`,
    method: 'get'
  })
}

// 更新过敏信息
export function updateAllergy(allergyId, data) {
  return http({
    url: `/v1/allergies/${allergyId}`,
    method: 'put',
    data
  })
}

// 删除过敏信息
export function deleteAllergy(allergyId) {
  return http({
    url: `/v1/allergies/${allergyId}`,
    method: 'delete'
  })
}

// 获取患者的所有过敏信息
export function getPatientAllergies(patientId, params) {
  return http({
    url: `/v1/allergies/patient/${patientId}`,
    method: 'get',
    params
  })
}

/**
 * 处方管理API
 */

// 创建处方
export function createPrescription(data) {
  return http({
    url: '/v1/prescriptions/',
    method: 'post',
    data
  })
}

// 获取处方列表
export function getPrescriptions(params) {
  return http({
    url: '/v1/prescriptions/',
    method: 'get',
    params
  })
}

// 获取处方详情
export function getPrescription(prescriptionId) {
  return http({
    url: `/v1/prescriptions/${prescriptionId}`,
    method: 'get'
  })
}

// 更新处方
export function updatePrescription(prescriptionId, data) {
  return http({
    url: `/v1/prescriptions/${prescriptionId}`,
    method: 'put',
    data
  })
}

// 删除处方
export function deletePrescription(prescriptionId) {
  return http({
    url: `/v1/prescriptions/${prescriptionId}`,
    method: 'delete'
  })
}

// 获取患者的所有处方
export function getPatientPrescriptions(patientId, params) {
  return http({
    url: `/v1/prescriptions/patient/${patientId}`,
    method: 'get',
    params
  })
}

// 为处方添加药品
export function addMedicationToPrescription(prescriptionId, data) {
  return http({
    url: `/v1/prescriptions/${prescriptionId}/medications`,
    method: 'post',
    data
  })
}

// 从处方中删除药品
export function deleteMedicationFromPrescription(medicationId) {
  return http({
    url: `/v1/prescriptions/medications/${medicationId}`,
    method: 'delete'
  })
}

/**
 * 药品管理API
 */

// 获取药品列表
export function getMedications(params) {
  return http({
    url: '/v1/medications/',
    method: 'get',
    params
  })
}

// 获取药品详情
export function getMedication(medicationId) {
  return http({
    url: `/v1/medications/${medicationId}`,
    method: 'get'
  })
}

// 创建药品
export function createMedication(prescriptionId, data) {
  return http({
    url: `/v1/medications/prescription/${prescriptionId}`,
    method: 'post',
    data
  })
}

// 更新药品
export function updateMedication(medicationId, data) {
  return http({
    url: `/v1/medications/${medicationId}`,
    method: 'put',
    data
  })
}

// 删除药品
export function deleteMedication(medicationId) {
  return http({
    url: `/v1/medications/${medicationId}`,
    method: 'delete'
  })
}

// 获取处方的所有药品
export function getPrescriptionMedications(prescriptionId, params) {
  return http({
    url: `/v1/medications/prescription/${prescriptionId}`,
    method: 'get',
    params
  })
}

/**
 * 文件上传API
 */

// 上传文件
export function uploadFile(file, bucket = 'exerciserxai', folder = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (bucket) formData.append('bucket', bucket)
  if (folder) formData.append('folder', folder)
  
  return http({
    url: '/v1/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取文件列表
export function getFiles(bucket = 'exerciserxai', prefix = '') {
  return http({
    url: '/v1/files/files',
    method: 'get',
    params: { bucket, prefix }
  })
}

// 获取文件URL
export function getFileUrl(bucket, objectName, expires = 3600) {
  return http({
    url: `/v1/files/file/${bucket}/${objectName}`,
    method: 'get',
    params: { expires }
  })
}

// 删除文件
export function deleteFile(bucket, objectName) {
  return http({
    url: `/v1/files/file/${bucket}/${objectName}`,
    method: 'delete'
  })
} 