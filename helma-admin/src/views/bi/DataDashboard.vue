<template>
  <div class="data-dashboard-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据看板</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px; margin-right: 10px"
            />
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
          </div>
        </div>
      </template>
      
      <!-- 核心指标 -->
      <div class="core-metrics">
        <el-card class="metric-card">
          <div class="metric-title">总注册用户</div>
          <div class="metric-value">24,589</div>
          <div class="metric-change positive">+12.5%</div>
        </el-card>
        <el-card class="metric-card">
          <div class="metric-title">月活跃用户</div>
          <div class="metric-value">8,765</div>
          <div class="metric-change positive">+8.3%</div>
        </el-card>
        <el-card class="metric-card">
          <div class="metric-title">到岗闭环数</div>
          <div class="metric-value">1,245</div>
          <div class="metric-change positive">+15.7%</div>
        </el-card>
        <el-card class="metric-card">
          <div class="metric-title">本月营收</div>
          <div class="metric-value">¥123,456</div>
          <div class="metric-change positive">+23.1%</div>
        </el-card>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-area">
        <div class="chart-item">
          <h3>用户增长趋势</h3>
          <div class="chart-placeholder">折线图：近6个月用户注册趋势</div>
        </div>
        <div class="chart-item">
          <h3>业务模块分布</h3>
          <div class="chart-placeholder">饼图：各业务模块占比</div>
        </div>
        <div class="chart-item">
          <h3>地域分布</h3>
          <div class="chart-placeholder">地图：用户地域分布</div>
        </div>
        <div class="chart-item">
          <h3>付费转化率</h3>
          <div class="chart-placeholder">柱状图：各渠道付费转化</div>
        </div>
      </div>
      
      <!-- 数据明细 -->
      <div class="data-details">
        <h3>数据明细</h3>
        <el-table :data="dataDetails" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="registrations" label="注册数" width="100" />
          <el-table-column prop="activeUsers" label="活跃数" width="100" />
          <el-table-column prop="jobPosts" label="岗位数" width="100" />
          <el-table-column prop="applications" label="投递数" width="100" />
          <el-table-column prop="closures" label="闭环数" width="100" />
          <el-table-column prop="revenue" label="营收" width="120" />
          <el-table-column prop="conversion" label="转化率" width="100" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 日期范围
const dateRange = ref([])

// 数据明细
const dataDetails = ref([
  {
    date: '2024-01-15',
    registrations: 123,
    activeUsers: 890,
    jobPosts: 45,
    applications: 234,
    closures: 34,
    revenue: '¥12,345',
    conversion: '28.7%'
  },
  {
    date: '2024-01-14',
    registrations: 112,
    activeUsers: 876,
    jobPosts: 38,
    applications: 215,
    closures: 31,
    revenue: '¥11,234',
    conversion: '29.1%'
  },
  {
    date: '2024-01-13',
    registrations: 98,
    activeUsers: 854,
    jobPosts: 42,
    applications: 198,
    closures: 28,
    revenue: '¥10,567',
    conversion: '27.8%'
  },
  {
    date: '2024-01-12',
    registrations: 105,
    activeUsers: 867,
    jobPosts: 39,
    applications: 205,
    closures: 30,
    revenue: '¥11,023',
    conversion: '28.3%'
  },
  {
    date: '2024-01-11',
    registrations: 118,
    activeUsers: 889,
    jobPosts: 41,
    applications: 221,
    closures: 32,
    revenue: '¥11,890',
    conversion: '29.0%'
  }
])

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据刷新成功')
}
</script>

<style scoped>
.data-dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* 核心指标 */
.core-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  text-align: center;
  padding: 20px;
}

.metric-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 12px;
  font-weight: bold;
}

.metric-change.positive {
  color: #67C23A;
}

.metric-change.negative {
  color: #F56C6C;
}

/* 图表区域 */
.charts-area {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-item h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.chart-placeholder {
  height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 14px;
}

/* 数据明细 */
.data-details {
  margin-top: 30px;
}

.data-details h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .core-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-area {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>