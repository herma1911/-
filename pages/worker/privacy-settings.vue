<template>
  <view class="privacy-settings-container">
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <text class="header-title">隐私设置</text>
      <view class="placeholder"></view>
    </view>

    <view class="settings-content">
      <!-- 联系方式设置 -->
      <view class="setting-section">
        <text class="section-title">联系方式设置</text>
        <view class="setting-item">
          <text class="setting-label">触达权限模式</text>
          <view class="mode-options">
            <label class="mode-option" @tap="setContactMode('platform')">
              <text class="radio" :class="{ 'active': contactMode === 'platform' }">●</text>
              <text class="mode-text">仅平台推荐</text>
            </label>
            <label class="mode-option" @tap="setContactMode('factory')">
              <text class="radio" :class="{ 'active': contactMode === 'factory' }">●</text>
              <text class="mode-text">仅工厂联系</text>
            </label>
            <label class="mode-option" @tap="setContactMode('none')">
              <text class="radio" :class="{ 'active': contactMode === 'none' }">●</text>
              <text class="mode-text">全部拒绝</text>
            </label>
          </view>
        </view>
      </view>

      <!-- 留号管理 -->
      <view class="setting-section">
        <text class="section-title">留号管理</text>
        <view class="setting-item">
          <text class="setting-label">已留手机号</text>
          <text class="setting-value">{{ savedPhone || '未留号' }}</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">授权状态</text>
          <view class="auth-status">
            <text class="status-item" :class="{ 'active': authOptions.platformRecommendation }">平台推荐</text>
            <text class="status-item" :class="{ 'active': authOptions.factoryContact }">工厂联系</text>
          </view>
        </view>
        <view class="setting-item" @tap="clearPhoneRecord">
          <text class="setting-label">清除留号记录</text>
          <text class="setting-action">清除</text>
        </view>
      </view>

      <!-- 通知设置 -->
      <view class="setting-section">
        <text class="section-title">通知设置</text>
        <view class="setting-item">
          <text class="setting-label">平台推送</text>
          <view class="toggle-switch">
            <switch v-model="notificationSettings.platformPush" @change="saveNotificationSettings" />
          </view>
        </view>
        <view class="setting-item">
          <text class="setting-label">每日推送上限</text>
          <text class="setting-value">2条</text>
        </view>
      </view>

      <!-- 联系限制 -->
      <view class="setting-section">
        <text class="section-title">联系限制</text>
        <view class="setting-item">
          <text class="setting-label">工厂联系频率</text>
          <text class="setting-value">24小时内最多1次</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">平台推送频率</text>
          <text class="setting-value">每日最多2条</text>
        </view>
      </view>

      <!-- 隐私说明 -->
      <view class="privacy-info">
        <text class="info-title">隐私保护说明</text>
        <text class="info-item">• 工厂只能在平台内发起咨询/联系，不能直接拿到您的手机号</text>
        <text class="info-item">• 工厂需您授权后才能查看/拨打您的电话</text>
        <text class="info-item">• 您可以随时修改触达权限模式，控制谁可以联系您</text>
        <text class="info-item">• 平台会严格限制联系频次，避免骚扰</text>
      </view>
    </view>
  </view>
</template>

<script>
import { CONTACT_MODES, getUserPrivacySettings } from '../../utils/privacy-protection.js'

export default {
  data() {
    return {
      contactMode: CONTACT_MODES.PLATFORM_ONLY, // platform, factory, none
      authOptions: {
        platformRecommendation: false,
        factoryContact: false
      },
      savedPhone: '',
      notificationSettings: {
        platformPush: true
      }
    }
  },
  onLoad() {
    this.loadUserSettings()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    loadUserSettings() {
      // 加载用户信息获取用户ID
      const userInfo = uni.getStorageSync('userInfo') || {}
      const userId = userInfo.phone || userInfo.username || Date.now().toString()
      
      // 使用隐私保护工具获取用户隐私设置
      const privacySettings = getUserPrivacySettings(userId)
      
      // 更新本地数据
      this.contactMode = privacySettings.contactMode
      this.authOptions = privacySettings.authOptions
      this.notificationSettings = privacySettings.notificationSettings
      
      // 加载留号记录
      const phoneRecords = uni.getStorageSync('phoneRecords') || {}
      if (phoneRecords[userId]) {
        this.savedPhone = phoneRecords[userId].phone
      }
    },
    setContactMode(mode) {
      this.contactMode = mode
      uni.setStorageSync('contactMode', mode)
      
      // 根据模式更新授权选项
      switch (mode) {
        case 'platform':
          this.authOptions.platformRecommendation = true
          this.authOptions.factoryContact = false
          break
        case 'factory':
          this.authOptions.platformRecommendation = false
          this.authOptions.factoryContact = true
          break
        case 'none':
          this.authOptions.platformRecommendation = false
          this.authOptions.factoryContact = false
          break
      }
      
      // 保存授权选项
      this.saveAuthOptions()
      
      uni.showToast({
        title: '触达权限已更新',
        icon: 'success'
      })
    },
    saveAuthOptions() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      const userId = userInfo.phone || userInfo.username || Date.now().toString()
      const phoneRecords = uni.getStorageSync('phoneRecords') || {}
      
      if (phoneRecords[userId]) {
        phoneRecords[userId].authOptions = this.authOptions
        uni.setStorageSync('phoneRecords', phoneRecords)
      }
    },
    saveNotificationSettings() {
      uni.setStorageSync('notificationSettings', this.notificationSettings)
    },
    clearPhoneRecord() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除留号记录吗？清除后需要重新留号才能接收岗位推荐。',
        success: (res) => {
          if (res.confirm) {
            const userInfo = uni.getStorageSync('userInfo') || {}
            const userId = userInfo.phone || userInfo.username || Date.now().toString()
            const phoneRecords = uni.getStorageSync('phoneRecords') || {}
            
            delete phoneRecords[userId]
            uni.setStorageSync('phoneRecords', phoneRecords)
            
            this.savedPhone = ''
            this.authOptions = {
              platformRecommendation: false,
              factoryContact: false
            }
            
            uni.showToast({
              title: '留号记录已清除',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.privacy-settings-container {
  flex: 1;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background-color: #fff;
  padding: 0 15px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 24px;
  color: #333;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.placeholder {
  width: 44px;
}

.settings-content {
  padding: 20px 15px;
}

.setting-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: block;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #333;
}

.setting-value {
  font-size: 14px;
  color: #999;
}

.setting-action {
  font-size: 14px;
  color: #4A90E2;
  cursor: pointer;
}

/* 模式选项 */
.mode-options {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 20px;
}

.mode-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 10px;
  color: transparent;
}

.radio.active {
  border-color: #4A90E2;
  background-color: #4A90E2;
  color: #fff;
}

.mode-text {
  font-size: 14px;
  color: #333;
}

/* 授权状态 */
.auth-status {
  display: flex;
  gap: 10px;
}

.status-item {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 12px;
  color: #999;
}

.status-item.active {
  border-color: #4A90E2;
  background-color: #e3f2fd;
  color: #4A90E2;
}

/* 切换开关 */
.toggle-switch {
  margin-left: 20px;
}

/* 隐私说明 */
.privacy-info {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-top: 30px;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.info-item {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: block;
  margin-bottom: 8px;
}
</style>