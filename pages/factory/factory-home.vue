<template>
  <view class="factory-home-container">
    <!-- 顶部固定导航栏 -->
    <view class="top-nav">
      <view class="nav-left">
        <text class="page-title">工厂管理中心</text>
      </view>
      <view class="nav-right">
        <view class="nav-item" @click="navigateTo('../worker/messages')">
          <text class="nav-icon">💬</text>
          <view v-if="unreadMessages > 0" class="badge">{{unreadMessages}}</view>
        </view>
        <view class="nav-item" @click="navigateTo('../social/factory-profile')">
          <text class="nav-icon">🏭</text>
        </view>
      </view>
    </view>
    
    <!-- 核心功能入口区（按ERP/MES分类） -->
    
    <!-- ERP 相关功能（计划层） -->
    <view class="function-section">
      <view class="section-header">
        <text class="section-title">ERP 相关功能（计划层）</text>
        <text class="section-subtitle">管的是「要做什么、有什么资源、钱怎么算」</text>
      </view>
      <view class="function-grid">
        <view class="function-card" @click="navigateTo('../order/order-list')">
          <view class="function-icon teal-icon">
            <text class="icon-text">📋</text>
          </view>
          <text class="function-title">订单管理</text>
          <text class="function-subtitle">查看和管理订单</text>
        </view>
        
        <view class="function-card" @click="navigateTo('./reconciliation-management')">
          <view class="function-icon orange-icon">
            <text class="icon-text">💵</text>
          </view>
          <text class="function-title">对账结算</text>
          <text class="function-subtitle">处理对账请求</text>
        </view>
        
        <view class="function-card" @click="navigateTo('./sub-account-management')">
          <view class="function-icon gray-icon">
            <text class="icon-text">🏭</text>
          </view>
          <text class="function-title">工厂管理</text>
          <text class="function-subtitle">子账号和权限管理</text>
        </view>
      </view>
    </view>
    
    <!-- MES 相关功能（执行层） -->
    <view class="function-section">
      <view class="section-header">
        <text class="section-title">MES 相关功能（执行层）</text>
        <text class="section-subtitle">管的是「车间现场怎么干、干了多少、谁在干」</text>
      </view>
      <view class="function-grid">
        <view class="function-card" @click="navigateTo('../finance/expense-input')">
          <view class="function-icon purple-icon">
            <text class="icon-text">💰</text>
          </view>
          <text class="function-title">打工价</text>
          <text class="function-subtitle">设置工人工资标准</text>
        </view>
        
        <view class="function-card" @click="navigateTo('./ledger-management')">
          <view class="function-icon pink-icon">
            <text class="icon-text">⏰</text>
          </view>
          <text class="function-title">记工管理</text>
          <text class="function-subtitle">录入工人记工记录</text>
        </view>
        
        <view class="function-card" @click="navigateTo('./job-management')">
          <view class="function-icon blue-icon">
            <text class="icon-text">📢</text>
          </view>
          <text class="function-title">岗位管理</text>
          <text class="function-subtitle">发布和管理岗位</text>
        </view>
        
        <view class="function-card" @click="navigateTo('./onboarding-process')">
          <view class="function-icon green-icon">
            <text class="icon-text">✅</text>
          </view>
          <text class="function-title">线上入职</text>
          <text class="function-subtitle">工人入职流程管理</text>
        </view>
        
        <view class="function-card" @click="navigateTo('./efficiency-tools')">
          <view class="function-icon gray-icon">
            <text class="icon-text">🛠️</text>
          </view>
          <text class="function-title">效率工具</text>
          <text class="function-subtitle">招工记账和数据看板</text>
        </view>
      </view>
    </view>
    
    <!-- 平台运营/系统管理 -->
    <view class="function-section">
      <view class="section-header">
        <text class="section-title">平台运营/系统管理</text>
        <text class="section-subtitle">不属于 ERP/MES 的平台专属功能</text>
      </view>
      <view class="function-grid">
        <view class="function-card" @click="navigateTo('./growth-management')">
          <view class="function-icon yellow-icon">
            <text class="icon-text">🚀</text>
          </view>
          <text class="function-title">运营增长</text>
          <text class="function-subtitle">拉新裂变和流量加权</text>
        </view>
      </view>
    </view>
    
    <!-- 核心数据概览区 -->
    <view class="data-overview">
      <view class="overview-card" @click="navigateTo('./onboarding-process')">
        <text class="overview-value">{{effectiveOnboardingCount}}</text>
        <text class="overview-label">本月有效到岗闭环数</text>
        <text class="overview-trend" :class="{ 'positive': onboardingTrend > 0, 'negative': onboardingTrend < 0 }">
          {{onboardingTrend > 0 ? '+' : ''}}{{onboardingTrend}}% 环比
        </text>
      </view>
      
      <view class="overview-card" @click="navigateTo('./reconciliation-management')" :class="{ 'warning': pendingReconciliation > 5 }">
        <text class="overview-value">{{pendingReconciliation}}</text>
        <text class="overview-label">待处理对账请求</text>
        <text class="overview-trend">点击处理</text>
      </view>
      
      <view class="overview-card" @click="navigateTo('./job-management')">
        <text class="overview-value">{{totalApplications}}</text>
        <text class="overview-label">岗位累计投递数</text>
        <text class="overview-trend">本月新增{{monthlyNewApplications}}</text>
      </view>
      
      <view class="overview-card" @click="navigateTo('../approval/evaluation-management')">
        <text class="overview-value">{{factoryScore}}</text>
        <text class="overview-label">工厂综合评分</text>
        <text class="overview-trend">{{factoryLevel}}</text>
      </view>
    </view>
    
    <!-- 快捷操作区 -->
    <view class="quick-actions">
      <!-- 左侧：高频核心操作 -->
      <view class="quick-actions-left">
        <view class="action-button primary-button" @click="navigateTo('../social/publish-recruitment')">
          <text class="action-icon">📢</text>
          <text class="action-text">发布招聘</text>
        </view>
        <view class="action-button primary-button" @click="navigateTo('./onboarding-process')">
          <text class="action-icon">✅</text>
          <text class="action-text">发起线上入职</text>
        </view>
        <view class="action-button primary-button" @click="navigateTo('./reconciliation-management')">
          <text class="action-icon">💵</text>
          <text class="action-text">对账确认</text>
        </view>
        <view class="action-button primary-button" @click="navigateTo('./team-confirmation')">
          <text class="action-icon">👥</text>
          <text class="action-text">班组确认</text>
        </view>
      </view>
      
      <!-- 右侧：增值服务快捷入口 -->
      <view class="quick-actions-right">
        <view class="action-button secondary-button" @click="navigateTo('./invite-code-generate')">
          <text class="action-icon">🎟️</text>
          <text class="action-text">生成邀请码</text>
        </view>
        <view class="action-button secondary-button" @click="navigateTo('./growth-management')">
          <text class="action-icon">🔝</text>
          <text class="action-text">岗位置顶</text>
        </view>
        <view class="action-button secondary-button" @click="navigateTo('./growth-management')">
          <text class="action-icon">💎</text>
          <text class="action-text">套餐权益</text>
        </view>
        <view class="action-button secondary-button" @click="navigateTo('../approval/evaluation-management')">
          <text class="action-icon">🏅</text>
          <text class="action-text">我的勋章</text>
        </view>
      </view>
    </view>
    
    <!-- 权益成长区 -->
    <view class="权益成长区">
      <view class="权益卡片">
        <view class="权益左侧">
          <text class="套餐状态">{{currentPackage}}</text>
          <text class="已解锁权益">已解锁{{unlocked权益}}项权益</text>
          <text class="冷启动福利" v-if="hasColdStartBenefits">
            您已邀请{{invitedFactories}}家工厂认证，可领取{{freeMonths}}个月免费套餐
          </text>
        </view>
        <view class="权益右侧">
          <view class="权益按钮" @click="navigateTo('./growth-management')">
            <text class="按钮文本">查看全部权益</text>
          </view>
          <view class="权益按钮 primary" @click="navigateTo('./growth-management')">
            <text class="按钮文本 white">升级套餐</text>
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
      // 统计数据
      unreadMessages: 3,
      hasPaidFeatures: true,
      effectiveOnboardingCount: 15,
      onboardingTrend: 12.5,
      pendingReconciliation: 8,
      totalApplications: 128,
      monthlyNewApplications: 35,
      factoryScore: '4.8',
      factoryLevel: 'A级诚信用工',
      currentPackage: '免费版',
      unlocked权益: 5,
      hasColdStartBenefits: true,
      invitedFactories: 2,
      freeMonths: 2
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    // 加载数据
    loadData() {
      // 模拟从本地存储或API加载数据
      const factoryData = uni.getStorageSync('factoryData')
      if (factoryData) {
        this.effectiveOnboardingCount = factoryData.effectiveOnboardingCount || 0
        this.pendingReconciliation = factoryData.pendingReconciliation || 0
        this.totalApplications = factoryData.totalApplications || 0
        this.monthlyNewApplications = factoryData.monthlyNewApplications || 0
        this.factoryScore = factoryData.factoryScore || '0.0'
        this.factoryLevel = factoryData.factoryLevel || '未评级'
        this.currentPackage = factoryData.currentPackage || '免费版'
        this.unlocked权益 = factoryData.unlocked权益 || 0
        this.invitedFactories = factoryData.invitedFactories || 0
        this.freeMonths = factoryData.freeMonths || 0
        this.hasColdStartBenefits = this.invitedFactories > 0
      }
    },
    // 导航到指定页面
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    }
  }
}
</script>

