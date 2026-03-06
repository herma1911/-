<template>
  <view class="my-benefits-container">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <text class="back-btn" @tap="goBack">←</text>
      <text class="page-title">我的权益</text>
    </view>
    
    <!-- 衣起分区域 -->
    <view class="yiqi-points-section">
      <view class="points-header">
        <text class="points-title">衣起分</text>
        <text class="points-balance">余额：{{ yiqiPoints }}分</text>
      </view>
      <view class="points-card">
        <view class="points-info">
          <text class="points-value">{{ yiqiPoints }}</text>
          <text class="points-label">衣起分</text>
        </view>
        <view class="points-actions">
          <button class="points-btn" @tap="viewPointsDetail">积分明细</button>
          <button class="points-btn" @tap="viewPointsRules">积分规则</button>
        </view>
      </view>
    </view>
    
    <!-- 拉新奖励区域 -->
    <view class="invite-section">
      <view class="invite-header">
        <text class="invite-title">拉新奖励</text>
        <text class="invite-bonus">已获得奖励：¥{{ inviteBonus }}元</text>
      </view>
      <view class="invite-card">
        <view class="invite-code-section">
          <text class="invite-code-label">我的邀请码</text>
          <view class="invite-code-container">
            <text class="invite-code">{{ inviteCode }}</text>
            <button class="copy-btn" @tap="copyInviteCode">复制</button>
          </view>
        </view>
        <view class="invite-rules">
          <text class="rule-item">• 邀请新用户注册，奖励10元</text>
          <text class="rule-item">• 邀请的用户完成首单，额外奖励20元</text>
          <text class="rule-item">• 邀请的用户绑定班组，再奖励30元</text>
        </view>
        <button class="invite-btn" @tap="shareInviteCode">立即邀请</button>
      </view>
      <view class="invite-records" @tap="viewInviteRecords">
        <text class="records-title">邀请记录</text>
        <text class="records-count">{{ inviteRecords.length }}人</text>
        <text class="arrow">→</text>
      </view>
    </view>
    
    <!-- 其他权益区域 -->
    <view class="other-benefits-section">
      <view class="section-title">其他权益</view>
      <view class="benefits-grid">
        <view class="benefit-card" @tap="viewNewUserBenefits">
          <text class="benefit-icon">🎁</text>
          <text class="benefit-title">新人福利</text>
          <text class="benefit-desc">注册即送新人礼包</text>
        </view>
        
        <view class="benefit-card" @tap="viewWorkRewards">
          <text class="benefit-icon">🏆</text>
          <text class="benefit-title">工作奖励</text>
          <text class="benefit-desc">完成任务获得奖励</text>
        </view>
        
        <view class="benefit-card" @tap="viewMemberPrivileges">
          <text class="benefit-icon">💎</text>
          <text class="benefit-title">会员特权</text>
          <text class="benefit-desc">享受专属特权</text>
        </view>
        
        <view class="benefit-card" @tap="viewGrowthSystem">
          <text class="benefit-icon">📈</text>
          <text class="benefit-title">成长体系</text>
          <text class="benefit-desc">提升等级解锁权益</text>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">如有疑问，请联系客服</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 衣起分数据
      yiqiPoints: 1280,
      // 拉新数据
      inviteCode: 'YQZ' + Math.floor(Math.random() * 10000),
      inviteBonus: 150,
      inviteRecords: [
        {
          id: 1,
          name: '张三',
          phone: '138****1234',
          status: '已完成首单',
          bonus: 30,
          date: '2026-03-01'
        },
        {
          id: 2,
          name: '李四',
          phone: '139****5678',
          status: '已注册',
          bonus: 10,
          date: '2026-02-28'
        },
        {
          id: 3,
          name: '王五',
          phone: '137****9012',
          status: '已绑定班组',
          bonus: 60,
          date: '2026-02-25'
        }
      ],
      // 其他权益数据
      benefits: [
        {
          icon: '🎁',
          title: '新人福利',
          desc: '注册即送新人礼包'
        },
        {
          icon: '🏆',
          title: '工作奖励',
          desc: '完成任务获得奖励'
        },
        {
          icon: '💎',
          title: '会员特权',
          desc: '享受专属特权'
        },
        {
          icon: '📈',
          title: '成长体系',
          desc: '提升等级解锁权益'
        }
      ]
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    // 查看积分明细
    viewPointsDetail() {
      uni.showModal({
        title: '积分明细',
        content: '• 注册奖励：100分\n• 完成首单：200分\n• 每日签到：80分\n• 邀请好友：500分\n• 绑定班组：400分',
        showCancel: false
      })
    },
    // 查看积分规则
    viewPointsRules() {
      uni.showModal({
        title: '积分规则',
        content: '1. 注册即送100积分\n2. 完成首单送200积分\n3. 每日签到送10积分\n4. 邀请好友注册送50积分\n5. 邀请好友完成首单再送100积分\n6. 绑定班组送400积分\n7. 积分可用于兑换礼品和优惠券',
        showCancel: false
      })
    },
    // 复制邀请码
    copyInviteCode() {
      uni.setClipboardData({
        data: this.inviteCode,
        success: () => {
          uni.showToast({
            title: '邀请码复制成功',
            icon: 'success'
          })
        }
      })
    },
    // 分享邀请码
    shareInviteCode() {
      uni.showActionSheet({
        itemList: ['分享到微信好友', '分享到朋友圈', '分享到QQ'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 模拟分享到微信
            uni.showToast({
              title: '分享到微信成功',
              icon: 'success'
            })
          } else if (res.tapIndex === 1) {
            // 模拟分享到朋友圈
            uni.showToast({
              title: '分享到朋友圈成功',
              icon: 'success'
            })
          } else if (res.tapIndex === 2) {
            // 模拟分享到QQ
            uni.showToast({
              title: '分享到QQ成功',
              icon: 'success'
            })
          }
        }
      })
    },
    // 查看邀请记录
    viewInviteRecords() {
      uni.showModal({
        title: '邀请记录',
        content: this.inviteRecords.map(record => {
          return `${record.name} (${record.phone}) - ${record.status} - ¥${record.bonus} - ${record.date}`
        }).join('\n'),
        showCancel: false
      })
    },
    // 查看新人福利
    viewNewUserBenefits() {
      uni.showModal({
        title: '新人福利',
        content: '• 注册即送50元优惠券\n• 完成首单额外送20元\n• 绑定班组再送30元',
        showCancel: false
      })
    },
    // 查看工作奖励
    viewWorkRewards() {
      uni.showModal({
        title: '工作奖励',
        content: '• 完成工作任务，获得额外奖励\n• 连续工作7天，奖励50元\n• 连续工作30天，奖励200元',
        showCancel: false
      })
    },
    // 查看会员特权
    viewMemberPrivileges() {
      uni.showModal({
        title: '会员特权',
        content: '• 普通会员：享受基础权益\n• 银卡会员：享受9折优惠\n• 金卡会员：享受8折优惠\n• 钻石会员：享受7折优惠',
        showCancel: false
      })
    },
    // 查看成长体系
    viewGrowthSystem() {
      uni.showModal({
        title: '成长体系',
        content: '• 实习工：0-1000分\n• 熟练工：1001-5000分\n• 技术工：5001-10000分\n• 大师傅：10001分以上',
        showCancel: false
      })
    }
  }
}
</script>

