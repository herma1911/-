<template>
  <view class="my-applications-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-bar">
        <text class="nav-back" @click="navigateBack">←</text>
        <text class="page-title">我的求职</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 标签切换 -->
      <view class="tab-section">
        <view class="tab-bar">
          <text 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['tab-item', activeTab === tab.key ? 'active' : '']"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </text>
        </view>
      </view>
      
      <!-- 投递记录 -->
      <view v-if="activeTab === 'applications'" class="applications-section">
        <view v-if="applications.length === 0" class="empty-state">
          <text class="empty-text">暂无投递记录</text>
          <text class="empty-subtext">去浏览更多岗位吧</text>
          <button type="default" class="browse-jobs-btn" @click="goToRecruitmentList">浏览岗位</button>
        </view>
        <view v-else class="applications-list">
          <view v-for="app in applications" :key="app.jobId" class="application-item">
            <view class="app-header">
              <text class="app-title">{{ getJobTitle(app.jobId) }}</text>
              <text class="app-status">{{ getAppStatus(app.status) }}</text>
            </view>
            <view class="app-company">{{ getCompanyName(app.jobId) }}</view>
            <view class="app-info">
              <text class="app-salary">{{ getJobSalary(app.jobId) }}</text>
              <text class="app-time">{{ formatDate(app.applyTime) }}</text>
            </view>
            <view class="app-actions">
              <button type="default" class="action-btn detail-btn" @click="viewJobDetails(app.jobId)">查看岗位</button>
              <button type="default" class="action-btn consult-btn" @click="chatWithEmployer(app.jobId)">联系雇主</button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 面试邀请 -->
      <view v-if="activeTab === 'interviews'" class="interviews-section">
        <view v-if="interviews.length === 0" class="empty-state">
          <text class="empty-text">暂无面试邀请</text>
          <text class="empty-subtext">继续投递心仪的岗位吧</text>
          <button type="default" class="browse-jobs-btn" @click="goToRecruitmentList">浏览岗位</button>
        </view>
        <view v-else class="interviews-list">
          <view v-for="interview in interviews" :key="interview.id" class="interview-item">
            <view class="interview-header">
              <text class="interview-title">{{ interview.jobTitle }}</text>
              <text class="interview-status">待面试</text>
            </view>
            <view class="interview-company">{{ interview.companyName }}</view>
            <view class="interview-time">面试时间：{{ interview.interviewTime }}</view>
            <view class="interview-location">面试地点：{{ interview.location }}</view>
            <view class="interview-actions">
              <button type="default" class="action-btn detail-btn" @click="viewJobDetails(interview.jobId)">查看岗位</button>
              <button type="default" class="action-btn consult-btn" @click="chatWithEmployer(interview.jobId)">联系雇主</button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 收藏岗位 -->
      <view v-if="activeTab === 'favorites'" class="favorites-section">
        <view v-if="favorites.length === 0" class="empty-state">
          <text class="empty-text">暂无收藏岗位</text>
          <text class="empty-subtext">看到心仪的岗位就收藏起来吧</text>
          <button type="default" class="browse-jobs-btn" @click="goToRecruitmentList">浏览岗位</button>
        </view>
        <view v-else class="favorites-list">
          <view v-for="job in favorites" :key="job.id" class="favorite-item">
            <view class="favorite-header">
              <text class="favorite-title">{{ job.title }}</text>
              <text class="favorite-company">{{ job.company }}</text>
            </view>
            <view class="favorite-info">
              <text class="favorite-salary">{{ job.salary }}</text>
              <text class="favorite-location">{{ job.location }}</text>
            </view>
            <view class="favorite-actions">
              <button type="default" class="action-btn detail-btn" @click="viewJobDetails(job.id)">查看详情</button>
              <button type="default" class="action-btn consult-btn" @click="chatWithEmployer(job.id)">一键咨询</button>
            </view>
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
      activeTab: 'applications',
      tabs: [
        { key: 'applications', label: '投递记录' },
        { key: 'interviews', label: '面试邀请' },
        { key: 'favorites', label: '收藏岗位' }
      ],
      applications: [],
      interviews: [],
      favorites: [],
      recruitmentList: []
    }
  },
  onLoad() {
    this.initData();
    
    // 初始化滑动返回
    this.initSwipeBack();
  },
  methods: {
    // 初始化数据
    initData() {
      // 从本地存储加载数据
      this.applications = uni.getStorageSync('jobApplications') || [];
      this.interviews = uni.getStorageSync('interviewInvitations') || [];
      this.favorites = uni.getStorageSync('favoriteJobs') || [];
      this.recruitmentList = uni.getStorageSync('recruitments') || [];
    },
    
    // 获取岗位标题
    getJobTitle(jobId) {
      const job = this.recruitmentList.find(item => item.id == jobId);
      return job ? job.title : '岗位信息已更新';
    },
    
    // 获取公司名称
    getCompanyName(jobId) {
      const job = this.recruitmentList.find(item => item.id == jobId);
      return job ? job.company : '公司信息已更新';
    },
    
    // 获取岗位薪资
    getJobSalary(jobId) {
      const job = this.recruitmentList.find(item => item.id == jobId);
      return job ? job.salary : '薪资信息已更新';
    },
    
    // 获取申请状态
    getAppStatus(status) {
      const statusMap = {
        'pending': '待处理',
        'interview': '面试中',
        'hired': '已录用',
        'rejected': '已拒绝'
      };
      return statusMap[status] || '处理中';
    },
    
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    
    // 查看岗位详情
    viewJobDetails(jobId) {
      uni.navigateTo({
        url: './company-details?companyId=' + jobId
      });
    },
    
    // 联系雇主
    chatWithEmployer(jobId) {
      uni.navigateTo({
        url: './chat?jobId=' + jobId
      });
    },
    
    // 跳转到招聘列表
    goToRecruitmentList() {
      uni.navigateTo({
        url: './recruitment-list'
      });
    },
    
    // 返回上一页
    navigateBack() {
      uni.navigateBack();
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
    }
  }
}
</script>

