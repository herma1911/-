<template>
  <view class="appeal-management-container">
    <view class="header">
      <text class="title">差评申诉</text>
    </view>
    
    <!-- 申诉列表 -->
    <view class="appeal-list">
      <view v-for="(appeal, index) in appeals" :key="appeal.id" class="appeal-item">
        <view class="appeal-header">
          <text class="appeal-title">申诉 #{{ appeal.id }}</text>
          <text class="appeal-status" :class="appeal.status">{{ getStatusText(appeal.status) }}</text>
        </view>
        <view class="appeal-details">
          <text class="detail-text">申诉类型：{{ getAppealTypeText(appeal.type) }}</text>
          <text class="detail-text">申诉人：{{ appeal.appellantName }}</text>
          <text class="detail-text">被申诉评价：{{ appeal.evaluationContent }}</text>
          <text class="detail-text">申诉日期：{{ formatDate(appeal.appealDate) }}</text>
          <text class="detail-text">申诉原因：{{ appeal.reason }}</text>
          <text v-if="appeal.evidence" class="detail-text">证据：{{ appeal.evidence }}</text>
        </view>
        <view class="appeal-actions">
          <button v-if="appeal.status === 'pending'" class="action-btn approve-btn" @click="approveAppeal(appeal)">通过</button>
          <button v-if="appeal.status === 'pending'" class="action-btn reject-btn" @click="rejectAppeal(appeal)">驳回</button>
        </view>
      </view>
      <view v-if="appeals.length === 0" class="empty-state">
        <text>暂无申诉记录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appeals: [
        {
          id: 1,
          type: 'worker',
          appellantName: '李四',
          evaluationContent: '工作态度差，效率低',
          appealDate: '2026-02-19',
          reason: '评价不符合实际情况，我一直认真工作',
          evidence: '工作记录、同事证明',
          status: 'pending'
        },
        {
          id: 2,
          type: 'factory',
          appellantName: '某某服装厂',
          evaluationContent: '工资低，工作环境差',
          appealDate: '2026-02-18',
          reason: '评价不客观，我们提供了合理的工资和良好的工作环境',
          evidence: '工资条、工作环境照片',
          status: 'pending'
        }
      ]
    }
  },
  methods: {
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待处理'
        case 'approved': return '已通过'
        case 'rejected': return '已驳回'
        default: return status
      }
    },
    getAppealTypeText(type) {
      switch (type) {
        case 'worker': return '工人申诉'
        case 'factory': return '工厂申诉'
        case 'other': return '其他申诉'
        default: return type
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    approveAppeal(appeal) {
      appeal.status = 'approved'
      uni.showToast({
        title: '申诉已通过',
        icon: 'success'
      })
    },
    rejectAppeal(appeal) {
      appeal.status = 'rejected'
      uni.showToast({
        title: '申诉已驳回',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.appeal-management-container {
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
  display: block;
}

.appeal-list {
  gap: 20rpx;
}

.appeal-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.appeal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.appeal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.appeal-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.appeal-status.pending {
  background-color: #fff7e6;
  color: #faad14;
}

.appeal-status.approved {
  background-color: #f6ffed;
  color: #52c41a;
}

.appeal-status.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.appeal-details {
  margin-bottom: 20rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.appeal-actions {
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
  background-color: #1890ff;
  color: #fff;
}

.reject-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-state text {
  font-size: 24rpx;
  color: #999;
}
</style>