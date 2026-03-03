<template>
  <view class="income-analysis-container">
    <view class="header">
      <text class="title">收入分析</text>
      <view class="date-selector">
        <picker mode="date" fields="month" @change="onDateChange" :value="selectedDate">
          <view class="picker-view">
            <text class="picker-text">{{selectedDateText}}</text>
            <text class="picker-icon">▼</text>
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 收入概览 -->
    <view class="overview-section">
      <view class="overview-item">
        <text class="overview-label">本月收入</text>
        <text class="overview-value">{{monthlyIncome.toFixed(2)}}元</text>
      </view>
      <view class="overview-item">
        <text class="overview-label">上月收入</text>
        <text class="overview-value">{{lastMonthIncome.toFixed(2)}}元</text>
      </view>
      <view class="overview-item">
        <text class="overview-label">同比变化</text>
        <text :class="['overview-value', incomeChange >= 0 ? 'positive' : 'negative']">
          {{incomeChange >= 0 ? '+' : ''}}{{incomeChange.toFixed(2)}}%
        </text>
      </view>
    </view>
    
    <!-- 收入明细概览 -->
    <view class="income-detail-section">
      <text class="section-title">收入明细</text>
      <view class="income-detail-grid">
        <view class="income-detail-item">
          <text class="income-detail-label">工厂记账</text>
          <text class="income-detail-value">{{factoryIncome.toFixed(2)}}元</text>
          <text class="income-detail-note">参考</text>
        </view>
        <view class="income-detail-item">
          <text class="income-detail-label">实发工资</text>
          <text class="income-detail-value">{{actualIncome.toFixed(2)}}元</text>
          <text class="income-detail-note">真实</text>
        </view>
        <view class="income-detail-item">
          <text class="income-detail-label">额外收入</text>
          <text class="income-detail-value">{{extraIncome.toFixed(2)}}元</text>
          <text class="income-detail-note">个人</text>
        </view>
      </view>
    </view>
    
    <!-- 收入趋势图表 -->
    <view class="chart-section">
      <text class="section-title">收入趋势</text>
      <view class="chart-container">
        <view class="trend-chart">
          <view v-for="(data, index) in trendData" :key="index" class="chart-bar-container">
            <view class="chart-bar" :style="{ height: (data.amount / maxAmount * 100) + '%' }"></view>
            <text class="chart-label">{{data.label}}</text>
            <text class="chart-value">{{data.amount.toFixed(0)}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 收入来源分析 -->
    <view class="source-section">
      <text class="section-title">收入来源分析</text>
      <view class="source-grid">
        <view class="source-item" v-for="(item, index) in sourceData" :key="index">
          <text class="source-name">{{item.name}}</text>
          <text class="source-amount">{{item.amount.toFixed(2)}}元</text>
          <text class="source-percentage">{{item.percentage.toFixed(1)}}%</text>
        </view>
      </view>
    </view>
    
    <!-- 详细统计 -->
    <view class="stats-section">
      <text class="section-title">详细统计</text>
      <view class="stats-grid">
        <view class="stats-item">
          <text class="stats-label">总记录数</text>
          <text class="stats-value">{{totalRecords}}条</text>
        </view>
        <view class="stats-item">
          <text class="stats-label">平均日收入</text>
          <text class="stats-value">{{averageDailyIncome.toFixed(2)}}元</text>
        </view>
        <view class="stats-item">
          <text class="stats-label">最高日收入</text>
          <text class="stats-value">{{maxDailyIncome.toFixed(2)}}元</text>
        </view>
        <view class="stats-item">
          <text class="stats-label">已确认收入</text>
          <text class="stats-value">{{confirmedIncome.toFixed(2)}}元</text>
        </view>
      </view>
    </view>
    
    <!-- 收入类型分布 -->
    <view class="type-section">
      <text class="section-title">收入类型分布</text>
      <view class="type-chart">
        <view class="type-item">
          <text class="type-name">计件收入</text>
          <view class="type-bar-container">
            <view class="type-bar piece-rate" :style="{ width: pieceRatePercentage + '%' }"></view>
          </view>
          <text class="type-value">{{pieceRateIncome.toFixed(2)}}元</text>
        </view>
        <view class="type-item">
          <text class="type-name">计时收入</text>
          <view class="type-bar-container">
            <view class="type-bar time-rate" :style="{ width: timeRatePercentage + '%' }"></view>
          </view>
          <text class="type-value">{{timeRateIncome.toFixed(2)}}元</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedDate: new Date().toISOString().substring(0, 7), // YYYY-MM format
      selectedDateText: '',
      ledgerRecords: [],
      actualIncomeRecords: [],
      extraIncomeRecords: [],
      trendData: [],
      sourceData: [],
      maxAmount: 0
    }
  },
  computed: {
    // 本月收入（个人总收入 = 老板实发工资 + 个人额外收入）
    monthlyIncome() {
      const actualIncome = this.getMonthlyActualIncome(this.selectedDate)
      const extraIncome = this.getMonthlyExtraIncome(this.selectedDate)
      return actualIncome + extraIncome
    },
    
    // 工厂记账收入
    factoryIncome() {
      const records = this.getMonthlyFactoryRecords(this.selectedDate)
      return records.reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    
    // 实发工资收入
    actualIncome() {
      return this.getMonthlyActualIncome(this.selectedDate)
    },
    
    // 额外收入
    extraIncome() {
      return this.getMonthlyExtraIncome(this.selectedDate)
    },
    
    // 上月收入
    lastMonthIncome() {
      const lastMonth = this.getLastMonth(this.selectedDate)
      const actualIncome = this.getMonthlyActualIncome(lastMonth)
      const extraIncome = this.getMonthlyExtraIncome(lastMonth)
      return actualIncome + extraIncome
    },
    
    // 收入变化百分比
    incomeChange() {
      if (this.lastMonthIncome === 0) return 0
      return ((this.monthlyIncome - this.lastMonthIncome) / this.lastMonthIncome) * 100
    },
    
    // 总记录数
    totalRecords() {
      return this.getMonthlyRecords(this.selectedDate).length
    },
    
    // 平均日收入
    averageDailyIncome() {
      const records = this.getMonthlyRecords(this.selectedDate)
      if (records.length === 0) return 0
      const days = new Set(records.map(record => record.date.substring(0, 10))).size
      return this.monthlyIncome / days
    },
    
    // 最高日收入
    maxDailyIncome() {
      const records = this.getMonthlyRecords(this.selectedDate)
      const dailyIncome = {}
      
      records.forEach(record => {
        const date = record.date.substring(0, 10)
        if (!dailyIncome[date]) dailyIncome[date] = 0
        dailyIncome[date] += parseFloat(record.amount)
      })
      
      const amounts = Object.values(dailyIncome)
      return amounts.length > 0 ? Math.max(...amounts) : 0
    },
    
    // 已确认收入
    confirmedIncome() {
      const records = this.getMonthlyRecords(this.selectedDate).filter(record => record.status === 'confirmed')
      return records.reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    
    // 计件收入
    pieceRateIncome() {
      const records = this.getMonthlyRecords(this.selectedDate).filter(record => record.type === 'piece')
      return records.reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    
    // 计时收入
    timeRateIncome() {
      const records = this.getMonthlyRecords(this.selectedDate).filter(record => record.type === 'time')
      return records.reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    
    // 计件收入占比
    pieceRatePercentage() {
      if (this.monthlyIncome === 0) return 0
      return (this.pieceRateIncome / this.monthlyIncome) * 100
    },
    
    // 计时收入占比
    timeRatePercentage() {
      if (this.monthlyIncome === 0) return 0
      return (this.timeRateIncome / this.monthlyIncome) * 100
    }
  },
  onLoad() {
    this.loadLedgerRecords()
    this.updateSelectedDateText()
    this.generateTrendData()
    this.generateSourceData()
  },
  methods: {
    loadLedgerRecords() {
      this.ledgerRecords = uni.getStorageSync('ledgerRecords') || []
      this.actualIncomeRecords = uni.getStorageSync('actualIncomeRecords') || []
      this.extraIncomeRecords = uni.getStorageSync('extraIncomeRecords') || []
    },
    
    getMonthlyFactoryRecords(month) {
      return this.ledgerRecords.filter(record => {
        return record.date.substring(0, 7) === month
      })
    },
    
    getMonthlyActualIncome(month) {
      return this.actualIncomeRecords
        .filter(record => record.date.substring(0, 7) === month)
        .reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    
    getMonthlyExtraIncome(month) {
      return this.extraIncomeRecords
        .filter(record => record.date.substring(0, 7) === month)
        .reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    
    updateSelectedDateText() {
      const [year, month] = this.selectedDate.split('-')
      this.selectedDateText = `${year}年${parseInt(month)}月`
    },
    
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.updateSelectedDateText()
      this.generateTrendData()
      this.generateSourceData()
    },
    
    getMonthlyRecords(month) {
      return this.ledgerRecords.filter(record => {
        return record.date.substring(0, 7) === month
      })
    },
    
    getLastMonth(currentMonth) {
      const [year, month] = currentMonth.split('-').map(Number)
      let lastYear = year
      let lastMonth = month - 1
      
      if (lastMonth === 0) {
        lastYear--
        lastMonth = 12
      }
      
      return `${lastYear}-${String(lastMonth).padStart(2, '0')}`
    },
    
    generateTrendData() {
      const records = this.getMonthlyRecords(this.selectedDate)
      const dailyIncome = {}
      
      // 按日统计收入
      records.forEach(record => {
        const date = record.date.substring(8, 10)
        if (!dailyIncome[date]) dailyIncome[date] = 0
        dailyIncome[date] += parseFloat(record.amount)
      })
      
      // 生成趋势数据
      this.trendData = Object.keys(dailyIncome)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(day => ({
          label: day + '日',
          amount: dailyIncome[day]
        }))
      
      // 计算最大值用于图表缩放
      this.maxAmount = Math.max(...this.trendData.map(item => item.amount), 100)
    },
    
    generateSourceData() {
      const records = this.getMonthlyRecords(this.selectedDate)
      const sourceMap = new Map()
      
      // 按工序统计收入
      records.forEach(record => {
        if (record.processName) {
          const source = record.processName
          if (!sourceMap.has(source)) {
            sourceMap.set(source, 0)
          }
          sourceMap.set(source, sourceMap.get(source) + parseFloat(record.amount))
        } else {
          // 计时收入
          const source = '计时'
          if (!sourceMap.has(source)) {
            sourceMap.set(source, 0)
          }
          sourceMap.set(source, sourceMap.get(source) + parseFloat(record.amount))
        }
      })
      
      // 生成来源数据
      this.sourceData = Array.from(sourceMap.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / this.monthlyIncome) * 100
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6) // 只显示前6个主要来源
    }
  }
}
</script>

<style scoped>
.income-analysis-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.date-selector {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.picker-view {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.picker-text {
  font-size: 24rpx;
  color: #333;
}

.picker-icon {
  font-size: 20rpx;
  color: #666;
}

/* 概览部分 */
.overview-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.overview-item {
  flex: 1;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.overview-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.overview-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.overview-value.positive {
  color: #52c41a;
}

.overview-value.negative {
  color: #ff4d4f;
}

/* 收入明细概览 */
.income-detail-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.income-detail-grid {
  display: flex;
  gap: 20rpx;
}

.income-detail-item {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
  text-align: center;
}

.income-detail-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.income-detail-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.income-detail-note {
  font-size: 18rpx;
  color: #999;
  display: block;
}

/* 图表部分 */
.chart-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.chart-container {
  height: 300rpx;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  height: 100%;
  gap: 15rpx;
  padding-bottom: 40rpx;
  position: relative;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  background-color: #4A90E2;
  border-radius: 4rpx 4rpx 0 0;
  transition: height 0.3s ease;
}

.chart-label {
  font-size: 18rpx;
  color: #666;
  margin-top: 10rpx;
}

.chart-value {
  font-size: 16rpx;
  color: #333;
  font-weight: bold;
  margin-top: 5rpx;
}

/* 来源分析 */
.source-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.source-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
}

.source-name {
  font-size: 22rpx;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.source-amount {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.source-percentage {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 详细统计 */
.stats-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.stats-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
  text-align: center;
}

.stats-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 5rpx;
  display: block;
}

.stats-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

/* 收入类型分布 */
.type-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.type-chart {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.type-name {
  font-size: 22rpx;
  color: #333;
  width: 120rpx;
}

.type-bar-container {
  flex: 1;
  height: 20rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.type-bar {
  height: 100%;
  border-radius: 10rpx;
  transition: width 0.3s ease;
}

.type-bar.piece-rate {
  background-color: #4A90E2;
}

.type-bar.time-rate {
  background-color: #52c41a;
}

.type-value {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
  width: 120rpx;
  text-align: right;
}
</style>
