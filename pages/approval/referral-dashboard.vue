<template>
  <view class="dashboard-container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">拉新数据看板</text>
      <text class="subtitle">赫尔玛智能专属</text>
    </view>
    
    <!-- 核心数据概览卡片 -->
    <view class="overview-section">
      <text class="section-title">核心数据概览</text>
      <view class="overview-cards">
        <view class="overview-card" @click="navigateToDetail('today')">
          <text class="card-title">今日新增</text>
          <text class="card-value">{{todayNewWorkers}}</text>
          <text class="card-subtitle">有效工人数</text>
        </view>
        <view class="overview-card" @click="navigateToDetail('today')">
          <text class="card-title">今日新增</text>
          <text class="card-value">{{todayNewFactories}}</text>
          <text class="card-subtitle">有效工厂数</text>
        </view>
        <view class="overview-card" @click="navigateToDetail('monthly')">
          <text class="card-title">本月累计</text>
          <text class="card-value">{{monthlyTotalWorkers}}</text>
          <text class="card-subtitle">有效工人数</text>
        </view>
        <view class="overview-card" @click="navigateToDetail('monthly')">
          <text class="card-title">本月累计</text>
          <text class="card-value">{{monthlyTotalFactories}}</text>
          <text class="card-subtitle">有效工厂数</text>
        </view>
        <view class="overview-card" @click="navigateToDetail('completion')">
          <text class="card-title">月度目标完成率</text>
          <text class="card-value">{{workerCompletionRate}}%</text>
          <text class="card-subtitle">工人端</text>
        </view>
        <view class="overview-card" @click="navigateToDetail('completion')">
          <text class="card-title">月度目标完成率</text>
          <text class="card-value">{{factoryCompletionRate}}%</text>
          <text class="card-subtitle">工厂端</text>
        </view>
        <view class="overview-card warning" @click="navigateToDetail('warning')">
          <text class="card-title">拉新有效率</text>
          <text class="card-value">{{referralEfficiency}}%</text>
          <text class="card-subtitle">低于30%红线</text>
        </view>
        <view class="overview-card" @click="navigateToDetail('health')">
          <text class="card-title">裂变K因子</text>
          <text class="card-value">{{kFactor}}</text>
          <text class="card-subtitle">健康度</text>
        </view>
      </view>
    </view>
    
    <!-- 红线预警专区 -->
    <view class="warning-section">
      <text class="section-title">红线预警专区</text>
      <view class="warning-list">
        <view class="warning-item" @click="navigateToDetail('warning')">
          <text class="warning-icon">⚠️</text>
          <text class="warning-text">今日拉新有效率25%，低于30%红线</text>
        </view>
        <view class="warning-item" @click="navigateToDetail('warning')">
          <text class="warning-icon">⚠️</text>
          <text class="warning-text">工厂端30日留存9%，低于10%红线</text>
        </view>
      </view>
    </view>
    
    <!-- 每日必办待办 -->
    <view class="todo-section">
      <text class="section-title">每日必办待办</text>
      <view class="todo-list">
        <view class="todo-item" @click="navigateToDetail('appeal')">
          <text class="todo-icon">📋</text>
          <text class="todo-text">待处理拉新申诉 {{pendingAppeals}} 条</text>
        </view>
        <view class="todo-item" @click="navigateToDetail('fraud')">
          <text class="todo-icon">🔍</text>
          <text class="todo-text">待核查异常刷量数据 {{pendingFraud}} 条</text>
        </view>
        <view class="todo-item" @click="navigateToDetail('reward')">
          <text class="todo-icon">🎁</text>
          <text class="todo-text">待补发拉新奖励 {{pendingRewards}} 笔</text>
        </view>
        <view class="todo-item" @click="navigateToDetail('approval')">
          <text class="todo-icon">✅</text>
          <text class="todo-text">待审核工厂入驻 {{pendingApprovals}} 家</text>
        </view>
      </view>
    </view>
    
    <!-- 拉新趋势大盘 -->
    <view class="trend-section">
      <text class="section-title">拉新趋势大盘</text>
      <view class="trend-controls">
        <button class="trend-btn" :class="{ active: trendPeriod === '7d' }" @click="setTrendPeriod('7d')">近7天</button>
        <button class="trend-btn" :class="{ active: trendPeriod === '30d' }" @click="setTrendPeriod('30d')">近30天</button>
        <button class="export-btn" @click="exportData">导出报表</button>
      </view>
      <view class="trend-chart">
        <text class="chart-placeholder">📊 拉新趋势双轴折线图</text>
        <text class="chart-subtext">工人端 vs 工厂端</text>
      </view>
    </view>
    
    <!-- 明细看板切换 -->
    <view class="detail-tabs-section">
      <text class="section-title">明细看板</text>
      <view class="detail-tabs">
        <button class="detail-tab" :class="{ active: activeDetailTab === 'scale' }" @click="setActiveDetailTab('scale')">拉新规模</button>
        <button class="detail-tab" :class="{ active: activeDetailTab === 'quality' }" @click="setActiveDetailTab('quality')">拉新质量</button>
        <button class="detail-tab" :class="{ active: activeDetailTab === 'conversion' }" @click="setActiveDetailTab('conversion')">转化漏斗</button>
        <button class="detail-tab" :class="{ active: activeDetailTab === 'retention' }" @click="setActiveDetailTab('retention')">留存活跃</button>
        <button class="detail-tab" :class="{ active: activeDetailTab === 'fission' }" @click="setActiveDetailTab('fission')">裂变健康</button>
        <button class="detail-tab" :class="{ active: activeDetailTab === 'roi' }" @click="setActiveDetailTab('roi')">ROI成本</button>
      </view>
      
      <!-- 明细看板内容 -->
      <view class="detail-content">
        <view v-if="activeDetailTab === 'scale'" class="detail-panel">
          <text class="panel-title">拉新规模广度看板</text>
          <text class="panel-content">总注册量、有效拉新量、目标完成率、4大拉新场景贡献占比、分场景明细数据，支持按时间/区域/层级筛选</text>
        </view>
        <view v-if="activeDetailTab === 'quality'" class="detail-panel">
          <text class="panel-title">拉新质量精准度看板</text>
          <text class="panel-content">拉新有效率、垂直用户占比、核心区域占比、优质用户占比，异常数据标红，违规拉新明细一键核查处理</text>
        </view>
        <view v-if="activeDetailTab === 'conversion'" class="detail-panel">
          <text class="panel-title">业务闭环转化看板</text>
          <text class="panel-content">工人端/工厂端全流程转化指标、转化漏斗图，定位流失节点，支持一键导出转化明细</text>
        </view>
        <view v-if="activeDetailTab === 'retention'" class="detail-panel">
          <text class="panel-title">留存活跃长效看板</text>
          <text class="panel-content">次日/7日/30日留存率、周/月活跃率、复拉新率，分场景留存对比，趋势图可视化展示</text>
        </view>
        <view v-if="activeDetailTab === 'fission'" class="detail-panel">
          <text class="panel-title">裂变健康度看板</text>
          <text class="panel-content">4大场景裂变K因子、平均裂变层级、奖励核销率，高价值/低效场景标注，支持一键跳转规则配置页</text>
        </view>
        <view v-if="activeDetailTab === 'roi'" class="detail-panel">
          <text class="panel-title">ROI成本看板</text>
          <text class="panel-content">单个有效用户成本、LTV生命周期价值、LTV/CAC比值，分场景ROI对比，成本趋势可视化</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 核心数据
      todayNewWorkers: 23,
      todayNewFactories: 5,
      monthlyTotalWorkers: 156,
      monthlyTotalFactories: 32,
      workerCompletionRate: 68,
      factoryCompletionRate: 75,
      referralEfficiency: 25,
      kFactor: 1.2,
      
      // 待办事项
      pendingAppeals: 3,
      pendingFraud: 5,
      pendingRewards: 2,
      pendingApprovals: 8,
      
      // 趋势周期
      trendPeriod: '7d',
      
      // 明细看板
      activeDetailTab: 'scale'
    }
  },
  onLoad() {
    // 权限验证
    this.checkPermission()
  },
  methods: {
    // 权限验证
    checkPermission() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      if (userInfo.role !== '赫尔玛智能') {
        // 无权限，跳转到首页
        uni.redirectTo({
          url: '../home/home'
        })
        return
      }
    },
    
    // 导航到明细页面
    navigateToDetail(type) {
      // 实际项目中，这里会跳转到对应的明细页面
      uni.showToast({
        title: `跳转到${type}明细`,
        icon: 'none'
      })
    },
    
    // 设置趋势周期
    setTrendPeriod(period) {
      this.trendPeriod = period
    },
    
    // 导出数据
    exportData() {
      uni.showToast({
        title: '数据导出功能开发中',
        icon: 'none'
      })
    },
    
    // 设置活跃明细看板
    setActiveDetailTab(tab) {
      this.activeDetailTab = tab
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: #fff;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.9;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

/* 核心数据概览 */
.overview-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.overview-card {
  background-color: #f9f9f9;
  padding: 25rpx;
  border-radius: 15rpx;
  text-align: center;
  border: 1rpx solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.overview-card:active {
  transform: scale(0.95);
}

.overview-card.warning {
  background-color: #fff7e6;
  border-color: #ffd591;
}

.card-title {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.card-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #4A90E2;
  margin-bottom: 5rpx;
  display: block;
}

.overview-card.warning .card-value {
  color: #fa8c16;
}

.card-subtitle {
  font-size: 18rpx;
  color: #999;
  display: block;
}

/* 红线预警 */
.warning-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.warning-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff7e6;
  border-radius: 12rpx;
  border-left: 4rpx solid #fa8c16;
  cursor: pointer;
  transition: all 0.3s ease;
}

.warning-item:active {
  transform: scale(0.98);
}

.warning-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.warning-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 每日必办 */
.todo-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f0f9ff;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.todo-item:active {
  transform: scale(0.98);
}

.todo-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.todo-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
}

