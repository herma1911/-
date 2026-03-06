<template>
  <view class="money-map-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">搞钱地图</text>
      <view class="empty"></view>
    </view>
    
    <!-- 成长等级信息 -->
    <view class="growth-level-section">
      <view class="level-card">
        <view class="level-header">
          <text class="level-title">我的成长等级</text>
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
        <button class="view-details-btn" @tap="goToGrowthDetails">查看详细进度</button>
      </view>
    </view>
    
    <!-- 搞钱地图 -->
    <view class="map-section">
      <view class="map-header">
        <text class="map-title">旺季推荐地图</text>
        <view class="map-controls">
          <view class="control-item" @tap="switchProvince">
            <text class="control-text">{{ selectedProvince }}</text>
            <text class="control-icon">▼</text>
          </view>
          <view class="control-item" @tap="switchSeason">
            <text class="control-text">{{ selectedSeason }}</text>
            <text class="control-icon">▼</text>
          </view>
        </view>
      </view>
      
      <!-- 地图容器 -->
      <view class="map-container">
        <view class="map-placeholder">
          <text class="map-icon">🗺️</text>
          <text class="map-text">服装产业带旺季地图</text>
        </view>
        
        <!-- 产业带列表 -->
        <view class="industry-zones">
          <view 
            v-for="zone in industryZones" 
            :key="zone.id"
            class="zone-item"
            :class="{ 'unlocked': isZoneUnlocked(zone.id) }"
            @tap="viewZoneDetails(zone)"
          >
            <text class="zone-icon">{{ zone.icon }}</text>
            <view class="zone-info">
              <text class="zone-name">{{ zone.name }}</text>
              <text class="zone-season">{{ zone.season }}旺季</text>
              <text class="zone-wage">{{ zone.wageRange }}</text>
            </view>
            <text v-if="!isZoneUnlocked(zone.id)" class="lock-icon">🔒</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 推荐岗位 -->
    <view class="jobs-section">
      <view class="section-header">
        <text class="section-title">推荐岗位</text>
        <text class="view-more" @tap="viewMoreJobs">查看更多</text>
      </view>
      <view class="jobs-list">
        <view 
          v-for="job in recommendedJobs" 
          :key="job.id"
          class="job-item"
          @tap="viewJobDetails(job)"
        >
          <view class="job-header">
            <text class="job-title">{{ job.title }}</text>
            <text class="job-tag">{{ job.tag }}</text>
          </view>
          <text class="job-company">{{ job.company }}</text>
          <view class="job-info">
            <text class="job-wage">{{ job.wage }}</text>
            <text class="job-location">{{ job.location }}</text>
          </view>
          <view class="job-benefits">
            <text class="benefit-tag" v-for="benefit in job.benefits" :key="benefit">{{ benefit }}</text>
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
      
      // 地图数据
      provinces: ['全国', '广东省', '浙江省', '江苏省', '山东省', '福建省'],
      seasons: ['春季', '夏季', '秋季', '冬季', '全年'],
      selectedProvince: '全国',
      selectedSeason: '全年',
      
      // 产业带数据
      industryZones: [
        { id: 1, name: '珠三角服装产业带', icon: '🏭', season: '全年', wageRange: '工价区间：8000-15000元/月', levelRequired: 1 },
        { id: 2, name: '长三角服装产业带', icon: '🏭', season: '全年', wageRange: '工价区间：7000-14000元/月', levelRequired: 1 },
        { id: 3, name: '闽东南服装产业带', icon: '🏭', season: '全年', wageRange: '工价区间：6000-12000元/月', levelRequired: 1 },
        { id: 4, name: '环渤海服装产业带', icon: '🏭', season: '春秋', wageRange: '工价区间：6000-11000元/月', levelRequired: 2 },
        { id: 5, name: '西南服装产业带', icon: '🏭', season: '秋冬', wageRange: '工价区间：5000-10000元/月', levelRequired: 2 },
        { id: 6, name: '西北服装产业带', icon: '🏭', season: '秋冬', wageRange: '工价区间：4500-9000元/月', levelRequired: 3 }
      ],
      
      // 推荐岗位数据
      recommendedJobs: [
        {
          id: 1,
          title: '平车车工',
          company: '广州服装厂',
          wage: '8000-12000元/月',
          location: '广东广州',
          tag: '高薪',
          benefits: ['包吃住', '加班费', '年终奖']
        },
        {
          id: 2,
          title: '裁剪工',
          company: '杭州服装厂',
          wage: '7000-11000元/月',
          location: '浙江杭州',
          tag: '急招',
          benefits: ['包吃住', '五险', '绩效奖']
        },
        {
          id: 3,
          title: '质检工',
          company: '苏州服装厂',
          wage: '6500-10000元/月',
          location: '江苏苏州',
          tag: '稳定',
          benefits: ['包吃住', '五险', '全勤奖']
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
      const userGrowthData = uni.getStorageSync('userGrowthData') || {
        levelId: 1,
        progress: 30,
        completedTasks: ['注册登录', '完善基础技能标签'],
        continuousCheckinDays: 15,
        totalCheckinRecords: 50,
        invitedFriends: 1,
        platformWorkMonths: 1
      }
      
      this.currentLevelId = userGrowthData.levelId
      this.progressPercentage = userGrowthData.progress
    },
    
    // 检查产业带是否解锁
    isZoneUnlocked(zoneId) {
      const zone = this.industryZones.find(z => z.id === zoneId)
      return zone.levelRequired <= this.currentLevelId
    },
    
    // 查看产业带详情
    viewZoneDetails(zone) {
      if (!this.isZoneUnlocked(zone.id)) {
        uni.showToast({
          title: '需要达到' + this.growthLevels[zone.levelRequired - 1].name + '等级才能查看',
          icon: 'none'
        })
        return
      }
      
      // 跳转到产业带详情页面
      uni.navigateTo({
        url: '/pages/worker/zone-detail?id=' + zone.id
      })
    },
    
    // 查看岗位详情
    viewJobDetails(job) {
      // 跳转到岗位详情页面
      uni.navigateTo({
        url: '/pages/worker/job-detail?id=' + job.id
      })
    },
    
    // 切换省份
    switchProvince() {
      // 弹出省份选择器
      uni.showActionSheet({
        itemList: this.provinces,
        success: (res) => {
          this.selectedProvince = this.provinces[res.tapIndex]
        }
      })
    },
    
    // 切换季节
    switchSeason() {
      // 弹出季节选择器
      uni.showActionSheet({
        itemList: this.seasons,
        success: (res) => {
          this.selectedSeason = this.seasons[res.tapIndex]
        }
      })
    },
    
    // 查看更多岗位
    viewMoreJobs() {
      // 跳转到岗位列表页面
      uni.navigateTo({
        url: '/pages/worker/job-list'
      })
    },
    
    // 查看成长详情
    goToGrowthDetails() {
      // 跳转到成长详情页面
      uni.navigateTo({
        url: '/pages/worker/growth-details'
      })
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.money-map-page {
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

/* 成长等级信息 */
.growth-level-section {
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

.view-details-btn {
  width: 100%;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 35rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-details-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

/* 搞钱地图 */
.map-section {
  padding: 0 30rpx 30rpx;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.map-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.map-controls {
  display: flex;
  gap: 15rpx;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 5rpx;
  background: #fff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  border: 2rpx solid #e0e0e0;
  font-size: 20rpx;
  color: #666;
  transition: all 0.3s ease;
}

.control-item:active {
  background: #f0f0f0;
  transform: scale(0.98);
}

.control-icon {
  font-size: 16rpx;
}

.map-container {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  margin-bottom: 30rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.map-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.map-text {
  font-size: 24rpx;
  color: #666;
}

.industry-zones {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.zone-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  position: relative;
}

.zone-item:active {
  background: #e8f0fe;
  transform: translateX(10rpx);
}

.zone-item.unlocked {
  background: #f6ffed;
  border: 2rpx solid #52c41a;
}

.zone-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 60rpx;
  text-align: center;
}

.zone-info {
  flex: 1;
}

.zone-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.zone-season {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 5rpx;
  display: block;
}

.zone-wage {
  font-size: 22rpx;
  color: #1677ff;
  font-weight: 600;
  display: block;
}

.lock-icon {
  font-size: 32rpx;
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

/* 推荐岗位 */
.jobs-section {
  padding: 0 30rpx 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.view-more {
  font-size: 20rpx;
  color: #1677ff;
  transition: color 0.3s ease;
}

.view-more:active {
  color: #096dd9;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.job-item {
  background: #fff;
  border-radius: 15rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.job-item:active {
  transform: translateY(-5rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.job-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.job-tag {
  font-size: 18rpx;
  color: #ff7a45;
  background: #fff2e8;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 15rpx;
}

.job-company {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.job-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.job-wage {
  font-size: 26rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.job-location {
  font-size: 20rpx;
  color: #999;
}

.job-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.benefit-tag {
  font-size: 18rpx;
  color: #52c41a;
  background: #f6ffed;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid #b7eb8f;
}
</style>