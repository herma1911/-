<template>
  <div class="revenue-dashboard">
    <h2>营收看板</h2>
    
    <!-- 核心营收指标 -->
    <div class="core-revenue-metrics">
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">本月MRR</span>
          <span class="metric-value">¥123,456</span>
          <span class="metric-change positive">+12.5%</span>
        </div>
      </el-card>
      
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">累计营收</span>
          <span class="metric-value">¥1,234,567</span>
          <span class="metric-change positive">+35.2%</span>
        </div>
      </el-card>
      
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">付费工厂数</span>
          <span class="metric-value">345</span>
          <span class="metric-change positive">+8.3%</span>
        </div>
      </el-card>
      
      <el-card class="metric-card">
        <div class="metric-content">
          <span class="metric-label">整体付费转化率</span>
          <span class="metric-value">28.0%</span>
          <span class="metric-change positive">+2.1%</span>
        </div>
      </el-card>
    </div>
    
    <!-- 营收趋势图表 -->
    <div class="chart-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>营收趋势</span>
            <el-select v-model="timeRange" size="small" @change="handleTimeRangeChange">
              <el-option label="近3个月" value="3months"></el-option>
              <el-option label="近6个月" value="6months"></el-option>
              <el-option label="近12个月" value="12months"></el-option>
            </el-select>
          </div>
        </template>
        <div class="chart-container">
          <!-- 这里可以集成ECharts图表 -->
          <div class="chart-placeholder">营收趋势图表</div>
        </div>
      </el-card>
    </div>
    
    <!-- 分模块营收占比 -->
    <div class="chart-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>分模块营收占比</span>
          </div>
        </template>
        <div class="chart-container">
          <!-- 这里可以集成ECharts图表 -->
          <div class="chart-placeholder">分模块营收占比图表</div>
        </div>
      </el-card>
    </div>
    
    <!-- 营收明细表格 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>营收明细</span>
            <el-button type="primary" size="small" @click="exportRevenueData">
              导出数据
            </el-button>
          </div>
        </template>
        <el-table :data="revenueData" style="width: 100%">
          <el-table-column prop="date" label="日期" width="180"></el-table-column>
          <el-table-column prop="revenueType" label="营收类型" width="180"></el-table-column>
          <el-table-column prop="amount" label="金额"></el-table-column>
          <el-table-column prop="factoryCount" label="工厂数"></el-table-column>
          <el-table-column prop="conversionRate" label="转化率"></el-table-column>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const timeRange = ref('6months')

// 营收明细数据
const revenueData = ref([
  {
    date: '2024-01-15',
    revenueType: '套餐订阅',
    amount: '¥45,678',
    factoryCount: 123,
    conversionRate: '32.5%'
  },
  {
    date: '2024-01-14',
    revenueType: '套餐订阅',
    amount: '¥32,456',
    factoryCount: 89,
    conversionRate: '28.3%'
  },
  {
    date: '2024-01-13',
    revenueType: '增值服务',
    amount: '¥12,345',
    factoryCount: 45,
    conversionRate: '15.2%'
  },
  {
    date: '2024-01-12',
    revenueType: '套餐订阅',
    amount: '¥28,765',
    factoryCount: 78,
    conversionRate: '26.7%'
  },
  {
    date: '2024-01-11',
    revenueType: '增值服务',
    amount: '¥8,923',
    factoryCount: 32,
    conversionRate: '12.1%'
  }
])

const handleTimeRangeChange = (value) => {
  console.log('时间范围变更:', value)
  // 这里可以根据时间范围加载不同的数据
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以根据页码加载对应的数据
}

const exportRevenueData = () => {
  console.log('导出营收数据')
  // 这里可以实现导出功能
}

onMounted(() => {
  // 可以在这里加载真实数据
})
</script>

<style scoped>
.revenue-dashboard {
  padding: 20px;
}

.revenue-dashboard h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* 核心营收指标 */
.core-revenue-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  margin-bottom: 5px;
}

.metric-change {
  display: block;
  font-size: 14px;
  font-weight: bold;
}

.metric-change.positive {
  color: #67C23A;
}

.metric-change.negative {
  color: #F56C6C;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
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

/* 表格区域 */
.table-section {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .core-revenue-metrics {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>