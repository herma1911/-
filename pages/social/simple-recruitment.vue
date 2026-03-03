<template>
  <view class="simple-recruitment-container">
    <view class="top-nav">
      <view class="nav-bar">
        <text class="page-title">招聘信息</text>
      </view>
    </view>
    
    <view class="tab-content">
      <view class="search-section">
        <input type="text" v-model="searchKeyword" placeholder="搜索职位" class="search-input" />
        <button type="default" class="search-button" @click="search">搜索</button>
      </view>
      
      <!-- 快速筛选栏 -->
      <view class="quick-filter-section">
        <view class="quick-filter-scroll">
          <button type="default" :class="['quick-filter-btn', activeQuickFilter === 'nearest' ? 'active' : '']" @click="setQuickFilter('nearest')">离我最近</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilter === 'highestSalary' ? 'active' : '']" @click="setQuickFilter('highestSalary')">工价最高</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilter === 'includeMeals' ? 'active' : '']" @click="setQuickFilter('includeMeals')">包吃住</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilter === 'dayShift' ? 'active' : '']" @click="setQuickFilter('dayShift')">长白班</button>
        </view>
      </view>
      
      <view class="recruitment-list">
        <!-- 测试信息 -->
        <view class="test-info">
          <text>共 {{filteredList.length}} 条招聘信息</text>
          <text>当前变体: {{abTestVariant}}</text>
          <text>总招聘信息数: {{recruitmentList.length}}</text>
        </view>
        <!-- 招聘信息卡片 -->
        <view v-for="item in filteredList" :key="item.id" class="simple-recruitment-item" @click="navigateTo('./company-details?companyId=' + item.id)">
          <text class="job-title">{{item.title}}</text>
          <text class="company-name">{{item.company}}</text>
          <text class="salary">{{item.salary}}</text>
          <text class="location">{{item.location}}</text>
          <text class="publish-date">{{item.publishDate}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import abTesting from '../../utils/ab-testing.js'

export default {
  data() {
    return {
      searchKeyword: '',
      abTestVariant: '',
      activeQuickFilter: '',
      recruitmentList: [
        {
          id: 1,
          title: '服装设计师',
          company: '衣起赚服装厂',
          salary: '8000-12000元/月',
          location: '广州',
          publishDate: '2026-02-18'
        },
        {
          id: 2,
          title: '缝纫工',
          company: '衣起赚服装厂',
          salary: '5000-8000元/月',
          location: '广州',
          publishDate: '2026-02-17'
        },
        {
          id: 3,
          title: '质检员',
          company: '衣起赚服装厂',
          salary: '6000-9000元/月',
          location: '广州',
          publishDate: '2026-02-16'
        },
        {
          id: 4,
          title: '拷边工',
          company: '衣起赚服装厂',
          salary: '5500-8500元/月',
          location: '广州',
          publishDate: '2026-02-15'
        },
        {
          id: 5,
          title: '拉链工',
          company: '衣起赚服装厂',
          salary: '6000-9000元/月',
          location: '广州',
          publishDate: '2026-02-14'
        }
      ]
    }
  },
  computed: {
    filteredList() {
      // 直接返回所有招聘信息，不进行过滤
      return this.recruitmentList
    }
  },
  onLoad() {
    // 为用户分配A/B测试变体
    this.abTestVariant = abTesting.assignVariant('recruitmentCardDesign');
  },
  methods: {
    setQuickFilter(filterType) {
      // 切换快速筛选
      if (this.activeQuickFilter === filterType) {
        this.activeQuickFilter = ''
      } else {
        this.activeQuickFilter = filterType
      }
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    search() {
      // 搜索逻辑
      console.log('搜索关键词:', this.searchKeyword)
    }
  }
}
</script>

<style scoped>
.simple-recruitment-container {
  min-height: 100vh;
  background-color: #F5F5F5;
}

.top-nav {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-bar {
  padding: 16rpx;
  text-align: center;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.tab-content {
  padding: 16rpx;
}

.search-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.search-input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
}

.search-button {
  width: 120rpx;
  height: 80rpx;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.quick-filter-section {
  margin-bottom: 16rpx;
}

.quick-filter-scroll {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
}

.quick-filter-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  background-color: #fff;
  font-size: 24rpx;
  white-space: nowrap;
}

.quick-filter-btn.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.test-info {
  background-color: #e6f7ff;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  text-align: center;
  color: #1890ff;
}

.recruitment-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.simple-recruitment-item {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.job-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.company-name {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.salary {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.location {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.publish-date {
  font-size: 24rpx;
  color: #999;
  display: block;
}
</style>