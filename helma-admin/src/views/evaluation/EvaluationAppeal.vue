<template>
  <div class="evaluation-appeal">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>评价申诉管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="申诉ID">
          <el-input v-model="searchForm.id" placeholder="请输入申诉ID" />
        </el-form-item>
        <el-form-item label="申诉人">
          <el-input v-model="searchForm.appellantName" placeholder="请输入申诉人" />
        </el-form-item>
        <el-form-item label="所属工厂">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="申诉状态">
          <el-select v-model="searchForm.status" placeholder="请选择申诉状态">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="申诉时间">
          <el-date-picker
            v-model="searchForm.appealTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="appealList" style="width: 100%">
        <el-table-column prop="id" label="申诉ID" width="120" />
        <el-table-column prop="appellantName" label="申诉人" width="120" />
        <el-table-column prop="appellantType" label="申诉人类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.appellantType === 'worker' ? 'info' : 'success'">
              {{ scope.row.appellantType === 'worker' ? '工人' : '工厂' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="factoryName" label="所属工厂" width="150" />
        <el-table-column prop="evaluationId" label="评价ID" width="120" />
        <el-table-column prop="appealReason" label="申诉原因" show-overflow-tooltip />
        <el-table-column prop="appealTime" label="申诉时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="process(scope.row)" v-if="scope.row.status === 'pending'">处理</el-button>
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
      title="申诉详情"
      width="700px"
    >
      <el-form :model="currentAppeal" label-width="120px">
        <el-form-item label="申诉ID">
          <span>{{ currentAppeal.id }}</span>
        </el-form-item>
        <el-form-item label="申诉人">
          <div>{{ currentAppeal.appellantName }} ({{ currentAppeal.appellantPhone }})</div>
        </el-form-item>
        <el-form-item label="申诉人类型">
          <el-tag :type="currentAppeal.appellantType === 'worker' ? 'info' : 'success'">
            {{ currentAppeal.appellantType === 'worker' ? '工人' : '工厂' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="所属工厂">
          <div>{{ currentAppeal.factoryName }}</div>
        </el-form-item>
        <el-form-item label="评价ID">
          <el-button size="small" type="primary" @click="viewEvaluation">查看评价</el-button>
        </el-form-item>
        <el-form-item label="申诉原因">
          <div>{{ currentAppeal.appealReason }}</div>
        </el-form-item>
        <el-form-item label="申诉时间">
          <span>{{ currentAppeal.appealTime }}</span>
        </el-form-item>
        <el-form-item label="申诉状态">
          <el-tag :type="getStatusType(currentAppeal.status)">
            {{ getStatusText(currentAppeal.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="处理意见">
          <div v-if="currentAppeal.processOpinion">{{ currentAppeal.processOpinion }}</div>
          <div v-else class="text-gray">未处理</div>
        </el-form-item>
        <el-form-item label="处理时间">
          <span v-if="currentAppeal.processTime">{{ currentAppeal.processTime }}</span>
          <span v-else class="text-gray">未处理</span>
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
      title="处理申诉"
      width="600px"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="processForm.result">
            <el-radio label="approved">支持申诉</el-radio>
            <el-radio label="rejected">驳回申诉</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input
            v-model="processForm.opinion"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
        <el-form-item label="处理方式" v-if="processForm.result === 'approved'">
          <el-checkbox-group v-model="processForm.actions">
            <el-checkbox label="删除评价">删除评价</el-checkbox>
            <el-checkbox label="修改评价">修改评价</el-checkbox>
            <el-checkbox label="其他处理">其他处理</el-checkbox>
          </el-checkbox-group>
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
  appellantName: '',
  factoryName: '',
  status: '',
  appealTime: null
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 申诉列表
const appealList = ref([])

// 弹窗
const dialogVisible = ref(false)
const processDialogVisible = ref(false)
const currentAppeal = ref({})
const processForm = reactive({
  result: 'rejected',
  opinion: '',
  actions: []
})

// 模拟数据
const mockAppeals = [
  {
    id: 'A001',
    appellantName: '张三',
    appellantPhone: '138****1234',
    appellantType: 'worker',
    factoryName: '杭州服装厂',
    evaluationId: 'E001',
    appealReason: '评价内容与事实不符，工厂环境很好，管理规范',
    appealTime: '2026-03-01 10:00:00',
    status: 'pending',
    processOpinion: '',
    processTime: null
  },
  {
    id: 'A002',
    appellantName: '杭州服装厂',
    appellantPhone: '139****5678',
    appellantType: 'factory',
    factoryName: '杭州服装厂',
    evaluationId: 'E005',
    appealReason: '评价内容恶意诋毁，与事实严重不符',
    appealTime: '2026-03-01 14:00:00',
    status: 'processed',
    processOpinion: '经审核，评价内容确实存在恶意诋毁，已删除该评价',
    processTime: '2026-03-02 09:00:00'
  },
  {
    id: 'A003',
    appellantName: '李四',
    appellantPhone: '137****9012',
    appellantType: 'worker',
    factoryName: '上海制衣厂',
    evaluationId: 'E002',
    appealReason: '工厂承诺的薪资与实际不符',
    appealTime: '2026-03-02 09:00:00',
    status: 'pending',
    processOpinion: '',
    processTime: null
  },
  {
    id: 'A004',
    appellantName: '上海制衣厂',
    appellantPhone: '136****3456',
    appellantType: 'factory',
    factoryName: '上海制衣厂',
    evaluationId: 'E004',
    appealReason: '评价人未实际入职，属于恶意评价',
    appealTime: '2026-03-02 11:00:00',
    status: 'rejected',
    processOpinion: '经审核，评价人确实已入职，评价内容属实，驳回申诉',
    processTime: '2026-03-02 15:00:00'
  },
  {
    id: 'A005',
    appellantName: '王五',
    appellantPhone: '135****7890',
    appellantType: 'worker',
    factoryName: '广州服装厂',
    evaluationId: 'E003',
    appealReason: '工厂管理混乱，薪资发放不及时',
    appealTime: '2026-03-02 15:00:00',
    status: 'pending',
    processOpinion: '',
    processTime: null
  }
]

// 状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    processed: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    processed: '已处理',
    rejected: '已驳回'
  }
  return textMap[status] || '未知'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockAppeals.filter(item => {
    if (searchForm.id && !item.id.includes(searchForm.id)) return false
    if (searchForm.appellantName && !item.appellantName.includes(searchForm.appellantName)) return false
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    return true
  })
  appealList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.appealTime = null
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentAppeal.value = { ...row }
  dialogVisible.value = true
}

// 查看评价
const viewEvaluation = () => {
  ElMessage.success('跳转到评价详情')
}

// 处理
const process = (row) => {
  currentAppeal.value = { ...row }
  processForm.result = 'rejected'
  processForm.opinion = ''
  processForm.actions = []
  processDialogVisible.value = true
}

// 确认处理
const confirmProcess = () => {
  ElMessage.success('处理成功')
  processDialogVisible.value = false
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
.evaluation-appeal {
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

.dialog-footer {
  text-align: right;
}
</style>