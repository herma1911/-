<template>
  <div class="evaluation-audit">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>评价审核</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="评价ID">
          <el-input v-model="searchForm.id" placeholder="请输入评价ID" />
        </el-form-item>
        <el-form-item label="评价人">
          <el-input v-model="searchForm.evaluatorName" placeholder="请输入评价人" />
        </el-form-item>
        <el-form-item label="所属工厂">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="评价类型">
          <el-select v-model="searchForm.evaluationType" placeholder="请选择评价类型">
            <el-option label="入职核心评价" value="core" />
            <el-option label="路人评价" value="passerby" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="searchForm.submitTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="auditList" style="width: 100%">
        <el-table-column prop="id" label="评价ID" width="120" />
        <el-table-column prop="evaluatorName" label="评价人" width="120" />
        <el-table-column prop="factoryName" label="所属工厂" width="150" />
        <el-table-column prop="evaluationType" label="评价类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.evaluationType === 'core' ? 'success' : 'info'">
              {{ scope.row.evaluationType === 'core' ? '入职核心评价' : '路人评价' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="100">
          <template #default="scope">
            <div class="score">
              <el-rate v-model="scope.row.score" disabled />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" show-overflow-tooltip />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="audit(scope.row)">审核</el-button>
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
      title="评价详情"
      width="700px"
    >
      <el-form :model="currentEvaluation" label-width="120px">
        <el-form-item label="评价ID">
          <span>{{ currentEvaluation.id }}</span>
        </el-form-item>
        <el-form-item label="评价人">
          <div>{{ currentEvaluation.evaluatorName }} ({{ currentEvaluation.evaluatorPhone }})</div>
        </el-form-item>
        <el-form-item label="所属工厂">
          <div>{{ currentEvaluation.factoryName }}</div>
        </el-form-item>
        <el-form-item label="评价类型">
          <el-tag :type="currentEvaluation.evaluationType === 'core' ? 'success' : 'info'">
            {{ currentEvaluation.evaluationType === 'core' ? '入职核心评价' : '路人评价' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="currentEvaluation.score" disabled />
        </el-form-item>
        <el-form-item label="评价内容">
          <div>{{ currentEvaluation.content }}</div>
        </el-form-item>
        <el-form-item label="提交时间">
          <span>{{ currentEvaluation.submitTime }}</span>
        </el-form-item>
        <el-form-item label="关联入职记录">
          <div v-if="currentEvaluation.onboardingId">
            <el-button size="small" type="primary" @click="viewOnboarding">查看入职记录</el-button>
          </div>
          <div v-else class="text-gray">无关联入职记录</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="评价审核"
      width="500px"
    >
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">驳回</el-radio>
            <el-radio label="blocked">屏蔽</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.opinion"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAudit">确认审核</el-button>
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
  evaluatorName: '',
  factoryName: '',
  evaluationType: '',
  submitTime: null
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 审核列表
const auditList = ref([])

// 弹窗
const dialogVisible = ref(false)
const auditDialogVisible = ref(false)
const currentEvaluation = ref({})
const auditForm = reactive({
  result: 'approved',
  opinion: ''
})

// 模拟数据
const mockAudits = [
  {
    id: 'E001',
    evaluatorName: '张三',
    evaluatorPhone: '138****1234',
    factoryName: '杭州服装厂',
    evaluationType: 'core',
    score: 5,
    content: '工厂环境很好，管理规范，薪资发放及时，非常满意！',
    submitTime: '2026-03-01 10:00:00',
    onboardingId: 'OB001'
  },
  {
    id: 'E002',
    evaluatorName: '李四',
    evaluatorPhone: '139****5678',
    factoryName: '上海制衣厂',
    evaluationType: 'core',
    score: 4,
    content: '工作环境不错，管理比较规范，薪资发放及时',
    submitTime: '2026-03-01 14:00:00',
    onboardingId: 'OB002'
  },
  {
    id: 'E003',
    evaluatorName: '王五',
    evaluatorPhone: '137****9012',
    factoryName: '广州服装厂',
    evaluationType: 'passerby',
    score: 3,
    content: '工厂一般，管理有待改进',
    submitTime: '2026-03-02 09:00:00',
    onboardingId: null
  },
  {
    id: 'E004',
    evaluatorName: '赵六',
    evaluatorPhone: '136****3456',
    factoryName: '深圳制衣厂',
    evaluationType: 'core',
    score: 2,
    content: '工厂环境差，管理混乱，薪资发放不及时',
    submitTime: '2026-03-02 11:00:00',
    onboardingId: 'OB004'
  },
  {
    id: 'E005',
    evaluatorName: '孙七',
    evaluatorPhone: '135****7890',
    factoryName: '杭州服装厂',
    evaluationType: 'passerby',
    score: 1,
    content: '非常差的工厂，不建议去',
    submitTime: '2026-03-02 15:00:00',
    onboardingId: null
  }
]

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockAudits.filter(item => {
    if (searchForm.id && !item.id.includes(searchForm.id)) return false
    if (searchForm.evaluatorName && !item.evaluatorName.includes(searchForm.evaluatorName)) return false
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.evaluationType && item.evaluationType !== searchForm.evaluationType) return false
    return true
  })
  auditList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.submitTime = null
  handleSearch()
}

// 查看详情
const viewDetail = (row) => {
  currentEvaluation.value = { ...row }
  dialogVisible.value = true
}

// 查看入职记录
const viewOnboarding = () => {
  ElMessage.success('跳转到入职记录详情')
}

// 审核
const audit = (row) => {
  currentEvaluation.value = { ...row }
  auditForm.result = 'approved'
  auditForm.opinion = ''
  auditDialogVisible.value = true
}

// 确认审核
const confirmAudit = () => {
  ElMessage.success('审核成功')
  auditDialogVisible.value = false
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
.evaluation-audit {
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

.score {
  display: flex;
  align-items: center;
}
</style>