<template>
  <view class="home-page">

    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="user-avatar" @tap="goToPersonal">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" class="avatar-image"></image>
        <text v-else class="avatar-icon">👤</text>
      </view>
      <text class="slogan">好工、好账、好收入·衣起赚</text>
      <text class="history-btn" @tap="goToHistory">记工历史</text>
    </view>
    
    <!-- 核心视觉区：双数据卡片 -->
    <view class="dual-card-section">
      <!-- 左侧本月预计卡片 -->
      <view class="monthly-card expected-card" @tap="goToRecord">
        <text class="card-label">本月预计</text>
        <text class="card-value">¥{{ monthlyIncome - monthlyExpense }}</text>
        <text class="card-sub">未结算，实时更新</text>
        <text class="card-detail">总收入¥{{ monthlyIncome }} - 总支出¥{{ monthlyExpense }}</text>
      </view>
      <!-- 中间分隔线 -->
      <view class="card-divider"></view>
      <!-- 右侧上月实际卡片 -->
      <view class="monthly-card actual-card" @tap="goToRecord">
        <text class="card-label">上月实际</text>
        <text class="card-value">¥{{ lastMonthNetIncome }}</text>
        <text class="card-sub">已结算，工资到账</text>
        <text class="card-detail">总收入¥{{ lastMonthIncome }} - 总支出¥{{ lastMonthExpense }}</text>
      </view>
    </view>
    
    <!-- 核心操作大按钮区 -->
    <view class="core-action-section">
      <view class="action-btn green-btn" @tap="goToPiecework">
        <text class="btn-icon">📝</text>
        <text class="btn-text">记计件</text>
      </view>
      <view class="action-btn outline-green-btn" @tap="goToHourly">
        <text class="btn-icon">⏱️</text>
        <text class="btn-text">记计时</text>
      </view>
      <view class="action-btn orange-btn" @tap="goToExpense">
        <text class="btn-icon">💰</text>
        <text class="btn-text">记支出</text>
      </view>
      <view class="action-btn gold-btn" @tap="goToPrivilege">
        <text class="btn-icon">🏆</text>
        <text class="btn-text">我的特权</text>
      </view>
    </view>
    
    <!-- 账本入口 -->
    <view class="ledger-entry-section">
      <view class="ledger-entry-card" @tap="goToPersonalLedger">
        <text class="ledger-icon">📝</text>
        <text class="ledger-title">个人账本</text>
        <text class="ledger-desc">私人记工册·随手记</text>
      </view>
      <view class="ledger-entry-card" @tap="goToWechatLedger">
        <text class="ledger-icon">💬</text>
        <text class="ledger-title">微信确认账本</text>
        <text class="ledger-desc">对账结算本·官方凭证</text>
      </view>
    </view>
    
    <!-- 日期筛选区 -->
    <view class="date-filter-section">
      <view class="date-btn" @tap="showDatePicker">选择日期范围</view>
      <view class="date-selector">
        <text>全部时间</text>
        <text class="arrow">▼</text>
      </view>
    </view>
    
    <!-- 优化后的日历模块 -->
    <view class="calendar-section">
      <view class="calendar-header">
        <text class="calendar-title">{{ currentYear }}年 {{ currentMonth }}月</text>
        <text class="calendar-stats">本月已记工：{{ checkinDays }}天 | 连续记工：{{ continuousDays }}天</text>
      </view>
      
      <!-- 星期标题 -->
      <view class="week-row">
        <text class="week-day">日</text>
        <text class="week-day">一</text>
        <text class="week-day">二</text>
        <text class="week-day">三</text>
        <text class="week-day">四</text>
        <text class="week-day">五</text>
        <text class="week-day">六</text>
      </view>
      
      <!-- 日历网格 -->
      <view class="calendar-grid">
        <view 
          v-for="day in calendarDays" 
          :key="day.date"
          :class="[
            'calendar-day',
            { 
              'empty-day': !day.date, 
              'today': day.isToday, 
              'sunday': day.isSunday, 
              'has-checkin': day.hasCheckin,
              'continuous': day.isContinuous
            }
          ]"
          @tap="handleDayTap(day)"
        >
          <text class="day-number">{{ day.date || '' }}</text>
          <text v-if="day.isSunday" class="day-icon">😴</text>
          <text v-else-if="day.hasCheckin" class="day-icon">✅</text>
          <text v-else-if="day.isContinuous" class="day-icon">🔥</text>
        </view>
      </view>
    </view>
    
    <!-- 底部固定操作栏 -->
    <view class="bottom-action-bar">
      <view class="action-btn" @tap="goToHome">
        <text class="btn-icon">🏠</text>
        <text class="btn-text">首页</text>
      </view>
      <view class="action-btn" @tap="goToJob">
        <text class="btn-icon">🔍</text>
        <text class="btn-text">找工作</text>
      </view>
      <view class="action-btn" @tap="goToMessage">
        <text class="btn-icon">💬</text>
        <text class="btn-text">消息</text>
      </view>
      <view class="action-btn" @tap="goToMy">
        <text class="btn-icon">👤</text>
        <text class="btn-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        username: '',
        role: '个人',
        avatar: ''
      },
      // 模拟数据
      monthlyIncome: 10800,
      monthlyExpense: 2300,
      continuousDays: 15,
      todayExpensed: 150,
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      checkinDays: 12,
      calendarDays: [],
      // 上月数据
      lastMonthIncome: 9600,
      lastMonthExpense: 2100,
      lastMonthNetIncome: 7500
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.generateCalendar()
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      this.userInfo = {
        username: '',
        role: '个人',
        avatar: userInfo.avatar || userInfo.wechatInfo?.avatar || '',
        nickname: userInfo.nickname || userInfo.wechatInfo?.nickname || '',
        status: '',
        ...userInfo
      }
    },
    // 生成日历数据
    generateCalendar() {
      const year = this.currentYear
      const month = this.currentMonth
      const daysInMonth = new Date(year, month, 0).getDate()
      const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
      const today = new Date()
      const todayDate = today.getDate()
      const todayMonth = today.getMonth() + 1
      const todayYear = today.getFullYear()
      
      const days = []
      
      // 添加上个月的占位日期
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ date: null, isToday: false, isSunday: false, hasCheckin: false, isContinuous: false })
      }
      
      // 添加当月日期
      for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === todayDate && month === todayMonth && year === todayYear
        const isSunday = new Date(year, month - 1, i).getDay() === 0
        const hasCheckin = [1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21].includes(i)
        const isContinuous = [7, 8, 14, 15].includes(i)
        
        days.push({
          date: i,
          isToday,
          isSunday,
          hasCheckin,
          isContinuous
        })
      }
      
      this.calendarDays = days
    },
    
    // 页面跳转方法
    goToPersonal() {
      uni.navigateTo({ url: './my-page' })
    },
    goToHistory() {
      uni.navigateTo({ url: './wage-history' })
    },
    goToRecord() {
      uni.navigateTo({ url: './wage-history?type=monthly' })
    },
    goToExpense() {
      uni.navigateTo({ url: '../finance/expense-input' })
    },
    goToPiecework() {
      uni.navigateTo({ url: './piece-rate' })
    },
    goToHourly() {
      uni.navigateTo({ url: './simple-piece-rate?tab=time' })
    },
    goToPrivilege() {
      uni.navigateTo({ url: './growth-center' })
    },
    
    // 显示日期选择器
    showDatePicker() {
      uni.datePicker({
        start: '2023-01-01',
        end: '2026-12-31',
        success: (res) => {
          console.log('选择的日期:', res.value)
        }
      })
    },
    
    // 处理日期点击
    handleDayTap(day) {
      if (!day.date) return
      
      if (day.hasCheckin) {
        uni.showToast({
          title: '当日记工已完成',
          icon: 'success'
        })
      } else if (day.isSunday) {
        uni.showToast({
          title: '今日休息日，不记工也不中断连续天数',
          icon: 'none'
        })
      } else {
        uni.showModal({
          title: '补录记工',
          content: '是否补录当日记工？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: './piecework-record' })
            }
          }
        })
      }
    },
    
    // 跳转到个人账本
    goToPersonalLedger() {
      uni.navigateTo({
        url: '/pages/worker/personal-ledger',
        success: () => {
          console.log('跳转到个人账本成功')
        },
        fail: (err) => {
          console.error('跳转到个人账本失败：', err)
        }
      })
    },
    
    // 跳转到微信确认账本
    goToWechatLedger() {
      uni.navigateTo({
        url: '/pages/worker/wechat-ledger',
        success: () => {
          console.log('跳转到微信确认账本成功')
        },
        fail: (err) => {
          console.error('跳转到微信确认账本失败：', err)
        }
      })
    },
    
    // 底部导航栏方法
    goToHome() {
      uni.reLaunch({ url: './employee-home' })
    },
    goToJob() {
      uni.navigateTo({ url: '../social/recruitment-list' })
    },
    goToMessage() {
      uni.navigateTo({ url: './messages' })
    },
    goToMy() {
      uni.navigateTo({ url: './my-page' })
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 120rpx;
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
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background-color: #E8F0FE;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2rpx solid #4A90E2;
}

