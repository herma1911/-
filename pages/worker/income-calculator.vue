<template>
  <view class="income-calculator-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">计件收入测算</text>
      <view class="placeholder"></view>
    </view>

    <!-- 核心内容区 -->
    <view class="content">
      <!-- 基础信息预设区 -->
      <view class="basic-info-section">
        <view class="form-group">
          <text class="form-label">本次测试件数</text>
          <input type="number" v-model="formData.quantity" class="form-input" placeholder="请输入测试件数" min="1" max="999" />
          <text class="form-hint">建议测10-20件，结果更贴合真实生产状态</text>
        </view>
        <view class="form-group">
          <text class="form-label">本工序单件工价</text>
          <input type="number" v-model="formData.unitPrice" class="form-input" placeholder="请输入单件工价" step="0.1" min="0" />
          <text class="form-hint">提前填好，测算结束自动算收入</text>
        </view>
      </view>

      <!-- 计时器核心区 -->
      <view class="timer-section">
        <view class="timer-display">
          <text class="time-text">{{ formattedTime }}</text>
        </view>
        <view class="timer-buttons">
          <button class="timer-btn primary-btn" :class="{ 'active': isRunning }" @tap="toggleStopwatch">
            {{ isRunning ? '暂停计时' : '开始计时' }}
          </button>
          <button class="timer-btn secondary-btn" v-if="isRunning" @tap="endCalculation">
            结束测算
          </button>
          <button class="timer-btn reset-btn" @tap="resetStopwatch">
            重置
          </button>
        </view>
      </view>

      <!-- 测算结果自动生成区 -->
      <view v-if="showResult" class="result-section">
        <view class="result-header">
          <text class="result-title">测算结果</text>
        </view>
        <view class="result-content">
          <view class="result-row">
            <text class="result-label">本次测试总件数</text>
            <text class="result-value">{{ formData.quantity }}件</text>
          </view>
          <view class="result-row">
            <text class="result-label">实际总耗时</text>
            <text class="result-value">{{ formattedTotalTime }}</text>
          </view>
          <view class="result-row">
            <text class="result-label">单件平均耗时</text>
            <text class="result-value">{{ averagePieceTime }}分钟/件</text>
          </view>
          <view class="result-row">
            <text class="result-label">每日计划工作时长</text>
            <input type="number" v-model="formData.workHours" class="result-input" min="1" max="16" />
            <text class="result-unit">小时</text>
          </view>
          <view class="result-row">
            <text class="result-label">单日预估可做数量</text>
            <text class="result-value">{{ dailyCapacity }}件</text>
          </view>
          <view class="result-row highlight">
            <text class="result-label">单日预估总收入</text>
            <text class="result-value income-value">¥{{ dailyIncome.toFixed(2) }}</text>
          </view>
          <view class="result-row">
            <text class="result-label">月度预估总收入</text>
            <text class="result-value">¥{{ monthlyIncome.toFixed(2) }}</text>
          </view>
        </view>
        <!-- 数据沉淀&动作引导区 -->
        <view class="action-buttons-section">
          <button class="action-btn primary" @tap="saveTestRecord">保存到技能档案</button>
          <button class="action-btn secondary" @tap="learnSkills">学技巧提手速</button>
          <button v-if="hasBoundFactory" class="action-btn factory-sync" @tap="syncToFactory">同步给我的工厂</button>
        </view>
      </view>

      <!-- 测算核心原理区 -->
      <view class="principle-section">
        <text class="section-title">测算核心原理</text>
        <view class="principle-content">
          <text class="principle-text">1. 先测你连续做一批货的总用时，系统自动算出做1件货的平均耗时，比单件计时更贴合真实生产状态</text>
          <text class="principle-text">2. 结合你每天实际上班的时长，自动算出你一天稳定能做多少件货</text>
          <text class="principle-text">3. 再按这个工序的单件工价，精准算出你单日、月度能赚多少钱</text>
          <text class="principle-text">4. 每次测算结果都会自动保存到你的个人技能档案，随时可查、可手动删除</text>
        </view>
      </view>

      <!-- 手速学习曲线指南区 -->
      <view class="learning-curve-section">
        <text class="section-title">手速学习曲线指南</text>
        <view class="curve-content">
          <text class="curve-subtitle">什么是手速学习曲线？</text>
          <text class="curve-text">就是你刚上手一个新工序，通过多次固定标准的测算，能清晰看到自己的单件耗时越来越短、预估收入越来越高的成长过程，系统自动生成你的手速成长曲线，越测越清楚自己的赚钱能力。</text>
          
          <text class="curve-subtitle">标准测试建议</text>
          <text class="curve-text">- 新工序上手第1天：测3次，取平均值，记录初始手速和基础收入</text>
          <text class="curve-text">- 上手第3天：测2次，查看手速提升幅度，更新收入预估</text>
          <text class="curve-text">- 上手第7天：测2次，锁定熟练后的稳定手速，算出长期稳定收入</text>
          <text class="curve-text">- 注意：每次测试用同样的工序、同样的面料、同样的操作环境，结果更具参考性</text>
          
          <text class="curve-subtitle">学习曲线的核心用处</text>
          <text class="curve-text">1. 清晰看到自己的成长进度，知道练多久能达到满产收入，心里有底</text>
          <text class="curve-text">2. 找工作谈工价时，可直接把测试记录、成长曲线给工厂看，实打实证明自己的手速和产能，更容易谈高薪</text>
          <text class="curve-text">3. 系统会根据你的稳定手速和成长曲线，给你优先推荐匹配你能力的高薪工序岗位</text>
          <text class="curve-text">4. 自动对比同工序同城市工人的平均手速，告诉你在行业里的水平</text>
        </view>
      </view>

      <!-- 产能兑现能力评估区 -->
      <view class="capacity-evaluation-section">
        <text class="section-title">产能兑现能力评估</text>
        <view class="evaluation-content">
          <text class="evaluation-text">系统会自动对比你测算的预估产能，和你在APP里实际记账的真实产出，算出你的「产能兑现率」，给你精准评估：</text>
          <text class="evaluation-text">- 兑现率＞95%：产能拉满标杆，手速稳、出勤足，是工厂抢着要的熟练工，高薪岗位优先推送</text>
          <text class="evaluation-text">- 兑现率85%-95%：产能达标，状态稳定，还有小幅提升空间</text>
          <text class="evaluation-text">- 兑现率＜85%：产能未达预期，系统会帮你分析是出勤不足、还是实际操作有优化空间，找准提升方向</text>
          <text class="evaluation-note">注：兑现率按你最近一次的稳定测试结果计算，测试次数越多、记工数据越全，评估越精准。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isRunning: false,
      isPaused: false,
      startTime: 0,
      elapsedTime: 0,
      timer: null,
      showResult: false,
      hasBoundFactory: false,
      formData: {
        quantity: 10,
        unitPrice: 0,
        workHours: 10
      },
      testRecords: []
    }
  },
  computed: {
    formattedTime() {
      const totalSeconds = Math.floor(this.elapsedTime / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    formattedTotalTime() {
      const totalSeconds = Math.floor(this.elapsedTime / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      let result = ''
      if (hours > 0) result += `${hours}小时`
      if (minutes > 0) result += `${minutes}分钟`
      if (seconds > 0 || result === '') result += `${seconds}秒`
      return result
    },
    averagePieceTime() {
      if (this.formData.quantity > 0) {
        const totalMinutes = this.elapsedTime / 1000 / 60
        return (totalMinutes / this.formData.quantity).toFixed(2)
      }
      return '0.00'
    },
    dailyCapacity() {
      if (this.formData.quantity > 0 && this.formData.workHours > 0) {
        const totalMinutes = this.elapsedTime / 1000 / 60
        const pieceMinutes = totalMinutes / this.formData.quantity
        const dailyMinutes = this.formData.workHours * 60
        return Math.floor(dailyMinutes / pieceMinutes)
      }
      return 0
    },
    dailyIncome() {
      return this.dailyCapacity * this.formData.unitPrice
    },
    monthlyIncome() {
      return this.dailyIncome * 26
    }
  },
  onLoad() {
    // 加载现有测试记录
    this.testRecords = uni.getStorageSync('testRecords') || []
    // 检查用户是否绑定了工厂
    this.checkBoundFactory()
  },
  methods: {
    // 检查用户是否绑定了工厂
    checkBoundFactory() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      const boundCompany = userInfo.boundCompany || uni.getStorageSync('boundCompany') || null
      this.hasBoundFactory = boundCompany !== null
    },
    toggleStopwatch() {
      if (this.isRunning) {
        // 暂停计时
        clearInterval(this.timer)
        this.isRunning = false
        this.isPaused = true
      } else {
        // 开始或继续计时
        this.startTime = Date.now() - this.elapsedTime
        this.timer = setInterval(() => {
          this.elapsedTime = Date.now() - this.startTime
        }, 1000) // 每秒更新一次，去掉毫秒
        this.isRunning = true
        this.isPaused = false
        this.showResult = false
      }
    },
    endCalculation() {
      // 结束测算
      clearInterval(this.timer)
      this.isRunning = false
      this.isPaused = false
      this.showResult = true
      // 自动记录测试结果
      this.saveTestRecord()
    },
    // 保存测试记录
    saveTestRecord() {
      if (this.formData.quantity > 0) {
        const record = {
          id: Date.now(),
          quantity: this.formData.quantity,
          unitPrice: this.formData.unitPrice,
          totalTime: this.elapsedTime,
          averagePieceTime: parseFloat(this.averagePieceTime),
          workHours: this.formData.workHours,
          dailyCapacity: this.dailyCapacity,
          dailyIncome: this.dailyIncome,
          monthlyIncome: this.monthlyIncome,
          timestamp: new Date().toISOString()
        }
        
        // 从本地存储加载现有记录
        const existingRecords = uni.getStorageSync('testRecords') || []
        // 添加新记录
        existingRecords.push(record)
        // 保存回本地存储
        uni.setStorageSync('testRecords', existingRecords)
        
        // 更新本地测试记录数组
        this.testRecords = existingRecords
        
        // 提示用户记录已保存
        uni.showToast({
          title: '测试记录已保存',
          icon: 'success'
        })
      }
    },
    // 学技巧提手速
    learnSkills() {
      uni.navigateTo({
        url: '/pages/worker/income-boost'
      })
    },
    // 同步给工厂
    syncToFactory() {
      uni.showModal({
        title: '同步给工厂',
        content: '是否将本次测算结果同步给绑定工厂？',
        success: (res) => {
          if (res.confirm) {
            // 模拟同步到工厂
            const syncData = {
              pieceTime: this.averagePieceTime,
              standardTime: this.averagePieceTime, // 这里可以根据实际情况设置标准工时
              estimatedCapacity: this.dailyCapacity
            }
            console.log('同步给工厂的数据:', syncData)
            
            // 模拟同步成功
            uni.showToast({
              title: '同步成功',
              icon: 'success'
            })
          }
        }
      })
    },
    resetStopwatch() {
      clearInterval(this.timer)
      this.isRunning = false
      this.isPaused = false
      this.elapsedTime = 0
      this.showResult = false
      this.formData = {
        quantity: 10,
        unitPrice: 0,
        workHours: 10
      }
    },

    goBack() {
      uni.navigateBack()
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.income-calculator-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 80rpx;
}

.content {
  padding: 30rpx;
}

/* 基础信息预设区 */
.basic-info-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 32rpx;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.form-hint {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
  line-height: 1.4;
}

/* 计时器核心区 */
.timer-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.timer-display {
  margin-bottom: 50rpx;
}

.time-text {
  font-size: 80rpx;
  font-weight: bold;
  color: #333;
  font-family: monospace;
  letter-spacing: 4rpx;
}

.timer-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20rpx;
}

.timer-btn {
  padding: 25rpx 45rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  min-width: 180rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timer-btn.primary-btn {
  background-color: #1890ff;
  color: #fff;
}

.timer-btn.primary-btn.active {
  background-color: #ff4d4f;
}

.timer-btn.secondary-btn {
  background-color: #fa8c16;
  color: #fff;
}

.timer-btn.reset-btn {
  background-color: #f0f0f0;
  color: #333;
  margin-top: 20rpx;
  width: 100%;
  max-width: 380rpx;
}

/* 测算结果自动生成区 */
.result-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.result-header {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.result-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-row.highlight {
  background-color: #f6ffed;
  padding: 25rpx;
  border-radius: 12rpx;
  margin: 10rpx 0;
  border: none;
}

.result-label {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: right;
}

.result-value.income-value {
  color: #f5222d;
  font-size: 40rpx;
}

.result-input {
  flex: 1;
  padding: 15rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 28rpx;
  text-align: center;
  margin: 0 10rpx;
  background-color: #f9f9f9;
}

.result-unit {
  font-size: 28rpx;
  color: #666;
  margin-left: 10rpx;
}

/* 测算核心原理区 */
.principle-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 25rpx;
  display: block;
}

.principle-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.principle-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

/* 手速学习曲线指南区 */
.learning-curve-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.curve-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.curve-subtitle {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-top: 10rpx;
  display: block;
}

.curve-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

/* 产能兑现能力评估区 */
.capacity-evaluation-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.evaluation-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.evaluation-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.evaluation-note {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
  margin-top: 10rpx;
  display: block;
  font-style: italic;
}

/* 动作按钮区域 */
.action-buttons-section {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-top: 30rpx;
  border-top: 2rpx solid #f0f0f0;
}

.action-btn {
  padding: 25rpx;
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

.action-btn.factory-sync {
  background-color: #fa8c16;
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .timer-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .timer-btn {
    width: 100%;
    max-width: 300rpx;
  }
  
  .result-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10rpx;
  }
  
  .result-value {
    text-align: left;
    width: 100%;
  }
  
  .result-input {
    width: 100%;
    margin: 10rpx 0;
  }
  
  .action-buttons-section {
    gap: 15rpx;
  }
  
  .action-btn {
    padding: 20rpx;
    font-size: 26rpx;
  }
}
</style>