<template>
  <view class="ledger-container">
    <!-- 顶部导航栏（固定） -->
    <view class="top-nav">
      <text class="nav-back" @click="navigateBack">←</text>
      <text class="nav-title">账本</text>
      <text class="add-btn" @click="showAddDialog">+记一笔</text>
    </view>
    
    <!-- 顶部固定3个tab -->
    <view class="main-tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-item', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        {{ tab.name }}
      </view>
    </view>
    
    <!-- 收支明细 Tab -->
    <view v-if="currentTab === 'expense'" class="tab-content">
      <!-- 固定支出管理 -->
      <view class="fixed-expenses-section">
        <view class="section-header">
          <text class="section-title">固定支出管理</text>
          <text class="section-action" @click="goToFixedExpenses">管理</text>
        </view>
        <view class="fixed-expenses-list">
          <view v-if="fixedExpenses.length === 0" class="empty-state">
            <text class="empty-icon">📅</text>
            <text class="empty-text">暂无固定支出</text>
            <text class="empty-desc">点击管理按钮添加固定支出</text>
          </view>
          <view v-else class="fixed-expense-item" v-for="expense in fixedExpenses" :key="expense.id">
            <text class="expense-name">{{ expense.name }}</text>
            <text class="expense-amount">¥{{ expense.amount.toFixed(2) }}</text>
            <text class="expense-date">每月{{ expense.remindDay }}日</text>
          </view>
        </view>
      </view>
      
      <!-- 收支明细 -->
      <view class="expense-detail-section">
        <view class="section-header">
          <text class="section-title">收支明细</text>
          <view class="filter-buttons">
            <button class="filter-btn" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">全部</button>
            <button class="filter-btn" :class="{ active: filterType === 'income' }" @click="filterType = 'income'">收入</button>
            <button class="filter-btn" :class="{ active: filterType === 'expense' }" @click="filterType = 'expense'">支出</button>
          </view>
        </view>
        
        <view class="date-range-selector">
          <button class="range-button" @click="showDateRangePicker">选择日期范围</button>
          <text class="selected-range">{{dateRangeText}}</text>
        </view>
        
        <view class="records-list">
          <view v-if="filteredRecords.length === 0" class="empty-state">
            <text class="empty-icon">📝</text>
            <text class="empty-text">暂无记录</text>
            <text class="empty-desc">点击右上角+记一笔添加记录</text>
          </view>
          <view v-else class="record-item" v-for="(record, index) in filteredRecords" :key="index">
            <text class="record-description">{{record.description}}</text>
            <text :class="['record-amount', { income: record.type === 'income' }]">
              {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount }}
            </text>
            <text class="record-date">{{formatDate(new Date(record.date))}}</text>
            <view class="record-actions">
              <button class="edit-button" @click="editRecord(record)">编辑</button>
              <button class="delete-button" @click="deleteRecord(record)">删除</button>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 图表分析 Tab -->
    <view v-if="currentTab === 'chart'" class="tab-content">
      <view class="chart-section">
        <text class="section-title">月度收支趋势</text>
        <view class="chart-container">
          <canvas canvas-id="trendChart" class="chart-canvas"></canvas>
        </view>
      </view>
      
      <view class="chart-section">
        <text class="section-title">支出占比</text>
        <view class="chart-container">
          <canvas canvas-id="pieChart" class="chart-canvas"></canvas>
        </view>
      </view>
      
      <view class="chart-section">
        <text class="section-title">收入构成</text>
        <view class="chart-container">
          <canvas canvas-id="incomeChart" class="chart-canvas"></canvas>
        </view>
      </view>
    </view>
    
    <!-- 对账凭证 Tab -->
    <view v-if="currentTab === 'voucher'" class="tab-content">
      <view class="voucher-section">
        <text class="section-title">月度对账单</text>
        <view class="voucher-card">
          <text class="voucher-period">{{ currentMonth }}月</text>
          <text class="voucher-income">总收入：¥{{ monthlyIncome + 2300 }}</text>
          <text class="voucher-expense">总支出：¥2300</text>
          <text class="voucher-net">纯收入：¥{{ monthlyIncome }}</text>
          <button class="voucher-button" @click="generateVoucher">生成凭证</button>
          <button class="voucher-button share" @click="shareVoucher">分享给老板</button>
        </view>
      </view>
      

    </view>
    
    <!-- 确认状态对话框 -->
    <view v-if="showConfirmationDialog" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">确认状态</text>
        <text class="dialog-content-text">{{confirmationMessage}}</text>
        <view class="dialog-buttons">
          <button class="dialog-button" @click="closeConfirmationDialog">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 编辑记录对话框 -->
    <view v-if="showEditDialog" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">编辑记录</text>
        <view class="dialog-form">
          <!-- 未关联邀请码的编辑选项 -->
          <template v-if="!isBound()">
            <view class="form-group">
              <text class="form-label">款号</text>
              <view class="input-with-dropdown">
                <input type="text" v-model="editForm.styleNumber" class="form-input dropdown-input" placeholder="请输入款号" />
                <view class="dropdown-arrow" @click="toggleStyleDropdown('edit')">▼</view>
                <!-- 历史款号下拉菜单 -->
                <view v-if="showDropdown === 'edit-style' && styleHistory.length > 0" class="dropdown-menu">
                  <text 
                    v-for="(style, index) in styleHistory" 
                    :key="index"
                    class="dropdown-item"
                    @click="selectStyleForEdit(style)"
                  >
                    {{style}}
                  </text>
                </view>
              </view>
            </view>
            <view class="form-group">
              <text class="form-label">工序</text>
              <input type="text" v-model="editForm.processName" class="form-input" placeholder="请输入工序" />
            </view>
            <view class="form-group">
              <text class="form-label">单价</text>
              <input type="number" v-model="editForm.unitPrice" class="form-input" placeholder="请输入单价" />
            </view>
            <view class="form-group">
              <text class="form-label">数量</text>
              <input type="number" v-model="editForm.quantity" class="form-input" placeholder="请输入数量" />
            </view>
          </template>
          
          <!-- 已关联邀请码的编辑选项 -->
          <template v-else>
            <view class="form-group">
              <text class="form-label">款号</text>
              <view class="input-with-dropdown">
                <input type="text" v-model="editForm.styleNumber" class="form-input dropdown-input" placeholder="请输入款号" />
                <view class="dropdown-arrow" @click="toggleStyleDropdown('edit')">▼</view>
                <!-- 历史款号下拉菜单 -->
                <view v-if="showDropdown === 'edit-style' && styleHistory.length > 0" class="dropdown-menu">
                  <text 
                    v-for="(style, index) in styleHistory" 
                    :key="index"
                    class="dropdown-item"
                    @click="selectStyleForEdit(style)"
                  >
                    {{style}}
                  </text>
                </view>
              </view>
            </view>
            <view class="form-group">
              <text class="form-label">工序</text>
              <view class="input-with-dropdown">
                <input type="text" v-model="editForm.processName" class="form-input dropdown-input" placeholder="请输入工序" />
                <view class="dropdown-arrow" @click="toggleProcessDropdown('edit')">▼</view>
                <!-- 历史工序下拉菜单 -->
                <view v-if="showDropdown === 'edit-process' && editForm.styleNumber" class="dropdown-menu">
                  <text 
                    v-for="(process, index) in getProcessHistory(editForm.styleNumber)" 
                    :key="index"
                    class="dropdown-item"
                    @click="selectProcessForEdit(process)"
                  >
                    {{process.processName}} - {{process.unitPrice}}元
                  </text>
                </view>
              </view>
            </view>
            <view class="form-group">
              <text class="form-label">单价</text>
              <input type="number" v-model="editForm.unitPrice" class="form-input" placeholder="请输入单价" disabled />
              <text class="price-note">价格由厂长设定，无法修改</text>
            </view>
            <view class="form-group">
              <text class="form-label">数量</text>
              <input type="number" v-model="editForm.quantity" class="form-input" placeholder="请输入数量" />
            </view>
          </template>
          <view class="form-group">
            <text class="form-label">备注</text>
            <input type="text" v-model="editForm.remark" class="form-input" placeholder="请输入备注" />
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-button cancel-button" @click="closeEditDialog">取消</button>
          <button class="dialog-button confirm-button" @click="saveEdit">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 新增记录对话框 -->
    <view v-if="showAddDialog" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">新增记录</text>
        <view class="dialog-form">
          <!-- 计件模式 -->
          <template v-if="currentMode === 'piece'">
            <!-- 未关联邀请码的编辑选项 -->
            <template v-if="!isBound()">
              <view class="form-group">
                <text class="form-label">款号</text>
                <view class="input-with-dropdown">
                  <input type="text" v-model="addForm.styleNumber" class="form-input dropdown-input" placeholder="请输入款号" />
                  <view class="dropdown-arrow" @click="toggleStyleDropdown('add')">▼</view>
                  <!-- 历史款号下拉菜单 -->
                  <view v-if="showDropdown === 'add-style' && styleHistory.length > 0" class="dropdown-menu">
                    <text 
                      v-for="(style, index) in styleHistory" 
                      :key="index"
                      class="dropdown-item"
                      @click="addForm.styleNumber = style"
                    >
                      {{style}}
                    </text>
                  </view>
                </view>
              </view>
              <view class="form-group">
                <text class="form-label">工序</text>
                <view class="input-with-dropdown">
                  <input type="text" v-model="addForm.processName" class="form-input dropdown-input" placeholder="请输入工序" />
                  <view class="dropdown-arrow" @click="toggleProcessDropdown('add')">▼</view>
                  <!-- 历史工序下拉菜单 -->
                  <view v-if="showDropdown === 'add-process' && addForm.styleNumber" class="dropdown-menu">
                    <text 
                      v-for="(process, index) in getProcessHistory(addForm.styleNumber)" 
                      :key="index"
                      class="dropdown-item"
                      @click="selectProcessForAdd(process)"
                    >
                      {{process.processName}} - {{process.unitPrice}}元
                    </text>
                  </view>
                </view>
              </view>
              <view class="form-group">
                <text class="form-label">单价</text>
                <input type="number" v-model="addForm.unitPrice" class="form-input" placeholder="请输入单价" />
              </view>
              <view class="form-group">
                <text class="form-label">数量</text>
                <input type="number" v-model="addForm.quantity" class="form-input" placeholder="请输入数量" />
              </view>
            </template>
            
            <!-- 已关联邀请码的编辑选项 -->
            <template v-else>
              <view class="form-group">
                <text class="form-label">款号</text>
                <view class="input-with-dropdown">
                  <input type="text" v-model="addForm.styleNumber" class="form-input dropdown-input" placeholder="请输入款号" />
                  <view class="dropdown-arrow" @click="toggleStyleDropdown('add')">▼</view>
                  <!-- 历史款号下拉菜单 -->
                  <view v-if="showDropdown === 'add-style' && styleHistory.length > 0" class="dropdown-menu">
                    <text 
                      v-for="(style, index) in styleHistory" 
                      :key="index"
                      class="dropdown-item"
                      @click="addForm.styleNumber = style"
                    >
                      {{style}}
                    </text>
                  </view>
                </view>
              </view>
              <view class="form-group">
                <text class="form-label">工序</text>
                <view class="input-with-dropdown">
                  <input type="text" v-model="addForm.processName" class="form-input dropdown-input" placeholder="请输入工序" />
                  <view class="dropdown-arrow" @click="toggleProcessDropdown('add')">▼</view>
                  <!-- 历史工序下拉菜单 -->
                  <view v-if="showDropdown === 'add-process' && addForm.styleNumber" class="dropdown-menu">
                    <text 
                      v-for="(process, index) in getProcessHistory(addForm.styleNumber)" 
                      :key="index"
                      class="dropdown-item"
                      @click="selectProcessForAdd(process)"
                    >
                      {{process.processName}} - {{process.unitPrice}}元
                    </text>
                  </view>
                </view>
              </view>
              <view class="form-group">
                <text class="form-label">单价</text>
                <input type="number" v-model="addForm.unitPrice" class="form-input" placeholder="请输入单价" disabled />
                <text class="price-note">价格由厂长设定，无法修改</text>
              </view>
              <view class="form-group">
                <text class="form-label">数量</text>
                <input type="number" v-model="addForm.quantity" class="form-input" placeholder="请输入数量" />
              </view>
            </template>
          </template>
          
          <!-- 计时模式 -->
          <template v-else>
            <view class="form-group">
              <text class="form-label">工作内容</text>
              <input type="text" v-model="addForm.description" class="form-input" placeholder="请输入工作内容" />
            </view>
            <view class="form-group">
              <text class="form-label">工作小时数</text>
              <input type="number" v-model="addForm.hours" class="form-input" placeholder="请输入工作小时数" />
            </view>
            <view class="form-group">
              <text class="form-label">时薪</text>
              <input type="number" v-model="addForm.hourlyWage" class="form-input" placeholder="请输入时薪" />
            </view>
          </template>
          
          <view class="form-group">
            <text class="form-label">备注</text>
            <input type="text" v-model="addForm.remark" class="form-input" placeholder="请输入备注" />
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-button cancel-button" @click="closeAddDialog">取消</button>
          <button class="dialog-button confirm-button" @click="saveAdd">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 删除记录对话框 -->
    <view v-if="showDeleteDialog" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">删除记录</text>
        <text class="dialog-content-text">确定要删除这条记录吗？</text>
        <view class="dialog-buttons">
          <button class="dialog-button cancel-button" @click="closeDeleteDialog">取消</button>
          <button class="dialog-button delete-button" @click="confirmDelete">删除</button>
        </view>
      </view>
    </view>
    
    <!-- 徽章详情弹窗 -->
    <view class="badge-modal" v-if="showModal" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-icon">{{ currentBadge.icon }}</text>
          <text class="modal-title">{{ currentBadge.name }}</text>
        </view>
        <text class="modal-desc">{{ currentBadge.desc }}</text>
        <text class="modal-condition" v-if="!currentBadge.unlocked">解锁条件：{{ currentBadge.condition }}</text>
        <button class="modal-close" @tap="closeModal">知道了</button>
      </view>
    </view>
    
    <!-- 连续记工徽章详情弹窗 -->
    <view class="badge-modal" v-if="showContinuousModal" @tap="closeContinuousModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-icon">{{ currentContinuousBadge.icon }}</text>
          <text class="modal-title">{{ currentContinuousBadge.name }}</text>
        </view>
        <text class="modal-desc">{{ currentContinuousBadge.desc }}</text>
        <text class="modal-privilege">求职特权：{{ currentContinuousBadge.privilege }}</text>
        <text class="modal-condition" v-if="!currentContinuousBadge.unlocked">解锁条件：连续记工{{ currentContinuousBadge.days }}天</text>
        <button class="modal-close" @tap="closeContinuousModal">知道了</button>
      </view>
    </view>
  </view>
