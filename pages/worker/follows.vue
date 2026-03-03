<template>
  <view class="follows-container">
    <!-- 顶部左侧个人信息区域 -->
    <view class="top-left-section">
      <view class="user-avatar" @click="goToMyPage">
        <text class="avatar-icon">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.username || '138****1234' }}</text>
        <text class="user-status" :class="userStatus" @click="showStatusSelection">{{ userStatusText }}</text>
      </view>
    </view>
    
    <!-- 顶部Tab切换栏 -->
    <view class="tab-container">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'workers' }"
        @click="switchTab('workers')"
      >
        <text class="tab-text">我关注的工人</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'factories' }"
        @click="switchTab('factories')"
      >
        <text class="tab-text">我关注的工厂</text>
      </view>
    </view>
    
    <!-- 批量操作按钮 -->
    <view class="batch-operation" v-if="(activeTab === 'workers' && followedWorkers.length > 0) || (activeTab === 'factories' && followedFactories.length > 0)">
      <button class="batch-button" @click="showBatchCancel">批量取消关注</button>
    </view>
    
    <!-- 我关注的工人列表 -->
    <view v-if="activeTab === 'workers'" class="follows-list">
      <!-- 空列表提示 -->
      <view v-if="followedWorkers.length === 0" class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-title">还没有关注的工人</text>
        <text class="empty-content">关注靠谱工友，第一时间看他的状态和战绩～</text>
        <button class="recommend-button" @click="showWorkerRecommendations">推荐工友</button>
      </view>
      
      <!-- 工人列表 -->
      <view v-else class="worker-item" v-for="(worker, index) in sortedWorkers" :key="worker.id">
        <view class="worker-avatar" @click="navigateToWorkerProfile(worker.id)">
          <text class="avatar-icon">{{worker.avatar}}</text>
        </view>
        <view class="worker-info" @click="navigateToWorkerProfile(worker.id)">
          <view class="worker-header">
            <text class="worker-name">{{worker.name}} {{worker.age}}岁</text>
            <view class="worker-status" :class="worker.status">
              <text class="status-text">{{worker.statusText}}</text>
            </view>
          </view>
          <text class="worker-skills">{{worker.skills.join('·')}}</text>
          <text class="worker-achievement">
            {{worker.latestAchievement.skill}} {{worker.latestAchievement.count}}件
            <text v-if="worker.hasNewUpdate" class="new-indicator">新</text>
          </text>
        </view>
        <view class="worker-actions">
          <button class="message-button" @click="sendMessageToWorker(worker.id)">发消息</button>
          <button class="unfollow-button" @click="unfollowWorker(worker.id)">取消关注</button>
        </view>
      </view>
    </view>
    
    <!-- 我关注的工厂列表 -->
    <view v-else-if="activeTab === 'factories'" class="follows-list">
      <!-- 空列表提示 -->
      <view v-if="followedFactories.length === 0" class="empty-state">
        <text class="empty-icon">🏭</text>
        <text class="empty-title">还没有关注的工厂</text>
        <text class="empty-content">关注心仪工厂，招工信息早知道～</text>
        <button class="recommend-button" @click="showFactoryRecommendations">推荐工厂</button>
      </view>
      
      <!-- 工厂列表 -->
      <view v-else class="factory-item" v-for="(factory, index) in followedFactories" :key="factory.id">
        <view class="factory-avatar" @click="navigateToFactoryProfile(factory.id)">
          <text class="avatar-icon">{{factory.avatar}}</text>
        </view>
        <view class="factory-info" @click="navigateToFactoryProfile(factory.id)">
          <text class="factory-name">{{factory.name}}</text>
          <text class="factory-address">{{factory.address}}</text>
          <text v-if="factory.latestRecruitment" class="factory-recruitment">
            {{factory.latestRecruitment}}
            <text v-if="factory.hasNewRecruitment" class="new-indicator">招工</text>
          </text>
        </view>
        <view class="factory-actions">
          <button class="message-button" @click="sendMessageToFactory(factory.id)">发消息</button>
          <button class="unfollow-button" @click="unfollowFactory(factory.id)">取消关注</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        username: ''
      },
      userStatus: 'urgent', // urgent: 急找工作, opportunity: 看新机会, working: 在上班, partTime: 做零工
      activeTab: 'workers', // workers 或 factories
      followedWorkers: [],
      followedFactories: [],
      recommendedWorkers: [],
      recommendedFactories: []
    }
  },
  computed: {
    // 排序工人列表：找活中的工人置顶，然后按最新更新时间排序
    sortedWorkers() {
      return [...this.followedWorkers].sort((a, b) => {
        // 状态排序：找活中 > 可关注 > 暂不找活
        const statusOrder = {
          'looking': 3,
          'followable': 2,
          'notLooking': 1
        }
        
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[b.status] - statusOrder[a.status]
        }
        
        // 按最新更新时间排序
        return new Date(b.lastUpdate) - new Date(a.lastUpdate)
      })
    },
    userStatusText() {
      switch (this.userStatus) {
        case 'urgent': return '急找工作'
        case 'opportunity': return '看新机会'
        case 'working': return '在上班'
        case 'partTime': return '做零工'
        default: return '急找工作'
      }
    },
    userStatusClass() {
      switch (this.userStatus) {
        case 'urgent': return 'status-looking'
        case 'opportunity': return 'status-looking'
        case 'working': return 'status-not-looking'
        case 'partTime': return 'status-followable'
        default: return ''
      }
    }
  },
  onLoad() {
    this.getUserInfo()
    this.loadUserStatus()
    this.loadFollowedWorkers()
    this.loadFollowedFactories()
    this.loadRecommendations()
  },
  methods: {
    getUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    loadUserStatus() {
      const userStatus = uni.getStorageSync('userStatus')
      if (userStatus) {
        this.userStatus = userStatus.type
      }
    },
    goToMyPage() {
      uni.navigateTo({
        url: './my-page'
      })
    },
    showStatusSelection() {
      uni.showActionSheet({
        itemList: ['急找工作', '看新机会', '在上班', '做零工'],
        success: (res) => {
          const statusMap = ['urgent', 'opportunity', 'working', 'partTime']
          this.userStatus = statusMap[res.tapIndex]
          // 保存状态到本地存储
          uni.setStorageSync('userStatus', { type: this.userStatus })
          uni.showToast({
            title: '状态已更新',
            icon: 'success'
          })
        }
      })
    },
    // 切换Tab
    switchTab(tab) {
      this.activeTab = tab
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载关注的工人
    loadFollowedWorkers() {
      // 从本地存储获取关注的工人
      let followedWorkers = uni.getStorageSync('followedWorkers') || []
      
      // 如果没有数据，添加模拟数据
      if (followedWorkers.length === 0) {
        followedWorkers = [
          {
            id: 'worker1',
            avatar: '👨',
            name: '张三',
            age: 32,
            skills: ['平车', '装领'],
            status: 'looking',
            statusText: '找活中',
            latestAchievement: {
              skill: '装领',
              count: '28600'
            },
            hasNewUpdate: true,
            lastUpdate: new Date().toISOString()
          },
          {
            id: 'worker2',
            avatar: '👩',
            name: '李四',
            age: 28,
            skills: ['拷边', '开口袋'],
            status: 'followable',
            statusText: '可关注',
            latestAchievement: {
              skill: '拷边',
              count: '15300'
            },
            hasNewUpdate: false,
            lastUpdate: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'worker3',
            avatar: '👨',
            name: '王五',
            age: 35,
            skills: ['平车', '上腰'],
            status: 'notLooking',
            statusText: '暂不找活',
            latestAchievement: {
              skill: '上腰',
              count: '21500'
            },
            hasNewUpdate: false,
            lastUpdate: new Date(Date.now() - 172800000).toISOString()
          }
        ]
        uni.setStorageSync('followedWorkers', followedWorkers)
      }
      
      this.followedWorkers = followedWorkers
    },
    
    // 加载关注的工厂
    loadFollowedFactories() {
      // 从本地存储获取关注的工厂
      let followedFactories = uni.getStorageSync('followedFactories') || []
      
      // 如果没有数据，添加模拟数据
      if (followedFactories.length === 0) {
        followedFactories = [
          {
            id: 'factory1',
            avatar: '🏭',
            name: 'XX制衣厂',
            address: '广州新塘XX路88号',
            latestRecruitment: '急招平车工 5名',
            hasNewRecruitment: true,
            lastUpdate: new Date().toISOString()
          },
          {
            id: 'factory2',
            avatar: '🏢',
            name: 'YY服装有限公司',
            address: '东莞虎门YY大道123号',
            latestRecruitment: '',
            hasNewRecruitment: false,
            lastUpdate: new Date(Date.now() - 86400000).toISOString()
          }
        ]
        uni.setStorageSync('followedFactories', followedFactories)
      }
      
      this.followedFactories = followedFactories
    },
    
    // 加载推荐数据
    loadRecommendations() {
      // 模拟推荐数据
      this.recommendedWorkers = [
        {
          id: 'recWorker1',
          avatar: '👨',
          name: '赵六',
          age: 30,
          skills: ['平车', '装拉链'],
          status: 'looking',
          statusText: '找活中'
        },
        {
          id: 'recWorker2',
          avatar: '👩',
          name: '钱七',
          age: 26,
          skills: ['拷边', '整烫'],
          status: 'followable',
          statusText: '可关注'
        }
      ]
      
      this.recommendedFactories = [
        {
          id: 'recFactory1',
          avatar: '🏭',
          name: 'ZZ服装厂',
          address: '深圳宝安ZZ路456号'
        },
        {
          id: 'recFactory2',
          avatar: '🏢',
          name: 'AA制衣有限公司',
          address: '佛山南海AA大道789号'
        }
      ]
    },
    
    // 导航到工人技能档案页
    navigateToWorkerProfile(workerId) {
      uni.navigateTo({
        url: './skill-profile?id=' + workerId
      })
    },
    
    // 导航到工厂主页
    navigateToFactoryProfile(factoryId) {
      uni.navigateTo({
        url: '../social/company-details?id=' + factoryId
      })
    },
    // 发送消息给工人
    sendMessageToWorker(workerId) {
      uni.navigateTo({
        url: './chat?userId=' + workerId + '&type=worker'
      })
    },
    // 发送消息给工厂
    sendMessageToFactory(factoryId) {
      uni.navigateTo({
        url: './chat?userId=' + factoryId + '&type=factory'
      })
    },
    
    // 取消关注工人
    unfollowWorker(workerId) {
      uni.showModal({
        title: '取消关注',
        content: '确定要取消关注该工人吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.followedWorkers = this.followedWorkers.filter(worker => worker.id !== workerId)
            uni.setStorageSync('followedWorkers', this.followedWorkers)
            uni.showToast({
              title: '已取消关注',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 取消关注工厂
    unfollowFactory(factoryId) {
      uni.showModal({
        title: '取消关注',
        content: '确定要取消关注该工厂吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.followedFactories = this.followedFactories.filter(factory => factory.id !== factoryId)
            uni.setStorageSync('followedFactories', this.followedFactories)
            uni.showToast({
              title: '已取消关注',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 批量取消关注
    showBatchCancel() {
      uni.showModal({
        title: '批量取消关注',
        content: '确定要取消关注所有' + (this.activeTab === 'workers' ? '工人' : '工厂') + '吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            if (this.activeTab === 'workers') {
              this.followedWorkers = []
              uni.setStorageSync('followedWorkers', [])
            } else {
              this.followedFactories = []
              uni.setStorageSync('followedFactories', [])
            }
            uni.showToast({
              title: '已批量取消关注',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 显示工人推荐
    showWorkerRecommendations() {
      uni.showActionSheet({
        itemList: this.recommendedWorkers.map(worker => worker.name + ' - ' + worker.skills.join('·')),
        success: (res) => {
          const selectedWorker = this.recommendedWorkers[res.tapIndex]
          // 添加到关注列表
          this.followedWorkers.push({
            ...selectedWorker,
            id: 'worker' + Date.now(),
            latestAchievement: {
              skill: selectedWorker.skills[0],
              count: '0'
            },
            hasNewUpdate: false,
            lastUpdate: new Date().toISOString()
          })
          uni.setStorageSync('followedWorkers', this.followedWorkers)
          uni.showToast({
            title: '已关注' + selectedWorker.name,
            icon: 'success'
          })
        }
      })
    },
    
    // 显示工厂推荐
    showFactoryRecommendations() {
      uni.showActionSheet({
        itemList: this.recommendedFactories.map(factory => factory.name + ' - ' + factory.address),
        success: (res) => {
          const selectedFactory = this.recommendedFactories[res.tapIndex]
          // 添加到关注列表
          this.followedFactories.push({
            ...selectedFactory,
            id: 'factory' + Date.now(),
            latestRecruitment: '',
            hasNewRecruitment: false,
            lastUpdate: new Date().toISOString()
          })
          uni.setStorageSync('followedFactories', this.followedFactories)
          uni.showToast({
            title: '已关注' + selectedFactory.name,
            icon: 'success'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.follows-container {
  padding: 20rpx 20rpx 20rpx 220dp;
  min-height: 100vh;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

/* 顶部左侧个人信息区域 */
.top-left-section {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: flex-start;
  z-index: 90;
  max-width: 200dp;
  width: 200dp;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 16dp 0 16dp 16dp;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: blur(10rpx);
}

/* 头像 */
.user-avatar {
  width: 40dp;
  height: 40dp;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 12dp;
}

.user-avatar:active {
  transform: scale(0.95);
}

.avatar-icon {
  font-size: 20px;
  color: #fff;
}

/* 用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16sp;
  color: #333333;
  display: block;
  margin-bottom: 4dp;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态区域 */
.user-status {
  font-size: 12sp;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 15rpx;
  display: inline-block;
  min-height: 44dp;
  line-height: 44dp;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.user-status:active {
  opacity: 0.8;
}

/* 状态颜色 */
.user-status.looking {
  color: #00C851;
  background-color: rgba(0, 200, 81, 0.1);
}

.user-status.followable {
  color: #FFB800;
  background-color: rgba(255, 184, 0, 0.1);
}

.user-status.notLooking {
  color: #999999;
  background-color: rgba(153, 153, 153, 0.1);
}

/* Tab切换栏 */
.tab-container {
  display: flex;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #FF6B35;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #FF6B35;
  border-radius: 2rpx;
}

/* 批量操作 */
.batch-operation {
  margin-bottom: 20rpx;
  text-align: right;
}

.batch-button {
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
}

/* 列表容器 */
.follows-list {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  padding: 60rpx 20rpx;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.empty-content {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  line-height: 1.5;
  display: block;
}

.recommend-button {
  background-color: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 15rpx 40rpx;
  font-size: 28rpx;
}

/* 工人列表项 */
.worker-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.worker-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  cursor: pointer;
}

.avatar-icon {
  font-size: 40rpx;
  color: #fff;
}

.worker-info {
  flex: 1;
  cursor: pointer;
}

.worker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.worker-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.worker-status {
  padding: 4rpx 12rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
}

.worker-status.looking {
  background-color: #e6f7ee;
  color: #52c41a;
}

.worker-status.followable {
  background-color: #fff2e8;
  color: #fa8c16;
}

.worker-status.notLooking {
  background-color: #f5f5f5;
  color: #999;
}

.worker-skills {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.worker-achievement {
  font-size: 22rpx;
  color: #999;
  position: relative;
}

.new-indicator {
  position: absolute;
  top: -10rpx;
  right: -30rpx;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 16rpx;
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
}

.unfollow-button {
  background-color: transparent;
  color: #999;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  margin-left: 10rpx;
}

/* 操作按钮容器 */
.worker-actions,
.factory-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

/* 消息按钮样式 */
.message-button {
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
}

/* 工厂列表项 */
.factory-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.factory-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  background-color: #722ed1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  cursor: pointer;
}

.factory-info {
  flex: 1;
  cursor: pointer;
}

.factory-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.factory-address {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.factory-recruitment {
  font-size: 22rpx;
  color: #FF6B35;
  position: relative;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .worker-item,
  .factory-item {
    padding: 15rpx;
  }
  
  .worker-avatar,
  .factory-avatar {
    width: 60rpx;
    height: 60rpx;
  }
  
  .avatar-icon {
    font-size: 30rpx;
  }
  
  .worker-name,
  .factory-name {
    font-size: 24rpx;
  }
  
  .worker-skills,
  .factory-address {
    font-size: 20rpx;
  }
  
  .worker-achievement,
  .factory-recruitment {
    font-size: 18rpx;
  }
}
</style>