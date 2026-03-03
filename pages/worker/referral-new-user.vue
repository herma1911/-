<template>
  <view class="referral-new-user-container">
    <!-- 顶部标题区域 -->
    <view class="header">
      <text class="header-title">🎉 好友邀请你加入衣起赚</text>
      <text class="header-subtitle">打工不踩坑，好活主动来</text>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 邀请人信息 -->
      <view class="inviter-info">
        <text class="inviter-icon">👤</text>
        <text class="inviter-text">你的好友 {{ inviterName }} 邀请你加入</text>
      </view>
      
      <!-- 衣起赚的好处 -->
      <view class="benefits-section">
        <text class="section-title">🌟 加入衣起赚，打工更轻松</text>
        
        <view class="benefits-grid">
          <view class="benefit-card">
            <text class="benefit-card-icon">🎯</text>
            <text class="benefit-card-title">精准找活</text>
            <text class="benefit-card-desc">按技能匹配好活，高薪工作主动来</text>
          </view>
          <view class="benefit-card">
            <text class="benefit-card-icon">💰</text>
            <text class="benefit-card-title">免费记账</text>
            <text class="benefit-card-desc">计件工资随手记，数据永不丢失</text>
          </view>
          <view class="benefit-card">
            <text class="benefit-card-icon">📋</text>
            <text class="benefit-card-title">技能档案</text>
            <text class="benefit-card-desc">在线简历，工厂优先联系你</text>
          </view>
          <view class="benefit-card">
            <text class="benefit-card-icon">⭐</text>
            <text class="benefit-card-title">工友评价</text>
            <text class="benefit-card-desc">技能点赞，简历更有竞争力</text>
          </view>
        </view>
      </view>
      
      <!-- 新用户福利 -->
      <view class="welcome-section">
        <text class="section-title">🎁 新用户专享福利</text>
        
        <view class="welcome-benefits">
          <view class="welcome-benefit-item">
            <text class="welcome-icon">✅</text>
            <text class="welcome-text">注册即送简历置顶 3 天</text>
          </view>
          <view class="welcome-benefit-item">
            <text class="welcome-icon">✅</text>
            <text class="welcome-text">完善档案送 50 积分</text>
          </view>
          <view class="welcome-benefit-item">
            <text class="welcome-icon">✅</text>
            <text class="welcome-text">首单记账送技能认证</text>
          </view>
          <view class="welcome-benefit-item">
            <text class="welcome-icon">✅</text>
            <text class="welcome-text">邀请好友再得置顶权益</text>
          </view>
        </view>
      </view>
      
      <!-- 工厂真实评价 -->
      <view class="factory-reviews-section">
        <text class="section-title">🏭 工厂真实评价</text>
        
        <view class="review-list">
          <view class="review-item">
            <text class="review-factory">衣起赚服装厂</text>
            <text class="review-stars">⭐⭐⭐⭐⭐</text>
            <text class="review-content">工资准时发，管理人性化，活多稳定</text>
          </view>
          <view class="review-item">
            <text class="review-factory">时尚服饰有限公司</text>
            <text class="review-stars">⭐⭐⭐⭐</text>
            <text class="review-content">环境好，伙食不错，工价透明</text>
          </view>
        </view>
      </view>
      
      <!-- 立即注册按钮 -->
      <view class="action-section">
        <button class="register-btn" @click="registerNow">
          <text class="register-btn-text">立即注册，开启轻松打工之旅</text>
        </button>
        <text class="action-tip">注册即送简历置顶 3 天，工厂优先联系你</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviterName: '好友',
      referralCode: ''
    }
  },
  onLoad(options) {
    // 从参数中获取邀请人信息
    if (options.inviter) {
      this.inviterName = options.inviter
    }
    if (options.code) {
      this.referralCode = options.code
    }
  },
  methods: {
    // 立即注册
    registerNow() {
      // 跳转到注册页面
      uni.navigateTo({
        url: '../login/login?referral=' + this.referralCode + '&inviter=' + this.inviterName
      })
    }
  }
}
</script>

<style scoped>
.referral-new-user-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部标题区域 */
.header {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: #fff;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(74, 144, 226, 0.3);
}

.header-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
  display: block;
}

.header-subtitle {
  font-size: 20rpx;
  opacity: 0.9;
  display: block;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 邀请人信息 */
.inviter-info {
  background-color: #fff;
  padding: 25rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.inviter-icon {
  font-size: 48rpx;
  margin-right: 15rpx;
}

.inviter-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 通用区块样式 */
.benefits-section,
.welcome-section,
.factory-reviews-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}

/* 好处网格 */
.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15rpx;
}

.benefit-card {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.benefit-card:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.benefit-card-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 10rpx;
}

.benefit-card-title {
  font-size: 20rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.benefit-card-desc {
  font-size: 16rpx;
  color: #666;
  line-height: 1.3;
  display: block;
}

/* 欢迎福利 */
.welcome-benefits {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.welcome-benefit-item {
  display: flex;
  align-items: center;
  padding: 15rpx;
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 10rpx;
}

.welcome-icon {
  font-size: 20rpx;
  margin-right: 12rpx;
  color: #52c41a;
}

.welcome-text {
  flex: 1;
  font-size: 20rpx;
  color: #333;
  line-height: 1.4;
}

/* 工厂评价 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.review-item {
  padding: 20rpx;
  background-color: #f0f9ff;
  border: 1rpx solid #bae7ff;
  border-radius: 12rpx;
}

.review-factory {
  font-size: 20rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.review-stars {
  font-size: 18rpx;
  color: #faad14;
  display: block;
  margin-bottom: 8rpx;
}

.review-content {
  font-size: 18rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

/* 行动区域 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  align-items: center;
}

.register-btn {
  width: 100%;
  padding: 22rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.register-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(255, 107, 107, 0.2);
}

.register-btn-text {
  display: block;
  text-align: center;
}

.action-tip {
  font-size: 18rpx;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .header-title {
    font-size: 28rpx;
  }
  
  .section-title {
    font-size: 24rpx;
  }
  
  .benefit-card-title {
    font-size: 18rpx;
  }
  
  .benefit-card-desc {
    font-size: 14rpx;
  }
  
  .register-btn-text {
    font-size: 22rpx;
  }
}
</style>