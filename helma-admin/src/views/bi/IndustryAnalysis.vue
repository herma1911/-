<template>
  <div class="industry-analysis-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>行业分析</span>
          <div class="header-actions">
            <el-select v-model="industryType" placeholder="选择行业" style="margin-right: 10px">
              <el-option label="服装行业" value="clothing" />
              <el-option label="电子行业" value="electronics" />
              <el-option label="制造业" value="manufacturing" />
            </el-select>
            <el-button type="primary" @click="exportReport">导出报表</el-button>
          </div>
        </div>
      </template>
      
      <!-- 行业数据概览 -->
      <div class="industry-overview">
        <h3>行业数据概览</h3>
        <div class="overview-cards">
          <el-card class="overview-card">
            <div class="overview-title">平均薪资水平</div>
            <div class="overview-value">¥6,850</div>
            <div class="overview-change positive">+5.2%</div>
          </el-card>
          <el-card class="overview-card">
            <div class="overview-title">平均招工需求</div>
            <div class="overview-value">12.5人/月</div>
            <div class="overview-change positive">+8.7%</div>
          </el-card>
          <el-card class="overview-card">
            <div class="overview-title">平均到岗率</div>
            <div class="overview-value">68.3%</div>
            <div class="overview-change negative">-2.1%</div>
          </el-card>
          <el-card class="overview-card">
            <div class="overview-title">平均用工成本</div>
            <div class="overview-value">¥8,230</div>
            <div class="overview-change positive">+3.5%</div>
          </el-card>
        </div>
      </div>
      
      <!-- 行业趋势 -->
      <div class="industry-trends">
        <h3>行业趋势分析</h3>
        <div class="trends-charts">
          <div class="chart-item">
            <h4>薪资趋势</h4>
            <div class="chart-placeholder">折线图：近12个月平均薪资变化</div>
          </div>
          <div class="chart-item">
            <h4>招工需求趋势</h4>
            <div class="chart-placeholder">折线图：近12个月招工需求变化</div>
          </div>
        </div>
      </div>
      
      <!-- 岗位类型分布 -->
      <div class="job-distribution">
        <h3>岗位类型分布</h3>
        <div class="distribution-charts">
          <div class="chart-item">
            <h4>岗位类型占比</h4>
            <div class="chart-placeholder">饼图：各岗位类型占比</div>
          </div>
          <div class="chart-item">
            <h4>技能要求分布</h4>
            <div class="chart-placeholder">柱状图：各技能要求占比</div>
          </div>
        </div>
      </div>
      
      <!-- 地域分布 -->
      <div class="region-distribution">
        <h3>地域分布分析</h3>
        <div class="chart-placeholder large-chart">地图：各地区用工需求分布</div>
      </div>
      
      <!-- 行业洞察 -->
      <div class="industry-insights">
        <h3>行业洞察</h3>
        <el-card class="insight-card">
          <h4>市场趋势</h4>
          <p>1. 服装行业招工需求持续增长，尤其是技术型岗位需求上升明显</p>
          <p>2. 薪资水平稳步增长，技术型岗位薪资增长速度快于普通岗位</p>
          <p>3. 季节性波动明显，春秋季节招工需求旺盛</p>
        </el-card>
        <el-card class="insight-card">
          <h4>用工趋势</h4>
          <p>1. 灵活用工模式越来越受欢迎，临时工需求增加</p>
          <p>2. 技能型人才短缺，尤其是高级技工和管理人才</p>
          <p>3. 工人对工作环境和福利待遇要求提高</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 行业类型
const industryType = ref('clothing')

// 导出报表
const exportReport = () => {
  ElMessage.success('报表导出成功')
}
</script>

<style scoped>
.industry-analysis-container {
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

/* 行业数据概览 */
.industry-overview {
  margin-bottom: 30px;
}

.industry-overview h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.overview-card {
  text-align: center;
  padding: 20px;
}

.overview-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.overview-change {
  font-size: 12px;
  font-weight: bold;
}

.overview-change.positive {
  color: #67C23A;
}

.overview-change.negative {
  color: #F56C6C;
}

/* 行业趋势 */
.industry-trends {
  margin-bottom: 30px;
}

.industry-trends h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.trends-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* 岗位类型分布 */
.job-distribution {
  margin-bottom: 30px;
}

.job-distribution h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.distribution-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* 地域分布 */
.region-distribution {
  margin-bottom: 30px;
}

.region-distribution h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

/* 行业洞察 */
.industry-insights {
  margin-bottom: 20px;
}

.industry-insights h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.insight-card {
  margin-bottom: 15px;
}

.insight-card h4 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.insight-card p {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  line-height: 1.5;
}

/* 图表样式 */
.chart-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-item h4 {
  font-size: 14px;
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

.large-chart {
  height: 300px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trends-charts,
  .distribution-charts {
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