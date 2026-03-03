<template>
  <view class="wechat-ledger-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <text class="back-btn" @tap="goBack">←</text>
      <text class="page-title">微信确认账本</text>
      <text class="export-btn" @tap="exportVoucher">导出凭证</text>
    </view>

    <!-- 状态标签 -->
    <view class="status-tabs">
      <view 
        v-for="tab in statusTabs" 
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @tap="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 账本概览 -->
    <view class="ledger-overview">
      <view class="overview-card">
        <text class="overview-label">待确认金额</text>
        <text class="overview-value pending">¥{{ pendingAmount }}</text>
      </view>
      <view class="overview-card">
        <text class="overview-label">已确认金额</text>
        <text class="overview-value confirmed">¥{{ confirmedAmount }}</text>
      </view>
      <view class="overview-card">
        <text class="overview-label">已驳回金额</text>
        <text class="overview-value rejected">¥{{ rejectedAmount }}</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="record-list-section">
      <view class="section-header">
        <text class="section-title">{{ getTabTitle(activeTab) }}记录</text>
        <text class="filter-btn" @tap="showFilter">筛选</text>
      </view>

      <view class="record-list">
        <view 
          v-for="record in filteredRecords" 
          :key="record.id"
          :class="['record-item', record.status]"
          @tap="viewRecordDetail(record)"
        >
          <view class="record-info">
            <text class="record-date">{{ record.date }}</text>
            <text class="record-type">{{ record.type === 'piece' ? '计件' : '计时' }}</text>
            <text class="record-status">{{ getStatusText(record.status) }}</text>
          </view>
          <view class="record-amount">
            <text class="amount">¥{{ record.amount }}</text>
            <text class="record-desc">{{ record.description }}</text>
            <view v-if="record.status === 'rejected'" class="appeal-btn" @tap.stop="appealRecord(record)">
              <text>申诉</text>
            </view>
          </view>
        </view>

        <view v-if="filteredRecords.length === 0" class="empty-state">
          <text class="empty-icon">{{ getEmptyIcon(activeTab) }}</text>
          <text class="empty-text">{{ getEmptyText(activeTab) }}</text>
          <text v-if="activeTab === 'pending'" class="empty-hint">等待工厂确认您的记工记录</text>
        </view>
      </view>
    </view>

    <!-- 对账结算区 -->
    <view class="reconciliation-section">
      <view class="section-header">
        <text class="section-title">本月对账</text>
        <text class="settle-btn" @tap="startReconciliation">开始对账</text>
      </view>

      <view class="reconciliation-info">
        <view class="info-item">
          <text class="info-label">本月记工次数</text>
          <text class="info-value">{{ monthlyRecordCount }}次</text>
        </view>
        <view class="info-item">
          <text class="info-label">本月总金额</text>
          <text class="info-value">¥{{ monthlyTotalAmount }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">已确认金额</text>
          <text class="info-value confirmed">¥{{ monthlyConfirmedAmount }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">待确认金额</text>
          <text class="info-value pending">¥{{ monthlyPendingAmount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'pending',
      statusTabs: [
        { label: '待确认', value: 'pending', count: 3 },
        { label: '已确认', value: 'confirmed', count: 8 },
        { label: '已驳回', value: 'rejected', count: 1 }
      ],
      pendingAmount: 2550,
      confirmedAmount: 7800,
      rejectedAmount: 320,
      monthlyRecordCount: 12,
      monthlyTotalAmount: 10670,
      monthlyConfirmedAmount: 7800,
      monthlyPendingAmount: 2550,
      records: [
        { id: 1, date: '2024-08-15', type: 'piece', amount: 850, description: '车工-牛仔裤', status: 'pending' },
        { id: 2, date: '2024-08-14', type: 'piece', amount: 780, description: '车工-T恤', status: 'pending' },
        { id: 3, date: '2024-08-13', type: 'time', amount: 320, description: '加班4小时', status: 'rejected' },
        { id: 4, date: '2024-08-12', type: 'piece', amount: 920, description: '车工-外套', status: 'confirmed' },
        { id: 5, date: '2024-08-11', type: 'piece', amount: 880, description: '车工-衬衫', status: 'confirmed' },
        { id: 6, date: '2024-08-10', type: 'piece', amount: 750, description: '车工-裙子', status: 'confirmed' },
        { id: 7, date: '2024-08-09', type: 'piece', amount: 820, description: '车工-裤子', status: 'confirmed' },
        { id: 8, date: '2024-08-08', type: 'piece', amount: 790, description: '车工-上衣', status: 'confirmed' },
        { id: 9, date: '2024-08-07', type: 'piece', amount: 810, description: '车工-夹克', status: 'confirmed' },
        { id: 10, date: '2024-08-06', type: 'piece', amount: 770, description: '车工-背心', status: 'confirmed' },
        { id: 11, date: '2024-08-05', type: 'piece', amount: 830, description: '车工-风衣', status: 'confirmed' },
        { id: 12, date: '2024-08-04', type: 'time', amount: 280, description: '加班3.5小时', status: 'pending' }
      ]
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter(record => record.status === this.activeTab)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    getTabTitle(tab) {
      const tabInfo = this.statusTabs.find(t => t.value === tab)
      return tabInfo ? tabInfo.label : ''
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待确认',
        confirmed: '已确认',
        rejected: '已驳回'
      }
      return statusMap[status] || ''
    },
    getEmptyIcon(tab) {
      const iconMap = {
        pending: '⏳',
        confirmed: '✅',
        rejected: '❌'
      }
      return iconMap[tab] || '📝'
    },
    getEmptyText(tab) {
      const textMap = {
        pending: '暂无待确认记录',
        confirmed: '暂无已确认记录',
        rejected: '暂无已驳回记录'
      }
      return textMap[tab] || '暂无记录'
    },
    viewRecordDetail(record) {
      uni.showModal({
        title: '记工详情',
        content: `日期: ${record.date}\n类型: ${record.type === 'piece' ? '计件' : '计时'}\n金额: ¥${record.amount}\n描述: ${record.description}\n状态: ${this.getStatusText(record.status)}`,
        showCancel: false
      })
    },
    appealRecord(record) {
      uni.showModal({
        title: '申诉记录',
        content: `确定要申诉这条记工记录吗？\n\n日期: ${record.date}\n金额: ¥${record.amount}\n描述: ${record.description}`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '申诉已提交',
              icon: 'success'
            })
          }
        }
      })
    },
    showFilter() {
      uni.showActionSheet({
        itemList: ['按日期排序', '按金额排序', '按类型筛选'],
        success: (res) => {
          console.log('选择的筛选方式:', res.tapIndex)
        }
      })
    },
    startReconciliation() {
      uni.showModal({
        title: '开始对账',
        content: '确定要开始本月对账吗？系统将生成对账报告并发送给工厂。',
        success: (res) => {
          if (res.confirm) {
            // 模拟对账操作
            setTimeout(() => {
              uni.showToast({
                title: '对账已发起',
                icon: 'success'
              })
            }, 1000)
          }
        }
      })
    },
    exportVoucher() {
      uni.showModal({
        title: '导出凭证',
        content: '选择导出格式',
        cancelText: 'PDF',
        confirmText: 'Excel',
        success: (res) => {
          if (res.confirm) {
            // 模拟导出Excel
            this.simulateExport('Excel')
          } else if (res.cancel) {
            // 模拟导出PDF
            this.simulateExport('PDF')
          }
        }
      })
    },
    simulateExport(format) {
      uni.showLoading({
        title: `正在导出${format}...`
      })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: `${format}导出成功`,
          icon: 'success'
        })
      }, 1500)
    }
  }
}
</script>

