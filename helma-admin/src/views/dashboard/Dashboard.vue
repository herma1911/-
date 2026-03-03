<template>
  <div class="dashboard-container">
    <!-- 管理员通知 -->
    <AdminNotification />
    
    <!-- 北极星指标 -->
    <div class="north-star指标">
      <h2>月度有效到岗闭环数</h2>
      <div class="north-star-content">
        <div class="north-star-value">1,245</div>
        <div class="north-star-metrics">
          <div class="metric-item">
            <span class="metric-label">环比</span>
            <span class="metric-value positive">+12.5%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">同比</span>
            <span class="metric-value positive">+35.2%</span>
          </div>
        </div>
      </div>
      <div class="north-star-chart">
        <!-- 这里可以集成ECharts图表 -->
        <div class="chart-placeholder">近6个月趋势图</div>
      </div>
    </div>

    <!-- 核心数据卡片 -->
    <div class="core-data-cards">
      <!-- C端核心 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>C端核心</span>
          </div>
        </template>
        <div class="card-content">
          <div class="data-item">
            <span class="data-label">累计注册工人</span>
            <span class="data-value">24,589</span>
          </div>
          <div class="data-item">
            <span class="data-label">月活跃工人</span>
            <span class="data-value">8,765</span>
          </div>
          <div class="data-item">
            <span class="data-label">累计投递数</span>
            <span class="data-value">45,231</span>
          </div>
          <div class="data-item">
            <span class="data-label">本月有效投递转化率</span>
            <span class="data-value">28.7%</span>
          </div>
        </div>
      </el-card>

      <!-- B端核心 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>B端核心</span>
          </div>
        </template>
        <div class="card-content">
          <div class="data-item">
            <span class="data-label">累计注册工厂</span>
            <span class="data-value">1,234</span>
          </div>
          <div class="data-item">
            <span class="data-label">认证工厂数</span>
            <span class="data-value">987</span>
          </div>
          <div class="data-item">
            <span class="data-label">月活跃工厂</span>
            <span class="data-value">654</span>
          </div>
          <div class="data-item">
            <span class="data-label">累计发布岗位数</span>
            <span class="data-value">3,456</span>
          </div>
        </div>
      </el-card>

      <!-- 营收核心 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>营收核心</span>
          </div>
        </template>
        <div class="card-content">
          <div class="data-item">
            <span class="data-label">本月MRR</span>
            <span class="data-value">¥123,456</span>
          </div>
          <div class="data-item">
            <span class="data-label">累计营收</span>
            <span class="data-value">¥1,234,567</span>
          </div>
          <div class="data-item">
            <span class="data-label">付费工厂数</span>
            <span class="data-value">345</span>
          </div>
          <div class="data-item">
            <span class="data-label">整体付费转化率</span>
            <span class="data-value">28.0%</span>
          </div>
        </div>
      </el-card>

      <!-- 对账核心 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>对账核心</span>
          </div>
        </template>
        <div class="card-content">
          <div class="data-item">
            <span class="data-label">本月发起对账数</span>
            <span class="data-value">2,345</span>
          </div>
          <div class="data-item">
            <span class="data-label">已确认对账数</span>
            <span class="data-value">2,134</span>
          </div>
          <div class="data-item">
            <span class="data-label">对账完成率</span>
            <span class="data-value">91.0%</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 实时数据监控 -->
    <div class="real-time-monitoring">
      <h3>实时数据监控</h3>
      <div class="real-time-cards">
        <div class="real-time-card">
          <span class="card-label">今日新增注册</span>
          <span class="card-value">123</span>
        </div>
        <div class="real-time-card">
          <span class="card-label">今日岗位发布</span>
          <span class="card-value">45</span>
        </div>
        <div class="real-time-card">
          <span class="card-label">今日投递数</span>
          <span class="card-value">234</span>
        </div>
        <div class="real-time-card">
          <span class="card-label">今日到岗闭环数</span>
          <span class="card-value">34</span>
        </div>
      </div>
    </div>

    <!-- 异常数据预警 -->
    <div class="anomaly-warning">
      <h3>异常数据预警</h3>
      <el-table :data="anomalyData" style="width: 100%">
        <el-table-column prop="type" label="预警类型" width="180" />
        <el-table-column prop="content" label="预警内容" />
        <el-table-column prop="level" label="风险等级" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.level === '高' ? 'danger' : scope.row.level === '中' ? 'warning' : 'info'">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="预警时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" size="small">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminNotification from '@/components/AdminNotification.vue'

// 异常数据预警
const anomalyData = ref([
  {
    type: '作弊风险',
    content: '用户12345疑似重复注册，IP地址：192.168.1.100',
    level: '高',
    time: '2024-01-15 14:30:00'
  },
  {
    type: '违规岗位',
    content: '工厂67890发布的岗位「高薪急招」包含违规内容',
    level: '中',
    time: '2024-01-15 13:15:00'
  },
  {
    type: '异常评价',
    content: '用户54321在1小时内发布10条相似评价，疑似刷量',
    level: '中',
    time: '2024-01-15 12:45:00'
  },
  {
    type: '低转化渠道',
    content: '渠道A的转化率仅为5%，持续低于平台平均值15%',
    level: '低',
    time: '2024-01-15 11:20:00'
  },
  {
    type: '对账异常',
    content: '工厂12345的对账记录与工人记录不符，差异金额¥5,200',
    level: '高',
    time: '2024-01-15 10:45:00'
  },
  {
    type: '岗位异常',
    content: '工厂78901发布的岗位薪资远超行业平均水平30%',
    level: '中',
    time: '2024-01-15 09:30:00'
  },
  {
    type: '登录异常',
    content: '账号admin在异地登录，IP地址：203.192.116.11',
    level: '高',
    time: '2024-01-15 08:15:00'
  },
  {
    type: '活动异常',
    content: '活动「新年招聘季」参与人数异常增长，疑似刷量',
    level: '中',
    time: '2024-01-14 16:20:00'
  }
])

onMounted(() => {
  // 可以在这里加载真实数据
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 北极星指标 */
.north-star指标 {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.north-star指标 h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.north-star-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.north-star-value {
  font-size: 48px;
  font-weight: bold;
  color: #409EFF;
}

.north-star-metrics {
  display: flex;
  gap: 30px;
}

.metric-item {
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.metric-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
}

.metric-value.positive {
  color: #67C23A;
}

.metric-value.negative {
  color: #F56C6C;
}

.north-star-chart {
  height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  color: #999;
  font-size: 16px;
}

/* 核心数据卡片 */
.core-data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.card-content {
  padding: 10px 0;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  font-size: 14px;
  color: #666;
}

.data-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 实时数据监控 */
.real-time-monitoring {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.real-time-monitoring h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.real-time-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.real-time-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.card-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.card-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

/* 异常数据预警 */
.anomaly-warning {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.anomaly-warning h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .core-data-cards {
    grid-template-columns: 1fr;
  }
  
  .real-time-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .north-star-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
}
</style>