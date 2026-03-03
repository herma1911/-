<template>
  <view class="delivery-container">
    <view class="header">
      <text class="title">交货管理</text>
    </view>
    
    <!-- 颜色数量汇总 -->
    <view class="delivery-section">
      <text class="section-title">颜色数量汇总</text>
      <view class="summary-list">
        <view v-for="(item, index) in colorSummary" :key="index" class="summary-item">
          <text class="summary-color">{{ item.color }}</text>
          <text class="summary-quantity">{{ item.quantity }} 件</text>
        </view>
        <view v-if="colorSummary.length === 0" class="empty-state">
          <text>暂无汇总数据</text>
        </view>
      </view>
    </view>
    
    <view class="delivery-section">
      <text class="section-title">交货信息</text>
      <view class="delivery-form">
        <view class="form-item">
          <text class="form-label">订单选择：</text>
          <picker :value="orderIndex" :range="orders" @change="orderChange">
            <view class="picker">
              {{ orders[orderIndex] }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">颜色：</text>
          <input type="text" v-model="deliveryInfo.color" placeholder="请输入颜色" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">尺码：</text>
          <input type="text" v-model="deliveryInfo.size" placeholder="请输入尺码" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">数量：</text>
          <input type="number" v-model.number="deliveryInfo.quantity" placeholder="请输入数量" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">备注：</text>
          <input type="text" v-model="deliveryInfo.remark" placeholder="请输入备注（选填）" class="form-input" />
        </view>
        <button class="add-btn" @click="addDeliveryItem">添加交货</button>
      </view>
    </view>
    
    <!-- 已添加交货 -->
    <view class="delivery-section">
      <text class="section-title">已添加交货</text>
      <view class="delivery-list">
        <view v-for="(item, index) in deliveryItems" :key="index" class="delivery-item">
          <view class="delivery-header">
            <text class="delivery-order">{{item.order}}</text>
          </view>
          <view class="delivery-details">
            <text>颜色：{{item.color}}</text>
            <text>尺码：{{item.size}}</text>
            <text>数量：{{item.quantity}}</text>
            <text v-if="item.remark">备注：{{item.remark}}</text>
          </view>
          <button class="delete-btn" @click="deleteDeliveryItem(index)">删除</button>
        </view>
        <view v-if="deliveryItems.length === 0" class="empty-state">
          <text>暂无已添加的交货</text>
        </view>
      </view>
    </view>
    
    <!-- 导出按钮 -->
    <view class="delivery-section">
      <button class="export-btn" @click="exportDeliveryDetails">导出交货明细</button>
    </view>
    
    <!-- 底部提交 -->
    <view class="footer">
      <button class="submit-btn" @click="submitDelivery">确认提交</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 订单列表
      orders: [],
      orderIndex: 0,
      // 交货信息
      deliveryInfo: {
        color: '',
        size: '',
        quantity: 0,
        remark: ''
      },
      // 已添加交货
      deliveryItems: [],
      // 订单库存信息
      orderInventory: {},
      // 完整订单数据
      fullOrders: []
    }
  },
  computed: {
    // 颜色数量汇总
    colorSummary() {
      const summary = {}
      // 汇总当前已添加的交货
      this.deliveryItems.forEach(item => {
        if (item.color) {
          if (!summary[item.color]) {
            summary[item.color] = 0
          }
          summary[item.color] += item.quantity
        }
      })
      // 转换为数组格式
      return Object.keys(summary).map(color => ({
        color,
        quantity: summary[color]
      }))
    }
  },
  methods: {
    // 订单选择
    orderChange(e) {
      this.orderIndex = e.detail.value
    },
    // 添加交货
    addDeliveryItem() {
      if (!this.deliveryInfo.color || this.deliveryInfo.quantity <= 0) {
        uni.showToast({
          title: '请填写颜色和数量',
          icon: 'none'
        })
        return
      }
      
      const selectedOrder = this.orders[this.orderIndex]
      
      // 检查订单库存
      if (this.orderInventory[selectedOrder] < this.deliveryInfo.quantity) {
        uni.showToast({
          title: '交货数量超过订单库存',
          icon: 'none'
        })
        return
      }
      
      // 添加到交货列表
      this.deliveryItems.push({
        order: selectedOrder,
        color: this.deliveryInfo.color,
        size: this.deliveryInfo.size,
        quantity: this.deliveryInfo.quantity,
        remark: this.deliveryInfo.remark
      })
      
      // 重置交货信息
      this.deliveryInfo = {
        color: '',
        size: '',
        quantity: 0,
        remark: ''
      }
      
      uni.showToast({
        title: '交货添加成功',
        icon: 'success'
      })
    },
    // 删除交货项
    deleteDeliveryItem(index) {
      this.deliveryItems.splice(index, 1)
      uni.showToast({
        title: '交货删除成功',
        icon: 'success'
      })
    },
    // 提交交货
    submitDelivery() {
      if (this.deliveryItems.length === 0) {
        uni.showToast({
          title: '请至少添加一项交货',
          icon: 'none'
        })
        return
      }
      
      // 处理交货，扣除订单库存
      this.deliveryItems.forEach(item => {
        if (this.orderInventory[item.order] >= item.quantity) {
          this.orderInventory[item.order] -= item.quantity
        }
      })
      
      // 保存交货信息到本地存储
      const today = new Date().toISOString().split('T')[0]
      const deliveries = uni.getStorageSync('deliveries') || {}
      if (!deliveries[today]) {
        deliveries[today] = []
      }
      deliveries[today] = deliveries[today].concat(this.deliveryItems)
      uni.setStorageSync('deliveries', deliveries)
      
      // 保存订单库存到本地存储
      uni.setStorageSync('orderInventory', this.orderInventory)
      
      // 重置表单
      this.deliveryItems = []
      this.deliveryInfo = {
        color: '',
        size: '',
        quantity: 0,
        remark: ''
      }
      
      uni.showToast({
        title: '交货提交成功，已自动扣除订单数量',
        icon: 'success'
      })
    },
    // 导出交货明细
    exportDeliveryDetails() {
      const deliveries = uni.getStorageSync('deliveries') || {}
      let exportData = '日期,订单,颜色,尺码,数量,备注\n'
      
      // 遍历所有日期的交货记录
      Object.keys(deliveries).forEach(date => {
        deliveries[date].forEach(item => {
          exportData += `${date},${item.order},${item.color},${item.size},${item.quantity},${item.remark || ''}\n`
        })
      })
      
      // 创建导出文件
      const fileName = `交货明细_${new Date().toISOString().split('T')[0]}.csv`
      
      // 在H5环境下，直接下载
      if (typeof window !== 'undefined') {
        const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', fileName)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          uni.showToast({
            title: '导出成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      } else {
        // 在小程序环境下，提示用户
        uni.showToast({
          title: '导出功能仅在H5环境可用',
          icon: 'none'
        })
      }
    },
    // 加载订单
    loadOrders() {
      const orders = uni.getStorageSync('orders') || []
      const userInfo = uni.getStorageSync('userInfo') || {}
      
      let filteredOrders = []
      
      if (userInfo.role === '厂长') {
        // 厂长只能看到自己产线的订单
        const users = uni.getStorageSync('users') || []
        const currentUser = users.find(u => u.username === userInfo.username)
        
        if (currentUser && currentUser.productionLines && currentUser.productionLines.length > 0) {
          filteredOrders = orders.filter(order => 
            currentUser.productionLines.includes(order.productionLine)
          )
        }
      } else {
        // 企业用户可以看到所有订单
        filteredOrders = orders
      }
      
      // 如果没有订单，使用默认数据
      if (filteredOrders.length === 0) {
        filteredOrders = [
          { id: 1, styleNumber: '订单1', productionLine: '产线1' },
          { id: 2, styleNumber: '订单2', productionLine: '产线2' },
          { id: 3, styleNumber: '订单3', productionLine: '产线1' },
          { id: 4, styleNumber: '订单4', productionLine: '产线3' },
          { id: 5, styleNumber: '订单5', productionLine: '产线2' }
        ]
      }
      
      this.fullOrders = filteredOrders
      this.orders = filteredOrders.map(order => order.styleNumber || `订单${order.id}`)
    }
  },
  onLoad() {
    // 加载订单数据
    this.loadOrders()
    
    // 从本地存储加载订单库存
    const savedInventory = uni.getStorageSync('orderInventory')
    if (savedInventory) {
      this.orderInventory = savedInventory
    } else {
      // 初始化默认库存
      this.orderInventory = {
        '订单1': 100,
        '订单2': 150,
        '订单3': 80,
        '订单4': 200,
        '订单5': 120
      }
    }
  }
}
</script>

<style scoped>
.delivery-container {
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

.delivery-section {
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

/* 颜色汇总样式 */
.summary-list {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-color {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.summary-quantity {
  font-size: 26rpx;
  color: #4A90E2;
  font-weight: bold;
}

.delivery-form {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
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

.add-btn {
  width: 100%;
  height: 70rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  border-radius: 10rpx;
  margin-top: 10rpx;
}

/* 导出按钮样式 */
.export-btn {
  width: 100%;
  height: 70rpx;
  background-color: #50E3C2;
  color: #fff;
  font-size: 24rpx;
  border-radius: 10rpx;
}

.delivery-list {
  margin-top: 10rpx;
}

.delivery-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.delivery-order {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.delivery-details {
  margin-bottom: 15rpx;
}

.delivery-details text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.delete-btn {
  width: 100%;
  height: 60rpx;
  background-color: #fff1f0;
  color: #ff4d4f;
  font-size: 22rpx;
  border-radius: 10rpx;
  margin-top: 10rpx;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

.footer {
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

.submit-btn {
  width: 100%;
  height: 40rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 28rpx;
  border-radius: 10rpx;
  font-weight: bold;
}
</style>