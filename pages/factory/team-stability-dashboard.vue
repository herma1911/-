<template>
  <view class="team-stability-dashboard-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <text class="page-title">团队稳定性看板</text>
    </view>
    
    <!-- 核心指标区 -->
    <view class="core-metrics">
      <view class="metric-card">
        <text class="metric-value">{{ overallRetentionRate }}%</text>
        <text class="metric-label">整体留存率</text>
      </view>
      <view class="metric-card">
        <text class="metric-value">{{ averageTenure }}个月</text>
        <text class="metric-label">平均司龄</text>
      </view>
      <view class="metric-card">
        <text class="metric-value">{{ monthlyTurnoverRate }}%</text>
        <text class="metric-label">月度流失率</text>
      </view>
    </view>
    
    <!-- 在岗时长分布 -->
    <view class="chart-section">
      <text class="section-title">各岗位在岗时长分布</text>
      <view class="chart-container">
        <view v-for="position in positionTenureData" :key="position.name" class="position-tenure-item">
          <text class="position-name">{{ position.name }}</text>
          <view class="tenure-bar">
            <view 
              class="tenure-fill" 
              :style="{ width: position.averageTenure + '%', backgroundColor: position.color }"
            ></view>
          </view>
          <text class="tenure-value">{{ position.averageTenure }}个月</text>
        </view>
      </view>
    </view>
    
    <!-- 司龄分布 -->
    <view class="chart-section">
      <text class="section-title">司龄分布</text>
      <view class="chart-container">
        <view class="age-distribution">
          <view v-for="ageGroup in ageDistributionData" :key="ageGroup.range" class="age-group">
            <text class="age-range">{{ ageGroup.range }}</text>
            <view class="age-bar">
              <view 
                class="age-fill" 
                :style="{ height: ageGroup.percentage + '%', backgroundColor: getAgeColor(ageGroup.range) }"
              ></view>
            </view>
            <text class="age-percentage">{{ ageGroup.percentage }}%</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 流失率对标 -->
    <view class="chart-section">
      <text class="section-title">流失率对标</text>
      <view class="chart-container">
        <view class="comparison-chart">
          <view class="comparison-item">
            <text class="comparison-label">本厂</text>
            <view class="comparison-bar">
              <view class="comparison-fill本厂" :style="{ width: turnoverRate本厂 + '%' }"></view>
            </view>
            <text class="comparison-value">{{ turnoverRate本厂 }}%</text>
          </view>
          <view class="comparison-item">
            <text class="comparison-label">同地区</text>
            <view class="comparison-bar">
              <view class="comparison-fill同地区" :style="{ width: turnoverRate同地区 + '%' }"></view>
            </view>
            <text class="comparison-value">{{ turnoverRate同地区 }}%</text>
          </view>
          <view class="comparison-item">
            <text class="comparison-label">同行业</text>
            <view class="comparison-bar">
              <view class="comparison-fill同行业" :style="{ width: turnoverRate同行业 + '%' }"></view>
            </view>
            <text class="comparison-value">{{ turnoverRate同行业 }}%</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 离职原因分析 -->
    <view class="chart-section">
      <text class="section-title">近30天离职原因分析</text>
      <view class="chart-container">
        <view class="reason-analysis">
          <view v-for="reason in departureReasons" :key="reason.name" class="reason-item">
            <text class="reason-name">{{ reason.name }}</text>
            <view class="reason-bar">
              <view 
                class="reason-fill" 
                :style="{ width: reason.percentage + '%', backgroundColor: reason.color }"
              ></view>
            </view>
            <text class="reason-percentage">{{ reason.percentage }}%</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 留人优化建议 -->
    <view class="suggestions-section">
      <text class="section-title">留人优化建议</text>
      <view class="suggestions-list">
        <view v-for="(suggestion, index) in retentionSuggestions" :key="index" class="suggestion-item">
          <text class="suggestion-icon">💡</text>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 核心指标
      overallRetentionRate: 85,
      averageTenure: 18,
      monthlyTurnoverRate: 5.2,
      
      // 各岗位在岗时长数据
      positionTenureData: [
        { name: '裁剪工', averageTenure: 24, color: '#4A90E2' },
        { name: '缝纫工', averageTenure: 16, color: '#50E3C2' },
        { name: '后整工', averageTenure: 12, color: '#F5A623' },
        { name: '包装工', averageTenure: 8, color: '#D0021B' },
        { name: '质检员', averageTenure: 20, color: '#9013FE' }
      ],
      
      // 司龄分布数据
      ageDistributionData: [
        { range: '0-6个月', percentage: 25 },
        { range: '6-12个月', percentage: 30 },
        { range: '1-2年', percentage: 20 },
        { range: '2-3年', percentage: 15 },
        { range: '3年以上', percentage: 10 }
      ],
      
      // 流失率对标数据
      turnoverRate本厂: 5.2,
      turnoverRate同地区: 7.5,
      turnoverRate同行业: 6.8,
      
      // 离职原因数据
      departureReasons: [
        { name: '薪资待遇', percentage: 60, color: '#D0021B' },
        { name: '工作环境', percentage: 15, color: '#F5A623' },
        { name: '工作时间', percentage: 10, color: '#50E3C2' },
        { name: '职业发展', percentage: 8, color: '#4A90E2' },
        { name: '其他原因', percentage: 7, color: '#9013FE' }
      ],
      
      // 留人优化建议
      retentionSuggestions: [
        '建立合理的薪资体系，定期进行市场调研，确保薪资水平具有竞争力',
        '改善工作环境，提供舒适的工作空间和必要的劳动保护措施',
        '优化工作时间安排，合理安排加班和休息时间',
        '建立清晰的职业发展通道，提供培训和晋升机会',
        '加强企业文化建设，增强员工归属感和团队凝聚力',
        '定期组织员工满意度调查，及时了解员工需求和意见',
        '建立有效的沟通机制，让员工感受到被尊重和重视',
        '提供有针对性的福利政策，如餐饮补贴、交通补贴等'
      ]
    }
  },
  methods: {
    // 获取司龄分布颜色
    getAgeColor(range) {
      const colorMap = {
        '0-6个月': '#D0021B',
        '6-12个月': '#F5A623',
        '1-2年': '#50E3C2',
        '2-3年': '#4A90E2',
        '3年以上': '#9013FE'
      }
      return colorMap[range] || '#9B9B9B'
    }
  }
}
</script>

