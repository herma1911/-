<template>
  <view class="invite-code-input-container">
    <view class="header">
      <text class="title">绑定班组</text>
    </view>
    
    <!-- 扫码或输码引导 -->
    <view class="scan-guide">
      <view class="guide-section">
        <text class="guide-title">绑定班组</text>
        <text class="guide-text">请选择以下方式之一绑定班组</text>
        
        <!-- 扫码入职 -->
        <view class="scan-option">
          <button class="scan-btn" @click="scanQRCode">
            <text class="scan-icon">📱</text>
            <text class="scan-text">扫码入职</text>
          </button>
          <text class="scan-hint">扫描工厂提供的入职二维码</text>
        </view>
        
        <!-- 手动输码 -->
        <view class="input-option">
          <text class="input-title">或输入邀请码</text>
          <view class="code-input-container">
            <input type="number" v-model="inviteCode" placeholder="请输入6位邀请码" class="code-input" maxlength="6" />
          </view>
          <button class="submit-btn" @click="verifyInviteCode" :disabled="inviteCode.length !== 6">
            <text class="submit-text">确认绑定</text>
          </button>
        </view>
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
    // 扫码入职
    scanQRCode() {
      console.log('开始扫码')
      uni.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          console.log('扫码成功:', res)
          // 解析二维码内容
          const qrContent = res.result
          console.log('二维码内容:', qrContent)
          
          // 假设二维码内容是邀请码或包含邀请码的URL
          let inviteCode = qrContent
          // 如果是URL，尝试从URL中提取邀请码
          if (qrContent.includes('inviteCode=')) {
            const match = qrContent.match(/inviteCode=(\d+)/)
            if (match && match[1]) {
              inviteCode = match[1]
            }
          }
          
          // 验证邀请码
          this.inviteCode = inviteCode
          this.verifyInviteCode()
        },
        fail: (err) => {
          console.log('扫码失败:', err)
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    
    // 验证邀请码
    verifyInviteCode() {
      if (!this.inviteCode || this.inviteCode.length < 6) {
        uni.showToast({
          title: '请输入6位邀请码',
          icon: 'none'
        })
        return
      }
      
      console.log('验证邀请码:', this.inviteCode)
      
      // 验证邀请码
      const inviteRecords = uni.getStorageSync('inviteRecords') || []
      console.log('邀请码记录:', inviteRecords)
      
      // 模拟邀请码验证（开发测试用）
      // 实际项目中应该调用后端API验证
      const validRecord = inviteRecords.find(record => {
        // 检查邀请码是否存在且未过期
        const createdAt = new Date(record.createdAt)
        const expiryDate = new Date(createdAt.getTime() + record.expiryDays * 24 * 60 * 60 * 1000)
        const now = new Date()
        return record.code === this.inviteCode && record.status === 'active' && now <= expiryDate
      }) || {
        // 测试数据：如果没有记录，使用模拟数据
        id: Date.now(),
        code: this.inviteCode,
        department: '缝纫车间',
        process: '车工',
        wage: 15,
        expiryDays: 7,
        createdAt: new Date().toISOString(),
        usedCount: 0,
        status: 'active'
      }
      
      console.log('有效记录:', validRecord)
      
      if (validRecord) {
        // 邀请码有效，跳转到班组绑定确认页
        console.log('跳转到确认页面')
        uni.navigateTo({
          url: `/pages/worker/invite-confirmation?code=${this.inviteCode}&recordId=${validRecord.id}`,
          success: (res) => {
            console.log('跳转成功:', res)
          },
          fail: (err) => {
            console.log('跳转失败:', err)
            uni.showToast({
              title: '跳转失败，请重试',
              icon: 'none'
            })
          }
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



.scan-option {
  width: 100%;
  margin-bottom: 30rpx;
  text-align: center;
}

.scan-btn {
  width: 80%;
  height: 90rpx;
  border-radius: 15rpx;
  background-color: #4CAF50;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
  margin: 0 auto 15rpx;
}

.scan-icon {
  font-size: 32rpx;
}

.scan-text {
  font-size: 28rpx;
}

.scan-hint {
  font-size: 20rpx;
  color: #666;
  text-align: center;
}

.input-option {
  width: 100%;
}

.input-title {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  margin-bottom: 20rpx;
  display: block;
}

.code-input-container {
  width: 100%;
  margin-bottom: 20rpx;
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