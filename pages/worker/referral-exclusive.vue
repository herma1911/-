<template>
  <view class="referral-exclusive-container">
    <!-- 顶部标题区域 -->
    <view class="header">
      <text class="header-title">🎉 喊上老乡，一起吃香</text>
      <text class="header-subtitle">多邀多得，福利享不停</text>
    </view>
    
    <!-- 第一部分：邀请工友，免费领简历置顶 -->
    <view class="section section-primary">
      <text class="section-title">🎯 邀请工友，免费领简历置顶！多邀多得！</text>
      
      <view class="benefits-list">
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">邀请 1 人 → 免费简历置顶 1 天</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">邀请越多 → 置顶天数越多</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">置顶后工厂优先找你，好活抢着要</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">工友给你技能点赞，简历更有分量</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">人气越高，找高薪活越容易</text>
        </view>
      </view>
      
      <view class="callout">
        <text class="callout-text">拉一个赚一天置顶，拉得越多越吃香！</text>
      </view>
      
      <button class="primary-btn" @click="inviteFriends">
        <text class="btn-text">👉 【立即邀请工友】</text>
      </button>
    </view>
    
    <!-- 第二部分：找活不踩坑，记账永不丢 -->
    <view class="section section-secondary">
      <text class="section-title">🔒 找活不踩坑，记账永不丢</text>
      
      <view class="benefits-list">
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">查工厂真实情况，远离黑厂不白跑</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">免费记账，计件工资随手记</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">换厂、换手机，数据都还在</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">一键对账，清清楚楚不扯皮</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✅</text>
          <text class="benefit-text">技能简历在线，好活主动来</text>
        </view>
      </view>
      
      <view class="callout">
        <text class="callout-text">打工就要稳、准、省！</text>
      </view>
      
      <button class="secondary-btn" @click="downloadApp">
        <text class="btn-text">👇 立即下载安装</text>
      </button>
    </view>
    
    <!-- 第三部分：拉新提升四大维度 -->
    <view class="section section-tertiary">
      <text class="section-title">📈 拉新提升四大维度</text>
      
      <view class="dimensions-list">
        <view class="dimension-item">
          <text class="dimension-icon">💼</text>
          <view class="dimension-content">
            <text class="dimension-title">技能档案</text>
          </view>
        </view>
        <view class="dimension-item">
          <text class="dimension-icon">📊</text>
          <view class="dimension-content">
            <text class="dimension-title">记账实绩</text>
          </view>
        </view>
        <view class="dimension-item">
          <text class="dimension-icon">👍</text>
          <view class="dimension-content">
            <text class="dimension-title">工友认可</text>
          </view>
        </view>
        <view class="dimension-item">
          <text class="dimension-icon">⭐</text>
          <view class="dimension-content">
            <text class="dimension-title">工厂评价</text>
          </view>
        </view>
      </view>
      
      <view class="callout">
        <text class="callout-text">拉新不仅赚福利，更能全方位提升个人竞争力！</text>
      </view>
    </view>
    
    <!-- 拉新统计 -->
    <view class="stats-section">
      <text class="stats-title">📊 我的拉新成果</text>
      <view class="stats-container">
        <view class="stat-item">
          <text class="stat-value">{{ totalInvites }}</text>
          <text class="stat-label">已邀请人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalDays }}</text>
          <text class="stat-label">获得置顶天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentRank }}</text>
          <text class="stat-label">当前排名</text>
        </view>
      </view>
    </view>
    
    <!-- 成功案例 -->
    <view class="cases-section">
      <text class="cases-title">🏆 拉新成功案例</text>
      <view class="case-list">
        <view class="case-item">
          <text class="case-avatar">👤</text>
          <view class="case-content">
            <text class="case-name">张三</text>
            <text class="case-description">邀请了 8 位工友，获得 8 天置顶，成功找到月薪 8000+ 的好活！</text>
          </view>
        </view>
        <view class="case-item">
          <text class="case-avatar">👤</text>
          <view class="case-content">
            <text class="case-name">李四</text>
            <text class="case-description">邀请了 12 位工友，获得 12 天置顶，成为工厂优先联系的热门工人！</text>
          </view>
        </view>
        <view class="case-item">
          <text class="case-avatar">👤</text>
          <view class="case-content">
            <text class="case-name">王五</text>
            <text class="case-description">邀请了 5 位工友，获得 5 天置顶，工友点赞让简历更有竞争力！</text>
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
      totalInvites: 0,
      totalDays: 0,
      currentRank: 0
    }
  },
  onLoad() {
    this.loadStats()
  },
  methods: {
    // 加载拉新统计数据
    loadStats() {
      // 从本地存储加载数据
      const referralStats = uni.getStorageSync('referralStats') || {
        totalInvites: 0,
        totalDays: 0,
        currentRank: 0
      }
      
      this.totalInvites = referralStats.totalInvites
      this.totalDays = referralStats.totalDays
      this.currentRank = referralStats.currentRank || Math.floor(Math.random() * 1000) + 1
    },
    
    // 立即邀请工友
    inviteFriends() {
      // 跳转到邀请页面
      uni.navigateTo({
        url: './referral-page'
      })
    },
    
    // 生成分享二维码
    generateShareQRCode() {
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      const username = userInfo.username || 'user'
      
      // 生成分享链接
      const shareUrl = `https://yiqizhuan.com/download?inviter=${encodeURIComponent(username)}`
      
      // 使用在线二维码生成服务
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    },
    
    // 立即下载安装
    downloadApp() {
      uni.showModal({
        title: '下载安装',
        content: '请扫描二维码或在应用商店搜索"衣起赚"进行下载安装',
        confirmText: '我知道了',
        showCancel: false
      })
    }
  }
}
</script>

