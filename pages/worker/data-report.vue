<template>
  <view class="data-report-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <text class="nav-title">数据报表</text>
      <text class="nav-back" @tap="goBack">←</text>
    </view>
    
    <!-- 报表统计概览 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-label">本月总收入</text>
        <text class="stat-value">¥{{ monthlyIncome }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">本月总支出</text>
        <text class="stat-value expense">¥{{ monthlyExpense }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">本月结余</text>
        <text class="stat-value balance">¥{{ monthlyBalance }}</text>
      </view>
    </view>
    
    <!-- 图表区域 -->
    <view class="charts-section">
      <!-- 贷款剩余本金环形图 -->
      <view class="chart-card">
        <text class="chart-title">贷款剩余本金</text>
        <view class="chart-container">
          <view class="donut-chart" :style="donutChartStyle">
            <view class="donut-center">
              <text class="donut-label">总剩余</text>
              <text class="donut-value">¥{{ totalRemainingLoan }}</text>
            </view>
            <view 
              v-for="(loan, index) in loanData" 
              :key="loan.id"
              class="donut-segment"
              :style="getDonutSegmentStyle(loan, index)"
            ></view>
          </view>
          <view class="chart-legend">
            <view 
              v-for="(loan, index) in loanData" 
              :key="loan.id"
              class="legend-item"
            >
              <view class="legend-color" :style="{ backgroundColor: loanColors[index % loanColors.length] }"></view>
              <text class="legend-text">{{ loan.name }}</text>
              <text class="legend-value">¥{{ loan.remaining }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 收支趋势折线图 -->
      <view class="chart-card">
        <text class="chart-title">收支趋势</text>
        <view class="chart-container">
          <view class="line-chart">
            <view class="chart-grid">
              <view class="grid-line" v-for="i in 5" :key="i"></view>
            </view>
            <view class="chart-data">
              <view class="data-line income-line">
                <view 
                  v-for="(point, index) in monthlyData" 
                  :key="index"
                  class="data-point income-point"
                  :style="getLinePointStyle(point.income, index)"
                ></view>
                <view class="line-path income-path" :style="incomeLinePath"></view>
              </view>
              <view class="data-line expense-line">
                <view 
                  v-for="(point, index) in monthlyData" 
                  :key="index"
                  class="data-point expense-point"
                  :style="getLinePointStyle(point.expense, index)"
                ></view>
                <view class="line-path expense-path" :style="expenseLinePath"></view>
              </view>
              <view v-if="showBudget" class="data-line budget-line">
                <view 
                  v-for="(point, index) in monthlyData" 
                  :key="index"
                  class="data-point budget-point"
                  :style="getLinePointStyle(point.budget, index)"
                ></view>
                <view class="line-path budget-path" :style="budgetLinePath"></view>
              </view>
            </view>
            <view class="chart-labels">
              <text 
                v-for="(point, index) in monthlyData" 
                :key="index"
                class="label-text"
              >{{ point.month }}</text>
            </view>
          </view>
          <view class="chart-legend">
            <view class="legend-item">
              <view class="legend-color income-color"></view>
              <text class="legend-text">收入</text>
            </view>
            <view class="legend-item">
              <view class="legend-color expense-color"></view>
              <text class="legend-text">支出</text>
            </view>
            <view class="legend-item" @tap="toggleBudget">
              <view class="legend-color budget-color"></view>
              <text class="legend-text">{{ showBudget ? '隐藏预算' : '显示预算' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 固定与灵活支出柱状图 -->
      <view class="chart-card">
        <text class="chart-title">固定与灵活支出</text>
        <view class="chart-container">
          <view class="bar-chart">
            <view class="chart-grid">
              <view class="grid-line" v-for="i in 5" :key="i"></view>
            </view>
            <view class="chart-data">
              <view 
                v-for="(point, index) in monthlyData" 
                :key="index"
                class="bar-group"
                :style="{ left: (index / (monthlyData.length - 1)) * 100 + '%' }"
              >
                <view class="bar fixed-bar" :style="{ height: (point.fixedExpense / maxExpense) * 100 + '%' }"></view>
                <view class="bar flexible-bar" :style="{ height: (point.flexibleExpense / maxExpense) * 100 + '%' }"></view>
              </view>
            </view>
            <view class="chart-labels">
              <text 
                v-for="(point, index) in monthlyData" 
                :key="index"
                class="label-text"
              >{{ point.month }}</text>
            </view>
          </view>
          <view class="chart-legend">
            <view class="legend-item">
              <view class="legend-color fixed-color"></view>
              <text class="legend-text">固定支出</text>
            </view>
            <view class="legend-item">
              <view class="legend-color flexible-color"></view>
              <text class="legend-text">灵活支出</text>
            </view>
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
      showBudget: true,
      loanColors: ['#FFB6C1', '#87CEFA', '#98FB98', '#FFDAB9', '#D8BFD8'],
      monthlyData: [
        { month: '1月', income: 8500, expense: 3200, budget: 3500, fixedExpense: 2000, flexibleExpense: 1200 },
        { month: '2月', income: 9200, expense: 3800, budget: 3500, fixedExpense: 2000, flexibleExpense: 1800 },
        { month: '3月', income: 8800, expense: 3100, budget: 3500, fixedExpense: 2000, flexibleExpense: 1100 },
        { month: '4月', income: 9500, expense: 3600, budget: 3500, fixedExpense: 2000, flexibleExpense: 1600 },
        { month: '5月', income: 9000, expense: 3300, budget: 3500, fixedExpense: 2000, flexibleExpense: 1300 },
        { month: '6月', income: 9800, expense: 3900, budget: 3500, fixedExpense: 2000, flexibleExpense: 1900 }
      ],
      loanData: [
        { id: 1, name: '房贷', remaining: 500000, total: 800000 },
        { id: 2, name: '车贷', remaining: 30000, total: 100000 }
      ]
    }
  },
  computed: {
    monthlyIncome() {
      return this.monthlyData[this.monthlyData.length - 1].income
    },
    monthlyExpense() {
      return this.monthlyData[this.monthlyData.length - 1].expense
    },
    monthlyBalance() {
      return this.monthlyIncome - this.monthlyExpense
    },
    totalRemainingLoan() {
      return this.loanData.reduce((total, loan) => total + loan.remaining, 0)
    },
    maxExpense() {
      return Math.max(...this.monthlyData.map(item => item.expense)) * 1.2
    },
    donutChartStyle() {
      const total = this.totalRemainingLoan
      const circumference = 2 * Math.PI * 50
      let offset = 0
      const segments = this.loanData.map(loan => {
        const percentage = loan.remaining / total
        const length = circumference * percentage
        const segmentStyle = {
          strokeDasharray: `${length} ${circumference - length}`,
          strokeDashoffset: -offset
        }
        offset += length
        return segmentStyle
      })
      return {}
    },
    incomeLinePath() {
      const points = this.monthlyData.map((point, index) => {
        const x = (index / (this.monthlyData.length - 1)) * 100
        const y = 100 - (point.income / 12000) * 100
        return `${x}% ${y}%`
      })
      return {
        d: `M ${points.join(' L ')}`
      }
    },
    expenseLinePath() {
      const points = this.monthlyData.map((point, index) => {
        const x = (index / (this.monthlyData.length - 1)) * 100
        const y = 100 - (point.expense / 5000) * 100
        return `${x}% ${y}%`
      })
      return {
        d: `M ${points.join(' L ')}`
      }
    },
    budgetLinePath() {
      const points = this.monthlyData.map((point, index) => {
        const x = (index / (this.monthlyData.length - 1)) * 100
        const y = 100 - (point.budget / 5000) * 100
        return `${x}% ${y}%`
      })
      return {
        d: `M ${points.join(' L ')}`
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    toggleBudget() {
      this.showBudget = !this.showBudget
    },
    getDonutSegmentStyle(loan, index) {
      const total = this.totalRemainingLoan
      const percentage = loan.remaining / total
      const circumference = 2 * Math.PI * 50
      const length = circumference * percentage
      
      // Calculate offset
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += (this.loanData[i].remaining / total) * circumference
      }
      
      return {
        stroke: this.loanColors[index % this.loanColors.length],
        strokeDasharray: `${length} ${circumference - length}`,
        strokeDashoffset: -offset
      }
    },
    getLinePointStyle(value, index) {
      const maxValue = Math.max(...this.monthlyData.map(item => item.income)) * 1.2
      const y = 100 - (value / maxValue) * 100
      const x = (index / (this.monthlyData.length - 1)) * 100
      return {
        left: `${x}%`,
        bottom: `${y}%`
      }
    }
  }
}
</script>

<style scoped>
.data-report-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 30rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-back {
  font-size: 36rpx;
  color: #666;
}

.stats-overview {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.stat-value.expense {
  color: #ff4d4f;
}

.stat-value.balance {
  color: #52c41a;
}

.charts-section {
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.chart-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 环形图样式 */
.donut-chart {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-label {
  font-size: 20rpx;
  color: #666;
  display: block;
}

.donut-value {
  font-size: 24rpx;
  font-weight: 700;
  color: #333;
  display: block;
}

.donut-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 20rpx solid transparent;
  border-top-color: #FFB6C1;
  transform: rotate(0deg);
  box-sizing: border-box;
}

/* 折线图样式 */
.line-chart {
  position: relative;
  height: 300rpx;
  width: 100%;
}

.chart-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  width: 100%;
  height: 1rpx;
  background: #f0f0f0;
}

.chart-data {
  position: absolute;
  width: 100%;
  height: 100%;
}

.data-line {
  position: relative;
  width: 100%;
  height: 100%;
}

.data-point {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.income-point {
  background: #52c41a;
}

.expense-point {
  background: #ff4d4f;
}

.budget-point {
  background: #1677ff;
}

.line-path {
  position: absolute;
  width: 100%;
  height: 100%;
  stroke-width: 4rpx;
  fill: none;
}

.income-path {
  stroke: #52c41a;
}

.expense-path {
  stroke: #ff4d4f;
}

.budget-path {
  stroke: #1677ff;
  stroke-dasharray: 8rpx 4rpx;
}

.chart-labels {
  position: absolute;
  bottom: -30rpx;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.label-text {
  font-size: 20rpx;
  color: #999;
}

/* 柱状图样式 */
.bar-chart {
  position: relative;
  height: 300rpx;
  width: 100%;
}

.bar-group {
  position: absolute;
  bottom: 0;
  width: 30rpx;
  height: 100%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.bar {
  width: 12rpx;
  border-radius: 6rpx 6rpx 0 0;
}

.fixed-bar {
  background: #1677ff;
}

.flexible-bar {
  background: #ff7a45;
}

/* 图例样式 */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-color {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
}

.income-color {
  background: #52c41a;
}

.expense-color {
  background: #ff4d4f;
}

.budget-color {
  background: #1677ff;
}

.fixed-color {
  background: #1677ff;
}

.flexible-color {
  background: #ff7a45;
}

.legend-text {
  font-size: 20rpx;
  color: #666;
}

.legend-value {
  font-size: 20rpx;
  color: #999;
  margin-left: 5rpx;
}
</style>