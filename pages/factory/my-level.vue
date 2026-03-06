<template>
  <view class="my-level-container">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">我的等级</text>
      <view class="empty"></view>
    </view>
    
    <!-- 等级卡片 -->
    <view class="level-card" :style="{ backgroundColor: currentLevel.color }">
      <view class="level-header">
        <text class="level-icon">{{ currentLevel.icon }}</text>
        <view class="level-info">
          <text class="level-name">{{ currentLevel.name }}</text>
          <text class="level-desc">{{ currentLevel.description }}</text>
        </view>
      </view>
      <view class="level-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: levelProgress.progress + '%' }"></view>
        </view>
        <text class="progress-text">
          {{ levelProgress.progress }}% 完成
          {{ levelProgress.nextLevel ? '，升级到' + factoryLevels[levelProgress.nextLevel].name : '，已达到最高等级' }}
        </text>
      </view>
    </view>
    
    <!-- 等级权益 -->
    <view class="benefits-section">
      <view class="section-header">
        <text class="section-title">等级权益</text>
        <text class="section-subtitle">{{ currentLevel.name }}专属</text>
      </view>
      <view class="benefits-list">
        <view v-for="(benefit, index) in currentLevel.benefits" :key="index" class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">{{ benefit }}</text>
        </view>
      </view>
    </view>
    
    <!-- 准入进度 -->
    <view v-if="levelProgress.nextLevel" class="progress-section">
      <view class="section-header">
        <text class="section-title">准入进度</text>
        <text class="section-subtitle">升级到{{ factoryLevels[levelProgress.nextLevel].name }}需要</text>
      </view>
      <view class="progress-details">
        <view v-for="(detail, key) in levelProgress.details" :key="key" class="progress-item">
          <text class="progress-label">{{ getDetailLabel(key) }}</text>
          <view class="progress-bar small">
            <view class="progress-fill" :style="{ width: detail.progress + '%' }"></view>
          </view>
          <text class="progress-value">{{ detail.current }}/{{ detail.target }}</text>
        </view>
      </view>
    </view>
    
    <!-- 快速认证入口 -->
    <view v-if="factoryData.level === 'C'" class="fast-track-section">
      <view class="fast-track-card" @tap="goToFastTrack">
        <text class="fast-track-icon">🚀</text>
        <view class="fast-track-info">
          <text class="fast-track-title">B级快速认证通道</text>
          <text class="fast-track-desc">满足条件可快速升级为B级工厂</text>
        </view>
        <text class="fast-track-arrow">></text>
      </view>
    </view>
    
    <!-- 等级变更记录 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">等级变更记录</text>
        <text class="section-subtitle">最近的等级变动</text>
      </view>
      <view class="history-list">
        <view v-for="(record, index) in levelHistory" :key="index" class="history-item">
          <view class="history-time">{{ record.time }}</view>
          <view class="history-content">
            <text class="history-level">{{ record.level }}</text>
            <text class="history-reason">{{ record.reason }}</text>
          </view>
        </view>
        <view v-if="levelHistory.length === 0" class="empty-history">
          <text class="empty-text">暂无等级变更记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import factoryLevelSystem from '../../utils/factory-level-system.js'

export default {
  data() {
    return {
      factoryData: {
        level: 'C',
        totalClosedPay: 0,
        closedPayRate: 0,
        continuousPayMonth: 0,
        workerGoodRate: 0,
        totalInviteFactory: 0,
        totalInviteWorker: 0,
        monthlyLoginDays: 0,
        violationCount: 0
      },
      factoryLevels: factoryLevelSystem.factoryLevels,
      levelProgress: {
        currentLevel: 'C',
        nextLevel: 'B',
        progress: 0,
        details: {}
      },
      levelHistory: [
        {
          time: '2024-01-15',
          level: 'C级（新入驻）',
          reason: '工厂注册成功'
        }
      ]
    }
  },
  computed: {
    currentLevel() {
      const levelKey = this.factoryData.level
      return this.factoryLevels[levelKey] || this.factoryLevels.C
    }
  },
  onLoad() {
    this.loadFactoryData()
    this.calculateLevelProgress()
  },
  methods: {
    // 加载工厂数据
    loadFactoryData() {
      const storedData = uni.getStorageSync('factoryData')
      if (storedData) {
        this.factoryData = storedData
      }
    },
    
    // 计算等级进度
    calculateLevelProgress() {
      this.levelProgress = factoryLevelSystem.calculateLevelProgress(this.factoryData)
    },
    
    // 获取进度详情标签
    getDetailLabel(key) {
      const labels = {
        totalClosedPay: '累计闭环发薪',
        closedPayRate: '闭环发薪占比',
        continuousPayMonth: '连续无投诉发薪月数',
        workerGoodRate: '工人综合好评率',
        totalInviteFactory: '有效拉新工厂',
        totalInviteWorker: '有效拉新工人',
        monthlyLoginDays: '月均连续登录天数',
        violationCount: '违规次数'
      }
      return labels[key] || key
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 跳转到快速认证页面
    goToFastTrack() {
      uni.navigateTo({
        url: '/pages/factory/fast-track-certification'
      })
    }
  }
}
</script>

<style scoped>
.my-level-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
}

/* 顶部导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  height: 100rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.empty {
  width: 60rpx;
}

/* 等级卡片 */
.level-card {
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.level-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.level-icon {
  font-size: 80rpx;
  margin-right: 30rpx;
}

.level-info {
  flex: 1;
}

.level-name {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.level-desc {
  font-size: 24rpx;
  opacity: 0.9;
  line-height: 1.4;
}

.level-progress {
  margin-top: 20rpx;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 15rpx;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  opacity: 0.9;
  text-align: right;
  display: block;
}

/* 通用section样式 */
.benefits-section,
.progress-section,
.history-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.section-subtitle {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 权益列表 */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  padding: 15rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.benefit-item:active {
  background: #f0f0f0;
  transform: translateX(10rpx);
}

.benefit-icon {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: bold;
  margin-right: 15rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.benefit-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 进度详情 */
.progress-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.progress-label {
  font-size: 22rpx;
  color: #333;
  font-weight: 500;
}

.progress-bar.small {
  height: 10rpx;
  border-radius: 5rpx;
}

.progress-value {
  font-size: 20rpx;
  color: #999;
  text-align: right;
}

/* 快速认证入口 */
.fast-track-section {
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.fast-track-card {
  background: linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%);
  display: flex;
  align-items: center;
  padding: 25rpx;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 16rpx rgba(250, 140, 22, 0.3);
  transition: all 0.3s ease;
}

.fast-track-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(250, 140, 22, 0.4);
}

.fast-track-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.fast-track-info {
  flex: 1;
}

.fast-track-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  display: block;
  margin-bottom: 5rpx;
}

.fast-track-desc {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

.fast-track-arrow {
  font-size: 32rpx;
  color: #fff;
  margin-left: 20rpx;
}

/* 等级变更记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  border-left: 4rpx solid #1677ff;
}

.history-time {
  font-size: 20rpx;
  color: #999;
  margin-right: 20rpx;
  width: 120rpx;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
}

.history-level {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.history-reason {
  font-size: 20rpx;
  color: #666;
  display: block;
}

.empty-history {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.empty-text {
  font-size: 22rpx;
}
</style>
