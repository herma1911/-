<template>
  <view class="factory-home-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-bar">
        <text class="page-title">工厂首页</text>
      </view>
    </view>
    
    <!-- 核心功能区 -->
    <view class="core-functions">
      <!-- 打工价 -->
      <view class="function-card" @tap="goToSetWage">
        <view class="card-icon">💰</view>
        <text class="card-title">打工价</text>
        <text class="card-desc">设置工人工资标准</text>
      </view>
      
      <!-- 订单管理 -->
      <view class="function-card" @tap="goToOrderList">
        <view class="card-icon">📋</view>
        <text class="card-title">订单管理</text>
        <text class="card-desc">查看和管理订单</text>
      </view>
      
      <!-- 岗位管理 -->
      <view class="function-card" @tap="goToJobManagement">
        <view class="card-icon">📢</view>
        <text class="card-title">岗位管理</text>
        <text class="card-desc">发布和管理岗位</text>
      </view>
      
      <!-- 线上入职 -->
      <view class="function-card" @tap="goToOnboardingProcess">
        <view class="card-icon">✅</view>
        <text class="card-title">线上入职</text>
        <text class="card-desc">工人入职流程管理</text>
      </view>
      
      <!-- 对账结算 -->
      <view class="function-card" @tap="goToReconciliationManagement">
        <view class="card-icon">💵</view>
        <text class="card-title">对账结算</text>
        <text class="card-desc">处理对账请求</text>
      </view>
      
      <!-- 记工管理 -->
      <view class="function-card" @tap="goToLedgerManagement">
        <view class="card-icon">�</view>
        <text class="card-title">记工管理</text>
        <text class="card-desc">录入工人记工记录</text>
      </view>
      
      <!-- 运营增长 -->
      <view class="function-card" @tap="goToGrowthManagement">
        <view class="card-icon">🚀</view>
        <text class="card-title">运营增长</text>
        <text class="card-desc">拉新裂变和流量加权</text>
      </view>
      
      <!-- 效率工具 -->
      <view class="function-card" @tap="goToEfficiencyTools">
        <view class="card-icon">🛠️</view>
        <text class="card-title">效率工具</text>
        <text class="card-desc">招工记账和数据看板</text>
      </view>
    </view>
    
    <!-- 工厂数据概览 -->
    <view class="data-overview">
      <view class="overview-title">工厂数据概览</view>
      <view class="data-cards">
        <view class="data-card">
          <text class="data-value">{{ workerCount }}</text>
          <text class="data-label">工人数量</text>
        </view>
        <view class="data-card">
          <text class="data-value">{{ orderCount }}</text>
          <text class="data-label">订单数量</text>
        </view>
        <view class="data-card">
          <text class="data-value">{{ teamCount }}</text>
          <text class="data-label">班组数量</text>
        </view>
        <view class="data-card">
          <text class="data-value">{{ stabilityLevel }}</text>
          <text class="data-label">稳定等级</text>
        </view>
      </view>
    </view>
    
    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-title">快捷操作</view>
      <view class="action-buttons">
        <button class="action-btn" @tap="goToPublishRecruitment">发布招聘</button>
        <button class="action-btn" @tap="goToGenerateInviteCode">生成邀请码</button>
        <button class="action-btn" @tap="goToTeamConfirmation">班组确认</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 模拟数据
      workerCount: 56,
      orderCount: 23,
      teamCount: 8,
      stabilityLevel: 'A级'
    }
  },
  methods: {
    // 页面跳转方法
    goToSetWage() {
      uni.navigateTo({ url: '/pages/worker/set-wage' })
    },
    goToOrderList() {
      uni.navigateTo({ url: '/pages/order/order-list' })
    },
    goToTeamManagement() {
      uni.navigateTo({ url: '/pages/factory/team-management' })
    },
    goToInviteRecords() {
      uni.navigateTo({ url: '/pages/factory/invite-records' })
    },
    goToPublishRecruitment() {
      uni.navigateTo({ url: '/pages/social/publish-recruitment' })
    },
    goToGenerateInviteCode() {
      uni.navigateTo({ url: '/pages/factory/invite-code-generate' })
    },
    goToTeamConfirmation() {
      uni.navigateTo({ url: '/pages/factory/team-confirmation' })
    },
    goToFactoryStability() {
      uni.navigateTo({ url: '/pages/factory/team-stability-dashboard' })
    },
    goToJobManagement() {
      uni.navigateTo({ url: '/pages/factory/job-management' })
    },
    goToOnboardingProcess() {
      uni.navigateTo({ url: '/pages/factory/onboarding-process' })
    },
    goToReconciliationManagement() {
      uni.navigateTo({ url: '/pages/factory/reconciliation-management' })
    },
    goToLedgerManagement() {
      uni.navigateTo({ url: '/pages/factory/ledger-management' })
    },
    goToGrowthManagement() {
      uni.navigateTo({ url: '/pages/factory/growth-management' })
    },
    goToEfficiencyTools() {
      uni.navigateTo({ url: '/pages/factory/efficiency-tools' })
    }
  }
}
</script>

<style scoped>
.factory-home-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background-color: #4A90E2;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(74, 144, 226, 0.3);
}

.nav-bar {
  text-align: center;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

/* 核心功能区 */
.core-functions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.function-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  min-height: 200rpx;
  justify-content: center;
}

.function-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
}

.card-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
  text-align: center;
}

.card-desc {
  font-size: 18rpx;
  color: #666;
  text-align: center;
  line-height: 1.3;
}

/* 工厂数据概览 */
.data-overview {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.overview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-card {
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.data-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 8rpx;
  display: block;
}

.data-label {
  font-size: 22rpx;
  color: #666;
}

/* 快捷操作 */
.quick-actions {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.action-btn {
  background: linear-gradient(135deg, #4A90E2 0%, #5C6BC0 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>