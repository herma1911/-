<template>
  <view class="attendance-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">记考勤</text>
      <text class="empty"></text>
    </view>
    
    <!-- 顶部核心数据看板 -->
    <view class="dashboard">
      <view class="dashboard-item">
        <text class="dashboard-label">当月累计工时</text>
        <text class="dashboard-value">{{ totalHours }}</text>
        <text class="dashboard-unit">小时</text>
      </view>
      <view class="dashboard-item">
        <text class="dashboard-label">当月累计工资</text>
        <text class="dashboard-value salary">{{ totalSalary }}</text>
        <text class="dashboard-unit">元</text>
      </view>
      <view class="dashboard-item">
        <text class="dashboard-label">小时工资标准</text>
        <text class="dashboard-value small">{{ hourlyWage }}</text>
        <text class="dashboard-unit">元/小时</text>
      </view>
    </view>
    
    <!-- 考勤记录表单 -->
    <view class="form-section">
      <view class="form-group">
        <text class="form-label">日期</text>
        <picker mode="date" :value="attendanceDate" @change="onDateChange" class="form-picker">
          <text class="picker-text">{{ formattedDate }}</text>
        </picker>
      </view>
      
      <view class="form-group">
        <text class="form-label">小时工资</text>
        <input type="number" v-model.number="formData.hourlyWage" class="form-input" placeholder="请输入小时工资" min="0" step="0.1" />
      </view>
      
      <view class="form-group">
        <text class="form-label">工作小时数</text>
        <input type="number" v-model.number="formData.hours" class="form-input" placeholder="请输入工作小时数" min="0" step="0.5" />
      </view>
      
      <view class="form-group">
        <text class="form-label">备注（可选）</text>
        <textarea v-model="formData.notes" class="form-textarea" placeholder="请输入备注信息" />
      </view>
      
      <view class="form-result">
        <text class="result-label">计算工资：</text>
        <text class="result-value">¥{{ calculatedSalary.toFixed(2) }}</text>
      </view>
    </view>
    
    <!-- 操作按钮区 -->
    <view class="action-buttons">
      <button class="action-btn secondary" @click="shareToWechat">分享到微信</button>
      <button v-if="hasBoundTeam" class="action-btn team-btn" @click="sendToTeamLeader">推送给班组长</button>
      <button class="action-btn tertiary" @click="viewMonthlyStatement">月度对账单</button>
    </view>
    
    <!-- 日期筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item">
        <text class="filter-label">月份：</text>
        <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange" class="filter-picker">
          <text class="picker-text">{{ selectedMonthText }}</text>
        </picker>
      </view>
      <view class="filter-item">
        <text class="filter-label">筛选：</text>
        <picker :value="filterIndex" :range="filterOptions" @change="onFilterChange" class="filter-picker">
          <text class="picker-text">{{ filterOptions[filterIndex] }}</text>
        </picker>
      </view>
    </view>
    
    <!-- 每日考勤明细列表 -->
    <view class="attendance-list">
      <view 
        v-for="record in attendanceRecords" 
        :key="record.id"
        :class="['attendance-item', { 'pending': record.status === 'pending', 'approved': record.status === 'approved', 'rejected': record.status === 'rejected' }]"
        @click="viewAttendanceDetail(record)"
      >
        <view class="attendance-date">
          <text class="date-day">{{ record.day }}</text>
          <text class="date-week">{{ record.weekday }}</text>
        </view>
        <view class="attendance-info">
          <text class="attendance-hours">{{ record.hours }}小时</text>
          <text class="attendance-amount">{{ record.amount }}元</text>
          <text :class="['attendance-status', record.status]">{{ getStatusText(record.status) }}</text>
        </view>
        <view class="attendance-arrow">→</view>
      </view>
      
      <view v-if="attendanceRecords.length === 0" class="empty-state">
        <text class="empty-icon">📅</text>
        <text class="empty-title">暂无考勤记录</text>
        <text class="empty-content">本月还没有考勤数据，请填写表单保存</text>
      </view>
    </view>
    
    <!-- 底部固定栏 -->
    <view class="bottom-bar">
      <button class="save-attendance-btn" @click="saveAttendance">
        <text class="btn-text">保存考勤</text>
      </button>
    </view>
    
    <!-- 考勤详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">考勤详情</text>
          <text class="modal-close" @click="closeDetailModal">×</text>
        </view>
        <view class="modal-body">
          <view class="detail-item">
            <text class="detail-label">日期：</text>
            <text class="detail-value">{{ currentDetail.date }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">小时工资：</text>
            <text class="detail-value">¥{{ currentDetail.hourlyWage }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">工作时长：</text>
            <text class="detail-value">{{ currentDetail.hours }}小时</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">工资：</text>
            <text class="detail-value salary">{{ currentDetail.amount }}元</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">状态：</text>
            <text :class="['detail-value', currentDetail.status]">{{ getStatusText(currentDetail.status) }}</text>
          </view>
          <view class="detail-item" v-if="currentDetail.notes">
            <text class="detail-label">备注：</text>
            <text class="detail-value">{{ currentDetail.notes }}</text>
          </view>
        </view>
        <view class="modal-actions">
          <button class="action-btn secondary" @click="closeDetailModal">关闭</button>
          <button v-if="currentDetail.status === 'pending'" class="action-btn primary" @click="cancelAttendance">取消推送</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedMonth: new Date().toISOString().slice(0, 7),
      filterIndex: 0,
      filterOptions: ['全部', '按周筛选'],
      hourlyWage: 15,
      totalHours: 0,
      totalSalary: 0,
      attendanceRecords: [],
      showDetailModal: false,
      currentDetail: {},
      // 考勤表单数据
      attendanceDate: new Date().toISOString().slice(0, 10),
      formData: {
        hourlyWage: 15,
        hours: 0,
        notes: ''
      },
      hasBoundTeam: false
    }
  },
  computed: {
    selectedMonthText() {
      const date = new Date(this.selectedMonth)
      return date.getFullYear() + '年' + (date.getMonth() + 1) + '月'
    },
    formattedDate() {
      const date = new Date(this.attendanceDate)
      return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
    },
    calculatedSalary() {
      return this.formData.hourlyWage * this.formData.hours
    }
  },
  onLoad() {
    this.loadAttendanceData()
    this.checkBoundTeam()
    this.loadLastInputValues()
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    onMonthChange(e) {
      this.selectedMonth = e.detail.value
      this.loadAttendanceData()
    },
    onFilterChange(e) {
      this.filterIndex = e.detail.value
      this.loadAttendanceData()
    },
    onDateChange(e) {
      this.attendanceDate = e.detail.value
    },
    checkBoundTeam() {
      // 检查是否绑定了班组
      const userInfo = uni.getStorageSync('userInfo') || {}
      const boundTeam = userInfo.boundTeam || uni.getStorageSync('boundTeam') || null
      this.hasBoundTeam = boundTeam !== null
    },
    loadAttendanceData() {
      // 从本地存储加载考勤数据
      const storedRecords = uni.getStorageSync('attendanceRecords') || []
      
      // 过滤当前月份的记录
      const currentMonth = this.selectedMonth
      this.attendanceRecords = storedRecords.filter(record => {
        return record.date.startsWith(currentMonth)
      })
      
      this.calculateTotal()
    },
    calculateTotal() {
      let totalH = 0
      let totalS = 0
      
      this.attendanceRecords.forEach(record => {
        // 只计算已确认的考勤记录
        if (record.status === 'approved' || record.status === 'normal') {
          totalH += record.hours
          totalS += record.amount
        }
      })
      
      this.totalHours = totalH
      this.totalSalary = totalS
    },
    getStatusText(status) {
      const statusMap = {
        normal: '已保存',
        pending: '待确认',
        approved: '已确认',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    viewAttendanceDetail(record) {
      this.currentDetail = { ...record }
      this.showDetailModal = true
    },
    closeDetailModal() {
      this.showDetailModal = false
      this.currentDetail = {}
    },
    saveAttendance() {
      if (!this.formData.hours || this.formData.hours <= 0) {
        uni.showToast({
          title: '请输入有效的工作小时数',
          icon: 'none'
        })
        return
      }
      
      // 获取当前日期信息
      const date = new Date(this.attendanceDate)
      const day = date.getDate().toString().padStart(2, '0')
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[date.getDay()]
      
      // 计算工资
      const amount = this.calculatedSalary
      
      // 创建新的考勤记录
      const newRecord = {
        id: Date.now(),
        day: day,
        weekday: weekday,
        hours: this.formData.hours,
        hourlyWage: this.formData.hourlyWage,
        amount: amount,
        status: 'normal',
        date: this.attendanceDate,
        notes: this.formData.notes
      }
      
      // 添加到记录列表
      this.attendanceRecords.unshift(newRecord)
      
      // 保存到本地存储
      this.saveAttendanceRecords()
      
      // 重新计算总计
      this.calculateTotal()
      
      // 重置表单
      this.resetForm()
      
      // 保存上次输入值
      this.saveLastInputValues()
      
      // 提示用户考勤记录已保存
      uni.showToast({
        title: '考勤记录已保存',
        icon: 'success'
      })
    },
    shareToWechat() {
      if (!this.formData.hours || this.formData.hours <= 0) {
        uni.showToast({
          title: '请输入有效的工作小时数',
          icon: 'none'
        })
        return
      }
      
      // 计算工资
      const amount = this.calculatedSalary
      
      // 生成分享内容
      const shareContent = `【考勤记录】\n日期：${this.formattedDate}\n小时工资：¥${this.formData.hourlyWage}\n工作时长：${this.formData.hours}小时\n计算工资：¥${amount.toFixed(2)}\n备注：${this.formData.notes || '无'}`
      
      // 模拟分享到微信
      uni.showModal({
        title: '分享到微信',
        content: shareContent,
        success: (res) => {
          if (res.confirm) {
            // 这里可以调用微信分享API
            uni.showToast({
              title: '分享成功',
              icon: 'success'
            })
          }
        }
      })
    },
    sendToTeamLeader() {
      if (!this.formData.hours || this.formData.hours <= 0) {
        uni.showToast({
          title: '请输入有效的工作小时数',
          icon: 'none'
        })
        return
      }
      
      // 获取当前日期信息
      const date = new Date(this.attendanceDate)
      const day = date.getDate().toString().padStart(2, '0')
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[date.getDay()]
      
      // 计算工资
      const amount = this.calculatedSalary
      
      // 创建新的考勤记录（状态为待确认）
      const newRecord = {
        id: Date.now(),
        day: day,
        weekday: weekday,
        hours: this.formData.hours,
        hourlyWage: this.formData.hourlyWage,
        amount: amount,
        status: 'pending',
        date: this.attendanceDate,
        notes: this.formData.notes
      }
      
      // 添加到记录列表
      this.attendanceRecords.unshift(newRecord)
      
      // 保存到本地存储
      this.saveAttendanceRecords()
      
      // 重新计算总计
      this.calculateTotal()
      
      // 重置表单
      this.resetForm()
      
      // 保存上次输入值
      this.saveLastInputValues()
      
      // 提示用户
      uni.showToast({
        title: '已推送给班组长',
        icon: 'success'
      })
    },
    cancelAttendance() {
      // 取消推送
      const record = this.attendanceRecords.find(r => r.id === this.currentDetail.id)
      if (record) {
        record.status = 'normal'
        // 更新本地存储
        this.saveAttendanceRecords()
        // 重新计算总计
        this.calculateTotal()
        // 关闭弹窗
        this.closeDetailModal()
        // 提示用户
        uni.showToast({
          title: '已取消推送',
          icon: 'success'
        })
      }
    },
    resetForm() {
      this.formData = {
        hourlyWage: this.hourlyWage,
        hours: 0,
        notes: ''
      }
      this.attendanceDate = new Date().toISOString().slice(0, 10)
    },
    saveAttendanceRecords() {
      // 从本地存储加载所有记录
      const allRecords = uni.getStorageSync('attendanceRecords') || []
      
      // 过滤掉当前月份的记录
      const otherRecords = allRecords.filter(record => {
        return !record.date.startsWith(this.selectedMonth)
      })
      
      // 合并当前月份的记录和其他月份的记录
      const updatedRecords = [...this.attendanceRecords, ...otherRecords]
      
      // 保存回本地存储
      uni.setStorageSync('attendanceRecords', updatedRecords)
    },
    viewMonthlyStatement() {
      // 跳转到月度对账单页面
      uni.navigateTo({
        url: '/pages/worker/monthly-statement'
      })
    },
    loadLastInputValues() {
      // 加载上次输入的小时工资和小时数
      const lastInput = uni.getStorageSync('lastAttendanceInput')
      if (lastInput) {
        this.formData.hourlyWage = lastInput.hourlyWage || 15
        this.hourlyWage = lastInput.hourlyWage || 15
        this.formData.hours = lastInput.hours || 0
      }
    },
    saveLastInputValues() {
      // 保存当前输入值
      const lastInput = {
        hourlyWage: this.formData.hourlyWage,
        hours: this.formData.hours
      }
      uni.setStorageSync('lastAttendanceInput', lastInput)
    }
  }
}
</script>

<style scoped>
.attendance-container {
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

/* 顶部数据看板 */
.dashboard {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.dashboard-item {
  flex: 1;
  text-align: center;
  padding: 0 16rpx;
}

.dashboard-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.dashboard-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.dashboard-value.salary {
  color: #ff4d4f;
}

.dashboard-value.small {
  font-size: 28rpx;
}

.dashboard-unit {
  font-size: 18rpx;
  color: #999;
}

/* 考勤记录表单 */
.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  box-sizing: border-box;
  min-height: 120rpx;
  resize: vertical;
}

.form-picker {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  box-sizing: border-box;
}

.picker-text {
  color: #333;
}

.form-result {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-size: 24rpx;
  color: #666;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

/* 操作按钮区 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  text-align: center;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
}

.action-btn.secondary {
  background-color: #52c41a;
  color: #fff;
}

.action-btn.team-btn {
  background-color: #fa8c16;
  color: #fff;
}

.action-btn.tertiary {
  background-color: #f0f0f0;
  color: #333;
}

/* 日期筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.filter-item {
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 12rpx;
}

.filter-label {
  font-size: 22rpx;
  color: #666;
  margin-right: 12rpx;
  width: 80rpx;
}

.filter-picker {
  flex: 1;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 12rpx;
  font-size: 22rpx;
  background-color: #f9f9f9;
}

.picker-text {
  color: #333;
}

/* 考勤明细列表 */
.attendance-list {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 120rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.attendance-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.attendance-item:last-child {
  border-bottom: none;
}

.attendance-item:hover {
  background-color: #f9f9f9;
}

.attendance-item.pending {
  background-color: #fff7e6;
}

.attendance-item.approved {
  background-color: #f6ffed;
}

.attendance-item.rejected {
  background-color: #fff1f0;
}

.attendance-date {
  width: 100rpx;
  text-align: center;
  margin-right: 24rpx;
}

.date-day {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.date-week {
  font-size: 18rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.attendance-info {
  flex: 1;
}

.attendance-hours {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.attendance-amount {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.attendance-status {
  font-size: 18rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.attendance-status.normal {
  background-color: #f6ffed;
  color: #52c41a;
}

.attendance-status.pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.attendance-status.approved {
  background-color: #f6ffed;
  color: #52c41a;
}

.attendance-status.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.attendance-arrow {
  font-size: 24rpx;
  color: #999;
  margin-left: 16rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-title {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.empty-content {
  font-size: 20rpx;
  color: #999;
  display: block;
}

/* 底部固定栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.save-attendance-btn {
  background-color: #1890ff;
  color: white;
  border-radius: 8rpx;
  padding: 24rpx;
  font-size: 28rpx;
  font-weight: bold;
  width: 100%;
  border: none;
}

/* 弹窗样式 */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 85%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.dispute-modal {
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.modal-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
}

.modal-body {
  margin-bottom: 24rpx;
}

.detail-item {
  display: flex;
  margin-bottom: 16rpx;
}

.detail-label {
  font-size: 22rpx;
  color: #666;
  width: 120rpx;
}

.detail-value {
  flex: 1;
  font-size: 22rpx;
  color: #333;
}

.detail-value.salary {
  color: #ff4d4f;
}

.detail-value.pending {
  color: #fa8c16;
}

.detail-value.approved {
  color: #52c41a;
}

.detail-value.rejected {
  color: #ff4d4f;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 32rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.action-btn.primary {
  background-color: #667eea;
  color: white;
}

.action-btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

/* 异议弹窗样式 */
.dispute-hint {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.dispute-textarea {
  width: 100%;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 22rpx;
  min-height: 150rpx;
  margin-bottom: 24rpx;
  background-color: #f9f9f9;
}

.upload-section {
  margin-top: 24rpx;
}

.upload-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.upload-area {
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
  margin-bottom: 16rpx;
}

.upload-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 12rpx;
}

.upload-text {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-top: 16rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  cursor: pointer;
}
</style>