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
      
      <!-- 微信分享区 -->
      <view class="share-section">
        <text class="share-title">微信一键转发账单</text>
        <text class="share-desc">即使老板没有下载app，也可以点击确认对账</text>
        <button class="share-btn" @tap="shareToWechat">
          <text class="share-icon">💬</text>
          <text class="share-text">分享给老板</text>
        </button>
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

    <!-- 发起对账弹窗 -->
    <view v-if="showReconciliationModal" class="modal-overlay" @tap="closeReconciliationModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">发起对账</text>
        
        <!-- 年月选择 -->
        <view class="form-group">
          <text class="form-label">选择月份</text>
          <view class="month-picker">
            <picker v-model="reconciliationData.year" :range="getYearRange()" class="year-picker">
              <text class="picker-text">{{ reconciliationData.year }}年</text>
            </picker>
            <text class="picker-separator">-</text>
            <picker v-model="reconciliationData.month" :range="getMonthRange()" class="month-picker">
              <text class="picker-text">{{ reconciliationData.month }}月</text>
            </picker>
          </view>
        </view>
        
        <!-- 日期范围选择 -->
        <view class="form-group">
          <text class="form-label">对账日期范围</text>
          <view class="date-range">
            <input type="date" v-model="reconciliationData.startDate" class="date-input" />
            <text class="date-separator">至</text>
            <input type="date" v-model="reconciliationData.endDate" class="date-input" />
          </view>
          <text class="date-hint">建议选择5号到19号之间的日期</text>
        </view>
        
        <!-- 款号工序选择 -->
        <view class="form-group">
          <text class="form-label">选择款号和工序</text>
          
          <!-- 款号选择 -->
          <view class="dropdown-container">
            <input 
              type="text" 
              v-model="selectedStyle" 
              class="form-input" 
              placeholder="请选择款号" 
              @tap="toggleStyleDropdown"
              readonly
            />
            <!-- 款号下拉菜单 -->
            <view v-if="showStyleDropdown" class="dropdown-menu">
              <view class="dropdown-item" v-for="style in styleHistory" :key="style" @tap="selectStyle(style)">
                {{ style }}
              </view>
            </view>
          </view>
          
          <!-- 工序选择 -->
          <view class="dropdown-container" v-if="selectedStyle">
            <input 
              type="text" 
              v-model="selectedProcess" 
              class="form-input" 
              placeholder="请选择工序" 
              @tap="toggleProcessDropdown"
              readonly
            />
            <!-- 工序下拉菜单 -->
            <view v-if="showProcessDropdown && selectedStyle" class="dropdown-menu">
              <view 
                v-for="process in getProcessesByStyle(selectedStyle)" 
                :key="process.processName"
                class="dropdown-item"
                @tap="selectProcess(process)"
              >
                {{ process.processName }} (¥{{ process.unitPrice }})
              </view>
            </view>
          </view>
          
          <!-- 添加按钮 -->
          <view v-if="selectedStyle && selectedProcess" class="add-button" @tap="addStyleProcess">
            <text class="add-icon">+</text>
            <text class="add-text">添加到对账列表</text>
          </view>
        </view>
        
        <!-- 已选择的款号工序列表 -->
        <view class="form-group" v-if="reconciliationData.selectedStyles.length > 0">
          <text class="form-label">已选择的款号工序</text>
          <view class="selected-list">
            <view 
              v-for="(item, index) in reconciliationData.selectedStyles" 
              :key="index"
              class="selected-item"
            >
              <text class="selected-style">{{ item.style }}</text>
              <text class="selected-process">{{ item.process }}</text>
              <text class="remove-icon" @tap="removeStyleProcess(index)">×</text>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeReconciliationModal">取消</button>
          <button class="modal-btn primary" @tap="submitReconciliation">发起对账</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
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
      ],
      // 发起对账相关
      showReconciliationModal: false,
      reconciliationData: {
        startDate: '',
        endDate: '',
        selectedStyles: [],
        year: currentYear,
        month: currentMonth
      },
      showStyleDropdown: false,
      showProcessDropdown: false,
      styleProcessMap: {},
      styleHistory: [],
      selectedStyle: '',
      selectedProcess: ''
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter(record => record.status === this.activeTab)
    }
  },
  onLoad() {
    this.loadStyleProcessMap()
  },
  watch: {
    'reconciliationData.year': function(newYear) {
      this.updateDateRange()
    },
    'reconciliationData.month': function(newMonth) {
      this.updateDateRange()
    }
  },
  methods: {
    loadStyleProcessMap() {
      // 从本地存储加载款号工序映射
      const storedStyleProcessMap = uni.getStorageSync('styleProcessMap')
      this.styleProcessMap = storedStyleProcessMap && Object.keys(storedStyleProcessMap).length > 0 ? storedStyleProcessMap : {}
      
      // 从本地存储加载历史款号
      const storedStyleHistory = uni.getStorageSync('styleHistory')
      this.styleHistory = storedStyleHistory && storedStyleHistory.length > 0 ? storedStyleHistory : []
    },
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
      // 计算默认日期范围（当月5号到19号）
      const { year, month } = this.reconciliationData
      const startDate = `${year}-${month.toString().padStart(2, '0')}-05`
      const endDate = `${year}-${month.toString().padStart(2, '0')}-19`
      
      this.reconciliationData.startDate = startDate
      this.reconciliationData.endDate = endDate
      this.reconciliationData.selectedStyles = []
      
      this.showReconciliationModal = true
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
    },
    // 微信一键转发账单
    shareToWechat() {
      // 生成按款号和工序分组的账单数据
      const billDetails = this.generateBillDetails()
      const totalAmount = billDetails.totalAmount
      
      uni.showModal({
        title: '分享账单',
        content: '确定要将本月账单分享给老板吗？老板无需下载app即可确认对账。',
        success: (res) => {
          if (res.confirm) {
            // 生成账单ID
            const billId = 'bill_' + Date.now()
            
            // 模拟微信分享
            uni.showLoading({
              title: '正在分享到微信...'
            })
            
            setTimeout(() => {
              uni.hideLoading()
              uni.showToast({
                title: '分享到微信成功，请提醒老板确认',
                icon: 'success'
              })
              
              // 模拟老板确认流程
              setTimeout(() => {
                this.simulateBossConfirmation(billId, billDetails)
              }, 3000)
            }, 1000)
          }
        }
      })
    },
    
    // 生成账单详情
    generateBillDetails() {
      // 模拟按款号和工序分组的账单数据
      const billData = {
        styles: [
          {
            styleNumber: 'ST123',
            processes: [
              {
                processName: '车工',
                totalQuantity: 120,
                unitPrice: 15,
                subtotal: 1800
              },
              {
                processName: '熨烫',
                totalQuantity: 120,
                unitPrice: 8,
                subtotal: 960
              }
            ],
            styleTotal: 2760
          },
          {
            styleNumber: 'ST456',
            processes: [
              {
                processName: '车工',
                totalQuantity: 80,
                unitPrice: 18,
                subtotal: 1440
              },
              {
                processName: '包装',
                totalQuantity: 80,
                unitPrice: 6,
                subtotal: 480
              }
            ],
            styleTotal: 1920
          }
        ],
        totalAmount: 4680
      }
      return billData
    },
    // 模拟老板确认
    simulateBossConfirmation(billId, billDetails) {
      // 生成账单详情文本
      let billText = '⚠️ 重要提醒：本确认仅认工单事实，不做最终薪资结算依据\n\n'
      
      // 添加款号和工序详情
      billDetails.styles.forEach((style, index) => {
        billText += `款号 ${style.styleNumber}\n`
        style.processes.forEach((process, processIndex) => {
          billText += `  工序${processIndex + 1}: ${process.processName}\n`
          billText += `    总数量: ${process.totalQuantity}\n`
          billText += `    单价: ¥${process.unitPrice}\n`
          billText += `    小计: ¥${process.subtotal}\n`
        })
        billText += `  该款总价: ¥${style.styleTotal}\n\n`
      })
      
      // 添加总金额
      billText += `整个账单总价: ¥${billDetails.totalAmount}\n\n`
      
      // 添加操作说明
      billText += '请选择操作：\n\n'
      billText += '【确认账单】：大差不差点确认，最终发薪数线下说了算，无任何法律责任\n'
      billText += '【驳回账单】：数量不对直接驳回，无需解释原因，线下核对后让工人重发即可\n\n'
      billText += '无需下载APP、无需注册登录，点确认仅帮工人完成记账对账，无任何后续绑定成本\n\n'
      billText += '💡 推荐：下载衣起赚APP，查看每日详情并进行筛选\n'
      billText += '下载链接：https://www.yiqizhuan.com/download\n'
      billText += '安装后登录即可查看完整账单记录，支持按日期、款号、工序等多维度筛选'
      
      // 模拟老板审核界面 - 只有确认和驳回两个按钮，添加免责提醒
      uni.showModal({
        title: '账单审核',
        content: billText,
        confirmText: '确认账单',
        cancelText: '驳回账单',
        success: (res) => {
          if (res.confirm) {
            // 老板确认
            this.confirmBill(billId)
          } else if (res.cancel) {
            // 老板驳回
            this.rejectBill(billId)
          }
        }
      })
    },
    // 确认账单
    confirmBill(billId) {
      // 显示确认通知
      uni.showModal({
        title: '账单已确认',
        content: '✅ 账单确认成功\n\n再次提醒：本次确认仅为工单事实知晓，最终薪资结算以您和工人线下核对为准，平台不介入任何纠纷\n\n【可选轻量引导，非强制】：入驻衣起赚APP，可免费使用班组批量对账、工人管理功能，一键核对全组工单总量，省一半对账时间\n\n已自动同步到您的个人技能档案',
        confirmText: '查看档案',
        cancelText: '确定',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 跳转到技能档案页面
            uni.navigateTo({
              url: './skill-profile'
            })
          }
        }
      })
      
      // 保存确认状态到通知
      const notifications = uni.getStorageSync('notifications') || []
      notifications.push({
        id: Date.now(),
        type: 'bill_confirmation',
        title: '账单确认通知',
        content: '老板已确认您的账单，线上确认仅确认工单真实性，最终发薪以线下统计为准',
        time: new Date().toISOString(),
        read: false
      })
      uni.setStorageSync('notifications', notifications)
    },
    // 驳回账单
    rejectBill(billId) {
      // 显示驳回通知
      uni.showModal({
        title: '账单已驳回',
        content: '✅ 账单已驳回\n\n请您线下和工人核对好数量后，让工人修改账单重新转发即可，无任何操作限制',
        confirmText: '确定',
        showCancel: false
      })
      
      // 保存驳回状态到通知
      const notifications = uni.getStorageSync('notifications') || []
      notifications.push({
        id: Date.now(),
        type: 'bill_rejection',
        title: '账单驳回通知',
        content: '老板已驳回您的账单，请与组长线下核对数量后重新提交',
        time: new Date().toISOString(),
        read: false
      })
      uni.setStorageSync('notifications', notifications)
    },
    
    // 发起对账相关方法
    closeReconciliationModal() {
      this.showReconciliationModal = false
      this.selectedStyle = ''
      this.selectedProcess = ''
      this.showStyleDropdown = false
      this.showProcessDropdown = false
    },
    
    getYearRange() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        years.push(i.toString())
      }
      return years
    },
    
    getMonthRange() {
      const months = []
      for (let i = 1; i <= 12; i++) {
        months.push(i.toString())
      }
      return months
    },
    
    updateDateRange() {
      const { year, month } = this.reconciliationData
      const startDate = `${year}-${month.toString().padStart(2, '0')}-05`
      const endDate = `${year}-${month.toString().padStart(2, '0')}-19`
      this.reconciliationData.startDate = startDate
      this.reconciliationData.endDate = endDate
    },
    
    toggleStyleDropdown() {
      this.showStyleDropdown = !this.showStyleDropdown
      this.showProcessDropdown = false
    },
    
    toggleProcessDropdown() {
      if (this.selectedStyle) {
        this.showProcessDropdown = !this.showProcessDropdown
        this.showStyleDropdown = false
      }
    },
    
    selectStyle(style) {
      this.selectedStyle = style
      this.selectedProcess = ''
      this.showStyleDropdown = false
    },
    
    selectProcess(process) {
      this.selectedProcess = process.processName
      this.showProcessDropdown = false
    },
    
    getProcessesByStyle(style) {
      return this.styleProcessMap[style] || []
    },
    
    addStyleProcess() {
      if (this.selectedStyle && this.selectedProcess) {
        // 检查是否已存在相同的款号和工序组合
        const exists = this.reconciliationData.selectedStyles.some(item => 
          item.style === this.selectedStyle && item.process === this.selectedProcess
        )
        
        if (!exists) {
          this.reconciliationData.selectedStyles.push({
            style: this.selectedStyle,
            process: this.selectedProcess
          })
        }
        
        // 重置选择
        this.selectedStyle = ''
        this.selectedProcess = ''
      }
    },
    
    removeStyleProcess(index) {
      this.reconciliationData.selectedStyles.splice(index, 1)
    },
    
    submitReconciliation() {
      if (!this.reconciliationData.startDate || !this.reconciliationData.endDate) {
        uni.showToast({
          title: '请选择对账日期范围',
          icon: 'none'
        })
        return
      }
      
      if (this.reconciliationData.selectedStyles.length === 0) {
        uni.showToast({
          title: '请至少选择一个款号和工序',
          icon: 'none'
        })
        return
      }
      
      // 模拟对账提交
      uni.showLoading({
        title: '正在发起对账...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '对账已发起',
          icon: 'success'
        })
        this.closeReconciliationModal()
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

/* 微信分享区 */
.share-section {
  background: #f5fafe;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.share-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10rpx;
  display: block;
}

.share-desc {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
  line-height: 1.4;
}

.share-btn {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin: 0 auto;
  min-width: 200rpx;
}

.share-icon {
  font-size: 32rpx;
}

.share-text {
  font-size: 26rpx;
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

/* 发起对账弹窗样式 */
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
  z-index: 9999;
}

.modal-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  width: 85%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 30rpx;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.month-picker {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.year-picker, .month-picker {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
}

.picker-text {
  font-size: 26rpx;
  color: #333;
}

.picker-separator {
  font-size: 26rpx;
  color: #666;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.date-input {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
}

.date-separator {
  font-size: 24rpx;
  color: #666;
}

.date-hint {
  font-size: 20rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.dropdown-container {
  position: relative;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
  border: 1rpx solid #e8e8e8;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1rpx solid #e8e8e8;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  max-height: 300rpx;
  overflow-y: auto;
  z-index: 9999;
  margin-top: 10rpx;
}

.dropdown-item {
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background: #f8f9fa;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background: #1677ff;
  color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-top: 10rpx;
}

.add-icon {
  font-size: 28rpx;
  font-weight: bold;
}

.add-text {
  font-size: 24rpx;
  font-weight: 600;
}

.selected-list {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #e8e8e8;
}

.selected-item:last-child {
  border-bottom: none;
}

.selected-style {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}

.selected-process {
  font-size: 22rpx;
  color: #666;
  flex: 1;
  margin-left: 20rpx;
}

.remove-icon {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: bold;
  padding: 10rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
}

.modal-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.modal-btn.primary {
  background: #1677ff;
  color: #fff;
}
</style>