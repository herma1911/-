<template>
  <view class="welcome-popup" v-if="showPopup">
    <view class="popup-content">
      <view class="popup-header">
        <text class="popup-title">👋 老板，招工人不再靠运气，靠数据！</text>
        <view class="close-btn" @click="closePopup">×</view>
      </view>
      <view class="popup-body">
        <text class="popup-text">在「衣起赚」，每一个工人都有一本《技能档案》。</text>
        <text class="popup-text">不用听他嘴上说多快，看实绩：</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="feature-icon">✅</text>
            <text class="feature-text">记账实绩：装领28600件，上腰15300件，含金量一目了然。</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">✅</text>
            <text class="feature-text">技能标签：平车、拷边、大烫，擅长什么一目了然。</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">✅</text>
            <text class="feature-text">双重评价：工友认可+工厂口碑，手艺稳不稳、人靠不靠谱，全透明。</text>
          </view>
        </view>
        <text class="popup-call-to-action">告别"鸽子"和"水货"，来衣起赚，一键匹配最靠谱的熟练工！</text>
      </view>
      <view class="popup-footer">
        <button class="primary-btn" @click="exploreApp">立即体验</button>
        <button class="secondary-btn" @click="closePopup">稍后再说</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false
    }
  },
  mounted() {
    // 检查是否是新用户或需要展示弹窗
    this.checkShowPopup()
  },
  methods: {
    checkShowPopup() {
      const hasShownPopup = uni.getStorageSync('hasShownWelcomePopup')
      if (!hasShownPopup) {
        this.showPopup = true
        // 标记为已显示
        uni.setStorageSync('hasShownWelcomePopup', true)
      }
    },
    closePopup() {
      this.showPopup = false
    },
    exploreApp() {
      this.showPopup = false
      // 可以添加跳转到招工页面的逻辑
      uni.navigateTo({
        url: '../social/worker-search'
      })
    }
  }
}
</script>

<style scoped>
.welcome-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-content {
  background-color: #fff;
  border-radius: 20rpx;
  width: 85%;
  max-width: 600rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  animation: popupIn 0.3s ease-out;
}

@keyframes popupIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.close-btn {
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
  padding: 0 10rpx;
}

.close-btn:active {
  color: #666;
}

.popup-body {
  padding: 30rpx;
}

.popup-text {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.highlight {
  font-weight: bold;
  color: #4A90E2;
}

.feature-list {
  margin: 20rpx 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.feature-icon {
  font-size: 20rpx;
  color: #52c41a;
  margin-right: 10rpx;
  margin-top: 2rpx;
}

.feature-text {
  font-size: 18rpx;
  color: #666;
  flex: 1;
  line-height: 1.4;
}

.popup-call-to-action {
  font-size: 20rpx;
  font-weight: bold;
  color: #333;
  margin-top: 25rpx;
  text-align: center;
  line-height: 1.4;
}

.popup-footer {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  gap: 15rpx;
}

.primary-btn {
  flex: 1;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  padding: 15rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.secondary-btn {
  flex: 1;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 10rpx;
  padding: 15rpx;
  font-size: 20rpx;
}
</style>