<template>
  <view class="invite-records-container">
    <view class="header">
      <text class="title">邀请码记录</text>
    </view>
    
    <view class="tab-buttons">
      <button :type="activeTab === 'active' ? 'primary' : 'default'" class="tab-button" @click="switchTab('active')">有效邀请码</button>
      <button :type="activeTab === 'expired' ? 'primary' : 'default'" class="tab-button" @click="switchTab('expired')">已过期邀请码</button>
    </view>
    
    <view class="records-list">
      <view v-for="record in filteredRecords" :key="record.id" class="record-item">
        <view class="record-header">
          <text class="code">{{ record.code }}</text>
          <text class="status" :class="record.status">{{ getStatusText(record.status) }}</text>
        </view>
        <view class="record-details">
          <text class="detail-text">车间：{{ record.department }}</text>
          <text class="detail-text">工序：{{ record.process }}</text>
          <text class="detail-text">工价：{{ record.wage }}元</text>
          <text class="detail-text">有效期：{{ record.expiryDays }}天</text>
          <text class="detail-text">使用情况：{{ record.usedCount }}/{{ record.maxCount }}</text>
          <text class="detail-text">生成时间：{{ formatDate(record.createdAt) }}</text>
        </view>
        <view class="record-actions">
          <button v-if="record.status === 'active'" class="action-btn" @click="regenerateCode(record)">重新生成</button>
          <button class="action-btn" @click="viewUsageDetails(record)">查看使用详情</button>
        </view>
      </view>
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <text>暂无邀请码记录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'active',
      inviteRecords: []
    }
  },
  computed: {
    filteredRecords() {
      if (this.activeTab === 'active') {
        return this.inviteRecords.filter(record => record.status === 'active')
      } else {
        return this.inviteRecords.filter(record => record.status === 'expired')
      }
    }
  },
  onLoad() {
    this.loadInviteRecords()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    loadInviteRecords() {
      this.inviteRecords = uni.getStorageSync('inviteRecords') || []
      // 检查邀请码是否过期
      this.checkExpiredCodes()
    },
    checkExpiredCodes() {
      const now = new Date()
      this.inviteRecords = this.inviteRecords.map(record => {
        const createdAt = new Date(record.createdAt)
        const expiryDate = new Date(createdAt.getTime() + record.expiryDays * 24 * 60 * 60 * 1000)
        if (now > expiryDate && record.status === 'active') {
          record.status = 'expired'
        }
        return record
      })
      uni.setStorageSync('inviteRecords', this.inviteRecords)
    },
    getStatusText(status) {
      switch (status) {
        case 'active': return '有效'
        case 'expired': return '已过期'
        default: return status
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    regenerateCode(record) {
      uni.showModal({
        title: '重新生成邀请码',
        content: '确定要重新生成此邀请码吗？原邀请码将自动过期。',
        success: (res) => {
          if (res.confirm) {
            // 将原邀请码标记为过期
            record.status = 'expired'
            
            // 生成新邀请码
            const newCode = Math.floor(100000 + Math.random() * 900000).toString()
            const newRecord = {
              id: Date.now(),
              code: newCode,
              department: record.department,
              process: record.process,
              wage: record.wage,
              expiryDays: record.expiryDays,
              maxCount: record.maxCount,
              createdAt: new Date().toISOString(),
              usedCount: 0,
              status: 'active'
            }
            this.inviteRecords.push(newRecord)
            uni.setStorageSync('inviteRecords', this.inviteRecords)
            
            uni.showToast({
              title: '邀请码已重新生成',
              icon: 'success'
            })
          }
        }
      })
    },
    viewUsageDetails(record) {
      uni.showToast({
        title: '使用详情功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.invite-records-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.tab-buttons {
  display: flex;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.tab-button {
  flex: 1;
  padding: 20rpx;
  font-size: 24rpx;
  border-radius: 10rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.code {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
  letter-spacing: 5rpx;
}

.status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.status.active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status.expired {
  background-color: #f5f5f5;
  color: #999;
}

.record-details {
  margin-bottom: 20rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.record-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background-color: #1890ff;
  color: #fff;
}

.empty-state {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-state text {
  font-size: 24rpx;
  color: #999;
}
</style>