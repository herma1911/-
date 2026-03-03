<template>
  <view class="order-detail-container">
    <view class="order-basic-info">
      <view class="info-item">
        <text class="label">款号:</text>
        <text class="value">{{orderInfo.styleNumber}}</text>
      </view>
      <view class="info-item">
        <text class="label">总价:</text>
        <text class="value">¥{{orderInfo.totalPrice}}/件</text>
      </view>
      <view class="info-item">
        <text class="label">状态:</text>
<text :class="['value', 'status-' + (orderInfo.status || '')]">{{orderInfo.status || '未定义'}}</text>
      </view>
    </view>
    
    <view class="process-section">
      <text class="section-title">工序拆分情况</text>
      <view class="process-list">
        <view v-for="process in orderInfo.processes" :key="process.id" class="process-item">
          <view class="process-info">
            <text class="process-name">{{process.name}}</text>
            <text class="process-price">¥{{process.price}}/件</text>
          </view>
        </view>
      </view>
      <view class="process-summary">
        <text class="summary-label">拆分总价:</text>
        <text class="summary-value">¥{{orderInfo.splitTotal}}/件</text>
        <text class="summary-diff" :class="orderInfo.diff > 0 ? 'diff-positive' : 'diff-negative'">
          ({{orderInfo.diff > 0 ? '+' : ''}}¥{{orderInfo.diff}})
        </text>
      </view>
    </view>
    
    <view class="action-buttons">
      <button class="action-btn edit-btn" @click="editOrder">编辑订单</button>
      <button class="action-btn split-btn" @click="splitProcess">重新拆分</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderInfo: {
        id: 1,
        styleNumber: '款号A',
        totalPrice: 100,
        status: '已拆分',
        processes: [
          {
            id: 1,
            name: 'A工序',
            price: 30
          },
          {
            id: 2,
            name: 'B工序',
            price: 40
          },
          {
            id: 3,
            name: 'C工序',
            price: 30
          }
        ],
        splitTotal: 100,
        diff: 0
      }
    }
  },
  onLoad(options) {
    // 实际项目中，这里会根据options.id获取订单详情
    console.log('订单ID:', options.id)
  },
  methods: {
    editOrder() {
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      })
    },
    splitProcess() {
      uni.navigateTo({
        url: 'process-split?id=' + this.orderInfo.id
      })
    }
  }
}
</script>

<style scoped>
.order-detail-container {
  padding: 20rpx;
}

.order-basic-info {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  margin-bottom: 15rpx;
}

.label {
  width: 100rpx;
  font-size: 28rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.status-已拆分 {
  color: #52c41a;
}

.status-待审批 {
  color: #faad14;
}

.status-待拆分 {
  color: #1890ff;
}

.process-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.process-list {
  margin-bottom: 20rpx;
}

.process-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.process-name {
  font-size: 28rpx;
  color: #333;
}

.process-price {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: 500;
}

.process-summary {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.summary-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-left: 20rpx;
}

.summary-diff {
  font-size: 24rpx;
}

.diff-positive {
  color: #ff4d4f;
}

.diff-negative {
  color: #52c41a;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
}

.edit-btn {
  background-color: #f0f0f0;
  color: #333;
}

.split-btn {
  background-color: #4A90E2;
  color: #fff;
}
</style>