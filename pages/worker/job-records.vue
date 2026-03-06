<template>
  <view class="job-records-container">
    <view class="header">
      <text class="title">找工记录</text>
    </view>
    
    <view class="records-section">
      <view v-if="records.length === 0" class="empty-records">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">暂无找工记录</text>
        <text class="empty-desc">您还没有浏览过任何工作岗位</text>
      </view>
      
      <view v-else class="record-list">
        <view v-for="record in records" :key="record.id" class="record-item">
          <view class="record-header">
            <text class="record-title">{{ record.title }}</text>
            <text class="record-date">{{ record.date }}</text>
          </view>
          <view class="record-info">
            <text class="record-company">{{ record.company }}</text>
            <text class="record-salary">{{ record.salary }}</text>
          </view>
          <view class="record-tags">
            <view class="tag" v-for="tag in record.tags" :key="tag">{{ tag }}</view>
          </view>
          <button class="view-btn" @click="viewJob(record.id)">查看详情</button>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">记录最近30天的找工历史</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      records: [
        {
          id: 1,
          title: '车工',
          company: 'XX服装厂',
          salary: '8000-10000元/月',
          date: '2026-03-03',
          tags: ['全职', '包吃住', '加班费']
        },
        {
          id: 2,
          title: '熨烫工',
          company: 'YY制衣厂',
          salary: '7000-9000元/月',
          date: '2026-03-02',
          tags: ['全职', '包吃住', '年终奖']
        },
        {
          id: 3,
          title: '包装工',
          company: 'ZZ服饰有限公司',
          salary: '6000-8000元/月',
          date: '2026-03-01',
          tags: ['全职', '包吃住', '加班费']
        }
      ]
    }
  },
  methods: {
    viewJob(id) {
      // 跳转到工作详情页面
      uni.navigateTo({
        url: `/pages/social/recruitment-detail?id=${id}`
      })
    }
  }
}
</script>

<style scoped>
.job-records-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.records-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  border-bottom: 1rpx solid #f0f0f0;
  padding: 20rpx 0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.record-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.record-date {
  font-size: 20rpx;
  color: #999;
}

.record-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.record-company {
  font-size: 22rpx;
  color: #666;
}

.record-salary {
  font-size: 22rpx;
  color: #ff4d4f;
  font-weight: 600;
}

.record-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.tag {
  background-color: #f5f5f5;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 18rpx;
  color: #666;
}

.view-btn {
  width: 100%;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  border: none;
}

.footer {
  margin-top: 30rpx;
  text-align: center;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
}

.footer-text {
  font-size: 20rpx;
  color: #999;
}
</style>