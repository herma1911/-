<template>
  <view class="personal-ledger-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <text class="back-btn" @tap="goBack">←</text>
      <text class="page-title">个人账本</text>
      <text class="sync-btn" @tap="syncToWechatLedger">同步到微信确认</text>
    </view>

    <!-- 账本概览 -->
    <view class="ledger-overview">
      <view class="overview-card">
        <text class="overview-label">本月累计收入</text>
        <text class="overview-value">¥{{ monthlyIncome }}</text>
      </view>
      <view class="overview-card">
        <text class="overview-label">本月累计支出</text>
        <text class="overview-value expense">¥{{ monthlyExpense }}</text>
      </view>
      <view class="overview-card">
        <text class="overview-label">本月预计纯收入</text>
        <text class="overview-value net-income">¥{{ monthlyNetIncome }}</text>
      </view>
    </view>

    <!-- 记工记录列表 -->
    <view class="record-list-section">
      <view class="section-header">
        <text class="section-title">记工记录</text>
        <text class="add-record-btn" @tap="addRecord">+ 记工</text>
      </view>

      <view class="record-list">
        <view 
          v-for="record in workRecords" 
          :key="record.id"
          class="record-item"
          @tap="viewRecordDetail(record)"
        >
          <view class="record-info">
            <text class="record-date">{{ record.date }}</text>
            <text class="record-type">{{ record.type === 'piece' ? '计件' : '计时' }}</text>
          </view>
          <view class="record-amount">
            <text class="amount">¥{{ record.amount }}</text>
            <text class="record-desc">{{ record.description }}</text>
          </view>
        </view>

        <view v-if="workRecords.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无记工记录</text>
          <text class="empty-hint">点击右上角开始记工</text>
        </view>
      </view>
    </view>

    <!-- 支出记录列表 -->
    <view class="expense-list-section">
      <view class="section-header">
        <text class="section-title">支出记录</text>
        <text class="add-expense-btn" @tap="addExpense">+ 支出</text>
      </view>

      <view class="expense-list">
        <view 
          v-for="expense in expenseRecords" 
          :key="expense.id"
          class="expense-item"
          @tap="viewExpenseDetail(expense)"
        >
          <view class="expense-info">
            <text class="expense-date">{{ expense.date }}</text>
            <text class="expense-category">{{ expense.category }}</text>
          </view>
          <view class="expense-amount">
            <text class="amount expense">¥{{ expense.amount }}</text>
            <text class="expense-desc">{{ expense.description }}</text>
          </view>
        </view>

        <view v-if="expenseRecords.length === 0" class="empty-state">
          <text class="empty-icon">💰</text>
          <text class="empty-text">暂无支出记录</text>
          <text class="empty-hint">点击右上角记录支出</text>
        </view>
      </view>
    </view>

    <!-- 新手引导弹窗 -->
    <view v-if="showGuide" class="guide-modal">
      <view class="guide-content">
        <text class="guide-title">个人账本使用指南</text>
        <text class="guide-text">1. 个人账本是您的私人记工册，可随时记录工作和支出</text>
        <text class="guide-text">2. 点击「同步到微信确认」可将记录同步到微信账本</text>
        <text class="guide-text">3. 微信账本用于与工厂对账和结算</text>
        <text class="guide-text">4. 建议每天及时记录，确保数据准确</text>
        <text class="guide-btn" @tap="closeGuide">我知道了</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      monthlyIncome: 10800,
      monthlyExpense: 2300,
      monthlyNetIncome: 8500,
      workRecords: [
        { id: 1, date: '2024-08-15', type: 'piece', amount: 850, description: '车工-牛仔裤' },
        { id: 2, date: '2024-08-14', type: 'piece', amount: 780, description: '车工-T恤' },
        { id: 3, date: '2024-08-13', type: 'time', amount: 320, description: '加班4小时' },
        { id: 4, date: '2024-08-12', type: 'piece', amount: 920, description: '车工-外套' }
      ],
      expenseRecords: [
        { id: 1, date: '2024-08-15', category: '生活费', amount: 150, description: '日常开销' },
        { id: 2, date: '2024-08-10', category: '预支', amount: 1000, description: '预支工资' },
        { id: 3, date: '2024-08-05', category: '生活费', amount: 800, description: ' groceries' }
      ],
      showGuide: true
    }
  },
  onLoad() {
    // 检查是否首次进入，显示新手引导
    const hasSeenGuide = uni.getStorageSync('hasSeenPersonalLedgerGuide')
    if (!hasSeenGuide) {
      this.showGuide = true
    }
  },
  computed: {
    monthlyNetIncome() {
      return this.monthlyIncome - this.monthlyExpense
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    addRecord() {
      uni.navigateTo({ url: './piece-rate' })
    },
    addExpense() {
      uni.navigateTo({ url: '../finance/expense-input' })
    },
    viewRecordDetail(record) {
      uni.showModal({
        title: '记工详情',
        content: `日期: ${record.date}\n类型: ${record.type === 'piece' ? '计件' : '计时'}\n金额: ¥${record.amount}\n描述: ${record.description}`,
        showCancel: false
      })
    },
    viewExpenseDetail(expense) {
      uni.showModal({
        title: '支出详情',
        content: `日期: ${expense.date}\n分类: ${expense.category}\n金额: ¥${expense.amount}\n描述: ${expense.description}`,
        showCancel: false
      })
    },
    syncToWechatLedger() {
      uni.showModal({
        title: '同步到微信确认账本',
        content: '确定要将本月所有记工和支出记录同步到微信确认账本吗？',
        success: (res) => {
          if (res.confirm) {
            // 模拟同步操作
            setTimeout(() => {
              uni.showToast({
                title: '同步成功',
                icon: 'success'
              })
            }, 1000)
          }
        }
      })
    },
    closeGuide() {
      this.showGuide = false
      uni.setStorageSync('hasSeenPersonalLedgerGuide', true)
    }
  }
}
</script>

<style scoped>
.personal-ledger-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 20rpx;
}

/* 顶部导航栏 */
.nav-header {
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

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.sync-btn {
  font-size: 26rpx;
  color: #1677ff;
  font-weight: 600;
}

/* 账本概览 */
.ledger-overview {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.overview-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.overview-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.overview-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.overview-value.expense {
  color: #ff4d4f;
}

.overview-value.net-income {
  color: #52c41a;
}

/* 记录列表 */
.record-list-section,
.expense-list-section {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.add-record-btn,
.add-expense-btn {
  font-size: 24rpx;
  color: #1677ff;
  font-weight: 600;
}

.record-item,
.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child,
.expense-item:last-child {
  border-bottom: none;
}

.record-info,
.expense-info {
  flex: 1;
}

.record-date,
.expense-date {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.record-type,
.expense-category {
  font-size: 20rpx;
  color: #999;
}

.record-amount,
.expense-amount {
  text-align: right;
}

.amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}

.amount.expense {
  color: #ff4d4f;
}

.record-desc,
.expense-desc {
  font-size: 20rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.empty-hint {
  font-size: 22rpx;
  color: #999;
}

/* 新手引导弹窗 */
.guide-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.guide-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 80%;
  max-width: 500rpx;
}

.guide-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
}

.guide-text {
  font-size: 24rpx;
  color: #666;
  line-height: 36rpx;
  margin-bottom: 15rpx;
  display: block;
}

.guide-btn {
  display: block;
  background: #1677ff;
  color: #fff;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  margin-top: 30rpx;
}
</style>