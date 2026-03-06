<template>
  <view class="reconciliation-management-container">
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">对账审核中心</text>
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
        <text class="stat-number">{{ disputedReconciliations }}</text>
        <text class="stat-label">异议中</text>
      </view>
    </view>
    
    <!-- 顶部筛选栏 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">班组：</text>
          <picker :value="selectedTeamIndex" :range="teams" @change="onTeamChange" class="filter-picker">
            <text class="picker-text">{{ teams[selectedTeamIndex] }}</text>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">用工类型：</text>
          <picker :value="selectedWorkTypeIndex" :range="workTypes" @change="onWorkTypeChange" class="filter-picker">
            <text class="picker-text">{{ workTypes[selectedWorkTypeIndex] }}</text>
          </picker>
        </view>
      </view>
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">对账状态：</text>
          <picker :value="selectedStatusIndex" :range="statusOptions" @change="onStatusChange" class="filter-picker">
            <text class="picker-text">{{ statusOptions[selectedStatusIndex] }}</text>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">月份：</text>
          <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange" class="filter-picker">
            <text class="picker-text">{{ selectedMonthText }}</text>
          </picker>
        </view>
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
          <view class="header-right">
            <text v-if="reconciliation.workType === 3" class="work-type-tag mixed">混合用工</text>
            <text :class="['reconciliation-status', reconciliation.status]">{{ getStatusText(reconciliation.status) }}</text>
          </view>
        </view>
        <view class="reconciliation-info">
          <text class="info-item">工人：{{ reconciliation.workerName }}</text>
          <text class="info-item">用工类型：{{ getWorkTypeText(reconciliation.workType) }}</text>
          <text class="info-item">月份：{{ reconciliation.month }}</text>
          <text class="info-item">申请日期：{{ formatDate(reconciliation.applyDate) }}</text>
          <text class="info-item">对账金额：¥{{ reconciliation.amount }}</text>
          <text v-if="reconciliation.workType === 3" class="info-item">计件工资：¥{{ reconciliation.pieceworkAmount }} | 计时工资：¥{{ reconciliation.hourlyAmount }}</text>
        </view>
        <view class="reconciliation-actions">
          <button 
            v-if="reconciliation.status === 'pending'" 
            class="action-btn confirm-btn"
            @click.stop="confirmReconciliation(reconciliation)"
          >
            审核通过
          </button>
          <button 
            v-if="reconciliation.status === 'pending'" 
            class="action-btn reject-btn"
            @click.stop="rejectReconciliation(reconciliation)"
          >
            驳回
          </button>
          <button 
            v-if="reconciliation.status === 'disputed'" 
            class="action-btn handle-btn"
            @click.stop="handleDispute(reconciliation)"
          >
            处理异议
          </button>
          <button 
            v-if="reconciliation.status !== 'pending' && reconciliation.status !== 'disputed'" 
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
      // 筛选状态
      selectedTeamIndex: 0,
      selectedWorkTypeIndex: 0,
      selectedStatusIndex: 0,
      selectedMonth: new Date().toISOString().slice(0, 7),
      // 筛选选项
      teams: ['全部班组', '缝纫一组', '缝纫二组', '熨烫组', '包装组'],
      workTypes: ['全部', '纯计件', '纯计时', '混合用工'],
      statusOptions: ['全部', '待审核', '异议中', '已完成', '已驳回'],
      // 对账数据
      reconciliations: [
        {
          id: 1,
          workerName: '张三',
          workType: 1,
          month: '2024-08',
          applyDate: '2024-09-01',
          amount: 8500,
          status: 'pending',
          transactions: [
            { date: '2024-08-01', type: 'income', amount: 850, description: '车工-牛仔裤' },
            { date: '2024-08-02', type: 'income', amount: 780, description: '车工-T恤' },
            { date: '2024-08-03', type: 'income', amount: 820, description: '车工-外套' }
          ]
        },
        {
          id: 2,
          workerName: '李四',
          workType: 2,
          month: '2024-08',
          applyDate: '2024-09-02',
          amount: 7800,
          status: 'pending',
          transactions: [
            { date: '2024-08-01', hours: 8, wage: 15, amount: 120, type: 'hourly', description: '计时考勤' },
            { date: '2024-08-02', hours: 8, wage: 15, amount: 120, type: 'hourly', description: '计时考勤' },
            { date: '2024-08-03', hours: 8, wage: 15, amount: 120, type: 'hourly', description: '计时考勤' }
          ]
        },
        {
          id: 3,
          workerName: '王五',
          workType: 3,
          month: '2024-08',
          applyDate: '2024-09-03',
          amount: 9200,
          pieceworkAmount: 6000,
          hourlyAmount: 3200,
          status: 'disputed',
          disputeContent: '8月15日工时计算错误',
          disputeImage: '',
          transactions: [
            { date: '2024-08-01', type: 'income', amount: 500, description: '车工-牛仔裤' },
            { date: '2024-08-01', hours: 2, wage: 15, amount: 30, type: 'hourly', description: '加班' },
            { date: '2024-08-02', type: 'income', amount: 520, description: '车工-牛仔裤' },
            { date: '2024-08-02', hours: 3, wage: 15, amount: 45, type: 'hourly', description: '加班' }
          ]
        },
        {
          id: 4,
          workerName: '赵六',
          workType: 1,
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
          id: 5,
          workerName: '孙七',
          workType: 2,
          month: '2024-07',
          applyDate: '2024-08-02',
          amount: 6500,
          status: 'rejected',
          rejectionReason: '部分考勤记录与工厂记录不符，需要重新核对',
          transactions: [
            { date: '2024-07-01', hours: 8, wage: 15, amount: 120, type: 'hourly', description: '计时考勤' },
            { date: '2024-07-02', hours: 8, wage: 15, amount: 120, type: 'hourly', description: '计时考勤' },
            { date: '2024-07-03', hours: 8, wage: 15, amount: 120, type: 'hourly', description: '计时考勤' }
          ]
        }
      ],
      showDetail: false,
      showDisputeModal: false,
      selectedReconciliation: null,
      disputeResolution: ''
    }
  },
  computed: {
    filteredReconciliations() {
      return this.reconciliations.filter(reconciliation => {
        // 班组筛选
        if (this.selectedTeamIndex > 0) {
          // 这里可以根据实际的班组ID进行筛选
        }
        
        // 用工类型筛选
        if (this.selectedWorkTypeIndex > 0) {
          if (reconciliation.workType !== this.selectedWorkTypeIndex) {
            return false
          }
        }
        
        // 状态筛选
        if (this.selectedStatusIndex > 0) {
          const statusMap = {
            1: 'pending',
            2: 'disputed',
            3: 'confirmed',
            4: 'rejected'
          }
          const status = statusMap[this.selectedStatusIndex]
          if (reconciliation.status !== status) {
            return false
          }
        }
        
        // 月份筛选
        if (this.selectedMonth) {
          if (reconciliation.month !== this.selectedMonth) {
            return false
          }
        }
        
        return true
      })
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
    disputedReconciliations() {
      return this.reconciliations.filter(r => r.status === 'disputed').length
    },
    selectedMonthText() {
      const date = new Date(this.selectedMonth)
      return date.getFullYear() + '年' + (date.getMonth() + 1) + '月'
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待审核'
        case 'confirmed': return '已完成'
        case 'rejected': return '已驳回'
        case 'disputed': return '异议中'
        default: return status
      }
    },
    getWorkTypeText(workType) {
      switch (workType) {
        case 1: return '纯计件'
        case 2: return '纯计时'
        case 3: return '混合用工'
        default: return '未知'
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    // 筛选器变化处理
    onTeamChange(e) {
      this.selectedTeamIndex = e.detail.value
    },
    onWorkTypeChange(e) {
      this.selectedWorkTypeIndex = e.detail.value
    },
    onStatusChange(e) {
      this.selectedStatusIndex = e.detail.value
    },
    onMonthChange(e) {
      this.selectedMonth = e.detail.value
    },
    viewReconciliationDetail(reconciliation) {
      this.selectedReconciliation = reconciliation
      this.showDetail = true
    },
    confirmReconciliation(reconciliation) {
      uni.showModal({
        title: '审核通过',
        content: `确定要审核通过 ${reconciliation.workerName} 的对账请求吗？\n对账金额：¥${reconciliation.amount}`,
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
              title: '审核通过',
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
    },
    handleDispute(reconciliation) {
      this.selectedReconciliation = reconciliation
      this.disputeResolution = ''
      this.showDisputeModal = true
    },
    resolveDispute() {
      if (!this.disputeResolution.trim()) {
        uni.showToast({
          title: '请输入处理结果',
          icon: 'none'
        })
        return
      }
      
      // 更新状态
      this.selectedReconciliation.status = 'confirmed'
      this.selectedReconciliation.disputeResolution = this.disputeResolution
      this.selectedReconciliation.resolveDate = new Date().toISOString()
      
      // 保存到本地存储
      uni.setStorageSync('reconciliations', this.reconciliations)
      
      uni.showToast({
        title: '异议处理完成',
        icon: 'success'
      })
      
      this.showDisputeModal = false
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