<template>
  <view class="efficiency-tools-container">
    <view class="header">
      <text class="back-btn" @click="navigateBack">←</text>
      <text class="title">效率工具管理</text>
      <text class="empty"></text>
    </view>
    
    <!-- 工具概览 -->
    <view class="overview-section">
      <text class="section-title">🛠️ 工具概览</text>
      <view class="tool-cards">
        <view class="tool-card" @click="switchTool('lightweight-mes')">
          <text class="tool-icon">🏭</text>
          <text class="tool-title">轻量化MES</text>
          <text class="tool-desc">生产管理系统</text>
        </view>
        <view class="tool-card" @click="switchTool('data-dashboard')">
          <text class="tool-icon">📊</text>
          <text class="tool-title">数据看板</text>
          <text class="tool-desc">运营数据统计</text>
        </view>
      </view>
    </view>
    
    <!-- 工具内容区域 -->
    <view class="tool-content">
      <!-- 轻量化MES -->
      <view v-if="activeTool === 'lightweight-mes'" class="lightweight-mes">
        <text class="content-title">🏭 轻量化MES</text>
        
        <!-- 生产任务管理 -->
        <view class="production-section">
          <text class="section-subtitle">生产任务管理</text>
          <view class="task-list">
            <view v-for="(task, index) in productionTasks" :key="index" class="task-item" :class="task.status">
              <view class="task-info">
                <text class="task-name">{{ task.name }}</text>
                <text class="task-desc">{{ task.description }}</text>
                <text class="task-time">{{ task.startTime }} - {{ task.endTime }}</text>
              </view>
              <view class="task-status">
                <text class="status-badge">{{ task.statusText }}</text>
                <button class="action-btn" @click="updateTaskStatus(task, index)">{{ task.status === 'pending' ? '开始' : task.status === 'in_progress' ? '完成' : '重新开始' }}</button>
              </view>
            </view>
          </view>
          
          <button class="add-task-btn" @click="showAddTaskModal">添加生产任务</button>
        </view>
        
        <!-- 生产统计 -->
        <view class="production-stats">
          <text class="section-subtitle">生产统计</text>
          <view class="stats-grid">
            <view class="stats-item">
              <text class="stats-value">{{ pendingTasks }}</text>
              <text class="stats-label">待处理任务</text>
            </view>
            <view class="stats-item">
              <text class="stats-value">{{ inProgressTasks }}</text>
              <text class="stats-label">进行中任务</text>
            </view>
            <view class="stats-item">
              <text class="stats-value">{{ completedTasks }}</text>
              <text class="stats-label">已完成任务</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 数据看板 -->
      <view v-if="activeTool === 'data-dashboard'" class="data-dashboard">
        <text class="content-title">📊 数据看板</text>
        
        <!-- 关键指标 -->
        <view class="key-metrics">
          <view class="metric-item">
            <text class="metric-icon">👥</text>
            <text class="metric-value">{{ totalWorkers }}</text>
            <text class="metric-label">总工人</text>
          </view>
          <view class="metric-item">
            <text class="metric-icon">📢</text>
            <text class="metric-value">{{ activeJobs }}</text>
            <text class="metric-label">活跃岗位</text>
          </view>
          <view class="metric-item">
            <text class="metric-icon">✅</text>
            <text class="metric-value">{{ completedJobs }}</text>
            <text class="metric-label">已完成岗位</text>
          </view>
          <view class="metric-item">
            <text class="metric-icon">💼</text>
            <text class="metric-value">{{ totalResumes }}</text>
            <text class="metric-label">收到简历</text>
          </view>
        </view>
        
        <!-- 趋势图表 -->
        <view class="trend-section">
          <text class="section-subtitle">招聘趋势</text>
          <view class="trend-chart">
            <view class="chart-container">
              <view class="chart-bar" v-for="(item, index) in recruitmentTrends" :key="index" :style="{ height: item.value + '%' }">
                <text class="bar-value">{{ item.count }}</text>
              </view>
            </view>
            <view class="chart-labels">
              <text class="chart-label" v-for="(item, index) in recruitmentTrends" :key="index">{{ item.month }}</text>
            </view>
          </view>
        </view>
        
        <!-- 工人分布 -->
        <view class="distribution-section">
          <text class="section-subtitle">工人分布</text>
          <view class="distribution-grid">
            <view class="distribution-item">
              <text class="distribution-label">性别分布</text>
              <view class="distribution-chart">
                <view class="pie-slice male" :style="{ width: malePercentage + '%' }"></view>
                <view class="pie-slice female" :style="{ width: (100 - malePercentage) + '%' }"></view>
              </view>
              <text class="distribution-text">男: {{ malePercentage }}% / 女: {{ 100 - malePercentage }}%</text>
            </view>
            <view class="distribution-item">
              <text class="distribution-label">年龄分布</text>
              <view class="age-distribution">
                <view class="age-bar" v-for="(age, index) in ageDistribution" :key="index" :style="{ height: age.percentage + '%' }">
                  <text class="age-label">{{ age.range }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加任务弹窗 -->
    <view v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加生产任务</text>
        <view class="modal-form">
          <view class="form-group">
            <text class="form-label">任务名称</text>
            <input type="text" v-model="newTask.name" placeholder="请输入任务名称" class="form-input" />
          </view>
          <view class="form-group">
            <text class="form-label">任务描述</text>
            <textarea v-model="newTask.description" placeholder="请输入任务描述" class="form-textarea"></textarea>
          </view>
          <view class="form-group">
            <text class="form-label">开始时间</text>
            <input type="datetime-local" v-model="newTask.startTime" class="form-input" />
          </view>
          <view class="form-group">
            <text class="form-label">结束时间</text>
            <input type="datetime-local" v-model="newTask.endTime" class="form-input" />
          </view>
        </view>
        <view class="modal-buttons">
          <button class="cancel-btn" @click="closeTaskModal">取消</button>
          <button class="confirm-btn" @click="addTask">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTool: 'lightweight-mes',
      
      // 轻量化MES数据
      productionTasks: [],
      showTaskModal: false,
      newTask: {
        name: '',
        description: '',
        startTime: '',
        endTime: ''
      },
      
      // 数据看板数据
      totalWorkers: 120,
      activeJobs: 8,
      completedJobs: 24,
      totalResumes: 156,
      recruitmentTrends: [
        { month: '1月', count: 12, value: 30 },
        { month: '2月', count: 18, value: 45 },
        { month: '3月', count: 25, value: 65 },
        { month: '4月', count: 32, value: 80 },
        { month: '5月', count: 28, value: 70 },
        { month: '6月', count: 35, value: 90 }
      ],
      malePercentage: 65,
      ageDistribution: [
        { range: '18-25', percentage: 30 },
        { range: '26-35', percentage: 45 },
        { range: '36-45', percentage: 20 },
        { range: '46+', percentage: 5 }
      ]
    }
  },
  onLoad(options) {
    // 根据URL参数设置默认工具
    if (options && options.tool) {
      this.activeTool = options.tool
    }
    this.loadData()
  },
  computed: {
    pendingTasks() {
      return this.productionTasks.filter(task => task.status === 'pending').length
    },
    inProgressTasks() {
      return this.productionTasks.filter(task => task.status === 'in_progress').length
    },
    completedTasks() {
      return this.productionTasks.filter(task => task.status === 'completed').length
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    switchTool(tool) {
      this.activeTool = tool
    },
    loadData() {
      // 加载生产任务数据
      this.productionTasks = uni.getStorageSync('productionTasks') || [
        {
          id: 1,
          name: '服装生产',
          description: '夏季T恤生产',
          startTime: '2026-07-01',
          endTime: '2026-07-15',
          status: 'completed',
          statusText: '已完成'
        },
        {
          id: 2,
          name: '包装任务',
          description: '产品包装',
          startTime: '2026-07-10',
          endTime: '2026-07-20',
          status: 'in_progress',
          statusText: '进行中'
        },
        {
          id: 3,
          name: '质量检测',
          description: '产品质量检测',
          startTime: '2026-07-15',
          endTime: '2026-07-25',
          status: 'pending',
          statusText: '待处理'
        }
      ]
    },
    showAddTaskModal() {
      this.newTask = {
        name: '',
        description: '',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date().toISOString().slice(0, 16)
      }
      this.showTaskModal = true
    },
    closeTaskModal() {
      this.showTaskModal = false
    },
    addTask() {
      if (!this.newTask.name) {
        uni.showToast({ title: '请输入任务名称', icon: 'none' })
        return
      }
      
      const task = {
        name: this.newTask.name,
        description: this.newTask.description,
        startTime: this.newTask.startTime,
        endTime: this.newTask.endTime,
        status: 'pending',
        statusText: '待处理'
      }
      
      this.productionTasks.push(task)
      uni.setStorageSync('productionTasks', this.productionTasks)
      this.closeTaskModal()
      
      uni.showToast({ title: '任务添加成功', icon: 'success' })
    },
    updateTaskStatus(task, index) {
      if (task.status === 'pending') {
        task.status = 'in_progress'
        task.statusText = '进行中'
      } else if (task.status === 'in_progress') {
        task.status = 'completed'
        task.statusText = '已完成'
      } else {
        task.status = 'pending'
        task.statusText = '待处理'
      }
      
      this.productionTasks[index] = task
      uni.setStorageSync('productionTasks', this.productionTasks)
      
      uni.showToast({ title: '状态更新成功', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.efficiency-tools-container {
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
  margin-bottom: 20rpx;
  display: block;
}

.section-subtitle {
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 24rpx;
  display: block;
}

.content-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 32rpx;
  display: block;
}

/* 工具概览 */
.overview-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.tool-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.tool-card {
  background: #f9f9f9;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.tool-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  display: block;
}

.tool-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.tool-desc {
  font-size: 18rpx;
  color: #666;
  display: block;
}

/* 工具内容 */
.tool-content {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 记账表单 */
.accounting-form {
  margin-bottom: 32rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.form-input {
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 22rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-textarea {
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 22rpx;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx;
  resize: vertical;
}

.picker-display {
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 22rpx;
  background-color: white;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 24rpx;
  font-size: 24rpx;
  font-weight: 600;
  width: 100%;
  margin-top: 16rpx;
}

/* 费用记录 */
.expense-list {
  margin-bottom: 32rpx;
}

.list-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.empty-list {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 20rpx;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  border: 1rpx solid #e0e0e0;
}

.expense-info {
  flex: 1;
}

.expense-type {
  font-size: 22rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
  display: block;
}

.expense-date {
  font-size: 18rpx;
  color: #999;
  margin-bottom: 4rpx;
  display: block;
}

.expense-note {
  font-size: 18rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.expense-amount {
  font-size: 24rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 20rpx;
}

/* 费用统计 */
.expense-stats {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

.stats-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.stats-item {
  background: white;
  border-radius: 8rpx;
  padding: 20rpx;
  text-align: center;
  border: 1rpx solid #e0e0e0;
}

.stats-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
  display: block;
}

.stats-label {
  font-size: 18rpx;
  color: #666;
  display: block;
}

/* 生产任务 */
.production-section {
  margin-bottom: 32rpx;
}

.task-list {
  margin-bottom: 24rpx;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  border-left: 8rpx solid #e0e0e0;
}

.task-item.pending {
  border-left-color: #faad14;
}

.task-item.in_progress {
  border-left-color: #1890ff;
}

.task-item.completed {
  border-left-color: #52c41a;
}

.task-info {
  flex: 1;
  margin-right: 20rpx;
}

.task-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.task-desc {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.4;
}

.task-time {
  font-size: 18rpx;
  color: #999;
  display: block;
}

.task-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12rpx;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 16rpx;
  font-weight: 600;
}

.task-item.pending .status-badge {
  background: #fff7e6;
  color: #faad14;
}

.task-item.in_progress .status-badge {
  background: #e6f7ff;
  color: #1890ff;
}

.task-item.completed .status-badge {
  background: #f6ffed;
  color: #52c41a;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  background: #667eea;
  color: white;
}

.add-task-btn {
  width: 100%;
  padding: 20rpx;
  border: 2rpx dashed #667eea;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #667eea;
  background: white;
  font-weight: 600;
}

/* 生产统计 */
.production-stats {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

/* 数据看板 */
.key-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.metric-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  color: white;
}

.metric-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
  display: block;
}

.metric-value {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: block;
}

.metric-label {
  font-size: 18rpx;
  opacity: 0.9;
  display: block;
}

/* 趋势图表 */
.trend-section {
  margin-bottom: 32rpx;
}

.trend-chart {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  height: 200rpx;
  margin-bottom: 16rpx;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx 8rpx 0 0;
  position: relative;
  transition: height 0.3s ease;
}

.bar-value {
  position: absolute;
  top: -28rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16rpx;
  font-weight: bold;
  color: #333;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.chart-label {
  flex: 1;
  font-size: 16rpx;
  color: #666;
  text-align: center;
}

/* 工人分布 */
.distribution-section {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
}

.distribution-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24rpx;
}

.distribution-item {
  background: white;
  border-radius: 8rpx;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
}

.distribution-label {
  font-size: 20rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.distribution-chart {
  display: flex;
  height: 40rpx;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.pie-slice {
  height: 100%;
  transition: width 0.3s ease;
}

.pie-slice.male {
  background: #667eea;
}

.pie-slice.female {
  background: #f06292;
}

.distribution-text {
  font-size: 18rpx;
  color: #666;
  text-align: center;
  display: block;
}

.age-distribution {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  height: 120rpx;
}

.age-bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx 8rpx 0 0;
  position: relative;
  transition: height 0.3s ease;
}

.age-label {
  position: absolute;
  bottom: -24rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14rpx;
  color: #666;
  white-space: nowrap;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 90%;
  max-width: 500rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 32rpx;
  display: block;
}

.modal-form {
  margin-bottom: 32rpx;
}

.modal-buttons {
  display: flex;
  gap: 16rpx;
}

.cancel-btn {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #666;
  background: white;
}

.confirm-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>