</template>

<script>
import actionTooltip from '../../components/action-tooltip.vue'
import { recordUserActivity, ACTIVITY_TYPES } from '../../utils/user-activity.js'

export default {
  components: {
    actionTooltip
  },
  data() {
      return {
        // 顶部Tab
        tabs: [
          { key: 'expense', name: '收支明细' },
          { key: 'chart', name: '图表分析' },
          { key: 'voucher', name: '对账凭证' }
        ],
        currentTab: 'expense',
        
        // 数据状态
        ledgerRecords: [],
        fixedExpenses: [],
        filterType: 'all',
        dateRange: {
          start: null,
          end: null
        },
        currentDate: new Date(),
        
        // 对话框状态
        showConfirmationDialog: false,
        confirmationMessage: '',
        showEditDialog: false,
        editingRecord: null,
        editForm: {
          description: '',
          amount: '',
          remark: '',
          type: 'income',
          styleNumber: '',
          processName: '',
          quantity: '',
          unitPrice: '',
          hours: '',
          hourlyWage: ''
        },
        showAddDialog: false,
        addForm: {
          description: '',
          amount: '',
          remark: '',
          type: 'income',
          styleNumber: '',
          processName: '',
          quantity: '',
          unitPrice: '',
          hours: '',
          hourlyWage: ''
        },
        showDeleteDialog: false,
        recordToDelete: null,
        showModal: false,
        showContinuousModal: false,
        
        // 其他状态
        boundCompany: null,
        styleProcessMap: {},
        styleHistory: [],
        showDropdown: null,
        currentLedgerId: 'personal',
        currentMode: 'piece',
        expandedStyles: [],
        salaryForm: {
          amount: '',
          remark: ''
        },
        savedSalary: null,
        tooltipText: '',
        tooltipPosition: 'top',
        showActionTooltip: false,
        currentBadge: null,
        currentContinuousBadge: null,
        
        // 收入数据
        currentMonth: new Date().getMonth() + 1,
        monthlyIncome: 10800, // 本月用户纯收入（记工总收入-总支出）
        exceedPercent: 85, // 超越同工种全国用户比例
        workType: '平车', // 用户绑定的工种（如平车/拷边）
        cityRank: 15, // 同城同工种排名百分比
        dailyMax: 800, // 本月单日最高收入
        showBadge: true, // 是否显示专属徽章
        badgeName: '苏州平车大神', // 徽章名称，如苏州平车大神
        
        // 徽章数据
        badgeList: [
          { id: 1, name: '新手徽章', icon: '🎯', desc: '完成首次记工', condition: '完成首次记工', unlocked: false },
          { id: 2, name: '坚持徽章', icon: '🔥', desc: '连续记工7天', condition: '连续记工7天', unlocked: false },
          { id: 3, name: '达人徽章', icon: '⭐', desc: '连续记工30天', condition: '连续记工30天', unlocked: false }
        ],
        continuousBadgeList: [
          { id: 1, name: '初级记工', icon: '🌱', desc: '连续记工7天', days: 7, privilege: '优先推荐工作', unlocked: false },
          { id: 2, name: '中级记工', icon: '🌿', desc: '连续记工30天', days: 30, privilege: '专属招聘通道', unlocked: false },
          { id: 3, name: '高级记工', icon: '🌳', desc: '连续记工90天', days: 90, privilege: '工厂直聘', unlocked: false }
        ],
        continuousDays: 0,
        userCheckinRecord: []
      }
    },
  computed: {
    currentMonthText() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      return `${year}年${month}月`
    },

    dateRangeText() {
      if (!this.dateRange.start || !this.dateRange.end) {
        return '全部时间'
      }
      return `${this.formatDate(this.dateRange.start)} 至 ${this.formatDate(this.dateRange.end)}`
    },
    filteredRecords() {
      let records = this.ledgerRecords
      
      // 按日期范围过滤
      if (this.dateRange.start && this.dateRange.end) {
        records = records.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= this.dateRange.start && recordDate <= this.dateRange.end
        })
      }
      
      // 按类型过滤
      if (this.filterType === 'income') {
        records = records.filter(record => record.type === 'income')
      } else if (this.filterType === 'expense') {
        records = records.filter(record => record.type === 'expense')
      }
      
      return records
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        
        const records = this.getRecordsByDate(date)
        const hasRecord = records.length > 0
        const totalAmount = records.reduce((sum, record) => sum + parseFloat(record.amount), 0)
        
        days.push({
          date: new Date(date),
          day: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          hasRecord: hasRecord,
          amount: hasRecord ? totalAmount.toFixed(2) : null
        })
      }
      return days
    },
    totalAmount() {
      return this.filteredRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0)
    },
    uniqueStyles() {
      const styles = new Set()
      this.filteredRecords.forEach(record => {
        if (record.description) {
          const styleMatch = record.description.match(/款号(\w+)/)
          if (styleMatch) {
            styles.add(styleMatch[1])
          }
        }
      })
      return Array.from(styles)
    },
    uniqueProcesses() {
      const processes = new Set()
      this.filteredRecords.forEach(record => {
        if (record.description) {
          const processMatch = record.description.match(/-(.*)/)
          if (processMatch) {
            processes.add(processMatch[1].trim())
          }
        }
      })
      return Array.from(processes)
    },
    styleSummary() {
      const styleMap = new Map()
      
      this.filteredRecords.forEach(record => {
        if (record.description && record.type === 'piece') {
          const styleMatch = record.description.match(/款号(\w+)/)
          const processMatch = record.description.match(/-(.*)/)
          if (styleMatch && processMatch) {
            const style = styleMatch[1]
            const process = processMatch[1].trim()
            const key = `${style}-${process}`
            
            // 假设每条记录的金额是单价乘以数量，我们可以从金额和数量反推单价
            // 这里简化处理，使用金额作为总金额
            const amount = parseFloat(record.amount)
            
            if (!styleMap.has(key)) {
              styleMap.set(key, {
                style: style,
                process: process,
                totalAmount: 0,
                totalQuantity: 0
              })
            }
            const styleData = styleMap.get(key)
            styleData.totalAmount += amount
            styleData.totalQuantity += 1 // 简化处理，假设每条记录对应一个小件
            styleMap.set(key, styleData)
          }
        }
      })
      
      return Array.from(styleMap.values())
    },
    processSummary() {
      const processMap = new Map()
      
      this.filteredRecords.forEach(record => {
        if (record.description && record.type === 'piece') {
          const processMatch = record.description.match(/-\s*(.*)/)
          if (processMatch) {
            const process = processMatch[1].trim()
            if (!processMap.has(process)) {
              processMap.set(process, {
                process: process,
                totalAmount: 0,
                totalQuantity: 0
              })
            }
            const processData = processMap.get(process)
            processData.totalAmount += parseFloat(record.amount)
            processData.totalQuantity += 1 // 简化处理，假设每条记录对应一个小件
            processMap.set(process, processData)
          }
        }
      })
      
      return Array.from(processMap.values())
    },
    // 按款号分组的工序汇总
    styleProcessSummary() {
      const styleMap = new Map()
      
      this.filteredRecords.forEach(record => {
        if (record.type === 'piece' && record.status === 'confirmed') { // 只统计已确认的记录
          const style = record.styleNumber || (record.description ? record.description.match(/款号(\w+)/)?.[1] : '')
          const process = record.processName || (record.description ? record.description.match(/-(.*)/)?.[1].trim() : '')
          
          if (style && process) {
            if (!styleMap.has(style)) {
              styleMap.set(style, {
                style: style,
                totalAmount: 0,
                totalQuantity: 0,
                processes: []
              })
            }
            
            const styleData = styleMap.get(style)
            
            // 查找该款号下的工序
            const processIndex = styleData.processes.findIndex(p => p.process === process)
            
            if (processIndex === -1) {
              // 新增工序
              styleData.processes.push({
                process: process,
                quantity: parseInt(record.quantity) || 1,
                unitPrice: parseFloat(record.unitPrice) || parseFloat(record.amount),
                amount: parseFloat(record.amount)
              })
            } else {
              // 更新现有工序
              styleData.processes[processIndex].quantity += parseInt(record.quantity) || 1
              styleData.processes[processIndex].amount += parseFloat(record.amount)
            }
            
            // 更新款号总数据
            styleData.totalAmount += parseFloat(record.amount)
            styleData.totalQuantity += parseInt(record.quantity) || 1
            
            styleMap.set(style, styleData)
          }
        }
      })
      
      return Array.from(styleMap.values())
    },
    
    // 已解锁徽章数量
    unlockedCount() {
      return this.badgeList.filter(item => item.unlocked).length
    },
    
    // 总徽章数量
    totalCount() {
      return this.badgeList.length
    },
    
    // 连续记工进度条计算
    progressWidth() {
      const currentDays = this.continuousDays
      const nextBadge = this.continuousBadgeList.find(item => item.days > currentDays)
      if (!nextBadge) return 100
      const prevBadge = this.continuousBadgeList.find(item => item.days <= currentDays)
      const startDays = prevBadge ? prevBadge.days : 0
      return ((currentDays - startDays) / (nextBadge.days - startDays)) * 100
    },
    
    // 下一个解锁的稳定称号徽章
    nextBadge() {
      const currentDays = this.continuousDays
      const nextBadge = this.continuousBadgeList.find(item => item.days > currentDays)
      if (!nextBadge) return { name: '全部称号已解锁', needDays: 0 }
      return {
        name: nextBadge.name,
        needDays: nextBadge.days - currentDays
      }
    },
    
    // 连续记工天数计算（自动跳过周日）
    continuousDaysCalc() {
      const checkinList = this.userCheckinRecord // 用户记工日期列表，格式：['2026-03-01', '2026-03-02']
      let continuousDays = 0
      const today = new Date()
      
      // 从今天往前倒推，自动跳过周日
      for (let i = 0; i < 1000; i++) {
        const currentDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const weekDay = currentDate.getDay() // 0=周日，1-6=周一至周六
        const dateStr = currentDate.toISOString().split('T')[0]
        
        // 周日：不中断连续天数，直接跳过
        if (weekDay === 0) {
          continue
        }
        
        // 工作日：判断是否有记工记录
        if (checkinList.includes(dateStr)) {
          continuousDays++
        } else {
          break // 工作日无记工，中断连续天数
        }
      }
      
      return continuousDays
    }
  },
  onLoad(options) {
    this.loadLedgerRecords()
    this.loadFixedExpenses()
    this.loadUserInfo()
    this.getUserIncomeData()
    this.generateExampleData()
    
    // 初始化滑动返回
    this.initSwipeBack()
  },
  watch: {
    currentTab(newTab) {
      if (newTab === 'chart') {
        // 延迟初始化图表，确保DOM已渲染
        setTimeout(() => {
          this.initCharts()
        }, 100)
      }
    }
  },
  methods: {
    // 加载账本记录
    loadLedgerRecords() {
      // 从 workRecords 中加载记录，与首页记账功能保持一致
      const allRecords = uni.getStorageSync('workRecords') || []
      
      // 转换记录格式以匹配账本页面的需求
      this.ledgerRecords = allRecords.map(record => {
        let description = ''
        let type = 'income'
        
        if (record.type === 'expense') {
          type = 'expense'
          description = record.category || '其他支出'
        } else if (record.type === 'piecework') {
          if (record.styleNumber && record.processName) {
            description = `款号${record.styleNumber} - ${record.processName}`
          } else if (record.product) {
            description = record.product
          } else {
            description = '计件记录'
          }
        } else if (record.type === 'hourly') {
          description = '计时记录'
        }
        
        return {
          id: record.id,
          ledgerId: 'personal',
          date: record.date,
          description: description,
          amount: record.amount.toString(),
          type: type,
          status: 'confirmed', // 默认标记为已确认
          styleNumber: record.styleNumber || '',
          processName: record.processName || '',
          quantity: record.quantity?.toString() || '1',
          unitPrice: record.unitPrice?.toString() || record.price?.toString() || '0',
          remark: record.note || '',
          hours: record.hours?.toString() || '',
          hourlyWage: record.wage?.toString() || ''
        }
      })
    },
    
    // 加载固定支出
    loadFixedExpenses() {
      const fixedExpenses = uni.getStorageSync('fixedExpenses') || []
      this.fixedExpenses = fixedExpenses
    },
    
    // 跳转到固定支出管理
    goToFixedExpenses() {
      uni.navigateTo({ url: '/pages/worker/fixed-expenses' })
    },
    
    // 生成凭证
    generateVoucher() {
      uni.showToast({
        title: '凭证生成成功',
        icon: 'success'
      })
    },
    
    // 分享凭证
    shareVoucher() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    
    // 初始化图表
    initCharts() {
      // 图表初始化逻辑
      console.log('初始化图表')
    },
    
    // 检查日期是否为今天
    isToday(date) {
      const today = new Date()
      return date.getFullYear() === today.getFullYear() && 
             date.getMonth() === today.getMonth() && 
             date.getDate() === today.getDate()
    },
    
    // 检查日期是否为连续记工天数
    isConsecutiveDay(date, days) {
      // 简化处理，实际应该根据连续记工数据计算
      return this.continuousDays >= days
    },
    
    // 检查是否为全勤月
    isFullAttendanceMonth() {
      // 简化处理，实际应该根据当月记工数据计算
      return false
    },
    loadUserInfo() {
      // 加载用户绑定状态
      this.boundCompany = uni.getStorageSync('boundCompany') || null
      // 加载款号工序映射
      this.styleProcessMap = uni.getStorageSync('styleProcessMap') || {}
      // 加载历史款号
      this.styleHistory = uni.getStorageSync('styleHistory') || []

    },
    isBound() {
      return !!this.boundCompany
    },
    generateExampleData() {
      if (this.ledgerRecords.length === 0) {
        const today = new Date()
        const exampleRecords = [
          // 计件记录 - 已确认
          {
            id: Date.now() + 1,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15).toISOString(),
            description: '款号A001 - 平车',
            amount: '250.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'A001',
            processName: '平车',
            quantity: '50',
            unitPrice: '5.00',
            remark: '常规订单'
          },
          {
            id: Date.now() + 2,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14).toISOString(),
            description: '款号A001 - 拷边',
            amount: '180.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'A001',
            processName: '拷边',
            quantity: '60',
            unitPrice: '3.00',
            remark: '加急订单'
          },
          {
            id: Date.now() + 3,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13).toISOString(),
            description: '款号B002 - 开口袋',
            amount: '320.00',
            type: 'piece',
            status: 'rejected',
            rejectionReason: '工序数量与实际不符',
            styleNumber: 'B002',
            processName: '开口袋',
            quantity: '40',
            unitPrice: '8.00',
            remark: '新款试做'
          },
          // 计时记录
          {
            id: Date.now() + 4,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 12).toISOString(),
            description: '计时 - 加班',
            amount: '200.00',
            type: 'time',
            status: 'confirmed',
            remark: '周末加班',
            hours: '8',
            hourlyWage: '25'
          },
          {
            id: Date.now() + 5,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 11).toISOString(),
            description: '计时 - 正常工时',
            amount: '300.00',
            type: 'time',
            status: 'confirmed',
            remark: '周一至周五',
            hours: '12',
            hourlyWage: '25'
          },
          // 计件记录 - 待确认
          {
            id: Date.now() + 6,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toISOString(),
            description: '款号C003 - 装拉链',
            amount: '280.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'C003',
            processName: '装拉链',
            quantity: '35',
            unitPrice: '8.00',
            remark: '批量生产'
          },
          {
            id: Date.now() + 7,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 9).toISOString(),
            description: '款号D004 - 拉腰',
            amount: '150.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'D004',
            processName: '拉腰',
            quantity: '50',
            unitPrice: '3.00',
            remark: '常规款式'
          },
          // 计件记录 - 已确认
          {
            id: Date.now() + 8,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8).toISOString(),
            description: '款号E005 - 装领',
            amount: '220.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'E005',
            processName: '装领',
            quantity: '22',
            unitPrice: '10.00',
            remark: '复杂工序'
          },
          {
            id: Date.now() + 9,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).toISOString(),
            description: '款号F006 - 双针卷边',
            amount: '180.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'F006',
            processName: '双针卷边',
            quantity: '45',
            unitPrice: '4.00',
            remark: '标准工序'
          },
          // 计件记录 - 已驳回
          {
            id: Date.now() + 10,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString(),
            description: '款号G007 - 四针六线',
            amount: '350.00',
            type: 'piece',
            status: 'rejected',
            rejectionReason: '单价与约定不符',
            styleNumber: 'G007',
            processName: '四针六线',
            quantity: '25',
            unitPrice: '14.00',
            remark: '特殊工艺'
          },
          // 近期记录 - 待确认
          {
            id: Date.now() + 11,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString(),
            description: '款号H008 - 钉扣',
            amount: '120.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'H008',
            processName: '钉扣',
            quantity: '80',
            unitPrice: '1.50',
            remark: '小批量订单'
          },
          {
            id: Date.now() + 12,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4).toISOString(),
            description: '款号I009 - 整烫',
            amount: '200.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'I009',
            processName: '整烫',
            quantity: '40',
            unitPrice: '5.00',
            remark: '成品整理'
          },
          {
            id: Date.now() + 13,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString(),
            description: '计时 - 夜班',
            amount: '350.00',
            type: 'time',
            status: 'pending',
            remark: '夜班补贴',
            hours: '10',
            hourlyWage: '35'
          },
          {
            id: Date.now() + 14,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
            description: '款号J010 - 包装',
            amount: '160.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'J010',
            processName: '包装',
            quantity: '80',
            unitPrice: '2.00',
            remark: '最终工序'
          },
          {
            id: Date.now() + 15,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(),
            description: '款号K011 - 质检',
            amount: '240.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'K011',
            processName: '质检',
            quantity: '60',
            unitPrice: '4.00',
            remark: '质量检查'
          },
          {
            id: Date.now() + 16,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(),
            description: '计时 - 加班',
            amount: '250.00',
            type: 'time',
            status: 'pending',
            remark: '月底赶工',
            hours: '10',
            hourlyWage: '25'
          },
          // 新增计件记录 - 已确认
          {
            id: Date.now() + 17,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20).toISOString(),
            description: '款号L012 - 打枣',
            amount: '180.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'L012',
            processName: '打枣',
            quantity: '90',
            unitPrice: '2.00',
            remark: '牛仔裤工序'
          },
          {
            id: Date.now() + 18,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 19).toISOString(),
            description: '款号M013 - 装袖',
            amount: '300.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'M013',
            processName: '装袖',
            quantity: '30',
            unitPrice: '10.00',
            remark: '外套工序'
          },
          // 新增计时记录 - 已确认
          {
            id: Date.now() + 19,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 18).toISOString(),
            description: '计时 - 培训',
            amount: '200.00',
            type: 'time',
            status: 'confirmed',
            remark: '新设备培训',
            hours: '8',
            hourlyWage: '25'
          },
          {
            id: Date.now() + 20,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 17).toISOString(),
            description: '计时 - 设备维护',
            amount: '150.00',
            type: 'time',
            status: 'confirmed',
            remark: '缝纫机维护',
            hours: '6',
            hourlyWage: '25'
          },
          // 新增计件记录 - 待确认
          {
            id: Date.now() + 21,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString(),
            description: '款号N014 - 锁眼',
            amount: '240.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'N014',
            processName: '锁眼',
            quantity: '60',
            unitPrice: '4.00',
            remark: '衬衫工序'
          },
          {
            id: Date.now() + 22,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4).toISOString(),
            description: '款号O015 - 钉扣',
            amount: '180.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'O015',
            processName: '钉扣',
            quantity: '120',
            unitPrice: '1.50',
            remark: '批量生产'
          },
          // 新增计时记录 - 待确认
          {
            id: Date.now() + 23,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString(),
            description: '计时 - 仓库整理',
            amount: '225.00',
            type: 'time',
            status: 'pending',
            remark: '季度盘点',
            hours: '9',
            hourlyWage: '25'
          },
          {
            id: Date.now() + 24,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
            description: '计时 - 物料准备',
            amount: '175.00',
            type: 'time',
            status: 'pending',
            remark: '新订单物料准备',
            hours: '7',
            hourlyWage: '25'
          },
          // 新增计件记录 - 已确认
          {
            id: Date.now() + 25,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 25).toISOString(),
            description: '款号P016 - 装腰',
            amount: '240.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'P016',
            processName: '装腰',
            quantity: '40',
            unitPrice: '6.00',
            remark: '裤子工序'
          },
          {
            id: Date.now() + 26,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 24).toISOString(),
            description: '款号Q017 - 车缝',
            amount: '300.00',
            type: 'piece',
            status: 'confirmed',
            styleNumber: 'Q017',
            processName: '车缝',
            quantity: '60',
            unitPrice: '5.00',
            remark: '批量生产'
          },
          // 新增计时记录 - 已确认
          {
            id: Date.now() + 27,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 23).toISOString(),
            description: '计时 - 样品制作',
            amount: '280.00',
            type: 'time',
            status: 'confirmed',
            remark: '新品研发',
            hours: '8',
            hourlyWage: '35'
          },
          {
            id: Date.now() + 28,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 22).toISOString(),
            description: '计时 - 质量检查',
            amount: '200.00',
            type: 'time',
            status: 'confirmed',
            remark: '成品检验',
            hours: '8',
            hourlyWage: '25'
          },
          // 新增计件记录 - 待确认
          {
            id: Date.now() + 29,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(),
            description: '款号R018 - 绣花',
            amount: '360.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'R018',
            processName: '绣花',
            quantity: '30',
            unitPrice: '12.00',
            remark: '装饰工艺'
          },
          {
            id: Date.now() + 30,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(),
            description: '款号S019 - 贴标',
            amount: '120.00',
            type: 'piece',
            status: 'pending',
            styleNumber: 'S019',
            processName: '贴标',
            quantity: '120',
            unitPrice: '1.00',
            remark: '品牌标识'
          },
          // 新增计时记录 - 待确认
          {
            id: Date.now() + 31,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(),
            description: '计时 - 加班赶工',
            amount: '300.00',
            type: 'time',
            status: 'pending',
            remark: '订单加急',
            hours: '12',
            hourlyWage: '25'
          },
          {
            id: Date.now() + 32,
            ledgerId: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(),
            description: '计时 - 设备调试',
            amount: '240.00',
            type: 'time',
            status: 'pending',
            remark: '新设备安装',
            hours: '8',
            hourlyWage: '30'
          }
        ]
        
        this.ledgerRecords = exampleRecords
        uni.setStorageSync('ledgerRecords', this.ledgerRecords)
      }
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    },
    prevMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    },
    nextMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
    },
    selectDate(date) {
      this.selectedDate = date
    },
    isDateSelected(date) {
      if (!this.selectedDate) return false
      const selected = new Date(this.selectedDate)
      const current = new Date(date)
      return selected.getFullYear() === current.getFullYear() &&
             selected.getMonth() === current.getMonth() &&
             selected.getDate() === current.getDate()
    },
    getRecordsByDate(date) {
      const targetDate = new Date(date)
      return this.filteredRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate.getFullYear() === targetDate.getFullYear() &&
               recordDate.getMonth() === targetDate.getMonth() &&
               recordDate.getDate() === targetDate.getDate()
      })
    },
    showDateRangePicker() {
      uni.showActionSheet({
        itemList: ['选择自定义日期范围', '今天', '本周', '本月', '全年'],
        success: (res) => {
          const today = new Date()
          if (res.tapIndex === 0) {
            // 自定义日期范围
            uni.datePicker({
              start: '2020-01-01',
              end: today.toISOString().split('T')[0],
              success: (startRes) => {
                this.dateRange.start = new Date(startRes.value)
                uni.datePicker({
                  start: startRes.value,
                  end: today.toISOString().split('T')[0],
                  success: (endRes) => {
                    this.dateRange.end = new Date(endRes.value)
                  }
                })
              }
            })
          } else if (res.tapIndex === 1) {
            // 今天
            this.dateRange.start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            this.dateRange.end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
          } else if (res.tapIndex === 2) {
            // 本周
            const dayOfWeek = today.getDay() || 7 // 调整为1-7
            this.dateRange.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + 1)
            this.dateRange.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + 7, 23, 59, 59)
          } else if (res.tapIndex === 3) {
            // 本月
            this.dateRange.start = new Date(today.getFullYear(), today.getMonth(), 1)
            this.dateRange.end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
          } else if (res.tapIndex === 4) {
            // 全年
            this.dateRange.start = new Date(today.getFullYear(), 0, 1)
            this.dateRange.end = new Date(today.getFullYear(), 11, 31, 23, 59, 59)
          }
        }
      })
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
    requestConfirmation() {
      uni.showModal({
        title: '请求确认',
        content: '确定要请求工厂确认这些记账记录吗？',
        success: (res) => {
          if (res.confirm) {
            // 标记记录为待确认状态
            this.ledgerRecords.forEach(record => {
              if (this.filteredRecords.some(r => r.id === record.id)) {
                record.status = 'pending'
              }
            })
            uni.setStorageSync('ledgerRecords', this.ledgerRecords)
            
            // 模拟工厂确认/驳回流程
            setTimeout(() => {
              this.simulateFactoryResponse()
            }, 2000)
            
            uni.showToast({ title: '已提交确认请求', icon: 'success' })
          }
        }
      })
    },
    simulateFactoryResponse() {
      // 模拟工厂确认或驳回
      const randomResponse = Math.random() > 0.3 // 70% 概率确认
      
      if (randomResponse) {
        // 确认所有记录
        this.ledgerRecords.forEach(record => {
          if (this.filteredRecords.some(r => r.id === record.id)) {
            record.status = 'confirmed'
          }
        })
        this.confirmationMessage = '工厂已确认您的记账记录，金额共计：' + this.totalAmount.toFixed(2) + '元'
      } else {
        // 驳回部分记录
        const rejectIndex = Math.floor(Math.random() * this.filteredRecords.length)
        const rejectedRecord = this.filteredRecords[rejectIndex]
        
        this.ledgerRecords.forEach(record => {
          if (record.id === rejectedRecord.id) {
            record.status = 'rejected'
            record.rejectionReason = '工序数量与实际不符'
          } else if (this.filteredRecords.some(r => r.id === record.id)) {
            record.status = 'confirmed'
          }
        })
        
        this.confirmationMessage = '部分记录已被驳回：\n' + rejectedRecord.description + ' - ' + rejectedRecord.amount + '元\n原因：工序数量与实际不符'
      }
      
      uni.setStorageSync('ledgerRecords', this.ledgerRecords)
      this.showConfirmationDialog = true
      
      // 保存确认状态到通知
      this.saveConfirmationNotification()
    },
    saveConfirmationNotification() {
      const notifications = uni.getStorageSync('notifications') || []
      notifications.push({
        id: Date.now(),
        type: 'ledger_confirmation',
        title: '账本确认通知',
        content: this.confirmationMessage,
        time: new Date().toISOString(),
        read: false
      })
      uni.setStorageSync('notifications', notifications)
    },
    closeConfirmationDialog() {
      this.showConfirmationDialog = false
    },
    shareLedger() {
      // 先进入筛选页
      this.showFilterOptions()
    },
    showFilterOptions() {
      uni.showActionSheet({
        itemList: ['按时间段筛选', '按款号筛选', '按工序筛选', '确认筛选并分享/导出'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 按时间段筛选
            this.showDateRangePicker()
          } else if (res.tapIndex === 1) {
            // 按款号筛选
            this.showStyleFilter()
          } else if (res.tapIndex === 2) {
            // 按工序筛选
            this.showProcessFilter()
          } else if (res.tapIndex === 3) {
            // 确认筛选并分享/导出
            this.showShareExportOptions()
          }
        }
      })
    },
    showStyleFilter() {
      // 显示款号筛选选项
      const styles = this.uniqueStyles
      if (styles.length === 0) {
        uni.showToast({ title: '暂无款号数据', icon: 'none' })
        return
      }
      
      uni.showActionSheet({
        itemList: ['全选', ...styles],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 全选
            uni.showToast({ title: '已选择全部款号', icon: 'success' })
          } else {
            // 选择单个款号
            const selectedStyle = styles[res.tapIndex - 1]
            uni.showToast({ title: `已选择款号：${selectedStyle}`, icon: 'success' })
          }
        }
      })
    },
    showProcessFilter() {
      // 显示工序筛选选项
      const processes = this.uniqueProcesses
      if (processes.length === 0) {
        uni.showToast({ title: '暂无工序数据', icon: 'none' })
        return
      }
      
      uni.showActionSheet({
        itemList: ['全选', ...processes],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 全选
            uni.showToast({ title: '已选择全部工序', icon: 'success' })
          } else {
            // 选择单个工序
            const selectedProcess = processes[res.tapIndex - 1]
            uni.showToast({ title: `已选择工序：${selectedProcess}`, icon: 'success' })
          }
        }
      })
    },
    showShareExportOptions() {
      // 生成分享内容（按款号分组）
      const shareContent = this.generateShareContent()
      
      uni.showActionSheet({
        itemList: ['微信转发给老板', '导出PDF', '导出Excel', '复制内容'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 微信转发给老板
            this.shareToBoss()
          } else if (res.tapIndex === 1) {
            // 导出PDF
            this.exportToPDF()
          } else if (res.tapIndex === 2) {
            // 导出Excel
            this.exportToExcel()
          } else if (res.tapIndex === 3) {
            // 复制内容
            uni.setClipboardData({
              data: shareContent,
              success: () => {
                uni.showToast({ title: '内容已复制', icon: 'success' })
              }
            })
          }
        }
      })
    },
    generateShareContent() {
      // 按款号分组生成分享内容
      const content = []
      content.push('【账本分享】')
      content.push('')
      content.push(`时间段：${this.dateRangeText}`)
      content.push(`总金额：${this.totalAmount.toFixed(2)}元`)
      content.push(`记录条数：${this.filteredRecords.length}条`)
      content.push(`款号数：${this.uniqueStyles.length}`)
      content.push(`工序数：${this.uniqueProcesses.length}`)
      content.push('')
      content.push('按款号分组：')
      
      // 按款号分组
      const styleGroups = {}
      this.filteredRecords.forEach(record => {
        if (record.styleNumber) {
          if (!styleGroups[record.styleNumber]) {
            styleGroups[record.styleNumber] = []
          }
          styleGroups[record.styleNumber].push(record)
        }
      })
      
      // 生成每个款号的汇总
      Object.keys(styleGroups).forEach(style => {
        content.push(`款号：${style}`)
        const styleRecords = styleGroups[style]
        const styleTotal = styleRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0)
        
        // 按工序分组
        const processGroups = {}
        styleRecords.forEach(record => {
          if (record.processName) {
            if (!processGroups[record.processName]) {
              processGroups[record.processName] = {
                quantity: 0,
                amount: 0,
                unitPrice: record.unitPrice || 0
              }
            }
            processGroups[record.processName].quantity += parseInt(record.quantity) || 1
            processGroups[record.processName].amount += parseFloat(record.amount)
          }
        })
        
        // 生成每个工序的汇总
        Object.keys(processGroups).forEach(process => {
          const processData = processGroups[process]
          content.push(`  - ${process}：${processData.amount.toFixed(2)}元 (${processData.quantity}件，${processData.unitPrice}元/件)`)
        })
        
        content.push(`  款号小计：${styleTotal.toFixed(2)}元`)
        content.push('')
      })
      
      // 添加免责声明
      content.push('⚠️ 重要提醒：本确认仅代表知晓工单事实，不代表对最终结算金额的认可，最终薪资以线下核对为准，平台不介入任何纠纷。')
      
      return content.join('\n')
    },
    exportToPDF() {
      // 模拟PDF导出
      uni.showLoading({ title: '正在生成PDF...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: 'PDF导出功能开发中', icon: 'none' })
      }, 1000)
    },
    exportToExcel() {
      // 模拟Excel导出
      uni.showLoading({ title: '正在生成Excel...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: 'Excel导出功能开发中', icon: 'none' })
      }, 1000)
    },
    shareToBoss() {
      // 标记记录为待老板确认状态
      const selectedRecords = this.filteredRecords.map(record => {
        return {
          ...record,
          status: 'pending',
          sharedToBoss: true,
          shareId: Date.now() + Math.floor(Math.random() * 1000)
        }
      })
      
      // 保存更新后的记录
      this.ledgerRecords = this.ledgerRecords.map(record => {
        const updatedRecord = selectedRecords.find(r => r.id === record.id)
        return updatedRecord || record
      })
      uni.setStorageSync('ledgerRecords', this.ledgerRecords)
      
      // 生成分享给老板的内容，包含免责声明
      const bossShareContent = `【员工账本分享】\n\n⚠️ 重要提醒：本确认仅代表知晓工单事实，不代表对最终结算金额的认可，最终薪资以线下核对为准，平台不介入任何纠纷。\n\n员工：${uni.getStorageSync('userInfo')?.name || '未知用户'}\n时间段：${this.dateRangeText}\n总金额：${this.totalAmount.toFixed(2)}元\n记录条数：${this.filteredRecords.length}条\n\n请确认以下记账记录：\n${this.filteredRecords.map(record => `- ${record.description}: ${record.amount}元`).join('\n')}`
      
      // 模拟生成微信分享卡片
      uni.showModal({
        title: '分享给老板',
        content: '已生成微信分享卡片，包含账单详情和免责声明。请选择分享方式：',
        confirmText: '分享到微信',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 模拟微信分享
            uni.showToast({
              title: '分享成功，请老板在微信中确认',
              icon: 'success'
            })
            
            // 模拟老板确认流程
            setTimeout(() => {
              this.simulateBossResponse()
            }, 3000)
          }
        }
      })
      
      // 保存分享记录
      this.saveShareNotification()
    },
    simulateBossResponse() {
      // 模拟老板确认或驳回
      const randomResponse = Math.random() > 0.2 // 80% 概率确认
      
      if (randomResponse) {
        // 确认所有记录
        const confirmedRecords = []
        this.ledgerRecords = this.ledgerRecords.map(record => {
          if (record.sharedToBoss) {
            const confirmedRecord = {
              ...record,
              status: 'confirmed',
              sharedToBoss: false
            }
            confirmedRecords.push(confirmedRecord)
            return confirmedRecord
          }
          return record
        })
        this.confirmationMessage = '老板已确认您的记账记录，金额共计：' + this.totalAmount.toFixed(2) + '元'
        
        // 创建微信确认账本并迁移记录
        this.createWechatLedgerAndMoveRecords(confirmedRecords)
      } else {
        // 驳回部分记录
        const sharedRecords = this.ledgerRecords.filter(record => record.sharedToBoss)
        if (sharedRecords.length > 0) {
          const rejectIndex = Math.floor(Math.random() * sharedRecords.length)
          const rejectedRecord = sharedRecords[rejectIndex]
          
          const confirmedRecords = []
          this.ledgerRecords = this.ledgerRecords.map(record => {
            if (record.id === rejectedRecord.id) {
              return {
                ...record,
                status: 'rejected',
                rejectionReason: '金额与实际不符',
                sharedToBoss: false
              }
            } else if (record.sharedToBoss) {
              const confirmedRecord = {
                ...record,
                status: 'confirmed',
                sharedToBoss: false
              }
              confirmedRecords.push(confirmedRecord)
              return confirmedRecord
            }
            return record
          })
          
          this.confirmationMessage = '部分记录已被老板驳回：\n' + rejectedRecord.description + ' - ' + rejectedRecord.amount + '元\n原因：金额与实际不符'
          
          // 创建微信确认账本并迁移确认的记录
          if (confirmedRecords.length > 0) {
            this.createWechatLedgerAndMoveRecords(confirmedRecords)
          }
        }
      }
      
      uni.setStorageSync('ledgerRecords', this.ledgerRecords)
      this.showConfirmationDialog = true
      
      // 保存确认状态到通知
      this.saveConfirmationNotification()
    },
    
    // 创建微信确认账本并迁移记录
    createWechatLedgerAndMoveRecords(records) {
      if (records.length === 0) return
      
      // 获取现有账本
      let ledgers = uni.getStorageSync('ledgers') || []
      
      // 检查是否已存在微信确认账本
      let wechatLedger = ledgers.find(ledger => ledger.type === 'wechat')
      
      // 如果不存在，创建新的微信确认账本
      if (!wechatLedger) {
        wechatLedger = {
          id: 'wechat_' + Date.now(),
          name: '微信确认账本',
          type: 'wechat',
          created_at: new Date().toISOString()
        }
        ledgers.push(wechatLedger)
        uni.setStorageSync('ledgers', ledgers)
        this.ledgers = ledgers
      }
      
      // 迁移记录到微信确认账本
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      const updatedRecords = allRecords.map(record => {
        if (records.some(r => r.id === record.id)) {
          return {
            ...record,
            ledgerId: wechatLedger.id
          }
        }
        return record
      })
      
      uni.setStorageSync('ledgerRecords', updatedRecords)
      
      // 重新加载当前账本的记录
      this.loadLedgerRecords()
    },
    saveShareNotification() {
      const notifications = uni.getStorageSync('notifications') || []
      notifications.push({
        id: Date.now(),
        type: 'ledger_share',
        title: '账本分享通知',
        content: '您已将账本分享给老板，等待确认。',
        time: new Date().toISOString(),
        read: false
      })
      uni.setStorageSync('notifications', notifications)
    },

    editRecord(record) {
      this.editingRecord = record
      // 从描述中提取款号和工序
      const styleMatch = record.description.match(/款号(\w+)/)
      const processMatch = record.description.match(/-(.*)/)
      
      this.editForm = {
        description: record.description || '',
        amount: record.amount || '',
        remark: record.remark || '',
        styleNumber: record.styleNumber || (styleMatch ? styleMatch[1] : ''),
        processName: record.processName || (processMatch ? processMatch[1].trim() : ''),
        quantity: record.quantity || '1',
        unitPrice: record.unitPrice || (record.amount ? record.amount : '0')
      }
      
      // 如果记录有数量和单价字段，直接使用
      if (record.quantity && record.unitPrice) {
        this.editForm.quantity = record.quantity
        this.editForm.unitPrice = record.unitPrice
      } else if (record.amount) {
        // 尝试从金额反推单价（假设数量为1）
        this.editForm.unitPrice = record.amount
        this.editForm.quantity = '1'
      }
      
      this.showEditDialog = true
    },
    saveEdit() {
      if (!this.editForm.styleNumber || !this.editForm.processName || !this.editForm.quantity || !this.editForm.unitPrice) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      // 计算金额
      const amount = (parseFloat(this.editForm.unitPrice) * parseInt(this.editForm.quantity)).toFixed(2)
      const description = `款号${this.editForm.styleNumber} - ${this.editForm.processName}`
      
      // 更新记录
      const index = this.ledgerRecords.findIndex(r => r.id === this.editingRecord.id)
      if (index !== -1) {
        this.ledgerRecords[index] = {
          ...this.ledgerRecords[index],
          description: description,
          amount: amount,
          remark: this.editForm.remark,
          status: 'pending', // 编辑后重置为待审核状态
          styleNumber: this.editForm.styleNumber,
          processName: this.editForm.processName,
          quantity: this.editForm.quantity,
          unitPrice: this.editForm.unitPrice
        }
        
        // 保存到本地存储
        uni.setStorageSync('ledgerRecords', this.ledgerRecords)
        
        // 关闭对话框
        this.closeEditDialog()
        
        // 提示保存成功
        uni.showToast({ title: '保存成功', icon: 'success' })
        
        // 如果记录已审核，提示需要重新审核
        if (this.editingRecord.status === 'confirmed') {
          uni.showModal({
            title: '提示',
            content: '该记录已审核，修改后需要重新审核',
            showCancel: false
          })
        }
      }
    },
    selectStyleForEdit(style) {
      this.editForm.styleNumber = style
      // 关闭下拉菜单
      this.showDropdown = null
    },
    // 切换款号下拉菜单
    toggleStyleDropdown(type) {
      this.showDropdown = this.showDropdown === `${type}-style` ? null : `${type}-style`
    },
    // 切换工序下拉菜单
    toggleProcessDropdown(type) {
      this.showDropdown = this.showDropdown === `${type}-process` ? null : `${type}-process`
    },
    // 获取工序历史
    getProcessHistory(styleNumber) {
      const processes = []
      const styleProcessMap = uni.getStorageSync('styleProcessMap') || {}
      const wageItems = uni.getStorageSync('wageItems') || []
      
      // 添加组长设置的工序
      wageItems.filter(item => item.styleNumber === styleNumber).forEach(item => {
        processes.push({
          processName: item.processName,
          unitPrice: item.unitPrice
        })
      })
      
      // 添加历史工序
      if (styleProcessMap[styleNumber]) {
        processes.push({
          processName: styleProcessMap[styleNumber].processName,
          unitPrice: styleProcessMap[styleNumber].unitPrice
        })
      }
      
      // 去重
      const uniqueProcesses = []
      const seenProcesses = new Set()
      
      processes.forEach(process => {
        if (!seenProcesses.has(process.processName)) {
          seenProcesses.add(process.processName)
          uniqueProcesses.push(process)
        }
      })
      
      return uniqueProcesses
    },
    // 选择工序（编辑）
    selectProcessForEdit(process) {
      this.editForm.processName = process.processName
      this.editForm.unitPrice = process.unitPrice
      // 关闭下拉菜单
      this.showDropdown = null
    },
    // 选择工序（新增）
    selectProcessForAdd(process) {
      this.addForm.processName = process.processName
      this.addForm.unitPrice = process.unitPrice
      // 关闭下拉菜单
      this.showDropdown = null
    },
    closeEditDialog() {
      this.showEditDialog = false
      this.editingRecord = null
      this.editForm = {
        description: '',
        amount: '',
        remark: ''
      }
    },

    saveAdd() {
      let amount, description, newRecord
      
      // 计件模式
      if (this.currentMode === 'piece') {
        if (!this.addForm.styleNumber || !this.addForm.processName || !this.addForm.quantity || !this.addForm.unitPrice) {
          uni.showToast({ title: '请填写完整信息', icon: 'none' })
          return
        }
        
        // 计算金额
        amount = (parseFloat(this.addForm.unitPrice) * parseInt(this.addForm.quantity)).toFixed(2)
        description = `款号${this.addForm.styleNumber} - ${this.addForm.processName}`
        
        // 创建新记录
        newRecord = {
          id: Date.now(),
          ledgerId: this.currentLedgerId,
          date: new Date().toISOString(),
          description: description,
          amount: amount,
          type: 'piece',
          status: 'pending',
          remark: this.addForm.remark,
          styleNumber: this.addForm.styleNumber,
          processName: this.addForm.processName,
          quantity: this.addForm.quantity,
          unitPrice: this.addForm.unitPrice
        }
      } 
      // 计时模式
      else {
        if (!this.addForm.description || !this.addForm.hours || !this.addForm.hourlyWage) {
          uni.showToast({ title: '请填写完整信息', icon: 'none' })
          return
        }
        
        // 计算金额
        amount = (parseFloat(this.addForm.hourlyWage) * parseFloat(this.addForm.hours)).toFixed(2)
        description = this.addForm.description
        
        // 创建新记录
        newRecord = {
          id: Date.now(),
          ledgerId: this.currentLedgerId,
          date: new Date().toISOString(),
          description: description,
          amount: amount,
          type: 'time',
          status: 'pending',
          remark: this.addForm.remark,
          hours: this.addForm.hours,
          hourlyWage: this.addForm.hourlyWage
        }
      }
      
      // 添加到记录列表
      this.ledgerRecords.unshift(newRecord)
      
      // 保存到本地存储
      uni.setStorageSync('ledgerRecords', this.ledgerRecords)
      
      // 记录记账活动
      const userInfo = uni.getStorageSync('userInfo')
      const userId = userInfo.username || userInfo.openid
      if (userId) {
        recordUserActivity(userId, ACTIVITY_TYPES.LEDGER)
      }
      
      // 关闭对话框
      this.closeAddDialog()
      
      // 提示保存成功
      uni.showToast({ title: '新增成功', icon: 'success' })
    },
    closeAddDialog() {
      this.showAddDialog = false
      this.addForm = {
        description: '',
        amount: '',
        remark: '',
        styleNumber: '',
        processName: '',
        quantity: '',
        unitPrice: ''
      }
    },
    deleteRecord(record) {
      this.recordToDelete = record
      this.showDeleteDialog = true
    },
    confirmDelete() {
      if (this.recordToDelete) {
        const index = this.ledgerRecords.findIndex(r => r.id === this.recordToDelete.id)
        if (index !== -1) {
          this.ledgerRecords.splice(index, 1)
          uni.setStorageSync('ledgerRecords', this.ledgerRecords)
          uni.showToast({ title: '删除成功', icon: 'success' })
        }
      }
      this.closeDeleteDialog()
    },
    closeDeleteDialog() {
      this.showDeleteDialog = false
      this.recordToDelete = null
    },
    // 首次使用检查
    checkFirstTimeUse() {
      const firstTimeAdd = uni.getStorageSync('firstTimeAdd')
      const firstTimeShare = uni.getStorageSync('firstTimeShare')
      
      if (!firstTimeAdd) {
        // 延迟显示，确保页面加载完成
        setTimeout(() => {
          this.showTooltip('点击「新增记录」按钮开始记账', 'bottom')
        }, 1000)
      }
    },
    // 操作提示相关方法
    showTooltip(text, position = 'top') {
      this.tooltipText = text
      this.tooltipPosition = position
      this.showActionTooltip = true
      // 3秒后自动关闭
      setTimeout(() => {
        this.showActionTooltip = false
      }, 3000)
    },
    onTooltipClose() {
      this.showActionTooltip = false
    },
    // 重写 addRecord 方法，添加首次使用提示
    addRecord() {
      const firstTimeAdd = uni.getStorageSync('firstTimeAdd')
      if (!firstTimeAdd) {
        uni.setStorageSync('firstTimeAdd', true)
      }
      this.showAddDialog = true
      this.addForm = {
        description: '',
        amount: '',
        remark: '',
        styleNumber: '',
        processName: '',
        quantity: '',
        unitPrice: ''
      }
    },
    // 重写 shareLedger 方法，添加首次使用提示
    shareLedger() {
      const firstTimeShare = uni.getStorageSync('firstTimeShare')
      if (!firstTimeShare) {
        uni.setStorageSync('firstTimeShare', true)
        this.showTooltip('选择「一键分享给老板」发送账单确认', 'top')
      }
      
      const shareContent = `【账本分享】\n\n时间段：${this.dateRangeText}\n总金额：${this.totalAmount.toFixed(2)}元\n记录条数：${this.filteredRecords.length}条\n款号数：${this.uniqueStyles.length}\n工序数：${this.uniqueProcesses.length}\n\n${this.styleProcessSummary.map(styleItem => `款号${styleItem.style}：${styleItem.totalAmount.toFixed(2)}元\n${styleItem.processes.map(processItem => `  - ${processItem.process}：${processItem.amount.toFixed(2)}元 (${processItem.quantity}件，${processItem.unitPrice}元/件)`).join('\n')}`).join('\n\n')}`
      
      uni.showActionSheet({
        itemList: ['一键分享给老板', '分享到微信', '分享到QQ', '复制内容'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 分享给老板
            this.shareToBoss()
          } else if (res.tapIndex === 1) {
            // 分享到微信
            uni.share({
              provider: 'weixin',
              scene: 'WXSceneSession',
              type: 1,
              title: '账本分享',
              summary: `时间段：${this.dateRangeText}，总金额：${this.totalAmount.toFixed(2)}元`,
              content: shareContent,
              success: () => {
                uni.showToast({ title: '分享成功', icon: 'success' })
              },
              fail: () => {
                uni.showToast({ title: '分享失败', icon: 'none' })
              }
            })
          } else if (res.tapIndex === 2) {
            // 分享到QQ
            uni.showToast({ title: '分享到QQ功能开发中', icon: 'none' })
          } else if (res.tapIndex === 3) {
            uni.setClipboardData({
              data: shareContent,
              success: () => {
                uni.showToast({ title: '内容已复制', icon: 'success' })
              }
            })
          }
        }
      })
    },
    // 切换款号展开/收起状态
    toggleStyleExpand(style) {
      const index = this.expandedStyles.indexOf(style)
      if (index === -1) {
        this.expandedStyles.push(style)
      } else {
        this.expandedStyles.splice(index, 1)
      }
    },
    
    // 加载已保存的实发工资
    loadSavedSalary() {
      const savedSalary = uni.getStorageSync(`salary_${this.currentLedgerId}`)
      if (savedSalary) {
        this.savedSalary = savedSalary
      }
    },
    
    // 保存实发工资
    saveSalary() {
      if (!this.salaryForm.amount) {
        uni.showToast({ title: '请输入实发工资金额', icon: 'none' })
        return
      }
      
      const salaryData = {
        amount: this.salaryForm.amount,
        remark: this.salaryForm.remark,
        date: new Date().toISOString()
      }
      
      // 保存到本地存储
      uni.setStorageSync(`salary_${this.currentLedgerId}`, salaryData)
      this.savedSalary = salaryData
      
      // 提示保存成功
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    
    // 获取用户收入数据
    async getUserIncomeData() {
      uni.showLoading({ title: '加载中' })
      try {
        // 模拟后端接口数据
        // 实际项目中需要替换为真实的后端接口调用
        setTimeout(() => {
          // 模拟数据
          this.monthlyIncome = 8500
          this.exceedPercent = 85
          this.workType = '平车'
          this.cityRank = 15
          this.dailyMax = 680
          this.showBadge = true
          this.badgeName = '苏州平车大神'
          uni.hideLoading()
        }, 1000)
        
        // 实际接口调用示例
        /*
        const res = await uni.request({
          url: '你的后端接口地址',
          method: 'GET',
          header: {
            'token': uni.getStorageSync('token') // 对接现有登录体系
          }
        })
        if (res.data.code === 200) {
          const data = res.data.data
          this.monthlyIncome = data.monthlyIncome
          this.exceedPercent = data.exceedPercent
          this.workType = data.workType
          this.cityRank = data.cityRank
          this.dailyMax = data.dailyMax
          this.showBadge = data.showBadge
          this.badgeName = data.badgeName
        }
        */
      } catch (e) {
        console.error('收入数据获取失败', e)
        uni.hideLoading()
      }
    },
    
    // 获取用户徽章数据
    async getUserBadgeData() {
      try {
        // 模拟后端接口数据
        // 实际项目中需要替换为真实的后端接口调用
        setTimeout(() => {
          // 模拟已解锁的徽章ID列表
          const unlockedIds = [1, 2, 3]
          this.badgeList = this.badgeList.map(item => ({
            ...item,
            unlocked: unlockedIds.includes(item.id)
          }))
        }, 1000)
        
        // 实际接口调用示例
        /*
        const res = await uni.request({
          url: '你的后端接口地址',
          method: 'GET',
          header: {
            'token': uni.getStorageSync('token')
          }
        })
        if (res.data.code === 200) {
          const unlockedIds = res.data.data.unlockedIds
          this.badgeList = this.badgeList.map(item => ({
            ...item,
            unlocked: unlockedIds.includes(item.id)
          }))
        }
        */
      } catch (e) {
        console.error('徽章数据获取失败', e)
      }
    },
    
    // 显示徽章详情
    showBadgeDetail(item) {
      this.currentBadge = item
      this.showModal = true
    },
    
    // 关闭徽章详情弹窗
    closeModal() {
      this.showModal = false
    },
    
    // 获取用户连续记工天数和徽章解锁状态
    async getUserContinuousDays() {
      try {
        // 模拟后端接口数据
        // 实际项目中需要替换为真实的后端接口调用
        setTimeout(() => {
          // 模拟数据
          this.continuousDays = 15
          this.userCheckinRecord = [
            '2026-03-02', '2026-03-01', '2026-02-29', '2026-02-28', '2026-02-27',
            '2026-02-26', '2026-02-25', '2026-02-24', '2026-02-23', '2026-02-22',
            '2026-02-21', '2026-02-20', '2026-02-19', '2026-02-18', '2026-02-17'
          ]
          // 模拟已解锁的徽章ID列表
          const unlockedIds = [1, 2]
          this.continuousBadgeList = this.continuousBadgeList.map(item => ({
            ...item,
            unlocked: unlockedIds.includes(item.id)
          }))
        }, 1000)
        
        // 实际接口调用示例
        /*
        const res = await uni.request({
          url: '你的后端接口地址',
          method: 'GET',
          header: { token: uni.getStorageSync('token') }
        })
        if (res.data.code === 200) {
          const data = res.data.data
          this.continuousDays = data.continuousDays
          this.userCheckinRecord = data.checkinList
          const unlockedIds = data.unlockedIds
          this.continuousBadgeList = this.continuousBadgeList.map(item => ({
            ...item,
            unlocked: unlockedIds.includes(item.id)
          }))
        }
        */
      } catch (e) {
        console.error('连续记工数据获取失败', e)
      }
    },
    
    // 显示连续记工徽章详情
    showContinuousBadgeDetail(item) {
      this.currentContinuousBadge = item
      this.showContinuousModal = true
    },
    
    // 关闭连续记工徽章详情弹窗
    closeContinuousModal() {
      this.showContinuousModal = false
    },
    
    // 导航返回
    navigateBack() {
      uni.navigateBack()
    },
    
    // 监听返回按钮
    onBackPress() {
      this.navigateBack();
      return true;
    },
    
    // 初始化滑动返回
    initSwipeBack() {
      // 在APP端启用原生滑动返回
      if (uni.getSystemInfoSync().platform === 'android' || uni.getSystemInfoSync().platform === 'ios') {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 });
      }
    },
    
    // 添加支出
    addExpense() {
      uni.showToast({
        title: '记支出功能开发中',
        icon: 'none'
      })
    },
    
    // 检查日期是否为周日
    isSunday(date) {
      const d = new Date(date)
      return d.getDay() === 0
    }
  }
}
</script>

