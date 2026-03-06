<template>
  <view class="ie-community-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">工厂精益提效社区</text>
      <view class="placeholder"></view>
    </view>

    <!-- 内容范围切换标签 -->
    <view class="content-tabs">
      <view 
        v-for="(tab, index) in contentTabs" 
        :key="index"
        class="tab-item"
        :class="{ 'active': activeTab === index }"
        @tap="switchTab(index)"
      >
        <text class="tab-text">{{ tab }}</text>
      </view>
    </view>

    <!-- 核心子板块入口 -->
    <view class="core-sections">
      <view class="section-grid">
        <view class="section-card" @tap="goToActionLab">
          <text class="section-icon">🔬</text>
          <text class="section-title">动作分析实验室</text>
        </view>
        <view class="section-card" @tap="goToTimeDatabase">
          <text class="section-icon">⏰</text>
          <text class="section-title">工序工时数据库</text>
        </view>
        <view class="section-card" @tap="goToInternalCases" v-if="activeTab === 0">
          <text class="section-icon">📚</text>
          <text class="section-title">工厂内部案例库</text>
        </view>
        <view class="section-card" @tap="goToQnA">
          <text class="section-icon">❓</text>
          <text class="section-title">老师傅问答专区</text>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-section">
      <view class="filter-bar">
        <view class="filter-item">
          <text class="filter-label">工序：</text>
          <picker @change="handleProcessChange" :value="selectedProcessIndex" :range="processes">
            <text class="filter-value">{{ processes[selectedProcessIndex] }}</text>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">排序：</text>
          <picker @change="handleSortChange" :value="selectedSortIndex" :range="sortOptions">
            <text class="filter-value">{{ sortOptions[selectedSortIndex] }}</text>
          </picker>
        </view>
      </view>
    </view>

    <!-- Feed流内容区 -->
    <view class="feed-section">
      <view v-for="item in feedItems" :key="item.id" class="feed-card">
        <view class="feed-header">
          <view class="author-info">
            <view class="author-avatar">
              <image :src="item.author.avatar" mode="aspectFill" class="avatar-image"></image>
            </view>
            <view class="author-details">
              <text class="author-name">{{ item.author.name }}</text>
              <text class="author-title">{{ item.author.title }}</text>
            </view>
          </view>
          <text v-if="item.isInternal" class="internal-tag">内部专属</text>
        </view>
        <view class="feed-content">
          <text class="feed-title">{{ item.title }}</text>
          <text class="feed-desc">{{ item.description }}</text>
          <image v-if="item.image" :src="item.image" mode="aspectFill" class="feed-image"></image>
        </view>
        <view class="feed-footer">
          <view class="feed-stats">
            <view class="stat-item">
              <text class="stat-icon">👍</text>
              <text class="stat-text">{{ item.likes }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">💬</text>
              <text class="stat-text">{{ item.comments }}</text>
            </view>
            <view class="stat-item" @tap="shareContent(item)">
              <text class="stat-icon">🔗</text>
              <text class="stat-text">{{ item.shares }}</text>
            </view>
          </view>
          <text class="feed-time">{{ item.time }}</text>
        </view>
      </view>
    </view>

    <!-- 悬浮发布按钮 -->
    <view class="floating-btn" @tap="goToPublish">
      <text class="btn-icon">+</text>
    </view>

    <!-- 分享弹窗 -->
    <view v-if="showSharePopup" class="share-popup-overlay" @tap="closeSharePopup">
      <view class="share-popup" @tap.stop>
        <view class="share-popup-header">
          <text class="share-popup-title">分享内容至</text>
        </view>
        <view class="share-channels">
          <view 
            v-for="channel in shareChannels" 
            :key="channel.id"
            class="share-channel-item"
            @tap="selectShareChannel(channel)"
          >
            <text class="channel-icon">{{ channel.icon }}</text>
            <text class="channel-name">{{ channel.name }}</text>
          </view>
        </view>
        <view class="share-popup-footer">
          <button class="cancel-btn" @tap="closeSharePopup">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 内容范围切换标签
      contentTabs: ['内部社区', '行业社区'],
      activeTab: 0,
      // 筛选选项
      processes: ['全部工序', '平车', '裁剪', '熨烫', '包装'],
      selectedProcessIndex: 0,
      sortOptions: ['提效优先', '最新发布'],
      selectedSortIndex: 0,
      // 分享相关
      showSharePopup: false,
      currentContent: null,
      // 分享渠道
      shareChannels: [
        { id: 'wechat', name: '微信好友', icon: '💬' },
        { id: 'moment', name: '微信朋友圈', icon: '🌍' },
        { id: 'dingtalk', name: '钉钉', icon: '📱' },
        { id: 'qq', name: 'QQ', icon: '🐧' },
        { id: 'copy', name: '复制链接', icon: '📋' },
        { id: 'save', name: '保存视频', icon: '💾' }
      ],
      // Feed流数据
      feedItems: [
        {
          id: 1,
          title: '平车操作技巧分享',
          description: '如何通过调整手势和坐姿提高平车操作效率，减少疲劳，提升产能...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sewing%20machine%20operator%20training&image_size=landscape_16_9',
          author: {
            name: 'IE专员 李工',
            title: '工厂IE主管',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20industrial%20engineer%20portrait&image_size=square'
          },
          likes: 45,
          comments: 12,
          shares: 8,
          time: '2小时前',
          isInternal: true
        },
        {
          id: 2,
          title: '产线平衡优化案例',
          description: '通过调整工序顺序和人员配置，我们成功将产线平衡率从78%提升到92%...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=production%20line%20optimization&image_size=landscape_16_9',
          author: {
            name: '生产经理 王经理',
            title: '工厂生产经理',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20manager%20portrait&image_size=square'
          },
          likes: 67,
          comments: 18,
          shares: 15,
          time: '昨天',
          isInternal: true
        },
        {
          id: 3,
          title: '全国服装行业IE标准工时数据库',
          description: '基于全国1000+工厂的实测数据，我们整理了服装行业各工序的标准工时参考值...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industrial%20engineering%20data%20analysis&image_size=landscape_16_9',
          author: {
            name: '行业专家 张教授',
            title: '服装行业IE顾问',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industry%20expert%20portrait&image_size=square'
          },
          likes: 128,
          comments: 35,
          shares: 42,
          time: '3天前',
          isInternal: false
        }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchTab(index) {
      this.activeTab = index
      // 这里可以根据切换的标签更新Feed流数据
    },
    handleProcessChange(e) {
      this.selectedProcessIndex = e.detail.value
      // 这里可以根据选择的工序筛选Feed流数据
    },
    handleSortChange(e) {
      this.selectedSortIndex = e.detail.value
      // 这里可以根据选择的排序方式排序Feed流数据
    },
    goToActionLab() {
      // 跳转到动作分析实验室
      uni.showToast({
        title: '动作分析实验室功能开发中',
        icon: 'none'
      })
    },
    goToTimeDatabase() {
      // 跳转到工序工时数据库
      uni.showToast({
        title: '工序工时数据库功能开发中',
        icon: 'none'
      })
    },
    goToInternalCases() {
      // 跳转到工厂内部案例库
      uni.showToast({
        title: '工厂内部案例库功能开发中',
        icon: 'none'
      })
    },
    goToQnA() {
      // 跳转到老师傅问答专区
      uni.showToast({
        title: '老师傅问答专区功能开发中',
        icon: 'none'
      })
    },
    goToPublish() {
      // 跳转到发布页面
      uni.showModal({
        title: '发布内容',
        content: '请选择发布范围',
        cancelText: '仅内部可见',
        confirmText: '全行业公开',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '发布全行业公开内容',
              icon: 'none'
            })
          } else if (res.cancel) {
            uni.showToast({
              title: '发布内部可见内容',
              icon: 'none'
            })
          }
        }
      })
    },
    // 分享内容
    shareContent(content) {
      this.currentContent = content;
      this.showSharePopup = true;
    },
    // 关闭分享弹窗
    closeSharePopup() {
      this.showSharePopup = false;
    },
    // 选择分享渠道
    selectShareChannel(channel) {
      if (!this.currentContent) return;
      
      const content = this.currentContent;
      let shareTitle = `${content.title} | 服装人专属IE提效技巧`;
      const shareDesc = '服装行业专属精益提效平台，学技巧、测工时、涨收入';
      const shareLink = `https://yiqizhuan.com/content/${content.id}?inviter_id=${this.getFactoryId()}`;
      const shareImageUrl = content.image;
      
      // 根据内容类型添加不同的后缀
      if (content.isInternal) {
        shareTitle += ' | 来自工厂内部提效培训';
      } else {
        shareTitle += ' | 来自工厂的IE实战经验';
      }
      
      switch (channel.id) {
        case 'wechat':
        case 'moment':
        case 'dingtalk':
        case 'qq':
          this.shareToSocial(channel.id, shareTitle, shareDesc, shareLink, shareImageUrl);
          break;
        case 'copy':
          this.copyLink(shareLink);
          break;
        case 'save':
          this.saveContent(content);
          break;
      }
      
      this.showSharePopup = false;
    },
    // 分享到社交平台
    shareToSocial(channel, title, desc, link, imageUrl) {
      // 模拟分享功能
      uni.showToast({
        title: `分享到${this.getChannelName(channel)}成功`,
        icon: 'success'
      });
      
      // 记录分享数据
      this.updateShareCount(this.currentContent.id);
      // 发放分享积分
      this.rewardSharePoints();
    },
    // 复制链接
    copyLink(link) {
      uni.setClipboardData({
        data: link,
        success: () => {
          uni.showToast({
            title: '链接复制成功，快去分享吧',
            icon: 'success'
          });
          // 记录分享数据
          this.updateShareCount(this.currentContent.id);
          // 发放分享积分
          this.rewardSharePoints();
        },
        fail: () => {
          uni.showToast({
            title: '复制失败，请重试',
            icon: 'none'
          });
        }
      });
    },
    // 保存内容
    saveContent(content) {
      // 模拟保存内容
      uni.showToast({
        title: '内容已保存到本地',
        icon: 'success'
      });
      // 记录分享数据
      this.updateShareCount(content.id);
      // 发放分享积分
      this.rewardSharePoints();
    },
    // 更新分享次数
    updateShareCount(contentId) {
      const content = this.feedItems.find(item => item.id === contentId);
      if (content) {
        content.shares++;
      }
    },
    // 发放分享积分
    rewardSharePoints() {
      // 模拟发放积分
      uni.showToast({
        title: '获得50平台积分',
        icon: 'success'
      });
    },
    // 获取工厂ID
    getFactoryId() {
      // 模拟工厂ID
      return 'factory_123456';
    },
    // 获取渠道名称
    getChannelName(channelId) {
      const channel = this.shareChannels.find(c => c.id === channelId);
      return channel ? channel.name : '';
    }
  }
}
</script>

