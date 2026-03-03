<template>
  <view class="resignation-apply-container">
    <view class="header">
      <text class="title">离职申请</text>
    </view>
    
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">离职原因</text>
        <textarea v-model="resignationReason" placeholder="请输入离职原因" class="form-textarea" />
      </view>
      
      <view class="form-item">
        <text class="form-label">期望离职日期</text>
        <picker mode="date" :value="expectedDate" @change="dateChange" class="form-picker">
          <view class="picker-content">{{ expectedDate }}</view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea v-model="notes" placeholder="请输入备注信息（选填）" class="form-textarea" />
      </view>
    </view>
    
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitResignation">提交申请</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      resignationReason: '',
      expectedDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  },
  methods: {
    dateChange(e) {
      this.expectedDate = e.detail.value
    },
    submitResignation() {
      if (!this.resignationReason.trim()) {
        uni.showToast({
          title: '请输入离职原因',
          icon: 'none'
        })
        return
      }
      
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      const userId = userInfo.phone || userInfo.username
      
      // 创建离职申请
      const newResignation = {
        id: Date.now(),
        employeeId: userId,
        employeeName: userInfo.username || '未知用户',
        type: '主动离职',
        status: 'pending',
        applyDate: new Date().toISOString(),
        expectedDate: this.expectedDate,
        resignationReason: this.resignationReason,
        notes: this.notes
      }
      
      // 保存到本地存储
      const departureRequests = uni.getStorageSync('departureRequests') || []
      departureRequests.push(newResignation)
      uni.setStorageSync('departureRequests', departureRequests)
      
      uni.showToast({
        title: '离职申请提交成功，等待工厂确认',
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
.resignation-apply-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.form-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 15rpx;
  font-size: 24rpx;
  min-height: 200rpx;
  background-color: #f9f9f9;
  resize: none;
}

.form-picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.picker-content {
  color: #666;
}

.button-section {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
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