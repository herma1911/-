<template>
  <view class="material-receipt-container">
    <view class="header">
      <text class="title">来料登记管理</text>
    </view>
    
    <view class="receipt-section">
      <text class="section-title">收料信息</text>
      <view class="receipt-form">
        <view class="form-item">
          <text class="form-label">订单选择：</text>
          <picker :value="orderIndex" :range="orders" @change="orderChange">
            <view class="picker">
              {{ orders[orderIndex] }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">收料类型：</text>
          <view class="type-selector">
            <button 
              :class="['type-btn', { active: receiptType === 'cutting' }]" 
              @click="receiptType = 'cutting'"
            >
              裁片
            </button>
            <button 
              :class="['type-btn', { active: receiptType === 'auxiliary' }]" 
              @click="receiptType = 'auxiliary'"
            >
              辅料
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 裁片收料 -->
    <view v-if="receiptType === 'cutting'" class="material-section">
      <text class="section-title">裁片信息</text>
      <view class="cutting-form">
        <view class="form-item">
          <text class="form-label">颜色：</text>
          <input type="text" v-model="cuttingInfo.color" placeholder="请输入颜色" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">尺码：</text>
          <input type="text" v-model="cuttingInfo.size" placeholder="请输入尺码" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">数量：</text>
          <input type="number" v-model.number="cuttingInfo.quantity" placeholder="请输入数量" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">备注：</text>
          <input type="text" v-model="cuttingInfo.remark" placeholder="请输入备注（选填）" class="form-input" />
        </view>
        <button class="add-btn" @click="addCuttingItem">添加裁片</button>
      </view>
    </view>
    
    <!-- 辅料收料 -->
    <view v-if="receiptType === 'auxiliary'" class="material-section">
      <text class="section-title">辅料信息</text>
      <view class="auxiliary-list">
        <view v-for="(item, index) in auxiliaryItems" :key="index" class="auxiliary-item">
          <view class="form-item">
            <text class="form-label">辅料名称：</text>
            <input type="text" v-model="item.name" placeholder="请输入辅料名称" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">数量：</text>
            <input type="number" v-model.number="item.quantity" placeholder="请输入数量" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">单位：</text>
            <input type="text" v-model="item.unit" placeholder="请输入单位" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">备注：</text>
            <input type="text" v-model="item.remark" placeholder="请输入备注（选填）" class="form-input" />
          </view>
          <button class="delete-btn" @click="deleteAuxiliaryItem(index)">删除</button>
        </view>
        <button class="add-btn" @click="addAuxiliaryItem">增加辅料</button>
      </view>
    </view>
    
    <!-- 已添加收料 -->
    <view class="receipt-section">
      <text class="section-title">已添加收料</text>
      <view class="receipt-list">
        <view v-for="(item, index) in receiptItems" :key="index" class="receipt-item">
          <view class="receipt-header">
            <text class="receipt-order">{{item.order}}</text>
            <text class="receipt-type">{{item.type === 'cutting' ? '裁片' : '辅料'}}</text>
          </view>
          <view class="receipt-details">
            <template v-if="item.type === 'cutting'">
              <text>颜色：{{item.color}}</text>
              <text>尺码：{{item.size}}</text>
              <text>数量：{{item.quantity}}</text>
              <text v-if="item.remark">备注：{{item.remark}}</text>
            </template>
            <template v-else>
              <text>辅料：{{item.name}}</text>
              <text>数量：{{item.quantity}}</text>
              <text>单位：{{item.unit}}</text>
              <text v-if="item.remark">备注：{{item.remark}}</text>
            </template>
          </view>
          <button class="delete-receipt-btn" @click="deleteReceiptItem(index)">删除</button>
        </view>
        <view v-if="receiptItems.length === 0" class="empty-state">
          <text>暂无已添加的收料</text>
        </view>
      </view>
    </view>
    
    <!-- 底部提交 -->
    <view class="footer">
      <button class="submit-btn" @click="submitReceipt">确认提交</button>
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
      // 收料类型：cutting（裁片）或 auxiliary（辅料）
      receiptType: 'cutting',
      // 裁片信息
      cuttingInfo: {
        color: '',
        size: '',
        quantity: 0,
        remark: ''
      },
      // 辅料信息
      auxiliaryItems: [
        {
          name: '',
          quantity: 0,
          unit: '',
          remark: ''
        }
      ],
      // 已添加收料
      receiptItems: [],
      // 完整订单数据
      fullOrders: []
    }
  },
  methods: {
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
    },
    // 订单选择
    orderChange(e) {
      this.orderIndex = e.detail.value
    },
    // 添加裁片
    addCuttingItem() {
      if (!this.cuttingInfo.color || !this.cuttingInfo.size || this.cuttingInfo.quantity <= 0) {
        uni.showToast({
          title: '请填写完整的裁片信息',
          icon: 'none'
        })
        return
      }
      
      // 添加到收料列表
      this.receiptItems.push({
        order: this.orders[this.orderIndex],
        type: 'cutting',
        color: this.cuttingInfo.color,
        size: this.cuttingInfo.size,
        quantity: this.cuttingInfo.quantity,
        remark: this.cuttingInfo.remark
      })
      
      // 重置裁片信息
      this.cuttingInfo = {
        color: '',
        size: '',
        quantity: 0,
        remark: ''
      }
      
      uni.showToast({
        title: '裁片添加成功',
        icon: 'success'
      })
    },
    // 增加辅料
    addAuxiliaryItem() {
      this.auxiliaryItems.push({
        name: '',
        quantity: 0,
        unit: '',
        remark: ''
      })
    },
    // 删除辅料
    deleteAuxiliaryItem(index) {
      if (this.auxiliaryItems.length > 1) {
        this.auxiliaryItems.splice(index, 1)
      } else {
        uni.showToast({
          title: '至少保留一项辅料',
          icon: 'none'
        })
      }
    },
    // 添加辅料到收料列表
    addAuxiliaryToReceipt() {
      const validItems = this.auxiliaryItems.filter(item => 
        item.name && item.quantity > 0 && item.unit
      )
      
      if (validItems.length === 0) {
        uni.showToast({
          title: '请填写完整的辅料信息',
          icon: 'none'
        })
        return
      }
      
      // 添加到收料列表
      validItems.forEach(item => {
        this.receiptItems.push({
          order: this.orders[this.orderIndex],
          type: 'auxiliary',
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          remark: item.remark
        })
      })
      
      // 重置辅料信息
      this.auxiliaryItems = [
        {
          name: '',
          quantity: 0,
          unit: '',
          remark: ''
        }
      ]
      
      uni.showToast({
        title: '辅料添加成功',
        icon: 'success'
      })
    },
    // 删除收料项
    deleteReceiptItem(index) {
      this.receiptItems.splice(index, 1)
      uni.showToast({
        title: '收料删除成功',
        icon: 'success'
      })
    },
    // 提交收料
    submitReceipt() {
      if (this.receiptType === 'auxiliary') {
        // 如果当前是辅料类型，先添加辅料
        this.addAuxiliaryToReceipt()
      }
      
      if (this.receiptItems.length === 0) {
        uni.showToast({
          title: '请至少添加一项收料',
          icon: 'none'
        })
        return
      }
      
      // 保存收料信息到本地存储
      const today = new Date().toISOString().split('T')[0]
      const receipts = uni.getStorageSync('materialReceipts') || {}
      if (!receipts[today]) {
        receipts[today] = []
      }
      receipts[today] = receipts[today].concat(this.receiptItems)
      uni.setStorageSync('materialReceipts', receipts)
      
      // 重置表单
      this.receiptItems = []
      this.cuttingInfo = {
        color: '',
        size: '',
        quantity: 0
      }
      this.auxiliaryItems = [
        {
          name: '',
          quantity: 0,
          unit: ''
        }
      ]
      
      uni.showToast({
        title: '收料提交成功',
        icon: 'success'
      })
    }
  },
  onLoad() {
    // 加载订单数据
    this.loadOrders()
  }
}
</script>

<style scoped>
.material-receipt-container {
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

.receipt-section {
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

.receipt-form {
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

.type-selector {
  flex: 1;
  display: flex;
  gap: 10rpx;
}

.type-btn {
  flex: 1;
  height: 70rpx;
  font-size: 24rpx;
  border-radius: 10rpx;
  background-color: #f0f0f0;
  color: #333;
}

.type-btn.active {
  background-color: #4A90E2;
  color: #fff;
}

.material-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.cutting-form {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
}

.auxiliary-list {
  margin-top: 10rpx;
}

.auxiliary-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  border-left: 5rpx solid #4A90E2;
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

.delete-btn {
  width: 100%;
  height: 60rpx;
  background-color: #fff1f0;
  color: #ff4d4f;
  font-size: 22rpx;
  border-radius: 10rpx;
  margin-top: 10rpx;
}

.receipt-list {
  margin-top: 10rpx;
}

.receipt-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.receipt-order {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.receipt-type {
  font-size: 22rpx;
  color: #4A90E2;
  background-color: #e6f7ff;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.receipt-details {
  margin-bottom: 15rpx;
}

.receipt-details text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.delete-receipt-btn {
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