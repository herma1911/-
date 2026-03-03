<template>
  <div class="application-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>应聘管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="岗位名称">
          <el-input v-model="searchForm.jobName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="工人姓名">
          <el-input v-model="searchForm.workerName" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="投递时间">
          <el-date-picker
            v-model="searchForm.deliveryTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="面试状态">
          <el-select v-model="searchForm.interviewStatus" placeholder="请选择面试状态">
            <el-option label="待面试" value="pending" />
            <el-option label="已面试" value="interviewed" />
            <el-option label="面试通过" value="passed" />
            <el-option label="面试失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职状态">
          <el-select v-model="searchForm.entryStatus" placeholder="请选择入职状态">
            <el-option label="待入职" value="pending" />
            <el-option label="已入职" value="entered" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="applicationList" style="width: 100%">
        <el-table-column prop="id" label="投递ID" width="100" />
        <el-table-column prop="workerName" label="工人姓名" width="120" />
        <el-table-column prop="workerPhone" label="联系电话" width="150" />
        <el-table-column prop="jobName" label="岗位名称" />
        <el-table-column prop="factoryName" label="工厂名称" width="150" />
        <el-table-column prop="deliveryTime" label="投递时间" width="180" />
        <el-table-column prop="interviewStatus" label="面试状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.interviewStatus)">
              {{ getStatusText(scope.row.interviewStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="entryStatus" label="入职状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.entryStatus)">
              {{ getStatusText(scope.row.entryStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="updateStatus(scope.row)">更新状态</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="应聘详情"
      width="700px"
    >
      <el-form :model="currentApplication" label-width="100px">
        <el-form-item label="投递ID">
          <span>{{ currentApplication.id }}</span>
        </el-form-item>
        <el-form-item label="工人信息">
          <div>{{ currentApplication.workerName }} ({{ currentApplication.workerPhone }})</div>
        </el-form-item>
        <el-form-item label="岗位信息">
          <div>{{ currentApplication.jobName }}</div>
          <div class="text-gray">{{ currentApplication.factoryName }}</div>
        </el-form-item>
        <el-form-item label="投递时间">
          <span>{{ currentApplication.deliveryTime }}</span>
        </el-form-item>
        <el-form-item label="面试状态">
          <el-tag :type="getStatusType(currentApplication.interviewStatus)">
            {{ getStatusText(currentApplication.interviewStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="面试时间">
          <span>{{ currentApplication.interviewTime || '未安排' }}</span>
        </el-form-item>
        <el-form-item label="入职状态">
          <el-tag :type="getStatusType(currentApplication.entryStatus)">
            {{ getStatusText(currentApplication.entryStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="currentApplication.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveRemark">保存备注</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 状态更新弹窗 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新状态"
      width="500px"
    >
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="面试状态">
          <el-select v-model="statusForm.interviewStatus" placeholder="请选择面试状态">
            <el-option label="待面试" value="pending" />
            <el-option label="已面试" value="interviewed" />
            <el-option label="面试通过" value="passed" />
            <el-option label="面试失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试时间">
          <el-date-picker
            v-model="statusForm.interviewTime"
            type="datetime"
            placeholder="请选择面试时间"
          />
        </el-form-item>
        <el-form-item label="入职状态">
          <el-select v-model="statusForm.entryStatus" placeholder="请选择入职状态">
            <el-option label="待入职" value="pending" />
            <el-option label="已入职" value="entered" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStatusUpdate">确认更新</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  jobName: '',
  workerName: '',
  deliveryTime: null,
  interviewStatus: '',
  entryStatus: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 应聘列表
const applicationList = ref([])

// 弹窗
const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const currentApplication = ref({})
const statusForm = reactive({
  interviewStatus: '',
  interviewTime: null,
  entryStatus: ''
})

// 模拟数据
const mockApplications = [
  {
    id: 'AP001',
    workerName: '张三',
    workerPhone: '138****1234',
    jobName: '缝纫工',
    factoryName: '杭州服装厂',
    deliveryTime: '2026-03-01 10:00:00',
    interviewStatus: 'passed',
    interviewTime: '2026-03-02 14:00:00',
    entryStatus: 'entered',
    remark: '面试通过，已安排入职'
  },
  {
    id: 'AP002',
    workerName: '李四',
    workerPhone: '139****5678',
    jobName: '裁剪工',
    factoryName: '上海制衣厂',
    deliveryTime: '2026-03-01 11:30:00',
    interviewStatus: 'interviewed',
    interviewTime: '2026-03-02 10:00:00',
    entryStatus: 'pending',
    remark: '等待面试结果'
  },
  {
    id: 'AP003',
    workerName: '王五',
    workerPhone: '137****9012',
    jobName: '熨烫工',
    factoryName: '广州服装厂',
    deliveryTime: '2026-03-01 14:20:00',
    interviewStatus: 'pending',
    entryStatus: 'pending',
    remark: ''
  },
  {
    id: 'AP004',
    workerName: '赵六',
    workerPhone: '136****3456',
    jobName: '包装工',
    factoryName: '深圳制衣厂',
    deliveryTime: '2026-03-01 16:45:00',
    interviewStatus: 'failed',
    interviewTime: '2026-03-02 09:30:00',
    entryStatus: 'rejected',
    remark: '技能不符合要求'
  },
  {
    id: 'AP005',
    workerName: '孙七',
    workerPhone: '135****7890',
    jobName: '缝纫工',
    factoryName: '杭州服装厂',
    deliveryTime: '2026-03-02 09:15:00',
    interviewStatus: 'pending',
    entryStatus: 'pending',
    remark: ''
  }
]

// 状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    interviewed: 'warning',
    passed: 'success',
    failed: 'danger',
    entered: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    interviewed: '已面试',
    passed: '通过',
    failed: '失败',
    entered: '已入职',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockApplications.filter(item => {
    if (searchForm.jobName && !item.jobName.includes(searchForm.jobName)) return false
    if (searchForm.workerName && !item.workerName.includes(searchForm.workerName)) return false
    if (searchForm.interviewStatus && item.interviewStatus !== searchForm.interviewStatus) return false
    if (searchForm.entryStatus && item.entryStatus !== searchForm.entryStatus) return false
    return true
  })
  applicationList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.deliveryTime = null
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentApplication.value = { ...row }
  dialogVisible.value = true
}

// 保存备注
const saveRemark = () => {
  ElMessage.success('备注保存成功')
  dialogVisible.value = false
}

// 更新状态
const updateStatus = (row) => {
  currentApplication.value = { ...row }
  statusForm.interviewStatus = row.interviewStatus
  statusForm.interviewTime = row.interviewTime
  statusForm.entryStatus = row.entryStatus
  statusDialogVisible.value = true
}

// 确认状态更新
const confirmStatusUpdate = () => {
  ElMessage.success('状态更新成功')
  statusDialogVisible.value = false
  handleSearch()
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  handleSearch()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  handleSearch()
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.application-management {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-gray {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.dialog-footer {
  text-align: right;
}
</style>