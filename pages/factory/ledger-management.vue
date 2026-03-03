<template>
  <view class="ledger-management-container">
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">记工管理</text>
      <text class="empty"></text>
    </view>
    
    <!-- 工人选择 -->
    <view class="worker-select-section">
      <text class="section-title">选择工人</text>
      <view class="worker-search">
        <input type="text" v-model="searchKeyword" placeholder="搜索工人姓名" class="search-input" />
        <button class="search-btn" @click="searchWorkers">搜索</button>
      </view>
      <view class="worker-list">
        <view 
          v-for="worker in filteredWorkers" 
          :key="worker.id"
          :class="['worker-item', { active: selectedWorker && selectedWorker.id === worker.id }]"
          @click="selectWorker(worker)"
        >
          <text class="worker-name">{{ worker.name }}</text>
          <text class="worker-info">{{ worker.skills.join('、') }}</text>
        </view>
      </view>
    </view>
    
    <!-- 记工模式选择 -->
    <view v-if="selectedWorker" class="mode-select-section">
      <text class="section-title">选择记工模式</text>
      <view class="mode-buttons">
        <button 
          :class="['mode-btn', { active: currentMode === 'piece' }]" 
          @click="currentMode = 'piece'"
        >
          计件
        </button>
        <button 
          :class="['mode-btn', { active: currentMode === 'time' }]" 
          @click="currentMode = 'time'"
        >
          计时
        </button>
      </view>
    </view>
    
    <!-- 记工表单 -->
    <view v-if="selectedWorker" class="ledger-form-section">
      <text class="section-title">记工详情</text>
      
      <!-- 计件模式表单 -->
      <view v-if="currentMode === 'piece'" class="form-container">
        <view class="form-group">
          <text class="form-label">款号</text>
          <view class="input-with-dropdown">
            <input type="text" v-model="ledgerForm.styleNumber" class="form-input" placeholder="请输入款号" />
            <view class="dropdown-arrow" @click="toggleStyleDropdown">▼</view>
            <!-- 历史款号下拉菜单 -->
            <view v-if="showStyleDropdown && styleHistory.length > 0" class="dropdown-menu">
              <text 
                v-for="(style, index) in styleHistory" 
                :key="index"
                class="dropdown-item"
                @click="selectStyle(style)"
              >
                {{style}}
              </text>
            </view>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">工序</text>
          <view class="input-with-dropdown">
            <input type="text" v-model="ledgerForm.processName" class="form-input" placeholder="请输入工序" />
            <view class="dropdown-arrow" @click="toggleProcessDropdown">▼</view>
            <!-- 历史工序下拉菜单 -->
            <view v-if="showProcessDropdown && ledgerForm.styleNumber" class="dropdown-menu">
              <text 
                v-for="(process, index) in getProcessHistory(ledgerForm.styleNumber)" 
                :key="index"
                class="dropdown-item"
                @click="selectProcess(process)"
              >
                {{process.processName}} - {{process.unitPrice}}元
              </text>
            </view>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">单价</text>
          <input type="number" v-model="ledgerForm.unitPrice" class="form-input" placeholder="请输入单价" />
        </view>
        
        <view class="form-group">
          <text class="form-label">数量</text>
          <input type="number" v-model="ledgerForm.quantity" class="form-input" placeholder="请输入数量" />
        </view>
        
        <view class="form-group">
          <text class="form-label">备注</text>
          <input type="text" v-model="ledgerForm.remark" class="form-input" placeholder="请输入备注" />
        </view>
      </view>
      
      <!-- 计时模式表单 -->
      <view v-else class="form-container">
        <view class="form-group">
          <text class="form-label">工作内容</text>
          <input type="text" v-model="ledgerForm.description" class="form-input" placeholder="请输入工作内容" />
        </view>
        
        <view class="form-group">
          <text class="form-label">工作小时数</text>
          <input type="number" v-model="ledgerForm.hours" class="form-input" placeholder="请输入工作小时数" />
        </view>
        
        <view class="form-group">
          <text class="form-label">时薪</text>
          <input type="number" v-model="ledgerForm.hourlyWage" class="form-input" placeholder="请输入时薪" />
        </view>
        
        <view class="form-group">
          <text class="form-label">备注</text>
          <input type="text" v-model="ledgerForm.remark" class="form-input" placeholder="请输入备注" />
        </view>
      </view>
      
      <button class="submit-btn" @click="submitLedger">提交记工</button>
    </view>
    
    <!-- 工人记工记录 -->
    <view v-if="selectedWorker" class="worker-records-section">
      <text class="section-title">{{ selectedWorker.name }}的记工记录</text>
      <view class="records-list">
        <view v-for="(record, index) in workerRecords" :key="record.id" class="record-item">
          <view class="record-header">
            <text class="record-date">{{ formatDate(record.date) }}</text>
            <text :class="['record-status', record.status]">{{ getStatusText(record.status) }}</text>
          </view>
          <text class="record-description">{{ record.description }}</text>
          <text class="record-amount">¥{{ record.amount }}</text>
          <view class="record-actions">
            <button v-if="record.status === 'pending'" class="action-btn confirm-btn" @click="confirmRecord(record)">确认</button>
            <button v-if="record.status === 'pending'" class="action-btn reject-btn" @click="rejectRecord(record)">驳回</button>
          </view>
        </view>
        
        <view v-if="workerRecords.length === 0" class="empty-state">
          <text>暂无记工记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      workers: [],
      selectedWorker: null,
      currentMode: 'piece',
      ledgerForm: {
        styleNumber: '',
        processName: '',
        unitPrice: '',
        quantity: '',
        description: '',
        hours: '',
        hourlyWage: '',
        remark: ''
      },
      showStyleDropdown: false,
      showProcessDropdown: false,
      styleHistory: [],
      styleProcessMap: {}
    }
  },
  computed: {
    filteredWorkers() {
      if (!this.searchKeyword) {
        return this.workers
      }
      return this.workers.filter(worker => 
        worker.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    },
    workerRecords() {
      if (!this.selectedWorker) return []
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      return allRecords.filter(record => 
        record.workerId === this.selectedWorker.id
      ).sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  },
  onLoad() {
    this.loadWorkers()
    this.loadStyleHistory()
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    loadWorkers() {
      // 模拟加载工人数据
      this.workers = [
        {
          id: 1,
          name: '张三',
          skills: ['平车', '拷边', '开口袋'],
          phone: '139****6666'
        },
        {
          id: 2,
          name: '李四',
          skills: ['装拉链', '拉腰', '装领'],
          phone: '138****7777'
        },
        {
          id: 3,
          name: '王五',
          skills: ['裁剪', '排料', '版型设计'],
          phone: '137****8888'
        },
        {
          id: 4,
          name: '赵六',
          skills: ['质检', '品质控制', '验货'],
          phone: '136****9999'
        }
      ]
    },
    loadStyleHistory() {
      // 加载历史款号和工序
      this.styleHistory = uni.getStorageSync('styleHistory') || ['A001', 'A002', 'B001', 'B002', 'C001']
      this.styleProcessMap = uni.getStorageSync('styleProcessMap') || {
        'A001': [
          { processName: '平车', unitPrice: '5.00' },
          { processName: '拷边', unitPrice: '3.00' },
          { processName: '开口袋', unitPrice: '8.00' }
        ],
        'A002': [
          { processName: '装拉链', unitPrice: '6.00' },
          { processName: '拉腰', unitPrice: '4.00' },
          { processName: '装领', unitPrice: '7.00' }
        ]
      }
    },
    searchWorkers() {
      // 搜索逻辑已在computed中实现
    },
    selectWorker(worker) {
      this.selectedWorker = worker
    },
    toggleStyleDropdown() {
      this.showStyleDropdown = !this.showStyleDropdown
      this.showProcessDropdown = false
    },
    toggleProcessDropdown() {
      this.showProcessDropdown = !this.showProcessDropdown
      this.showStyleDropdown = false
    },
    selectStyle(style) {
      this.ledgerForm.styleNumber = style
      this.showStyleDropdown = false
    },
    selectProcess(process) {
      this.ledgerForm.processName = process.processName
      this.ledgerForm.unitPrice = process.unitPrice
      this.showProcessDropdown = false
    },
    getProcessHistory(style) {
      return this.styleProcessMap[style] || []
    },
    submitLedger() {
      if (!this.selectedWorker) {
        uni.showToast({ title: '请选择工人', icon: 'none' })
        return
      }
      
      let record = {
        id: Date.now(),
        workerId: this.selectedWorker.id,
        workerName: this.selectedWorker.name,
        date: new Date().toISOString(),
        status: 'confirmed', // 工厂录入的直接确认
        remark: this.ledgerForm.remark
      }
      
      if (this.currentMode === 'piece') {
        if (!this.ledgerForm.styleNumber || !this.ledgerForm.processName || !this.ledgerForm.unitPrice || !this.ledgerForm.quantity) {
          uni.showToast({ title: '请填写完整的计件信息', icon: 'none' })
          return
        }
        
        const amount = parseFloat(this.ledgerForm.unitPrice) * parseInt(this.ledgerForm.quantity)
        record = {
          ...record,
          type: 'piece',
          description: `款号${this.ledgerForm.styleNumber} - ${this.ledgerForm.processName}`,
          amount: amount.toFixed(2),
          styleNumber: this.ledgerForm.styleNumber,
          processName: this.ledgerForm.processName,
          quantity: this.ledgerForm.quantity,
          unitPrice: this.ledgerForm.unitPrice
        }
        
        // 更新款号工序映射
        if (!this.styleProcessMap[this.ledgerForm.styleNumber]) {
          this.styleProcessMap[this.ledgerForm.styleNumber] = []
        }
        if (!this.styleProcessMap[this.ledgerForm.styleNumber].some(p => p.processName === this.ledgerForm.processName)) {
          this.styleProcessMap[this.ledgerForm.styleNumber].push({
            processName: this.ledgerForm.processName,
            unitPrice: this.ledgerForm.unitPrice
          })
          uni.setStorageSync('styleProcessMap', this.styleProcessMap)
        }
        
        // 更新款号历史
        if (!this.styleHistory.includes(this.ledgerForm.styleNumber)) {
          this.styleHistory.unshift(this.ledgerForm.styleNumber)
          if (this.styleHistory.length > 10) {
            this.styleHistory = this.styleHistory.slice(0, 10)
          }
          uni.setStorageSync('styleHistory', this.styleHistory)
        }
      } else {
        if (!this.ledgerForm.description || !this.ledgerForm.hours || !this.ledgerForm.hourlyWage) {
          uni.showToast({ title: '请填写完整的计时信息', icon: 'none' })
          return
        }
        
        const amount = parseFloat(this.ledgerForm.hours) * parseFloat(this.ledgerForm.hourlyWage)
        record = {
          ...record,
          type: 'time',
          description: this.ledgerForm.description,
          amount: amount.toFixed(2),
          hours: this.ledgerForm.hours,
          hourlyWage: this.ledgerForm.hourlyWage
        }
      }
      
      // 保存记录
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      allRecords.push(record)
      uni.setStorageSync('ledgerRecords', allRecords)
      
      uni.showToast({ title: '记工成功', icon: 'success' })
      
      // 重置表单
      this.ledgerForm = {
        styleNumber: '',
        processName: '',
        unitPrice: '',
        quantity: '',
        description: '',
        hours: '',
        hourlyWage: '',
        remark: ''
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待确认'
        case 'confirmed': return '已确认'
        case 'rejected': return '已驳回'
        default: return status
      }
    },
    confirmRecord(record) {
      record.status = 'confirmed'
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      const index = allRecords.findIndex(r => r.id === record.id)
      if (index !== -1) {
        allRecords[index] = record
        uni.setStorageSync('ledgerRecords', allRecords)
        uni.showToast({ title: '确认成功', icon: 'success' })
      }
    },
    rejectRecord(record) {
      uni.showModal({
        title: '驳回记工',
        content: '请输入驳回原因',
        editable: true,
        placeholderText: '请输入驳回原因',
        success: (res) => {
          if (res.confirm && res.content) {
            record.status = 'rejected'
            record.rejectionReason = res.content
            const allRecords = uni.getStorageSync('ledgerRecords') || []
            const index = allRecords.findIndex(r => r.id === record.id)
            if (index !== -1) {
              allRecords[index] = record
              uni.setStorageSync('ledgerRecords', allRecords)
              uni.showToast({ title: '驳回成功', icon: 'success' })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.ledger-management-container {
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

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

/* 工人选择区域 */
.worker-select-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.worker-search {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.search-btn {
  padding: 0 32rpx;
  background-color: #667eea;
  color: white;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.worker-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.worker-item {
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  transition: all 0.3s ease;
}

.worker-item.active {
  border-color: #667eea;
  background-color: #f0f4ff;
}

.worker-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.worker-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.worker-info {
  font-size: 20rpx;
  color: #666;
}

/* 模式选择区域 */
.mode-select-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.mode-buttons {
  display: flex;
  gap: 20rpx;
}

.mode-btn {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: white;
  color: #666;
  transition: all 0.3s ease;
}

.mode-btn.active {
  border-color: #667eea;
  background-color: #667eea;
  color: white;
}

/* 记工表单区域 */
.ledger-form-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.form-label {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

.form-input {
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.input-with-dropdown {
  position: relative;
}

.dropdown-arrow {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20rpx;
  color: #666;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  max-height: 300rpx;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  display: block;
  padding: 16rpx 20rpx;
  font-size: 22rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background-color: #f5f5f5;
}

.submit-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 20rpx;
}

/* 工人记工记录区域 */
.worker-records-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  border-left: 4rpx solid #e0e0e0;
}

.record-item.pending {
  border-left-color: #faad14;
}

.record-item.confirmed {
  border-left-color: #52c41a;
}

.record-item.rejected {
  border-left-color: #ff4d4f;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.record-date {
  font-size: 20rpx;
  color: #666;
}

.record-status {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
}

.record-status.pending {
  background-color: #fff7e6;
  color: #faad14;
}

.record-status.confirmed {
  background-color: #f6ffed;
  color: #52c41a;
}

.record-status.rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.record-description {
  font-size: 22rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.record-amount {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.record-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  flex: 1;
  padding: 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.confirm-btn {
  background-color: #52c41a;
  color: white;
}

.reject-btn {
  background-color: #ff4d4f;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
  font-size: 24rpx;
}
</style>