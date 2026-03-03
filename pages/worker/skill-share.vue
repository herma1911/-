<template>
  <view class="skill-share-container">
    <view class="header">
      <text class="title">技能分享</text>
      <button class="publish-button" @click="showPublishDialog">发布</button>
    </view>
    
    <!-- 搜索和筛选 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input type="text" v-model="searchKeyword" placeholder="搜索技能、经验..." class="search-input" />
      </view>
      <view class="filter-tabs">
        <button :class="['filter-tab', activeFilter === 'all' ? 'active' : '']" @click="activeFilter = 'all'">全部</button>
        <button :class="['filter-tab', activeFilter === 'skill' ? 'active' : '']" @click="activeFilter = 'skill'">技能</button>
        <button :class="['filter-tab', activeFilter === 'experience' ? 'active' : '']" @click="activeFilter = 'experience'">经验</button>
        <button :class="['filter-tab', activeFilter === 'question' ? 'active' : '']" @click="activeFilter = 'question'">问答</button>
      </view>
    </view>
    
    <!-- 分享列表 -->
    <view class="share-list">
      <view v-for="(share, index) in filteredShares" :key="index" class="share-item" @click="viewShareDetail(share.id)">
        <view class="share-header">
          <view class="user-info">
            <view class="avatar">
              <text class="avatar-icon">{{share.avatar}}</text>
            </view>
            <view class="user-details">
              <text class="username">{{share.username}}</text>
              <text class="share-time">{{share.time}}</text>
            </view>
          </view>
          <view class="share-type">
            <text :class="['type-tag', share.type]">{{share.typeText}}</text>
          </view>
        </view>
        
        <view class="share-content">
          <text class="share-title">{{share.title}}</text>
          <text class="share-desc">{{share.description}}</text>
        </view>
        
        <view class="share-footer">
          <view class="action-item" @click.stop="likeShare(share.id)">
            <text class="action-icon">❤️</text>
            <text class="action-text">{{share.likes}}</text>
          </view>
          <view class="action-item" @click.stop="commentShare(share.id)">
            <text class="action-icon">💬</text>
            <text class="action-text">{{share.comments}}</text>
          </view>
          <view class="action-item" @click.stop="shareToFriend(share.id)">
            <text class="action-icon">📤</text>
            <text class="action-text">分享</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="filteredShares.length === 0" class="empty-state">
        <text class="empty-icon">📚</text>
        <text class="empty-title">暂无分享</text>
        <text class="empty-content">成为第一个分享技能的人吧！</text>
      </view>
    </view>
    
    <!-- 发布分享弹窗 -->
    <view v-if="showPublishModal" class="modal-overlay" @click="closePublishDialog">
      <view class="publish-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发布技能分享</text>
          <text class="close-icon" @click="closePublishDialog">×</text>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">分享类型</text>
            <view class="type-buttons">
              <button :class="['type-btn', publishForm.type === 'skill' ? 'active' : '']" @click="publishForm.type = 'skill'">技能分享</button>
              <button :class="['type-btn', publishForm.type === 'experience' ? 'active' : '']" @click="publishForm.type = 'experience'">经验分享</button>
              <button :class="['type-btn', publishForm.type === 'question' ? 'active' : '']" @click="publishForm.type = 'question'">问题求助</button>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">标题</text>
            <input type="text" v-model="publishForm.title" placeholder="请输入标题" class="form-input" />
          </view>
          
          <view class="form-group">
            <text class="form-label">内容</text>
            <textarea v-model="publishForm.content" placeholder="请详细描述你的技能或经验..." class="form-textarea" />
          </view>
          
          <view class="form-group">
            <text class="form-label">技能标签</text>
            <view class="tag-container">
              <text 
                v-for="tag in availableTags" 
                :key="tag"
                :class="['tag', publishForm.tags.includes(tag) ? 'active' : '']"
                @click="toggleTag(tag)"
              >{{tag}}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-button" @click="closePublishDialog">取消</button>
          <button class="confirm-button" @click="publishShare">发布</button>
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
      activeFilter: 'all',
      showPublishModal: false,
      publishForm: {
        type: 'skill',
        title: '',
        content: '',
        tags: []
      },
      availableTags: ['平车', '拷边', '开口袋', '装拉链', '裁剪', '质检', '设计', '管理'],
      shares: [
        {
          id: 1,
          avatar: '👨',
          username: '张三',
          time: '2小时前',
          type: 'skill',
          typeText: '技能',
          title: '平车技巧分享：如何提高缝制速度',
          description: '从事平车工作10年，总结了一些提高缝制速度的技巧，包括手势、姿势和机器调整等方面...',
          likes: 23,
          comments: 8
        },
        {
          id: 2,
          avatar: '👩',
          username: '李四',
          time: '5小时前',
          type: 'experience',
          typeText: '经验',
          title: '服装厂工作经验分享：如何与工厂和谐相处',
          description: '在多家服装厂工作过，总结了一些与工厂管理和同事相处的经验，希望对大家有帮助...',
          likes: 15,
          comments: 5
        },
        {
          id: 3,
          avatar: '👨',
          username: '王五',
          time: '1天前',
          type: 'question',
          typeText: '问答',
          title: '求助：装拉链总是歪，有什么技巧吗？',
          description: '最近装拉链总是歪，试了很多方法都不行，有没有大神能分享一下技巧？',
          likes: 8,
          comments: 12
        }
      ]
    }
  },
  computed: {
    filteredShares() {
      let result = this.shares
      
      // 按类型筛选
      if (this.activeFilter !== 'all') {
        result = result.filter(share => share.type === this.activeFilter)
      }
      
      // 按关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(share => 
          share.title.toLowerCase().includes(keyword) || 
          share.description.toLowerCase().includes(keyword)
        )
      }
      
      return result
    }
  },
  methods: {
    showPublishDialog() {
      this.showPublishModal = true
    },
    
    closePublishDialog() {
      this.showPublishModal = false
      // 重置表单
      this.publishForm = {
        type: 'skill',
        title: '',
        content: '',
        tags: []
      }
    },
    
    toggleTag(tag) {
      const index = this.publishForm.tags.indexOf(tag)
      if (index > -1) {
        this.publishForm.tags.splice(index, 1)
      } else {
        this.publishForm.tags.push(tag)
      }
    },
    
    publishShare() {
      if (!this.publishForm.title || !this.publishForm.content) {
        uni.showToast({
          title: '请填写标题和内容',
          icon: 'none'
        })
        return
      }
      
      // 模拟发布
      const newShare = {
        id: Date.now(),
        avatar: '👤',
        username: '我',
        time: '刚刚',
        type: this.publishForm.type,
        typeText: this.publishForm.type === 'skill' ? '技能' : this.publishForm.type === 'experience' ? '经验' : '问答',
        title: this.publishForm.title,
        description: this.publishForm.content,
        likes: 0,
        comments: 0
      }
      
      this.shares.unshift(newShare)
      this.closePublishDialog()
      
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })
    },
    
    viewShareDetail(shareId) {
      // 跳转到分享详情页
      uni.showToast({
        title: '查看详情功能开发中',
        icon: 'none'
      })
    },
    
    likeShare(shareId) {
      const share = this.shares.find(s => s.id === shareId)
      if (share) {
        share.likes++
        uni.showToast({
          title: '点赞成功',
          icon: 'success'
        })
      }
    },
    
    commentShare(shareId) {
      // 跳转到评论页面
      uni.showToast({
        title: '评论功能开发中',
        icon: 'none'
      })
    },
    
    shareToFriend(shareId) {
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.skill-share-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.publish-button {
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

/* 搜索和筛选 */
.search-section {
  margin-bottom: 30rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 15rpx;
  margin-bottom: 20rpx;
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

.filter-tabs {
  display: flex;
  gap: 10rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.filter-tab {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #fff;
  color: #666;
  white-space: nowrap;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.filter-tab.active {
  background-color: #4A90E2;
  color: #fff;
}

/* 分享列表 */
.share-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.share-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-icon {
  font-size: 30rpx;
  color: #fff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.username {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.share-time {
  font-size: 20rpx;
  color: #999;
}

.type-tag {
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.type-tag.skill {
  background-color: #e6f7ff;
  color: #1890ff;
}

.type-tag.experience {
  background-color: #f6ffed;
  color: #52c41a;
}

.type-tag.question {
  background-color: #fff7e6;
  color: #faad14;
}

.share-content {
  margin-bottom: 15rpx;
}

.share-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.share-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 36rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.share-footer {
  display: flex;
  gap: 40rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 15rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 22rpx;
  color: #666;
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

/* 发布弹窗 */
.modal-overlay {
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

.publish-modal {
  background-color: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.close-icon {
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 20rpx;
}

.form-group {
  margin-bottom: 25rpx;
}

.form-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.type-buttons {
  display: flex;
  gap: 10rpx;
  margin-bottom: 15rpx;
}

.type-btn {
  flex: 1;
  padding: 15rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.type-btn.active {
  background-color: #4A90E2;
  color: #fff;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 24rpx;
  resize: none;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  background-color: #f0f0f0;
  color: #666;
  cursor: pointer;
}

.tag.active {
  background-color: #4A90E2;
  color: #fff;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-button {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #666;
}

.confirm-button {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: bold;
  background-color: #4A90E2;
  color: #fff;
}
</style>
