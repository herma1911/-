<template>
  <view class="worker-search-container">
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
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input type="text" v-model="searchKeyword" placeholder="搜索工人姓名或技能" class="search-input" />
      <button class="search-btn" @click="search">搜索</button>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-section">
      <text class="filter-title">筛选条件</text>
      <view class="filter-tags">
        <view 
          v-for="filter in filters" 
          :key="filter.id"
          :class="['filter-tag', { active: selectedFilters.includes(filter.id) }]"
          @click="toggleFilter(filter.id)"
        >
          {{ filter.name }}
        </view>
      </view>
    </view>
    
    <!-- 排名提示条 -->
    <view class="rank-tip">
      <text class="rank-tip-text">工厂排名越高，越先被工人看到 → </text>
      <text class="rank-rule-link" @click="viewRankRules">查看规则</text>
    </view>
    
    <!-- 拉新活动提示 -->
    <view class="invite-tip">
      <text class="invite-title">邀请同行入驻，双方都涨曝光！</text>
      <text class="invite-subtitle">不止是拉新，更是为自己涨流量！</text>
      <text class="invite-content">邀请好友工厂入驻「衣起赚」，双方均可获得高额积分！让更多靠谱的熟练工汇聚在你的平台。人多势众，排名靠前，招工更容易！</text>
    </view>
    
    <!-- 工人列表 -->
    <view class="worker-list">
      <view v-for="(worker, index) in filteredWorkers" :key="worker.id" class="worker-card">
        <!-- 状态指示器 -->
        <view class="status-indicator" :class="worker.status">
          <text class="status-text">{{ worker.status === 'looking' ? '找活中' : worker.status === 'followable' ? '可关注' : '暂不找活' }}</text>
        </view>
        
        <view class="worker-header">
          <text class="worker-name">{{ worker.name }}</text>
          <text class="worker-tags">
            <text v-for="(tag, index) in worker.tags" :key="index" class="tag">{{ tag }}</text>
          </text>
        </view>
        
        <!-- 找活中和可关注状态显示完整信息 -->
        <template v-if="worker.status === 'looking' || worker.status === 'followable'">
          <view class="worker-achievements">
            <text class="achievement-text">记账实绩：{{ worker.achievements }}</text>
          </view>
          
          <view class="worker-skills">
            <text class="skills-label">擅长：</text>
            <text class="skills-list">{{ worker.skills.join('、') }}</text>
          </view>
          
          <view class="worker-evaluation">
            <text class="evaluation-label">工厂评价：</text>
            <text class="evaluation-content">{{ worker.evaluation }}</text>
          </view>
          
          <view class="worker-footer">
            <button class="view-resume-btn" @click="viewResume(worker.id)">查看简历</button>
            <button v-if="worker.status === 'looking'" class="contact-btn" @click="contactWorker(worker)">联系工人</button>
            <button class="follow-btn" @click="followWorker(worker.id)">关注</button>
          </view>
        </template>
        
        <!-- 暂不找活状态只显示名字+工序 -->
        <template v-else>
          <view class="worker-skills">
            <text class="skills-label">擅长：</text>
            <text class="skills-list">{{ worker.skills.join('、') }}</text>
          </view>
          
          <view class="worker-footer">
            <button class="disabled-btn">不可查看</button>
            <button class="disabled-btn">不可联系</button>
          </view>
        </template>
      </view>
      
      <view v-if="filteredWorkers.length === 0" class="empty-state">
        <text class="empty-text">暂无符合条件的工人</text>
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
      userStatus: 'looking', // looking: 找活中, followable: 可关注, notLooking: 暂不找
      searchKeyword: '',
      selectedFilters: [],
      filters: [
        // 工序筛选
        { id: 'process-flat', name: '平车' },
        { id: 'process-collar', name: '装领' },
        { id: 'process-waist', name: '上腰' },
        { id: 'process-overlock', name: '拷边' },
        { id: 'process-buttonhole', name: '锁眼' },
        { id: 'process-button', name: '钉扣' },
        { id: 'process-ironing', name: '整烫' },
        // 熟练度筛选
        { id: 'proficiency-skilled', name: '熟练' },
        { id: 'proficiency-master', name: '精通' },
        { id: 'proficiency-expert', name: '大师' },
        // 其他筛选
        { id: 'all-round', name: '全能工' },
        { id: 'peer-recognition', name: '工友认可高' },
        { id: 'ledger', name: '有记账实绩' }
      ],
      workers: [
        {
          id: 1,
          name: '李四',
          status: 'looking',
          tags: ['🏅', '全能工', '人气好手'],
          achievements: '装领 28600 件｜精通',
          skills: ['平车', '装领', '上腰', '拷边'],
          evaluation: '手艺稳、速度快',
          contact: '138****1234',
          processes: ['平车', '装领', '上腰', '拷边'],
          proficiency: '精通',
          peerRecognition: 46,
          hasLedger: true
        },
        {
          id: 2,
          name: '张三',
          status: 'followable',
          tags: ['⭐', '熟练工'],
          achievements: '平车 32000 件｜精通',
          skills: ['平车', '拷边', '装拉链'],
          evaluation: '技术好、态度认真',
          contact: '139****5678',
          processes: ['平车', '拷边'],
          proficiency: '熟练',
          peerRecognition: 28,
          hasLedger: true
        },
        {
          id: 3,
          name: '王五',
          status: 'looking',
          tags: ['🏆', '全能工', '效率王'],
          achievements: '上腰 25000 件｜精通',
          skills: ['平车', '上腰', '装领', '开口袋'],
          evaluation: '速度快、质量高',
          contact: '137****9012',
          processes: ['平车', '上腰', '装领'],
          proficiency: '大师',
          peerRecognition: 52,
          hasLedger: true
        },
        {
          id: 4,
          name: '赵六',
          status: 'notLooking',
          tags: ['🌟', '技术能手'],
          achievements: '锁眼 15000 件｜精通',
          skills: ['锁眼', '钉扣', '整烫'],
          evaluation: '手艺精细、态度认真',
          contact: '135****6789',
          processes: ['锁眼', '钉扣', '整烫'],
          proficiency: '精通',
          peerRecognition: 35,
          hasLedger: true
        }
      ]
    }
  },
  computed: {
    filteredWorkers() {
      let result = [...this.workers]
      
      // 搜索过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(worker => 
          worker.name.toLowerCase().includes(keyword) ||
          worker.skills.some(skill => skill.toLowerCase().includes(keyword))
        )
      }
      
      // 筛选条件过滤
      
      // 工序筛选
      const processFilters = this.selectedFilters.filter(filter => filter.startsWith('process-'))
      if (processFilters.length > 0) {
        result = result.filter(worker => {
          return processFilters.some(filter => {
            const processName = filter.replace('process-', '')
            switch (processName) {
              case 'flat': return worker.processes.includes('平车')
              case 'collar': return worker.processes.includes('装领')
              case 'waist': return worker.processes.includes('上腰')
              case 'overlock': return worker.processes.includes('拷边')
              case 'buttonhole': return worker.processes.includes('锁眼')
              case 'button': return worker.processes.includes('钉扣')
              case 'ironing': return worker.processes.includes('整烫')
              default: return false
            }
          })
        })
      }
      
      // 熟练度筛选
      const proficiencyFilters = this.selectedFilters.filter(filter => filter.startsWith('proficiency-'))
      if (proficiencyFilters.length > 0) {
        result = result.filter(worker => {
          return proficiencyFilters.some(filter => {
            const proficiencyLevel = filter.replace('proficiency-', '')
            switch (proficiencyLevel) {
              case 'skilled': return worker.proficiency === '熟练'
              case 'master': return worker.proficiency === '精通'
              case 'expert': return worker.proficiency === '大师'
              default: return false
            }
          })
        })
      }
      
      // 全能工筛选
      if (this.selectedFilters.includes('all-round')) {
        result = result.filter(worker => worker.tags.includes('全能工'))
      }
      
      // 工友认可高筛选
      if (this.selectedFilters.includes('peer-recognition')) {
        result = result.filter(worker => worker.peerRecognition >= 30)
      }
      
      // 有记账实绩筛选
      if (this.selectedFilters.includes('ledger')) {
        result = result.filter(worker => worker.hasLedger)
      }
      
      return result
    },
    userStatusText() {
      switch (this.userStatus) {
        case 'looking': return '找活中'
        case 'followable': return '可关注'
        case 'notLooking': return '暂不找'
        default: return '找活中'
      }
    },
    userStatusClass() {
      switch (this.userStatus) {
        case 'looking': return 'status-looking'
        case 'followable': return 'status-followable'
        case 'notLooking': return 'status-not-looking'
        default: return ''
      }
    }
  },
  onLoad() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    goToMyPage() {
      uni.navigateTo({
        url: '../worker/my-page'
      })
    },
    showStatusSelection() {
      uni.showActionSheet({
        itemList: ['找活中', '可关注', '暂不找'],
        success: (res) => {
          const statusMap = ['looking', 'followable', 'notLooking']
          this.userStatus = statusMap[res.tapIndex]
          uni.showToast({
            title: '状态已更新',
            icon: 'success'
          })
        }
      })
    },
    search() {
      // 搜索逻辑已在computed中实现
    },
    toggleFilter(filterId) {
      const index = this.selectedFilters.indexOf(filterId)
      if (index > -1) {
        this.selectedFilters.splice(index, 1)
      } else {
        this.selectedFilters.push(filterId)
      }
    },
    contactWorker(worker) {
      uni.showModal({
        title: '联系工人',
        content: `工人姓名：${worker.name}\n联系方式：${worker.contact}\n是否确认联系？`,
        confirmText: '确认联系',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '联系信息已发送',
              icon: 'success'
            })
          }
        }
      })
    },
    viewResume(workerId) {
      uni.navigateTo({
        url: './resume-detail?id=' + workerId
      })
    },
    viewRankRules() {
      uni.navigateTo({
        url: '../factory/score-rules'
      })
    },
    followWorker(workerId) {
      uni.showToast({
        title: '已关注该工人',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.worker-search-container {
  padding: 20rpx 20rpx 20rpx 220dp;
  background-color: #f5f5f5;
  min-height: 100vh;
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

/* 排名提示条 */
.rank-tip {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 15rpx 0;
  padding: 10rpx 15rpx;
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 8rpx;
}

.rank-tip-text {
  font-size: 16rpx;
  color: #52c41a;
  margin-right: 5rpx;
}

.rank-rule-link {
  font-size: 16rpx;
  color: #1677FF;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.3s ease;
}

.rank-rule-link:active {
  color: #096dd9;
}

/* 拉新活动提示 */
.invite-tip {
  background-color: #fff7e6;
  border: 1rpx solid #ffd591;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 15rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(250, 140, 22, 0.1);
}

.invite-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #fa8c16;
  display: block;
  margin-bottom: 10rpx;
  text-align: center;
}

.invite-subtitle {
  font-size: 20rpx;
  color: #d46b08;
  display: block;
  margin-bottom: 15rpx;
  text-align: center;
}

.invite-content {
  font-size: 18rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  text-align: center;
}

.filter-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.filter-tag {
  padding: 10rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag.active {
  background-color: #4A90E2;
  color: #fff;
}

.worker-list {
  gap: 20rpx;
}

.worker-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 16rpx;
  font-weight: bold;
}

.status-indicator.looking {
  background-color: #52c41a;
  color: #fff;
}

.status-indicator.followable {
  background-color: #faad14;
  color: #fff;
}

.status-indicator.notLooking {
  background-color: #999;
  color: #fff;
}

.status-text {
  font-size: 16rpx;
}

.worker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.worker-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.worker-tags {
  display: flex;
  gap: 10rpx;
}

.tag {
  font-size: 22rpx;
  color: #4A90E2;
}

.worker-achievements {
  margin-bottom: 15rpx;
}

.achievement-text {
  font-size: 24rpx;
  color: #666;
}

.worker-skills {
  margin-bottom: 15rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.skills-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.skills-list {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.worker-evaluation {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.evaluation-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.evaluation-content {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.worker-footer {
  display: flex;
  justify-content: flex-end;
}

.view-resume-btn {
  background-color: #f0f0f0;
  color: #333;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 20rpx;
  margin-right: 10rpx;
}

.contact-btn {
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 20rpx;
  margin-right: 10rpx;
}

.follow-btn {
  background-color: #1890ff;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 20rpx;
}

.disabled-btn {
  background-color: #f0f0f0;
  color: #999;
  border: 1rpx solid #ddd;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 20rpx;
  margin-right: 10rpx;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-text {
  font-size: 24rpx;
  color: #999;
}
</style>