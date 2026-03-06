<template>
  <view class="smart-scheduling-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-left">
        <text class="back-icon" @click="navigateBack">←</text>
        <text class="page-title">智能排产</text>
        <text class="free-tag">限时免费至2026.12.31</text>
      </view>
      <view class="nav-right">
        <view class="nav-item" @click="shareRecruitment">
          <text class="nav-icon">📤</text>
          <text class="nav-text">分享招工</text>
        </view>
      </view>
    </view>

    <!-- 甘特图区域 -->
    <view class="gantt-chart-section">
      <!-- 流水线平衡率 -->
      <view class="balance-rate-section">
        <text class="balance-rate-label">流水线平衡率</text>
        <text class="balance-rate-value">{{balanceRate}}%</text>
        <view class="balance-rate-bar">
          <view class="balance-rate-fill" :style="{ width: balanceRate + '%' }"></view>
        </view>
      </view>

      <!-- 甘特图 -->
      <view class="gantt-chart">
        <view class="gantt-header">
          <view class="time-axis">
            <text class="time-label" v-for="hour in 24" :key="hour">{{hour}}h</text>
          </view>
        </view>
        <view class="gantt-body">
          <view class="process-row" v-for="(process, index) in processes" :key="index">
            <view class="process-info">
              <view class="process-header" @click="toggleSubProcesses(index)">
                <text class="process-name">{{process.name}}</text>
                <text class="expand-icon">{{process.isExpanded ? '▼' : '▶'}}</text>
              </view>
              <view class="process-details">
                <text>设备: {{process.equipment}} | 人数: {{process.workers}}</text>
                <view class="worker-adjustment">
                  <button class="adjust-btn minus" @click="adjustWorkers(index, -1)">-</button>
                  <button class="adjust-btn plus" @click="adjustWorkers(index, 1)">+</button>
                </view>
              </view>
              <text class="process-gsd">GSD参考工时: {{process.gsd}}min</text>
              
              <!-- 子工序列表 -->
              <view v-if="process.subProcesses && process.isExpanded" class="sub-processes">
                <view class="sub-process" v-for="(subProcess, subIndex) in process.subProcesses" :key="subIndex">
                  <text class="sub-process-name">{{subProcess.stage}}: {{subProcess.name}}</text>
                  <text class="sub-process-details">设备: {{subProcess.equipment}} | 人数: {{subProcess.workers}} | GSD: {{subProcess.gsd}}min</text>
                  <text class="sub-process-metrics">单人日产: {{subProcess.dailyOutput}} | 利用率: {{subProcess.utilization}}% | 节拍: {{subProcess.beat}}min{{subProcess.isBottleneck ? ' ⚠️' : ''}}{{subProcess.isMainBottleneck ? ' (主瓶颈)' : ''}}</text>
                </view>
              </view>
            </view>
            <view class="process-bar-container">
              <view 
                class="process-bar" 
                :class="{ 'warning': process.isWarning }"
                :style="{ 
                  left: process.startTime * 40 + 'rpx', 
                  width: (process.endTime - process.startTime) * 40 + 'rpx' 
                }"
                @touchstart="startDrag(index, $event)"
                @touchmove="drag(index, $event)"
                @touchend="endDrag"
              >
                <text class="process-bar-text">单人日产: {{process.dailyOutput}}</text>
                <text class="process-bar-utilization">利用率: {{process.utilization}}%</text>
              </view>
              <!-- 虚线箭头连接工序 -->
              <view v-if="index < processes.length - 1" class="process-connector"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 人员管理区域 -->
    <view class="worker-management-section">
      <text class="section-title">人员管理</text>
      <view class="worker-pool">
        <text class="pool-title">班组人员库</text>
        <view class="worker-list">
          <view 
            class="worker-item" 
            v-for="worker in workers" 
            :key="worker.id"
            @click="selectWorker(worker)"
          >
            <text class="worker-name">{{worker.name}}</text>
            <view class="skill-tags">
              <text class="skill-tag" v-for="skill in worker.skills" :key="skill">{{skill}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据处理区域 -->
    <view class="data-processing-section">
      <text class="section-title">数据处理</text>
      <view class="data-inputs">
        <view class="input-group">
          <text class="input-label">单人日产</text>
          <input 
            type="number" 
            class="input-field" 
            v-model="dailyOutput"
            placeholder="手动输入单人日产"
          />
        </view>
        <view class="input-group">
          <text class="input-label">经验库数据</text>
          <button class="btn" @click="fetchFromExperience">从经验库调用</button>
        </view>
      </view>
    </view>

    <!-- 日志功能区域 -->
    <view class="log-section">
      <text class="section-title">排产日志</text>
      <view class="log-list">
        <view class="log-item" v-for="(log, index) in logs" :key="index">
          <text class="log-date">{{log.date}}</text>
          <text class="log-content">平衡率: {{log.balanceRate}}% | 产能: {{log.output}} | 利用率: {{log.utilization}}%</text>
        </view>
      </view>
    </view>

    <!-- 缺人联动弹窗 -->
    <view v-if="showRecruitmentPopup" class="recruitment-popup">
      <view class="popup-content">
        <text class="popup-title">缺人提醒</text>
        <text class="popup-message">该工序无匹配技能人员</text>
        <button class="btn primary-btn" @click="applyRecruitment">申请招聘</button>
        <button class="btn secondary-btn" @click="closeRecruitmentPopup">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 平衡率
      balanceRate: 85,
      // 工序列表
      processes: [
        {
          name: '裁剪',
          equipment: '裁剪机',
          workers: 2,
          gsd: 15,
          dailyOutput: 100,
          utilization: 90,
          startTime: 0,
          endTime: 4,
          isWarning: false
        },
        {
          name: '缝制',
          equipment: '缝纫机',
          workers: 4,
          gsd: 25,
          dailyOutput: 54,
          utilization: 90,
          startTime: 2,
          endTime: 8,
          isWarning: false,
          subProcesses: [
            {
              name: '裁片检验与整理',
              equipment: '工作台、放大镜',
              workers: 1,
              gsd: 2,
              dailyOutput: 216,
              utilization: 90,
              beat: 2.0,
              stage: '前处理'
            },
            {
              name: '肩缝与侧缝缝合',
              equipment: '平缝机、包缝机',
              workers: 1,
              gsd: 6,
              dailyOutput: 72,
              utilization: 90,
              beat: 6.0,
              stage: '核心缝合'
            },
            {
              name: '领部制作与绱领',
              equipment: '平缝机、烫台',
              workers: 1,
              gsd: 7,
              dailyOutput: 61,
              utilization: 90,
              beat: 7.0,
              stage: '核心缝合',
              isBottleneck: true
            },
            {
              name: '袖部制作与绱袖',
              equipment: '平缝机、包缝机',
              workers: 1,
              gsd: 8,
              dailyOutput: 54,
              utilization: 90,
              beat: 8.0,
              stage: '核心缝合',
              isBottleneck: true,
              isMainBottleneck: true
            },
            {
              name: '锁眼/钉扣/剪线头',
              equipment: '锁眼机、剪刀',
              workers: 0,
              gsd: 3,
              dailyOutput: 0,
              utilization: 90,
              beat: 0,
              stage: '后整理'
            }
          ],
          isExpanded: false
        },
        {
          name: '熨烫',
          equipment: '熨烫机',
          workers: 2,
          gsd: 10,
          dailyOutput: 120,
          utilization: 95,
          startTime: 6,
          endTime: 10,
          isWarning: true
        },
        {
          name: '包装',
          equipment: '包装机',
          workers: 3,
          gsd: 8,
          dailyOutput: 150,
          utilization: 80,
          startTime: 8,
          endTime: 12,
          isWarning: false
        }
      ],
      // 人员列表
      workers: [
        {
          id: 1,
          name: '张三',
          skills: ['裁剪', '缝制']
        },
        {
          id: 2,
          name: '李四',
          skills: ['缝制', '熨烫']
        },
        {
          id: 3,
          name: '王五',
          skills: ['包装']
        },
        {
          id: 4,
          name: '赵六',
          skills: ['裁剪', '包装']
        }
      ],
      // 排产日志
      logs: [
        {
          date: '2026-03-06',
          balanceRate: 85,
          output: 80,
          utilization: 90
        },
        {
          date: '2026-03-05',
          balanceRate: 82,
          output: 75,
          utilization: 88
        },
        {
          date: '2026-03-04',
          balanceRate: 80,
          output: 70,
          utilization: 85
        }
      ],
      // 单人日产
      dailyOutput: '',
      // 缺人联动弹窗
      showRecruitmentPopup: false,
      // 拖动相关
      isDragging: false,
      draggedProcess: null,
      startX: 0,
      startTime: 0
    }
  },
  methods: {
    // 返回上一页
    navigateBack() {
      uni.navigateBack()
    },
    // 分享招工
    shareRecruitment() {
      // 模拟生成招工二维码
      uni.showLoading({
        title: '生成招工二维码...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        
        // 查找缺人工序
        const shortageProcesses = this.processes.filter(process => process.isWarning)
        
        // 生成招工信息
        const recruitmentInfo = {
          factoryName: '衣起赚工厂',
          shortageProcesses: shortageProcesses.map(p => ({
            name: p.name,
            requiredWorkers: p.workers + 1,
            skills: ['相关技能']
          })),
          qrCode: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20for%20recruitment&image_size=square'
        }
        
        // 显示分享弹窗
        uni.showModal({
          title: '分享招工',
          content: `工厂招工信息\n\n缺人工序: ${shortageProcesses.map(p => p.name).join(', ')}\n\n请保存二维码分享给求职者`,
          showCancel: true,
          confirmText: '保存二维码',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 模拟保存二维码
              uni.showToast({
                title: '二维码已保存',
                icon: 'success'
              })
            }
          }
        })
      }, 1000)
    },
    // 选择工人
    selectWorker(worker) {
      console.log('选择工人:', worker)
    },
    // 从经验库调用数据
    fetchFromExperience() {
      // 模拟从经验库获取数据
      uni.showLoading({
        title: '从经验库获取数据...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        
        // 模拟经验库数据
        const experienceData = {
          dailyOutput: 120,
          utilization: 85
        }
        
        // 更新界面数据
        this.dailyOutput = experienceData.dailyOutput
        
        // 更新所有工序的默认值
        this.processes.forEach(process => {
          process.dailyOutput = experienceData.dailyOutput
          process.utilization = experienceData.utilization
        })
        
        // 检查警告
        this.checkProcessWarnings()
        
        uni.showToast({
          title: '从经验库获取数据成功',
          icon: 'success'
        })
      }, 1000)
    },
    // 申请招聘
    applyRecruitment() {
      uni.navigateTo({
        url: '/pages/social/publish-recruitment'
      })
      this.showRecruitmentPopup = false
    },
    // 关闭招聘弹窗
    closeRecruitmentPopup() {
      this.showRecruitmentPopup = false
    },
    // 开始拖动
    startDrag(index, event) {
      this.isDragging = true
      this.draggedProcess = index
      this.startX = event.touches[0].clientX
      this.startTime = this.processes[index].startTime
    },
    // 拖动中
    drag(index, event) {
      if (!this.isDragging || this.draggedProcess !== index) return
      
      const deltaX = event.touches[0].clientX - this.startX
      const deltaTime = Math.round(deltaX / 40) // 每40rpx对应1小时
      
      const newStartTime = Math.max(0, this.startTime + deltaTime)
      const duration = this.processes[index].endTime - this.processes[index].startTime
      const newEndTime = newStartTime + duration
      
      // 更新工序时间
      this.processes[index].startTime = newStartTime
      this.processes[index].endTime = newEndTime
      
      // 检查是否需要标红警告
      this.checkProcessWarnings()
    },
    // 结束拖动
    endDrag() {
      this.isDragging = false
      this.draggedProcess = null
    },
    // 检查工序警告
    checkProcessWarnings() {
      for (let i = 1; i < this.processes.length; i++) {
        const currentProcess = this.processes[i]
        const previousProcess = this.processes[i - 1]
        
        // 检查后道产能是否低于前道20%
        if (currentProcess.dailyOutput < previousProcess.dailyOutput * 0.8) {
          currentProcess.isWarning = true
        } else {
          currentProcess.isWarning = false
        }
      }
    },
    // 调整人数
    adjustWorkers(index, delta) {
      const newWorkers = this.processes[index].workers + delta
      if (newWorkers >= 1) {
        this.processes[index].workers = newWorkers
        // 更新单人日产和利用率
        this.updateProcessData(index)
      }
    },
    // 更新工序数据
    updateProcessData(index) {
      const process = this.processes[index]
      // 根据人数调整单人日产和利用率
      process.dailyOutput = Math.round(100 * (1 + (process.workers - 2) * 0.1))
      process.utilization = Math.min(100, Math.round(80 + (process.workers - 2) * 5))
      // 检查警告
      this.checkProcessWarnings()
    },
    // 切换子工序展开/折叠
    toggleSubProcesses(index) {
      if (this.processes[index].subProcesses) {
        this.processes[index].isExpanded = !this.processes[index].isExpanded
      }
    }
  }
}
</script>