<style scoped>
.wechat-ledger-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 20rpx;
}

/* 顶部导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  height: 120rpx;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  font-size: 36rpx;
  color: #333;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.export-btn {
  font-size: 26rpx;
  color: #1677ff;
  font-weight: 600;
}

/* 状态标签 */
.status-tabs {
  display: flex;
  background: #fff;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
}

.tab-item.active {
  color: #1677ff;
  font-weight: 600;
  border-bottom-color: #1677ff;
}

.tab-badge {
  position: absolute;
  top: 10rpx;
  right: 30rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  min-width: 24rpx;
  text-align: center;
}

/* 账本概览 */
.ledger-overview {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.overview-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.overview-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.overview-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.overview-value.pending {
  color: #faad14;
}

.overview-value.confirmed {
  color: #52c41a;
}

.overview-value.rejected {
  color: #ff4d4f;
}

/* 记录列表 */
.record-list-section,
.reconciliation-section {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.filter-btn,
.settle-btn {
  font-size: 24rpx;
  color: #1677ff;
  font-weight: 600;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-item.pending {
  border-left: 4rpx solid #faad14;
  padding-left: 15rpx;
}

.record-item.confirmed {
  border-left: 4rpx solid #52c41a;
  padding-left: 15rpx;
}

.record-item.rejected {
  border-left: 4rpx solid #ff4d4f;
  padding-left: 15rpx;
}

.record-info {
  flex: 1;
}

.record-date {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.record-type {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 8rpx;
  display: block;
}

.record-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.record-item.pending .record-status {
  background: #fff7e6;
  color: #faad14;
}

.record-item.confirmed .record-status {
  background: #f6ffed;
  color: #52c41a;
}

.record-item.rejected .record-status {
  background: #fff2f0;
  color: #ff4d4f;
}

.record-amount {
  text-align: right;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}

.record-desc {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 10rpx;
  display: block;
}

.appeal-btn {
  background: #1677ff;
  color: #fff;
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  display: inline-block;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.empty-hint {
  font-size: 22rpx;
  color: #999;
}

/* 对账结算区 */
.reconciliation-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.info-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.info-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.info-value.confirmed {
  color: #52c41a;
}

.info-value.pending {
  color: #faad14;
}
</style>