<style scoped>
.factory-home-container {
  padding: 120rpx 0 0 0;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 32rpx;
  display: flex;
  justify-content: space-between;
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
  flex: 1;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.nav-right {
  display: flex;
  gap: 32rpx;
}

.nav-item {
  position: relative;
}

.nav-icon {
  font-size: 36rpx;
  color: white;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background-color: #FF5252;
  color: white;
  border-radius: 50%;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
}

/* 功能分区 */
.function-section {
  background-color: #f5f5f5;
  padding: 0 24rpx 32rpx;
  margin-top: 0;
}

.section-header {
  padding: 32rpx 0 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.section-subtitle {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.function-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  min-height: 180rpx;
}

.function-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.function-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.blue-icon {
  background-color: #E3F2FD;
  color: #2196F3;
}

.green-icon {
  background-color: #E8F5E8;
  color: #4CAF50;
}

.purple-icon {
  background-color: #F3E5F5;
  color: #9C27B0;
}

.orange-icon {
  background-color: #FFF3E0;
  color: #FF9800;
}

.teal-icon {
  background-color: #E0F2F1;
  color: #009688;
}

.pink-icon {
  background-color: #FCE4EC;
  color: #E91E63;
}

.yellow-icon {
  background-color: #FFFDE7;
  color: #FFC107;
}

.gray-icon {
  background-color: #F5F5F5;
  color: #607D8B;
}

.icon-text {
  font-size: 36rpx;
}

.function-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
  text-align: center;
}

.function-subtitle {
  font-size: 18rpx;
  color: #999;
  text-align: center;
  line-height: 1.3;
}

.function-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  font-size: 24rpx;
}

