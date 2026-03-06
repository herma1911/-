<template>
  <view class="income-boost-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="page-title">提收入</text>
      <view class="placeholder"></view>
    </view>

    <!-- 内容范围筛选标签 -->
    <view class="content-filter-section">
      <view class="filter-tabs">
        <view 
          v-for="(tab, index) in filterTabs" 
          :key="index"
          class="filter-tab"
          :class="{ active: activeTab === index }"
          @tap="switchTab(index)"
        >
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <!-- 核心内容区 -->
    <view class="content">
      <!-- 上传视频按钮 -->
      <view class="upload-section">
        <view class="upload-card" @tap="uploadVideo">
          <text class="upload-icon">📹</text>
          <text class="upload-title">录制干活视频</text>
          <text class="upload-desc">分享你的工作技巧，获得专业建议</text>
        </view>
      </view>

      <!-- 视频列表 -->
      <view class="video-list-section">
        <text class="section-title">{{ activeTab === 0 ? '全部内容' : activeTab === 1 ? '工厂内部' : '行业公开' }}</text>
        <view class="video-list">
          <view v-for="video in filteredVideos" :key="video.id" class="video-card">
            <view class="video-thumbnail">
              <image :src="video.thumbnail" mode="aspectFill" class="thumbnail-image"></image>
              <text class="video-duration">{{ video.duration }}</text>
              <text v-if="video.isInternal" class="internal-tag">内部专属</text>
            </view>
            <view class="video-info">
              <text class="video-title">{{ video.title }}</text>
              <view class="video-meta">
                <text class="video-author">{{ video.author }}</text>
                <text class="video-views">{{ video.views }}次观看</text>
              </view>
              <view class="video-stats">
                <view class="stat-item">
                  <text class="stat-icon">👍</text>
                  <text class="stat-text">{{ video.likes }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-icon">💬</text>
                  <text class="stat-text">{{ video.comments }}</text>
                </view>
                <view class="stat-item" @tap="shareVideo(video)">
                  <text class="stat-icon">🔗</text>
                  <text class="stat-text">{{ video.shares }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 专家建议区 -->
      <view class="expert-section">
        <text class="section-title">IE大神建议</text>
        <view class="expert-card">
          <view class="expert-avatar">
            <image src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20industrial%20engineer%20portrait&image_size=square" mode="aspectFill" class="avatar-image"></image>
          </view>
          <view class="expert-info">
            <text class="expert-name">IE专家 张工</text>
            <text class="expert-title">精益生产顾问</text>
          </view>
          <text class="expert-advice">
            建议工友们在操作过程中注意动作的连贯性，减少不必要的手部移动，保持工作台整洁有序，这样可以提高工作效率，增加产量。
          </text>
        </view>
      </view>
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
      // 筛选标签
      filterTabs: [
        { label: '全部内容' },
        { label: '工厂内部' },
        { label: '行业公开' }
      ],
      activeTab: 0,
      // 分享相关
      showSharePopup: false,
      currentVideo: null,
      // 分享渠道
      shareChannels: [
        { id: 'wechat', name: '微信好友', icon: '💬' },
        { id: 'moment', name: '微信朋友圈', icon: '🌍' },
        { id: 'dingtalk', name: '钉钉', icon: '📱' },
        { id: 'qq', name: 'QQ', icon: '🐧' },
        { id: 'copy', name: '复制链接', icon: '📋' },
        { id: 'save', name: '保存视频', icon: '💾' }
      ],
      // 视频数据
      videos: [
        {
          id: 1,
          title: "平车缝制技巧分享",
          author: "缝纫工小王",
          thumbnail: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sewing%20machine%20operator%20working&image_size=landscape_16_9",
          duration: "03:45",
          views: 1280,
          likes: 89,
          comments: 23,
          shares: 15,
          isInternal: false,
          type: 'industry'
        },
        {
          id: 2,
          title: "裁剪效率提升方法",
          author: "裁剪师老李",
          thumbnail: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fabric%20cutting%20worker&image_size=landscape_16_9",
          duration: "05:20",
          views: 956,
          likes: 67,
          comments: 18,
          shares: 12,
          isInternal: false,
          type: 'industry'
        },
        {
          id: 3,
          title: "熨烫技巧详解",
          author: "熨烫工小张",
          thumbnail: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20ironing%20process&image_size=landscape_16_9",
          duration: "04:15",
          views: 789,
          likes: 54,
          comments: 12,
          shares: 8,
          isInternal: false,
          type: 'industry'
        },
        {
          id: 4,
          title: "工厂内部平车操作规范",
          author: "工厂IE部门",
          thumbnail: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20internal%20training&image_size=landscape_16_9",
          duration: "06:30",
          views: 456,
          likes: 32,
          comments: 15,
          shares: 5,
          isInternal: true,
          type: 'internal'
        },
        {
          id: 5,
          title: "产线优化案例分享",
          author: "工厂管理层",
          thumbnail: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=production%20line%20optimization&image_size=landscape_16_9",
          duration: "08:45",
          views: 321,
          likes: 28,
          comments: 10,
          shares: 3,
          isInternal: true,
          type: 'internal'
        }
      ]
    }
  },
  computed: {
    filteredVideos() {
      if (this.activeTab === 0) {
        // 全部内容，工厂内部内容置顶
        return [...this.videos].sort((a, b) => {
          if (a.isInternal && !b.isInternal) return -1;
          if (!a.isInternal && b.isInternal) return 1;
          return 0;
        });
      } else if (this.activeTab === 1) {
        // 仅工厂内部内容
        return this.videos.filter(video => video.isInternal);
      } else {
        // 仅行业公开内容
        return this.videos.filter(video => !video.isInternal);
      }
    }
  },
  methods: {
    // 切换标签
    switchTab(index) {
      this.activeTab = index;
    },
    uploadVideo() {
      // 选择视频
      uni.chooseVideo({
        sourceType: ['camera', 'album'],
        maxDuration: 60,
        camera: 'back',
        success: (res) => {
          console.log('选择视频成功', res);
          // 这里可以添加上传视频的逻辑
          uni.showToast({
            title: '视频选择成功，正在上传...',
            icon: 'loading'
          });
          // 模拟上传成功
          setTimeout(() => {
            uni.showToast({
              title: '视频上传成功',
              icon: 'success'
            });
          }, 2000);
        },
        fail: (err) => {
          console.error('选择视频失败', err);
          uni.showToast({
            title: '选择视频失败',
            icon: 'none'
          });
        }
      });
    },
    // 分享视频
    shareVideo(video) {
      this.currentVideo = video;
      this.showSharePopup = true;
    },
    // 关闭分享弹窗
    closeSharePopup() {
      this.showSharePopup = false;
    },
    // 选择分享渠道
    selectShareChannel(channel) {
      if (!this.currentVideo) return;
      
      const video = this.currentVideo;
      const shareTitle = `${video.title} | 服装人专属IE提效技巧`;
      const shareDesc = '服装行业专属精益提效平台，学技巧、测工时、涨收入';
      const shareLink = `https://yiqizhuan.com/video/${video.id}?inviter_id=${this.getUserId()}`;
      const shareImageUrl = video.thumbnail;
      
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
          this.saveVideo(video);
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
      this.updateShareCount(this.currentVideo.id);
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
          this.updateShareCount(this.currentVideo.id);
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
    // 保存视频
    saveVideo(video) {
      // 模拟保存视频
      uni.showToast({
        title: '视频已保存到相册',
        icon: 'success'
      });
      // 记录分享数据
      this.updateShareCount(video.id);
      // 发放分享积分
      this.rewardSharePoints();
    },
    // 更新分享次数
    updateShareCount(videoId) {
      const video = this.videos.find(v => v.id === videoId);
      if (video) {
        video.shares++;
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
    // 获取用户ID
    getUserId() {
      // 模拟用户ID
      return 'user_123456';
    },
    // 获取渠道名称
    getChannelName(channelId) {
      const channel = this.shareChannels.find(c => c.id === channelId);
      return channel ? channel.name : '';
    },
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.income-boost-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.back-text {
  font-size: 28rpx;
  color: #333;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 100rpx;
}

/* 内容范围筛选标签 */
.content-filter-section {
  background-color: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.filter-tabs {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 0 30rpx;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  position: relative;
}

.filter-tab.active {
  color: #1890ff;
  font-weight: bold;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 4rpx;
  background-color: #1890ff;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.filter-tab.active .tab-text {
  color: #1890ff;
}

.content {
  padding: 30rpx;
}

.upload-section {
  margin-bottom: 40rpx;
}

.upload-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  border: 2rpx dashed #1890ff;
  transition: all 0.3s ease;
}

.upload-card:active {
  background-color: #f0f7ff;
  transform: scale(0.98);
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.upload-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.upload-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.video-list-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.video-card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.video-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200rpx;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx 16rpx 0 0;
}

.video-duration {
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 20rpx;
  padding: 5rpx 10rpx;
  border-radius: 4rpx;
}

.internal-tag {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  background-color: #fa8c16;
  color: #fff;
  font-size: 20rpx;
  padding: 5rpx 10rpx;
  border-radius: 4rpx;
  font-weight: bold;
}

.video-info {
  padding: 20rpx;
}

.video-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.video-author {
  font-size: 22rpx;
  color: #666;
}

.video-views {
  font-size: 22rpx;
  color: #999;
}

.video-stats {
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

.expert-section {
  margin-bottom: 40rpx;
}

.expert-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.expert-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.expert-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.expert-title {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.expert-advice {
  font-size: 24rpx;
  color: #333;
  line-height: 1.5;
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