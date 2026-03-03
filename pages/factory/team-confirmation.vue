<template>
  <view class="team-confirmation-container">
    <view class="header">
      <text class="title">班组确认</text>
    </view>
    
    <view class="filter-section">
      <picker :value="statusIndex" :range="statusOptions" @change="statusChange">
        <view class="filter-picker">
          {{statusOptions[statusIndex]}}
        </view>
      </picker>
    </view>
    
    <view class="confirmation-list">
      <view v-if="filteredConfirmations.length === 0" class="empty-state">
        <text class="empty-text">暂无待确认的班组归属请求</text>
      </view>
      <view v-for="(confirmation, index) in filteredConfirmations" :key="index" class="confirmation-item">
        <view class="confirmation-header">
          <text class="worker-name">{{confirmation.workerName}}</text>
          <text class="confirmation-status" :class="getStatusClass(confirmation.status)">{{getStatusText(confirmation.status)}}</text>
        </view>
        <view class="confirmation-info">
          <text class="department">{{confirmation.department}}车间</text>
          <text class="submit-date">{{formatDate(confirmation.submittedAt)}}</text>
        </view>
        <view class="confirmation-footer" v-if="confirmation.status === 'pending'">
          <button type="primary" class="approve-button" size="mini" @click.stop="approve(confirmation.id)">确认</button>
          <button type="default" class="reject-button" size="mini" @click.stop="reject(confirmation.id)">拒绝</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusIndex: 0,
      statusOptions: ['全部', '待确认', '已确认', '已拒绝'],
      confirmations: []
    }
  },
  computed: {
    filteredConfirmations() {
      const status = this.statusOptions[this.statusIndex]
      if (status === '全部') {
        return this.confirmations
      } else if (status === '待确认') {
        return this.confirmations.filter(item => item.status === 'pending')
      } else if (status === '已确认') {
        return this.confirmations.filter(item => item.status === 'approved')
      } else if (status === '已拒绝') {
        return this.confirmations.filter(item => item.status === 'rejected')
      }
      return this.confirmations
    }
  },
  onLoad() {
    this.loadConfirmations()
  },
  methods: {
    loadConfirmations() {
      const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
      this.confirmations = teamConfirmations
    },
    statusChange(e) {
      this.statusIndex = e.detail.value
    },
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'status-pending'
        case 'approved':
          return 'status-approved'
        case 'rejected':
          return 'status-rejected'
        default:
          return ''
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return '待确认'
        case 'approved':
          return '已确认'
        case 'rejected':
          return '已拒绝'
        default:
          return status
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    approve(id) {
      // 批准班组确认
      uni.showModal({
        title: '确认班组归属',
        content: '确定要确认该工人的班组归属吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateConfirmationStatus(id, 'approved')
          }
        }
      })
    },
    reject(id) {
      // 拒绝班组确认
      uni.showModal({
        title: '拒绝班组归属',
        content: '确定要拒绝该工人的班组归属吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateConfirmationStatus(id, 'rejected')
          }
        }
      })
    },
    updateConfirmationStatus(id, status) {
      const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
      const confirmationIndex = teamConfirmations.findIndex(item => item.id === id)
      
      if (confirmationIndex >= 0) {
        teamConfirmations[confirmationIndex].status = status
        teamConfirmations[confirmationIndex].approvedAt = new Date().toISOString()
        teamConfirmations[confirmationIndex].approverId = uni.getStorageSync('userId') || 'leader_' + Math.random()
        teamConfirmations[confirmationIndex].approverName = uni.getStorageSync('userInfo')?.name || '班组长'
        
        // 保存数据
        uni.setStorageSync('teamConfirmations', teamConfirmations)
        
        // 重新加载数据
        this.loadConfirmations()
        
        uni.showToast({
          title: '操作成功',
          icon: 'success'
        })
      }
    }
  }
}
</script>

<style scoped>
.team-confirmation-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(74, 144, 226, 0.3);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.filter-section {
  margin-bottom: 20rpx;
}

.filter-picker {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.confirmation-list {
  gap: 15rpx;
}

.confirmation-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.confirmation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.worker-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.confirmation-status {
  font-size: 24rpx;
  font-weight: bold;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.status-pending {
  color: #faad14;
  background-color: #fffbe6;
}

.status-approved {
  color: #52c41a;
  background-color: #f6ffed;
}

.status-rejected {
  color: #ff4d4f;
  background-color: #fff1f0;
}

.confirmation-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
  font-size: 20rpx;
  color: #666;
}

.confirmation-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10rpx;
  padding-top: 15rpx;
  border-top: 1rpx solid #f0f0f0;
}

.approve-button {
  padding: 5rpx 20rpx;
  font-size: 20rpx;
  border-radius: 15rpx;
  background-color: #4A90E2;
}

.reject-button {
  padding: 5rpx 20rpx;
  font-size: 20rpx;
  border-radius: 15rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-text {
  font-size: 24rpx;
  color: #999;
}
</style>