.avatar-icon {
  font-size: 40rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.slogan {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.history-btn {
  font-size: 26rpx;
  color: #1677ff;
  font-weight: 600;
}

/* 双数据卡片 */
.dual-card-section {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.monthly-card {
  flex: 1;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.monthly-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.expected-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
}

.actual-card {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.card-label {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 15rpx;
}

.card-value {
  font-size: 48rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 10rpx;
}

.card-sub {
  font-size: 22rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 10rpx;
}

.card-detail {
  font-size: 20rpx;
  opacity: 0.8;
  display: block;
}

.card-divider {
  width: 1rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 20rpx 0;
}

/* 账本入口 */
.ledger-entry-section {
  display: flex;
  padding: 0 30rpx;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.ledger-entry-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.ledger-entry-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
}

.ledger-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  display: block;
}

.ledger-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.ledger-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
}

/* 核心操作大按钮区 */
.core-action-section {
  display: flex;
  padding: 0 30rpx;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.action-btn {
  flex: 1;
  border-radius: 16rpx;
  padding: 25rpx 10rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-icon {
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.btn-text {
  font-size: 26rpx;
  font-weight: 600;
}

.green-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.outline-green-btn {
  background: #fff;
  border: 2rpx solid #52c41a;
  color: #52c41a;
}

.orange-btn {
  background: linear-gradient(135deg, #ff7a45 0%, #ff9a61 100%);
  color: #fff;
}

.gold-btn {
  background: #fff;
  border: 2rpx solid #faad14;
  color: #faad14;
}

/* 账本Tab */
.tab-section {
  display: flex;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
}

.tab-item.active {
  color: #1677ff;
  font-weight: 600;
  border-bottom-color: #1677ff;
}

/* 日期筛选区 */
.date-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.date-btn {
  background: #1677ff;
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}

.date-selector {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.arrow {
  margin-left: 8rpx;
  font-size: 20rpx;
}

/* 优化后的日历模块 */
.calendar-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.calendar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.calendar-stats {
  font-size: 22rpx;
  color: #666;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10rpx;
  margin-bottom: 15rpx;
}

.week-day {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  font-weight: 600;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10rpx;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.empty-day {
  background: transparent;
}

.today {
  border: 3rpx solid #1677ff;
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.sunday {
  background: #f5f7fa;
  color: #999;
}

.has-checkin {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.continuous {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  color: #fff;
}

.day-number {
  font-size: 26rpx;
  font-weight: 600;
}

.day-icon {
  font-size: 16rpx;
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
}

/* 底部固定操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.bottom-action-bar .action-btn {
  flex: 1;
  margin: 0 5rpx;
  background: #fff;
  border: 1rpx solid #e8e8e8;
  color: #333;
}

.bottom-action-bar .action-btn:active {
  background: #f5f5f5;
}
</style>