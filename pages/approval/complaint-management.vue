<template>
  <view class="complaint-management-container">
    <view class="header">
      <text class="title">投诉审核</text>
    </view>
    
    <!-- 投诉列表 -->
    <view class="complaint-list">
      <view v-for="(complaint, index) in complaints" :key="complaint.id" class="complaint-item">
        <view class="complaint-header">
          <text class="complaint-title">投诉 #{{ complaint.id }}</text>
          <text class="complaint-status" :class="complaint.status">{{ getStatusText(complaint.status) }}</text>
        </view>
        <view class="complaint-details">
          <text class="detail-text">投诉类型：{{ getComplaintTypeText(complaint.type) }}</text>
          <text class="detail-text">投诉人：{{ complaint.complainantName }}</text>
          <text class="detail-text">被投诉人：{{ complaint.respondentName }}</text>
          <text class="detail-text">投诉日期：{{ formatDate(complaint.complainDate) }}</text>
          <text class="detail-text">投诉内容：{{ complaint.content }}</text>
          <text v-if="complaint.evidence" class="detail-text">证据：{{ complaint.evidence }}</text>
        </view>
        <view class="complaint-actions">
          <button v-if="complaint.status === 'pending'" class="action-btn approve-btn" @click="approveComplaint(complaint)">处理</button>
          <button v-if="complaint.status === 'pending'" class="action-btn reject-btn" @click="rejectComplaint(complaint)">忽略</button>
        </view>
      </view>
      <view v-if="complaints.length === 0" class="empty-state">
        <text>暂无投诉记录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      complaints: [
        {
          id: 1,
          type: 'worker',
          complainantName: '张三',
          respondentName: '李四',
          complainDate: '2026-02-20',
          content: '该工人经常迟到，影响生产进度',
          evidence: '考勤记录',
          status: 'pending'
        },
        {
          id: 2,
          type: 'factory',
          complainantName: '王五',
          respondentName: '某某服装厂',
          complainDate: '2026-02-19',
          content: '工厂拖欠工资，多次协商无果',
          evidence: '工资条',
          status: 'pending'
        }
      ]
    }
  },
  methods: {
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待处理'
        case 'approved': return '已处理'
        case 'rejected': return '已忽略'
        default: return status
      }
    },
    getComplaintTypeText(type) {
      switch (type) {
        case 'worker': return '工人投诉'
        case 'factory': return '工厂投诉'
        case 'other': return '其他投诉'
        default: return type
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    approveComplaint(complaint) {
      complaint.status = 'approved'
      uni.showToast({
        title: '投诉已处理',
        icon: 'success'
      })
    },
    rejectComplaint(complaint) {
      complaint.status = 'rejected'
      uni.showToast({
        title: '投诉已忽略',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.complaint-management-container {
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

.complaint-list {
  gap: 20rpx;
}

.complaint-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.complaint-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.complaint-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.complaint-status.pending {
  background-color: #fff7e6;
  color: #faad14;
}

.complaint-status.approved {
  background-color: #f6ffed;
  color: #52c41a;
}

.complaint-status.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.complaint-details {
  margin-bottom: 20rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.complaint-actions {
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