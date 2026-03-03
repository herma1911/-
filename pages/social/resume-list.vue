<template>
  <view class="resume-list-container">
    <view class="header">
      <text class="title">衣起赚</text>
      <text class="job-title">{{currentJob.title}}</text>
    </view>
    
    <!-- 批量操作栏 -->
    <view class="batch-operation-bar">
      <view class="batch-select-switch">
        <text class="batch-select-label">批量选择</text>
        <switch :checked="batchSelectMode" @change="toggleBatchSelectMode"></switch>
      </view>
      <view v-if="batchSelectMode" class="batch-action-buttons">
        <button class="batch-action-button" @click="batchInviteInterview" :disabled="selectedResumes.length === 0">一键邀请面试</button>
        <button class="batch-action-button" @click="batchMarkAsViewed" :disabled="selectedResumes.length === 0">一键标记已查看</button>
      </view>
    </view>
    
    <!-- 筛选区域 -->
    <view class="filter-section">
      <text class="filter-label">类型：</text>
      <view class="filter-buttons">
        <button type="default" :class="['filter-btn', currentFilter.type === '' ? 'active' : '']" @click="setFilter('type', '')">全部</button>
        <button type="default" :class="['filter-btn', currentFilter.type === '针织' ? 'active' : '']" @click="setFilter('type', '针织')">针织</button>
        <button type="default" :class="['filter-btn', currentFilter.type === '梭织' ? 'active' : '']" @click="setFilter('type', '梭织')">梭织</button>
      </view>
    </view>
    
    <view class="filter-section">
      <text class="filter-label">技能：</text>
      <view class="filter-buttons skill-buttons">
        <button type="default" :class="['filter-btn', currentFilter.skills.length === 0 ? 'active' : '']" @click="clearSkills">全部</button>
        <button type="default" :class="['filter-btn', currentFilter.skills.includes('平车') ? 'active' : '']" @click="toggleSkill('平车')">平车</button>
        <button type="default" :class="['filter-btn', currentFilter.skills.includes('拷边') ? 'active' : '']" @click="toggleSkill('拷边')">拷边</button>
        <button type="default" :class="['filter-btn', currentFilter.skills.includes('开口袋') ? 'active' : '']" @click="toggleSkill('开口袋')">开口袋</button>
        <button type="default" :class="['filter-btn', currentFilter.skills.includes('装拉链') ? 'active' : '']" @click="toggleSkill('装拉链')">装拉链</button>
        <button type="default" :class="['filter-btn', currentFilter.skills.includes('裁剪') ? 'active' : '']" @click="toggleSkill('裁剪')">裁剪</button>
        <button type="default" :class="['filter-btn', currentFilter.skills.includes('大烫') ? 'active' : '']" @click="toggleSkill('大烫')">大烫</button>
      </view>
    </view>
    
    <view class="filter-section">
      <text class="filter-label">经验：</text>
      <view class="filter-buttons">
        <button type="default" :class="['filter-btn', currentFilter.experience === '' ? 'active' : '']" @click="setFilter('experience', '')">全部</button>
        <button type="default" :class="['filter-btn', currentFilter.experience === '熟手' ? 'active' : '']" @click="setFilter('experience', '熟手')">熟手 (3年以上)</button>
        <button type="default" :class="['filter-btn', currentFilter.experience === '新手' ? 'active' : '']" @click="setFilter('experience', '新手')">新手 (1年以下)</button>
      </view>
    </view>
    
    <view class="resume-list">
      <view v-for="(resume, index) in filteredResumes" :key="index" class="resume-item">
        <!-- 卡片主体 -->
        <view class="resume-card">
          <!-- 选择框 -->
          <view v-if="batchSelectMode" class="resume-checkbox">
            <checkbox :value="resume.id" :checked="selectedResumes.includes(resume.id)" @change="toggleSelectResume(resume.id)"></checkbox>
          </view>
          
          <!-- 左侧：工人头像 + 姓名 + 年龄 -->
          <view class="resume-left">
            <view class="worker-avatar">
              <text class="avatar-icon">👤</text>
            </view>
            <view class="worker-info">
              <text class="worker-name">{{resume.name}}</text>
              <text class="worker-age">{{resume.age}}岁</text>
            </view>
          </view>
          
          <!-- 中部：核心技能 + 期望薪资 -->
          <view class="resume-center">
            <text class="core-skill">{{resume.skills.length > 0 ? resume.skills[0] + '，' + resume.experience : '无技能'}}</text>
            <text class="expected-salary">期望薪资：{{resume.expectedSalary}}</text>
          </view>
          
          <!-- 右侧：操作按钮 -->
          <view class="resume-right">
            <button class="action-button view-button" @click="navigateTo('./resume-detail?id=' + resume.id)">查看简历</button>
            <button class="action-button invite-button" @click="inviteInterview(resume.id)">邀请面试</button>
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
      jobId: '',
      currentJob: {
        title: '服装设计师'
      },
      resumeList: [],
      currentFilter: {
        type: '',
        skills: [],
        experience: ''
      },
      batchSelectMode: false,
      selectedResumes: []
    }
  },
  onLoad(options) {
    if (options.jobId) {
      this.jobId = options.jobId
      this.loadJobInfo()
    }
    this.loadResumes()
  },
  computed: {
    filteredResumes() {
      return this.resumeList.filter(resume => {
        const typeMatch = !this.currentFilter.type || resume.type === this.currentFilter.type
        const skillMatch = this.currentFilter.skills.length === 0 || this.currentFilter.skills.some(skill => resume.skills.includes(skill))
        
        // 经验筛选
        let experienceMatch = true
        if (this.currentFilter.experience) {
          const workYears = parseInt(resume.experience) || 0
          if (this.currentFilter.experience === '熟手') {
            experienceMatch = workYears >= 3
          } else if (this.currentFilter.experience === '新手') {
            experienceMatch = workYears < 1
          }
        }
        
        return typeMatch && skillMatch && experienceMatch
      })
    }
  },
  methods: {
    loadJobInfo() {
      // 这里可以根据jobId加载职位信息
      // 暂时使用模拟数据
    },
    loadResumes() {
      // 加载所有注册用户的简历
      const allResumes = []
      
      // 加载当前用户的技能档案
      const skillProfile = uni.getStorageSync('skillProfile')
      if (skillProfile) {
        // 获取用户状态
        const userStatus = uni.getStorageSync('userStatus')
        let statusText = '可关注'
        let statusType = 'followable'
        
        if (userStatus) {
          if (userStatus.type === 'looking') {
            statusText = '找活中'
            statusType = 'looking'
          } else if (userStatus.type === 'followable') {
            statusText = '可关注'
            statusType = 'followable'
          } else if (userStatus.type === 'notLooking') {
            statusText = '暂不找活'
            statusType = 'notLooking'
          }
        }
        
        // 将技能档案转换为简历格式
        const userResume = {
          id: 1,
          name: skillProfile.name || '未填写',
          age: skillProfile.age || '未填写',
          education: '未填写',
          experience: (skillProfile.workYears || 0) + '年经验',
          expectedSalary: skillProfile.expectedSalary || '面议',
          type: skillProfile.type || '',
          skills: skillProfile.skills || [],
          applyDate: new Date().toISOString().split('T')[0],
          statusText: statusText,
          statusType: statusType
        }
        allResumes.push(userResume)
      }
      
      // 添加一些示例简历数据，模拟其他注册用户
      const sampleResumes = [
        {
          id: 2,
          name: '张三',
          age: '28',
          education: '高中',
          experience: '5年经验',
          expectedSalary: '8500-10500元/月',
          type: '针织',
          skills: ['平车', '拷边', '开口袋', '上拉链'],
          applyDate: new Date().toISOString().split('T')[0],
          statusText: '找活中',
          statusType: 'looking'
        },
        {
          id: 3,
          name: '李四',
          age: '35',
          education: '初中',
          experience: '10年经验',
          expectedSalary: '10500-12500元/月',
          type: '梭织',
          skills: ['装拉链', '拉腰', '装领', '整烫'],
          applyDate: new Date().toISOString().split('T')[0],
          statusText: '可关注',
          statusType: 'followable'
        },
        {
          id: 4,
          name: '王五',
          age: '25',
          education: '中专',
          experience: '3年经验',
          expectedSalary: '6500-8500元/月',
          type: '针织',
          skills: ['双针卷边', '四针六线', '平车'],
          applyDate: new Date().toISOString().split('T')[0],
          statusText: '暂不找活',
          statusType: 'notLooking'
        },
        {
          id: 5,
          name: '赵六',
          age: '32',
          education: '中专',
          experience: '8年经验',
          expectedSalary: '9000-11000元/月',
          type: '梭织',
          skills: ['裁剪', '排料', '版型设计'],
          applyDate: new Date().toISOString().split('T')[0],
          statusText: '找活中',
          statusType: 'looking'
        },
        {
          id: 6,
          name: '孙七',
          age: '26',
          education: '高中',
          experience: '4年经验',
          expectedSalary: '7000-9000元/月',
          type: '针织',
          skills: ['质检', '品质控制', '验货'],
          applyDate: new Date().toISOString().split('T')[0],
          statusText: '找活中',
          statusType: 'looking'
        }
      ]
      
      // 合并当前用户简历和示例简历
      allResumes.push(...sampleResumes)
      
      // 显示所有状态的简历，根据状态显示不同权限
      this.resumeList = allResumes
    },
    setFilter(filterType, value) {
      this.currentFilter[filterType] = value
    },
    toggleSkill(skill) {
      const index = this.currentFilter.skills.indexOf(skill)
      if (index === -1) {
        this.currentFilter.skills.push(skill)
      } else {
        this.currentFilter.skills.splice(index, 1)
      }
    },
    clearSkills() {
      this.currentFilter.skills = []
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    shareResume(resume) {
      // 生成简历分享内容
      const shareContent = `【简历分享】\n姓名：${resume.name}\n年龄：${resume.age}岁\n工作经验：${resume.experience}\n期望薪资：${resume.expectedSalary}\n技能专长：${resume.skills.join(', ')}\n\n查看详情请通过平台联系`
      
      // 显示分享选项
      uni.showActionSheet({
        itemList: ['分享到微信好友', '分享到朋友圈', '复制简历信息'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 分享到微信好友
            uni.showToast({
              title: '已选择分享到微信好友',
              icon: 'none'
            })
          } else if (res.tapIndex === 1) {
            // 分享到朋友圈
            uni.showToast({
              title: '已选择分享到朋友圈',
              icon: 'none'
            })
          } else if (res.tapIndex === 2) {
            // 复制简历信息
            uni.setClipboardData({
              data: shareContent,
              success: () => {
                uni.showToast({
                  title: '简历信息已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    goToSkillProfile() {
      uni.navigateTo({
        url: '../worker/skill-profile'
      })
    },
    followWorker(workerId) {
      uni.showToast({
        title: '已关注该工人',
        icon: 'success'
      })
    },
    inviteInterview(workerId) {
      uni.showToast({
        title: '面试邀请已发送',
        icon: 'success'
      })
    },
    toggleBatchSelectMode(e) {
      this.batchSelectMode = e.detail.value
      if (!this.batchSelectMode) {
        this.selectedResumes = []
      }
    },
    toggleSelectResume(resumeId) {
      const index = this.selectedResumes.indexOf(resumeId)
      if (index === -1) {
        this.selectedResumes.push(resumeId)
      } else {
        this.selectedResumes.splice(index, 1)
      }
    },
    batchInviteInterview() {
      if (this.selectedResumes.length === 0) {
        return
      }
      uni.showToast({
        title: `已发送${this.selectedResumes.length}个面试邀请`,
        icon: 'success'
      })
    },
    batchMarkAsViewed() {
      if (this.selectedResumes.length === 0) {
        return
      }
      uni.showToast({
        title: `已标记${this.selectedResumes.length}个简历为已查看`,
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.resume-list-container {
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
  margin-bottom: 10rpx;
  display: block;
}

.job-title {
  font-size: 24rpx;
  color: #666;
}

/* 批量操作栏 */
.batch-operation-bar {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.batch-select-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.batch-select-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
}

.batch-action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.batch-action-button {
  flex: 1;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  background-color: #4A90E2;
  color: #fff;
}

.batch-action-button:disabled {
  background-color: #E0E0E0;
  color: #9E9E9E;
}

/* 筛选区域样式 */
.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-label {
  font-size: 24rpx;
  color: #333;
  margin-right: 15rpx;
}

.filter-buttons {
  display: flex;
  gap: 10rpx;
}

.filter-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.filter-btn.active {
  background-color: #4A90E2;
  color: #fff;
}

.skill-buttons {
  flex-wrap: wrap;
  gap: 10rpx;
  max-width: calc(100% - 100rpx);
}

.resume-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.resume-item {
  margin-bottom: 0;
}

/* 卡片主体 */
.resume-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 24rpx;
  transition: all 0.3s ease;
}

.resume-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

/* 复选框样式 */
.resume-checkbox {
  flex: 0 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

checkbox {
  transform: scale(1.2);
}

/* 左侧：工人头像 + 姓名 + 年龄 */
.resume-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 120rpx;
}

.worker-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #E3F2FD;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.avatar-icon {
  font-size: 40rpx;
}

.worker-info {
  text-align: center;
}

.worker-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.worker-age {
  font-size: 20rpx;
  color: #666;
}

/* 中部：核心技能 + 期望薪资 */
.resume-center {
  flex: 1;
  min-width: 0;
}

.core-skill {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expected-salary {
  font-size: 22rpx;
  color: #666;
}

/* 右侧：操作按钮 */
.resume-right {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.action-button {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 500;
  min-width: 120rpx;
  text-align: center;
}

.view-button {
  background-color: #E3F2FD;
  color: #2196F3;
  border: 1rpx solid #2196F3;
}

.invite-button {
  background-color: #52c41a;
  color: white;
  border: 1rpx solid #52c41a;
}
</style>