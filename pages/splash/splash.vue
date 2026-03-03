<template>
  <view class="splash-container">
    <!-- 主标题 -->
    <view class="main-title">
      <text class="app-name">衣起赚</text>
    </view>
    
    <!-- 核心价值 -->
    <view class="core-values">
      <view class="value-item">
        <text class="value-icon">📝</text>
        <text class="value-text">自荐填技能</text>
      </view>
      <view class="value-item">
        <text class="value-icon">📊</text>
        <text class="value-text">记账加实绩</text>
      </view>
      <view class="value-item">
        <text class="value-icon">👍</text>
        <text class="value-text">工友来点赞</text>
      </view>
      <view class="value-item">
        <text class="value-icon">🏭</text>
        <text class="value-text">工厂做背书</text>
      </view>
    </view>
    
    <!-- 标语 -->
    <view class="slogan">
      <text class="slogan-text">好厂优先找到你</text>
    </view>
    
    <!-- 底部进度条 -->
    <view class="progress-container">
      <view class="progress-bar" :style="{ width: progress + '%' }"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      progress: 0
    }
  },
  onLoad() {
    // 启动进度动画
    this.startProgress()
  },
  methods: {
    startProgress() {
      const interval = setInterval(() => {
        this.progress += 1
        if (this.progress >= 100) {
          clearInterval(interval)
          // 跳转到登录页
          setTimeout(() => {
            uni.redirectTo({
              url: '../login/login'
            })
          }, 500)
        }
      }, 30)
    }
  }
}
</script>

<style scoped>
.splash-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4A90E2, #5C6BC0);
  padding: 40rpx;
}

.main-title {
  margin-bottom: 100rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.core-values {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40rpx;
  margin-bottom: 80rpx;
  width: 100%;
  max-width: 600rpx;
}

.value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 30rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.value-item:hover {
  transform: translateY(-5rpx);
  background-color: rgba(255, 255, 255, 0.3);
}

.value-icon {
  font-size: 48rpx;
  margin-bottom: 20rpx;
}

.value-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
  text-align: center;
}

.slogan {
  margin-bottom: 80rpx;
}

.slogan-text {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.progress-container {
  width: 100%;
  max-width: 400rpx;
  height: 10rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #fff;
  border-radius: 5rpx;
  transition: width 0.3s ease;
}
</style>