<style scoped>
.team-stability-dashboard-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  text-align: center;
  display: block;
}

/* 核心指标区 */
.core-metrics {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.metric-card {
  flex: 1;
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.metric-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.metric-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4A90E2;
  display: block;
  margin-bottom: 8rpx;
}

.metric-label {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 图表区域 */
.chart-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.chart-container {
  width: 100%;
}

/* 岗位在岗时长分布 */
.position-tenure-item {
  margin-bottom: 24rpx;
}

.position-tenure-item:last-child {
  margin-bottom: 0;
}

.position-name {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.tenure-bar {
  width: 100%;
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.tenure-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.tenure-value {
  font-size: 18rpx;
  color: #999;
  display: block;
  text-align: right;
}

/* 司龄分布 */
.age-distribution {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 300rpx;
  gap: 16rpx;
}

.age-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.age-range {
  font-size: 16rpx;
  color: #666;
  margin-bottom: 8rpx;
  text-align: center;
}

.age-bar {
  flex: 1;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 6rpx 6rpx 0 0;
  overflow: hidden;
  margin-bottom: 8rpx;
  position: relative;
}

.age-fill {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 6rpx 6rpx 0 0;
  transition: height 0.5s ease;
}

.age-percentage {
  font-size: 16rpx;
  color: #999;
}

/* 流失率对标 */
.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.comparison-label {
  width: 80rpx;
  font-size: 20rpx;
  color: #666;
}

.comparison-bar {
  flex: 1;
  height: 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.comparison-fill本厂 {
  height: 100%;
  background-color: #4A90E2;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.comparison-fill同地区 {
  height: 100%;
  background-color: #F5A623;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.comparison-fill同行业 {
  height: 100%;
  background-color: #50E3C2;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.comparison-value {
  width: 60rpx;
  font-size: 20rpx;
  color: #333;
  text-align: right;
}

/* 离职原因分析 */
.reason-analysis {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.reason-name {
  width: 120rpx;
  font-size: 20rpx;
  color: #666;
}

.reason-bar {
  flex: 1;
  height: 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.reason-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.reason-percentage {
  width: 60rpx;
  font-size: 20rpx;
  color: #333;
  text-align: right;
}

/* 留人优化建议 */
.suggestions-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  border-left: 4rpx solid #4A90E2;
}

.suggestion-icon {
  font-size: 24rpx;
  margin-top: 4rpx;
}

.suggestion-text {
  flex: 1;
  font-size: 20rpx;
  color: #333;
  line-height: 1.5;
}
</style>