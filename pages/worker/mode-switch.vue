<template>
  <view class="mode-switch-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-bar">
        <text class="back-btn" @click="goBack">←</text>
        <text class="page-title">模式切换</text>
        <text class="empty"></text>
      </view>
    </view>
    
    <!-- 模式选择 -->
    <view class="mode-selection">
      <view class="mode-card" :class="{ active: currentMode === 'time-tracking' }" @click="selectMode('time-tracking')">
        <view class="mode-icon time-tracking-icon">⏰</view>
        <text class="mode-title">计时计薪模式</text>
        <text class="mode-description">包含计时计薪、工作记录、账本等完整功能</text>
        <view class="mode-features">
          <text class="feature-item">• 计时计薪功能</text>
          <text class="feature-item">• 工作记录管理</text>
          <text class="feature-item">• 完整记账功能</text>
          <text class="feature-item">• 数据统计分析</text>
        </view>
      </view>
      
      <view class="mode-card" :class="{ active: currentMode === 'pure-accounting' }" @click="selectMode('pure-accounting')">
        <view class="mode-icon pure-accounting-icon">📊</view>
        <text class="mode-title">纯记账模式</text>
        <text class="mode-description">仅保留收支记录和简单统计，界面简洁</text>
        <view class="mode-features">
          <text class="feature-item">• 收支记录功能</text>
          <text class="feature-item">• 简单统计分析</text>
          <text class="feature-item">• 界面简洁清爽</text>
          <text class="feature-item">• 专注记账体验</text>
        </view>
      </view>
    </view>
    
    <!-- 模式说明 -->
    <view class="mode-info">
      <text class="info-title">模式说明</text>
      <text class="info-content">• 切换模式不会丢失任何数据，所有记录都会被保留</text>
      <text class="info-content">• 纯记账模式下，计时计薪相关功能入口会被隐藏</text>
      <text class="info-content">• 您可以随时切换回计时计薪模式恢复完整功能</text>
    </view>
    
    <!-- 确认按钮 -->
    <view class="action-buttons">
      <button class="confirm-button" @click="confirmModeChange">确认切换</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentMode: 'time-tracking',
      selectedMode: 'time-tracking'
    }
  },
  onLoad() {
    this.loadCurrentMode()
  },
  methods: {
    loadCurrentMode() {
      const savedMode = uni.getStorageSync('appMode') || 'time-tracking'
      this.currentMode = savedMode
      this.selectedMode = savedMode
    },
    selectMode(mode) {
      this.selectedMode = mode
    },
    confirmModeChange() {
      if (this.selectedMode !== this.currentMode) {
        uni.setStorageSync('appMode', this.selectedMode)
        uni.showToast({
          title: '模式切换成功',
          icon: 'success'
        })
        
        // 重新加载首页以应用新模式
        setTimeout(() => {
          uni.reLaunch({
            url: '../home/home'
          })
        }, 1000)
      } else {
        uni.showToast({
          title: '当前已是该模式',
          icon: 'none'
        })
      }
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.mode-switch-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 32rpx;
  color: #333;
  width: 40rpx;
}

.page-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: center;
}

.empty {
  width: 40rpx;
}

/* 模式选择 */
.mode-selection {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.mode-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2rpx solid #e0e0e0;
}

.mode-card.active {
  border-color: #1890ff;
  background-color: #f0f9ff;
  box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.15);
}

.mode-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
  display: block;
}

.time-tracking-icon {
  color: #1890ff;
}

.pure-accounting-icon {
  color: #52c41a;
}

.mode-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.mode-description {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.4;
  display: block;
}

.mode-features {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.feature-item {
  font-size: 18rpx;
  color: #999;
  line-height: 1.4;
}

/* 模式说明 */
.mode-info {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.info-content {
  font-size: 20rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

/* 确认按钮 */
.action-buttons {
  margin-bottom: 30rpx;
}

.confirm-button {
  width: 100%;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #1890ff;
  color: #fff;
  font-weight: bold;
}
</style>