<template>
  <div class="reconciliation-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>对账管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="对账ID">
          <el-input v-model="searchForm.id" placeholder="请输入对账ID" />
        </el-form-item>
        <el-form-item label="工人姓名">
          <el-input v-model="searchForm.workerName" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="工厂名称">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="发起时间">
          <el-date-picker
            v-model="searchForm.initiateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="确认状态">
          <el-select v-model="searchForm.confirmStatus" placeholder="请选择确认状态">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="reconciliationList" style="width: 100%">
        <el-table-column prop="id" label="对账ID" width="120" />
        <el-table-column prop="workerName" label="工人姓名" width="120" />
        <el-table-column prop="factoryName" label="工厂名称" width="150" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="initiateTime" label="发起时间" width="180" />
        <el-table-column prop="confirmStatus" label="确认状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.confirmStatus)">
              {{ getStatusText(scope.row.confirmStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="confirmTime" label="确认时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="process(scope.row)" v-if="scope.row.confirmStatus === 'pending'">处理</el-button>
            <el-button size="small" type="success" @click="exportVoucher(scope.row)">导出凭证</el-button>
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
      title="对账详情"
      width="800px"
    >
      <el-form :model="currentReconciliation" label-width="120px">
        <el-form-item label="对账ID">
          <span>{{ currentReconciliation.id }}</span>
        </el-form-item>
        <el-form-item label="工人信息">
          <div>{{ currentReconciliation.workerName }} ({{ currentReconciliation.workerPhone }})</div>
        </el-form-item>
        <el-form-item label="工厂信息">
          <div>{{ currentReconciliation.factoryName }}</div>
        </el-form-item>
        <el-form-item label="对账金额">
          <span class="amount">¥{{ currentReconciliation.amount.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="发起时间">
          <span>{{ currentReconciliation.initiateTime }}</span>
        </el-form-item>
        <el-form-item label="确认状态">
          <el-tag :type="getStatusType(currentReconciliation.confirmStatus)">
            {{ getStatusText(currentReconciliation.confirmStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="确认时间">
          <span v-if="currentReconciliation.confirmTime">{{ currentReconciliation.confirmTime }}</span>
          <span v-else class="text-gray">未确认</span>
        </el-form-item>
        <el-form-item label="凭证信息">
          <div v-if="currentReconciliation.credentials && currentReconciliation.credentials.length > 0">
            <el-image
              v-for="(credential, index) in currentReconciliation.credentials"
              :key="index"
              :src="credential"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px;"
            />
          </div>
          <div v-else class="text-gray">无凭证</div>
        </el-form-item>
        <el-form-item label="备注">
          <div>{{ currentReconciliation.remark || '无' }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 处理弹窗 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理对账"
      width="600px"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="processForm.result">
            <el-radio label="confirmed">确认</el-radio>
            <el-radio label="rejected">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input
            v-model="processForm.opinion"
            type="textarea"
            :rows="3"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcess">确认处理</el-button>
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
  id: '',
  workerName: '',
  factoryName: '',
  initiateTime: null,
  confirmStatus: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对账列表
const reconciliationList = ref([])

// 弹窗
const dialogVisible = ref(false)
const processDialogVisible = ref(false)
const currentReconciliation = ref({})
const processForm = reactive({
  result: 'confirmed',
  opinion: ''
})

// 模拟数据
const mockReconciliations = [
  {
    id: 'R001',
    workerName: '张三',
    workerPhone: '138****1234',
    factoryName: '杭州服装厂',
    amount: 1600,
    initiateTime: '2026-03-01 10:00:00',
    confirmStatus: 'confirmed',
    confirmTime: '2026-03-01 14:00:00',
    credentials: [
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100'
    ],
    remark: '2月份工资对账'
  },
  {
    id: 'R002',
    workerName: '李四',
    workerPhone: '139****5678',
    factoryName: '上海制衣厂',
    amount: 1500,
    initiateTime: '2026-03-01 11:00:00',
    confirmStatus: 'pending',
    confirmTime: null,
    credentials: [
      'https://via.placeholder.com/100'
    ],
    remark: '2月份工资对账'
  },
  {
    id: 'R003',
    workerName: '王五',
    workerPhone: '137****9012',
    factoryName: '广州服装厂',
    amount: 2500,
    initiateTime: '2026-03-02 09:00:00',
    confirmStatus: 'rejected',
    confirmTime: '2026-03-02 10:00:00',
    credentials: [],
    remark: '2月份工资对账，金额有误'
  },
  {
    id: 'R004',
    workerName: '赵六',
    workerPhone: '136****3456',
    factoryName: '深圳制衣厂',
    amount: 2700,
    initiateTime: '2026-03-02 10:00:00',
    confirmStatus: 'pending',
    confirmTime: null,
    credentials: [
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100'
    ],
    remark: '2月份工资对账'
  },
  {
    id: 'R005',
    workerName: '孙七',
    workerPhone: '135****7890',
    factoryName: '杭州服装厂',
    amount: 1760,
    initiateTime: '2026-03-03 09:00:00',
    confirmStatus: 'confirmed',
    confirmTime: '2026-03-03 10:00:00',
    credentials: [
      'https://via.placeholder.com/100'
    ],
    remark: '2月份工资对账'
  }
]

// 状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待确认',
    confirmed: '已确认',
    rejected: '已驳回'
  }
  return textMap[status] || '未知'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockReconciliations.filter(item => {
    if (searchForm.id && !item.id.includes(searchForm.id)) return false
    if (searchForm.workerName && !item.workerName.includes(searchForm.workerName)) return false
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.confirmStatus && item.confirmStatus !== searchForm.confirmStatus) return false
    return true
  })
  reconciliationList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.initiateTime = null
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentReconciliation.value = { ...row }
  dialogVisible.value = true
}

// 处理
const process = (row) => {
  currentReconciliation.value = { ...row }
  processForm.result = 'confirmed'
  processForm.opinion = ''
  processDialogVisible.value = true
}

// 确认处理
const confirmProcess = () => {
  ElMessage.success('处理成功')
  processDialogVisible.value = false
  handleSearch()
}

// 导出凭证
const exportVoucher = (row) => {
  ElMessage.success('凭证导出成功')
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
.reconciliation-management {
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
}

.amount {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
}

.dialog-footer {
  text-align: right;
}
</style>