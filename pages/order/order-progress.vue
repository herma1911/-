<template>
  <view class="order-progress-container">
    <view class="header">
      <text class="title">订单进度跟踪</text>
    </view>
    
    <!-- 订单基本信息 -->
    <view class="order-info-section">
      <text class="section-title">订单信息</text>
      <view class="order-info">
        <text class="info-text">款号：{{orderInfo.styleNumber || '加载中...'}}</text>
        <text class="info-text">数量：{{orderInfo.quantity || 0}}件</text>
        <text class="info-text">状态：{{orderInfo.status || '未知'}}</text>
        <text class="info-text">建议上线：{{orderInfo.suggestedStartTime || '未设置'}}</text>
      </view>
    </view>
    
    <!-- 进度概览 -->
    <view class="progress-overview">
      <text class="section-title">进度概览</text>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
      </view>
      <text class="progress-text">完成进度：{{progressPercentage}}%</text>
      <view class="progress-details">
        <text class="detail-item">收料进度：{{materialProgress}}%</text>
        <text class="detail-item">生产进度：{{productionProgress}}%</text>
        <text class="detail-item">交货进度：{{deliveryProgress}}%</text>
      </view>
    </view>
    
    <!-- 收料情况 -->
    <view class="material-section">
      <text class="section-title">收料情况</text>
      <view class="material-form">
        <view class="form-item">
          <text class="form-label">裁片收料：</text>
          <input type="number" v-model.number="materialInput.cutting" placeholder="请输入裁片收料数量" class="form-input" />
          <button class="update-btn" @click="updateMaterial('cutting')">更新</button>
        </view>
        <view class="form-item">
          <text class="form-label">辅料收料：</text>
          <input type="number" v-model.number="materialInput.auxiliary" placeholder="请输入辅料收料数量" class="form-input" />
          <button class="update-btn" @click="updateMaterial('auxiliary')">更新</button>
        </view>
      </view>
      <view class="material-history">
        <text class="history-title">收料历史</text>
        <view v-if="materialHistory.length > 0" class="history-list">
          <view v-for="(item, index) in materialHistory" :key="index" class="history-item">
            <text class="history-time">{{item.time}}</text>
            <text class="history-type">{{item.type === 'cutting' ? '裁片' : '辅料'}}</text>
            <text class="history-quantity">数量：{{item.quantity}}件</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <text>暂无收料记录</text>
        </view>
      </view>
    </view>
    
    <!-- 交货情况 -->
    <view class="delivery-section">
      <text class="section-title">交货情况</text>
      <view class="delivery-form">
        <view class="form-item">
          <text class="form-label">已交货数量：</text>
          <input type="number" v-model.number="deliveryInput.quantity" placeholder="请输入已交货数量" class="form-input" />
          <button class="update-btn" @click="updateDelivery">更新</button>
        </view>
      </view>
      <view class="delivery-history">
        <text class="history-title">交货历史</text>
        <view v-if="deliveryHistory.length > 0" class="history-list">
          <view v-for="(item, index) in deliveryHistory" :key="index" class="history-item">
            <text class="history-time">{{item.time}}</text>
            <text class="history-quantity">数量：{{item.quantity}}件</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <text>暂无交货记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: '',
      orderInfo: {},
      // 收料输入
      materialInput: {
        cutting: 0,
        auxiliary: 0
      },
      // 交货输入
      deliveryInput: {
        quantity: 0
      },
      // 收料历史
      materialHistory: [],
      // 交货历史
      deliveryHistory: [],
      // 累计收料
      totalMaterial: {
        cutting: 0,
        auxiliary: 0
      },
      // 累计交货
      totalDelivery: 0
    }
  },
  computed: {
    // 收料进度
    materialProgress() {
      if (!this.orderInfo.quantity) return 0
      const totalMaterial = this.totalMaterial.cutting + this.totalMaterial.auxiliary
      return Math.min(Math.round((totalMaterial / this.orderInfo.quantity) * 100), 100)
    },
    // 生产进度（基于收料和交货的平均值）
    productionProgress() {
      return Math.min(Math.round((this.materialProgress + this.deliveryProgress) / 2), 100)
    },
    // 交货进度
    deliveryProgress() {
      if (!this.orderInfo.quantity) return 0
      return Math.min(Math.round((this.totalDelivery / this.orderInfo.quantity) * 100), 100)
    },
    // 总体进度
    progressPercentage() {
      return Math.min(Math.round((this.materialProgress * 0.3 + this.productionProgress * 0.3 + this.deliveryProgress * 0.4)), 100)
    }
  },
  onLoad(options) {
    this.orderId = options.id
    this.loadOrderInfo()
    this.loadMaterialHistory()
    this.loadDeliveryHistory()
  },
  methods: {
    // 加载订单信息
    loadOrderInfo() {
      // 模拟从本地存储加载订单信息
      const orders = [
        {
          id: 1,
          styleNumber: '款号A',
          quantity: 1000,
          status: '待拆分',
          suggestedStartTime: '2026-02-20'
        },
        {
          id: 2,
          styleNumber: '款号B',
          quantity: 1500,
          status: '已拆分',
          suggestedStartTime: '2026-02-22',
          actualStartTime: '2026-02-22'
        },
        {
          id: 3,
          styleNumber: '款号C',
          quantity: 800,
          status: '待审批',
          suggestedStartTime: '2026-02-25'
        }
      ]
      
      const order = orders.find(o => o.id == this.orderId)
      if (order) {
        this.orderInfo = order
      }
    },
    // 加载收料历史
    loadMaterialHistory() {
      // 模拟从本地存储加载收料历史
      this.materialHistory = [
        {
          id: 1,
          type: 'cutting',
          quantity: 500,
          time: '2026-02-18 10:00'
        },
        {
          id: 2,
          type: 'auxiliary',
          quantity: 400,
          time: '2026-02-18 11:30'
        }
      ]
      
      // 计算累计收料
      this.totalMaterial = {
        cutting: this.materialHistory.filter(item => item.type === 'cutting').reduce((sum, item) => sum + item.quantity, 0),
        auxiliary: this.materialHistory.filter(item => item.type === 'auxiliary').reduce((sum, item) => sum + item.quantity, 0)
      }
    },
    // 加载交货历史
    loadDeliveryHistory() {
      // 模拟从本地存储加载交货历史
      this.deliveryHistory = [
        {
          id: 1,
          quantity: 200,
          time: '2026-02-18 14:00'
        },
        {
          id: 2,
          quantity: 150,
          time: '2026-02-18 16:30'
        }
      ]
      
      // 计算累计交货
      this.totalDelivery = this.deliveryHistory.reduce((sum, item) => sum + item.quantity, 0)
    },
    // 更新收料
    updateMaterial(type) {
      const quantity = this.materialInput[type]
      if (quantity <= 0) {
        uni.showToast({
          title: '请输入有效的数量',
          icon: 'none'
        })
        return
      }
      
      // 添加到历史记录
      const newMaterial = {
        id: Date.now(),
        type: type,
        quantity: quantity,
        time: new Date().toLocaleString()
      }
      this.materialHistory.push(newMaterial)
      
      // 更新累计收料
      this.totalMaterial[type] += quantity
      
      // 重置输入
      this.materialInput[type] = 0
      
      uni.showToast({
        title: '收料记录更新成功',
        icon: 'success'
      })
    },
    // 更新交货
    updateDelivery() {
      const quantity = this.deliveryInput.quantity
      if (quantity <= 0) {
        uni.showToast({
          title: '请输入有效的数量',
          icon: 'none'
        })
        return
      }
      
      // 检查是否超过订单数量
      if (this.totalDelivery + quantity > this.orderInfo.quantity) {
        uni.showToast({
          title: '交货数量超过订单总数',
          icon: 'none'
        })
        return
      }
      
      // 添加到历史记录
      const newDelivery = {
        id: Date.now(),
        quantity: quantity,
        time: new Date().toLocaleString()
      }
      this.deliveryHistory.push(newDelivery)
      
      // 更新累计交货
      this.totalDelivery += quantity
      
      // 重置输入
      this.deliveryInput.quantity = 0
      
      uni.showToast({
        title: '交货记录更新成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.order-progress-container {
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

.order-info-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.order-info {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
}

.info-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.progress-overview {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.progress-bar {
  height: 30rpx;
  background-color: #f0f0f0;
  border-radius: 15rpx;
  overflow: hidden;
  margin-bottom: 15rpx;
}

.progress-fill {
  height: 100%;
  background-color: #4A90E2;
  border-radius: 15rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
}

.progress-details {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.detail-item {
  font-size: 22rpx;
  color: #666;
  margin: 0 10rpx;
}

.material-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.material-form {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 24rpx;
  color: #666;
  width: 150rpx;
}

.form-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  margin-right: 10rpx;
}

.update-btn {
  width: 120rpx;
  height: 70rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 22rpx;
  border-radius: 10rpx;
}

.material-history {
  margin-top: 10rpx;
}

.history-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.history-list {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
}

.history-item {
  padding: 15rpx;
  border-bottom: 1rpx solid #e8e8e8;
  margin-bottom: 10rpx;
}

.history-time {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 5rpx;
  display: block;
}

.history-type {
  font-size: 22rpx;
  color: #4A90E2;
  font-weight: bold;
  margin-right: 15rpx;
}

.history-quantity {
  font-size: 22rpx;
  color: #333;
}

.delivery-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.delivery-form {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}
</style>