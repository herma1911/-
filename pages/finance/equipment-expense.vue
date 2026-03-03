<template>
  <view class="equipment-expense-container">
    <view class="header">
      <text class="title">设备支出</text>
    </view>
    
    <view class="expense-form">
      <view class="form-item">
        <text class="form-label">设备名称：</text>
        <input type="text" v-model="equipmentInfo.name" placeholder="请输入设备名称" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">数量：</text>
        <input type="number" v-model.number="equipmentInfo.quantity" placeholder="请输入数量" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">单价：</text>
        <input type="number" v-model.number="equipmentInfo.unitPrice" placeholder="请输入单价" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">金额：</text>
        <text class="form-value">¥{{ totalAmount }}</text>
      </view>
      <view class="form-item">
        <text class="form-label">购买日期：</text>
        <picker mode="date" :value="equipmentInfo.date" start="2023-01-01" end="2026-12-31" @change="dateChange">
          <view class="picker">
            {{ equipmentInfo.date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">备注：</text>
        <input type="text" v-model="equipmentInfo.remark" placeholder="请输入备注（选填）" class="form-input" />
      </view>
      <button class="submit-btn" @click="submit">提交</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      equipmentInfo: {
        name: '',
        quantity: 1,
        unitPrice: 0,
        date: '',
        remark: ''
      }
    }
  },
  computed: {
    totalAmount() {
      return (this.equipmentInfo.quantity * this.equipmentInfo.unitPrice).toFixed(2)
    }
  },
  methods: {
    dateChange(e) {
      this.equipmentInfo.date = e.detail.value
    },
    submit() {
      if (!this.equipmentInfo.name || !this.equipmentInfo.quantity || !this.equipmentInfo.unitPrice || !this.equipmentInfo.date) {
        uni.showToast({
          title: '请填写完整的设备信息',
          icon: 'none'
        })
        return
      }
      
      // 保存设备支出信息到本地存储
      const expenses = uni.getStorageSync('expenses') || []
      const newExpense = {
        id: Date.now(),
        category: '设备支出',
        name: this.equipmentInfo.name,
        quantity: this.equipmentInfo.quantity,
        unitPrice: this.equipmentInfo.unitPrice,
        amount: parseFloat(this.totalAmount),
        date: this.equipmentInfo.date,
        remark: this.equipmentInfo.remark
      }
      expenses.push(newExpense)
      uni.setStorageSync('expenses', expenses)
      
      // 保存到设备支出专用存储
      const equipmentExpenses = uni.getStorageSync('equipmentExpenses') || []
      equipmentExpenses.push(newExpense)
      uni.setStorageSync('equipmentExpenses', equipmentExpenses)
      
      uni.showToast({
        title: '设备支出添加成功',
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
.equipment-expense-container {
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

.expense-form {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
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

.submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 28rpx;
  border-radius: 10rpx;
  margin-top: 20rpx;
}
</style>