<style scoped>
.smart-scheduling-container {
  padding: 120rpx 0 0 0;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  height: 80rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.back-icon {
  font-size: 36rpx;
  color: white;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.free-tag {
  font-size: 20rpx;
  color: #FFD700;
  background-color: rgba(255, 215, 0, 0.2);
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

.nav-icon {
  font-size: 24rpx;
  color: white;
}

.nav-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
}

/* 甘特图区域 */
.gantt-chart-section {
  padding: 24rpx;
  background-color: white;
  margin: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 平衡率区域 */
.balance-rate-section {
  margin-bottom: 32rpx;
}

.balance-rate-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.balance-rate-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 16rpx;
  display: block;
}

.balance-rate-bar {
  width: 100%;
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.balance-rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

/* 甘特图 */
.gantt-chart {
  position: relative;
  overflow-x: auto;
}

.gantt-header {
  margin-bottom: 16rpx;
}

.time-axis {
  display: flex;
  gap: 40rpx;
  padding-left: 200rpx;
}

.time-label {
  font-size: 20rpx;
  color: #666;
  width: 40rpx;
  text-align: center;
}

.gantt-body {
  position: relative;
}

.process-row {
  display: flex;
  margin-bottom: 32rpx;
  position: relative;
}

.process-info {
  width: 200rpx;
  padding-right: 16rpx;
  box-sizing: border-box;
}

.process-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.process-details {
  font-size: 20rpx;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rpx;
}

.worker-adjustment {
  display: flex;
  gap: 8rpx;
}

.adjust-btn {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 1rpx solid #667eea;
  background-color: white;
  color: #667eea;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.adjust-btn.minus {
  font-size: 32rpx;
  line-height: 32rpx;
}

.adjust-btn.plus {
  font-size: 24rpx;
  line-height: 32rpx;
}

.process-gsd {
  font-size: 18rpx;
  color: #999;
  display: block;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.expand-icon {
  font-size: 24rpx;
  color: #667eea;
  cursor: pointer;
}

.sub-processes {
  margin-top: 16rpx;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-left: 16rpx;
}

.sub-process {
  margin-bottom: 12rpx;
  padding: 12rpx;
  background-color: white;
  border-radius: 6rpx;
  border-left: 4rpx solid #667eea;
}

.sub-process:last-child {
  margin-bottom: 0;
}

.sub-process-name {
  font-size: 22rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.sub-process-details {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.sub-process-metrics {
  font-size: 18rpx;
  color: #999;
  display: block;
}

.process-bar-container {
  flex: 1;
  position: relative;
  height: 60rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.process-bar {
  position: absolute;
  height: 48rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 12rpx;
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
  cursor: move;
}

.process-bar.warning {
  background: linear-gradient(135deg, #FF5252 0%, #FF7043 100%);
  box-shadow: 0 2rpx 8rpx rgba(255, 82, 82, 0.3);
}

.process-bar-text {
  font-size: 20rpx;
  font-weight: 500;
}

.process-bar-utilization {
  font-size: 18rpx;
  opacity: 0.8;
}

.process-connector {
  position: absolute;
  top: 24rpx;
  right: -40rpx;
  width: 40rpx;
  height: 1rpx;
  background-color: #999;
  background-image: linear-gradient(to right, #999 50%, transparent 50%);
  background-size: 8rpx 1rpx;
}

/* 人员管理区域 */
.worker-management-section {
  padding: 24rpx;
  background-color: white;
  margin: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.worker-pool {
  margin-bottom: 24rpx;
}

.pool-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.worker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.worker-item {
  background-color: #f5f5f5;
  padding: 16rpx;
  border-radius: 12rpx;
  min-width: 160rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.worker-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.worker-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.skill-tag {
  font-size: 18rpx;
  color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}

/* 数据处理区域 */
.data-processing-section {
  padding: 24rpx;
  background-color: white;
  margin: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.data-inputs {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.input-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
}

.input-field {
  padding: 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.btn {
  padding: 16rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

/* 日志功能区域 */
.log-section {
  padding: 24rpx;
  background-color: white;
  margin: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.log-item {
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.log-date {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.log-content {
  font-size: 20rpx;
  color: #333;
  display: block;
}

/* 缺人联动弹窗 */
.recruitment-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 32rpx;
  border-radius: 16rpx;
  width: 80%;
  max-width: 500rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  align-items: center;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-message {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.secondary-btn {
  background-color: #f5f5f5;
  color: #333;
  width: 100%;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
</style>