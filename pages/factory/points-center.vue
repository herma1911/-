<template>
  <view class="points-center-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-left">
        <text class="back-btn" @tap="navigateBack">←</text>
        <text class="page-title">积分中心</text>
      </view>
    </view>
    
    <!-- 积分概览 -->
    <view class="points-overview">
      <view class="points-card">
        <text class="points-icon">💎</text>
        <view class="points-info">
          <text class="points-value">{{availablePoints}}</text>
          <text class="points-label">可用积分</text>
        </view>
      </view>
    </view>
    
    <!-- 积分获取途径 -->
    <view class="points-section">
      <text class="section-title">积分获取途径</text>
      <view class="points-ways">
        <view class="way-item">
          <text class="way-icon">💰</text>
          <view class="way-info">
            <text class="way-title">完成闭环发薪</text>
            <text class="way-desc">每完成一次闭环发薪，获得10积分</text>
          </view>
        </view>
        <view class="way-item">
          <text class="way-icon">👥</text>
          <view class="way-info">
            <text class="way-title">邀请新工人</text>
            <text class="way-desc">每邀请一位新工人，获得20积分</text>
          </view>
        </view>
        <view class="way-item">
          <text class="way-icon">📱</text>
          <view class="way-info">
            <text class="way-title">每日签到</text>
            <text class="way-desc">每日签到，获得5积分</text>
          </view>
        </view>
        <view class="way-item">
          <text class="way-icon">🏆</text>
          <view class="way-info">
            <text class="way-title">等级提升</text>
            <text class="way-desc">等级提升时，获得50积分</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 积分兑换权益 -->
    <view class="points-section">
      <text class="section-title">积分兑换权益</text>
      <view class="rewards-list">
        <view class="reward-item" @tap="exchangeReward(reward)" v-for="reward in rewards" :key="reward.id">
          <view class="reward-icon">{{reward.icon}}</view>
          <view class="reward-info">
            <text class="reward-name">{{reward.name}}</text>
            <text class="reward-desc">{{reward.description}}</text>
          </view>
          <view class="reward-cost">
            <text class="cost-points">{{reward.points}}积分</text>
            <text class="exchange-btn">兑换</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 兑换记录 -->
    <view class="points-section">
      <text class="section-title">兑换记录</text>
      <view class="exchange-records">
        <view class="record-item" v-for="record in exchangeRecords" :key="record.id">
          <view class="record-info">
            <text class="record-name">{{record.rewardName}}</text>
            <text class="record-time">{{record.time}}</text>
          </view>
          <text class="record-points">-{{record.points}}积分</text>
        </view>
        <view v-if="exchangeRecords.length === 0" class="empty-records">
          <text>暂无兑换记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      availablePoints: 1250,
      rewards: [
        {
          id: 1,
          name: '招聘优先展示',
          description: '招聘信息优先展示24小时',
          points: 100,
          icon: '📢'
        },
        {
          id: 2,
          name: '岗位置顶',
          description: '岗位置顶7天',
          points: 200,
          icon: '🔝'
        },
        {
          id: 3,
          name: '免费海报生成',
          description: '免费生成招工海报5次',
          points: 150,
          icon: '🎨'
        },
        {
          id: 4,
          name: '等级加速卡',
          description: '等级提升速度+20%，持续7天',
          points: 300,
          icon: '🚀'
        }
      ],
      exchangeRecords: [
        {
          id: 1,
          rewardName: '招聘优先展示',
          points: 100,
          time: '2026-03-01 14:30'
        },
        {
          id: 2,
          rewardName: '岗位置顶',
          points: 200,
          time: '2026-02-15 09:15'
        }
      ]
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    exchangeReward(reward) {
      if (this.availablePoints >= reward.points) {
        uni.showModal({
          title: '确认兑换',
          content: `确定要花费${reward.points}积分兑换${reward.name}吗？`,
          success: (res) => {
            if (res.confirm) {
              this.availablePoints -= reward.points
              // 添加兑换记录
              this.exchangeRecords.unshift({
                id: Date.now(),
                rewardName: reward.name,
                points: reward.points,
                time: new Date().toLocaleString('zh-CN')
              })
              uni.showToast({
                title: '兑换成功',
                icon: 'success'
              })
            }
          }
        })
      } else {
        uni.showToast({
          title: '积分不足',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.points-center-container {
  padding: 100rpx 0 0 0;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  height: 80rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

/* 积分概览 */
.points-overview {
  padding: 24rpx;
}

.points-card {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.points-icon {
  font-size: 80rpx;
}

.points-info {
  flex: 1;
}

.points-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.points-label {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 积分部分 */
.points-section {
  margin-bottom: 24rpx;
  padding: 0 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

/* 积分获取途径 */
.points-ways {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.way-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.way-item:last-child {
  border-bottom: none;
}

.way-icon {
  font-size: 48rpx;
  width: 60rpx;
  text-align: center;
}

.way-info {
  flex: 1;
}

.way-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.way-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 积分兑换权益 */
.rewards-list {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.reward-item:active {
  background-color: #f9f9f9;
}

.reward-item:last-child {
  border-bottom: none;
}

.reward-icon {
  font-size: 48rpx;
  width: 60rpx;
  text-align: center;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.reward-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
}

.reward-cost {
  text-align: right;
}

.cost-points {
  font-size: 20rpx;
  color: #ff6b6b;
  display: block;
  margin-bottom: 8rpx;
}

.exchange-btn {
  font-size: 20rpx;
  color: #667eea;
  font-weight: 500;
  padding: 8rpx 16rpx;
  border: 2rpx solid #667eea;
  border-radius: 20rpx;
  display: inline-block;
}

/* 兑换记录 */
.exchange-records {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  flex: 1;
}

.record-name {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.record-time {
  font-size: 18rpx;
  color: #999;
  display: block;
}

.record-points {
  font-size: 24rpx;
  color: #ff6b6b;
  font-weight: 500;
}

.empty-records {
  padding: 48rpx;
  text-align: center;
  color: #999;
  font-size: 20rpx;
}
</style>