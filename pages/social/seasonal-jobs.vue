<template>
  <view class="seasonal-jobs-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-bar">
        <text class="back-btn" @click="goBack">←</text>
        <text class="page-title">旺季高薪推荐</text>
        <text class="empty"></text>
      </view>
    </view>
    
    <!-- 顶部核心看板 -->
    <view class="seasonal-dashboard">
      <view class="dashboard-header">
        <text class="dashboard-title">{{ currentMonth }}月全国服装旺季搞钱地图</text>
        <text class="level-badge">{{ levelInfo.levelName }}</text>
      </view>
      
      <view class="core-tip">
        <text class="tip-icon">🔥</text>
        <text class="tip-text">{{ currentSeasonTip }}</text>
      </view>
      
      <!-- 可视化全国地图（简化版） -->
      <view class="map-container">
        <view class="map-title">当前旺季地区</view>
        <view class="region-tags">
          <view 
            v-for="region in currentSeasonRegions" 
            :key="region" 
            class="region-tag" 
            @click="showRegionJobs(region)"
          >
            <text class="region-name">{{ region }}</text>
            <text class="premium-tag">工价溢价{{ currentSeasonPricePremium }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 精准匹配岗位列表 -->
    <view class="jobs-section">
      <view class="section-header">
        <text class="section-title">为你精准匹配</text>
        <text class="section-subtitle">{{ recommendations.length }}个岗位</text>
      </view>
      
      <view class="job-list">
        <view 
          v-for="job in recommendations" 
          :key="job.id" 
          class="job-card"
          @click="viewJobDetail(job)"
        >
          <view class="job-header">
            <view class="job-info">
              <text class="job-title">{{ job.category }} - {{ job.region }}</text>
              <view class="job-tags">
                <text class="tag seasonal-tag">旺季急招</text>
                <text class="tag premium-tag">工价溢价{{ job.pricePremium }}</text>
                <text class="tag credit-tag">平台认证准时发薪</text>
              </view>
            </view>
            <text class="salary">{{ job.salary }}</text>
          </view>
          
          <view class="job-details">
            <text class="skill-tags">
              <text v-for="(skill, index) in job.skills" :key="index" class="skill-tag">{{ skill }}</text>
            </text>
            <text class="job-desc">{{ job.description }}</text>
          </view>
          
          <view class="job-footer">
            <text class="factory-credit">工厂信用分：{{ job.factoryCreditScore }}分</text>
            <button class="apply-btn" @click.stop="applyForJob(job)">立即申请</button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 未来旺季预告板块 -->
    <view class="upcoming-section">
      <view class="section-header">
        <text class="section-title">未来旺季预告</text>
        <text class="section-subtitle">提前预约，抢占先机</text>
      </view>
      
      <view class="upcoming-list">
        <view 
          v-for="(season, index) in upcomingSeasons" 
          :key="index" 
          class="upcoming-item"
        >
          <view class="season-info">
            <text class="season-period">{{ season.period }}</text>
            <text class="season-description">{{ season.description }}</text>
            <text class="season-premium">预计工价上涨{{ season.pricePremium }}</text>
          </view>
          <button 
            class="reserve-btn" 
            @click="reserveSeason(season)"
            :disabled="!growthSystem.checkPermission(levelInfo.currentLevel, 'upcomingPreview')"
          >
            {{ growthSystem.checkPermission(levelInfo.currentLevel, 'upcomingPreview') ? '提前预约' : '提升等级解锁' }}
          </button>
        </view>
      </view>
    </view>
    
    <!-- 全年旺季日历（资深稳工大神专属） -->
    <view class="annual-calendar-section" v-if="growthSystem.checkPermission(levelInfo.currentLevel, 'nationalMap')">
      <view class="section-header">
        <text class="section-title">全年旺季日历</text>
        <text class="section-subtitle">等级解锁专属</text>
      </view>
      
      <view class="calendar-grid">
        <view 
          v-for="month in annualCalendar" 
          :key="month.period" 
          class="calendar-item"
        >
          <text class="month-label">{{ month.period }}</text>
          <text class="month-region">{{ month.region }}</text>
          <text class="month-premium">{{ month.pricePremium }}</text>
        </view>
      </view>
      
      <button class="route-btn" @click="generateRoute">生成全年搞钱最优路线</button>
    </view>
    
    <!-- 全年旺季日历（未解锁） -->
    <view class="annual-calendar-section locked" v-else>
      <view class="section-header">
        <text class="section-title">全年旺季日历</text>
        <text class="section-subtitle">提升等级解锁</text>
      </view>
      
      <view class="locked-content">
        <text class="locked-icon">🔒</text>
        <text class="locked-text">提升至资深稳工大神，即可免费解锁全年搞钱规划</text>
        <button class="unlock-btn" @click="goToGrowthCenter">去解锁</button>
      </view>
    </view>
    
    <!-- 底部增值板块 -->
    <view class="value-added-section">
      <!-- 旺季避坑指南 -->
      <view class="guide-section">
        <view class="guide-header">
          <text class="guide-title">旺季避坑指南</text>
          <text class="guide-arrow">></text>
        </view>
        <view class="guide-content">
          <text class="guide-item">✅ 确认工厂资质和发薪记录</text>
          <text class="guide-item">✅ 签订书面劳动合同</text>
          <text class="guide-item">✅ 确认工价计算方式</text>
          <text class="guide-item">✅ 保留工作记录和对账凭证</text>
        </view>
      </view>
      
      <!-- 同行都在去 -->
      <view class="trending-section">
        <view class="trending-header">
          <text class="trending-title">同行都在去</text>
        </view>
        <view class="trending-list">
          <view 
            v-for="(trend, index) in trendingRegions" 
            :key="index" 
            class="trending-item"
          >
            <text class="trending-rank">{{ index + 1 }}</text>
            <text class="trending-region">{{ trend.region }}</text>
            <text class="trending-count">{{ trend.count }}人报名</text>
          </view>
        </view>
      </view>
      
      <!-- 老乡组队 -->
      <view class="team-section">
        <view class="team-header">
          <text class="team-title">老乡组队</text>
          <button class="team-btn" @click="createTeam">发起组队</button>
        </view>
        <text class="team-desc">同地区、同工种的工人组队，拼车、拼住宿更划算</text>
      </view>
    </view>
    
    <!-- 底部成长引导栏 -->
    <view class="growth-footer">
      <view class="growth-info">
        <text class="growth-level">当前等级：{{ levelInfo.levelName }}</text>
        <text class="growth-progress">{{ levelInfo.progress }}%</text>
      </view>
      <text class="growth-tip">{{ growthTip }}</text>
      <button class="growth-btn" @click="goToGrowthCenter">查看成长任务</button>
    </view>
    
    <!-- 全年搞钱路线弹窗 -->
    <view class="route-modal" v-if="showRouteModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">全年搞钱最优路线</text>
          <text class="modal-close" @click="closeRouteModal">×</text>
        </view>
        <view class="route-content">
          <view 
            v-for="(route, index) in annualRoute" 
            :key="index" 
            class="route-item"
          >
            <text class="route-period">{{ route.period }}</text>
            <text class="route-region">{{ route.region }}</text>
            <text class="route-salary">{{ route.estimatedIncome }}</text>
          </view>
        </view>
        <button class="modal-btn" @click="closeRouteModal">知道了</button>
      </view>
    </view>
    
    <!-- 等级提升提示弹窗 -->
    <view class="level-modal" v-if="showLevelModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">等级提升提示</text>
          <text class="modal-close" @click="closeLevelModal">×</text>
        </view>
        <view class="level-benefits">
          <text class="benefit-item">✅ 查看周边3省旺季地图</text>
          <text class="benefit-item">✅ 查看工厂完整发薪信用记录</text>
          <text class="benefit-item">✅ 每日最多查看30个岗位</text>
          <text class="benefit-item">✅ 提前预约未来旺季岗位</text>
          <text class="benefit-item">✅ 简历优先展示给工厂</text>
        </view>
        <button class="modal-btn" @click="closeLevelModal">知道了</button>
      </view>
    </view>
  </view>
</template>

<script>
import seasonalRecommendation from '../../utils/seasonal-recommendation.js'
import growthSystem from '../../utils/growth-system.js'

export default {
  data() {
    return {
      growthSystem,
      levelInfo: {
        currentLevel: 'new',
        progress: 0,
        nextLevel: 'active',
        remaining: 28,
        levelName: '新手工友'
      },
      currentMonth: new Date().getMonth() + 1,
      currentSeasonRegions: [],
      currentSeasonPricePremium: '',
      currentSeasonTip: '',
      recommendations: [],
      upcomingSeasons: [],
      annualCalendar: [],
      annualRoute: [],
      trendingRegions: [
        { region: '江苏苏州', count: 128 },
        { region: '浙江杭州', count: 115 },
        { region: '广东广州', count: 98 },
        { region: '湖北武汉', count: 86 },
        { region: '辽宁大连', count: 72 }
      ],
      showRouteModal: false,
      showLevelModal: false
    }
  },
  computed: {
    growthTip() {
      if (this.levelInfo.nextLevel) {
        return `再邀请${this.levelInfo.remaining}位工友，即可解锁${growthSystem.growthLevels[this.levelInfo.nextLevel].name}全部权益`
      } else {
        return '已解锁全部权益，享受全国旺季高薪资源'
      }
    }
  },
  onLoad() {
    this.loadUserProfile()
    this.loadSeasonalData()
    this.generateRecommendations()
  },
  methods: {
    // 加载用户资料
    loadUserProfile() {
      // 模拟用户数据
      const userData = {
        growthData: {
          continuousCheckinDays: 15,
          totalCheckinCount: 35,
          inviteCount: 1,
          employmentDays: 0,
          growthPoints: 0
        }
      }
      
      // 获取等级信息
      this.levelInfo = growthSystem.getLevelProgress(userData)
      
      // 根据等级生成提示语
      this.generateSeasonTip()
    },
    
    // 生成季节提示语
    generateSeasonTip() {
      const currentSeason = seasonalRecommendation.getCurrentSeasonInfo()
      if (currentSeason) {
        switch (this.levelInfo.currentLevel) {
          case 'new':
            this.currentSeasonTip = `当前旺季：${currentSeason.regions[0]}等地区${currentSeason.categories[0]}生产高峰，平车工最高溢价50%！提升等级即可免费查看全国高薪岗位`
            break
          case 'active':
            this.currentSeasonTip = `当前旺季：${currentSeason.regions[0]}等地区${currentSeason.categories[0]}生产高峰，你的技能匹配度85%，已解锁周边3省旺季资源`
            break
          case 'senior':
            this.currentSeasonTip = `当前旺季：${currentSeason.regions[0]}等地区${currentSeason.categories[0]}生产高峰，你的技能完美匹配！已解锁全国全部旺季资源`
            break
        }
      }
    },
    
    // 加载旺季数据
    loadSeasonalData() {
      const currentSeason = seasonalRecommendation.getCurrentSeasonInfo()
      if (currentSeason) {
        this.currentSeasonRegions = currentSeason.regions
        this.currentSeasonPricePremium = currentSeason.pricePremium
      }
      
      const upcoming = seasonalRecommendation.getUpcomingSeasonInfo()
      if (upcoming.next) {
        this.upcomingSeasons.push({
          period: '下个月',
          regions: upcoming.next.regions,
          pricePremium: upcoming.next.pricePremium,
          description: upcoming.next.description
        })
      }
      if (upcoming.nextNext) {
        this.upcomingSeasons.push({
          period: '下下个月',
          regions: upcoming.nextNext.regions,
          pricePremium: upcoming.nextNext.pricePremium,
          description: upcoming.nextNext.description
        })
      }
      
      // 生成全年日历数据
      for (let month = 1; month <= 12; month++) {
        const seasonData = seasonalRecommendation.getSeasonDataByMonth(month)
        if (seasonData) {
          this.annualCalendar.push({
            period: `${month}月`,
            region: seasonData.regions[0],
            pricePremium: seasonData.pricePremium
          })
        }
      }
    },
    
    // 生成推荐岗位
    generateRecommendations() {
      const skillProfile = uni.getStorageSync('skillProfile') || {}
      const maxRecommendations = growthSystem.getMaxRecommendations(this.levelInfo.currentLevel)
      // 模拟推荐岗位生成
      this.recommendations = []
      const currentSeason = seasonalRecommendation.getCurrentSeasonInfo()
      if (currentSeason) {
        currentSeason.regions.forEach(region => {
          currentSeason.categories.forEach(category => {
            const matchedSkills = currentSeason.keySkills.slice(0, 3)
            if (matchedSkills.length > 0) {
              this.recommendations.push({
                id: `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                region,
                category,
                skills: matchedSkills,
                salary: `${Math.floor(8000 + Math.random() * 4000)}元/月`,
                pricePremium: currentSeason.pricePremium,
                factoryCreditScore: Math.floor(Math.random() * 20) + 80,
                description: currentSeason.description
              })
            }
          })
        })
      }
      // 根据等级限制数量
      this.recommendations = this.recommendations.slice(0, maxRecommendations)
    },
    
    // 查看地区岗位
    showRegionJobs(region) {
      uni.showToast({
        title: `查看${region}的岗位`,
        icon: 'none'
      })
    },
    
    // 查看岗位详情
    viewJobDetail(job) {
      uni.showToast({
        title: '查看岗位详情',
        icon: 'none'
      })
    },
    
    // 申请岗位
    applyForJob(job) {
      uni.showModal({
        title: '申请确认',
        content: `确定申请${job.region}的${job.category}岗位吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '申请成功，等待工厂回复',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 预约旺季
    reserveSeason(season) {
      if (!growthSystem.checkPermission(this.levelInfo.currentLevel, 'upcomingPreview')) {
        this.showLevelModal = true
        return
      }
      
      uni.showModal({
        title: '预约确认',
        content: `确定预约${season.period}的旺季岗位吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '预约成功，旺季后第一时间通知你',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 生成全年搞钱路线
    generateRoute() {
      const skillProfile = uni.getStorageSync('skillProfile') || {}
      this.annualRoute = seasonalRecommendation.generateAnnualRoute(skillProfile)
      this.showRouteModal = true
    },
    
    // 发起组队
    createTeam() {
      uni.showToast({
        title: '组队功能开发中',
        icon: 'none'
      })
    },
    
    // 跳转到成长中心
    goToGrowthCenter() {
      uni.navigateTo({
        url: '../worker/growth-center'
      })
    },
    
    // 关闭弹窗
    closeRouteModal() {
      this.showRouteModal = false
    },
    closeLevelModal() {
      this.showLevelModal = false
    },
    
    // 返回
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.seasonal-jobs-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 150rpx; /* 为底部成长引导栏留出空间 */
}

/* 顶部导航栏 */
.top-nav {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 32rpx;
  color: #333;
  width: 40rpx;
}

.page-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: center;
}

.empty {
  width: 40rpx;
}

/* 顶部核心看板 */
.seasonal-dashboard {
  background: linear-gradient(135deg, #ff7a45 0%, #ff9a61 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(255, 122, 69, 0.3);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.dashboard-title {
  font-size: 28rpx;
  font-weight: bold;
}

.level-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
}

.core-tip {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.tip-text {
  font-size: 24rpx;
  flex: 1;
  line-height: 1.4;
}

/* 地图容器 */
.map-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
}

.map-title {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.region-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.region-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.region-name {
  font-size: 22rpx;
  font-weight: bold;
}

.premium-tag {
  font-size: 20rpx;
  opacity: 0.9;
}

/* 岗位列表 */
.jobs-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
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

.section-subtitle {
  font-size: 22rpx;
  color: #666;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.job-card {
  background: #f9f9f9;
  border-radius: 15rpx;
  padding: 20rpx;
  border-left: 4rpx solid #ff7a45;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.job-info {
  flex: 1;
}

.job-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.seasonal-tag {
  background: #fff2e8;
  color: #ff7a45;
}

.premium-tag {
  background: #f6ffed;
  color: #52c41a;
}

.credit-tag {
  background: #e6f7ff;
  color: #1890ff;
}

.salary {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.job-details {
  margin-bottom: 15rpx;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.skill-tag {
  background: #f0f0f0;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  font-size: 18rpx;
  color: #666;
}

.job-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15rpx;
  border-top: 1rpx solid #e8e8e8;
}

.factory-credit {
  font-size: 20rpx;
  color: #999;
}

.apply-btn {
  background: linear-gradient(90deg, #ff7a45 0%, #ff9a61 100%);
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  font-weight: bold;
}

/* 未来旺季预告 */
.upcoming-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.upcoming-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.season-info {
  flex: 1;
}

.season-period {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.season-description {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
  line-height: 1.3;
}

.season-premium {
  font-size: 20rpx;
  color: #52c41a;
  font-weight: bold;
}

.reserve-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 22rpx;
  margin-left: 15rpx;
}

.reserve-btn:disabled {
  background: #ccc;
  color: #fff;
}

/* 全年旺季日历 */
.annual-calendar-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.annual-calendar-section.locked {
  background: #f5f5f5;
  border: 1rpx dashed #e8e8e8;
}

.locked-content {
  text-align: center;
  padding: 40rpx 20rpx;
}

.locked-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.locked-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
  line-height: 1.4;
}

.unlock-btn {
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx 30rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.calendar-item {
  background: linear-gradient(135deg, #fff7e6 0%, #ffefcc 100%);
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  border: 1rpx solid #ffd591;
}

.month-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #d48806;
  display: block;
  margin-bottom: 5rpx;
}

.month-region {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.month-premium {
  font-size: 20rpx;
  color: #52c41a;
  font-weight: bold;
}

.route-btn {
  width: 100%;
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx;
  font-size: 24rpx;
  font-weight: bold;
}

/* 底部增值板块 */
.value-added-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.guide-section,
.trending-section,
.team-section {
  margin-bottom: 30rpx;
}

.guide-section:last-child,
.trending-section:last-child,
.team-section:last-child {
  margin-bottom: 0;
}

.guide-header,
.trending-header,
.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.guide-title,
.trending-title,
.team-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.guide-arrow {
  font-size: 24rpx;
  color: #999;
}

.guide-content {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.guide-item {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.trending-item {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 15rpx;
}

.trending-rank {
  font-size: 24rpx;
  font-weight: bold;
  color: #ff7a45;
  width: 40rpx;
}

.trending-region {
  flex: 1;
  font-size: 22rpx;
  color: #333;
}

.trending-count {
  font-size: 20rpx;
  color: #999;
}

.team-btn {
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  font-size: 20rpx;
}

.team-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

/* 底部成长引导栏 */
.growth-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.growth-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.growth-level {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.growth-progress {
  font-size: 24rpx;
  font-weight: bold;
  color: #1677ff;
}

.growth-tip {
  font-size: 22rpx;
  color: #666;
  display: block;
  text-align: center;
  margin-bottom: 15rpx;
  line-height: 1.4;
}

.growth-btn {
  width: 100%;
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx;
  font-size: 24rpx;
  font-weight: bold;
}

/* 弹窗样式 */
.route-modal,
.level-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 560rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 32rpx;
  color: #999;
}

.route-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.route-item {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-period {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
}

.route-region {
  font-size: 20rpx;
  color: #666;
  flex: 1;
  margin: 0 15rpx;
}

.route-salary {
  font-size: 22rpx;
  font-weight: bold;
  color: #ff7a45;
}

.level-benefits {
  margin-bottom: 20rpx;
}

.benefit-item {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.modal-btn {
  width: 100%;
  background: linear-gradient(90deg, #ff7a45 0%, #ff9a61 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx;
  font-size: 24rpx;
  font-weight: bold;
}
</style>
