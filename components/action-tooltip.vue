<template>
  <view v-if="showTooltip" class="tooltip-container" :style="tooltipStyle">
    <view class="tooltip-content">
      <text class="tooltip-text">{{text}}</text>
      <view class="tooltip-arrow" :class="position"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: 'top',
      validator: function(value) {
        return ['top', 'bottom', 'left', 'right'].indexOf(value) !== -1
      }
    },
    targetElement: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showTooltip: false,
      tooltipStyle: {}
    }
  },
  watch: {
    show(newVal) {
      this.showTooltip = newVal
      if (newVal && this.targetElement) {
        this.calculatePosition()
      }
    }
  },
  methods: {
    calculatePosition() {
      if (!this.targetElement) return
      
      // 简化处理，实际项目中需要获取目标元素的位置和尺寸
      // 这里使用固定位置作为示例
      switch (this.position) {
        case 'top':
          this.tooltipStyle = {
            position: 'fixed',
            top: '100rpx',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998
          }
          break
        case 'bottom':
          this.tooltipStyle = {
            position: 'fixed',
            bottom: '100rpx',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998
          }
          break
        case 'left':
          this.tooltipStyle = {
            position: 'fixed',
            top: '50%',
            left: '50rpx',
            transform: 'translateY(-50%)',
            zIndex: 9998
          }
          break
        case 'right':
          this.tooltipStyle = {
            position: 'fixed',
            top: '50%',
            right: '50rpx',
            transform: 'translateY(-50%)',
            zIndex: 9998
          }
          break
      }
    },
    closeTooltip() {
      this.showTooltip = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.tooltip-container {
  pointer-events: none;
}

.tooltip-content {
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  max-width: 200rpx;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.tooltip-text {
  font-size: 14sp;
  line-height: 1.4;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 8rpx solid transparent;
}

.tooltip-arrow.top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(0, 0, 0, 0.8);
  border-bottom: none;
}

.tooltip-arrow.bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(0, 0, 0, 0.8);
  border-top: none;
}

.tooltip-arrow.left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: rgba(0, 0, 0, 0.8);
  border-right: none;
}

.tooltip-arrow.right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(0, 0, 0, 0.8);
  border-left: none;
}
</style>