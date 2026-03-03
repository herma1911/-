<template>
  <view class="my-page-container">
    <view class="user-info-section">
      <view class="user-avatar" @click="goToPersonalInfo">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" class="avatar-image"></image>
        <text v-else class="avatar-icon">👤</text>
      </view>
      <view class="user-details">
          <text v-if="userInfo.role === '工厂' || userInfo.role === '赫尔玛智能'" class="username">{{userInfo.nickname || userInfo.username || '未登录'}}</text>
          <text class="user-role">{{userRole}}</text>
          <view v-if="userInfo.role === '工厂' || userInfo.role === '赫尔玛智能'" class="user-status" :class="userInfo.status" @click="toggleStatus">
            {{statusText}}
          </view>
        </view>
    </view>
    
    <view class="menu-section">
      <view class="menu-group">
        <text class="menu-group-title">个人信息</text>
        <view class="menu-item" @click="navigateTo('/pages/worker/personal-info')">
          <text class="menu-icon">👤</text>
          <text class="menu-text">个人信息</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/worker/skill-profile')">
          <text class="menu-icon">💼</text>
          <text class="menu-text">技能档案</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./ledger')">
          <text class="menu-icon">📊</text>
          <text class="menu-text">账本</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./growth-center')">
          <text class="menu-icon">🎯</text>
          <text class="menu-text">我的搞钱成长</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./referral-exclusive')">
          <text class="menu-icon">📈</text>
          <text class="menu-text">喊上老乡，一起吃香</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
      
      <view class="menu-group">
        <text class="menu-group-title">收入管理</text>
        <view class="menu-item" @click="navigateTo('./income-management')">
          <text class="menu-icon">💰</text>
          <text class="menu-text">收入管理</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./income-management?tab=extra')">
          <text class="menu-icon">🎁</text>
          <text class="menu-text">额外收入</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./income-analysis')">
          <text class="menu-icon">📈</text>
          <text class="menu-text">收入分析</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
      

      
      <view class="menu-group">
        <text class="menu-group-title">账号管理</text>


        <view v-if="userInfo.role !== '工厂'" class="menu-item" @click="applyForEnterprise">
          <text class="menu-icon">🏭</text>
          <text class="menu-text">申请成为工厂用户</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./privacy-settings')">
          <text class="menu-icon">🔒</text>
          <text class="menu-text">隐私设置</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('./feedback')">
          <text class="menu-icon">💬</text>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item danger" @click="logout">
          <text class="menu-icon">🚪</text>
          <text class="menu-text">退出登录</text>
          <text class="menu-arrow">></text>
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
        username: '',
        role: '个人'
      }
    }
  },
  computed: {
    userRole() {
      return this.userInfo.role || '个人'
    },
    statusText() {
      switch(this.userInfo.status) {
        case 'looking':
          return '找工作';
        case 'exploring':
          return '观望新机会';
        case 'working':
          return '在上班';
        case 'parttime':
          return '做零工';
        default:
          return '设置状态';
      }
    }
  },
  onLoad() {
    this.loadUserInfo()
    
    // 检查是否需要显示个人版引导提示（首次登录）
    const currentRole = this.userInfo.role || '个人'
    if (currentRole === '个人') {
      const hasShownGuide = uni.getStorageSync('personalGuideShown')
      if (!hasShownGuide) {
        // 延迟显示引导提示，确保页面加载完成
        setTimeout(() => {
          this.showPersonalGuide()
        }, 500)
      }
    }
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      this.userInfo = {
        username: '',
        role: '个人',
        avatar: userInfo.avatar || userInfo.wechatInfo?.avatar || '',
        nickname: userInfo.nickname || userInfo.wechatInfo?.nickname || '',
        status: '',
        ...userInfo
      }
    },
    goToPersonalInfo() {
      uni.navigateTo({
        url: '/pages/worker/personal-info'
      })
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },

    switchRole() {
      const currentRole = this.userInfo.role || '个人'
      let roles
      
      if (currentRole === '个人') {
        // 个人版账号只能选择个人角色
        roles = ['个人']
      } else if (currentRole === '工厂') {
        // 工厂版账号只能选择工厂角色
        roles = ['工厂']
      } else {
        // 其他角色可以选择所有角色
        roles = ['工厂', '个人', '赫尔玛智能']
      }
      
      uni.showActionSheet({
        itemList: roles,
        success: (res) => {
          const newRole = roles[res.tapIndex]
          const userInfo = uni.getStorageSync('userInfo')
          const oldRole = userInfo.role
          userInfo.role = newRole
          // 更新isEnterprise状态
          userInfo.isEnterprise = newRole === '工厂' || newRole === '赫尔玛智能'
          uni.setStorageSync('userInfo', userInfo)
          uni.showToast({
            title: '角色切换成功',
            icon: 'success'
          })
          // 重新加载用户信息
          this.loadUserInfo()
          
          // 检查是否需要显示个人版引导提示
          if (newRole === '个人' && oldRole !== '个人') {
            // 从其他角色切换回个人版，显示引导提示
            this.showPersonalGuide()
          }
          
          // 重新加载首页，确保角色切换后显示正确内容
          setTimeout(() => {
            uni.reLaunch({
              url: '../home/home'
            })
          }, 1000)
        }
      })
    },
    
    // 显示个人版引导提示
    showPersonalGuide() {
      // 检查是否已经显示过引导提示
      const hasShownGuide = uni.getStorageSync('personalGuideShown')
      if (!hasShownGuide) {
        // 显示个人版引导提示
        uni.showModal({
          title: '个人版功能引导',
          content: '欢迎使用衣起赚个人版！\n\n核心功能：\n1. 记账 - 轻松记录工作收入\n2. 找工作 - 浏览附近招聘信息\n3. 技能档案 - 展示个人技能和工作经验\n\n开始您的赚钱之旅吧！',
          confirmText: '立即体验',
          showCancel: false,
          success: () => {
            // 标记引导提示已显示
            uni.setStorageSync('personalGuideShown', true)
          }
        })
      }
    },
    applyForEnterprise() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo.isEnterprise) {
        uni.showToast({
          title: '您已经是工厂用户',
          icon: 'none'
        })
        return
      }
      
      // 创建工厂申请表单
      const formData = {
        name: '',
        phone: userInfo.phone || userInfo.username,
        enterpriseName: '',
        address: ''
      }
      
      // 显示表单弹窗
      uni.showModal({
        title: '申请成为工厂用户',
        content: '成为工厂用户后，您将获得更多管理功能，包括订单管理、财务管理等。申请将由系统审核。',
        confirmText: '立即申请',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 显示详细表单
            uni.showModal({
              title: '工厂端申请信息',
              content: '请填写以下信息以完成申请',
              showCancel: false,
              success: () => {
                // 显示详细表单
                uni.showModal({
                  title: '申请信息',
                  content: '请填写详细信息',
                  editable: true,
                  placeholderText: '姓名,电话,工厂名称,联系地址',
                  success: (modalRes) => {
                    if (modalRes.confirm && modalRes.content) {
                      const info = modalRes.content.split(',')
                      if (info.length >= 4) {
                        // 存储申请到本地存储
                        const enterpriseApplications = uni.getStorageSync('enterpriseApplications') || []
                        enterpriseApplications.push({
                          id: Date.now(),
                          userId: userInfo.username,
                          name: info[0].trim(),
                          phone: info[1].trim() || userInfo.phone || userInfo.username,
                          enterpriseName: info[2].trim(),
                          address: info[3].trim(),
                          applyTime: new Date().toISOString(),
                          status: 'pending'
                        })
                        uni.setStorageSync('enterpriseApplications', enterpriseApplications)
                        
                        // 提示申请提交成功
                        uni.showToast({
                          title: '申请已提交，请等待审核',
                          icon: 'success'
                        })
                      } else {
                        uni.showToast({
                          title: '请填写完整信息',
                          icon: 'none'
                        })
                      }
                    }
                  }
                })
              }
            })
          }
        }
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.redirectTo({
              url: '../login/login'
            })
          }
        }
      })
    },
    toggleStatus() {
      const statuses = ['looking', 'exploring', 'working', 'parttime']
      const statusTexts = ['找工作', '观望新机会', '在上班', '做零工']
      
      uni.showActionSheet({
        itemList: statusTexts,
        success: (res) => {
          const newStatus = statuses[res.tapIndex]
          const userInfo = uni.getStorageSync('userInfo') || {}
          userInfo.status = newStatus
          uni.setStorageSync('userInfo', userInfo)
          this.loadUserInfo()
          uni.showToast({
            title: '状态已更新',
            icon: 'success'
          })
        }
      })
    }

  }
}
</script>

