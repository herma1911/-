<template>
  <view class="like-share-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="header-title">帮我点个赞，证明我的手艺！</text>
    </view>
    
    <!-- 主要内容 -->
    <view class="content">
      <!-- 描述区域 -->
      <view class="description-section">
        <text class="description">我在「衣起赚」记工资、完善手艺档案，老乡帮我点赞，好找高工价工厂！</text>
      </view>
      
      <!-- 用户信息展示 -->
      <view class="user-info-section">
        <view class="user-avatar">
          <text class="avatar-icon">👷</text>
        </view>
        <view class="user-details">
          <text class="user-name">{{userInfo.username || '工人朋友'}}</text>
          <text class="user-skills">技能：{{userSkills}}</text>
          <text class="user-stats">已完成：{{completedOrders}}单 | 好评率：{{satisfactionRate}}%</text>
        </view>
      </view>
      
      <!-- 点赞按钮区域 -->
      <view class="action-buttons">
        <button class="primary-btn" @click="likeProfile">去点赞</button>
        <button class="secondary-btn" @click="downloadApp">下载 APP 点赞</button>
      </view>
      
      <!-- 分享二维码 -->
      <view class="qr-code-section">
        <text class="qr-code-title">分享给老乡</text>
        <view class="qr-code-container">
          <text class="qr-code-placeholder">📱</text>
          <text class="qr-code-text">扫码下载 APP</text>
        </view>
      </view>
      
      <!-- 点赞记录 -->
      <view class="likes-history">
        <text class="likes-title">最近点赞</text>
        <view class="likes-list">
          <view v-for="(like, index) in recentLikes" :key="index" class="like-item">
            <text class="like-avatar">{{like.avatar}}</text>
            <text class="like-name">{{like.name}}</text>
            <text class="like-time">{{like.time}}</text>
          </view>
          <view v-if="recentLikes.length === 0" class="no-likes">
            <text class="no-likes-text">暂无点赞记录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      userSkills: '平车、拷边',
      completedOrders: 23,
      satisfactionRate: 98,
      recentLikes: [
        { avatar: '👩', name: '王姐', time: '今天 10:30' },
        { avatar: '👨', name: '李师傅', time: '昨天 16:45' },
        { avatar: '👩', name: '张妹', time: '前天 09:15' }
      ]
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      // 加载用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
      
      // 加载技能信息
      const skillProfile = uni.getStorageSync('skillProfile')
      if (skillProfile && skillProfile.skills && skillProfile.skills.length > 0) {
        this.userSkills = skillProfile.skills.slice(0, 3).join('、')
      }
    },
    likeProfile() {
      // 模拟点赞操作
      uni.showToast({
        title: '点赞成功！',
        icon: 'success'
      })
      
      // 添加到最近点赞记录
      this.recentLikes.unshift({
        avatar: '👤',
        name: '我',
        time: '刚刚'
      })
      
      // 限制显示数量
      if (this.recentLikes.length > 10) {
        this.recentLikes.pop()
      }
    },
    downloadApp() {
      // 模拟下载 APP
      uni.showModal({
        title: '下载 APP',
        content: '请扫描上方二维码下载「衣起赚」APP',
        confirmText: '确定',
        showCancel: false
      })
    }
  }
}
</script>

<style scoped>
.like-share-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1.4;
}

.content {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.description-section {
  margin-bottom: 30rpx;
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #4A90E2;
}

.description {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  text-align: center;
}

.user-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 15rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  background-color: #4A90E2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 60rpx;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-skills {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.user-stats {
  font-size: 22rpx;
  color: #999;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.primary-btn {
  flex: 1;
  height: 80rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.secondary-btn {
  flex: 1;
  height: 80rpx;
  background-color: #FF9800;
  color: #fff;
  border: none;
  border-radius: 10