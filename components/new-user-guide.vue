<template>
  <view v-if="showGuide" class="guide-overlay">
    <view class="guide-content">
      <view class="guide-header">
        <text class="guide-title">新手引导</text>
        <button class="close-button" @click="closeGuide">跳过</button>
      </view>
      <view class="guide-slides">
        <view v-for="(slide, index) in guideSlides" :key="index" class="guide-slide" :class="{ active: currentSlide === index }">
          <view class="slide-content">
            <text class="slide-icon">{{slide.icon}}</text>
            <text class="slide-title">{{slide.title}}</text>
            <text class="slide-description">{{slide.description}}</text>
          </view>
        </view>
      </view>
      <view class="slide-indicators">
        <view 
          v-for="(slide, index) in guideSlides" 
          :key="index"
          class="indicator" 
          :class="{ active: currentSlide === index }"
          @click="currentSlide = index"
        ></view>
      </view>
      <view class="guide-actions">
        <button 
          v-if="currentSlide > 0" 
          class="prev-button" 
          @click="prevSlide"
        >
          上一步
        </button>
        <button 
          v-if="currentSlide < guideSlides.length - 1" 
          class="next-button" 
          @click="nextSlide"
        >
          下一步
        </button>
        <button 
          v-else 
          class="finish-button" 
          @click="finishGuide"
        >
          开始使用
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showGuide: false,
      currentSlide: 0,
      guideSlides: [
        {
          icon: '📝',
          title: '如何记一笔账',
          description: '点击账本页面的"新增记录"按钮，填写款号、工序、数量和单价，系统会自动计算金额'
        },
        {
          icon: '📤',
          title: '如何转发给老板确认',
          description: '记账完成后，点击"分享账本"按钮，选择"一键分享给老板"，老板确认后记录会自动更新为已确认状态'
        }
      ]
    }
  },
  watch: {
    show(newVal) {
      this.showGuide = newVal
    }
  },
  methods: {
    nextSlide() {
      if (this.currentSlide < this.guideSlides.length - 1) {
        this.currentSlide++
      }
    },
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--
      }
    },
    closeGuide() {
      this.showGuide = false
      this.$emit('close')
    },
    finishGuide() {
      this.showGuide = false
      // 标记引导已完成
      uni.setStorageSync('guideCompleted', true)
      this.$emit('finish')
    }
  }
}
</script>

<style scoped>
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-content {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 80%;
  max-width: 400rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.guide-title {
  font-size: 24sp;
  font-weight: bold;
  color: #333;
}

.close-button {
  font-size: 14sp;
  color: #666;
  background: none;
  border: none;
  padding: 0;
}

.guide-slides {
  height: 300rpx;
  position: relative;
  margin-bottom: 32rpx;
}

.guide-slide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-slide.active {
  opacity: 1;
  transform: translateX(0);
}

.slide-content {
  text-align: center;
  padding: 0 20rpx;
}

.slide-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.slide-title {
  font-size: 20sp;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.slide-description {
  font-size: 14sp;
  color: #666;
  line-height: 1.5;
}

.slide-indicators {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 32rpx;
}

.indicator {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background-color: #ddd;
  transition: all 0.3s ease;
}

.indicator.active {
  width: 32rpx;
  background-color: #4A90E2;
}

.guide-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prev-button,
.next-button,
.finish-button {
  flex: 1;
  height: 48dp;
  border-radius: 8px;
  font-size: 16sp;
  font-weight: bold;
}

.prev-button {
  background-color: #f0f0f0;
  color: #333;
  margin-right: 12rpx;
}

.next-button,
.finish-button {
  background-color: #4A90E2;
  color: #fff;
}

.finish-button {
  flex: 1;
}
</style>