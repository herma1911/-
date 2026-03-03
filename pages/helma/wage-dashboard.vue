<template>
  <view class="wage-dashboard-container">
    <view class="dashboard-header">
      <text class="dashboard-title">服装行业工价大数据看板</text>
      <view class="dashboard-controls">
        <picker @change="handleRegionChange" :range="regions" :value="selectedRegionIndex" class="region-picker">
          <view class="picker-display">{{selectedRegion}}</view>
        </picker>
        <picker @change="handleTimeRangeChange" :range="timeRanges" :value="selectedTimeRangeIndex" class="time-picker">
          <view class="picker-display">{{selectedTimeRange}}</view>
        </picker>
      </view>
    </view>

    <!-- 核心大盘数据 -->
    <view class="core-metrics-section">
      <text class="section-title">核心大盘数据</text>
      <view class="metrics-grid">
        <view class="metric-card">
          <text class="metric-label">平均计件工价</text>
          <text class="metric-value">¥{{avgWage}}</text>
          <text class="metric-change" :class="avgWageChange > 0 ? 'positive' : 'negative'">
            {{avgWageChange > 0 ? '+' : ''}}{{avgWageChange}}%
          </text>
        </view>
        <view class="metric-card">
          <text class="metric-label">最高价</text>
          <text class="metric-value">¥{{maxWage}}</text>
          <text class="metric-desc">羽绒服-车位</text>
        </view>
        <view class="metric-card">
          <text class="metric-label">最低价</text>
          <text class="metric-value">¥{{minWage}}</text>
          <text class="metric-desc">T恤-包装</text>
        </view>
        <view class="metric-card">
          <text class="metric-label">数据覆盖</text>
          <text class="metric-value">{{dataCoverage}}</text>
          <text class="metric-desc">有效账单</text>
        </view>
      </view>
    </view>

    <!-- 地区工价排行 -->
    <view class="ranking-section">
      <text class="section-title">地区工价排行 TOP10</text>
      <view class="ranking-container">
        <view class="ranking-list">
          <view v-for="(item, index) in regionRankings" :key="index" class="ranking-item">
            <text class="ranking-number">{{index + 1}}</text>
            <text class="ranking-region">{{item.region}}</text>
            <text class="ranking-wage">¥{{item.avgWage}}/件</text>
            <text class="ranking-change" :class="item.change > 0 ? 'positive' : 'negative'">
              {{item.change > 0 ? '+' : ''}}{{item.change}}%
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 品类工价走势 -->
    <view class="trend-section">
      <text class="section-title">品类工价走势</text>
      <view class="trend-chart-container">
        <view class="trend-chart">
          <!-- 模拟折线图 -->
          <view class="chart-grid">
            <view class="grid-line" v-for="i in 5" :key="i"></view>
          </view>
          <view class="chart-data">
            <!-- T恤 -->
            <view class="trend-line tshirt-line">
              <view class="data-point" style="left: 10%; top: 60%;" :title="'1月: 4.5元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 30%; top: 55%;" :title="'2月: 4.6元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 50%; top: 50%;" :title="'3月: 4.7元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 70%; top: 45%;" :title="'4月: 4.8元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 90%; top: 40%;" :title="'5月: 4.9元'">
                <view class="point-dot"></view>
              </view>
            </view>
            <!-- 羽绒服 -->
            <view class="trend-line jacket-line">
              <view class="data-point" style="left: 10%; top: 30%;" :title="'1月: 12元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 30%; top: 28%;" :title="'2月: 12.5元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 50%; top: 25%;" :title="'3月: 13元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 70%; top: 22%;" :title="'4月: 13.5元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 90%; top: 20%;" :title="'5月: 14元'">
                <view class="point-dot"></view>
              </view>
            </view>
            <!-- 裤子 -->
            <view class="trend-line pants-line">
              <view class="data-point" style="left: 10%; top: 45%;" :title="'1月: 6元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 30%; top: 42%;" :title="'2月: 6.2元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 50%; top: 40%;" :title="'3月: 6.3元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 70%; top: 38%;" :title="'4月: 6.4元'">
                <view class="point-dot"></view>
              </view>
              <view class="data-point" style="left: 90%; top: 35%;" :title="'5月: 6.5元'">
                <view class="point-dot"></view>
              </view>
            </view>
          </view>
          <view class="chart-labels">
            <text class="label">1月</text>
            <text class="label">2月</text>
            <text class="label">3月</text>
            <text class="label">4月</text>
            <text class="label">5月</text>
          </view>
          <view class="chart-legend">
            <view class="legend-item">
              <view class="legend-color tshirt-color"></view>
              <text class="legend-text">T恤</text>
            </view>
            <view class="legend-item">
              <view class="legend-color jacket-color"></view>
              <text class="legend-text">羽绒服</text>
            </view>
            <view class="legend-item">
              <view class="legend-color pants-color"></view>
              <text class="legend-text">裤子</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 异常价格预警 -->
    <view class="alert-section">
      <text class="section-title">异常价格预警</text>
      <view class="alert-list">
        <view v-for="(alert, index) in priceAlerts" :key="index" class="alert-item" :class="alert.type">
          <text class="alert-icon">{{alert.type === 'high' ? '⚠️' : '🔻'}}</text>
          <view class="alert-content">
            <text class="alert-title">{{alert.title}}</text>
            <text class="alert-desc">{{alert.description}}</text>
          </view>
          <text class="alert-price">¥{{alert.price}}/件</text>
        </view>
      </view>
    </view>

    <!-- 淡旺季波动分析 -->
    <view class="seasonal-section">
      <text class="section-title">淡旺季波动分析</text>
      <view class="seasonal-chart-container">
        <view class="seasonal-chart">
          <!-- 模拟柱状图 -->
          <view class="chart-bars">
            <view class="bar-item">
              <view class="bar" style="height: 30%;" :title="'1月: 4.5元'">
                <text class="bar-value">4.5</text>
              </view>
              <text class="bar-label">1月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 35%;" :title="'2月: 4.7元'">
                <text class="bar-value">4.7</text>
              </view>
              <text class="bar-label">2月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 45%;" :title="'3月: 5.0元'">
                <text class="bar-value">5.0</text>
              </view>
              <text class="bar-label">3月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 60%;" :title="'4月: 5.5元'">
                <text class="bar-value">5.5</text>
              </view>
              <text class="bar-label">4月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 80%;" :title="'5月: 6.0元'">
                <text class="bar-value">6.0</text>
              </view>
              <text class="bar-label">5月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 90%;" :title="'6月: 6.5元'">
                <text class="bar-value">6.5</text>
              </view>
              <text class="bar-label">6月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 95%;" :title="'7月: 6.8元'">
                <text class="bar-value">6.8</text>
              </view>
              <text class="bar-label">7月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 85%;" :title="'8月: 6.3元'">
                <text class="bar-value">6.3</text>
              </view>
              <text class="bar-label">8月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 70%;" :title="'9月: 5.8元'">
                <text class="bar-value">5.8</text>
              </view>
              <text class="bar-label">9月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 50%;" :title="'10月: 5.2元'">
                <text class="bar-value">5.2</text>
              </view>
              <text class="bar-label">10月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 40%;" :title="'11月: 4.8元'">
                <text class="bar-value">4.8</text>
              </view>
              <text class="bar-label">11月</text>
            </view>
            <view class="bar-item">
              <view class="bar" style="height: 35%;" :title="'12月: 4.6元'">
                <text class="bar-value">4.6</text>
              </view>
              <text class="bar-label">12月</text>
            </view>
          </view>
          <view class="seasonal-markers">
            <view class="marker" style="left: 60%;">
              <text class="marker-text">旺季</text>
            </view>
            <view class="marker" style="left: 20%;">
              <text class="marker-text">淡季</text>
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
      // 选择器数据
      regions: ['全国', '江苏省', '浙江省', '广东省', '山东省'],
      timeRanges: ['近1个月', '近3个月', '近6个月', '近1年'],
      // 选择索引
      selectedRegionIndex: 0,
      selectedTimeRangeIndex: 2, // 默认近6个月
      // 选中值
      selectedRegion: '全国',
      selectedTimeRange: '近6个月',
      // 核心数据
      avgWage: 5.2,
      avgWageChange: 5.8,
      maxWage: 18.0,
      minWage: 2.5,
      dataCoverage: '12,586',
      // 地区排行数据
      regionRankings: [
        { region: '苏州昆山', avgWage: 6.8, change: 8.2 },
        { region: '杭州余杭', avgWage: 6.5, change: 6.7 },
        { region: '广州白云', avgWage: 6.2, change: 5.1 },
        { region: '宁波鄞州', avgWage: 5.9, change: 4.3 },
        { region: '东莞虎门', avgWage: 5.8, change: 3.9 },
        { region: '嘉兴桐乡', avgWage: 5.5, change: 3.2 },
        { region: '温州鹿城', avgWage: 5.3, change: 2.8 },
        { region: '济南历城', avgWage: 5.0, change: 2.1 },
        { region: '青岛城阳', avgWage: 4.8, change: 1.5 },
        { region: '潍坊奎文', avgWage: 4.5, change: 0.8 }
      ],
      // 价格预警数据
      priceAlerts: [
        {
          type: 'high',
          title: '羽绒服-车位工价异常',
          description: '浙江省杭州市工价高于地区均值52%',
          price: 22.5
        },
        {
          type: 'low',
          title: 'T恤-包装工价异常',
          description: '山东省潍坊市工价低于地区均值45%',
          price: 1.8
        },
        {
          type: 'high',
          title: '裤子-锁边工价异常',
          description: '广东省广州市工价高于地区均值38%',
          price: 5.8
        }
      ]
    }
  },
  onLoad() {
    // 初始化默认值
    this.selectedRegion = this.regions[0]
    this.selectedTimeRange = this.timeRanges[2]
  },
  methods: {
    // 地区选择
    handleRegionChange(e) {
      this.selectedRegionIndex = e.detail.value
      this.selectedRegion = this.regions[this.selectedRegionIndex]
      // 模拟数据更新
      this.updateDashboardData()
    },
    // 时间范围选择
    handleTimeRangeChange(e) {
      this.selectedTimeRangeIndex = e.detail.value
      this.selectedTimeRange = this.timeRanges[this.selectedTimeRangeIndex]
      // 模拟数据更新
      this.updateDashboardData()
    },
    // 更新看板数据
    updateDashboardData() {
      // 这里应该调用API获取真实数据
      console.log('更新数据:', this.selectedRegion, this.selectedTimeRange)
      // 模拟数据更新
      uni.showToast({
        title: '数据更新成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.wage-dashboard-container {
  padding: 16dp;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.dashboard-header {
  background-color: #fff;
  border-radius: 8px;
  padding: 20dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12dp;
}

.dashboard-title {
  font-size: 20sp;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.dashboard-controls {
  display: flex;
  gap: 12dp;
  align-items: center;
}

.region-picker,
.time-picker {
  height: 40dp;
  border: 1rpx solid #ddd;
  border-radius: 4px;
  padding: 0 12dp;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  min-width: 120dp;
}

.picker-display {
  font-size: 14sp;
  color: #333;
}

.core-metrics-section {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12dp;
}

.metric-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16dp;
  display: flex;
  flex-direction: column;
  gap: 8dp;
}

.metric-label {
  font-size: 14sp;
  color: #666;
}

.metric-value {
  font-size: 24sp;
  font-weight: bold;
  color: #333;
}

.metric-change {
  font-size: 12sp;
  font-weight: bold;
}

.metric-change.positive {
  color: #00B42A;
}

.metric-change.negative {
  color: #FF6B35;
}

.metric-desc {
  font-size: 12sp;
  color: #999;
}

.ranking-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.ranking-container {
  max-height: 400rpx;
  overflow-y: auto;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8dp;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12dp;
  background-color: #f9f9f9;
  border-radius: 4px;
  gap: 12dp;
}

.ranking-number {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  color: #fff;
  font-size: 14sp;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-region {
  flex: 1;
  font-size: 14sp;
  color: #333;
}

.ranking-wage {
  font-size: 14sp;
  font-weight: bold;
  color: #333;
  min-width: 80rpx;
}

.ranking-change {
  font-size: 12sp;
  font-weight: bold;
  min-width: 60rpx;
}

.ranking-change.positive {
  color: #00B42A;
}

.ranking-change.negative {
  color: #FF6B35;
}

.trend-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.trend-chart-container {
  height: 400rpx;
  position: relative;
}

.trend-chart {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60rpx;
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

.trend-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-point {
  position: absolute;
  transform: translate(-50%, -50%);
}

.point-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.tshirt-line .point-dot {
  background-color: #4A90E2;
}

.jacket-line .point-dot {
  background-color: #00B42A;
}

.pants-line .point-dot {
  background-color: #FF6B35;
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

.chart-legend {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.legend-color {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
}

.tshirt-color {
  background-color: #4A90E2;
}

.jacket-color {
  background-color: #00B42A;
}

.pants-color {
  background-color: #FF6B35;
}

.legend-text {
  font-size: 12sp;
  color: #666;
}

.alert-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12dp;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 16dp;
  border-radius: 8px;
  gap: 12dp;
  border-left: 4rpx solid #4A90E2;
}

.alert-item.high {
  background-color: #FFF1F0;
  border-left-color: #FF6B35;
}

.alert-item.low {
  background-color: #F0F5FF;
  border-left-color: #4A90E2;
}

.alert-icon {
  font-size: 32rpx;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.alert-title {
  font-size: 14sp;
  font-weight: bold;
  color: #333;
}

.alert-desc {
  font-size: 12sp;
  color: #666;
}

.alert-price {
  font-size: 16sp;
  font-weight: bold;
  color: #333;
  min-width: 80rpx;
  text-align: right;
}

.seasonal-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.seasonal-chart-container {
  height: 300rpx;
  position: relative;
}

.seasonal-chart {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding-bottom: 30rpx;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 8rpx;
}

.bar {
  width: 24rpx;
  background-color: #4A90E2;
  border-radius: 4rpx 4rpx 0 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8rpx;
}

.bar-value {
  font-size: 12sp;
  color: #fff;
  font-weight: bold;
}

.bar-label {
  font-size: 12sp;
  color: #666;
}

.seasonal-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}

.marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 107, 53, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid #FF6B35;
}

.marker-text {
  font-size: 12sp;
  color: #FF6B35;
  font-weight: bold;
}
</style>