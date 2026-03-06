<template>
  <view class="growth-details-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">我的搞钱成长</text>
      <view class="empty"></view>
    </view>
    
    <!-- 成长等级概览 -->
    <view class="level-overview">
      <view class="level-card">
        <view class="level-header">
          <text class="level-title">当前等级</text>
          <text class="level-status">{{ currentLevel.name }}</text>
        </view>
        <view class="level-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
          </view>
          <text class="progress-text">{{ progressPercentage }}% 完成</text>
        </view>
        <view class="level-info">
          <text class="level-desc">{{ currentLevel.description }}</text>
          <text class="level-benefit">{{ currentLevel.benefit }}</text>
        </view>
      </view>
    </view>
    
    <!-- 成长数据 -->
    <view class="growth-data">
      <view class="data-card">
        <text class="card-title">成长数据</text>
        <view class="data-grid">
          <view class="data-item">
            <text class="data-value">{{ userGrowthData.continuousCheckinDays }}</text>
            <text class="data-label">连续记工天数</text>
          </view>
          <view class="data-item">
            <text class="data-value">{{ userGrowthData.totalCheckinRecords }}</text>
            <text class="data-label">累计记工记录</text>
          </view>
          <view class="data-item">
            <text class="data-value">{{ userGrowthData.invitedFriends }}</text>
            <text class="data-label">成功邀请工友</text>
          </view>
          <view class="data-item">
            <text class="data-value">{{ userGrowthData.platformWorkMonths }}</text>
            <text class="data-label">平台工作月数</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 解锁任务 -->
    <view class="unlock-tasks">
      <view class="section-header">
        <text class="section-title">解锁任务</text>
        <text class="section-subtitle">完成任务提升等级</text>
      </view>
      <view class="tasks-list">
        <view 
          v-for="(task, index) in unlockTasks" 
          :key="index"
          class="task-item"
          :class="{ 'completed': task.completed }"
        >
          <view class="task-checkbox">
            <text v-if="task.completed" class="checkbox-icon">✓</text>
          </view>
          <view class="task-info">
            <text class="task-title">{{ task.title }}</text>
            <text class="task-reward">{{ task.reward }}</text>
          </view>
          <text v-if="!task.completed" class="task-status">{{ task.status }}</text>
        </view>
      </view>
    </view>
    
    <!-- 已解锁权益 -->
    <view class="unlocked-benefits">
      <view class="section-header">
        <text class="section-title">已解锁权益</text>
        <text class="section-subtitle">{{ currentLevel.name }}专属</text>
      </view>
      <view class="benefits-list">
        <view 
          v-for="(benefit, index) in currentLevel.permissions" 
          :key="index"
          class="benefit-item"
        >
          <text class="benefit-icon">✓</text>
          <text class="benefit-text">{{ benefit }}</text>
        </view>
      </view>
    </view>
    
    <!-- 等级预览 -->
    <view class="level-preview">
      <view class="section-header">
        <text class="section-title">等级预览</text>
        <text class="section-subtitle">更高等级更多权益</text>
      </view>
      <view class="preview-list">
        <view 
          v-for="(level, index) in growthLevels.filter(l => l.id > currentLevelId)" 
          :key="level.id"
          class="preview-item"
        >
          <view class="preview-header">
            <text class="preview-level">{{ level.name }}</text>
            <text class="preview-status">未解锁</text>
          </view>
          <text class="preview-desc">{{ level.description }}</text>
          <view class="preview-benefits">
            <text class="benefit-tag" v-for="(permission, idx) in level.permissions.slice(0, 3)" :key="idx">{{ permission.substring(0, 10) }}...</text>
            <text v-if="level.permissions.length > 3" class="more-benefits">+{{ level.permissions.length - 3 }}更多权益</text>
          </view>
        </view>
        <view v-if="growthLevels.filter(l => l.id > currentLevelId).length === 0" class="preview-item">
          <view class="preview-header">
            <text class="preview-level">已达到最高等级</text>
            <text class="preview-status">已解锁</text>
          </view>
          <text class="preview-desc">您已经达到了平台的最高成长等级，享受所有专属权益</text>
          <view class="preview-benefits">
            <text class="benefit-tag">恭喜您！</text>
            <text class="benefit-tag">已解锁全部权益</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 冷启动加速机制 -->
    <view class="acceleration-section">
      <view class="section-header">
        <text class="section-title">冷启动加速</text>
        <text class="section-subtitle">快速提升等级</text>
      </view>
      <view class="acceleration-card">
        <view class="acceleration-item">
          <text class="acceleration-icon">1</text>
          <view class="acceleration-info">
            <text class="acceleration-title">邀请工友注册</text>
            <text class="acceleration-desc">成功邀请1位工友注册，可直接抵扣7天连续记工时长</text>
          </view>
        </view>
        <view class="acceleration-item">
          <text class="acceleration-icon">2</text>
          <view class="acceleration-info">
            <text class="acceleration-title">完成首次任务</text>
            <text class="acceleration-desc">完成首次记工、首次完善简历、首次报名岗位，均可获得成长加速值</text>
          </view>
        </view>
        <view class="acceleration-item">
          <text class="acceleration-icon">3</text>
          <view class="acceleration-info">
            <text class="acceleration-title">工友记工奖励</text>
            <text class="acceleration-desc">邀请的工友完成首次记工，邀请人可额外解锁1个月的资深稳工大神专属权益</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 成长等级数据
      growthLevels: [
        {
          id: 1,
          name: '新手工友',
          description: '完成注册登录、完善基础技能标签',
          benefit: '新用户初始等级，基础功能全覆盖',
          unlockConditions: [
            '完成注册登录',
            '完善基础技能标签'
          ],
          permissions: [
            '可查看本省/当前所在市的服装旺季推荐',
            '可查看基础旺季时间、对应工种工价区间',
            '每日最多可查看10个匹配的旺季岗位',
            '可使用基础招工筛选、记工记账全部基础功能'
          ]
        },
        {
          id: 2,
          name: '活跃搞钱人',
          description: '连续记工满28天或累计记工满100条或成功邀请2位工友完成注册或成功入职平台合作工厂满1个月',
          benefit: '平台核心活跃用户，开放进阶高价值权益',
          unlockConditions: [
            '连续记工满28天（解锁「月度稳厂达人」称号）',
            '累计记工满100条',
            '成功邀请2位工友完成注册',
            '成功入职平台合作工厂满1个月'
          ],
          permissions: [
            '可查看周边3个省份的完整旺季推荐地图',
            '可查看对应地区工厂的完整发薪信用记录、工人对账确认率',
            '每日最多可查看30个精准匹配的旺季岗位',
            '可查看未来1个月的旺季预告，提前锁定高薪岗位',
            '报名旺季岗位，简历优先展示给工厂'
          ]
        },
        {
          id: 3,
          name: '资深稳工大神',
          description: '连续记工满90天或成功邀请3位及以上工友完成注册或累计在平台记工满6个月，无断签超过3天的记录',
          benefit: '平台核心种子用户，开放全部独家权益',
          unlockConditions: [
            '连续记工满90天（解锁「季度长红打工人」称号）',
            '成功邀请3位及以上工友完成注册',
            '累计在平台记工满6个月，无断签超过3天的记录'
          ],
          permissions: [
            '解锁「全国可跑」权限，查看全国完整服装产业带旺季地图、全年工价走势预测',
            '可提前1-2个月预约全国任意地区的旺季岗位，工厂端优先对接',
            '开放专属「大神高薪岗」池，仅本等级用户可查看报名',
            '成功入职匹配的旺季岗位，可享受平台专属路费补贴',
            '无限制查看全平台所有工厂的发薪信用档案、工人真实评价',
            '报名任意岗位，简历自动置顶，工厂端第一时间查看',
            '可生成专属「全年全国搞钱最优路线」，按月份规划旺季地区、匹配岗位、预计全年收入'
          ]
        }
      ],
      currentLevelId: 1, // 默认新手工友
      progressPercentage: 30, // 进度百分比
      
      // 用户成长数据
      userGrowthData: {
        levelId: 1,
        progress: 30,
        completedTasks: ['注册登录', '完善基础技能标签'],
        continuousCheckinDays: 15,
        totalCheckinRecords: 50,
        invitedFriends: 1,
        platformWorkMonths: 1
      },
      
      // 解锁任务
      unlockTasks: [
        {
          title: '连续记工满28天',
          reward: '解锁「月度稳厂达人」称号',
          completed: false,
          status: '已完成15/28天'
        },
        {
          title: '累计记工满100条',
          reward: '提升成长等级',
          completed: false,
          status: '已完成50/100条'
        },
        {
          title: '成功邀请2位工友完成注册',
          reward: '提升成长等级',
          completed: false,
          status: '已完成1/2位'
        },
        {
          title: '成功入职平台合作工厂满1个月',
          reward: '提升成长等级',
          completed: false,
          status: '未完成'
        },
        {
          title: '完成首次记工',
          reward: '获得成长加速值',
          completed: true,
          status: '已完成'
        },
        {
          title: '首次完善简历',
          reward: '获得成长加速值',
          completed: true,
          status: '已完成'
        },
        {
          title: '首次报名岗位',
          reward: '获得成长加速值',
          completed: false,
          status: '未完成'
        }
      ]
    }
  },
  computed: {
    currentLevel() {
      return this.growthLevels.find(level => level.id === this.currentLevelId) || this.growthLevels[0]
    }
  },
  onLoad() {
    this.loadUserGrowthData()
  },
  methods: {
    // 加载用户成长数据
    loadUserGrowthData() {
      // 模拟从本地存储加载用户成长数据
      const storedData = uni.getStorageSync('userGrowthData')
      if (storedData) {
        this.userGrowthData = storedData
        this.currentLevelId = storedData.levelId
        this.progressPercentage = storedData.progress
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.growth-details-page {
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
  height: 100rpx;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.empty {
  width: 60rpx;
}

/* 成长等级概览 */
.level-overview {
  padding: 30rpx;
}

.level-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.level-title {
  font-size: 28rpx;
  font-weight: 600;
}

.level-status {
  font-size: 32rpx;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.level-progress {
  margin-bottom: 20rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 20rpx;
  opacity: 0.9;
  text-align: right;
}

.level-info {
  margin-bottom: 25rpx;
}

.level-desc {
  font-size: 22rpx;
  opacity: 0.9;
  margin-bottom: 10rpx;
  display: block;
}

.level-benefit {
  font-size: 24rpx;
  font-weight: 600;
  display: block;
}

/* 成长数据 */
.growth-data {
  padding: 0 30rpx 30rpx;
}

.data-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 25rpx;
  display: block;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-item {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 20rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.data-item:active {
  background: #e8f0fe;
  transform: translateY(-5rpx);
}

.data-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #1677ff;
  margin-bottom: 10rpx;
  display: block;
}

.data-label {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 通用section样式 */
.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.section-subtitle {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 解锁任务 */
.unlock-tasks {
  padding: 0 30rpx 30rpx;
}

.tasks-list {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.task-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-item:active {
  background: #e8f0fe;
}

.task-item.completed {
  background: #f6ffed;
  border: 2rpx solid #52c41a;
}

.task-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.task-item.completed .task-checkbox {
  background: #52c41a;
  border-color: #52c41a;
}

.checkbox-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.task-reward {
  font-size: 20rpx;
  color: #666;
  display: block;
}

.task-status {
  font-size: 20rpx;
  color: #999;
  flex-shrink: 0;
}

.task-item.completed .task-status {
  color: #52c41a;
}

/* 已解锁权益 */
.unlocked-benefits {
  padding: 0 30rpx 30rpx;
}

.benefits-list {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  padding: 15rpx;
  border-radius: 12rpx;
  margin-bottom: 10rpx;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-item:active {
  background: #e8f0fe;
}

.benefit-icon {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: bold;
  margin-right: 15rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.benefit-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.5;
}

/* 等级预览 */
.level-preview {
  padding: 0 30rpx 30rpx;
}

.preview-list {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.preview-item {
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
  background: #f8f9fa;
  border: 2rpx dashed #e0e0e0;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item:active {
  background: #e8f0fe;
  border-color: #1677ff;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.preview-level {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.preview-status {
  font-size: 20rpx;
  color: #999;
  background: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.preview-desc {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 15rpx;
  line-height: 1.4;
}

.preview-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.benefit-tag {
  font-size: 18rpx;
  color: #1677ff;
  background: #e6f7ff;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid #91d5ff;
}

.more-benefits {
  font-size: 18rpx;
  color: #999;
  background: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

/* 冷启动加速机制 */
.acceleration-section {
  padding: 0 30rpx 30rpx;
}

.acceleration-card {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(82, 196, 26, 0.3);
}

.acceleration-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25rpx;
  color: #fff;
}

.acceleration-item:last-child {
  margin-bottom: 0;
}

.acceleration-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.acceleration-info {
  flex: 1;
}

.acceleration-title {
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.acceleration-desc {
  font-size: 20rpx;
  opacity: 0.9;
  line-height: 1.4;
  display: block;
}
</style>