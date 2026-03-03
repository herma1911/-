<template>
  <view class="income-management-container">
    <!-- 顶部标签切换 -->
    <view class="income-tabs">
      <view 
        :class="['tab-item', { active: currentTab === 'factory' }]"
        @click="currentTab = 'factory'"
      >
        工厂记账
      </view>
      <view 
        :class="['tab-item', { active: currentTab === 'actual' }]"
        @click="currentTab = 'actual'"
      >
        实发工资
      </view>
      <view 
        :class="['tab-item', { active: currentTab === 'extra' }]"
        @click="currentTab = 'extra'"
      >
        额外收入
      </view>
    </view>

    <!-- 工厂记账收入 -->
    <view v-if="currentTab === 'factory'" class="tab-content">
      <view class="section-header">
        <text class="section-title">工厂记账收入</text>
        <text class="section-note">仅供个人参考，不代表最终工资</text>
      </view>
      
      <view class="factory-income-summary">
        <view class="summary-item">
          <text class="summary-label">本月小计</text>
          <text class="summary-value">{{factoryIncomeSummary.toFixed(2)}}元</text>
        </view>
      </view>
      
      <view class="income-list">
        <view v-for="(record, index) in factoryIncomeRecords" :key="index" class="income-item">
          <text class="income-description">{{record.description}}</text>
          <text class="income-amount">{{record.amount}}元</text>
          <text class="income-date">{{formatDate(record.date)}}</text>
          <text :class="['income-status', record.status]">{{getStatusText(record.status)}}</text>
        </view>
        <view v-if="factoryIncomeRecords.length === 0" class="empty-state">
          <text>暂无工厂记账记录</text>
        </view>
      </view>
      
      <button class="add-button" @click="navigateToLedger">去记账</button>
    </view>

    <!-- 老板实发工资 -->
    <view v-else-if="currentTab === 'actual'" class="tab-content">
      <view class="section-header">
        <text class="section-title">老板实发工资</text>
      </view>
      
      <view class="actual-income-summary">
        <view class="summary-item">
          <text class="summary-label">本月实发</text>
          <text class="summary-value">{{actualIncomeSummary.toFixed(2)}}元</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">与工厂记账差额</text>
          <text :class="['summary-value', actualIncomeDiff >= 0 ? 'positive' : 'negative']">
            {{actualIncomeDiff >= 0 ? '+' : ''}}{{actualIncomeDiff.toFixed(2)}}元
          </text>
        </view>
      </view>
      
      <view class="income-list">
        <view v-for="(record, index) in actualIncomeRecords" :key="index" class="income-item">
          <text class="income-description">{{record.description}}</text>
          <text class="income-amount">{{record.amount}}元</text>
          <text class="income-date">{{formatDate(record.date)}}</text>
        </view>
        <view v-if="actualIncomeRecords.length === 0" class="empty-state">
          <text>暂无实发工资记录</text>
        </view>
      </view>
      
      <button class="add-button" @click="showAddActualIncomeDialog = true">新增实发工资</button>
    </view>

    <!-- 个人额外收入 -->
    <view v-else-if="currentTab === 'extra'" class="tab-content">
      <view class="section-header">
        <text class="section-title">个人额外收入</text>
      </view>
      
      <view class="extra-income-summary">
        <view class="summary-item">
          <text class="summary-label">本月小计</text>
          <text class="summary-value">{{extraIncomeSummary.toFixed(2)}}元</text>
        </view>
      </view>
      
      <view class="income-list">
        <view v-for="(record, index) in extraIncomeRecords" :key="index" class="income-item">
          <text class="income-description">{{getCategoryText(record.category)}}</text>
          <text class="income-amount">{{record.amount}}元</text>
          <text class="income-date">{{formatDate(record.date)}}</text>
          <text v-if="record.remark" class="income-remark">{{record.remark}}</text>
        </view>
        <view v-if="extraIncomeRecords.length === 0" class="empty-state">
          <text>暂无额外收入记录</text>
        </view>
      </view>
      
      <button class="add-button" @click="showAddExtraIncomeDialog = true">新增额外收入</button>
    </view>

    <!-- 新增实发工资对话框 -->
    <view v-if="showAddActualIncomeDialog" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">新增实发工资</text>
        <view class="dialog-form">
          <view class="form-group">
            <text class="form-label">金额</text>
            <input type="number" v-model="actualIncomeForm.amount" class="form-input" placeholder="请输入实发工资金额" />
          </view>
          <view class="form-group">
            <text class="form-label">日期</text>
            <picker mode="date" @change="onActualIncomeDateChange" :value="actualIncomeForm.date">
              <view class="picker-view">
                <text class="picker-text">{{formatDate(actualIncomeForm.date)}}</text>
              </view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">备注</text>
            <input type="text" v-model="actualIncomeForm.remark" class="form-input" placeholder="请输入备注" />
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-button cancel-button" @click="showAddActualIncomeDialog = false">取消</button>
          <button class="dialog-button confirm-button" @click="saveActualIncome">保存</button>
        </view>
      </view>
    </view>

    <!-- 新增额外收入对话框 -->
    <view v-if="showAddExtraIncomeDialog" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">新增额外收入</text>
        <view class="dialog-form">
          <view class="form-group">
            <text class="form-label">金额</text>
            <input type="number" v-model="extraIncomeForm.amount" class="form-input" placeholder="请输入收入金额" />
          </view>
          <view class="form-group">
            <text class="form-label">分类</text>
            <picker :range="extraIncomeCategories" @change="onExtraIncomeCategoryChange" :value="extraIncomeForm.categoryIndex">
              <view class="picker-view">
                <text class="picker-text">{{extraIncomeCategories[extraIncomeForm.categoryIndex]}}</text>
              </view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">日期</text>
            <picker mode="date" @change="onExtraIncomeDateChange" :value="extraIncomeForm.date">
              <view class="picker-view">
                <text class="picker-text">{{formatDate(extraIncomeForm.date)}}</text>
              </view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">备注</text>
            <input type="text" v-model="extraIncomeForm.remark" class="form-input" placeholder="请输入备注（选填）" />
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-button cancel-button" @click="showAddExtraIncomeDialog = false">取消</button>
          <button class="dialog-button confirm-button" @click="saveExtraIncome">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'factory',
      factoryIncomeRecords: [],
      actualIncomeRecords: [],
      extraIncomeRecords: [],
      showAddActualIncomeDialog: false,
      showAddExtraIncomeDialog: false,
      actualIncomeForm: {
        amount: '',
        date: new Date().toISOString().split('T')[0],
        remark: ''
      },
      extraIncomeForm: {
        amount: '',
        categoryIndex: 4, // 默认选中「其他」
        date: new Date().toISOString().split('T')[0],
        remark: ''
      },
      extraIncomeCategories: ['红包礼金', '兼职副业', '亲友支援', '理财收益', '其他']
    }
  },
  computed: {
    // 工厂记账收入本月小计
    factoryIncomeSummary() {
      const currentMonth = new Date().toISOString().substring(0, 7)
      return this.factoryIncomeRecords
        .filter(record => record.date.substring(0, 7) === currentMonth)
        .reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    // 实发工资本月小计
    actualIncomeSummary() {
      const currentMonth = new Date().toISOString().substring(0, 7)
      return this.actualIncomeRecords
        .filter(record => record.date.substring(0, 7) === currentMonth)
        .reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    // 额外收入本月小计
    extraIncomeSummary() {
      const currentMonth = new Date().toISOString().substring(0, 7)
      return this.extraIncomeRecords
        .filter(record => record.date.substring(0, 7) === currentMonth)
        .reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    // 实发工资与工厂记账的差额
    actualIncomeDiff() {
      return this.actualIncomeSummary - this.factoryIncomeSummary
    }
  },
  onLoad(options) {
    this.loadIncomeRecords()
    // 处理 URL 参数，切换到指定标签
    if (options.tab && ['factory', 'actual', 'extra'].includes(options.tab)) {
      this.currentTab = options.tab
    }
  },
  methods: {
    loadIncomeRecords() {
      // 加载工厂记账记录
      this.factoryIncomeRecords = uni.getStorageSync('ledgerRecords') || []
      
      // 加载实发工资记录
      this.actualIncomeRecords = uni.getStorageSync('actualIncomeRecords') || []
      
      // 加载额外收入记录
      this.extraIncomeRecords = uni.getStorageSync('extraIncomeRecords') || []
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    },
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return '待确认'
        case 'confirmed':
          return '已确认'
        case 'rejected':
          return '已驳回'
        default:
          return '未提交'
      }
    },
    getCategoryText(category) {
      const index = this.extraIncomeCategories.indexOf(category)
      return index >= 0 ? category : '其他'
    },
    navigateToLedger() {
      uni.navigateTo({
        url: '/pages/worker/ledger'
      })
    },
    onActualIncomeDateChange(e) {
      this.actualIncomeForm.date = e.detail.value
    },
    onExtraIncomeDateChange(e) {
      this.extraIncomeForm.date = e.detail.value
    },
    onExtraIncomeCategoryChange(e) {
      this.extraIncomeForm.categoryIndex = e.detail.value
    },
    saveActualIncome() {
      if (!this.actualIncomeForm.amount) {
        uni.showToast({ title: '请输入金额', icon: 'none' })
        return
      }
      
      const newRecord = {
        id: Date.now().toString(),
        amount: this.actualIncomeForm.amount,
        date: this.actualIncomeForm.date,
        remark: this.actualIncomeForm.remark,
        description: '月度实发工资',
        create_time: new Date().toISOString()
      }
      
      this.actualIncomeRecords.push(newRecord)
      uni.setStorageSync('actualIncomeRecords', this.actualIncomeRecords)
      
      this.showAddActualIncomeDialog = false
      this.actualIncomeForm = {
        amount: '',
        date: new Date().toISOString().split('T')[0],
        remark: ''
      }
      
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    saveExtraIncome() {
      if (!this.extraIncomeForm.amount) {
        uni.showToast({ title: '请输入金额', icon: 'none' })
        return
      }
      
      const newRecord = {
        id: Date.now().toString(),
        amount: this.extraIncomeForm.amount,
        category: this.extraIncomeCategories[this.extraIncomeForm.categoryIndex],
        date: this.extraIncomeForm.date,
        remark: this.extraIncomeForm.remark,
        create_time: new Date().toISOString()
      }
      
      this.extraIncomeRecords.push(newRecord)
      uni.setStorageSync('extraIncomeRecords', this.extraIncomeRecords)
      
      this.showAddExtraIncomeDialog = false
      this.extraIncomeForm = {
        amount: '',
        categoryIndex: 4,
        date: new Date().toISOString().split('T')[0],
        remark: ''
      }
      
      uni.showToast({ title: '保存成功', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.income-management-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 标签切换 */
.income-tabs {
  display: flex;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4A90E2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

/* 标签内容 */
.tab-content {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.section-note {
  font-size: 20rpx;
  color: #999;
  display: block;
}

/* 汇总信息 */
.factory-income-summary,
.actual-income-summary,
.extra-income-summary {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 24rpx;
  color: #666;
}

.summary-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.summary-value.positive {
  color: #52c41a;
}

.summary-value.negative {
  color: #ff4d4f;
}

/* 收入列表 */
.income-list {
  margin-bottom: 20rpx;
}

.income-item {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.income-item:last-child {
  border-bottom: none;
}

.income-description {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.income-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.income-date {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.income-remark {
  font-size: 20rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 8rpx 12rpx;
  border-radius: 6rpx;
  align-self: flex-start;
}

.income-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  align-self: flex-start;
  margin-top: 8rpx;
}

.income-status.pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.income-status.confirmed {
  background-color: #f6ffed;
  color: #52c41a;
}

.income-status.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

/* 添加按钮 */
.add-button {
  width: 100%;
  padding: 20rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.dialog-content {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  width: 80%;
  max-width: 500rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.dialog-form {
  margin-bottom: 30rpx;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  padding: 15rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.picker-view {
  width: 100%;
  padding: 15rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
}

.dialog-button {
  flex: 1;
  padding: 15rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.dialog-button.cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.dialog-button.confirm-button {
  background-color: #4A90E2;
  color: #fff;
}
</style>