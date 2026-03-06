<template>
  <view class="fixed-expenses-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <text class="nav-title">固定支出管理</text>
      <text class="nav-back" @tap="goBack">←</text>
    </view>
    
    <!-- 固定支出统计 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-label">本月固定支出</text>
        <text class="stat-value">¥{{ monthlyFixedExpense }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">总固定支出</text>
        <text class="stat-value">¥{{ totalFixedExpense }}</text>
      </view>
    </view>
    
    <!-- 固定支出列表 -->
    <view class="expense-list">
      <view class="list-header">
        <text class="header-title">支出列表</text>
        <text class="header-count">({{ fixedExpenses.length }}项)</text>
      </view>
      
      <view v-if="fixedExpenses.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无固定支出</text>
        <text class="empty-subtext">点击下方按钮添加固定支出</text>
      </view>
      
      <view v-else class="expense-items">
        <view 
          v-for="expense in fixedExpenses" 
          :key="expense.id"
          class="expense-item"
        >
          <view class="item-header">
            <text class="item-name">{{ expense.name }}</text>
            <text class="item-amount">¥{{ expense.amount }}</text>
          </view>
          <view class="item-details">
            <text class="item-category">{{ expense.category }}</text>
            <text class="item-date">每月{{ expense.remindDay }}日提醒</text>
          </view>
          <view v-if="expense.endDate" class="item-end-date">
            <text class="end-date-text">截止日期: {{ expense.endDate }}</text>
            <text v-if="expense.status === 'completed'" class="status-badge completed">已结清</text>
          </view>
          <view class="item-actions">
            <text class="action-btn" @tap="editExpense(expense)">编辑</text>
            <text class="action-btn" @tap="pauseExpense(expense)">暂停</text>
            <text class="action-btn" @tap="addHistoricalBill(expense)">补录账单</text>
            <text class="action-btn delete" @tap="deleteExpense(expense.id)">删除</text>
            <text v-if="expense.type === 'loan'" class="action-btn" @tap="viewRepaymentPlan(expense)">还款计划</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加固定支出按钮 -->
    <view class="add-btn" @tap="addExpense">
      <text class="add-icon">+</text>
    </view>
    
    <!-- 添加/编辑固定支出弹窗 -->
    <view v-if="showExpenseModal" class="modal-overlay" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ editingExpense ? '编辑固定支出' : '添加固定支出' }}</text>
        
        <view class="form-group">
          <text class="form-label">支出名称</text>
          <input type="text" v-model="expenseForm.name" class="form-input" placeholder="请输入支出名称" />
        </view>
        
        <view class="form-group">
          <text class="form-label">支出类型</text>
          <picker v-model="expenseForm.categoryIndex" :range="expenseCategories" class="form-picker">
            <text class="form-picker-text">{{ expenseCategories[expenseForm.categoryIndex] || '请选择类型' }}</text>
          </picker>
        </view>
        
        <view class="form-group" v-if="expenseForm.categoryIndex === expenseCategories.length - 1">
          <text class="form-label">自定义类型</text>
          <input type="text" v-model="customCategory" class="form-input" placeholder="请输入自定义支出类型" />
        </view>
        
        <view class="form-group">
          <text class="form-label">每月固定金额</text>
          <input type="number" v-model.number="expenseForm.amount" class="form-input" placeholder="请输入金额" />
        </view>
        
        <view class="form-group">
          <text class="form-label">每月提醒日期</text>
          <input type="number" v-model.number="expenseForm.remindDay" class="form-input" placeholder="请输入日期" />
        </view>
        
        <view class="form-group" v-if="isLoanType">
          <text class="form-label">截止日期</text>
          <input type="date" v-model="expenseForm.endDate" class="form-input" />
        </view>
        
        <view class="form-group" v-if="isLoanType">
          <text class="form-label">贷款总金额</text>
          <input type="number" v-model.number="expenseForm.totalAmount" class="form-input" placeholder="请输入总金额" />
        </view>
        
        <view class="form-group" v-if="isLoanType">
          <text class="form-label">年利率(%)</text>
          <input type="number" v-model.number="expenseForm.interestRate" class="form-input" placeholder="请输入年利率" />
        </view>
        
        <view class="form-group" v-if="isLoanType">
          <text class="form-label">还款期数</text>
          <input type="number" v-model.number="expenseForm.loanTerm" class="form-input" placeholder="请输入期数" />
        </view>
        
        <view class="form-group" v-if="isLoanType">
          <text class="form-label">还款方式</text>
          <picker v-model="expenseForm.repaymentType" :range="['等额本息', '等额本金']" class="form-picker">
            <text class="form-picker-text">{{ expenseForm.repaymentType === 0 ? '等额本息' : '等额本金' }}</text>
          </picker>
        </view>
        
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeModal">取消</button>
          <button class="modal-btn primary" @tap="saveExpense">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 还款计划弹窗 -->
    <view v-if="showRepaymentModal" class="modal-overlay" @tap="closeRepaymentModal">
      <view class="modal-content repayment-modal" @tap.stop>
        <text class="modal-title">还款计划</text>
        <text class="loan-info">
          {{ selectedExpense.name }} - 总金额: ¥{{ selectedExpense.totalAmount }}
        </text>
        <view class="repayment-summary">
          <view class="summary-item">
            <text class="summary-label">总期数</text>
            <text class="summary-value">{{ selectedExpense.loanTerm }}期</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">总利息</text>
            <text class="summary-value">¥{{ totalInterest.toFixed(2) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">总还款</text>
            <text class="summary-value">¥{{ totalRepayment.toFixed(2) }}</text>
          </view>
        </view>
        <view class="repayment-list">
          <view class="repayment-item" v-for="(plan, index) in repaymentPlan" :key="index">
            <text class="plan-period">第{{ index + 1 }}期</text>
            <text class="plan-amount">¥{{ plan.payment.toFixed(2) }}</text>
            <text class="plan-principal">本金: ¥{{ plan.principal.toFixed(2) }}</text>
            <text class="plan-interest">利息: ¥{{ plan.interest.toFixed(2) }}</text>
          </view>
        </view>
        <button class="modal-btn" @tap="closeRepaymentModal">关闭</button>
      </view>
    </view>
    
    <!-- 暂停提醒弹窗 -->
    <view v-if="showPauseModal" class="modal-overlay" @tap="closePauseModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">暂停提醒</text>
        <text class="modal-desc">请选择暂停时长</text>
        <view class="pause-options">
          <view class="pause-option" @tap="selectPauseDuration(1)">
            <text class="option-radio">{{ pauseDuration === 1 ? '●' : '○' }}</text>
            <text class="option-text">1个月</text>
          </view>
          <view class="pause-option" @tap="selectPauseDuration(3)">
            <text class="option-radio">{{ pauseDuration === 3 ? '●' : '○' }}</text>
            <text class="option-text">3个月</text>
          </view>
          <view class="pause-option" @tap="selectPauseDuration(0)">
            <text class="option-radio">{{ pauseDuration === 0 ? '●' : '○' }}</text>
            <text class="option-text">自定义</text>
          </view>
        </view>
        <view v-if="pauseDuration === 0" class="form-group">
          <text class="form-label">暂停月数</text>
          <input type="number" v-model.number="customPauseDuration" class="form-input" placeholder="请输入月数" />
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closePauseModal">取消</button>
          <button class="modal-btn primary" @tap="confirmPause">确认</button>
        </view>
      </view>
    </view>
    
    <!-- 补录历史账单弹窗 -->
    <view v-if="showDatePicker" class="modal-overlay" @tap="closeDatePicker">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">补录历史账单</text>
        <text class="modal-desc">请选择补录日期</text>
        <view class="form-group">
          <text class="form-label">选择日期</text>
          <input type="date" v-model="historicalBillDate" class="form-input" />
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeDatePicker">取消</button>
          <button class="modal-btn primary" @tap="confirmHistoricalBill">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      fixedExpenses: [],
      showExpenseModal: false,
      showRepaymentModal: false,
      showPauseModal: false,
      showDatePicker: false,
      editingExpense: null,
      selectedExpense: null,
      pauseDuration: 1,
      customPauseDuration: 1,
      historicalBillDate: new Date().toISOString().split('T')[0],
      expenseCategories: [
        '房租/房贷', '水电费', '燃气费', '手机话费', '宽带费',
        '物业费', '交通费', '保险费', '子女教育费', '车贷', '其他'
      ],
      customCategory: '',
      expenseForm: {
        name: '',
        categoryIndex: 0,
        amount: 0,
        remindDay: 1,
        endDate: '',
        totalAmount: 0,
        interestRate: 0,
        loanTerm: 0,
        repaymentType: 0
      },
      repaymentPlan: [],
      totalInterest: 0,
      totalRepayment: 0
    }
  },
  computed: {
    monthlyFixedExpense() {
      return this.fixedExpenses.reduce((total, expense) => {
        if (expense.status !== 'completed' && expense.status !== 'paused') {
          return total + expense.amount
        }
        return total
      }, 0)
    },
    totalFixedExpense() {
      return this.fixedExpenses.reduce((total, expense) => {
        if (expense.status !== 'completed') {
          return total + expense.amount
        }
        return total
      }, 0)
    },
    isLoanType() {
      const category = this.expenseCategories[this.expenseForm.categoryIndex]
      return category === '房贷' || category === '车贷'
    }
  },
  onLoad() {
    this.loadFixedExpenses()
  },
  methods: {
    loadFixedExpenses() {
      const expenses = uni.getStorageSync('fixedExpenses') || []
      this.fixedExpenses = expenses
    },
    saveFixedExpenses() {
      uni.setStorageSync('fixedExpenses', this.fixedExpenses)
    },
    goBack() {
      uni.navigateBack()
    },
    addExpense() {
      this.editingExpense = null
      this.customCategory = ''
      this.expenseForm = {
        name: '',
        categoryIndex: 0,
        amount: 0,
        remindDay: 1,
        endDate: '',
        totalAmount: 0,
        interestRate: 0,
        loanTerm: 0,
        repaymentType: 0
      }
      this.showExpenseModal = true
    },
    editExpense(expense) {
      this.editingExpense = expense
      const categoryIndex = this.expenseCategories.indexOf(expense.category)
      this.customCategory = categoryIndex === -1 ? expense.category : ''
      this.expenseForm = {
        name: expense.name,
        categoryIndex: categoryIndex === -1 ? this.expenseCategories.length - 1 : categoryIndex,
        amount: expense.amount,
        remindDay: expense.remindDay,
        endDate: expense.endDate || '',
        totalAmount: expense.totalAmount || 0,
        interestRate: expense.interestRate || 0,
        loanTerm: expense.loanTerm || 0,
        repaymentType: expense.repaymentType || 0
      }
      this.showExpenseModal = true
    },
    saveExpense() {
      if (!this.expenseForm.name || !this.expenseForm.amount || !this.expenseForm.remindDay) {
        uni.showToast({
          title: '请填写必要信息',
          icon: 'none'
        })
        return
      }
      
      let category = this.expenseCategories[this.expenseForm.categoryIndex]
      if (category === '其他' && this.customCategory) {
        category = this.customCategory
      }
      const isLoan = category === '房贷' || category === '车贷'
      
      if (isLoan && (!this.expenseForm.totalAmount || !this.expenseForm.interestRate || !this.expenseForm.loanTerm)) {
        uni.showToast({
          title: '请填写贷款信息',
          icon: 'none'
        })
        return
      }
      
      const expenseData = {
        id: this.editingExpense ? this.editingExpense.id : Date.now(),
        name: this.expenseForm.name,
        category: category,
        amount: this.expenseForm.amount,
        remindDay: this.expenseForm.remindDay,
        endDate: this.expenseForm.endDate,
        status: 'active',
        createdAt: this.editingExpense ? this.editingExpense.createdAt : new Date().toISOString(),
        type: isLoan ? 'loan' : 'regular'
      }
      
      if (isLoan) {
        expenseData.totalAmount = this.expenseForm.totalAmount
        expenseData.interestRate = this.expenseForm.interestRate
        expenseData.loanTerm = this.expenseForm.loanTerm
        expenseData.repaymentType = this.expenseForm.repaymentType
      }
      
      if (this.editingExpense) {
        const index = this.fixedExpenses.findIndex(e => e.id === this.editingExpense.id)
        this.fixedExpenses[index] = expenseData
      } else {
        this.fixedExpenses.push(expenseData)
      }
      
      this.saveFixedExpenses()
      this.closeModal()
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    deleteExpense(id) {
      uni.showModal({
        title: '删除确认',
        content: '确定要删除这个固定支出吗？',
        success: (res) => {
          if (res.confirm) {
            this.fixedExpenses = this.fixedExpenses.filter(e => e.id !== id)
            this.saveFixedExpenses()
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    pauseExpense(expense) {
      this.selectedExpense = expense
      this.showPauseModal = true
    },
    selectPauseDuration(duration) {
      this.pauseDuration = duration
    },
    confirmPause() {
      const duration = this.pauseDuration === 0 ? this.customPauseDuration : this.pauseDuration
      const index = this.fixedExpenses.findIndex(e => e.id === this.selectedExpense.id)
      this.fixedExpenses[index].status = 'paused'
      this.fixedExpenses[index].pauseEndDate = new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString()
      this.saveFixedExpenses()
      this.closePauseModal()
      uni.showToast({
        title: '已暂停提醒',
        icon: 'success'
      })
    },
    viewRepaymentPlan(expense) {
      this.selectedExpense = expense
      this.generateRepaymentPlan()
      this.showRepaymentModal = true
    },
    generateRepaymentPlan() {
      const { totalAmount, interestRate, loanTerm, repaymentType } = this.selectedExpense
      const monthlyRate = interestRate / 100 / 12
      const plan = []
      let remainingPrincipal = totalAmount
      let totalInterest = 0
      
      if (repaymentType === 0) { // 等额本息
        const monthlyPayment = totalAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
        for (let i = 0; i < loanTerm; i++) {
          const interest = remainingPrincipal * monthlyRate
          const principal = monthlyPayment - interest
          remainingPrincipal -= principal
          totalInterest += interest
          plan.push({ payment: monthlyPayment, principal, interest })
        }
      } else { // 等额本金
        const monthlyPrincipal = totalAmount / loanTerm
        for (let i = 0; i < loanTerm; i++) {
          const interest = remainingPrincipal * monthlyRate
          const payment = monthlyPrincipal + interest
          remainingPrincipal -= monthlyPrincipal
          totalInterest += interest
          plan.push({ payment, principal: monthlyPrincipal, interest })
        }
      }
      
      this.repaymentPlan = plan
      this.totalInterest = totalInterest
      this.totalRepayment = totalAmount + totalInterest
    },
    closeModal() {
      this.showExpenseModal = false
      this.editingExpense = null
      this.customCategory = ''
    },
    closeRepaymentModal() {
      this.showRepaymentModal = false
      this.selectedExpense = null
      this.repaymentPlan = []
    },
    closePauseModal() {
      this.showPauseModal = false
      this.selectedExpense = null
      this.pauseDuration = 1
      this.customPauseDuration = 1
    },
    addHistoricalBill(expense) {
      this.selectedExpense = expense
      this.showDatePicker = true
    },
    confirmHistoricalBill() {
      if (!this.historicalBillDate) {
        uni.showToast({
          title: '请选择日期',
          icon: 'none'
        })
        return
      }
      
      const paymentRecord = {
        id: Date.now(),
        type: 'expense',
        date: this.historicalBillDate,
        amount: this.selectedExpense.amount,
        category: this.selectedExpense.category,
        note: `${this.selectedExpense.name}历史账单补录`,
        createdAt: new Date().toISOString()
      }
      // 保存到本地存储
      const records = uni.getStorageSync('workRecords') || []
      records.push(paymentRecord)
      uni.setStorageSync('workRecords', records)
      this.showDatePicker = false
      uni.showToast({
        title: '补录成功',
        icon: 'success'
      })
    },
    closeDatePicker() {
      this.showDatePicker = false
    }
  }
}
</script>

<style scoped>
.fixed-expenses-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 100rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-back {
  font-size: 36rpx;
  color: #666;
}

.stats-section {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.expense-list {
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.header-count {
  font-size: 22rpx;
  color: #999;
  margin-left: 10rpx;
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-text {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.empty-subtext {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.expense-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.expense-item {
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  padding: 20rpx;
  background: #fafafa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.item-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

.item-amount {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff4d4f;
}

.item-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.item-category {
  font-size: 20rpx;
  color: #666;
}

.item-date {
  font-size: 20rpx;
  color: #999;
}

.item-end-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.end-date-text {
  font-size: 20rpx;
  color: #666;
}

.status-badge {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 16rpx;
  font-weight: 500;
}

.status-badge.completed {
  background: #f6ffed;
  color: #52c41a;
  border: 1rpx solid #b7eb8f;
}

.item-actions {
  display: flex;
  gap: 15rpx;
  flex-wrap: wrap;
}

.action-btn {
  font-size: 20rpx;
  color: #1677ff;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background: #e6f7ff;
}

.action-btn.delete {
  color: #ff4d4f;
  background: #fff2f0;
}

.add-btn {
  position: fixed;
  bottom: 30rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
  z-index: 99;
}

.add-icon {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 85%;
  max-width: 500rpx;
  text-align: center;
  max-height: 80vh;
  overflow-y: auto;
}

.repayment-modal {
  width: 90%;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.modal-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.form-group {
  margin-bottom: 25rpx;
  text-align: left;
}

.form-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.form-picker {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background-color: #fff;
}

.form-picker-text {
  font-size: 24rpx;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 30rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.modal-btn.primary {
  background-color: #1677ff;
  color: #fff;
}

.modal-btn.secondary {
  background-color: #f5f5f5;
  color: #333;
}

.pause-options {
  margin: 30rpx 0;
  text-align: left;
}

.pause-option {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.option-radio {
  font-size: 28rpx;
  margin-right: 20rpx;
  color: #1677ff;
}

.option-text {
  font-size: 24rpx;
  color: #333;
}

.loan-info {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.repayment-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: #fafafa;
  border-radius: 12rpx;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 5rpx;
  display: block;
}

.summary-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.repayment-list {
  max-height: 400rpx;
  overflow-y: auto;
  margin-bottom: 20rpx;
}

.repayment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.plan-period {
  font-size: 20rpx;
  color: #333;
  font-weight: 500;
}

.plan-amount {
  font-size: 22rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.plan-principal, .plan-interest {
  font-size: 18rpx;
  color: #999;
}
</style>