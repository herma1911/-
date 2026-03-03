<template>
  <view class="wage-history-container">
    <view class="header">
      <text class="title">工资历史</text>
    </view>
    
    <view class="search-section">
      <input type="text" v-model="searchKeyword" placeholder="搜索月份" class="search-input" />
      <button type="default" class="search-button" @click="search">搜索</button>
    </view>
    
    <view class="wage-list">
      <view v-for="(wage, index) in wageList" :key="index" class="wage-item">
        <view class="wage-header">
          <text class="wage-month">{{wage.month}}</text>
          <text class="wage-total">{{wage.total}}</text>
        </view>
        <view class="wage-details">
          <view class="detail-item">
            <text class="detail-label">基本工资：</text>
            <text class="detail-value">{{wage.baseSalary}}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">计件工资：</text>
            <text class="detail-value">{{wage.pieceRateSalary}}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">加班费：</text>
            <text class="detail-value">{{wage.overtimeSalary}}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">其他补贴：</text>
            <text class="detail-value">{{wage.subsidy}}</text>
          </view>
        </view>
        <view class="wage-footer">
          <text class="payment-status" :class="wage.status === '已发放' ? 'status-paid' : 'status-unpaid'">{{wage.status}}</text>
          <text class="payment-date">{{wage.paymentDate}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      wageList: [
        {
          month: '2026年02月',
          total: '¥6,800',
          baseSalary: '¥3,000',
          pieceRateSalary: '¥3,200',
          overtimeSalary: '¥400',
          subsidy: '¥200',
          status: '已发放',
          paymentDate: '2026-03-05'
        },
        {
          month: '2026年01月',
          total: '¥7,200',
          baseSalary: '¥3,000',
          pieceRateSalary: '¥3,600',
          overtimeSalary: '¥400',
          subsidy: '¥200',
          status: '已发放',
          paymentDate: '2026-02-05'
        },
        {
          month: '2025年12月',
          total: '¥6,500',
          baseSalary: '¥3,000',
          pieceRateSalary: '¥2,900',
          overtimeSalary: '¥400',
          subsidy: '¥200',
          status: '已发放',
          paymentDate: '2026-01-05'
        }
      ]
    }
  },
  methods: {
    search() {
      // 这里可以根据关键词搜索工资记录
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.wage-history-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

.search-section {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.search-button {
  padding: 0 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.wage-list {
  gap: 15rpx;
}

.wage-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.wage-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.wage-month {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.wage-total {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
}

.wage-details {
  margin-bottom: 15rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
}

.detail-value {
  font-size: 24rpx;
  color: #333;
}

.wage-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15rpx;
  border-top: 1rpx solid #f0f0f0;
}

.payment-status {
  font-size: 24rpx;
  font-weight: bold;
}

.status-paid {
  color: #52c41a;
}

.status-unpaid {
  color: #ff4d4f;
}

.payment-date {
  font-size: 20rpx;
  color: #999;
}
</style>