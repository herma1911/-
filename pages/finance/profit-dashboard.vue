<template>
  <view class="profit-dashboard-container">
    <view class="header">
      <text class="title">利润看板</text>
      <view class="header-actions">
        <button class="add-expense-btn" @click="navigateToExpenseInput">添加支出</button>
        <button class="rent-expense-btn" @click="navigateToRentInput">房租费用</button>
        <button class="utility-expense-btn" @click="navigateToUtilityInput">水电费用</button>
        <button class="fixed-expense-btn" @click="navigateToFixedExpenseInput">月固定费用</button>
        <button class="equipment-expense-btn" @click="navigateToEquipmentExpenseInput">设备支出</button>
      </view>
      <view class="date-range">
        <picker mode="date" :value="startDate" start="2023-01-01" end="2026-12-31" @change="bindStartDateChange">
          <view class="date-picker">{{startDate}}</view>
        </picker>
        <text class="date-separator">至</text>
       <picker mode="date" :value="endDate" start="2023-01-01" end="2026-12-31" @change="bindEndDateChange">
          <view class="date-picker">{{endDate}}</view>
        </picker>
      </view>
    </view>
    
    <view class="summary-section">
      <view class="summary-item">
        <text class="summary-label">总收入</text>
        <text class="summary-value income">{{totalIncome}}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">总支出</text>
        <text class="summary-value expense">{{totalExpense}}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">净利润</text>
        <text class="summary-value profit">{{totalProfit}}</text>
      </view>
    </view>
    
    <view class="chart-section">
      <text class="chart-title">支出分类</text>
      <view class="category-chart">
        <view v-for="(item, index) in categoryData" :key="index" class="category-item">
          <view class="category-info">
            <text class="category-name">{{item.category}}</text>
            <text class="category-amount">{{item.amount}}</text>
          </view>
          <view class="category-bar-container">
            <view class="category-bar" :style="{width: item.percentage + '%'}"></view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="expense-list-section">
      <text class="list-title">最近支出</text>
      <view class="expense-list">
        <view v-for="(expense, index) in recentExpenses" :key="index" class="expense-item">
          <view class="expense-info">
            <text class="expense-category">{{expense.category}}</text>
            <text class="expense-date">{{expense.date}}</text>
          </view>
          <text class="expense-amount">{{expense.amount}}</text>
        </view>
      </view>
    </view>
    
    <view class="enterprise-cases-section">
      <text class="list-title">企业示范案例</text>
      <view class="enterprise-cases">
        <view v-for="(caseItem, index) in enterpriseCases" :key="index" class="enterprise-case-item">
          <view class="enterprise-case-header">
            <text class="enterprise-name">{{caseItem.name}}</text>
            <text class="enterprise-industry">{{caseItem.industry}}</text>
          </view>
          <view class="enterprise-case-stats">
            <view class="stat-item">
              <text class="stat-label">月产值</text>
              <text class="stat-value">{{caseItem.monthlyOutput}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">利润率</text>
              <text class="stat-value profit">{{caseItem.profitMargin}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">员工数</text>
              <text class="stat-value">{{caseItem.employeeCount}}</text>
            </view>
          </view>
          <view class="enterprise-case-desc">
            <text>{{caseItem.description}}</text>
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
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalIncome: '¥5,680',
      totalExpense: '¥3,240',
      totalProfit: '¥2,440',
      categoryData: [
        { category: '原材料', amount: '¥1,200', percentage: 37 },
        { category: '人工费', amount: '¥980', percentage: 30 },
        { category: '设备费用', amount: '¥560', percentage: 17 },
        { category: '运输费用', amount: '¥320', percentage: 10 },
        { category: '其他', amount: '¥180', percentage: 6 }
      ],
      recentExpenses: [
        { date: '2026-02-18', category: '原材料', amount: '¥350' },
        { date: '2026-02-17', category: '人工费', amount: '¥280' },
        { date: '2026-02-16', category: '运输费用', amount: '¥120' },
        { date: '2026-02-15', category: '设备费用', amount: '¥180' },
        { date: '2026-02-14', category: '其他', amount: '¥90' }
      ],
      enterpriseCases: [
        {
          name: '深圳赫尔玛智能科技有限公司',
          industry: '智能设备制造',
          monthlyOutput: '¥500万',
          profitMargin: '25%',
          employeeCount: '120人',
          description: '通过智能化生产管理系统，实现了生产效率提升30%，成本降低20%，利润率从15%提升至25%。'
        },
        {
          name: '广州衣起赚服装有限公司',
          industry: '服装制造',
          monthlyOutput: '¥300万',
          profitMargin: '18%',
          employeeCount: '80人',
          description: '采用精益生产模式，优化供应链管理，实现了库存周转率提升40%，交货周期缩短30%。'
        },
        {
          name: '上海智能制造装备有限公司',
          industry: '高端装备制造',
          monthlyOutput: '¥800万',
          profitMargin: '30%',
          employeeCount: '150人',
          description: '专注于研发创新，拥有多项核心技术专利，产品附加值高，市场竞争力强。'
        }
      ]
    }
  },
  methods: {
    bindStartDateChange(e) {
      this.startDate = e.detail.value
      this.updateDashboard()
    },
    bindEndDateChange(e) {
      this.endDate = e.detail.value
      this.updateDashboard()
    },
    updateDashboard() {
      // 这里可以根据日期范围更新数据
      // 暂时使用模拟数据
      uni.showToast({
        title: '数据已更新',
        icon: 'success'
      })
    },
    navigateToExpenseInput() {
      uni.navigateTo({
        url: './expense-input'
      })
    },
    navigateToRentInput() {
      uni.navigateTo({
        url: './rent-input'
      })
    },
    navigateToUtilityInput() {
      uni.navigateTo({
        url: './utility-input'
      })
    },
    navigateToFixedExpenseInput() {
      uni.navigateTo({
        url: './fixed-expense-input'
      })
    },
    navigateToEquipmentExpenseInput() {
      uni.navigateTo({
        url: './equipment-expense'
      })
    }
  }
}
</script>

