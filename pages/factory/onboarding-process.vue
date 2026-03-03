<template>
  <view class="onboarding-process-container">
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">线上入职闭环</text>
      <text class="empty"></text>
    </view>
    
    <!-- 流程导航 -->
    <view class="process-nav">
      <view :class="['process-step', { active: currentStep === 1 }]">
        <text class="step-number">{{ currentStep >= 1 ? '✓' : '1' }}</text>
        <text class="step-label">标记到岗</text>
      </view>
      <view class="process-line" :class="{ active: currentStep >= 2 }"></view>
      <view :class="['process-step', { active: currentStep === 2 }]">
        <text class="step-number">{{ currentStep >= 2 ? '✓' : '2' }}</text>
        <text class="step-label">上传薪资记录</text>
      </view>
      <view class="process-line" :class="{ active: currentStep >= 3 }"></view>
      <view :class="['process-step', { active: currentStep === 3 }]">
        <text class="step-number">{{ currentStep >= 3 ? '✓' : '3' }}</text>
        <text class="step-label">确认有效入职</text>
      </view>
    </view>
    
    <!-- 步骤内容 -->
    <view class="step-content">
      <!-- 步骤1：标记到岗 -->
      <view v-if="currentStep === 1" class="step-section">
        <text class="step-title">标记工人到岗</text>
        <text class="step-description">请选择已录用但尚未到岗的工人，标记其到岗状态</text>
        
        <view class="worker-list">
          <view 
            v-for="worker in workersToOnboard" 
            :key="worker.id"
            :class="['worker-item', { selected: selectedWorkers.includes(worker.id) }]"
            @click="toggleWorkerSelection(worker.id)"
          >
            <view class="worker-info">
              <text class="worker-name">{{ worker.name }}</text>
              <text class="worker-position">{{ worker.position }}</text>
              <text class="worker-hire-date">录用日期：{{ formatDate(worker.hireDate) }}</text>
            </view>
            <view class="selection-checkbox">
              <text v-if="selectedWorkers.includes(worker.id)">✓</text>
            </view>
          </view>
          
          <view v-if="workersToOnboard.length === 0" class="empty-state">
            <text class="empty-icon">👥</text>
            <text class="empty-text">暂无待到岗工人</text>
            <text class="empty-hint">所有已录用工人均已标记到岗</text>
          </view>
        </view>
        
        <view class="step-actions">
          <button 
            class="primary-btn" 
            :disabled="selectedWorkers.length === 0"
            @click="markWorkersArrived"
          >
            标记到岗
          </button>
        </view>
      </view>
      
      <!-- 步骤2：上传薪资记录 -->
      <view v-if="currentStep === 2" class="step-section">
        <text class="step-title">上传薪资发放记录</text>
        <text class="step-description">请上传本月已发放的薪资记录，支持Excel或PDF格式</text>
        
        <view class="upload-section">
          <view v-if="!salaryFile" class="upload-area" @click="selectSalaryFile">
            <text class="upload-icon">📁</text>
            <text class="upload-text">点击上传薪资记录文件</text>
            <text class="upload-hint">支持 .xlsx、.xls、.pdf 格式</text>
          </view>
          <view v-else class="file-preview">
            <text class="file-icon">📄</text>
            <view class="file-info">
              <text class="file-name">{{ salaryFile.name }}</text>
              <text class="file-size">{{ formatFileSize(salaryFile.size) }}</text>
            </view>
            <text class="remove-file" @click="removeSalaryFile">×</text>
          </view>
        </view>
        
        <view class="salary-details">
          <text class="details-title">薪资发放详情</text>
          <view class="detail-item">
            <text class="detail-label">发放月份：</text>
            <picker mode="date" fields="month" :value="salaryMonth" @change="onSalaryMonthChange" class="detail-picker">
              <text class="picker-text">{{ salaryMonth }}</text>
            </picker>
          </view>
          <view class="detail-item">
            <text class="detail-label">发放日期：</text>
            <picker mode="date" :value="salaryDate" @change="onSalaryDateChange" class="detail-picker">
              <text class="picker-text">{{ salaryDate }}</text>
            </picker>
          </view>
          <view class="detail-item">
            <text class="detail-label">发放人数：</text>
            <input type="number" v-model="salaryCount" placeholder="请输入发放人数" class="detail-input" />
          </view>
          <view class="detail-item">
            <text class="detail-label">总发放金额：</text>
            <input type="number" v-model="salaryTotal" placeholder="请输入总金额" class="detail-input" />
          </view>
        </view>
        
        <view class="step-actions">
          <button 
            class="primary-btn" 
            :disabled="!salaryFile || !salaryMonth || !salaryDate || !salaryCount || !salaryTotal"
            @click="uploadSalaryRecord"
          >
            上传并确认
          </button>
        </view>
      </view>
      
      <!-- 步骤3：确认有效入职 -->
      <view v-if="currentStep === 3" class="step-section">
        <text class="step-title">确认有效线上入职</text>
        <text class="step-description">请确认本月完成线上入职闭环的工人，标记为有效入职</text>
        
        <view class="eligible-workers">
          <view 
            v-for="worker in eligibleWorkers" 
            :key="worker.id"
            :class="['worker-item', { selected: selectedEligibleWorkers.includes(worker.id) }]"
            @click="toggleEligibleWorkerSelection(worker.id)"
          >
            <view class="worker-info">
              <text class="worker-name">{{ worker.name }}</text>
              <text class="worker-position">{{ worker.position }}</text>
              <text class="worker-onboard-date">到岗日期：{{ formatDate(worker.onboardDate) }}</text>
              <text class="worker-salary-date">薪资发放：{{ formatDate(worker.salaryDate) }}</text>
            </view>
            <view class="selection-checkbox">
              <text v-if="selectedEligibleWorkers.includes(worker.id)">✓</text>
            </view>
          </view>
          
          <view v-if="eligibleWorkers.length === 0" class="empty-state">
            <text class="empty-icon">✅</text>
            <text class="empty-text">暂无符合条件的工人</text>
            <text class="empty-hint">请先完成前两个步骤</text>
          </view>
        </view>
        
        <view class="step-actions">
          <button 
            class="primary-btn" 
            :disabled="selectedEligibleWorkers.length === 0"
            @click="confirmEffectiveOnboarding"
          >
            确认有效入职
          </button>
        </view>
      </view>
    </view>
    
    <!-- 完成提示 -->
    <view v-if="showCompletion" class="completion-modal">
      <view class="completion-content">
        <text class="completion-icon">🎉</text>
        <text class="completion-title">操作成功</text>
        <text class="completion-message">{{ completionMessage }}</text>
        <button class="completion-btn" @click="closeCompletion">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      selectedWorkers: [],
      selectedEligibleWorkers: [],
      salaryFile: null,
      salaryMonth: new Date().toISOString().slice(0, 7),
      salaryDate: new Date().toISOString().slice(0, 10),
      salaryCount: '',
      salaryTotal: '',
      showCompletion: false,
      completionMessage: '',
      workersToOnboard: [
        { id: 1, name: '张三', position: '缝纫工', hireDate: '2024-08-01', status: 'hired' },
        { id: 2, name: '李四', position: '质检员', hireDate: '2024-08-05', status: 'hired' },
        { id: 3, name: '王五', position: '拷边工', hireDate: '2024-08-10', status: 'hired' }
      ],
      eligibleWorkers: [
        { id: 1, name: '张三', position: '缝纫工', onboardDate: '2024-08-02', salaryDate: '2024-08-30' },
        { id: 2, name: '李四', position: '质检员', onboardDate: '2024-08-06', salaryDate: '2024-08-30' }
      ]
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    toggleWorkerSelection(workerId) {
      const index = this.selectedWorkers.indexOf(workerId)
      if (index > -1) {
        this.selectedWorkers.splice(index, 1)
      } else {
        this.selectedWorkers.push(workerId)
      }
    },
    toggleEligibleWorkerSelection(workerId) {
      const index = this.selectedEligibleWorkers.indexOf(workerId)
      if (index > -1) {
        this.selectedEligibleWorkers.splice(index, 1)
      } else {
        this.selectedEligibleWorkers.push(workerId)
      }
    },
    markWorkersArrived() {
      // 标记工人到岗
      this.selectedWorkers.forEach(workerId => {
        const worker = this.workersToOnboard.find(w => w.id === workerId)
        if (worker) {
          worker.status = 'onboarded'
          worker.onboardDate = new Date().toISOString()
        }
      })
      
      // 保存到本地存储
      uni.setStorageSync('workersToOnboard', this.workersToOnboard)
      
      // 显示完成提示
      this.showCompletionMessage('已成功标记选中工人为到岗状态')
      
      // 进入下一步
      setTimeout(() => {
        this.currentStep = 2
      }, 1500)
    },
    selectSalaryFile() {
      uni.chooseFile({
        count: 1,
        extension: ['.xlsx', '.xls', '.pdf'],
        success: (res) => {
          this.salaryFile = res.tempFiles[0]
        }
      })
    },
    removeSalaryFile() {
      this.salaryFile = null
    },
    onSalaryMonthChange(e) {
      this.salaryMonth = e.detail.value
    },
    onSalaryDateChange(e) {
      this.salaryDate = e.detail.value
    },
    formatFileSize(size) {
      if (size < 1024) {
        return size + ' B'
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB'
      } else {
        return (size / (1024 * 1024)).toFixed(2) + ' MB'
      }
    },
    uploadSalaryRecord() {
      // 模拟上传薪资记录
      setTimeout(() => {
        // 保存到本地存储
        const salaryRecord = {
          month: this.salaryMonth,
          date: this.salaryDate,
          count: this.salaryCount,
          total: this.salaryTotal,
          uploadDate: new Date().toISOString()
        }
        uni.setStorageSync('salaryRecord', salaryRecord)
        
        // 显示完成提示
        this.showCompletionMessage('薪资记录上传成功')
        
        // 进入下一步
        setTimeout(() => {
          this.currentStep = 3
        }, 1500)
      }, 1000)
    },
    confirmEffectiveOnboarding() {
      // 标记有效入职
      this.selectedEligibleWorkers.forEach(workerId => {
        const worker = this.eligibleWorkers.find(w => w.id === workerId)
        if (worker) {
          worker.status = 'effective'
          worker.effectiveDate = new Date().toISOString()
        }
      })
      
      // 保存到本地存储
      uni.setStorageSync('eligibleWorkers', this.eligibleWorkers)
      
      // 显示完成提示
      this.showCompletionMessage('已成功确认选中工人为有效入职')
      
      // 重置流程
      setTimeout(() => {
        this.currentStep = 1
        this.selectedWorkers = []
        this.selectedEligibleWorkers = []
        this.salaryFile = null
        this.salaryCount = ''
        this.salaryTotal = ''
      }, 1500)
    },
    showCompletionMessage(message) {
      this.completionMessage = message
      this.showCompletion = true
    },
    closeCompletion() {
      this.showCompletion = false
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.onboarding-process-container {
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

/* 流程导航 */
.process-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.process-step.active .step-number {
  background-color: #667eea;
  color: white;
}

.process-step.active .step-label {
  color: #667eea;
  font-weight: 600;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.step-label {
  font-size: 20rpx;
  color: #666;
  text-align: center;
}

.process-line {
  flex: 1;
  height: 4rpx;
  background-color: #f0f0f0;
  margin: 0 20rpx;
}

.process-line.active {
  background-color: #667eea;
}

/* 步骤内容 */
.step-content {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.step-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.step-description {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

/* 工人列表 */
.worker-list,
.eligible-workers {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.worker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.worker-item:hover {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.worker-item.selected {
  border-color: #667eea;
  background-color: #f0f4ff;
}

.worker-info {
  flex: 1;
}

.worker-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
  display: block;
}

.worker-position {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 4rpx;
  display: block;
}

.worker-hire-date,
.worker-onboard-date,
.worker-salary-date {
  font-size: 18rpx;
  color: #999;
  display: block;
}

.selection-checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #667eea;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-weight: bold;
}

/* 上传区域 */
.upload-section {
  margin: 20rpx 0;
}

.upload-area {
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  padding: 60rpx 20rpx;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
}

.upload-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.upload-hint {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.file-preview {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
}

.file-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.file-size {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.remove-file {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: bold;
  cursor: pointer;
}

/* 薪资详情 */
.salary-details {
  margin: 20rpx 0;
}

.details-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.detail-label {
  font-size: 22rpx;
  color: #666;
  width: 140rpx;
}

.detail-picker,
.detail-input {
  flex: 1;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 22rpx;
  background-color: #f9f9f9;
}

/* 步骤操作 */
.step-actions {
  margin-top: 32rpx;
  display: flex;
  justify-content: center;
}

.primary-btn {
  background-color: #667eea;
  color: white;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  font-size: 24rpx;
  font-weight: 600;
  min-width: 200rpx;
}

.primary-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

/* 完成提示 */
.completion-modal {
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

.completion-content {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  min-width: 60%;
}

.completion-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 24rpx;
}

.completion-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.completion-message {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 32rpx;
  display: block;
}

.completion-btn {
  background-color: #667eea;
  color: white;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  font-size: 24rpx;
  font-weight: 600;
}
</style>