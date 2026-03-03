<template>
  <view class="ledger-authorization-container">
    <view class="header">
      <text class="title">记账授权管理</text>
      <button class="back-button" @click="goBack">返回</button>
    </view>
    
    <view class="authorization-status">
      <view class="status-card">
        <text class="status-title">当前授权状态</text>
        <text class="status-value" :class="{ 'active': isAuthorized }">
          {{ isAuthorized ? '已授权' : '未授权' }}
        </text>
      </view>
    </view>
    
    <view class="authorization-info">
      <text class="info-title">授权内容</text>
      <view class="info-list">
        <text class="info-item">• 工时记录</text>
        <text class="info-item">• 产量数据</text>
        <text class="info-item">• 考勤情况</text>
        <text class="info-item">• 工作稳定性</text>
      </view>
      
      <text class="info-title">授权说明</text>
      <view class="info-list">
        <text class="info-item">• 授权后，老板只能查看您的月度记账记录</text>
        <text class="info-item">• 老板不可修改或删除您的记账记录</text>
        <text class="info-item">• 您可以随时关闭授权</text>
        <text class="info-item">• 授权仅对当前绑定的工厂有效</text>
      </view>
    </view>
    
    <view class="button-section">
      <button 
        :class="['authorization-button', { 'active': !isAuthorized }]"
        @click="toggleAuthorization"
      >
        {{ isAuthorized ? '关闭授权' : '一键授权' }}
      </button>
    </view>
    
    <view class="disclaimer">
      <text class="disclaimer-text">
        注意：授权后，老板将能看到您的记账记录，包括工时、产量、考勤等信息。请谨慎操作。
      </text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isAuthorized: false,
      boundCompany: null
    }
  },
  onLoad() {
    this.loadAuthorizationStatus()
    this.loadBoundCompany()
  },
  methods: {
    loadAuthorizationStatus() {
      // 加载授权状态
      const authorizationStatus = uni.getStorageSync('ledgerAuthorization')
      this.isAuthorized = authorizationStatus?.isAuthorized || false
    },
    loadBoundCompany() {
      // 加载绑定的工厂信息
      this.boundCompany = uni.getStorageSync('boundCompany') || null
    },
    toggleAuthorization() {
      if (!this.boundCompany) {
        uni.showToast({
          title: '请先绑定工厂',
          icon: 'none'
        })
        return
      }
      
      this.isAuthorized = !this.isAuthorized
      
      // 保存授权状态
      uni.setStorageSync('ledgerAuthorization', {
        isAuthorized: this.isAuthorized,
        companyId: this.boundCompany.id,
        companyName: this.boundCompany.name,
        authorizedAt: new Date().toISOString()
      })
      
      // 显示提示
      uni.showToast({
        title: this.isAuthorized ? '授权成功' : '授权已关闭',
        icon: 'success'
      })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.ledger-authorization-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.back-button {
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
}

.authorization-status {
  margin-bottom: 30rpx;
}

.status-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.status-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #999;
}

.status-value.active {
  color: #4CAF50;
}

.authorization-info {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.info-list {
  margin-bottom: 30rpx;
}

.info-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

.button-section {
  margin-bottom: 30rpx;
}

.authorization-button {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #ddd;
  color: #666;
}

.authorization-button.active {
  background-color: #4CAF50;
  color: #fff;
}

.disclaimer {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.disclaimer-text {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
}
</style>