<style scoped>
.my-benefits-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4A90E2;
  padding: 20rpx 30rpx;
  height: 120rpx;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  font-size: 36rpx;
  color: #fff;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

/* 衣起分区域 */
.yiqi-points-section {
  padding: 30rpx;
  background: linear-gradient(135deg, #4A90E2 0%, #6AA9F4 100%);
  color: #fff;
  margin-bottom: 20rpx;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.points-title {
  font-size: 32rpx;
  font-weight: 600;
}

.points-balance {
  font-size: 24rpx;
  opacity: 0.9;
}

.points-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 30rpx;
  backdrop-filter: blur(10rpx);
}

.points-info {
  text-align: center;
  margin-bottom: 20rpx;
}

.points-value {
  font-size: 64rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.points-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.points-actions {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.points-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 15rpx;
  font-size: 24rpx;
  font-weight: 600;
}

/* 拉新奖励区域 */
.invite-section {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.invite-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.invite-bonus {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: 600;
}

.invite-card {
  background: #f5fafe;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.invite-code-section {
  margin-bottom: 20rpx;
}

.invite-code-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.invite-code-container {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.invite-code {
  flex: 1;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 15rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.copy-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 15rpx 25rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.invite-rules {
  margin-bottom: 20rpx;
}

.rule-item {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.4;
}

.invite-btn {
  width: 100%;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.invite-records {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.records-title {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}

.records-count {
  font-size: 24rpx;
  color: #1677ff;
  font-weight: 600;
}

.arrow {
  font-size: 24rpx;
  color: #999;
}

/* 其他权益区域 */
.other-benefits-section {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.benefit-card {
  background-color: #f8f9fa;
  border-radius: 15rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.benefit-card:active {
  transform: translateY(-5rpx);
}

.benefit-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.benefit-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  text-align: center;
}

.benefit-desc {
  font-size: 20rpx;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.footer {
  margin-top: 40rpx;
  text-align: center;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  margin: 0 30rpx 30rpx;
}

.footer-text {
  font-size: 20rpx;
  color: #999;
}
</style>