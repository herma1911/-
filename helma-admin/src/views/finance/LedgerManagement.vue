<template>
  <div class="ledger-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>账本管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="账本ID">
          <el-input v-model="searchForm.id" placeholder="请输入账本ID" />
        </el-form-item>
        <el-form-item label="工人姓名">
          <el-input v-model="searchForm.workerName" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="工厂名称">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="记工类型">
          <el-select v-model="searchForm.ledgerType" placeholder="请选择记工类型">
            <el-option label="计时" value="hourly" />
            <el-option label="计件" value="piece" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录时间">
          <el-date-picker
            v-model="searchForm.recordTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="ledgerList" style="width: 100%">
        <el-table-column prop="id" label="账本ID" width="120" />
        <el-table-column prop="workerName" label="工人姓名" width="120" />
        <el-table-column prop="factoryName" label="工厂名称" width="150" />
        <el-table-column prop="ledgerType" label="记工类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.ledgerType === 'hourly' ? 'info' : 'success'">
              {{ scope.row.ledgerType === 'hourly' ? '计时' : '计件' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workHours" label="工作时长" width="100" v-if="searchForm.ledgerType === 'hourly' || !searchForm.ledgerType">
          <template #default="scope">
            {{ scope.row.workHours || 0 }}小时
          </template>
        </el-table-column>
        <el-table-column prop="pieceCount" label="计件数量" width="100" v-if="searchForm.ledgerType === 'piece' || !searchForm.ledgerType">
          <template #default="scope">
            {{ scope.row.pieceCount || 0 }}件
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="100">
          <template #default="scope">
            ¥{{ scope.row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="recordTime" label="记录时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
              {{ scope.row.status === 'normal' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="markAbnormal(scope.row)" v-if="scope.row.status === 'normal'">标记异常</el-button>
            <el-button size="small" type="success" @click="markNormal(scope.row)" v-else>标记正常</el-button>
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
      title="账本详情"
      width="700px"
    >
      <el-form :model="currentLedger" label-width="120px">
        <el-form-item label="账本ID">
          <span>{{ currentLedger.id }}</span>
        </el-form-item>
        <el-form-item label="工人信息">
          <div>{{ currentLedger.workerName }} ({{ currentLedger.workerPhone }})</div>
        </el-form-item>
        <el-form-item label="工厂信息">
          <div>{{ currentLedger.factoryName }}</div>
        </el-form-item>
        <el-form-item label="记工类型">
          <el-tag :type="currentLedger.ledgerType === 'hourly' ? 'info' : 'success'">
            {{ currentLedger.ledgerType === 'hourly' ? '计时' : '计件' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="工作时长" v-if="currentLedger.ledgerType === 'hourly'">
          <span>{{ currentLedger.workHours }}小时</span>
        </el-form-item>
        <el-form-item label="计件数量" v-if="currentLedger.ledgerType === 'piece'">
          <span>{{ currentLedger.pieceCount }}件</span>
        </el-form-item>
        <el-form-item label="单价">
          <span>¥{{ currentLedger.unitPrice.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="金额">
          <span class="amount">¥{{ currentLedger.amount.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="记录时间">
          <span>{{ currentLedger.recordTime }}</span>
        </el-form-item>
        <el-form-item label="记录人">
          <span>{{ currentLedger.recorderName }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="currentLedger.status === 'normal' ? 'success' : 'danger'">
            {{ currentLedger.status === 'normal' ? '正常' : '异常' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="备注">
          <div>{{ currentLedger.remark || '无' }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
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
  ledgerType: '',
  recordTime: null,
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 账本列表
const ledgerList = ref([])

// 弹窗
const dialogVisible = ref(false)
const currentLedger = ref({})

// 模拟数据
const mockLedgers = [
  {
    id: 'L001',
    workerName: '张三',
    workerPhone: '138****1234',
    factoryName: '杭州服装厂',
    ledgerType: 'hourly',
    workHours: 8,
    pieceCount: 0,
    unitPrice: 20,
    amount: 160,
    recordTime: '2026-03-01 18:00:00',
    recorderName: '张经理',
    status: 'normal',
    remark: '正常工作日'
  },
  {
    id: 'L002',
    workerName: '李四',
    workerPhone: '139****5678',
    factoryName: '上海制衣厂',
    ledgerType: 'piece',
    workHours: 0,
    pieceCount: 100,
    unitPrice: 1.5,
    amount: 150,
    recordTime: '2026-03-01 19:00:00',
    recorderName: '李经理',
    status: 'normal',
    remark: '计件工资'
  },
  {
    id: 'L003',
    workerName: '王五',
    workerPhone: '137****9012',
    factoryName: '广州服装厂',
    ledgerType: 'hourly',
    workHours: 10,
    pieceCount: 0,
    unitPrice: 25,
    amount: 250,
    recordTime: '2026-03-02 20:00:00',
    recorderName: '王经理',
    status: 'abnormal',
    remark: '加班时间过长'
  },
  {
    id: 'L004',
    workerName: '赵六',
    workerPhone: '136****3456',
    factoryName: '深圳制衣厂',
    ledgerType: 'piece',
    workHours: 0,
    pieceCount: 150,
    unitPrice: 1.8,
    amount: 270,
    recordTime: '2026-03-02 18:30:00',
    recorderName: '赵经理',
    status: 'normal',
    remark: '正常计件'
  },
  {
    id: 'L005',
    workerName: '孙七',
    workerPhone: '135****7890',
    factoryName: '杭州服装厂',
    ledgerType: 'hourly',
    workHours: 8,
    pieceCount: 0,
    unitPrice: 22,
    amount: 176,
    recordTime: '2026-03-03 18:00:00',
    recorderName: '张经理',
    status: 'normal',
    remark: '正常工作日'
  }
]

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockLedgers.filter(item => {
    if (searchForm.id && !item.id.includes(searchForm.id)) return false
    if (searchForm.workerName && !item.workerName.includes(searchForm.workerName)) return false
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.ledgerType && item.ledgerType !== searchForm.ledgerType) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    return true
  })
  ledgerList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.recordTime = null
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentLedger.value = { ...row }
  dialogVisible.value = true
}

// 标记异常
const markAbnormal = (row) => {
  row.status = 'abnormal'
  ElMessage.success('标记异常成功')
  handleSearch()
}

// 标记正常
const markNormal = (row) => {
  row.status = 'normal'
  ElMessage.success('标记正常成功')
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
.ledger-management {
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

.amount {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
}

.dialog-footer {
  text-align: right;
}
</style>