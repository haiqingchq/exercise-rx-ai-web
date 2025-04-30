<template>
  <div class="allergies-tab">
    <div class="tab-header">
      <h3>过敏信息</h3>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon> 添加过敏信息
      </el-button>
    </div>
    
    <!-- 过敏信息列表 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="!allergies.length" class="empty-data">
      <el-empty description="暂无过敏信息记录">
        <template #image>
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
        </template>
        <el-button type="primary" @click="openAddDialog">添加过敏信息</el-button>
      </el-empty>
    </div>
    
    <div v-else class="allergies-list">
      <el-table :data="allergies" style="width: 100%" border stripe>
        <el-table-column prop="allergen" label="过敏原" min-width="150">
          <template #default="{row}">
            <div class="allergen-cell">
              <el-tag size="small" :type="getAllergenTagType(row.allergenType)" effect="dark">
                {{ row.allergenType }}
              </el-tag>
              <span class="allergen-name">{{ row.allergen }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="120">
          <template #default="{row}">
            <el-tag size="small" :type="getSeverityTagType(row.severity)">
              {{ row.severity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="症状" min-width="200" show-overflow-tooltip />
        <el-table-column prop="firstOccurrence" label="首次发生" width="120" />
        <el-table-column prop="verificationStatus" label="状态" width="100">
          <template #default="{row}">
            <el-tag size="small" effect="plain" :type="row.verificationStatus === '已确认' ? 'success' : 'info'">
              {{ row.verificationStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{row, $index}">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="editAllergy(row, $index)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-popconfirm
                title="确定要删除这条过敏信息吗？"
                @confirm="deleteAllergy($index)"
                confirm-button-type="danger"
                icon="WarningFilled"
                icon-color="#F56C6C"
              >
                <template #reference>
                  <el-button type="danger" link size="small">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 添加或编辑过敏信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑过敏信息' : '添加过敏信息'"
      width="600px"
    >
      <el-form :model="formData" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="过敏原类型" prop="allergenType">
          <el-select v-model="formData.allergenType" placeholder="请选择过敏原类型" style="width: 100%">
            <el-option label="药物" value="药物" />
            <el-option label="食物" value="食物" />
            <el-option label="环境" value="环境" />
            <el-option label="昆虫" value="昆虫" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="过敏原" prop="allergen">
          <el-input v-model="formData.allergen" placeholder="请输入过敏原名称" />
        </el-form-item>
        <el-form-item label="严重程度" prop="severity">
          <el-select v-model="formData.severity" placeholder="请选择严重程度" style="width: 100%">
            <el-option label="轻度" value="轻度" />
            <el-option label="中度" value="中度" />
            <el-option label="重度" value="重度" />
            <el-option label="致命" value="致命" />
          </el-select>
        </el-form-item>
        <el-form-item label="症状" prop="symptoms">
          <el-input v-model="formData.symptoms" type="textarea" :rows="2" placeholder="请描述过敏症状" />
        </el-form-item>
        <el-form-item label="首次发生" prop="firstOccurrence">
          <el-date-picker
            v-model="formData.firstOccurrence"
            type="date"
            placeholder="选择首次发生日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="verificationStatus">
          <el-select v-model="formData.verificationStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="疑似" value="疑似" />
            <el-option label="已确认" value="已确认" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="formData.notes" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AllergiesTab',
  
  setup() {
    const loading = ref(true)
    const allergies = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const editIndex = ref(-1)
    const submitLoading = ref(false)
    
    const formRef = ref(null)
    const formData = reactive({
      allergenType: '',
      allergen: '',
      severity: '',
      symptoms: '',
      firstOccurrence: '',
      verificationStatus: '',
      notes: ''
    })
    
    const rules = {
      allergenType: [{ required: true, message: '请选择过敏原类型', trigger: 'change' }],
      allergen: [{ required: true, message: '请输入过敏原名称', trigger: 'blur' }],
      severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
      symptoms: [{ required: true, message: '请描述过敏症状', trigger: 'blur' }]
    }
    
    // 根据过敏原类型获取标签类型
    const getAllergenTagType = (type) => {
      const typeMap = {
        '药物': 'danger',
        '食物': 'warning',
        '环境': 'success',
        '昆虫': 'info',
        '其他': ''
      }
      return typeMap[type] || ''
    }
    
    // 根据严重程度获取标签类型
    const getSeverityTagType = (severity) => {
      const severityMap = {
        '轻度': 'info',
        '中度': 'warning',
        '重度': 'danger',
        '致命': 'error'
      }
      return severityMap[severity] || ''
    }
    
    // 获取过敏信息列表
    const fetchAllergies = () => {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        allergies.value = [
          {
            allergenType: '药物',
            allergen: '青霉素',
            severity: '重度',
            symptoms: '皮疹、荨麻疹、呼吸困难',
            firstOccurrence: '2020-03-15',
            verificationStatus: '已确认',
            notes: '需要注意避免使用含青霉素的所有药物'
          },
          {
            allergenType: '食物',
            allergen: '花生',
            severity: '致命',
            symptoms: '过敏性休克、呼吸困难、喉头水肿',
            firstOccurrence: '2015-06-23',
            verificationStatus: '已确认',
            notes: '随身携带肾上腺素自动注射器'
          },
          {
            allergenType: '环境',
            allergen: '花粉',
            severity: '中度',
            symptoms: '流鼻涕、打喷嚏、眼睛发痒',
            firstOccurrence: '2018-04-10',
            verificationStatus: '已确认',
            notes: '春季特别严重'
          }
        ]
        loading.value = false
      }, 1000)
    }
    
    // 打开添加对话框
    const openAddDialog = () => {
      isEdit.value = false
      editIndex.value = -1
      
      // 重置表单数据
      Object.keys(formData).forEach(key => {
        formData[key] = ''
      })
      
      dialogVisible.value = true
    }
    
    // 编辑过敏信息
    const editAllergy = (item, index) => {
      isEdit.value = true
      editIndex.value = index
      
      // 填充表单数据
      Object.keys(formData).forEach(key => {
        formData[key] = item[key]
      })
      
      dialogVisible.value = true
    }
    
    // 删除过敏信息
    const deleteAllergy = (index) => {
      allergies.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true
          
          try {
            // 模拟API调用
            setTimeout(() => {
              if (isEdit.value) {
                // 编辑现有记录
                allergies.value[editIndex.value] = { ...formData }
                ElMessage.success('更新成功')
              } else {
                // 添加新记录
                allergies.value.push({ ...formData })
                ElMessage.success('添加成功')
              }
              
              dialogVisible.value = false
              submitLoading.value = false
            }, 1000)
          } catch (error) {
            console.error('保存过敏信息失败:', error)
            ElMessage.error('操作失败，请重试')
            submitLoading.value = false
          }
        }
      })
    }
    
    onMounted(() => {
      fetchAllergies()
    })
    
    return {
      loading,
      allergies,
      dialogVisible,
      isEdit,
      submitLoading,
      formRef,
      formData,
      rules,
      getAllergenTagType,
      getSeverityTagType,
      openAddDialog,
      editAllergy,
      deleteAllergy,
      submitForm
    }
  }
}
</script>

<style scoped>
.allergies-tab {
  padding: 16px 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.loading-container {
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-data {
  padding: 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 60px;
  color: #909399;
}

.allergies-list {
  margin-bottom: 24px;
}

.allergen-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.allergen-name {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
}
</style> 