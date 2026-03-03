<template>
  <view class="enterprise-list-container">
    <view class="header">
      <text class="title">所有企业列表</text>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input type="text" v-model="searchKeyword" placeholder="搜索企业名称" class="search-input" />
      <button class="search-btn" @click="search">搜索</button>
    </view>
    
    <!-- 企业列表 -->
    <view class="enterprise-list">
      <view v-for="(enterprise, index) in filteredEnterprises" :key="enterprise.id" class="enterprise-item">
        <view class="enterprise-header">
          <text class="enterprise-name">{{ enterprise.name }}</text>
          <text class="enterprise-status" :class="enterprise.status === 'active' ? 'status-active' : 'status-inactive'">
            {{ enterprise.status === 'active' ? '活跃' : '未激活' }}
          </text>
        </view>
        <view class="enterprise-details">
          <text class="detail-text">负责人：{{ enterprise.manager || '未设置' }}</text>
          <text class="detail-text">联系方式：{{ enterprise.phone || '未设置' }}</text>
          <text class="detail-text">企业名称：{{ enterprise.name || '未设置' }}</text>
          <text class="detail-text">联系地址：{{ enterprise.address || '未设置' }}</text>
          <text class="detail-text">注册时间：{{ enterprise.registerTime || '未知' }}</text>
          <text class="detail-text">员工数量：{{ enterprise.employeeCount || 0 }}人</text>
        </view>
        <view class="enterprise-actions">
          <button class="action-btn view-btn" @click="viewEnterpriseDetail(enterprise.id)">查看详情</button>
          <button class="action-btn enter-btn" @click="enterEnterprise(enterprise)">进入企业</button>
          <button class="action-btn manage-btn" @click="manageEnterprise(enterprise.id)">管理企业</button>
          <button class="action-btn evaluation-btn" @click="manageEvaluations(enterprise.id)">评价管理</button>
        </view>
      </view>
      <view v-if="filteredEnterprises.length === 0" class="empty-state">
        <text>暂无企业数据</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      enterprises: []
    }
  },
  onLoad() {
    this.loadEnterprises()
  },
  computed: {
    filteredEnterprises() {
      if (!this.searchKeyword) {
        return this.enterprises
      }
      return this.enterprises.filter(enterprise => 
        enterprise.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        enterprise.manager.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        enterprise.phone.includes(this.searchKeyword)
      )
    }
  },
  methods: {
    loadEnterprises() {
      // 从本地存储加载企业数据
      const enterpriseApplications = uni.getStorageSync('enterpriseApplications') || []
      const approvedEnterprises = enterpriseApplications.filter(app => app.status === 'approved')
      
      // 构建企业列表数据
      this.enterprises = approvedEnterprises.map(app => ({
        id: app.id,
        name: app.enterpriseName || app.userId,
        manager: app.name || app.userId,
        phone: app.phone,
        address: app.address || '未提供',
        registerTime: new Date(app.approveTime).toLocaleString(),
        status: 'active',
        employeeCount: Math.floor(Math.random() * 50) + 5 // 模拟员工数量
      }))
      
      // 可以从其他存储中加载更多企业数据
      const additionalEnterprises = uni.getStorageSync('enterprises') || []
      this.enterprises = [...this.enterprises, ...additionalEnterprises]
    },
    search() {
      // 搜索逻辑已在computed中实现
    },
    viewEnterpriseDetail(enterpriseId) {
      uni.showModal({
        title: '企业详情',
        content: `企业ID: ${enterpriseId}\n\n功能开发中，敬请期待！`,
        showCancel: false
      })
    },
    manageEnterprise(enterpriseId) {
      uni.showModal({
        title: '企业管理',
        content: `企业ID: ${enterpriseId}\n\n功能开发中，敬请期待！`,
        showCancel: false
      })
    },
    enterEnterprise(enterprise) {
      // 保存当前选择的企业信息
      uni.setStorageSync('currentEnterprise', enterprise)
      
      // 切换角色为企业版
      const userInfo = uni.getStorageSync('userInfo') || {}
      const tempUserInfo = {
        ...userInfo,
        role: '企业版',
        enterpriseId: enterprise.id,
        enterpriseName: enterprise.name,
        isTemporary: true // 标记为临时切换
      }
      
      // 保存临时用户信息
      uni.setStorageSync('tempUserInfo', tempUserInfo)
      
      // 跳转到首页
      uni.reLaunch({
        url: '../home/home'
      })
    },
    manageEvaluations(enterpriseId) {
      // 跳转到评价管理页面
      uni.navigateTo({
        url: './evaluation-management'
      })
    }
  }
}
</script>

<style scoped>
.enterprise-list-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

.search-bar {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.search-btn {
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  padding: 0 30rpx;
  border-radius: 10rpx;
}

.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.enterprise-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.enterprise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.enterprise-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.enterprise-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.status-active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.enterprise-details {
  margin-bottom: 15rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.enterprise-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.view-btn {
  background-color: #f0f0f0;
  color: #333;
}

.enter-btn {
  background-color: #52c41a;
  color: #fff;
}

.manage-btn {
  background-color: #4A90E2;
  color: #fff;
}

.evaluation-btn {
  background-color: #73d13d;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-state text {
  font-size: 24rpx;
  color: #999;
}
</style>