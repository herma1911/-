<template>
  <view class="process-split-container">
    <view class="order-info">
      <text class="order-number">款号: {{orderInfo.styleNumber}}</text>
      <text class="order-price">车缝总价: ¥{{orderInfo.totalPrice}}/件</text>
    </view>
    
    <view class="process-form">
      <text class="form-title">工序列表</text>
      <view v-for="(process, index) in processes" :key="index" class="process-item">
        <input type="text" v-model="process.name" placeholder="工序名称" placeholder-class="placeholder" />
        <input type="number" v-model.number="process.price" placeholder="金额" placeholder-class="placeholder" @input="calculateTotal" />
        <button class="remove-btn" @click="removeProcess(index)">-</button>
      </view>
      <button class="add-process-btn" @click="addProcess">+ 添加工序</button>
    </view>
    
    <view class="summary">
      <view class="summary-item">
        <text class="summary-label">拆分总价:</text>
        <text class="summary-value">¥{{splitTotal}}/件</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">差异:</text>
        <text class="summary-value" :class="diff > 0 ? 'diff-positive' : 'diff-negative'">
          {{diff > 0 ? '+' : ''}}¥{{diff}}
        </text>
      </view>
    </view>
    
    <view class="action-buttons">
      <button class="action-btn download-btn" @click="downloadTemplate">下载模板</button>
      <button class="action-btn submit-btn" @click="submitSplit">提交拆分</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderInfo: {
        id: 1,
        styleNumber: '款号A',
        totalPrice: 100
      },
      processes: [
        { name: 'A工序', price: 0 },
        { name: 'B工序', price: 0 },
        { name: 'C工序', price: 0 }
      ],
      splitTotal: 0,
      diff: 0
    }
  },
  onLoad(options) {
    console.log('订单ID:', options.id)
    // 实际项目中，这里会根据options.id获取订单详情
  },
  methods: {
    addProcess() {
      this.processes.push({ name: '', price: 0 })
    },
    removeProcess(index) {
      if (this.processes.length > 1) {
        this.processes.splice(index, 1)
        this.calculateTotal()
      }
    },
    calculateTotal() {
      this.splitTotal = this.processes.reduce((total, process) => {
        return total + (process.price || 0)
      }, 0)
      this.diff = this.splitTotal - this.orderInfo.totalPrice
    },
    downloadTemplate() {
      uni.showToast({
        title: '模板下载功能开发中',
        icon: 'none'
      })
    },
    submitSplit() {
      // 验证所有工序都已填写
      const emptyProcess = this.processes.find(p => !p.name || !p.price)
      if (emptyProcess) {
        uni.showToast({
          title: '请填写所有工序名称和金额',
          icon: 'none'
        })
        return
      }
      
      // 提交拆分
      uni.showModal({
        title: '提交拆分',
        content: `拆分总价: ¥${this.splitTotal}/件\n差异: ${this.diff > 0 ? '+' : ''}¥${this.diff}\n是否提交?`,
        confirmText: '提交',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 实际项目中，这里会提交拆分数据
            if (this.diff !== 0) {
              uni.showToast({
                title: '拆分总价与车缝总价不一致，请检查',
                icon: 'none'
              })
            } else {
              uni.showToast({
                title: '提交成功',
                icon: 'success'
              })
              setTimeout(() => {
                uni.navigateBack()
              }, 1000)
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.process-split-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.order-info {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-number,
.order-price {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
}

.process-form {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
  display: block;
}

.process-item {
  display: flex;
  margin-bottom: 15rpx;
  align-items: center;
}

.process-item input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.process-item input:first-child {
  flex: 2;
}

.remove-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  font-size: 32rpx;
  line-height: 60rpx;
  background-color: #ff4d4f;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-process-btn {
  width: 100%;
  height: 80rpx;
  border: 2rpx dashed #4A90E2;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #4A90E2;
  background-color: #fff;
  margin-top: 10rpx;
}

.summary {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.summary-label {
  font-size: 28rpx;
  color: #333;
}

.summary-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
}

.diff-positive {
  color: #52c41a;
}

.diff-negative {
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.download-btn {
  background-color: #fff;
  color: #4A90E2;
  border: 2rpx solid #4A90E2;
}

.submit-btn {
  background-color: #4A90E2;
  color: #fff;
}

.placeholder {
  color: #999;
}
</style>