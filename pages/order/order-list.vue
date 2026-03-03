<template>
  <view class="order-list-container">
    <view class="header">
      <text class="title">订单列表</text>
      <button class="add-btn" @click="addOrder">+ 新增订单</button>
    </view>
    <view class="search-bar">
      <input type="text" v-model="searchKeyword" placeholder="搜索款号" placeholder-class="placeholder" />
      <button class="search-btn" @click="search">搜索</button>
    </view>
    <view class="order-list">
      <view v-for="order in filteredOrders" :key="order.id" class="order-item" @click="viewOrderDetail(order.id)">
        <view class="order-info">
          <text class="order-number">款号: {{order.styleNumber}}</text>
          <text class="order-price">¥{{order.totalPrice}}/件</text>
        </view>
        <view class="order-details">
          <text class="detail-text">数量: {{order.quantity}}件</text>
          <text class="detail-text">建议上线: {{order.suggestedStartTime || '未设置'}}</text>
          <text class="detail-text">实际上线: {{order.actualStartTime || '未开始'}}</text>
          <text class="detail-text">实际下线: {{order.actualEndTime || '未完成'}}</text>
          <text class="detail-text">生产产线: {{order.productionLine || '未分配'}}</text>
        </view>
        <view class="order-status">
          <text class="status-text">{{order.status}}</text>
        </view>
        <view class="order-actions">
          <button class="action-btn split-btn" @click.stop="splitProcess(order.id)">拆分工序</button>
          <button class="action-btn detail-btn" @click.stop="viewOrderDetail(order.id)">查看详情</button>
          <button class="action-btn progress-btn" @click.stop="viewOrderProgress(order.id)">查看进度</button>
          <button class="action-btn line-btn" @click.stop="changeProductionLine(order.id)">变更产线</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      orders: []
    }
  },
  onLoad() {
    this.loadOrders()
  },
  methods: {
    loadOrders() {
      const savedOrders = uni.getStorageSync('orders') || []
      if (savedOrders.length > 0) {
        this.orders = savedOrders
      } else {
        // 如果没有保存的订单，使用默认订单数据
        this.orders = [
          {
            id: 1,
            styleNumber: '款号A',
            totalPrice: 100,
            status: '待拆分',
            quantity: 1000,
            suggestedStartTime: '2026-02-20',
            actualStartTime: '',
            actualEndTime: ''
          },
          {
            id: 2,
            styleNumber: '款号B',
            totalPrice: 120,
            status: '已拆分',
            quantity: 1500,
            suggestedStartTime: '2026-02-22',
            actualStartTime: '2026-02-22',
            actualEndTime: ''
          },
          {
            id: 3,
            styleNumber: '款号C',
            totalPrice: 80,
            status: '待审批',
            quantity: 800,
            suggestedStartTime: '2026-02-25',
            actualStartTime: '',
            actualEndTime: ''
          }
        ]
      }
    },
    addOrder() {
      uni.navigateTo({
        url: 'order-add'
      })
    },
    search() {
      // 搜索逻辑
    },
    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: 'order-detail?id=' + orderId
      })
    },
    splitProcess(orderId) {
      uni.navigateTo({
        url: 'process-split?id=' + orderId
      })
    },
    viewOrderProgress(orderId) {
      uni.navigateTo({
        url: 'order-progress?id=' + orderId
      })
    },
    changeProductionLine(orderId) {
      // 加载产线数据
      const productionLines = uni.getStorageSync('productionLines') || []
      const lineNames = productionLines.map(line => line.name)
      
      if (lineNames.length === 0) {
        uni.showToast({
          title: '暂无产线数据，请先添加产线',
          icon: 'none'
        })
        return
      }
      
      // 显示产线选择器
      uni.showActionSheet({
        itemList: lineNames,
        success: (res) => {
          const selectedLine = lineNames[res.tapIndex]
          
          // 更新订单产线
          const orders = uni.getStorageSync('orders') || []
          const updatedOrders = orders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                productionLine: selectedLine
              }
            }
            return order
          })
          
          uni.setStorageSync('orders', updatedOrders)
          this.loadOrders() // 重新加载订单数据
          
          uni.showToast({
            title: '产线变更成功',
            icon: 'success'
          })
        }
      })
    }
  },
  computed: {
    filteredOrders() {
      let result = this.orders
      
      // 搜索过滤
      if (this.searchKeyword) {
        result = result.filter(order => 
          order.styleNumber.includes(this.searchKeyword)
        )
      }
      
      // 厂长产线过滤
      const userInfo = uni.getStorageSync('userInfo') || {}
      if (userInfo.role === '厂长') {
        const users = uni.getStorageSync('users') || []
        const currentUser = users.find(u => u.username === userInfo.username)
        
        if (currentUser && currentUser.productionLines && currentUser.productionLines.length > 0) {
          result = result.filter(order => 
            currentUser.productionLines.includes(order.productionLine)
          )
        }
      }
      
      return result
    }
  }
}
</script>

<style scoped>
.order-list-container {
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
}

.search-bar {
  display: flex;
  margin-bottom: 20rpx;
}

.search-bar input {
  flex: 1;
  height: 70rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.placeholder {
  color: #999;
}

.search-btn {
  background-color: #f0f0f0;
  color: #333;
  font-size: 24rpx;
  padding: 0 30rpx;
  border-radius: 10rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.order-number {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.order-price {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: bold;
}

.order-details {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.order-status {
  margin-bottom: 15rpx;
}

.status-text {
  font-size: 24rpx;
  color: #666;
  padding: 5rpx 15rpx;
  background-color: #f0f0f0;
  border-radius: 20rpx;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10rpx;
}

.action-btn {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
}

.split-btn {
  background-color: #4A90E2;
  color: #fff;
}

.detail-btn {
  background-color: #f0f0f0;
  color: #333;
}

.progress-btn {
  background-color: #52c41a;
  color: #fff;
}

.line-btn {
  background-color: #faad14;
  color: #fff;
}
</style>