<style scoped>
.referral-exclusive-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部标题区域 */
.header {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: #fff;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.3);
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
  display: block;
}

.header-subtitle {
  font-size: 22rpx;
  opacity: 0.9;
  display: block;
}

/* 通用区块样式 */
.section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.08);
}

.section-primary {
  border-top: 6rpx solid #FF6B6B;
}

.section-secondary {
  border-top: 6rpx solid #4ECDC4;
}

.section-tertiary {
  border-top: 6rpx solid #FFA726;
}

/* 区块标题 */
.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 25rpx;
  line-height: 1.4;
  text-align: center;
}

/* 福利列表 */
.benefits-list {
  margin-bottom: 25rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.benefit-item:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.benefit-icon {
  font-size: 24rpx;
  margin-right: 15rpx;
  color: #52c41a;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.benefit-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 四大维度列表 */
.dimensions-list {
  margin-bottom: 25rpx;
}

.dimension-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.dimension-item:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.dimension-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: #FFA726;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.dimension-content {
  flex: 1;
}

.dimension-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.dimension-description {
  font-size: 20rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

/* 行动号召 */
.callout {
  background-color: #FFF3E0;
  border: 1rpx solid #FFE0B2;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  text-align: center;
}

.callout-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #E65100;
  line-height: 1.4;
}

/* 按钮样式 */
.primary-btn {
  width: 100%;
  padding: 20rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.primary-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(255, 107, 107, 0.2);
}

.secondary-btn {
  width: 100%;
  padding: 20rpx;
  background: linear-gradient(135deg, #4ECDC4 0%, #45B7AA 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 20rpx rgba(78, 205, 196, 0.3);
  transition: all 0.3s ease;
}

.secondary-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(78, 205, 196, 0.2);
}

.btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 统计区域 */
.stats-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.08);
}

.stats-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 25rpx;
  text-align: center;
}

.stats-container {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background-color: #f0f9ff;
  border-radius: 12rpx;
  border: 1rpx solid #bae7ff;
  flex: 1;
  margin: 0 10rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1890ff;
  display: block;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: 18rpx;
  color: #666;
  display: block;
}

/* 成功案例 */
.cases-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.08);
}

.cases-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 25rpx;
  text-align: center;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.case-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.case-item:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.case-avatar {
  font-size: 48rpx;
  margin-right: 15rpx;
  flex-shrink: 0;
}

.case-content {
  flex: 1;
}

.case-name {
  font-size: 22rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.case-description {
  font-size: 20rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .section-title {
    font-size: 24rpx;
  }
  
  .benefit-text {
    font-size: 20rpx;
  }
  
  .callout-text {
    font-size: 22rpx;
  }
  
  .btn-text {
    font-size: 22rpx;
  }
}
</style>