<style scoped>
/* 我的求职容器 */
.my-applications-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 80rpx;
}

.nav-back {
  font-size: 36rpx;
  color: #333;
  cursor: pointer;
  padding: 10rpx;
  margin-right: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

/* 内容区域 */
.content-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 标签切换 */
.tab-section {
  margin-bottom: 30rpx;
}

.tab-bar {
  display: flex;
  border-bottom: 2rpx solid #e0e0e0;
  padding-bottom: 10rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 15rpx 0;
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: #4A90E2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -12rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.empty-text {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.empty-subtext {
  font-size: 24rpx;
  margin-bottom: 40rpx;
  display: block;
}

.browse-jobs-btn {
  padding: 16rpx 40rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 投递记录列表 */
.applications-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.application-item {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.app-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.app-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  background-color: #e3f2fd;
  color: #2196f3;
  border-radius: 12rpx;
}

.app-company {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.app-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.app-salary {
  font-size: 24rpx;
  color: #ff5722;
  font-weight: bold;
}

.app-time {
  font-size: 20rpx;
  color: #999;
}

/* 面试邀请列表 */
.interviews-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.interview-item {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.interview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.interview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.interview-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  background-color: #e8f5e8;
  color: #4caf50;
  border-radius: 12rpx;
}

.interview-company {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.interview-time {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.interview-location {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 20rpx;
}

/* 收藏岗位列表 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.favorite-item {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.favorite-header {
  margin-bottom: 10rpx;
}

.favorite-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.favorite-company {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.favorite-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.favorite-salary {
  font-size: 24rpx;
  color: #ff5722;
  font-weight: bold;
}

.favorite-location {
  font-size: 24rpx;
  color: #666;
}

/* 操作按钮 */
.app-actions,
.interview-actions,
.favorite-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  height: 70rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-btn {
  background-color: #fff;
  color: #4A90E2;
  border: 1rpx solid #4A90E2;
}

.consult-btn {
  background-color: #4A90E2;
  color: #fff;
  border: none;
}
</style>