<template>
  <view class="growth-center-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-bar">
        <text class="back-btn" @click="goBack">←</text>
        <text class="page-title">我的搞钱成长</text>
        <text class="empty"></text>
      </view>
    </view>
    
    <!-- 等级展示区 -->
    <view class="level-section">
      <view class="level-card">
        <view class="level-header">
          <text class="level-title">{{ levelInfo.levelName }}</text>
          <text class="level-desc">{{ growthSystem.growthLevels[levelInfo.currentLevel].description }}</text>
        </view>
        
        <view class="level-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: levelInfo.progress + '%' }"></view>
          </view>
          <text class="progress-text">
            {{ levelInfo.progress }}% {{ levelInfo.nextLevel ? '，再努力' + levelInfo.remaining + '天即可升级' : '，已解锁全部权益' }}
          </text>
        </view>
        
        <view class="level-benefits">
          <text class="benefits-title">已解锁权益</text>
          <view class="benefits-list">
            <view v-for="(benefit, index) in userBenefits" :key="index" class="benefit-item">
              <text class="benefit-icon">✅</text>
              <text class="benefit-text">{{ benefit }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 解锁任务区 -->
    <view class="tasks-section">
      <view class="section-header">
        <text class="section-title">解锁任务</text>
        <text class="section-subtitle">完成任务，免费解锁更多权益</text>
      </view>
      
      <view class="tasks-list">
        <view v-for="(task, index) in unlockTasks" :key="index" class="task-item" :class="{ completed: task.completed }">
          <view class="task-info">
            <text class="task-title">{{ task.title }}</text>
            <text class="task-progress">{{ task.progress }}/{{ task.target }}</text>
          </view>
          <view class="task-status">
            <text v-if="task.completed" class="status-completed">已完成</text>
            <text v-else class="status-pending">进行中</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 成长加速区 -->
    <view class="accelerator-section">
      <view class="section-header">
        <text class="section-title">成长加速</text>
        <text class="section-subtitle">邀请工友，加速解锁高等级权益</text>
      </view>
      
      <view class="accelerator-card">
        <text class="accelerator-desc">成功邀请1位工友注册，可直接抵扣7天连续记工时长</text>
        <button class="invite-btn" @click="inviteFriends">立即邀请</button>
      </view>
    </view>
    
    <!-- 权益预览区 -->
    <view class="preview-section">
      <view class="section-header">
        <text class="section-title">权益预览</text>
        <text class="section-subtitle">提升等级，解锁更多高价值权益</text>
      </view>
      
      <view class="preview-cards">
        <view v-for="(level, key) in growthSystem.growthLevels" :key="key" class="preview-card" :class="{ active: key === levelInfo.currentLevel }">
          <text class="preview-level">{{ level.name }}</text>
          <text class="preview-desc">{{ level.description }}</text>
          <view class="preview-benefits">
            <text v-for="(benefit, index) in level.benefits.slice(0, 3)" :key="index" class="preview-benefit">• {{ benefit }}</text>
            <text v-if="level.benefits.length > 3" class="preview-more">...等{{ level.benefits.length }}项权益</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import growthSystem from '../../utils/growth-system.js'

export default {
  data() {
    return {
      growthSystem,
      levelInfo: {
        currentLevel: 'new',
        progress: 0,
        nextLevel: 'active',
        remaining: 28,
        levelName: '新手工友'
      },
      userBenefits: [],
      unlockTasks: [
        {
          title: '连续记工满28天',
          progress: 15,
          target: 28,
          completed: false
        },
        {
          title: '累计记工满100条',
          progress: 35,
          target: 100,
          completed: false
        },
        {
          title: '成功邀请2位工友完成注册',
          progress: 1,
          target: 2,
          completed: false
        },
        {
          title: '成功入职平台合作工厂满1个月',
          progress: 0,
          target: 30,
          completed: false
        }
      ]
    }
  },
  onLoad() {
    this.loadUserData()
  },
  methods: {
    loadUserData() {
      // 模拟用户数据
      const userData = {
        growthData: {
          continuousCheckinDays: 15,
          totalCheckinCount: 35,
          inviteCount: 1,
          employmentDays: 0,
          growthPoints: 0
        }
      }
      
      // 获取等级信息
      this.levelInfo = growthSystem.getLevelProgress(userData)
      
      // 获取用户权益
      this.userBenefits = growthSystem.getLevelBenefits(this.levelInfo.currentLevel)
    },
    inviteFriends() {
      uni.showActionSheet({
        itemList: ['分享到微信', '复制邀请链接'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '已选择分享到微信',
              icon: 'none'
            })
          } else if (res.tapIndex === 1) {
            uni.setClipboardData({
              data: 'https://yiqizhuan.com/invite/' + Math.random().toString(36).substr(2, 9),
              success: () => {
                uni.showToast({
                  title: '邀请链接已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.growth-center-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 32rpx;
  color: #333;
  width: 40rpx;
}

.page-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: center;
}

.empty {
  width: 40rpx;
}

/* 等级展示区 */
.level-section {
  margin-bottom: 20rpx;
}

.level-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
}

.level-header {
  margin-bottom: 20rpx;
}

.level-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.level-desc {
  font-size: 24rpx;
  opacity: 0.9;
  line-height: 1.4;
}

.level-progress {
  margin-bottom: 20rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  margin-bottom: 10rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffd700;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  opacity: 0.9;
  display: block;
}

.level-benefits {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
}

.benefits-title {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
  display: block;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.benefit-icon {
  font-size: 20rpx;
  margin-top: 2rpx;
}

.benefit-text {
  font-size: 22rpx;
  line-height: 1.4;
  flex: 1;
}

/* 解锁任务区 */
.tasks-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.section-subtitle {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  border-left: 4rpx solid #1677ff;
}

.task-item.completed {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.task-progress {
  font-size: 20rpx;
  color: #666;
}

.task-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.status-completed {
  background: #f6ffed;
  color: #52c41a;
}

.status-pending {
  background: #e6f7ff;
  color: #1677ff;
}

/* 成长加速区 */
.accelerator-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.accelerator-card {
  background: linear-gradient(135deg, #fff7e6 0%, #ffefcc 100%);
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #ffd591;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.accelerator-desc {
  font-size: 24rpx;
  color: #d48806;
  line-height: 1.4;
}

.invite-btn {
  background: linear-gradient(90deg, #fa8c16 0%, #ffc53d 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx;
  font-size: 24rpx;
  font-weight: bold;
}

/* 权益预览区 */
.preview-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.preview-cards {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.preview-card {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  border-left: 4rpx solid #e8e8e8;
}

.preview-card.active {
  background: #e6f7ff;
  border-left-color: #1677ff;
}

.preview-level {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.preview-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.preview-benefits {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.preview-benefit {
  font-size: 20rpx;
  color: #666;
  line-height: 1.4;
}

.preview-more {
  font-size: 18rpx;
  color: #999;
  margin-top: 5rpx;
}
</style>