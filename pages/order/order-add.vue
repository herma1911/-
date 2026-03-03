<template>
  <view class="order-add-container">
    <view class="header">
      <text class="title">新增订单</text>
    </view>
    
    <view class="order-form">
      <view class="form-item">
        <text class="form-label">款号：</text>
        <input type="text" v-model="orderInfo.styleNumber" placeholder="请输入款号" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">A颜色：</text>
        <input type="text" v-model="orderInfo.colorA" placeholder="请输入A颜色" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">A数量：</text>
        <input type="number" v-model.number="orderInfo.quantityA" placeholder="请输入A数量" class="form-input" @input="calculateTotalQuantity" />
      </view>
      <view class="form-item">
        <text class="form-label">B颜色：</text>
        <input type="text" v-model="orderInfo.colorB" placeholder="请输入B颜色" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">B数量：</text>
        <input type="number" v-model.number="orderInfo.quantityB" placeholder="请输入B数量" class="form-input" @input="calculateTotalQuantity" />
      </view>
      <view class="form-item">
        <text class="form-label">C颜色：</text>
        <input type="text" v-model="orderInfo.colorC" placeholder="请输入C颜色" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">C数量：</text>
        <input type="number" v-model.number="orderInfo.quantityC" placeholder="请输入C数量" class="form-input" @input="calculateTotalQuantity" />
      </view>
      <view class="form-item">
        <text class="form-label">总订单数：</text>
        <input type="number" v-model.number="orderInfo.totalQuantity" placeholder="自动计算，可手动修正" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">含税单价：</text>
        <input type="number" v-model.number="orderInfo.taxIncludedPrice" placeholder="请输入含税单价" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">车缝比例：</text>
        <input type="number" v-model.number="orderInfo.sewingRatio" placeholder="请输入车缝比例（如0.8）" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">车缝总价：</text>
        <text class="form-value">¥{{calculateSewingTotalPrice()}}/件</text>
      </view>
      <view class="form-item">
        <text class="form-label">建议上线时间：</text>
        <picker mode="date" :value="orderInfo.suggestedStartTime" @change="(e) => dateChange(e, 'suggestedStartTime')">
          <view class="picker">
            {{ orderInfo.suggestedStartTime || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">上线日期：</text>
        <picker mode="date" :value="orderInfo.startDate" @change="(e) => dateChange(e, 'startDate')">
          <view class="picker">
            {{ orderInfo.startDate || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">下线日期：</text>
        <picker mode="date" :value="orderInfo.endDate" @change="(e) => dateChange(e, 'endDate')">
          <view class="picker">
            {{ orderInfo.endDate || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">生产产线：</text>
        <picker :value="productionLineIndex" :range="productionLines" @change="productionLineChange">
          <view class="picker">
            {{ productionLines[productionLineIndex] || '请选择产线' }}
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 生产时间轴 -->
    <view class="timeline-section">
      <text class="section-title">生产时间轴</text>
      <view class="timeline-container">
        <view class="timeline-item">
          <view class="timeline-dot"></view>
          <view class="timeline-content">
            <text class="timeline-title">订单创建</text>
            <text class="timeline-date">{{ currentDate }}</text>
          </view>
        </view>
        <view class="timeline-item">
          <view class="timeline-dot"></view>
          <view class="timeline-line"></view>
          <view class="timeline-content">
            <text class="timeline-title">计划上线</text>
            <text class="timeline-date">{{ orderInfo.startDate || '未设置' }}</text>
          </view>
        </view>
        <view class="timeline-item">
          <view class="timeline-dot"></view>
          <view class="timeline-line"></view>
          <view class="timeline-content">
            <text class="timeline-title">计划下线</text>
            <text class="timeline-date">{{ orderInfo.endDate || '未设置' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <button class="cancel-btn" @click="cancel">取消</button>
      <button class="submit-btn" @click="submit">提交</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderInfo: {
        styleNumber: '',
        colorA: '',
        quantityA: 0,
        colorB: '',
        quantityB: 0,
        colorC: '',
        quantityC: 0,
        taxIncludedPrice: 0,
        sewingRatio: 0,
        suggestedStartTime: '',
        startDate: '',
        endDate: '',
        productionLine: ''
      },
      // 产线相关
      productionLines: [],
      productionLineIndex: 0
    }
  },
  computed: {
    // 当前日期
    currentDate() {
      return new Date().toISOString().split('T')[0]
    }
  },
  onLoad() {
    this.loadProductionLines()
  },
  methods: {
    dateChange(e, field) {
      this.orderInfo[field] = e.detail.value
    },
    // 加载产线数据
    loadProductionLines() {
      const lines = uni.getStorageSync('productionLines') || []
      this.productionLines = lines.map(line => line.name)
    },
    // 产线选择
    productionLineChange(e) {
      this.productionLineIndex = e.detail.value
      this.orderInfo.productionLine = this.productionLines[this.productionLineIndex]
    },
    calculateTotalQuantity() {
      // 计算总订单数
      const totalQuantity = (this.orderInfo.quantityA || 0) + (this.orderInfo.quantityB || 0) + (this.orderInfo.quantityC || 0)
      this.orderInfo.totalQuantity = totalQuantity
    },
    calculateSewingTotalPrice() {
      if (!this.orderInfo.taxIncludedPrice || !this.orderInfo.sewingRatio) {
        return 0
      }
      return (this.orderInfo.taxIncludedPrice * this.orderInfo.sewingRatio).toFixed(2)
    },
    cancel() {
      uni.navigateBack()
    },
    submit() {
      if (!this.orderInfo.styleNumber || !this.orderInfo.taxIncludedPrice || !this.orderInfo.sewingRatio || !this.orderInfo.totalQuantity || !this.orderInfo.productionLine) {
        uni.showToast({
          title: '请填写完整的订单信息',
          icon: 'none'
        })
        return
      }
      
      // 保存订单信息到本地存储
      const orders = uni.getStorageSync('orders') || []
      const newOrder = {
        id: Date.now(),
        ...this.orderInfo,
        status: '待拆分',
        totalPrice: parseFloat(this.calculateSewingTotalPrice()),
        createdAt: this.currentDate
      }
      orders.push(newOrder)
      uni.setStorageSync('orders', orders)
      
      // 保存该款的车缝总价到本地存储，以款号为键
      const sewingTotalPrices = uni.getStorageSync('sewingTotalPrices') || {}
      sewingTotalPrices[newOrder.styleNumber] = newOrder.totalPrice
      uni.setStorageSync('sewingTotalPrices', sewingTotalPrices)
      
      uni.showToast({
        title: '订单添加成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    }
  }
}
</script>

<style scoped>
.order-add-container {
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

.order-form {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
}

.form-value {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 24rpx;
  color: #4A90E2;
  font-weight: bold;
}

.picker {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  line-height: 70rpx;
  background-color: #fff;
}

/* 时间轴样式 */
.timeline-section {
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

.timeline-container {
  position: relative;
  padding-left: 30rpx;
}

.timeline-item {
  position: relative;
  margin-bottom: 30rpx;
  display: flex;
  align-items: flex-start;
}

.timeline-dot {
  position: absolute;
  left: -30rpx;
  top: 5rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  z-index: 1;
}

.timeline-line {
  position: absolute;
  left: -25rpx;
  top: 25rpx;
  width: 10rpx;
  height: calc(100% + 10rpx);
  background-color: #E8E8E8;
  z-index: 0;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-content {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-left: 20rpx;
}

.timeline-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.timeline-date {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.footer {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  background-color: #f0f0f0;
  color: #333;
  font-size: 28rpx;
  border-radius: 10rpx;
}

.submit-btn {
  flex: 1;
  height: 80rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 28rpx;
  border-radius: 10rpx;
}
</style>