<template>
  <view class="growth-management-container">
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">运营增长管理</text>
      <text class="empty"></text>
    </view>
    
    <!-- 增长概览 -->
    <view class="overview-section">
      <text class="section-title">📊 增长概览</text>
      <view class="overview-cards">
        <view class="overview-card">
          <text class="card-icon">👥</text>
          <text class="card-title">总拉新数</text>
          <text class="card-value">{{ totalInvites }}</text>
          <text class="card-desc">包括工厂和工人</text>
        </view>
        <view class="overview-card">
          <text class="card-icon">📈</text>
          <text class="card-title">工厂积分</text>
          <text class="card-value">{{ factoryScore }}</text>
          <text class="card-desc">{{ rankLevel.name }}</text>
        </view>
        <view class="overview-card">
          <text class="card-icon">🔑</text>
          <text class="card-title">剩余权限</text>
          <text class="card-value">{{ remainingPermissions }}</text>
          <text class="card-desc">通用简历解锁</text>
        </view>
        <view class="overview-card">
          <text class="card-icon">💎</text>
          <text class="card-title">会员等级</text>
          <text class="card-value">{{ membershipLevel }}</text>
          <text class="card-desc">{{ membershipDesc }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能标签页 -->
    <view class="tab-section">
      <view class="tab-buttons">
        <button 
          class="tab-btn" 
          :class="activeTab === 'referral' ? 'tab-active' : ''" 
          @click="activeTab = 'referral'"
        >
          拉新裂变
        </button>
        <button 
          class="tab-btn" 
          :class="activeTab === 'traffic' ? 'tab-active' : ''" 
          @click="activeTab = 'traffic'"
        >
          流量加权
        </button>
        <button 
          class="tab-btn" 
          :class="activeTab === 'packages' ? 'tab-active' : ''" 
          @click="activeTab = 'packages'"
        >
          付费套餐
        </button>
      </view>
    </view>
    
    <!-- 拉新裂变 -->
    <view v-if="activeTab === 'referral'" class="referral-section">
      <text class="section-subtitle">双向拉新奖励体系</text>
      
      <view class="referral-stats">
        <view class="stat-item">
          <text class="stat-value">{{ totalFactories }}</text>
          <text class="stat-label">邀请工厂数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalWorkers }}</text>
          <text class="stat-label">邀请工人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalPermissionsGained }}</text>
          <text class="stat-label">获得权限数</text>
        </view>
      </view>
      
      <view class="referral-actions">
        <button class="action-btn primary" @click="generateReferralCode">生成邀请码</button>
        <button class="action-btn secondary" @click="navigateToReferralPage">查看详情</button>
      </view>
      
      <view class="reward-preview">
        <text class="preview-title">🎁 拉新奖励预览</text>
        <view class="reward-item">
          <text class="reward-label">邀请1家工厂：</text>
          <text class="reward-value">5份通用权限 + 7天岗位置顶</text>
        </view>
        <view class="reward-item">
          <text class="reward-label">邀请5名工人：</text>
          <text class="reward-value">30份通用权限 + 10天岗位置顶</text>
        </view>
        <view class="reward-item">
          <text class="reward-label">月度推荐20名工人：</text>
          <text class="reward-value">破格升级为B级工厂</text>
        </view>
      </view>
    </view>
    
    <!-- 流量加权 -->
    <view v-if="activeTab === 'traffic'" class="traffic-section">
      <text class="section-subtitle">积分与排名管理</text>
      
      <view class="score-card">
        <text class="score-value">{{ factoryScore }}</text>
        <text class="score-label">当前积分</text>
        <text class="score-desc">{{ rankLevel.description }}</text>
      </view>
      
      <view class="score-trends">
        <text class="trends-title">📈 积分趋势</text>
        <view class="trend-chart">
          <view class="chart-bar" v-for="(item, index) in scoreTrends" :key="index" :style="{ height: item.height + '%' }"></view>
        </view>
        <view class="chart-labels">
          <text class="chart-label" v-for="(item, index) in scoreTrends" :key="index">{{ item.label }}</text>
        </view>
      </view>
      
      <view class="score-actions">
        <text class="actions-title">⚡ 快速加分</text>
        <view class="action-grid">
          <view class="action-item" @click="addScore('login')">
            <text class="action-icon">📅</text>
            <text class="action-text">每日登录 +2</text>
          </view>
          <view class="action-item" @click="addScore('publish')">
            <text class="action-icon">📢</text>
            <text class="action-text">发布招工 +15</text>
          </view>
          <view class="action-item" @click="addScore('certify')">
            <text class="action-icon">✅</text>
            <text class="action-text">完成认证 +30</text>
          </view>
          <view class="action-item" @click="addScore('active')">
            <text class="action-icon">💬</text>
            <text class="action-text">主动联系 +5</text>
          </view>
        </view>
      </view>
      
      <view class="score-rules">
        <text class="rules-title">📝 积分规则</text>
        <view class="rules-content">
          <view class="rule-item">
            <text class="rule-type">加分项</text>
            <text class="rule-detail">认证加分、付费会员、活跃度、信誉好评</text>
          </view>
          <view class="rule-item">
            <text class="rule-type">扣分项</text>
            <text class="rule-detail">资料虚假、招工违规、工人投诉、不活跃</text>
          </view>
          <view class="rule-item">
            <text class="rule-type">处罚等级</text>
            <text class="rule-detail">积分＜50分：排名靠后；≤0分：限制联系；≤-50分：隐藏工厂</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 付费套餐 -->
    <view v-if="activeTab === 'packages'" class="packages-section">
      <text class="section-subtitle">会员套餐与增值服务</text>
      
      <view class="packages-grid">
        <view class="package-card" :class="{ recommended: pkg.recommended }" v-for="pkg in packages" :key="pkg.id">
          <text class="package-badge" v-if="pkg.recommended">推荐</text>
          <text class="package-name">{{ pkg.name }}</text>
          <text class="package-price">¥{{ pkg.price }}/{{ pkg.period }}</text>
          <view class="package-features">
            <text class="feature-item" v-for="feature in pkg.features" :key="feature">{{ feature }}</text>
          </view>
          <button class="package-btn" @click="purchasePackage(pkg)">{{ pkg.buttonText }}</button>
        </view>
      </view>
      
      <view class="value-added-services">
        <text class="services-title">💎 增值服务</text>
        <view class="service-grid">
          <view class="service-item" @click="purchaseService(service)" v-for="service in valueAddedServices" :key="service.id">
            <text class="service-icon">{{ service.icon }}</text>
            <text class="service-name">{{ service.name }}</text>
            <text class="service-price">¥{{ service.price }}</text>
          </view>
        </view>
      </view>
      
      <view class="purchase-history">
        <text class="history-title">📋 购买记录</text>
        <view class="history-list">
          <view v-if="purchaseHistory.length === 0" class="empty-history">
            <text>暂无购买记录</text>
          </view>
          <view v-for="(item, index) in purchaseHistory" :key="index" class="history-item">
            <text class="history-time">{{ item.time }}</text>
            <text class="history-name">{{ item.name }}</text>
            <text class="history-price">¥{{ item.price }}</text>
            <text class="history-status" :class="item.status">{{ item.status }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import factoryLevelSystem from '../../utils/factory-level-system.js'

export default {
  data() {
    return {
      activeTab: 'referral',
      totalInvites: 0,
      totalFactories: 0,
      totalWorkers: 0,
      totalPermissionsGained: 0,
      factoryScore: 100,
      rankLevel: { name: '正常状态', description: '正常展示，排名根据积分' },
      remainingPermissions: 10,
      membershipLevel: '普通会员',
      membershipDesc: '基础功能权限',
      scoreTrends: [
        { label: '1月', height: 60 },
        { label: '2月', height: 75 },
        { label: '3月', height: 65 },
        { label: '4月', height: 85 },
        { label: '5月', height: 90 },
        { label: '6月', height: 80 }
      ],
      packages: [
        {
          id: 1,
          name: '基础套餐',
          price: 99,
          period: '月',
          features: [
            '50份通用简历解锁权限',
            '7天岗位置顶',
            '优先客服支持',
            '基础数据分析'
          ],
          buttonText: '立即购买',
          recommended: false
        },
        {
          id: 2,
          name: '专业套餐',
          price: 299,
          period: '月',
          features: [
            '200份通用简历解锁权限',
            '30天岗位置顶',
            '10份优质专属权限',
            '高级数据分析',
            '专属客服经理'
          ],
          buttonText: '立即购买',
          recommended: true
        },
        {
          id: 3,
          name: '企业套餐',
          price: 999,
          period: '月',
          features: [
            '无限简历解锁权限',
            '90天岗位置顶',
            '50份优质专属权限',
            '企业级数据分析',
            '专属运营顾问',
            '定制化解决方案'
          ],
          buttonText: '立即购买',
          recommended: false
        }
      ],
      valueAddedServices: [
        {
          id: 1,
          name: '岗位置顶',
          price: 50,
          icon: '📢'
        },
        {
          id: 2,
          name: '简历解锁包',
          price: 80,
          icon: '🔓'
        },
        {
          id: 3,
          name: '招聘推广',
          price: 120,
          icon: '🚀'
        },
        {
          id: 4,
          name: '数据分析',
          price: 60,
          icon: '📊'
        }
      ],
      purchaseHistory: []
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    loadData() {
      // 加载拉新数据
      const referralStats = uni.getStorageSync('referralStats') || {
        totalInvites: 5,
        totalFactories: 2,
        totalWorkers: 3,
        totalPermissions: 45
      }
      this.totalInvites = referralStats.totalInvites
      this.totalFactories = referralStats.totalFactories
      this.totalWorkers = referralStats.totalWorkers
      this.totalPermissionsGained = referralStats.totalPermissions
      
      // 加载工厂等级数据
      const factoryData = uni.getStorageSync('factoryData') || {
        level: 'B',
        totalClosedPay: 100,
        closedPayRate: 0.95,
        continuousPayMonth: 6,
        workerGoodRate: 0.9,
        totalInviteFactory: 3,
        totalInviteWorker: 50,
        monthlyLoginDays: 20,
        violationCount: 0,
        unlockPermissions: {
          general: 10,
          premium: 0
        }
      }
      
      // 获取当前等级
      const currentLevel = factoryLevelSystem.getFactoryLevel(factoryData)
      const levelInfo = factoryLevelSystem.factoryLevels[currentLevel]
      
      this.factoryScore = factoryData.totalClosedPay // 使用闭环发薪次数作为显示值
      this.rankLevel = { 
        name: levelInfo.name, 
        description: levelInfo.benefits[0] 
      }
      
      this.remainingPermissions = factoryData.unlockPermissions.general
      
      // 加载购买记录
      this.purchaseHistory = uni.getStorageSync('purchaseHistory') || [
        {
          time: '2026-02-15',
          name: '基础套餐',
          price: 99,
          status: 'active'
        },
        {
          time: '2026-01-20',
          name: '岗位置顶',
          price: 50,
          status: 'expired'
        }
      ]
    },
    generateReferralCode() {
      const referralCode = 'F' + Math.random().toString(36).substr(2, 8).toUpperCase()
      uni.setStorageSync('referralCode', referralCode)
      
      uni.showModal({
        title: '邀请码生成成功',
        content: `您的专属邀请码：${referralCode}\n\n分享给其他工厂或工人，双方都可获得奖励！`,
        confirmText: '复制邀请码',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: referralCode,
              success: () => {
                uni.showToast({ title: '邀请码已复制', icon: 'success' })
              }
            })
          }
        }
      })
    },
    navigateToReferralPage() {
      uni.navigateTo({
        url: '../worker/referral-page'
      })
    },
    addScore(type) {
      const companyId = '123' // 假设工厂ID
      let score = 0
      let reason = ''
      
      switch (type) {
        case 'login':
          score = 2
          reason = '每日登录'
          break
        case 'publish':
          score = 15
          reason = '发布招工'
          break
        case 'certify':
          score = 30
          reason = '完成认证'
          break
        case 'active':
          score = 5
          reason = '主动联系工人'
          break
      }
      
      updateFactoryScore(companyId, score, reason, 'add')
      this.loadData()
      
      uni.showToast({
        title: `成功获得 ${score} 积分`,
        icon: 'success'
      })
    },
    purchasePackage(pkg) {
      uni.showModal({
        title: '确认购买',
        content: `您确定要购买 ${pkg.name} 吗？\n价格：¥${pkg.price}/${pkg.period}`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 模拟购买成功
            const newPurchase = {
              time: new Date().toISOString().split('T')[0],
              name: pkg.name,
              price: pkg.price,
              status: 'active'
            }
            
            this.purchaseHistory.unshift(newPurchase)
            uni.setStorageSync('purchaseHistory', this.purchaseHistory)
            
            uni.showToast({
              title: '购买成功！',
              icon: 'success'
            })
          }
        }
      })
    },
    purchaseService(service) {
      uni.showModal({
        title: '确认购买',
        content: `您确定要购买 ${service.name} 吗？\n价格：¥${service.price}`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 模拟购买成功
            const newPurchase = {
              time: new Date().toISOString().split('T')[0],
              name: service.name,
              price: service.price,
              status: 'active'
            }
            
            this.purchaseHistory.unshift(newPurchase)
            uni.setStorageSync('purchaseHistory', this.purchaseHistory)
            
            uni.showToast({
              title: '购买成功！',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.growth-management-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  font-size: 36rpx;
  color: white;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.empty {
  width: 36rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.section-subtitle {
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 24rpx;
  display: block;
}

/* 概览区域 */
.overview-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.overview-card {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  border: 1rpx solid #e0e0e0;
}

.card-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  display: block;
}

.card-title {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.card-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
  display: block;
}

.card-desc {
  font-size: 16rpx;
  color: #999;
  display: block;
}

/* 标签页 */
.tab-section {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.tab-buttons {
  display: flex;
  gap: 12rpx;
}

.tab-btn {
  flex: 1;
  padding: 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 22rpx;
  background-color: white;
  color: #666;
  transition: all 0.3s ease;
}

.tab-btn.active {
  border-color: #667eea;
  background-color: #667eea;
  color: white;
}

/* 拉新裂变区域 */
.referral-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.referral-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-item {
  background: #f0f4ff;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  border: 1rpx solid #d0e0ff;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
  display: block;
}

.stat-label {
  font-size: 20rpx;
  color: #666;
  display: block;
}

.referral-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.reward-preview {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

.preview-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 16rpx;
  background: white;
  border-radius: 8rpx;
}

.reward-label {
  font-size: 22rpx;
  color: #666;
}

.reward-value {
  font-size: 22rpx;
  font-weight: 600;
  color: #667eea;
}

/* 流量加权区域 */
.traffic-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.score-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  color: white;
  margin-bottom: 32rpx;
}

.score-value {
  font-size: 64rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;
}

.score-label {
  font-size: 24rpx;
  margin-bottom: 8rpx;
  display: block;
}

.score-desc {
  font-size: 20rpx;
  opacity: 0.9;
  display: block;
}

.score-trends {
  margin-bottom: 32rpx;
}

.trends-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  height: 200rpx;
  margin-bottom: 12rpx;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx 8rpx 0 0;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.chart-label {
  flex: 1;
  font-size: 18rpx;
  color: #666;
  text-align: center;
}

.score-actions {
  margin-bottom: 32rpx;
}

.actions-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.action-item {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.action-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  display: block;
}

.action-text {
  font-size: 20rpx;
  color: #333;
  display: block;
}

.score-rules {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

.rules-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.rule-item {
  margin-bottom: 16rpx;
  padding: 16rpx;
  background: white;
  border-radius: 8rpx;
}

.rule-type {
  font-size: 22rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.rule-detail {
  font-size: 20rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

/* 付费套餐区域 */
.packages-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.package-card {
  background: #f9f9f9;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #e0e0e0;
  position: relative;
  transition: all 0.3s ease;
}

.package-card.recommended {
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-8rpx);
  box-shadow: 0 8rpx 16rpx rgba(102, 126, 234, 0.1);
}

.package-badge {
  position: absolute;
  top: -10rpx;
  right: 20rpx;
  background: #667eea;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 16rpx;
  font-weight: 600;
}

.package-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
  text-align: center;
}

.package-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 20rpx;
  display: block;
  text-align: center;
}

.package-features {
  margin-bottom: 24rpx;
}

.feature-item {
  font-size: 18rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
  padding-left: 20rpx;
  position: relative;
}

.feature-item::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}

.package-btn {
  width: 100%;
  padding: 16rpx;
  background: #667eea;
  color: white;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.value-added-services {
  margin-bottom: 32rpx;
}

.services-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.service-item {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.service-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.service-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  display: block;
}

.service-name {
  font-size: 20rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.service-price {
  font-size: 22rpx;
  font-weight: 600;
  color: #667eea;
  display: block;
}

.purchase-history {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

.history-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.history-list {
  min-height: 200rpx;
}

.empty-history {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 20rpx;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  gap: 16rpx;
}

.history-time {
  font-size: 18rpx;
  color: #999;
  width: 120rpx;
}

.history-name {
  flex: 1;
  font-size: 20rpx;
  color: #333;
}

.history-price {
  font-size: 20rpx;
  font-weight: 600;
  color: #667eea;
  width: 80rpx;
  text-align: right;
}

.history-status {
  font-size: 16rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.history-status.active {
  background: #f6ffed;
  color: #52c41a;
}

.history-status.expired {
  background: #fff2f0;
  color: #ff4d4f;
}
</style>