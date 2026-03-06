<template>
  <view class="invite-input-container">
    <view class="header">
      <text class="back-btn" @tap="goBack">←</text>
      <text class="title">输入邀请码</text>
      <text class="placeholder"></text>
    </view>
    
    <view class="content">
      <view class="input-section">
        <text class="input-label">邀请码</text>
        <input 
          type="text" 
          v-model="inviteCode" 
          class="input-field" 
          placeholder="请输入班组邀请码" 
          maxlength="10"
        />
        <text class="input-hint">邀请码由班组长提供，用于绑定到对应班组</text>
      </view>
      
      <button class="submit-btn" @tap="submitInviteCode" :disabled="!inviteCode.trim()">
        确认并查看班组信息
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviteCode: ''
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    submitInviteCode() {
      if (!this.inviteCode.trim()) {
        uni.showToast({
          title: '请输入邀请码',
          icon: 'none'
        })
        return
      }
      
      // 跳转到邀请码确认页面，显示班组信息
      uni.navigateTo({
        url: `/pages/worker/invite-confirmation?code=${this.inviteCode}`
      })
    }
  }
}
</script>

<style scoped>
.invite-input-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  height: 120rpx;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  font-size: 36rpx;
  color: #333;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.placeholder {
  width: 36rpx;
}

.content {
  padding: 60rpx 30rpx;
}

.input-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.input-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20rpx;
  display: block;
}

.input-field {
  width: 100%;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  font-size: 26rpx;
  color: #333;
  border: 1rpx solid #e8e8e8;
  margin-bottom: 15rpx;
}

.input-hint {
  font-size: 22rpx;
  color: #999;
  line-height: 1.4;
}

.submit-btn {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 25rpx;
  font-size: 28rpx;
  font-weight: 600;
  width: 100%;
}

.submit-btn:disabled {
  background: #d9d9d9;
  color: #fff;
}
</style>