<style scoped>
.ledger-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1677ff;
  color: white;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
}

.nav-back {
  font-size: 32rpx;
  cursor: pointer;
}

.add-btn {
  font-size: 24rpx;
  font-weight: bold;
  cursor: pointer;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

/* 顶部固定3个tab */
.main-tabs {
  display: flex;
  background: white;
  border-bottom: 1rpx solid #e8e8e8;
  position: sticky;
  top: 88rpx;
  z-index: 99;
}

.tab-item {
  flex: 1;
  padding: 25rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
  font-weight: bold;
}

/* 固定支出管理 */
.fixed-expenses-section {
  background: white;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.section-action {
  font-size: 24rpx;
  color: #1677ff;
  cursor: pointer;
}

.fixed-expenses-list {
  min-height: 200rpx;
}

.fixed-expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.fixed-expense-item:last-child {
  border-bottom: none;
}

.expense-name {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.expense-amount {
  font-size: 26rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin: 0 20rpx;
}

.expense-date {
  font-size: 22rpx;
  color: #999;
}

/* 收支明细 */
.expense-detail-section {
  background: white;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-buttons {
  display: flex;
  gap: 10rpx;
}

.filter-btn {
  padding: 8rpx 16rpx;
  border: 2rpx solid #e8e8e8;
  background: white;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #666;
}

.filter-btn.active {
  border-color: #1677ff;
  color: #1677ff;
  background: #f0f9ff;
}

.records-list {
  min-height: 300rpx;
}

.record-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-description {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.record-amount {
  font-size: 26rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 8rpx;
  display: block;
}

.record-amount.income {
  color: #52c41a;
}

.record-date {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 15rpx;
  display: block;
}

.record-actions {
  display: flex;
  gap: 10rpx;
}

.edit-button, .delete-button {
  padding: 8rpx 16rpx;
  border: 1rpx solid #e8e8e8;
  background: white;
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #666;
}

.delete-button {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 图表分析 */
.chart-section {
  background: white;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.chart-container {
  height: 300rpx;
  margin-top: 20rpx;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* 对账凭证 */
.voucher-section {
  background: white;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.voucher-card {
  padding: 30rpx;
  background: #f0f9ff;
  border-radius: 15rpx;
  text-align: center;
}

.voucher-period {
  font-size: 28rpx;
  font-weight: bold;
  color: #1677ff;
  margin-bottom: 20rpx;
  display: block;
}

.voucher-income, .voucher-expense, .voucher-net {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.voucher-net {
  font-weight: bold;
  color: #1677ff;
  font-size: 28rpx;
  margin-top: 10rpx;
}

.voucher-button {
  width: 100%;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background: #1677ff;
  color: white;
  margin-top: 20rpx;
}

.voucher-button.share {
  background: #52c41a;
  margin-top: 10rpx;
}



/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.empty-desc {
  font-size: 20rpx;
  color: #999;
  display: block;
}

/* 日期筛选区 */
.date-range-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx 0;
  padding: 0 10rpx;
}

.range-button {
  padding: 10rpx 20rpx;
  background: #1677ff;
  color: white;
  border-radius: 20rpx;
  font-size: 22rpx;
  border: none;
}

.selected-range {
  font-size: 22rpx;
  color: #666;
}

/* 通用样式 */
.tab-content {
  padding-bottom: 20rpx;
}



.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
  line-height: 1.6;
}

.modal-condition {
  font-size: 24rpx;
  color: #ff4d4f;
  display: block;
  margin-bottom: 30rpx;
}

.modal-close {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 连续记工进度卡 */
.continuous-checkin-section {
  margin-bottom: 30rpx;
}

.checkin-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  color: #fff;
  margin-bottom: 30rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.title {
  font-size: 28rpx;
  font-weight: 600;
}

.days {
  font-size: 32rpx;
  font-weight: 700;
}

.progress-box {
  width: 100%;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  margin-bottom: 10rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #ffd700;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-tip {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 20rpx;
}

.privilege-tip {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 10rpx 16rpx;
  border-radius: 12rpx;
}

.privilege-tip .icon {
  margin-right: 8rpx;
  font-size: 24rpx;
}

.tip-text {
  font-size: 22rpx;
}

/* 核心操作大按钮区 */
.core-action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.core-action-button {
  flex: 1;
  padding: 20rpx;
  margin: 0 10rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  border: none;
}

.core-action-button.piece-work {
  background: #52c41a;
  color: #fff;
}

.core-action-button.time-work {
  background: #fff;
  color: #52c41a;
  border: 2rpx solid #52c41a;
}

.core-action-button.add-expense {
  background: #fa8c16;
  color: #fff;
}

.core-action-button.my-privilege {
  background: #fff;
  color: #d48806;
  border: 2rpx solid #d48806;
}

.button-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.button-text {
  font-size: 30rpx;
  font-weight: 600;
}

/* 日历模块优化 */
.calendar-day {
  position: relative;
  width: 14.28%;
  padding: 10rpx 0;
  text-align: center;
  border-radius: 8rpx;
}

.calendar-day.today {
  border: 2rpx solid #1677ff;
  font-weight: bold;
  animation: breathe 2s infinite;
}

.calendar-day.sunday {
  background: #f5f7fa;
}

.calendar-day.has-record {
  background: #52c41a;
  color: #fff;
}

.sunday-tag {
  font-size: 16rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.check-icon {
  position: absolute;
  bottom: 2rpx;
  right: 4rpx;
  font-size: 16rpx;
}

.consecutive-icon-3 {
  position: absolute;
  bottom: 2rpx;
  right: 4rpx;
  font-size: 16rpx;
}

.consecutive-icon-7 {
  position: absolute;
  bottom: 2rpx;
  right: 4rpx;
  font-size: 16rpx;
}

@keyframes breathe {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10rpx rgba(22, 119, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 119, 255, 0);
  }
}

/* 推荐岗位样式 */
.recommended-jobs {
  background: #fff;
  padding: 30rpx;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.job-item {
  padding: 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.job-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.job-salary {
  font-size: 26rpx;
  color: #ff4d4f;
  font-weight: 500;
}

.job-company {
  font-size: 24rpx;
  color: #666;
}

.job-apply-button {
  margin-top: 10rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border-radius: 30rpx;
  font-size: 24rpx;
  border: none;
}

/* 收入详情样式 */
.income-detail {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16rpx;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.badge-days {
  font-size: 20rpx;
  color: #999;
}

.modal-privilege {
  font-size: 26rpx;
  color: #1677ff;
  display: block;
  margin-bottom: 15rpx;
  line-height: 1.6;
}

.back-button {
  position: absolute;
  top: 16dp;
  right: 16dp;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: rgba(74, 144, 226, 0.1);
  color: #4A90E2;
  border: none;
  z-index: 80;
}

/* 记账模式切换 */
.mode-switch {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin: 32rpx 0;
}

.mode-btn {
  padding: 12rpx 32rpx;
  border-radius: 24rpx;
  border: 2rpx solid #E5E7EB;
  background-color: #FFFFFF;
  color: #6B7280;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.mode-btn.active {
  background-color: #10B981;
  color: #FFFFFF;
  border-color: #10B981;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
}

/* 账本切换 */
.ledger-tabs {
  margin: 20rpx 0;
}

.ledger-tabs-scroll {
  white-space: nowrap;
}

.ledger-tab {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 20rpx;
  background-color: #F3F4F6;
  color: #6B7280;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.ledger-tab.active {
  background-color: #10B981;
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
}



.date-range-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.range-button {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  font-size: 24rpx;
}

.selected-range {
  font-size: 24rpx;
  color: #666;
}

.calendar-view {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.month-nav {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #f0f0f0;
  border: none;
  font-size: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.current-month {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10rpx;
}

.weekday {
  text-align: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 10rpx;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  background-color: #f9f9f9;
  position: relative;
}

.calendar-day.other-month {
  opacity: 0.5;
}

.calendar-day.has-record {
  background-color: #e6f2ff;
}

.calendar-day.selected {
  background-color: #4A90E2;
  color: #fff;
}

.day-number {
  font-size: 24rpx;
  font-weight: bold;
}

.day-amount {
  font-size: 16rpx;
  margin-top: 5rpx;
  color: #4A90E2;
}

.calendar-day.selected .day-amount {
  color: #fff;
}

.selected-date-records {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.record-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.record-description {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.record-amount {
  font-size: 24rpx;
  font-weight: bold;
  color: #4A90E2;
}

.no-records {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

.summary-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 计算规则说明 */
.rule-section {
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.rule-content {
  margin-top: 10rpx;
}

.rule-text {
  font-size: 24rpx;
  color: #52c41a;
  line-height: 1.5;
  font-weight: 500;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.summary-item {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  text-align: center;
}

.summary-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
}

.style-summary-section {
  margin-bottom: 20rpx;
}

.style-summary-item {
  background-color: #FFFFFF;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.style-header {
  padding: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.style-header:hover {
  background-color: #f9f9f9;
}

/* 实发工资录入区域 */
.salary-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.salary-input-container {
  margin-bottom: 20rpx;
}

.salary-input-container .form-group {
  margin-bottom: 15rpx;
}

.salary-input-container .form-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.salary-input-container .form-input {
  width: 100%;
  padding: 15rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 8rpx;
  font-size: 24rpx;
  box-sizing: border-box;
}

.salary-save-button {
  width: 100%;
  padding: 15rpx;
  background-color: #10B981;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  margin-top: 10rpx;
}

.saved-salary {
  padding: 15rpx;
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 8rpx;
  margin-top: 15rpx;
}

.saved-salary-label {
  font-size: 22rpx;
  color: #52c41a;
}

.saved-salary-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #52c41a;
  margin-left: 10rpx;
}

.saved-salary-remark {
  font-size: 20rpx;
  color: #888;
  margin-left: 10rpx;
}

.saved-salary-date {
  display: block;
  font-size: 20rpx;
  color: #999;
  margin-top: 10rpx;
}

.style-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.style-total-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #FF6B35;
  margin: 0 16rpx;
}

.style-total-quantity {
  font-size: 24rpx;
  color: #666666;
  margin-right: 16rpx;
}

.expand-icon {
  font-size: 20rpx;
  color: #999999;
}

.process-list {
  border-top: 1rpx solid #f0f0f0;
  padding: 0 16rpx 16rpx;
}

.process-summary-item {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 12rpx;
  margin-top: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.process-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
}

.process-quantity {
  font-size: 24rpx;
  color: #666666;
  margin: 0 12rpx;
}

.process-unit-price {
  font-size: 24rpx;
  color: #666666;
  margin: 0 12rpx;
}

.process-amount {
  font-size: 26rpx;
  font-weight: bold;
  color: #FF6B35;
}

.no-data {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 下拉菜单样式 */
.input-with-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-input {
  padding-right: 60rpx;
}

.dropdown-arrow {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20rpx;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-arrow:active {
  color: #4A90E2;
  transform: translateY(-50%) scale(0.9);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1rpx solid #e8e8e8;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  margin-top: 5rpx;
  z-index: 100;
  max-height: 300rpx;
  overflow-y: auto;
}

.dropdown-item {
  display: block;
  padding: 15rpx 20rpx;
  font-size: 24rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background: #f0f9ff;
  color: #4A90E2;
}

/* 记录状态样式 */
.record-status {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  margin-left: 10rpx;
}

.record-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.record-status.confirmed {
  background-color: #d4edda;
  color: #155724;
}

.record-status.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.action-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.share-button {
  background-color: #73d13d;
  color: #fff;
}

.confirm-button {
  background-color: #ff9c6e;
  color: #fff;
}

/* 确认对话框样式 */
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
  border-radius: 20rpx;
  padding: 40rpx;
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

.dialog-content-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 40rpx;
  white-space: pre-line;
}

.dialog-buttons {
  display: flex;
  justify-content: center;
}

.dialog-button {
  padding: 18rpx 70rpx;
  border-radius: 40rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  font-size: 30rpx;
  font-weight: bold;
  margin: 0 10rpx;
}

/* 记录项样式调整 */
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
  flex-wrap: wrap;
}

.record-description {
  font-size: 24rpx;
  color: #333;
  flex: 1;
  margin-bottom: 5rpx;
}

.record-amount {
  font-size: 24rpx;
  font-weight: bold;
  color: #4A90E2;
  margin-right: 10rpx;
}

.edit-button {
  padding: 10rpx 24rpx;
  background-color: #4A90E2;
  color: #fff;
  border-radius: 20rpx;
  font-size: 22rpx;
  border: none;
  margin-right: 10rpx;
}

.delete-button {
  padding: 10rpx 24rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 20rpx;
  font-size: 22rpx;
  border: none;
}

.action-button {
  padding: 15rpx 40rpx;
  border-radius: 30rpx;
  border: none;
  font-size: 24rpx;
  font-weight: bold;
  margin: 0 10rpx;
}

.confirm-button {
  background-color: #ff9c6e;
  color: #fff;
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
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  padding: 15rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
}

.dialog-button {
  flex: 1;
  padding: 15rpx 0;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #666;
}

.confirm-button {
  background-color: #4A90E2;
  color: #fff;
}

</style>