<style scoped>
.my-page-container {
  padding: 20rpx;
  background-color: #F5F5F5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

/* 状态颜色 */
.user-status.looking {
  color: #00C851;
  background-color: rgba(0, 200, 81, 0.1);
}

.user-status.exploring {
  color: #FFB800;
  background-color: rgba(255, 184, 0, 0.1);
}

.user-status.working {
  color: #999999;
  background-color: rgba(153, 153, 153, 0.1);
}

.user-status.parttime {
  color: #4A90E2;
  background-color: rgba(74, 144, 226, 0.1);
}

/* 用户信息区域（下方详细信息） */

.user-info-section {
  background-color: #FFFFFF;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  background-color: #E8F0FE;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  overflow: hidden;
  border: 2rpx solid #4A90E2;
}

.avatar-icon {
  font-size: 60rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.user-status {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  margin-top: 10rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-status:active {
  opacity: 0.8;
  transform: scale(0.95);
}

.user-details {
  flex: 1;
}

.username {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 10rpx;
  display: block;
}

.user-role {
  font-size: 20rpx;
  color: #666666;
}

.menu-section {
  background-color: #FFFFFF;
  margin-bottom: 20rpx;
}

.menu-group {
  padding: 20rpx 0;
}

.menu-group-title {
  font-size: 20rpx;
  color: #999999;
  padding: 0 30rpx 15rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  transition: background-color 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: #F5F5F5;
}

.menu-icon {
  font-size: 24rpx;
  margin-right: 20rpx;
  width: 30rpx;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 22rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 20rpx;
  color: #999999;
}

.menu-item.danger {
  color: #FF4D4F;
}

.menu-item.danger .menu-text {
  color: #FF4D4F;
}
</style>