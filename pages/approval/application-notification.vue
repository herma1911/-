<template>
  <view class="notification-container">
    <view class="header">
      <text class="title">申请通知</text>
    </view>
    
    <!-- 申请统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">{{ pendingApplications.length }}</text>
        <text class="stat-label">待处理申请</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ approvedApplications.length }}</text>
        <text class="stat-label">已批准申请</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ rejectedApplications.length }}</text>
        <text class="stat-label">已拒绝申请</text>
      </view>
    </view>
    
    <!-- 待处理申请 -->
    <view class="section">
      <text class="section-title">待处理申请</text>
      <view class="application-list">
        <view v-for="(app, index) in pendingApplications" :key="app.id" class="application-item pending">
          <view class="app-header">
            <text class="app-name">{{ app.userId }}</text>
            <text class="app-status pending">待处理</text>
          </view>
          <view class="app-details">
            <text class="detail-text">姓名：{{ app.name || '未提供' }}</text>
            <text class="detail-text">联系方式：{{ app.phone || '未提供' }}</text>
            <text class="detail-text">企业名称：{{ app.enterpriseName || '未提供' }}</text>
            <text class="detail-text">联系地址：{{ app.address || '未提供' }}</text>
            <text class="detail-text">申请时间：{{ formatDate(app.applyTime) }}</text>
          </view>
          <view class="app-actions">
            <button class="action-btn approve-btn" @click="approveApplication(app)">批准</button>
            <button class="action-btn reject-btn" @click="rejectApplication(app)">拒绝</button>
          </view>
        </view>
        <view v-if="pendingApplications.length === 0" class="empty-state">
          <text>暂无待处理申请</text>
        </view>
      </view>
    </view>
    
    <!-- 历史申请 -->
    <view class="section">
      <text class="section-title">历史申请</text>
      <view class="application-list">
        <view v-for="(app, index) in historyApplications" :key="app.id" class="application-item" :class="app.status">
          <view class="app-header">
            <text class="app-name">{{ app.userId }}</text>
            <text class="app-status" :class="app.status">
              {{ app.status === 'approved' ? '已批准' : '已拒绝' }}
            </text>
          </view>
          <view class="app-details">
            <text class="detail-text">姓名：{{ app.name || '未提供' }}</text>
            <text class="detail-text">联系方式：{{ app.phone || '未提供' }}</text>
            <text class="detail-text">企业名称：{{ app.enterpriseName || '未提供' }}</text>
            <text class="detail-text">联系地址：{{ app.address || '未提供' }}</text>
            <text class="detail-text">申请时间：{{ formatDate(app.applyTime) }}</text>
            <text class="detail-text" v-if="app.approveTime">处理时间：{{ formatDate(app.approveTime || app.rejectTime) }}</text>
          </view>
        </view>
        <view v-if="historyApplications.length === 0" class="empty-state">
          <text>暂无历史申请</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      applications: []
    }
  },
  onLoad() {
    this.loadApplications()
  },
  onShow() {
    // 每次页面显示时重新加载数据
    this.loadApplications()
  },
  computed: {
    pendingApplications() {
      return this.applications.filter(app => app.status === 'pending')
    },
    approvedApplications() {
      return this.applications.filter(app => app.status === 'approved')
    },
    rejectedApplications() {
      return this.applications.filter(app => app.status === 'rejected')
    },
    historyApplications() {
      return [...this.approvedApplications, ...this.rejectedApplications]
        .sort((a, b) => new Date(b.approveTime || b.rejectTime) - new Date(a.approveTime || a.rejectTime))
    }
  },
  methods: {
    loadApplications() {
      const enterpriseApplications = uni.getStorageSync('enterpriseApplications') || []
      this.applications = enterpriseApplications
    },
    formatDate(dateString) {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    approveApplication(application) {
      // 更新申请状态
      const updatedApplications = this.applications.map(app => {
        if (app.id === application.id) {
          return {
            ...app,
            status: 'approved',
            approveTime: new Date().toISOString()
          }
        }
        return app
      })
      
      // 保存到本地存储
      uni.setStorageSync('enterpriseApplications', updatedApplications)
      
      // 更新用户信息，设置为企业版角色
      const userInfo = {
        username: application.userId,
        phone: application.phone,
        role: '企业版',
        isEnterprise: true
      }
      uni.setStorageSync('userInfo_' + application.userId, userInfo)
      
      uni.showToast({
        title: '申请已批准',
        icon: 'success'
      })
      
      // 重新加载数据
      this.loadApplications()
    },
    rejectApplication(application) {
      // 更新申请状态
      const updatedApplications = this.applications.map(app => {
        if (app.id === application.id) {
          return {
            ...app,
            status: 'rejected',
            rejectTime: new Date().toISOString()
          }
        }
        return app
      })
      
      // 保存到本地存储
      uni.setStorageSync('enterpriseApplications', updatedApplications)
      
      uni.showToast({
        title: '申请已拒绝',
        icon: 'success'
      })
      
      // 重新加载数据
      this.loadApplications()
    }
  }
}
</script>

<style scoped>
.notification-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

/* 统计部分 */
.stats-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.stat-item {
  flex: 1;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #4A90E2;
  display: block;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
}

/* 通用部分样式 */
.section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

/* 申请列表 */
.application-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.application-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  border-left: 5rpx solid #ddd;
}

.application-item.pending {
  border-left-color: #faad14;
  background-color: #fffbe6;
}

.application-item.approved {
  border-left-color: #52c41a;
  background-color: #f6ffed;
}

.application-item.rejected {
  border-left-color: #ff4d4f;
  background-color: #fff1f0;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.app-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.app-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.app-status.pending {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.app-status.approved {
  background-color: #e6f7ff;
  color: #1890ff;
}

.app-status.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.app-details {
  margin-bottom: 15rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.app-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.approve-btn {
  background-color: #52c41a;
  color: #fff;
}

.reject-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}
</style>