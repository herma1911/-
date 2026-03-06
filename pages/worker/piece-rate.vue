<template>
  <view class="piece-rate-container">
    <view class="header">
      <button class="back-button" @click="goBack">返回</button>
      <text class="title">工人计件</text>
    </view>
    
    <view class="search-section">
      <input type="text" v-model="searchKeyword" placeholder="搜索工人姓名" class="search-input" />
      <button type="default" class="search-button" @click="search">搜索</button>
    </view>
    
    <view class="worker-list">
      <view v-for="(worker, index) in workerList" :key="index" class="worker-item">
        <view class="worker-info">
          <text class="worker-name">{{worker.name}}</text>
          <text class="worker-id">ID: {{worker.id}}</text>
        </view>
        <view class="piece-rate-form">
          <view class="form-item">
            <text class="form-label">工序:</text>
            <input type="text" v-model="worker.process" placeholder="请输入工序" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">数量:</text>
            <input type="number" v-model.number="worker.quantity" placeholder="请输入数量" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">单价:</text>
            <input type="number" v-model.number="worker.unitPrice" placeholder="请输入单价" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">金额:</text>
            <text class="amount-value">{{calculateAmount(worker)}}</text>
          </view>
        </view>
        <button class="submit-button" @click="submitPieceRate(worker)">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
import { addToCandidatePool } from '../../utils/process-word-library.js'

export default {
  data() {
    return {
      searchKeyword: '',
      workerList: [
        {
          id: 1,
          name: '张三',
          process: '',
          quantity: 0,
          unitPrice: 0
        },
        {
          id: 2,
          name: '李四',
          process: '',
          quantity: 0,
          unitPrice: 0
        },
        {
          id: 3,
          name: '王五',
          process: '',
          quantity: 0,
          unitPrice: 0
        }
      ]
    }
  },
  methods: {
    search() {
      // 这里可以根据关键词搜索工人
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      })
    },
    calculateAmount(worker) {
      return (worker.quantity * worker.unitPrice).toFixed(2)
    },
    goBack() {
      uni.navigateBack()
    },
    
    submitPieceRate(worker) {
      if (!worker.process || worker.quantity <= 0 || worker.unitPrice <= 0) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      // 将工序名添加到词库候选池
      addToCandidatePool(worker.process)
      
      uni.showModal({
        title: '确认提交',
        content: `确认提交 ${worker.name} 的计件数据？\n工序: ${worker.process}\n数量: ${worker.quantity}\n单价: ${worker.unitPrice}\n金额: ${this.calculateAmount(worker)}`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '提交成功',
              icon: 'success'
            })
            // 清空表单
            worker.process = ''
            worker.quantity = 0
            worker.unitPrice = 0
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.piece-rate-container {
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
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-button {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 28rpx;
  color: #4A90E2;
  padding: 10rpx;
  min-height: 0;
  height: auto;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.search-section {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.search-button {
  padding: 0 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.worker-list {
  gap: 15rpx;
}

.worker-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.worker-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.worker-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.worker-id {
  font-size: 24rpx;
  color: #666;
}

.piece-rate-form {
  margin-bottom: 15rpx;
}

.form-item {
  display: flex;
  margin-bottom: 15rpx;
  align-items: center;
}

.form-label {
  font-size: 24rpx;
  color: #666;
  width: 100rpx;
}

.form-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.amount-value {
  font-size: 24rpx;
  color: #4A90E2;
  font-weight: bold;
}

.submit-button {
  width: 100%;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #4A90E2;
  color: #fff;
  margin-top: 10rpx;
}
</style>