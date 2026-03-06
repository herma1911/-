<template>
  <view class="ie-management-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">工厂IE标准管理</text>
      <view class="standard-library-btn" @tap="goToStandardLibrary">
        <text class="btn-text">标准库</text>
      </view>
    </view>

    <!-- 核心功能卡片区 -->
    <view class="core-cards-section">
      <view class="cards-grid">
        <view class="core-card" @tap="goToStandardTimeSetting">
          <text class="card-icon">⏰</text>
          <text class="card-title">标准工时制定</text>
          <text class="card-desc">结合行业数据+工人实测数据，制定工厂专属IE标准</text>
        </view>
        <view class="core-card" @tap="goToPriceCalculator">
          <text class="card-icon">💰</text>
          <text class="card-title">工价智能测算</text>
          <text class="card-desc">基于标准工时、当地工价水平，智能测算合理工价</text>
        </view>
        <view class="core-card" @tap="goToProductionLineBalance">
          <text class="card-icon">📊</text>
          <text class="card-title">产线平衡分析</text>
          <text class="card-desc">分析各工序产能瓶颈，优化产线配置</text>
        </view>
        <view class="core-card" @tap="goToWorkerActionGuide">
          <text class="card-icon">🎥</text>
          <text class="card-title">工人动作指导</text>
          <text class="card-desc">查看授权工人的测算视频，标注优化点，1对1指导</text>
        </view>
      </view>
    </view>

    <!-- 工人产能实时看板 -->
    <view class="worker-capacity-section">
      <view class="section-header">
        <text class="section-title">工人产能实时看板</text>
        <view class="filter-bar">
          <view class="filter-item">
            <text class="filter-label">工序：</text>
            <picker @change="handleProcessChange" :value="selectedProcessIndex" :range="processes">
              <text class="filter-value">{{ processes[selectedProcessIndex] }}</text>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">时间：</text>
            <picker @change="handleTimeChange" :value="selectedTimeIndex" :range="timeOptions">
              <text class="filter-value">{{ timeOptions[selectedTimeIndex] }}</text>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">排序：</text>
            <picker @change="handleSortChange" :value="selectedSortIndex" :range="sortOptions">
              <text class="filter-value">{{ sortOptions[selectedSortIndex] }}</text>
            </picker>
          </view>
        </view>
      </view>
      <view class="worker-cards-grid">
        <view v-for="worker in workers" :key="worker.id" class="worker-card">
          <view class="worker-header">
            <view class="worker-avatar">
              <image :src="worker.avatar" mode="aspectFill" class="avatar-image"></image>
            </view>
            <view class="worker-info">
              <text class="worker-name">{{ worker.name }}</text>
              <text class="worker-process">{{ worker.process }}</text>
            </view>
          </view>
          <view class="worker-stats">
            <view class="stat-item">
              <text class="stat-label">实测单件用时</text>
              <text class="stat-value">{{ worker.actualTime }}分钟/件</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">工厂标准工时</text>
              <text class="stat-value">{{ worker.standardTime }}分钟/件</text>
            </view>
            <view class="stat-item highlight">
              <text class="stat-label">产能达标率</text>
              <text :class="['stat-value', { 'green': worker.capacityRate >= 100, 'red': worker.capacityRate < 80 }]">
                {{ worker.capacityRate }}%
              </text>
            </view>
            <view class="stat-item">
              <text class="stat-label">预估单日产能</text>
              <text class="stat-value">{{ worker.dailyCapacity }}件</text>
            </view>
          </view>
          <view class="worker-actions">
            <button class="action-btn secondary" @tap="viewWorkerHistory(worker.id)">查看历史数据</button>
            <button class="action-btn primary" @tap="startActionGuide(worker.id)">发起动作指导</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 筛选选项
      processes: ['全部工序', '平车', '裁剪', '熨烫', '包装'],
      selectedProcessIndex: 0,
      timeOptions: ['今日', '本周', '本月', '自定义'],
      selectedTimeIndex: 0,
      sortOptions: ['按产能达标率', '按实测工时', '按入职时间'],
      selectedSortIndex: 0,
      // 工人数据
      workers: [
        {
          id: 1,
          name: '张三',
          process: '平车',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=worker%20avatar%20male&image_size=square',
          actualTime: 2.5,
          standardTime: 3.0,
          capacityRate: 120,
          dailyCapacity: 240
        },
        {
          id: 2,
          name: '李四',
          process: '裁剪',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=worker%20avatar%20female&image_size=square',
          actualTime: 1.8,
          standardTime: 2.0,
          capacityRate: 111,
          dailyCapacity: 333
        },
        {
          id: 3,
          name: '王五',
          process: '熨烫',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=worker%20avatar%20male&image_size=square',
          actualTime: 3.2,
          standardTime: 3.0,
          capacityRate: 94,
          dailyCapacity: 187
        },
        {
          id: 4,
          name: '赵六',
          process: '包装',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=worker%20avatar%20female&image_size=square',
          actualTime: 1.2,
          standardTime: 1.0,
          capacityRate: 83,
          dailyCapacity: 500
        }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goToStandardLibrary() {
      // 跳转到标准库页面
      uni.showToast({
        title: '标准库功能开发中',
        icon: 'none'
      })
    },
    goToStandardTimeSetting() {
      uni.navigateTo({
        url: '/pages/factory/standard-time-setting'
      })
    },
    goToPriceCalculator() {
      uni.navigateTo({
        url: '/pages/factory/price-calculator'
      })
    },
    goToProductionLineBalance() {
      uni.navigateTo({
        url: '/pages/factory/production-line-balance'
      })
    },
    goToWorkerActionGuide() {
      uni.navigateTo({
        url: '/pages/factory/worker-action-guide'
      })
    },
    handleProcessChange(e) {
      this.selectedProcessIndex = e.detail.value
      // 这里可以添加筛选逻辑
    },
    handleTimeChange(e) {
      this.selectedTimeIndex = e.detail.value
      // 这里可以添加时间筛选逻辑
    },
    handleSortChange(e) {
      this.selectedSortIndex = e.detail.value
      // 这里可以添加排序逻辑
    },
    viewWorkerHistory(workerId) {
      // 查看工人历史数据
      uni.showToast({
        title: `查看工人${workerId}历史数据`,
        icon: 'none'
      })
    },
    startActionGuide(workerId) {
      // 发起动作指导
      uni.showToast({
        title: `发起对工人${workerId}的动作指导`,
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.ie-management-page {
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
  position: sticky;
  top: 0;
  z-index: 100;
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

.standard-library-btn {
  padding: 10rpx 20rpx;
  background-color: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

/* 核心功能卡片区 */
.core-cards-section {
  padding: 30rpx;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.core-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.core-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
  display: block;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.card-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

/* 工人产能实时看板 */
.worker-capacity-section {
  padding: 0 30rpx 30rpx;
}

.section-header {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.filter-bar {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #666;
}

.filter-value {
  font-size: 24rpx;
  color: #333;
  padding: 8rpx 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  min-width: 100rpx;
  text-align: center;
}

.worker-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.worker-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.worker-header {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.worker-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.worker-info {
  flex: 1;
}

.worker-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.worker-process {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.worker-stats {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item.highlight {
  background-color: #f6ffed;
  padding: 15rpx;
  border-radius: 8rpx;
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

.worker-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  padding: 15rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
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
  background-color: #f0f0f0;
  color: #333;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .worker-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .filter-value {
    flex: 1;
  }
}
</style>