<style scoped>
.ie-community-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100rpx; /* 为悬浮按钮留出空间 */
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 80rpx;
}

/* 内容范围切换标签 */
.content-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 80rpx;
  z-index: 99;
}

.tab-item {
  flex: 1;
  padding: 25rpx 0;
  text-align: center;
  position: relative;
}

.tab-item.active {
  color: #1890ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #1890ff;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
}

/* 核心子板块入口 */
.core-sections {
  padding: 30rpx;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.section-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.section-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.section-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
  display: block;
}

.section-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

/* 筛选栏 */
.filter-section {
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.filter-bar {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #666;
}

.filter-value {
  font-size: 24rpx;
  color: #333;
  padding: 8rpx 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  min-width: 100rpx;
  text-align: center;
}

/* Feed流内容区 */
.feed-section {
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feed-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.author-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.author-title {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.internal-tag {
  background-color: #52c41a;
  color: #fff;
  padding: 5rpx 15rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.feed-content {
  margin-bottom: 20rpx;
}

.feed-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.feed-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15rpx;
  display: block;
}

.feed-image {
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  object-fit: cover;
}

.feed-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.feed-stats {
  display: flex;
  gap: 30rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5rpx;
}

.stat-icon {
  font-size: 24rpx;
}

.stat-text {
  font-size: 22rpx;
  color: #666;
}

.feed-time {
  font-size: 20rpx;
  color: #999;
}

/* 悬浮发布按钮 */
.floating-btn {
  position: fixed;
  bottom: 30rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 15rpx rgba(24, 144, 255, 0.4);
  z-index: 999;
  transition: all 0.3s ease;
}

.floating-btn:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.btn-icon {
  font-size: 40rpx;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .core-sections {
    padding: 20rpx;
  }
  
  .section-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-section,
  .feed-section {
    padding: 0 20rpx;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .filter-value {
    flex: 1;
  }
  
  .feed-card {
    padding: 20rpx;
  }
  
  .floating-btn {
    width: 70rpx;
    height: 70rpx;
    bottom: 20rpx;
    right: 20rpx;
  }
  
  .btn-icon {
    font-size: 36rpx;
  }
}

/* 分享弹窗 */
.share-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  z-index: 9999;
}

.share-popup {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  width: 100%;
  max-height: 80vh;
  padding: 30rpx;
}

.share-popup-header {
  text-align: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.share-popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.share-channels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.share-channel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.share-channel-item:active {
  background-color: #f5f5f5;
  transform: scale(0.95);
}

.channel-icon {
  font-size: 60rpx;
}

.channel-name {
  font-size: 24rpx;
  color: #333;
}

.share-popup-footer {
  margin-top: 20rpx;
}

.cancel-btn {
  width: 100%;
  padding: 25rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  background-color: #f0f0f0;
  color: #333;
  transition: all 0.3s ease;
}

.cancel-btn:active {
  background-color: #e0e0e0;
  transform: scale(0.98);
}
</style>