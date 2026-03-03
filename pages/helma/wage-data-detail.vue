<template>
  <view class="wage-data-detail-container">
    <view class="detail-header">
      <text class="detail-title">{{itemData.styleNumber}} - {{itemData.process}}</text>
      <text class="detail-subtitle">{{itemData.region}} | {{itemData.period}}</text>
    </view>

    <view class="summary-section">
      <view class="summary-card">
        <text class="summary-label">最低价</text>
        <text class="summary-value">{{itemData.minPrice}}元/件</text>
      </view>
      <view class="summary-card">
        <text class="summary-label">最高价</text>
        <text class="summary-value">{{itemData.maxPrice}}元/件</text>
      </view>
      <view class="summary-card">
        <text class="summary-label">平均价</text>
        <text class="summary-value">{{itemData.avgPrice}}元/件</text>
      </view>
      <view class="summary-card">
        <text class="summary-label">样本量</text>
        <text class="summary-value">{{itemData.sampleSize}}条</text>
      </view>
    </view>

    <!-- 价格分布饼图 -->
    <view class="chart-section">
      <text class="chart-title">价格分布</text>
      <view class="pie-chart-container">
        <view class="pie-chart">
          <!-- 模拟饼图 -->
          <view class="pie-segment" style="--percentage: 30%; --color: #4A90E2;"></view>
          <view class="pie-segment" style="--percentage: 40%; --color: #00B42A;"></view>
          <view class="pie-segment" style="--percentage: 20%; --color: #FF6B35;"></view>
          <view class="pie-segment" style="--percentage: 10%; --color: #9013FE;"></view>
          <view class="pie-center">
            <text class="pie-center-text">{{itemData.avgPrice}}元</text>
          </view>
        </view>
        <view class="pie-legend">
          <view class="legend-item">
            <view class="legend-color" style="background-color: #4A90E2;"></view>
            <text class="legend-text">4.5-5.0元 (30%)</text>
          </view>
          <view class="legend-item">
            <view class="legend-color" style="background-color: #00B42A;"></view>
            <text class="legend-text">5.0-5.5元 (40%)</text>
          </view>
          <view class="legend-item">
            <view class="legend-color" style="background-color: #FF6B35;"></view>
            <text class="legend-text">5.5-6.0元 (20%)</text>
          </view>
          <view class="legend-item">
            <view class="legend-color" style="background-color: #9013FE;"></view>
            <text class="legend-text">6.0+元 (10%)</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 月度价格走势 -->
    <view class="chart-section">
      <text class="chart-title">月度价格走势</text>
      <view class="line-chart-container">
        <view class="line-chart">
          <!-- 模拟折线图 -->
          <view class="chart-grid">
            <view class="grid-line" v-for="i in 5" :key="i"></view>
          </view>
          <view class="chart-data">
            <view class="data-point" style="left: 10%; top: 40%;" :title="'1月: 5.0元'">
              <view class="point-dot"></view>
            </view>
            <view class="data-point" style="left: 30%; top: 35%;" :title="'2月: 5.2元'">
              <view class="point-dot"></view>
            </view>
            <view class="data-point" style="left: 50%; top: 30%;" :title="'3月: 5.3元'">
              <view class="point-dot"></view>
            </view>
            <view class="data-point" style="left: 70%; top: 35%;" :title="'4月: 5.2元'">
              <view class="point-dot"></view>
            </view>
            <view class="data-point" style="left: 90%; top: 25%;" :title="'5月: 5.4元'">
              <view class="point-dot"></view>
            </view>
            <view class="chart-line"></view>
          </view>
          <view class="chart-labels">
            <text class="label">1月</text>
            <text class="label">2月</text>
            <text class="label">3月</text>
            <text class="label">4月</text>
            <text class="label">5月</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 同地区同品类对比 -->
    <view class="comparison-section">
      <text class="section-title">同地区同品类对比</text>
      <view class="comparison-table">
        <view class="comparison-header">
          <text class="comparison-cell">工序</text>
          <text class="comparison-cell">平均价</text>
          <text class="comparison-cell">样本量</text>
          <text class="comparison-cell">对比</text>
        </view>
        <view v-for="(item, index) in comparisonData" :key="index" class="comparison-row">
          <text class="comparison-cell">{{item.process}}</text>
          <text class="comparison-cell">{{item.avgPrice}}元/件</text>
          <text class="comparison-cell">{{item.sampleSize}}条</text>
          <text :class="['comparison-cell', 'comparison-indicator', item.indicator]" class="comparison-indicator">{{item.indicator === 'higher' ? '↑' : item.indicator === 'lower' ? '↓' : '='}}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button @click="exportDetail" class="action-button export-button">
        <text class="button-icon">📤</text>
        <text>导出详情</text>
      </button>
      <button @click="backToList" class="action-button back-button">
        <text class="button-icon">←</text>
        <text>返回列表</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      itemData: {
        styleNumber: '',
        process: '',
        region: '',
        period: '',
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        sampleSize: 0
      },
      comparisonData: [
        {
          process: '车位',
          avgPrice: 5.2,
          sampleSize: 126,
          indicator: 'current'
        },
        {
          process: '锁边',
          avgPrice: 3.8,
          sampleSize: 98,
          indicator: 'lower'
        },
        {
          process: '熨烫',
          avgPrice: 6.5,
          sampleSize: 72,
          indicator: 'higher'
        },
        {
          process: '包装',
          avgPrice: 2.5,
          sampleSize: 156,
          indicator: 'lower'
        }
      ]
    }
  },
  onLoad(options) {
    if (options.item) {
      this.itemData = JSON.parse(decodeURIComponent(options.item))
    }
  },
  methods: {
    exportDetail() {
      console.log('导出详情:', this.itemData)
      uni.showToast({
        title: '导出成功',
        icon: 'success'
      })
    },
    backToList() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.wage-data-detail-container {
  padding: 16dp;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.detail-header {
  background-color: #fff;
  border-radius: 8px;
  padding: 20dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.detail-title {
  font-size: 20sp;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8dp;
}

.detail-subtitle {
  font-size: 14sp;
  color: #666;
  display: block;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12dp;
  margin-bottom: 16dp;
}

.summary-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8dp;
}

.summary-label {
  font-size: 14sp;
  color: #666;
}

.summary-value {
  font-size: 20sp;
  font-weight: bold;
  color: #333;
}

.chart-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 16sp;
  font-weight: bold;
  color: #333;
  margin-bottom: 16dp;
  display: block;
}

.pie-chart-container {
  display: flex;
  gap: 20dp;
  align-items: center;
}

.pie-chart {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
}

.pie-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 50% 0%, var(--end-x, 100%) var(--end-y, 0%));
  background-color: var(--color);
  transform-origin: 50% 50%;
  transform: rotate(var(--rotation, 0deg));
}

