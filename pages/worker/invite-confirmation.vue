<template>
  <view class="invite-confirmation-container">
    <view class="header">
      <text class="title">班组绑定确认</text>
    </view>
    <!-- 步骤条 -->
    <view class="step-guide">
      <view class="step-item" :class="{ active: currentStep >= 1 }">
        <view class="step-number">{{ currentStep >= 1 ? '✓' : '1' }}</view>
        <text class="step-text">核对信息</text>
      </view>
      <view class="step-divider" :class="{ active: currentStep >= 1 }"></view>
      <view class="step-item" :class="{ active: currentStep >= 2 }">
        <view class="step-number">{{ currentStep >= 2 ? '✓' : '2' }}</view>
        <text class="step-text">确认绑定</text>
      </view>
    </view>
    <!-- 步骤1：核对信息 -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="info-card">
        <text class="card-title">工厂信息</text>
        <view class="info-item">
          <text class="info-label">工厂名称：</text>
          <text class="info-value">{{ factoryInfo.name || 'XX服装厂' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">车间组别：</text>
          <text class="info-value">{{ inviteRecord.department || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">工序：</text>
          <text class="info-value">{{ inviteRecord.process || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">工价：</text>
          <text class="info-value wage">{{ inviteRecord.wage || 0 }}元</text>
        </view>
        <view class="bubble-guide">
          <text class="bubble-text">请核对信息是否正确，班组长将在24小时内确认您的班组归属</text>
        </view>
      </view>
      <button class="next-btn" @click="nextStep">下一步</button>
    </view>
    <!-- 步骤2：本人确认 -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="confirm-card">
        <text class="card-title">确认绑定</text>
        <view class="confirm-item">
          <input type="checkbox" :checked="confirmations.identity" @change="confirmations.identity = $event.target.checked" class="checkbox" />
          <text class="confirm-text">我确认以上信息正确无误</text>
        </view>
        <view class="confirm-item">
          <input type="checkbox" :checked="confirmations.usage" @change="confirmations.usage = $event.target.checked" class="checkbox" />
          <text class="confirm-text">我同意绑定到该班组</text>
        </view>
      </view>
      <button class="submit-btn" @click="submitConfirmation" :disabled="!allConfirmed">
        <text class="submit-text">确认绑定</text>
      </button>
    </view>
    <!-- 绑定成功页 -->
    <view v-if="showSuccess" class="success-page">
      <view class="success-icon">✅</view>
      <text class="success-title">绑定成功！</text>
      <text class="success-subtitle">等待班组长确认您的班组归属</text>
      <view class="success-benefits">
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">已提交班组绑定申请，班组长将在24小时内确认</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">确认后您将可以查看班组工价并进行记账</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">未在24小时内确认将自动解绑</text>
        </view>
      </view>
      <view class="success-actions">
        <button class="action-btn" @click="goToLedger">去记账</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      showSuccess: false,
      confirmations: { identity: false, usage: false },
      factoryInfo: {},
      inviteRecord: {}
    }
  },
  computed: {
    allConfirmed() {
      return this.confirmations.identity && this.confirmations.usage
    }
  },
  onLoad(options) {
    // 从URL参数中获取邀请码和记录ID
    const { code, recordId } = options || {}
    console.log('Invite confirmation loaded with options:', options)
    console.log('Invite confirmation loaded with code:', code, 'recordId:', recordId)
    
    // 模拟加载工厂信息和邀请记录
    this.factoryInfo = {
      name: 'XX服装厂',
      address: 'XX市XX区XX街道XX号'
    }
    
    this.inviteRecord = {
      department: '缝纫车间',
      process: '车工',
      wage: 15,
      code: code // 保存邀请码
    }
    
    console.log('Loaded factoryInfo:', this.factoryInfo)
    console.log('Loaded inviteRecord:', this.inviteRecord)
  },
  methods: {
    nextStep() { this.currentStep = 2 },
    submitConfirmation() {
      // 保存绑定状态到本地存储
      const boundCompany = {
        name: this.factoryInfo.name || 'XX服装厂',
        department: this.inviteRecord.department || '',
        process: this.inviteRecord.process || '',
        wage: this.inviteRecord.wage || 0,
        boundAt: new Date().toISOString()
      }
      uni.setStorageSync('boundCompany', boundCompany)
      
      // 保存款号工序映射（示例数据）
      const styleProcessMap = {
        'ST123': [
          { processName: '车工', unitPrice: 15 },
          { processName: '熨烫', unitPrice: 8 },
          { processName: '包装', unitPrice: 5 }
        ],
        'ST456': [
          { processName: '车工', unitPrice: 18 },
          { processName: '熨烫', unitPrice: 10 },
          { processName: '包装', unitPrice: 6 }
        ]
      }
      uni.setStorageSync('styleProcessMap', styleProcessMap)
      
      // 保存历史款号
      const styleHistory = ['ST123', 'ST456']
      uni.setStorageSync('styleHistory', styleHistory)
      
      this.showSuccess = true
    },
    goToLedger() {
      // 跳转到首页，确保绑定状态被重新加载
      uni.reLaunch({
        url: '/pages/worker/employee-home'
      })
    }
  }
}
</script>

<style scoped>
.invite-confirmation-container { padding: 20rpx; }
.header { padding: 30rpx 0; text-align: center; }
.title { font-size: 32rpx; font-weight: bold; }
.step-guide { display: flex; align-items: center; justify-content: center; margin: 40rpx 0; }
.step-item { text-align: center; }
.step-number { width: 60rpx; height: 60rpx; line-height: 60rpx; border-radius: 50%; background: #eee; display: inline-block; margin-bottom: 10rpx; }
.step-text { font-size: 26rpx; }
.step-divider { width: 80rpx; height: 2rpx; background: #eee; margin: 0 20rpx; }
.active .step-number { background: #07c160; color: #fff; }
.active .step-divider { background: #07c160; }
.step-content { padding: 30rpx; }
.info-card, .confirm-card { background: #fff; border-radius: 16rpx; padding: 30rpx; margin-bottom: 30rpx; }
.card-title { font-size: 28rpx; font-weight: bold; margin-bottom: 20rpx; display: block; }
.info-item { margin-bottom: 20rpx; font-size: 26rpx; }
.info-label { color: #666; }
.info-value { color: #333; margin-left: 10rpx; }
.wage { color: #07c160; }
.bubble-guide { background: #f5fafe; padding: 20rpx; border-radius: 12rpx; margin-top: 20rpx; }
.bubble-text { font-size: 24rpx; color: #666; }
.next-btn, .submit-btn, .action-btn { background: #07c160; color: #fff; border: none; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx; width: 100%; }
.confirm-item { margin-bottom: 20rpx; display: flex; align-items: center; }
.checkbox { margin-right: 20rpx; transform: scale(1.5); }
.confirm-text { font-size: 26rpx; }
.success-page { text-align: center; padding: 60rpx 0; }
.success-icon { font-size: 80rpx; color: #07c160; margin-bottom: 30rpx; }
.success-title { font-size: 36rpx; font-weight: bold; margin-bottom: 10rpx; }
.success-subtitle { font-size: 26rpx; color: #666; margin-bottom: 40rpx; }
.success-benefits { text-align: left; background: #f5fafe; padding: 30rpx; border-radius: 16rpx; margin-bottom: 40rpx; }
.benefit-item { display: flex; align-items: flex-start; margin-bottom: 20rpx; font-size: 24rpx; }
.benefit-icon { color: #07c160; margin-right: 15rpx; }
.benefit-text { color: #666; }
</style>