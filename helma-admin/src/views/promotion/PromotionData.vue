<template>
  <div class="promotion-data">
    <h2>推广数据</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="推广员ID">
          <el-input v-model="searchForm.promoterId" placeholder="请输入推广员ID"></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 核心数据指标 -->
    <div class="core-metrics">
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">总推广人数</span>
          <span class="metric-value">1,234</span>
        </div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">有效闭环数</span>
          <span class="metric-value">456</span>
        </div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">付费转化率</span>
          <span class="metric-value">28.5%</span>
        </div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">平均获客成本</span>
          <span class="metric-value">¥89.2</span>
        </div>
      </el-card>
    </div>
    
    <!-- 推广数据表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>推广数据明细</span>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table :data="promotionData" style="width: 100%">
        <el-table-column prop="promoterId" label="推广员ID" width="120"></el-table-column>
        <el-table-column prop="promoterName" label="推广员姓名" width="120"></el-table-column>
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="channel" label="渠道" width="150"></el-table-column>
        <el-table-column prop="addFriends" label="加粉数"></el-table-column>
        <el-table-column prop="registrations" label="注册数"></el-table-column>
        <el-table-column prop="effectiveClosures" label="有效闭环数"></el-table-column>
        <el-table-column prop="paidConversions" label="付费转化数"></el-table-column>
        <el-table-column prop="commission" label="佣金"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">查看详情</el-button>
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
    
    <!-- 推广趋势图表 -->
    <div class="chart-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>推广趋势</span>
            <el-select v-model="chartType" size="small" @change="handleChartTypeChange">
              <el-option label="按日" value="daily"></el-option>
              <el-option label="按周" value="weekly"></el-option>
              <el-option label="按月" value="monthly"></el-option>
            </el-select>
          </div>
        </template>
        <div class="chart-container">
          <!-- 这里可以集成ECharts图表 -->
          <div class="chart-placeholder">推广趋势图表</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const searchForm = reactive({
  promoterId: '',
  dateRange: []
})

const chartType = ref('daily')

const promotionData = ref([
  {
    promoterId: 'P001',
    promoterName: '张三',
    date: '2024-01-15',
    channel: '微信',
    addFriends: 23,
    registrations: 15,
    effectiveClosures: 8,
    paidConversions: 3,
    commission: '¥345'
  },
  {
    promoterId: 'P001',
    promoterName: '张三',
    date: '2024-01-14',
    channel: '微信',
    addFriends: 19,
    registrations: 12,
    effectiveClosures: 6,
    paidConversions: 2,
    commission: '¥234'
  },
  {
    promoterId: 'P002',
    promoterName: '李四',
    date: '2024-01-15',
    channel: '抖音',
    addFriends: 31,
    registrations: 18,
    effectiveClosures: 10,
    paidConversions: 4,
    commission: '¥456'
  },
  {
    promoterId: 'P003',
    promoterName: '王五',
    date: '2024-01-15',
    channel: '朋友圈',
    addFriends: 15,
    registrations: 8,
    effectiveClosures: 4,
    paidConversions: 1,
    commission: '¥123'
  }
])

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里可以实现搜索功能
}

const resetSearch = () => {
  searchForm.promoterId = ''
  searchForm.dateRange = []
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以实现分页功能
}

const exportData = () => {
  console.log('导出推广数据')
  // 这里可以实现导出功能
}

const viewDetails = (row) => {
  console.log('查看推广详情:', row)
  // 这里可以实现查看详情功能
}

const handleChartTypeChange = (value) => {
  console.log('图表类型变更:', value)
  // 这里可以根据图表类型加载不同的数据
}
</script>

<style scoped>
.promotion-data {
  padding: 20px;
}

.promotion-data h2 {
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

.core-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.metric-content {
  padding: 20px;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.metric-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
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

.chart-section {
  margin-top: 20px;
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
  .core-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>