/* 拉新趋势 */
.trend-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.trend-controls {
  display: flex;
  gap: 15rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.trend-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 20rpx;
  background-color: #f9f9f9;
  font-size: 20rpx;
  color: #666;
  transition: all 0.3s ease;
}

.trend-btn.active {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
}

.export-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #4A90E2;
  border-radius: 20rpx;
  background-color: #fff;
  font-size: 20rpx;
  color: #4A90E2;
  transition: all 0.3s ease;
}

.export-btn:active {
  background-color: #f0f9ff;
}

.trend-chart {
  background-color: #f9f9f9;
  padding: 40rpx;
  border-radius: 12rpx;
  text-align: center;
  min-height: 300rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  font-size: 36rpx;
  margin-bottom: 15rpx;
}

.chart-subtext {
  font-size: 20rpx;
  color: #666;
}

/* 明细看板 */
.detail-tabs-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.detail-tabs {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.detail-tab {
  padding: 12rpx 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 20rpx;
  background-color: #f9f9f9;
  font-size: 20rpx;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.detail-tab.active {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
}

.detail-content {
  min-height: 200rpx;
}

.detail-panel {
  background-color: #f9f9f9;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
}

.panel-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.panel-content {
  font-size: 20rpx;
  color: #666;
  line-height: 1.5;
}
</style>