<template>
  <view class="fixed-expense-input-container">
    <view class="form-section">
      <text class="form-title">月固定费用输入</text>
      <view class="form-item">
        <text class="form-label">费用类型</text>
        <picker :value="expenseTypeIndex" :range="expenseTypes" @change="bindExpenseTypeChange">
          <view class="picker">{{ expenseTypes[expenseTypeIndex] }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">金额</text>
        <input type="number" v-model.number="fixedExpenseInfo.amount" placeholder="请输入费用金额" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">月份</text>
        <picker mode="date" fields="month" :value="fixedExpenseInfo.month" start="2023-01" end="2027-12" @change="bindMonthChange">
          <view class="date-picker">{{fixedExpenseInfo.month}}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea v-model="fixedExpenseInfo.remark" placeholder="请输入备注信息" class="form-textarea" />
      </view>
    </view>
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitFixedExpense">提交</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      expenseTypes: ['水电费', '伙食费', '物业费', '网费', '其他固定费用'],
      expenseTypeIndex: 0,
      fixedExpenseInfo: {
        amount: 0,
        month: new Date().toISOString().substring(0, 7),
        remark: ''
      }
    }
  },
  methods: {
    bindExpenseTypeChange(e) {
      this.expenseTypeIndex = e.detail.value
    },
    bindMonthChange(e) {
      this.fixedExpenseInfo.month = e.detail.value
    },
    submitFixedExpense() {
      if (!this.fixedExpenseInfo.amount || this.fixedExpenseInfo.amount <= 0) {
        uni.showToast({
          title: '请输入有效的费用金额',
          icon: 'none'
        })
        return
      }
      
      // 将固定费用保存为普通支出
      const expenseData = {
        date: this.fixedExpenseInfo.month + '-01',
        amount: this.fixedExpenseInfo.amount,
        category: this.expenseTypes[this.expenseTypeIndex],
        remark: `月份: ${this.fixedExpenseInfo.month}${this.fixedExpenseInfo.remark ? ', ' + this.fixedExpenseInfo.remark : ''}`,
        createTime: new Date().toISOString()
      }
      
      // 保存到本地存储
      let expenses = uni.getStorageSync('expenses') || []
      expenses.push(expenseData)
      uni.setStorageSync('expenses', expenses)
      
      // 保存固定费用特定信息
      const fixedExpenseInfo = {
        type: this.expenseTypes[this.expenseTypeIndex],
        amount: this.fixedExpenseInfo.amount,
        month: this.fixedExpenseInfo.month,
        remark: this.fixedExpenseInfo.remark,
        createTime: new Date().toISOString()
      }
      let fixedExpenses = uni.getStorageSync('fixedExpenses') || []
      fixedExpenses.push(fixedExpenseInfo)
      uni.setStorageSync('fixedExpenses', fixedExpenses)
      
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
.fixed-expense-input-container {
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

.picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.date-picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.form-switch {
  transform: scale(1.2);
}

.switch-text {
  font-size: 24rpx;
  color: #666;
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
  background-color: #4A90E2;
}

.cancel-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}
</style>