<template>
  <view class="quantity-input-container">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <view class="top-actions">
        <button class="action-btn">备注</button>
        <button class="action-btn">标签</button>
      </view>
      <button class="save-and-add-btn" @click="saveAndAddMore">+ 保存并再记一笔</button>
    </view>
    
    <!-- 输入显示区域 -->
    <view class="input-display">
      <text class="input-value">{{inputValue}}</text>
    </view>
    
    <!-- 数字键盘 -->
    <view class="numeric-keypad">
      <view class="keypad-row">
        <button class="keypad-btn operator" @click="handleOperator('+')">+</button>
        <button class="keypad-btn number" @click="handleNumber('1')">1</button>
        <button class="keypad-btn number" @click="handleNumber('2')">2</button>
        <button class="keypad-btn number" @click="handleNumber('3')">3</button>
        <button class="keypad-btn clear" @click="handleClear">×</button>
      </view>
      <view class="keypad-row">
        <button class="keypad-btn operator" @click="handleOperator('-')">-</button>
        <button class="keypad-btn number" @click="handleNumber('4')">4</button>
        <button class="keypad-btn number" @click="handleNumber('5')">5</button>
        <button class="keypad-btn number" @click="handleNumber('6')">6</button>
        <button class="keypad-btn empty"></button>
      </view>
      <view class="keypad-row">
        <button class="keypad-btn operator" @click="handleOperator('×')">×</button>
        <button class="keypad-btn number" @click="handleNumber('7')">7</button>
        <button class="keypad-btn number" @click="handleNumber('8')">8</button>
        <button class="keypad-btn number" @click="handleNumber('9')">9</button>
        <button class="keypad-btn save" @click="save">保存</button>
      </view>
      <view class="keypad-row">
        <button class="keypad-btn operator" @click="handleOperator('÷')">÷</button>
        <button class="keypad-btn clear" @click="handleClearAll">清除</button>
        <button class="keypad-btn number" @click="handleNumber('0')">0</button>
        <button class="keypad-btn operator" @click="handleDecimal()">·</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inputValue: '0',
      styleIndex: 0,
      processIndex: 0
    }
  },
  onLoad(options) {
    // 获取事件通道
    const eventChannel = this.getOpenerEventChannel()
    // 监听来自首页的事件，获取当前数量值和索引
    eventChannel.on('setQuantity', (data) => {
      if (data.quantity) {
        this.inputValue = data.quantity.toString()
      }
      this.styleIndex = data.styleIndex || 0
      this.processIndex = data.processIndex || 0
    })
  },
  methods: {
    handleNumber(number) {
      if (this.inputValue === '0') {
        this.inputValue = number
      } else {
        this.inputValue += number
      }
    },
    handleOperator(operator) {
      // 简单的运算符处理，实际应用中可能需要更复杂的计算逻辑
      this.inputValue += operator
    },
    handleDecimal() {
      if (!this.inputValue.includes('.')) {
        this.inputValue += '.'
      }
    },
    handleClear() {
      // 删除最后一个字符
      if (this.inputValue.length > 1) {
        this.inputValue = this.inputValue.slice(0, -1)
      } else {
        this.inputValue = '0'
      }
    },
    handleClearAll() {
      this.inputValue = '0'
    },
    save() {
      // 保存数量并返回结果
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('quantitySelected', {
        quantity: this.inputValue
      })
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      // 保存后返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    },
    saveAndAddMore() {
      // 保存数量并返回结果
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('quantitySelected', {
        quantity: this.inputValue
      })
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      // 清空输入，准备再次输入
      setTimeout(() => {
        this.inputValue = '0'
      }, 1000)
    }
  }
}
</script>

<style scoped>
.quantity-input-container {
  height: 100vh;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  display: flex;
  flex-direction: column;
  padding: 20rpx;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.top-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.save-and-add-btn {
  padding: 12rpx 25rpx;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 5rpx;
}

.input-display {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  text-align: right;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.input-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
}

.numeric-keypad {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.keypad-row {
  display: flex;
  gap: 15rpx;
  flex: 1;
}

.keypad-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15rpx;
  border: none;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.keypad-btn:active {
  transform: scale(0.95);
}

.keypad-btn.number {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.keypad-btn.operator {
  background: rgba(255, 255, 255, 0.8);
  color: #4A90E2;
}

.keypad-btn.clear {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.keypad-btn.save {
  background: #4A90E2;
  color: #fff;
  font-size: 28rpx;
}

.keypad-btn.empty {
  background: transparent;
}
</style>