<style scoped>
.profit-dashboard-container {
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
  margin-bottom: 20rpx;
  display: block;
}

.header-actions {
  margin-bottom: 20rpx;
  text-align: right;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10rpx;
}

.add-expense-btn {
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.rent-expense-btn {
  background-color: #52c41a;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.utility-expense-btn {
  background-color: #1890ff;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.fixed-expense-btn {
  background-color: #faad14;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.equipment-expense-btn {
  background-color: #722ed1;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.date-picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  flex: 1;
}

.date-separator {
  font-size: 24rpx;
  color: #666;
}

.summary-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.summary-item {
  margin-bottom: 20rpx;
}

.summary-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
  display: block;
}

.summary-value {
  font-size: 36rpx;
  font-weight: bold;
}

.summary-value.income {
  color: #52c41a;
}

.summary-value.expense {
  color: #ff4d4f;
}

.summary-value.profit {
  color: #1890ff;
}

.chart-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.category-chart {
  gap: 15rpx;
}

.category-item {
  margin-bottom: 15rpx;
}

.category-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
}

.category-amount {
  font-size: 24rpx;
  color: #666;
}

.category-bar-container {
  width: 100%;
  height: 15rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  background-color: #4A90E2;
  border-radius: 10rpx;
}

.expense-list-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.list-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.expense-list {
  gap: 15rpx;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.expense-info {
  flex: 1;
}

.expense-category {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.expense-date {
  font-size: 20rpx;
  color: #999;
}

.expense-amount {
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: bold;
}

/* 企业示范案例 */
.enterprise-cases-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.enterprise-cases {
  gap: 20rpx;
}

.enterprise-case-item {
  padding: 20rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  background-color: #f9f9f9;
}

.enterprise-case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.enterprise-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.enterprise-industry {
  font-size: 20rpx;
  color: #666;
  background-color: #e6f7ff;
  padding: 5rpx 10rpx;
  border-radius: 10rpx;
}

.enterprise-case-stats {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.stat-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.stat-value.profit {
  color: #1890ff;
}

.enterprise-case-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}
</style>