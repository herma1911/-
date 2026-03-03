<template>
  <view class="test-container">
    <view class="test-info">
      <text>共 {{recruitmentList.length}} 条招聘信息</text>
    </view>
    <view class="recruitment-list">
      <view v-for="item in recruitmentList" :key="item.id" class="recruitment-item">
        <text class="job-title">{{item.title}}</text>
        <text class="company-name">{{item.company}}</text>
        <text class="salary">{{item.salary}}</text>
        <text class="location">{{item.location}}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recruitmentList: [
        {
          id: 1,
          title: '服装设计师',
          company: '衣起赚服装厂',
          salary: '8000-12000元/月',
          location: '广州'
        },
        {
          id: 2,
          title: '缝纫工',
          company: '衣起赚服装厂',
          salary: '5000-8000元/月',
          location: '广州'
        },
        {
          id: 3,
          title: '质检员',
          company: '衣起赚服装厂',
          salary: '6000-9000元/月',
          location: '广州'
        }
      ]
    }
  }
}
</script>

<style scoped>
.test-container {
  padding: 16rpx;
  min-height: 100vh;
  background-color: #F5F5F5;
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

.recruitment-item {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.job-title {
  font-size: 18rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.company-name {
  font-size: 16rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.salary {
  font-size: 16rpx;
  color: #ff4d4f;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.location {
  font-size: 16rpx;
  color: #666;
  display: block;
}
</style>