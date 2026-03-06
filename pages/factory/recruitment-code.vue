<template>
  <view class="recruitment-code-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-left" @click="navigateBack">
        <text class="back-icon">←</text>
        <text class="page-title">招工入职码</text>
      </view>
    </view>
    
    <!-- 主要内容 -->
    <view class="content">
      <!-- 二维码区域 -->
      <view class="qrcode-section">
        <view class="qrcode-container">
          <text class="qrcode-placeholder">📱</text>
          <text class="qrcode-text">扫码下载 APP</text>
        </view>
      </view>
      
      <!-- 功能说明 -->
      <view class="features-section">
        <view class="feature-item">
          <text class="feature-icon">✅</text>
          <text class="feature-text">一键入职，快速流程</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🚀</text>
          <text class="feature-text">B级快速认证绿色通道</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📊</text>
          <text class="feature-text">实时查看入职数据</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="actions-section">
        <button class="action-button primary" @click="navigateTo('/pages/factory/fast-track-certification')">
          <text class="button-text">立即认证 B 级</text>
        </button>
        <button class="action-button secondary" @click="navigateTo('/pages/factory/invite-code-generate')">
          <text class="button-text">生成邀请码</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    }
  }
}
</script>

<style scoped>
.recruitment-code-container {
  padding: 120rpx 0 0 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  height: 80rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-icon {
  font-size: 32rpx;
  color: white;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

/* 主要内容 */
.content {
  padding: 40rpx 24rpx;
}

/* 二维码区域 */
.qrcode-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
}

.qrcode-container {
  background-color: white;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.qrcode-placeholder {
  font-size: 200rpx;
}

.qrcode-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 功能说明 */
.features-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 40rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  font-size: 32rpx;
}

.feature-text {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

/* 操作按钮 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-button {
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-button:active {
  transform: translateY(4rpx);
}

.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.secondary {
  background-color: white;
  border: 2rpx solid #E0E0E0;
  color: #333;
}

.button-text {
  font-size: 24rpx;
  font-weight: 500;
}

.primary .button-text {
  color: white;
}
</style>