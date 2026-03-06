<template>
  <view class="poster-tool-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-left" @click="navigateBack">
        <text class="back-icon">←</text>
        <text class="page-title">海报工具</text>
      </view>
    </view>
    
    <!-- 主要内容 -->
    <view class="content">
      <!-- 海报模板选择 -->
      <view class="templates-section">
        <text class="section-title">官方招工海报模板</text>
        <view class="templates-grid">
          <view 
            v-for="(template, index) in posterTemplates" 
            :key="index"
            class="template-item"
            @click="selectTemplate(template)"
          >
            <view class="template-preview">
              <text class="template-icon">{{ template.icon }}</text>
            </view>
            <text class="template-name">{{ template.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 功能说明 -->
      <view class="features-section">
        <view class="feature-item">
          <text class="feature-icon">🎨</text>
          <text class="feature-text">多种模板选择</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📥</text>
          <text class="feature-text">一键下载使用</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🚀</text>
          <text class="feature-text">助力 B 级认证</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="actions-section">
        <button class="action-button primary" @click="navigateTo('/pages/factory/fast-track-certification')">
          <text class="button-text">提交认证材料</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      posterTemplates: [
        {
          id: 1,
          name: '招聘启事',
          icon: '📢'
        },
        {
          id: 2,
          name: '工厂介绍',
          icon: '🏭'
        },
        {
          id: 3,
          name: '薪资福利',
          icon: '💰'
        },
        {
          id: 4,
          name: '工作环境',
          icon: '🌱'
        }
      ]
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    selectTemplate(template) {
      uni.showToast({
        title: `选择了${template.name}模板`,
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.poster-tool-container {
  padding: 120rpx 0 0 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  height: 80rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-icon {
  font-size: 32rpx;
  color: white;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

/* 主要内容 */
.content {
  padding: 40rpx 24rpx;
}

/* 海报模板选择 */
.templates-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.template-item {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  transition: all 0.3s ease;
}

.template-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.template-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-icon {
  font-size: 60rpx;
}

.template-name {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 功能说明 */
.features-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 40rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  font-size: 32rpx;
}

.feature-text {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

/* 操作按钮 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-button {
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-button:active {
  transform: translateY(4rpx);
}

.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.button-text {
  font-size: 24rpx;
  font-weight: 500;
  color: white;
}
</style>