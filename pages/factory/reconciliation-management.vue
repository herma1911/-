<template>
  <view class="reconciliation-management-container">
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">对账结算管理</text>
      <text class="empty"></text>
    </view>
    
    <!-- 统计概览 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-number">{{ pendingReconciliations }}</text>
        <text class="stat-label">待处理对账</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ confirmedReconciliations }}</text>
        <text class="stat-label">已确认对账</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ rejectedReconciliations }}</text>
        <text class="stat-label">已驳回对账</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ totalReconciliations }}</text>
        <text class="stat-label">总对账数</text>
      </view>
    </view>
    
    <!-- 状态筛选 -->
    <view class="filter-section">
      <view class="filter-buttons">
        <button :class="['filter-btn', activeFilter === 'all' ? 'active' : '']" @click="activeFilter = 'all'">全部</button>
        <button :class="['filter-btn', activeFilter === 'pending' ? 'active' : '']" @click="activeFilter = 'pending'">待处理</button>
        <button :class="['filter-btn', activeFilter === 'confirmed' ? 'active' : '']" @click="activeFilter = 'confirmed'">已确认</button>
        <button :class="['filter-btn', activeFilter === 'rejected' ? 'active' : '']" @click="activeFilter = 'rejected'">已驳回</button>
      </view>
    </view>
    
    <!-- 对账列表 -->
    <view class="reconciliation-list">
      <view 
        v-for="reconciliation in filteredReconciliations" 
        :key="reconciliation.id"
        :class="['reconciliation-item', reconciliation.status]"
        @click="viewReconciliationDetail(reconciliation)"
      >
        <view class="reconciliation-header">
          <text class="reconciliation-title">对账 #{{ reconciliation.id }}</text>
          <text :class="['reconciliation-status', reconciliation.status]">{{ getStatusText(reconciliation.status) }}</text>
        </view>
        <view class="reconciliation-info">
          <text class="info-item">工人：{{ reconciliation.workerName }}</text>
          <text class="info-item">月份：{{ reconciliation.month }}</text>
          <text class="info-item">申请日期：{{ formatDate(reconciliation.applyDate) }}</text>
          <text class="info-item">对账金额：¥{{ reconciliation.amount }}</text>
        </view>
        <view class="reconciliation-actions">
          <button 
            v-if="reconciliation.status === 'pending'" 
            class="action-btn confirm-btn"
            @click.stop="confirmReconciliation(reconciliation)"
          >
            确认
          </button>
          <button 
            v-if="reconciliation.status === 'pending'" 
            class="action-btn reject-btn"
            @click.stop="rejectReconciliation(reconciliation)"
          >
            驳回
          </button>
          <button 
            v-if="reconciliation.status !== 'pending'" 
            class="action-btn view-btn"
            @click.stop="viewReconciliationDetail(reconciliation)"
          >
            查看详情
          </button>
        </view>
      </view>
      
      <view v-if="filteredReconciliations.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无对账记录</text>
        <text class="empty-hint">工人发起对账请求后会显示在这里</text>
      </view>
    </view>
    
    <!-- 对账详情弹窗 -->
    <view v-if="showDetail" class="detail-modal">
      <view class="detail-content">
        <view class="detail-header">
          <text class="detail-title">对账详情</text>
          <text class="close-btn" @click="showDetail = false">×</text>
        </view>
        <view class="detail-body">
          <view class="detail-section">
            <text class="section-title">基本信息</text>
            <view class="detail-item">
              <text class="item-label">对账编号：</text>
              <text class="item-value">{{ selectedReconciliation.id }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">工人姓名：</text>
              <text class="item-value">{{ selectedReconciliation.workerName }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">对账月份：</text>
              <text class="item-value">{{ selectedReconciliation.month }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">申请日期：</text>
              <text class="item-value">{{ formatDate(selectedReconciliation.applyDate) }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">对账金额：</text>
              <text class="item-value amount">¥{{ selectedReconciliation.amount }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">状态：</text>
              <text :class="['item-value status', selectedReconciliation.status]">{{ getStatusText(selectedReconciliation.status) }}</text>
            </view>
          </view>
          
          <view class="detail-section">
            <text class="section-title">收支明细</text>
            <view class="transaction-list">
              <view v-for="(transaction, index) in selectedReconciliation.transactions" :key="index" class="transaction-item">
                <text class="transaction-date">{{ transaction.date }}</text>
                <text :class="['transaction-amount', transaction.type === 'income' ? 'income' : 'expense']">
                  {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount }}
                </text>
                <text class="transaction-description">{{ transaction.description }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="selectedReconciliation.status === 'rejected'" class="detail-section">
            <text class="section-title">驳回原因</text>
            <text class="rejection-reason">{{ selectedReconciliation.rejectionReason || '无' }}</text>
          </view>
        </view>
        <view class="detail-actions">
          <button 
            v-if="selectedReconciliation.status === 'pending'" 
            class="primary-btn confirm-btn"
            @click="confirmReconciliation(selectedReconciliation)"
          >
            确认对账
          </button>
          <button 
            v-if="selectedReconciliation.status === 'pending'" 
            class="primary-btn reject-btn"
            @click="rejectReconciliation(selectedReconciliation)"
          >
            驳回对账
          </button>
          <button 
            v-else 
            class="primary-btn close-btn"
            @click="showDetail = false"
          >
            关闭
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeFilter: 'all',
      showDetail: false,
      selectedReconciliation: null,
      reconciliations: [
        {
          id: 1,
          workerName: '张三',
          month: '2024-08',
          applyDate: '2024-09-01',
          amount: 8500,
          status: 'pending',
          transactions: [
            { date: '2024-08-01', type: 'income', amount: 850, description: '车工-牛仔裤' },
            { date: '2024-08-02', type: 'income', amount: 780, description: '车工-T恤' },
            { date: '2024-08-03', type: 'income', amount: 820, description: '车工-外套' },
            { date: '2024-08-10', type: 'expense', amount: 1000, description: '预支工资' },
            { date: '2024-08-15', type: 'expense', amount: 150, description: '生活费' }
          ]
        },
        {
          id: 2,
          workerName: '李四',
          month: '2024-08',
          applyDate: '2024-09-02',
          amount: 7800,
          status: 'pending',
          transactions: [
            { date: '2024-08-01', type: 'income', amount: 750, description: '质检员' },
            { date: '2024-08-02', type: 'income', amount: 750, description: '质检员' },
            { date: '2024-08-03', type: 'income', amount: 750, description: '质检员' },
            { date: '2024-08-05', type: 'expense', amount: 800, description: '生活费' }
          ]
        },
        {
          id: 3,
          workerName: '王五',
          month: '2024-07',
          applyDate: '2024-08-01',
          amount: 7200,
          status: 'confirmed',
          transactions: [
            { date: '2024-07-01', type: 'income', amount: 720, description: '拷边工' },
            { date: '2024-07-02', type: 'income', amount: 720, description: '拷边工' },
            { date: '2024-07-03', type: 'income', amount: 720, description: '拷边工' }
          ]
        },
        {
          id: 4,
          workerName: '赵六',
          month: '2024-07',
          applyDate: '2024-08-02',
          amount: 6500,
          status: 'rejected',
          rejectionReason: '部分记工记录与工厂记录不符，需要重新核对',
          transactions: [
            { date: '2024-07-01', type: 'income', amount: 650, description: '缝纫工' },
            { date: '2024-07-02', type: 'income', amount: 650, description: '缝纫工' },
            { date: '2024-07-03', type: 'income', amount: 650, description: '缝纫工' }
          ]
        }
      ]
    }
  },
  computed: {
    filteredReconciliations() {
      if (this.activeFilter === 'all') {
        return this.reconciliations
      } else {
        return this.reconciliations.filter(reconciliation => reconciliation.status === this.activeFilter)
      }
    },
    pendingReconciliations() {
      return this.reconciliations.filter(r => r.status === 'pending').length
    },
    confirmedReconciliations() {
      return this.reconciliations.filter(r => r.status === 'confirmed').length
    },
    rejectedReconciliations() {
      return this.reconciliations.filter(r => r.status === 'rejected').length
    },
    totalReconciliations() {
      return this.reconciliations.length
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待处理'
        case 'confirmed': return '已确认'
        case 'rejected': return '已驳回'
        default: return status
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    viewReconciliationDetail(reconciliation) {
      this.selectedReconciliation = reconciliation
      this.showDetail = true
    },
    confirmReconciliation(reconciliation) {
      uni.showModal({
        title: '确认对账',
        content: `确定要确认 ${reconciliation.workerName} 的对账请求吗？\n对账金额：¥${reconciliation.amount}`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 更新状态
            reconciliation.status = 'confirmed'
            reconciliation.confirmDate = new Date().toISOString()
            
            // 保存到本地存储
            uni.setStorageSync('reconciliations', this.reconciliations)
            
            uni.showToast({
              title: '对账已确认',
              icon: 'success'
            })
            
            // 关闭详情弹窗
            if (this.showDetail) {
              this.showDetail = false
            }
          }
        }
      })
    },
    rejectReconciliation(reconciliation) {
      uni.showModal({
        title: '驳回对账',
        content: '请输入驳回原因',
        editable: true,
        placeholderText: '请输入驳回原因',
        success: (res) => {
          if (res.confirm && res.content) {
            // 更新状态
            reconciliation.status = 'rejected'
            reconciliation.rejectionReason = res.content
            reconciliation.rejectDate = new Date().toISOString()
            
            // 保存到本地存储
            uni.setStorageSync('reconciliations', this.reconciliations)
            
            uni.showToast({
              title: '对账已驳回',
              icon: 'success'
            })
            
            // 关闭详情弹窗
            if (this.showDetail) {
              this.showDetail = false
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.reconciliation-management-container {
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

/* 统计概览 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #666;
}

/* 状态筛选 */
.filter-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.filter-buttons {
  display: flex;
  gap: 12rpx;
}

.filter-btn {
  flex: 1;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.filter-btn.active {
  background-color: #667eea;
  color: white;
}

/* 对账列表 */
.reconciliation-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reconciliation-item {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  border-left: 4rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.reconciliation-item:hover {
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
}

.reconciliation-item.pending {
  border-left-color: #faad14;
}

.reconciliation-item.confirmed {
  border-left-color: #52c41a;
}

.reconciliation-item.rejected {
  border-left-color: #ff4d4f;
}

.reconciliation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.reconciliation-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

.reconciliation-status {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
}

.reconciliation-status.pending {
  background-color: #fff7e6;
  color: #faad14;
}

.reconciliation-status.confirmed {
  background-color: #f6ffed;
  color: #52c41a;
}

.reconciliation-status.rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.reconciliation-info {
  margin-bottom: 20rpx;
}

.info-item {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.reconciliation-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  flex: 1;
  padding: 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.confirm-btn {
  background-color: #52c41a;
  color: white;
}

.reject-btn {
  background-color: #ff4d4f;
  color: white;
}

.view-btn {
  background-color: #1890ff;
  color: white;
}

/* 空状态 */
.empty-state {
  background: white;
  border-radius: 16rpx;
  padding: 60rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 20rpx;
  color: #999;
  display: block;
}

/* 对账详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.detail-content {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.detail-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 32rpx;
  color: #999;
  font-weight: bold;
  cursor: pointer;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.detail-item {
  display: flex;
  align-items: center;
}

.item-label {
  font-size: 22rpx;
  color: #666;
  width: 120rpx;
}

.item-value {
  font-size: 22rpx;
  color: #333;
  flex: 1;
}

.item-value.amount {
  font-weight: 600;
  color: #52c41a;
}

.item-value.status {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.item-value.status.pending {
  background-color: #fff7e6;
  color: #faad14;
}

.item-value.status.confirmed {
  background-color: #f6ffed;
  color: #52c41a;
}

.item-value.status.rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
}

.transaction-date {
  font-size: 20rpx;
  color: #999;
  width: 120rpx;
}

.transaction-amount {
  font-size: 22rpx;
  font-weight: 600;
  width: 120rpx;
  text-align: right;
}

.transaction-amount.income {
  color: #52c41a;
}

.transaction-amount.expense {
  color: #ff4d4f;
}

.transaction-description {
  font-size: 20rpx;
  color: #666;
  flex: 1;
  margin: 0 20rpx;
}

.rejection-reason {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
  padding: 16rpx;
  background-color: #fff2f0;
  border-radius: 8rpx;
}

.detail-actions {
  display: flex;
  gap: 12rpx;
}

.primary-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.primary-btn.confirm-btn {
  background-color: #52c41a;
  color: white;
}

.primary-btn.reject-btn {
  background-color: #ff4d4f;
  color: white;
}

.primary-btn.close-btn {
  background-color: #1890ff;
  color: white;
}
</style>