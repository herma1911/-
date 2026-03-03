<template>
  <view class="invite-code-input-container">
    <view class="header">
      <text class="title">绑定班组</text>
    </view>
    
    <!-- 手动输码引导 -->
    <view class="scan-guide">
      <view class="guide-section">
        <text class="guide-title">输入邀请码</text>
        <text class="guide-text">输入工厂给你的6位数字邀请码</text>
        <view class="code-input-container">
          <input type="number" v-model="inviteCode" placeholder="请输入6位邀请码" class="code-input" maxlength="6" />
        </view>
        <button class="submit-btn" @click="verifyInviteCode" :disabled="inviteCode.length !== 6">
          <text class="submit-text">确认绑定</text>
        </button>
      </view>
    </view>
    
    <!-- 权益说明 -->
    <view class="benefits-section">
      <text class="benefits-title">绑定班组后可享受</text>
      <view class="benefit-item">
        <text class="benefit-icon">✅</text>
        <text class="benefit-text">查看本班组所有款号工价</text>
      </view>
      <view class="benefit-item">
        <text class="benefit-icon">✅</text>
        <text class="benefit-text">进行计件/计时记账</text>
      </view>
      <view class="benefit-item">
        <text class="benefit-icon">✅</text>
        <text class="benefit-text">提交账单审批</text>
      </view>
      <view class="benefit-item">
        <text class="benefit-icon">✅</text>
        <text class="benefit-text">对工厂进行评价</text>
      </view>
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
    verifyInviteCode() {
      if (this.inviteCode.length !== 6) {
        uni.showToast({
          title: '请输入6位邀请码',
          icon: 'none'
        })
        return
      }
      
      // 验证邀请码
      const inviteRecords = uni.getStorageSync('inviteRecords') || []
      const validRecord = inviteRecords.find(record => {
        // 检查邀请码是否存在且未过期
        const createdAt = new Date(record.createdAt)
        const expiryDate = new Date(createdAt.getTime() + record.expiryDays * 24 * 60 * 60 * 1000)
        const now = new Date()
        return record.code === this.inviteCode && record.status === 'active' && now <= expiryDate
      })
      
      if (validRecord) {
        // 邀请码有效，跳转到班组绑定确认页
        uni.navigateTo({
          url: `/pages/worker/invite-confirmation?code=${this.inviteCode}&recordId=${validRecord.id}`
        })
      } else {
        // 邀请码无效
        uni.showModal({
          title: '邀请码无效',
          content: '邀请码已过期或不存在，请联系工厂重新生成邀请码',
          confirmText: '联系工厂',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 跳转到联系工厂页面
              uni.showToast({
                title: '联系工厂功能开发中',
                icon: 'none'
              })
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.invite-code-input-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.scan-guide {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 30rpx;
}

.guide-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.guide-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.guide-text {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  line-height: 1.4;
}



.code-input-container {
  width: 100%;
  margin-top: 20rpx;
}

.code-input {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 32rpx;
  text-align: center;
  letter-spacing: 10rpx;
  font-weight: bold;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 10rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.submit-btn:disabled {
  background-color: #e0e0e0;
  color: #999;
}

.benefits-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.benefits-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.benefit-icon {
  font-size: 24rpx;
  margin-top: 2rpx;
}

.benefit-text {
  font-size: 22rpx;
  color: #666;
  flex: 1;
  line-height: 1.4;
}
</style>