.pie-segment:nth-child(1) {
  --rotation: 0deg;
  --end-x: 100%;
  --end-y: 50%;
}

.pie-segment:nth-child(2) {
  --rotation: 108deg;
  --end-x: 100%;
  --end-y: 100%;
}

.pie-segment:nth-child(3) {
  --rotation: 252deg;
  --end-x: 50%;
  --end-y: 100%;
}

.pie-segment:nth-child(4) {
  --rotation: 324deg;
  --end-x: 50%;
  --end-y: 0%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.pie-center-text {
  font-size: 16sp;
  font-weight: bold;
  color: #333;
}

.pie-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8dp;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8dp;
}

.legend-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
}

.legend-text {
  font-size: 14sp;
  color: #666;
}

.line-chart-container {
  height: 300rpx;
  position: relative;
}

.line-chart {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20rpx 0;
}

.grid-line {
  height: 1rpx;
  background-color: #f0f0f0;
  width: 100%;
}

.chart-data {
  position: absolute;
  top: 20rpx;
  left: 0;
  right: 0;
  bottom: 60rpx;
  position: relative;
}

.data-point {
  position: absolute;
  transform: translate(-50%, -50%);
}

.point-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.chart-line {
  position: absolute;
  top: 40%;
  left: 10%;
  width: 80%;
  height: 2rpx;
  background-color: #4A90E2;
  transform: translateY(-50%);
  border-radius: 1rpx;
}

.chart-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 10rpx 0;
}

.label {
  font-size: 12sp;
  color: #666;
}

.comparison-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16sp;
  font-weight: bold;
  color: #333;
  margin-bottom: 16dp;
  display: block;
}

.comparison-table {
  width: 100%;
}

.comparison-header {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 4px 4px 0 0;
  padding: 12dp;
  font-weight: bold;
  font-size: 14sp;
  color: #333;
  border-bottom: 1rpx solid #ddd;
}

.comparison-cell {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-row {
  display: flex;
  padding: 12dp;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 14sp;
  color: #333;
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-indicator {
  font-weight: bold;
}

.comparison-indicator.higher {
  color: #00B42A;
}

.comparison-indicator.lower {
  color: #FF6B35;
}

.comparison-indicator.current {
  color: #4A90E2;
}

.action-buttons {
  display: flex;
  gap: 12dp;
  margin-top: 20dp;
}

.action-button {
  flex: 1;
  height: 48dp;
  border-radius: 8px;
  font-size: 16sp;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8dp;
}

.export-button {
  background-color: #4A90E2;
  color: #fff;
  border: none;
}

.back-button {
  background-color: #f9f9f9;
  color: #333;
  border: 1rpx solid #ddd;
}

.button-icon {
  font-size: 20rpx;
}
</style>