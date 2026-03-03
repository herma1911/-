<template>
  <view class="approval-list-container">
    <view class="header">
      <text class="title">审批列表</text>
    </view>
    
    <view class="filter-section">
      <picker :value="statusIndex" :range="statusOptions" @change="statusChange">
        <view class="filter-picker">
          {{statusOptions[statusIndex]}}
        </view>
      </picker>
    </view>
    
    <view class="approval-list">
      <view v-if="filteredApprovals.length === 0" class="empty-state">
        <text class="empty-text">暂无审批记录</text>
      </view>
      <view v-for="(approval, index) in filteredApprovals" :key="index" class="approval-item" @click="viewDetail(approval.id)">
        <view class="approval-header">
          <text class="approval-title">记账审批 - {{approval.workerName}}</text>
          <text class="approval-status" :class="getStatusClass(approval.status)">{{getStatusText(approval.status)}}</text>
        </view>
        <view class="approval-info">
          <text class="applicant">{{approval.workerName}}</text>
          <text class="apply-date">{{formatDate(approval.submittedAt)}}</text>
        </view>
        <view class="approval-content">
          <text>共 {{approval.items.length}} 项，总计：{{approval.totalAmount}}元</text>
        </view>
        <view class="approval-footer" v-if="approval.status === 'pending'">
          <button type="primary" class="approve-button" size="mini" @click.stop="approve(approval.id)">批准</button>
          <button type="default" class="reject-button" size="mini" @click.stop="reject(approval.id)">拒绝</button>
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
      statusOptions: ['全部', '待审批', '已批准', '已拒绝'],
      approvalList: []
    }
  },
  computed: {
    filteredApprovals() {
      const status = this.statusOptions[this.statusIndex]
      if (status === '全部') {
        return this.approvalList
      } else if (status === '待审批') {
        return this.approvalList.filter(item => item.status === 'pending')
      } else if (status === '已批准') {
        return this.approvalList.filter(item => item.status === 'approved')
      } else if (status === '已拒绝') {
        return this.approvalList.filter(item => item.status === 'rejected')
      }
      return this.approvalList
    }
  },
  onLoad() {
    this.loadApprovals()
  },
  methods: {
    loadApprovals() {
      const approvalRecords = uni.getStorageSync('approvalRecords') || []
      this.approvalList = approvalRecords
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
          return '待审批'
        case 'approved':
          return '已批准'
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
    viewDetail(id) {
      // 查看审批详情
      uni.showToast({
        title: '查看详情功能开发中',
        icon: 'none'
      })
    },
    approve(id) {
      // 批准审批
      uni.showModal({
        title: '批准申请',
        content: '确定要批准此申请吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateApprovalStatus(id, 'approved')
          }
        }
      })
    },
    reject(id) {
      // 拒绝审批
      uni.showModal({
        title: '拒绝申请',
        content: '确定要拒绝此申请吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateApprovalStatus(id, 'rejected')
          }
        }
      })
    },
    updateApprovalStatus(id, status) {
      const approvalRecords = uni.getStorageSync('approvalRecords') || []
      const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
      
      const approvalIndex = approvalRecords.findIndex(item => item.id === id)
      if (approvalIndex >= 0) {
        approvalRecords[approvalIndex].status = status
        approvalRecords[approvalIndex].approvedAt = new Date().toISOString()
        approvalRecords[approvalIndex].approverId = uni.getStorageSync('userId') || 'leader_' + Math.random()
        approvalRecords[approvalIndex].approverName = uni.getStorageSync('userInfo')?.name || '班组长'
        
        // 更新对应账本记录的审批状态
        ledgerRecords.forEach(record => {
          if (record.approvalId === id) {
            record.approvalStatus = status
          }
        })
        
        // 保存数据
        uni.setStorageSync('approvalRecords', approvalRecords)
        uni.setStorageSync('ledgerRecords', ledgerRecords)
        
        // 重新加载数据
        this.loadApprovals()
        
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
.approval-list-container {
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

.approval-list {
  gap: 15rpx;
}

.approval-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.approval-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.approval-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.approval-status {
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

.approval-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
  font-size: 20rpx;
  color: #999;
}

.approval-content {
  font-size: 24rpx;
  color: #333;
  line-height: 36rpx;
  margin-bottom: 15rpx;
}

.approval-footer {
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