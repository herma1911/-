<template>
  <div class="risk-monitoring">
    <h2>异常监控</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="监控类型">
          <el-select v-model="searchForm.type" placeholder="请选择监控类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="用户异常" value="user"></el-option>
            <el-option label="行为异常" value="behavior"></el-option>
            <el-option label="数据异常" value="data"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="searchForm.level" placeholder="请选择风险等级">
            <el-option label="全部" value=""></el-option>
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 异常监控列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>异常监控列表</span>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table :data="monitoringList" style="width: 100%">
        <el-table-column prop="id" label="监控ID" width="120"></el-table-column>
        <el-table-column prop="type" label="监控类型" width="120">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="异常内容"></el-table-column>
        <el-table-column prop="level" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="occurTime" label="发生时间" width="180"></el-table-column>
        <el-table-column prop="status" label="处理状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'processed' ? 'success' : 'warning'">
              {{ scope.row.status === 'processed' ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <el-button size="small" type="primary" v-if="scope.row.status === 'pending'" @click="process(scope.row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="100"
          :page-size="10"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 风险等级分布 -->
    <div class="chart-section">
      <el-card style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>风险等级分布</span>
          </div>
        </template>
        <div class="chart-container">
          <!-- 这里可以集成ECharts图表 -->
          <div class="chart-placeholder">风险等级分布图表</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  type: '',
  level: ''
})

const monitoringList = ref([
  {
    id: 'M001',
    type: 'user',
    content: '用户12345疑似重复注册',
    level: '高',
    occurTime: '2024-01-15 14:30:00',
    status: 'pending'
  },
  {
    id: 'M002',
    type: 'behavior',
    content: '用户67890在1小时内投递了15个岗位',
    level: '中',
    occurTime: '2024-01-15 13:15:00',
    status: 'pending'
  },
  {
    id: 'M003',
    type: 'data',
    content: '工厂ABC的岗位发布频率异常',
    level: '低',
    occurTime: '2024-01-15 12:45:00',
    status: 'processed'
  },
  {
    id: 'M004',
    type: 'user',
    content: '用户24680的登录IP频繁变更',
    level: '中',
    occurTime: '2024-01-15 11:20:00',
    status: 'pending'
  }
])

const getTypeText = (type) => {
  switch (type) {
    case 'user': return '用户异常'
    case 'behavior': return '行为异常'
    case 'data': return '数据异常'
    default: return ''
  }
}

const getLevelType = (level) => {
  switch (level) {
    case '高': return 'danger'
    case '中': return 'warning'
    case '低': return 'info'
    default: return ''
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里可以实现搜索功能
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以实现分页功能
}

const exportData = () => {
  console.log('导出监控数据')
  // 这里可以实现导出功能
  ElMessage.success('数据导出成功')
}

const viewDetail = (row) => {
  console.log('查看监控详情:', row)
  // 这里可以实现查看详情功能
}

const process = (row) => {
  row.status = 'processed'
  ElMessage.success('异常已处理')
}
</script>

<style scoped>
.risk-monitoring {
  padding: 20px;
}

.risk-monitoring h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.search-filter {
  margin-bottom: 20px;
}

.search-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.chart-container {
  height: 300px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.chart-placeholder {
  color: #999;
  font-size: 16px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>