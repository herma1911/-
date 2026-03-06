<template>
  <view class="price-calculator-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">工价智能测算</text>
      <view class="placeholder"></view>
    </view>

    <!-- 基础信息区 -->
    <view class="basic-info-section">
      <view class="form-group">
        <text class="form-label">选择工序</text>
        <picker @change="handleProcessChange" :value="selectedProcessIndex" :range="processes">
          <view class="picker-input">
            <text>{{ processes[selectedProcessIndex] }}</text>
          </view>
        </picker>
      </view>
      <view class="form-group">
        <text class="form-label">面料类型</text>
        <picker @change="handleFabricChange" :value="selectedFabricIndex" :range="fabrics">
          <view class="picker-input">
            <text>{{ fabrics[selectedFabricIndex] }}</text>
          </view>
        </picker>
      </view>
      <view class="form-group">
        <text class="form-label">当地最低工资标准（元/小时）</text>
        <input type="number" v-model.number="minimumWage" class="form-input" placeholder="请输入当地最低工资标准" step="0.1" min="0" />
      </view>
    </view>

    <!-- 标准工时输入区 -->
    <view class="standard-time-section">
      <text class="section-title">标准工时</text>
      <view class="form-group">
        <text class="form-label">标准工时（分钟/件）</text>
        <input type="number" v-model.number="standardTime" class="form-input" placeholder="请输入标准工时" step="0.1" min="0" />
      </view>
    </view>

    <!-- 目标小时工资区 -->
    <view class="hourly-wage-section">
      <text class="section-title">目标小时工资</text>
      <view class="form-group">
        <text class="form-label">目标小时工资（元/小时）</text>
        <input type="number" v-model.number="targetHourlyWage" class="form-input" placeholder="请输入目标小时工资" step="0.1" min="0" />
        <text class="form-hint">或参考系统推荐：{{ recommendedHourlyWage }}元/小时</text>
      </view>
    </view>

    <!-- 计算结果区 -->
    <view class="result-section">
      <text class="section-title">测算结果</text>
      <view class="result-card">
        <view class="result-row">
          <text class="result-label">测算工价</text>
          <text class="result-value">¥{{ calculatedPrice.toFixed(2) }}/件</text>
        </view>
        <view class="result-row">
          <text class="result-label">行业工价对比</text>
          <text :class="['result-value', { 'green': priceComparison === '高于', 'red': priceComparison === '低于' }]">{{ priceComparison }}全国平均水平</text>
        </view>
        <view class="result-row">
          <text class="result-label">工人预估收入</text>
          <text class="result-value">{{ dailyIncome.toFixed(2) }}元/天</text>
        </view>
        <view class="result-row">
          <text class="result-label">月度预估收入</text>
          <text class="result-value">{{ monthlyIncome.toFixed(2) }}元/月</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮区 -->
    <view class="action-buttons-section">
      <button class="action-btn primary" @tap="savePrice">保存工价</button>
      <button class="action-btn secondary" @tap="syncToWorkers">同步给对应工序工人</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 基础信息
      processes: ['请选择工序', '平车', '裁剪', '熨烫', '包装'],
      selectedProcessIndex: 0,
      fabrics: ['请选择面料类型', '棉', '麻', '丝', '化纤'],
      selectedFabricIndex: 0,
      minimumWage: 20,
      // 标准工时
      standardTime: 3.0,
      // 目标小时工资
      targetHourlyWage: 25,
      recommendedHourlyWage: 25
    }
  },
  computed: {
    calculatedPrice() {
      if (this.standardTime > 0 && this.targetHourlyWage > 0) {
        const hoursPerPiece = this.standardTime / 60
        return hoursPerPiece * this.targetHourlyWage
      }
      return 0
    },
    priceComparison() {
      // 模拟行业平均工价
      const industryAverage = 1.2
      if (this.calculatedPrice > industryAverage * 1.1) {
        return '高于'
      } else if (this.calculatedPrice < industryAverage * 0.9) {
        return '低于'
      } else {
        return '持平'
      }
    },
    dailyIncome() {
      if (this.calculatedPrice > 0) {
        // 假设每天工作10小时，效率80%
        const hourlyCapacity = (60 / this.standardTime) * 0.8
        const dailyCapacity = hourlyCapacity * 10
        return dailyCapacity * this.calculatedPrice
      }
      return 0
    },
    monthlyIncome() {
      return this.dailyIncome * 26
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    handleProcessChange(e) {
      this.selectedProcessIndex = e.detail.value
      // 这里可以根据工序更新推荐小时工资
    },
    handleFabricChange(e) {
      this.selectedFabricIndex = e.detail.value
      // 这里可以根据面料类型更新推荐小时工资
    },
    savePrice() {
      if (this.selectedProcessIndex === 0 || this.selectedFabricIndex === 0) {
        uni.showToast({
          title: '请选择工序和面料类型',
          icon: 'none'
        })
        return
      }
      
      if (this.calculatedPrice === 0) {
        uni.showToast({
          title: '请输入有效数据',
          icon: 'none'
        })
        return
      }
      
      // 模拟保存工价
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    syncToWorkers() {
      if (this.selectedProcessIndex === 0) {
        uni.showToast({
          title: '请选择工序',
          icon: 'none'
        })
        return
      }
      
      if (this.calculatedPrice === 0) {
        uni.showToast({
          title: '请先计算工价',
          icon: 'none'
        })
        return
      }
      
      // 模拟同步给工人
      uni.showToast({
        title: '同步成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.price-calculator-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 80rpx;
}

/* 基础信息区 */
.basic-info-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.picker-input {
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.form-input {
  width: 100%;
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.form-hint {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
  line-height: 1.4;
}

/* 标准工时输入区 */
.standard-time-section,
.hourly-wage-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

/* 计算结果区 */
.result-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.result-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  font-size: 28rpx;
  color: #666;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.result-value.green {
  color: #52c41a;
}

.result-value.red {
  color: #f5222d;
}

/* 操作按钮区 */
.action-buttons-section {
  padding: 0 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  padding: 25rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  text-align: center;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
}

.action-btn.secondary {
  background-color: #52c41a;
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .basic-info-section {
    margin: 20rpx;
    padding: 20rpx;
  }
  
  .standard-time-section,
  .hourly-wage-section,
  .result-section,
  .action-buttons-section {
    padding: 0 20rpx 20rpx;
  }
  
  .result-card {
    padding: 20rpx;
  }
  
  .action-btn {
    padding: 20rpx;
    font-size: 26rpx;
  }
}
</style>