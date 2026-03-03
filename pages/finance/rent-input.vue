<template>
  <view class="rent-input-container">
    <view class="form-section">
      <text class="form-title">房租费用输入</text>
      <view class="form-item">
        <text class="form-label">金额</text>
        <input type="number" v-model.number="rentInfo.amount" placeholder="请输入房租金额" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">租期</text>
        <view class="date-range">
          <picker mode="date" fields="month" :value="rentInfo.startDate" start="2023-01" end="2027-12" @change="bindStartDateChange">
            <view class="date-picker">{{rentInfo.startDate}}</view>
          </picker>
          <text class="date-separator">至</text>
          <picker mode="date" fields="month" :value="rentInfo.endDate" start="2023-01" end="2027-12" @change="bindEndDateChange">
            <view class="date-picker">{{rentInfo.endDate}}</view>
          </picker>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">下次交房租月份</text>
        <picker mode="date" fields="month" :value="rentInfo.nextPaymentDate" start="2023-01" end="2027-12" @change="bindNextPaymentDateChange">
          <view class="date-picker">{{rentInfo.nextPaymentDate}}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea v-model="rentInfo.remark" placeholder="请输入备注信息" class="form-textarea" />
      </view>
      <view class="form-item">
        <text class="form-label">是否分摊到每月</text>
        <view class="switch-container">
          <switch :checked="rentInfo.splitToMonthly" @change="(e) => rentInfo.splitToMonthly = e.detail.value" class="form-switch" />
          <text class="switch-text">{{rentInfo.splitToMonthly ? '是' : '否'}}</text>
        </view>
      </view>
    </view>
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitRent">提交</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      rentInfo: {
        amount: 0,
        startDate: new Date().toISOString().substring(0, 7),
        endDate: new Date().toISOString().substring(0, 7),
        nextPaymentDate: new Date().toISOString().substring(0, 7),
        remark: '',
        splitToMonthly: true
      }
    }
  },
  methods: {
    bindStartDateChange(e) {
      this.rentInfo.startDate = e.detail.value
    },
    bindEndDateChange(e) {
      this.rentInfo.endDate = e.detail.value
    },
    bindNextPaymentDateChange(e) {
      this.rentInfo.nextPaymentDate = e.detail.value
    },
    submitRent() {
      if (!this.rentInfo.amount || this.rentInfo.amount <= 0) {
        uni.showToast({
          title: '请输入有效的房租金额',
          icon: 'none'
        })
        return
      }
      
      // 将房租费用保存为普通支出
      const expenseData = {
        date: new Date().toISOString().split('T')[0],
        amount: this.rentInfo.amount,
        category: '房租费',
        remark: `租期: ${this.rentInfo.startDate} 至 ${this.rentInfo.endDate}, 下次交租: ${this.rentInfo.nextPaymentDate}${this.rentInfo.remark ? ', ' + this.rentInfo.remark : ''}`,
        createTime: new Date().toISOString()
      }
      
      // 保存到本地存储
      let expenses = uni.getStorageSync('expenses') || []
      expenses.push(expenseData)
      uni.setStorageSync('expenses', expenses)
      
      // 保存房租特定信息
      const rentInfo = {
        ...this.rentInfo,
        createTime: new Date().toISOString()
      }
      let rentRecords = uni.getStorageSync('rentRecords') || []
      rentRecords.push(rentInfo)
      uni.setStorageSync('rentRecords', rentRecords)
      
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
.rent-input-container {
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

.date-range {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.date-picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  flex: 1;
}

.date-separator {
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