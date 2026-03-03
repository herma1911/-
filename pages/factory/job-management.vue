<template>
  <view class="job-management-container">
    <view class="header">
      <text class="title">岗位管理</text>
      <button class="add-btn" @click="navigateTo('../social/publish-recruitment')">+ 发布新岗位</button>
    </view>
    
    <!-- 数据统计 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-number">{{ totalJobs }}</text>
        <text class="stat-label">总岗位数</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ activeJobs }}</text>
        <text class="stat-label">活跃岗位</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ totalApplications }}</text>
        <text class="stat-label">总申请数</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ avgApplications }}</text>
        <text class="stat-label">平均申请数</text>
      </view>
    </view>
    
    <!-- 岗位列表 -->
    <view class="job-list-section">
      <view class="list-header">
        <text class="list-title">岗位列表</text>
        <view class="filter-buttons">
          <button :class="['filter-btn', filterStatus === 'all' ? 'active' : '']" @click="filterStatus = 'all'">全部</button>
          <button :class="['filter-btn', filterStatus === 'active' ? 'active' : '']" @click="filterStatus = 'active'">活跃</button>
          <button :class="['filter-btn', filterStatus === 'inactive' ? 'active' : '']" @click="filterStatus = 'inactive'">已下架</button>
        </view>
      </view>
      
      <view class="job-list">
        <view 
          v-for="job in filteredJobs" 
          :key="job.id"
          class="job-item"
        >
          <view class="job-header">
            <text class="job-title">{{ job.title }}</text>
            <text :class="['job-status', job.status]">{{ job.status === 'active' ? '活跃' : '已下架' }}</text>
          </view>
          <view class="job-info">
            <text class="info-item">公司：{{ job.company }}</text>
            <text class="info-item">薪资：{{ job.salary || '面议' }}</text>
            <text class="info-item">地点：{{ job.location }}</text>
            <text class="info-item">发布日期：{{ job.publishDate }}</text>
            <text class="info-item">申请数：{{ job.applicantCount || 0 }}人</text>
          </view>
          <view class="job-actions">
            <button class="action-btn view-btn" @click="viewJobDetails(job)">查看详情</button>
            <button class="action-btn edit-btn" @click="editJob(job)">编辑</button>
            <button :class="['action-btn', job.status === 'active' ? 'deactivate-btn' : 'activate-btn']" @click="toggleJobStatus(job)">
              {{ job.status === 'active' ? '下架' : '上架' }}
            </button>
            <button class="action-btn delete-btn" @click="deleteJob(job)">删除</button>
          </view>
        </view>
        
        <view v-if="filteredJobs.length === 0" class="empty-state">
          <text class="empty-icon">📢</text>
          <text class="empty-text">暂无岗位记录</text>
          <text class="empty-hint">点击右上角发布新岗位</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      jobs: [],
      filterStatus: 'all',
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      avgApplications: 0
    }
  },
  onLoad() {
    this.loadJobs()
  },
  computed: {
    filteredJobs() {
      if (this.filterStatus === 'all') {
        return this.jobs
      } else {
        return this.jobs.filter(job => job.status === this.filterStatus)
      }
    }
  },
  methods: {
    loadJobs() {
      // 从本地存储加载岗位数据
      let jobs = uni.getStorageSync('recruitments') || []
      
      // 为每个岗位添加状态字段
      jobs = jobs.map(job => ({
        ...job,
        status: job.status || 'active'
      }))
      
      this.jobs = jobs
      this.calculateStats()
    },
    calculateStats() {
      this.totalJobs = this.jobs.length
      this.activeJobs = this.jobs.filter(job => job.status === 'active').length
      this.totalApplications = this.jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0)
      this.avgApplications = this.totalJobs > 0 ? Math.round(this.totalApplications / this.totalJobs) : 0
    },
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    viewJobDetails(job) {
      // 跳转到岗位详情页面
      uni.navigateTo({
        url: `../social/recruitment-simple?id=${job.id}`
      })
    },
    editJob(job) {
      // 跳转到编辑页面，传递岗位ID
      uni.navigateTo({
        url: `../social/publish-recruitment?id=${job.id}`
      })
    },
    toggleJobStatus(job) {
      const newStatus = job.status === 'active' ? 'inactive' : 'active'
      job.status = newStatus
      
      // 保存到本地存储
      uni.setStorageSync('recruitments', this.jobs)
      
      // 重新计算统计数据
      this.calculateStats()
      
      uni.showToast({
        title: `岗位已${newStatus === 'active' ? '上架' : '下架'}`,
        icon: 'success'
      })
    },
    deleteJob(job) {
      uni.showModal({
        title: '删除岗位',
        content: `确定要删除「${job.title}」岗位吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 从数组中删除岗位
            const index = this.jobs.findIndex(j => j.id === job.id)
            if (index > -1) {
              this.jobs.splice(index, 1)
              
              // 保存到本地存储
              uni.setStorageSync('recruitments', this.jobs)
              
              // 重新计算统计数据
              this.calculateStats()
              
              uni.showToast({
                title: '岗位已删除',
                icon: 'success'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.job-management-container {
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

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.add-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 12rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

/* 数据统计 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #666;
}

/* 岗位列表 */
.job-list-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.list-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.filter-buttons {
  display: flex;
  gap: 12rpx;
}

.filter-btn {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.filter-btn.active {
  background-color: #667eea;
  color: white;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.job-item {
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  padding: 24rpx;
  transition: all 0.3s ease;
}

.job-item:hover {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.job-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.job-status {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
}

.job-status.active {
  background-color: #f6ffed;
  color: #52c41a;
}

.job-status.inactive {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.job-info {
  margin-bottom: 20rpx;
}

.info-item {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.job-actions {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 120rpx;
  padding: 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.view-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.edit-btn {
  background-color: #fff7e6;
  color: #faad14;
}

.deactivate-btn {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.activate-btn {
  background-color: #f6ffed;
  color: #52c41a;
}

.delete-btn {
  background-color: #fff1f0;
  color: #ff4d4f;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 0;
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
</style>