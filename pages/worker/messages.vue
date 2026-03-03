<template>
  <view class="messages-container">
    <!-- 消息类型切换Tab -->
    <view class="tab-container">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'ledger' }"
        @click="switchTab('ledger')"
      >
        <text class="tab-text">记账通知</text>
        <view v-if="ledgerNotifications.unread > 0" class="tab-unread-badge">{{ledgerNotifications.unread}}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'recruitment' }"
        @click="switchTab('recruitment')"
      >
        <text class="tab-text">招聘消息</text>
        <view v-if="recruitmentNotifications.unread > 0" class="tab-unread-badge">{{recruitmentNotifications.unread}}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'system' }"
        @click="switchTab('system')"
      >
        <text class="tab-text">系统通知</text>
        <view v-if="systemNotifications.unread > 0" class="tab-unread-badge">{{systemNotifications.unread}}</view>
      </view>
    </view>
    
    <!-- 记账通知 -->
    <view v-if="activeTab === 'ledger'" class="system-notifications">
      <!-- 空状态 -->
      <view v-if="ledgerNotifications.list.length === 0" class="empty-state">
        <text class="empty-icon">💰</text>
        <text class="empty-title">暂无记账通知</text>
        <text class="empty-content">记账相关的通知将在这里显示</text>
      </view>
      
      <!-- 通知列表 -->
      <view v-else class="notification-item" v-for="(notification, index) in ledgerNotifications.list" :key="index">
        <view class="notification-icon">
          <text class="icon">{{notification.icon}}</text>
        </view>
        <view class="notification-content">
          <text class="notification-title">{{notification.title}}</text>
          <text class="notification-text">{{notification.content}}</text>
          <text class="notification-time">{{notification.time}}</text>
        </view>
        <view v-if="!notification.read" class="unread-dot"></view>
      </view>
    </view>
    
    <!-- 招聘消息 -->
    <view v-else-if="activeTab === 'recruitment'" class="system-notifications">
      <!-- 空状态 -->
      <view v-if="recruitmentNotifications.list.length === 0" class="empty-state">
        <text class="empty-icon">🏭</text>
        <text class="empty-title">暂无招聘消息</text>
        <text class="empty-content">招聘相关的消息将在这里显示</text>
      </view>
      
      <!-- 通知列表 -->
      <view v-else class="notification-item" v-for="(notification, index) in recruitmentNotifications.list" :key="index">
        <view class="notification-icon">
          <text class="icon">{{notification.icon}}</text>
        </view>
        <view class="notification-content">
          <text class="notification-title">{{notification.title}}</text>
          <text class="notification-text">{{notification.content}}</text>
          <text class="notification-time">{{notification.time}}</text>
        </view>
        <view v-if="!notification.read" class="unread-dot"></view>
      </view>
    </view>
    
    <!-- 系统通知 -->
    <view v-else-if="activeTab === 'system'" class="system-notifications">
      <!-- 空状态 -->
      <view v-if="systemNotifications.list.length === 0" class="empty-state">
        <text class="empty-icon">🔔</text>
        <text class="empty-title">暂无系统通知</text>
        <text class="empty-content">系统相关的通知将在这里显示</text>
      </view>
      
      <!-- 通知列表 -->
      <view v-else class="notification-item" v-for="(notification, index) in systemNotifications.list" :key="index">
        <view class="notification-icon">
          <text class="icon">{{notification.icon}}</text>
        </view>
        <view class="notification-content">
          <text class="notification-title">{{notification.title}}</text>
          <text class="notification-text">{{notification.content}}</text>
          <text class="notification-time">{{notification.time}}</text>
        </view>
        <view v-if="!notification.read" class="unread-dot"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'ledger', // ledger, recruitment, system
      // 记账通知
      ledgerNotifications: {
        unread: 2,
        list: [
          {
            id: 1,
            icon: '💰',
            title: '记账成功',
            content: '您的今日收入已记录，金额：250元',
            time: '10:30',
            read: false
          },
          {
            id: 2,
            icon: '📊',
            title: '周报生成',
            content: '您的本周工作周报已生成，总收入：1250元',
            time: '昨天',
            read: false
          },
          {
            id: 3,
            icon: '💳',
            title: '提现成功',
            content: '您的提现申请已处理，金额：1000元',
            time: '前天',
            read: true
          }
        ]
      },
      // 招聘消息
      recruitmentNotifications: {
        unread: 1,
        list: [
          {
            id: 1,
            icon: '🏭',
            title: '面试邀请',
            content: 'XX制衣厂邀请您明天上午10点面试',
            time: '14:20',
            read: false
          },
          {
            id: 2,
            icon: '📋',
            title: '申请回复',
            content: '您的简历已被XX服装厂查看',
            time: '昨天',
            read: true
          }
        ]
      },
      // 系统通知
      systemNotifications: {
        unread: 1,
        list: [
          {
            id: 1,
            icon: '🔔',
            title: '关注更新',
            content: '你关注的张三已开启找活中，快去聊聊～',
            time: '16:45',
            read: false
          },
          {
            id: 2,
            icon: '📣',
            title: '系统公告',
            content: '平台将于明天进行系统维护，届时可能影响部分功能',
            time: '昨天',
            read: true
          }
        ]
      }
    }
  },
  onLoad() {
  },
  methods: {
    // 切换Tab
    switchTab(tab) {
      this.activeTab = tab
    },
    
    // 导航到单聊页面
    navigateToChat(id, type) {
      uni.navigateTo({
        url: './chat?userId=' + id + '&type=' + type
      })
    },
    
    // 导航到群聊页面
    navigateToGroupChat(id, type) {
      uni.navigateTo({
        url: './group-chat?groupId=' + id + '&type=' + type
      })
    }
  }
}
</script>

<style scoped>
.messages-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  position: relative;
}



/* Tab切换栏 */
.tab-container {
  display: flex;
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4A90E2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

/* 标签页未读角标 */
.tab-unread-badge {
  position: absolute;
  top: 10rpx;
  right: 20rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 10rpx;
  padding: 2rpx 8rpx;
  font-size: 16rpx;
  min-width: 20rpx;
  text-align: center;
}

/* 空状态 */
.empty-state {
  padding: 60rpx 20rpx;
  text-align: center;
  background-color: #fff;
  border-radius: 15rpx;
  margin-top: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.empty-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  display: block;
}

/* 系统通知 */
.system-notifications {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.notification-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
}

.notification-icon .icon {
  font-size: 30rpx;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.notification-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8rpx;
  display: block;
}

.notification-time {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.unread-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background-color: #ff4d4f;
  margin-left: 10rpx;
  margin-top: 15rpx;
}

/* 单聊列表 */
.chat-list {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
}

.chat-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
}

.chat-info {
  flex: 1;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.chat-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.chat-time {
  font-size: 20rpx;
  color: #999;
}

.chat-last-message {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 15rpx;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  min-width: 30rpx;
  text-align: center;
}

/* 群聊列表 */
.group-list {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.group-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
}

.group-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 15rpx;
  background-color: #722ed1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
}

.group-info {
  flex: 1;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.group-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.group-time {
  font-size: 20rpx;
  color: #999;
}

.group-last-message {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .chat-avatar,
  .group-avatar {
    width: 60rpx;
    height: 60rpx;
  }
  
  .chat-name,
  .group-name {
    font-size: 24rpx;
  }
  
  .chat-last-message,
  .group-last-message {
    font-size: 20rpx;
  }
}
</style>