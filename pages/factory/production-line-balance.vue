<template>
  <view class="production-line-balance-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">产线平衡分析</text>
      <view class="placeholder"></view>
    </view>

    <!-- 产线选择区 -->
    <view class="line-selection-section">
      <view class="form-group">
        <text class="form-label">选择产线</text>
        <picker @change="handleLineChange" :value="selectedLineIndex" :range="productionLines">
          <view class="picker-input">
            <text>{{ productionLines[selectedLineIndex] }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 工序产能分析区 -->
    <view class="process-analysis-section">
      <text class="section-title">工序产能分析</text>
      <view class="process-cards">
        <view v-for="process in processes" :key="process.id" class="process-card" :class="{ 'bottleneck': process.isBottleneck }">
          <view class="process-header">
            <text class="process-name">{{ process.name }}</text>
            <text v-if="process.isBottleneck" class="bottleneck-tag">瓶颈工序</text>
          </view>
          <view class="process-stats">
            <view class="stat-item">
              <text class="stat-label">标准工时</text>
              <text class="stat-value">{{ process.standardTime }}分钟/件</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">实测工时</text>
              <text class="stat-value">{{ process.actualTime }}分钟/件</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">产能</text>
              <text class="stat-value">{{ process.capacity }}件/小时</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">负荷率</text>
              <text :class="['stat-value', { 'green': process.loadRate < 80, 'red': process.loadRate > 100 }]">
                {{ process.loadRate }}%
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 产线平衡率区 -->
    <view class="balance-rate-section">
      <text class="section-title">产线平衡率</text>
      <view class="balance-card">
        <view class="balance-header">
          <text class="balance-label">当前平衡率</text>
          <text class="balance-value">{{ balanceRate }}%</text>
        </view>
        <view class="balance-bar">
          <view class="balance-fill" :style="{ width: balanceRate + '%' }"></view>
        </view>
        <text class="balance-hint">平衡率越高，产线效率越高</text>
      </view>
    </view>

    <!-- 优化建议区 -->
    <view class="optimization-section">
      <text class="section-title">优化建议</text>
      <view class="suggestion-card">
        <view v-for="suggestion in optimizationSuggestions" :key="suggestion.id" class="suggestion-item">
          <text class="suggestion-icon">💡</text>
          <text class="suggestion-text">{{ suggestion.content }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮区 -->
    <view class="action-buttons-section">
      <button class="action-btn primary" @tap="exportAnalysis">导出分析报告</button>
      <button class="action-btn secondary" @tap="applyOptimization">应用优化方案</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 产线选择
      productionLines: ['请选择产线', '主线1', '主线2', '辅线1', '辅线2'],
      selectedLineIndex: 1,
      // 工序数据
      processes: [
        {
          id: 1,
          name: '裁剪',
          standardTime: 2.0,
          actualTime: 1.8,
          capacity: 33,
          loadRate: 90,
          isBottleneck: false
        },
        {
          id: 2,
          name: '平车',
          standardTime: 3.0,
          actualTime: 3.5,
          capacity: 17,
          loadRate: 117,
          isBottleneck: true
        },
        {
          id: 3,
          name: '熨烫',
          standardTime: 2.5,
          actualTime: 2.3,
          capacity: 26,
          loadRate: 92,
          isBottleneck: false
        },
        {
          id: 4,
          name: '包装',
          standardTime: 1.5,
          actualTime: 1.2,
          capacity: 50,
          loadRate: 80,
          isBottleneck: false
        }
      ],
      // 平衡率
      balanceRate: 78,
      // 优化建议
      optimizationSuggestions: [
        {
          id: 1,
          content: '平车工序为瓶颈，建议增加1台设备或1名工人'
        },
        {
          id: 2,
          content: '包装工序负荷率较低，可考虑调整人员配置'
        },
        {
          id: 3,
          content: '建议对平车工人进行技能培训，提高操作效率'
        }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    handleLineChange(e) {
      this.selectedLineIndex = e.detail.value
      // 这里可以根据选择的产线更新工序数据
    },
    exportAnalysis() {
      // 模拟导出分析报告
      uni.showToast({
        title: '导出成功',
        icon: 'success'
      })
    },
    applyOptimization() {
      // 模拟应用优化方案
      uni.showToast({
        title: '优化方案已应用',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.production-line-balance-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 80rpx;
}

/* 产线选择区 */
.line-selection-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.picker-input {
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

/* 工序产能分析区 */
.process-analysis-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.process-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.process-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  border-left: 4rpx solid #1890ff;
}

.process-card.bottleneck {
  border-left-color: #f5222d;
  background-color: #fff1f0;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.process-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.bottleneck-tag {
  background-color: #f5222d;
  color: #fff;
  padding: 5rpx 15rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.process-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
}

.stat-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.stat-value.green {
  color: #52c41a;
}

.stat-value.red {
  color: #f5222d;
}

/* 产线平衡率区 */
.balance-rate-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.balance-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.balance-label {
  font-size: 28rpx;
  color: #666;
}

.balance-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #1890ff;
}

.balance-bar {
  width: 100%;
  height: 20rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 15rpx;
}

.balance-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
}

.balance-hint {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

/* 优化建议区 */
.optimization-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.suggestion-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 15rpx;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.suggestion-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.suggestion-icon {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 5rpx;
}

.suggestion-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

/* 操作按钮区 */
.action-buttons-section {
  padding: 0 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  padding: 25rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  text-align: center;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
}

.action-btn.secondary {
  background-color: #52c41a;
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .line-selection-section {
    margin: 20rpx;
    padding: 20rpx;
  }
  
  .process-analysis-section,
  .balance-rate-section,
  .optimization-section,
  .action-buttons-section {
    padding: 0 20rpx 20rpx;
  }
  
  .process-card,
  .balance-card,
  .suggestion-card {
    padding: 20rpx;
  }
  
  .process-stats {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    padding: 20rpx;
    font-size: 26rpx;
  }
}
</style>