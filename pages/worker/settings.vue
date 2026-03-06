<template>
  <view class="settings-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <text class="nav-title">设置</text>
      <text class="nav-back" @tap="goBack">←</text>
    </view>
    
    <!-- 设置选项 -->
    <view class="settings-section">
      <!-- 个人信息设置 -->
      <view class="setting-group">
        <text class="group-title">个人信息</text>
        <view class="setting-item" @tap="goToPersonalInfo">
          <text class="setting-label">个人资料</text>
          <text class="setting-arrow">></text>
        </view>
      </view>
      
      <!-- 通知设置 -->
      <view class="setting-group">
        <text class="group-title">通知设置</text>
        <view class="setting-item">
          <text class="setting-label">固定支出提醒</text>
          <view class="switch">
            <switch v-model="fixedExpenseReminder" @change="saveNotificationSettings" />
          </view>
        </view>
        <view class="setting-item">
          <text class="setting-label">账单提醒</text>
          <view class="switch">
            <switch v-model="billReminder" @change="saveNotificationSettings" />
          </view>
        </view>
      </view>
      
      <!-- 关于 -->
      <view class="setting-group">
        <text class="group-title">关于</text>
        <view class="setting-item">
          <text class="setting-label">版本信息</text>
          <text class="setting-value">v1.0.0</text>
        </view>
        <view class="setting-item" @tap="showAbout">
          <text class="setting-label">关于衣起赚</text>
          <text class="setting-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      gender: '',
      fixedExpenseReminder: true,
      billReminder: true
    }
  },
  computed: {
    genderText() {
      switch(this.gender) {
        case 'male':
          return '男';
        case 'female':
          return '女';
        default:
          return '未设置';
      }
    }
  },
  onLoad() {
    this.loadSettings()
  },
  methods: {
    loadSettings() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      this.gender = userInfo.gender || ''
      
      const notificationSettings = uni.getStorageSync('notificationSettings') || {}
      this.fixedExpenseReminder = notificationSettings.fixedExpenseReminder !== false
      this.billReminder = notificationSettings.billReminder !== false
    },
    goBack() {
      uni.navigateBack()
    },
    goToPersonalInfo() {
      uni.navigateTo({
        url: '/pages/worker/personal-info'
      })
    },
    selectGender() {
      uni.showActionSheet({
        itemList: ['男', '女'],
        success: (res) => {
          const gender = res.tapIndex === 0 ? 'male' : 'female'
          this.gender = gender
          this.saveGender(gender)
        }
      })
    },
    saveGender(gender) {
      const userInfo = uni.getStorageSync('userInfo') || {}
      userInfo.gender = gender
      uni.setStorageSync('userInfo', userInfo)
      uni.showToast({
        title: '性别设置成功',
        icon: 'success'
      })
    },
    saveNotificationSettings() {
      const settings = {
        fixedExpenseReminder: this.fixedExpenseReminder,
        billReminder: this.billReminder
      }
      uni.setStorageSync('notificationSettings', settings)
      uni.showToast({
        title: '设置已保存',
        icon: 'success'
      })
    },
    showAbout() {
      uni.showModal({
        title: '关于衣起赚',
        content: '衣起赚是一款专为蓝领工人设计的记账和找工作应用，帮助工人轻松管理收入和支出，找到合适的工作机会。\n\n版本：v1.0.0\n开发者：赫尔玛智能',
        showCancel: false
      })
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 30rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-back {
  font-size: 36rpx;
  color: #666;
}

.settings-section {
  padding: 20rpx;
}

.setting-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.group-title {
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background-color: #f5f5f5;
}

.setting-label {
  font-size: 24rpx;
  color: #333;
}

.setting-value {
  font-size: 22rpx;
  color: #999;
  margin-right: 20rpx;
}

.setting-arrow {
  font-size: 20rpx;
  color: #999;
}

.switch {
  transform: scale(0.8);
}
</style>