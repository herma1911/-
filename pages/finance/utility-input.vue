<template>
  <view class="utility-input-container">
    <view class="form-section">
      <text class="form-title">水电费用输入</text>
      <view class="form-item">
        <text class="form-label">费用类型</text>
        <view class="type-selector">
          <button 
            :class="['type-btn', { active: utilityInfo.type === 'water' }]" 
            @click="utilityInfo.type = 'water'"
          >
            水费
          </button>
          <button 
            :class="['type-btn', { active: utilityInfo.type === 'electricity' }]" 
            @click="utilityInfo.type = 'electricity'"
          >
            电费
          </button>
          <button 
            :class="['type-btn', { active: utilityInfo.type === 'both' }]" 
            @click="utilityInfo.type = 'both'"
          >
            水电费
          </button>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">金额</text>
        <input type="number" v-model.number="utilityInfo.amount" placeholder="请输入费用金额" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">月份</text>
        <picker mode="date" fields="month" :value="utilityInfo.month" start="2023-01" end="2027-12" @change="bindMonthChange">
          <view class="date-picker">{{utilityInfo.month}}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea v-model="utilityInfo.remark" placeholder="请输入备注信息" class="form-textarea" />
      </view>
    </view>
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitUtility">提交</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      utilityInfo: {
        type: 'both',
        amount: 0,
        month: new Date().toISOString().substring(0, 7),
        remark: ''
      }
    }
  },
  methods: {
    bindMonthChange(e) {
      this.utilityInfo.month = e.detail.value
    },
    submitUtility() {
      if (!this.utilityInfo.amount || this.utilityInfo.amount <= 0) {
        uni.showToast({
          title: '请输入有效的费用金额',
          icon: 'none'
        })
        return
      }
      
      // 获取费用类型文本
      let typeText = '水电费'
      if (this.utilityInfo.type === 'water') {
        typeText = '水费'
      } else if (this.utilityInfo.type === 'electricity') {
        typeText = '电费'
      }
      
      // 将水电费用保存为普通支出
      const expenseData = {
        date: this.utilityInfo.month + '-01',
        amount: this.utilityInfo.amount,
        category: typeText,
        remark: `月份: ${this.utilityInfo.month}${this.utilityInfo.remark ? ', ' + this.utilityInfo.remark : ''}`,
        createTime: new Date().toISOString()
      }
      
      // 保存到本地存储
      let expenses = uni.getStorageSync('expenses') || []
      expenses.push(expenseData)
      uni.setStorageSync('expenses', expenses)
      
      // 保存水电费用特定信息
      const utilityInfo = {
        type: this.utilityInfo.type,
        amount: this.utilityInfo.amount,
        month: this.utilityInfo.month,
        remark: this.utilityInfo.remark,
        createTime: new Date().toISOString()
      }
      let utilityExpenses = uni.getStorageSync('utilityExpenses') || []
      utilityExpenses.push(utilityInfo)
      uni.setStorageSync('utilityExpenses', utilityExpenses)
      
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    },
    cancel() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.utility-input-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
  text-align: center;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  min-height: 150rpx;
}

.date-picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.type-selector {
  display: flex;
  gap: 10rpx;
}

.type-btn {
  flex: 1;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  color: #333;
}

.type-btn.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.button-section {
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
}

.submit-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #1890ff;
}

.cancel-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}
</style>