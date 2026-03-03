<template>
  <view class="peer-chat-container">
    <view class="header">
      <text class="title">工友交流</text>
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input type="text" v-model="searchKeyword" placeholder="搜索工友..." class="search-input" />
      </view>
    </view>
    
    <!-- 工友列表 -->
    <view class="peer-list">
      <view v-for="(peer, index) in filteredPeers" :key="index" class="peer-item" @click="startChat(peer.id, peer.name)">
        <view class="peer-avatar">
          <text class="avatar-icon">{{peer.avatar}}</text>
          <view v-if="peer.online" class="online-indicator"></view>
        </view>
        <view class="peer-info">
          <view class="peer-header">
            <text class="peer-name">{{peer.name}}</text>
            <text class="peer-time">{{peer.lastMessageTime}}</text>
          </view>
          <text class="peer-last-message">{{peer.lastMessage}}</text>
        </view>
        <view v-if="peer.unread" class="unread-badge">{{peer.unread}}</view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="filteredPeers.length === 0" class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-title">暂无工友</text>
        <text class="empty-content">关注更多工友，开始交流吧！</text>
      </view>
    </view>
    
    <!-- 推荐工友 -->
    <view v-if="recommendedPeers.length > 0" class="recommended-section">
      <text class="section-title">推荐工友</text>
      <view class="recommended-list">
        <view v-for="(peer, index) in recommendedPeers" :key="index" class="recommended-item">
          <view class="peer-avatar">
            <text class="avatar-icon">{{peer.avatar}}</text>
          </view>
          <text class="peer-name">{{peer.name}}</text>
          <button class="add-button" @click.stop="followPeer(peer.id)">关注</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      peers: [
        {
          id: 1,
          avatar: '👨',
          name: '张三',
          online: true,
          lastMessage: '最近怎么样？还在找活吗？',
          lastMessageTime: '10:30',
          unread: 2,
          skills: ['平车', '拷边'],
          experience: '5年'
        },
        {
          id: 2,
          avatar: '👩',
          name: '李四',
          online: false,
          lastMessage: '我找到新工作了，在XX服装厂',
          lastMessageTime: '昨天',
          unread: 0,
          skills: ['开口袋', '装拉链'],
          experience: '3年'
        },
        {
          id: 3,
          avatar: '👨',
          name: '王五',
          online: true,
          lastMessage: '你知道哪里有招平车工的吗？',
          lastMessageTime: '2小时前',
          unread: 1,
          skills: ['平车', '裁剪'],
          experience: '8年'
        }
      ],
      recommendedPeers: [
        {
          id: 4,
          avatar: '👩',
          name: '赵六',
          skills: ['质检', '管理'],
          experience: '10年'
        },
        {
          id: 5,
          avatar: '👨',
          name: '孙七',
          skills: ['设计', '制版'],
          experience: '6年'
        },
        {
          id: 6,
          avatar: '👩',
          name: '周八',
          skills: ['拷边', '平车'],
          experience: '4年'
        }
      ]
    }
  },
  computed: {
    filteredPeers() {
      if (!this.searchKeyword) {
        return this.peers
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.peers.filter(peer => 
        peer.name.toLowerCase().includes(keyword)
      )
    }
  },
  methods: {
    startChat(peerId, peerName) {
      // 跳转到聊天页面
      uni.navigateTo({
        url: './chat?type=peer&id=' + peerId + '&name=' + peerName
      })
    },
    
    followPeer(peerId) {
      uni.showToast({
        title: '关注成功',
        icon: 'success'
      })
      
      // 从推荐列表中移除
      this.recommendedPeers = this.recommendedPeers.filter(peer => peer.id !== peerId)
    }
  }
}
</script>

<style scoped>
.peer-chat-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 24rpx;
  color: #333;
}

/* 工友列表 */
.peer-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.peer-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.peer-avatar {
  position: relative;
  margin-right: 20rpx;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-icon {
  font-size: 35rpx;
  color: #fff;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #52c41a;
  border: 2rpx solid #fff;
}

.peer-info {
  flex: 1;
  min-width: 0;
}

.peer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5rpx;
}

.peer-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.peer-time {
  font-size: 20rpx;
  color: #999;
}

.peer-last-message {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
  padding: 5rpx 10rpx;
  border-radius: 15rpx;
  margin-left: 15rpx;
}

/* 空状态 */
.empty-state {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 60rpx 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.empty-content {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 推荐工友 */
.recommended-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.recommended-list {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.recommended-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150rpx;
  gap: 15rpx;
}

.add-button {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  background-color: #4A90E2;
  color: #fff;
}
</style>