/* 核心数据概览区 */
.data-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 0 24rpx 32rpx;
}

.overview-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.overview-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.overview-card.warning {
  border-left: 4rpx solid #FF5252;
}

.overview-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.overview-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.overview-trend {
  font-size: 18rpx;
  color: #999;
  display: block;
}

.overview-trend.positive {
  color: #4CAF50;
}

.overview-trend.negative {
  color: #F56C6C;
}

/* 快捷操作区 */
.quick-actions {
  display: flex;
  gap: 24rpx;
  padding: 0 24rpx 32rpx;
}

.quick-actions-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.quick-actions-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-button {
  background-color: white;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.action-button:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.secondary-button {
  background-color: white;
  border: 2rpx solid #E0E0E0;
  color: #333;
}

.action-icon {
  font-size: 32rpx;
}

.action-text {
  font-size: 24rpx;
  font-weight: 500;
}

.primary-button .action-text {
  color: white;
}

/* 权益成长区 */
.权益成长区 {
  padding: 0 24rpx 32rpx;
}

.权益卡片 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
  color: white;
}

.权益左侧 {
  flex: 1;
}

.套餐状态 {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.已解锁权益 {
  font-size: 20rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 12rpx;
}

.冷启动福利 {
  font-size: 18rpx;
  opacity: 0.8;
  display: block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 12rpx;
  border-radius: 8rpx;
  margin-top: 12rpx;
}

.权益右侧 {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.权益按钮 {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.权益按钮:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.权益按钮.primary {
  background-color: white;
  color: #667eea;
}

.按钮文本 {
  font-size: 20rpx;
  font-weight: 500;
}

.按钮文本.white {
  color: #667eea;
}

/* 响应式设计 */
@media screen and (max-width: 375px) {
  .factory-home-container {
    padding: 100rpx 0 0 0;
  }
  
  .function-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }
  
  .function-section {
    padding: 0 16rpx 32rpx;
    margin-top: 0;
  }
  
  .section-header {
    padding: 24rpx 0 12rpx;
  }
  
  .section-title {
    font-size: 24rpx;
  }
  
  .section-subtitle {
    font-size: 18rpx;
  }
  
  .function-card {
    padding: 16rpx 12rpx;
    min-height: 160rpx;
  }
  
  .function-title {
    font-size: 22rpx;
  }
  
  .function-subtitle {
    font-size: 16rpx;
  }
  
  .data-overview {
    gap: 16rpx;
    padding: 0 16rpx 32rpx;
  }
  
  .quick-actions {
    gap: 16rpx;
    padding: 0 16rpx 32rpx;
  }
  
  .权益成长区 {
    padding: 0 16rpx 32rpx;
  }
}
</style>