<template>
  <view class="login-container">
    <view class="login-form">
      <!-- 顶部品牌区 -->
      <view class="logo">
        <image src="../../static/logo.png" mode="aspectFit"></image>
        <text class="app-name">衣起赚</text>
        <text class="app-subtitle">服装人找活记账，就用衣起赚</text>
      </view>
      
      <!-- 核心登录按钮区 -->
      <!-- 工人端一键登录 -->
      <button class="wechat-login-btn" @click="wechatLogin">
        <text class="wechat-icon">💬</text>
        <text class="wechat-text">微信一键登录（工人端）</text>
      </button>
      
      <!-- 工厂端登录 -->
      <button class="factory-login-btn" @click="factoryLogin">
        <text class="factory-icon">🏭</text>
        <text class="factory-text">工厂招工管理登录</text>
      </button>
      
      <!-- 底部合规区 -->
      <view class="bottom-links">
        <text class="link-text">用户协议</text>
        <text class="link-divider">|</text>
        <text class="link-text">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script>
import { initUserActivity, recordUserActivity, ACTIVITY_TYPES } from '../../utils/user-activity.js'
export default {
  data() {
    return {
      referralCode: '',
      inviterName: ''
    }
  },
  onLoad(options) {
    // 获取邀请码和邀请人信息
    if (options.referral) {
      this.referralCode = options.referral
    }
    if (options.inviter) {
      this.inviterName = options.inviter
    }
  },
  methods: {
    // 微信一键登录（工人端）
    wechatLogin() {
      // 模拟微信登录
      uni.showLoading({
        title: '微信登录中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        
        // 模拟获取微信用户信息
        const wechatUserInfo = {
          openid: 'wx' + Date.now(),
          nickname: '微信用户' + Math.floor(Math.random() * 1000),
          avatar: 'https://via.placeholder.com/100'
        }
        
        // 保存微信用户信息
        uni.setStorageSync('wechatUserInfo', wechatUserInfo)
        
        // 默认角色为个人（工人端）
        const role = '个人'
        const jobDirection = '找工作'
        
        // 保存用户信息，自动填充微信头像和昵称
        uni.setStorageSync('userInfo', {
          username: wechatUserInfo.openid,
          phone: '',
          role: role,
          jobDirection: jobDirection,
          isEnterprise: false,
          wechatInfo: wechatUserInfo,
          avatar: wechatUserInfo.avatar,
          nickname: wechatUserInfo.nickname
        })
        
        // 同时更新技能档案，自动填充微信信息
        const skillProfile = uni.getStorageSync('skillProfile') || {}
        const updatedSkillProfile = {
          ...skillProfile,
          name: wechatUserInfo.nickname
        }
        uni.setStorageSync('skillProfile', updatedSkillProfile)
        
        // 初始化用户活动数据并记录登录
        const userId = wechatUserInfo.openid
        initUserActivity(userId)
        recordUserActivity(userId, ACTIVITY_TYPES.LOGIN)
        
        // 显示登录成功提示并跳转页面
        uni.showToast({
          title: '微信登录成功',
          icon: 'success',
          duration: 1000,
          success: function() {
            setTimeout(function() {
              uni.redirectTo({
                url: '/pages/worker/employee-home'
              })
            }, 1000)
          }
        })
      }, 1000)
    },
    
    // 工厂端登录
    factoryLogin() {
      // 模拟工厂登录
      uni.showLoading({
        title: '工厂登录中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        
        // 模拟获取工厂用户信息
        const factoryUserInfo = {
          openid: 'factory' + Date.now(),
          nickname: '工厂用户' + Math.floor(Math.random() * 1000),
          avatar: 'https://via.placeholder.com/100'
        }
        
        // 保存工厂用户信息
        uni.setStorageSync('factoryUserInfo', factoryUserInfo)
        
        // 设置角色为工厂
        const role = '工厂'
        
        // 保存用户信息
        const userInfo = {
          username: factoryUserInfo.openid,
          phone: '',
          role: role,
          isEnterprise: true,
          factoryInfo: factoryUserInfo,
          avatar: factoryUserInfo.avatar,
          nickname: factoryUserInfo.nickname
        }
        
        uni.setStorageSync('userInfo', userInfo)
        
        // 显示登录成功提示并跳转页面
        uni.showToast({
          title: '工厂登录成功',
          icon: 'success',
          duration: 1000,
          success: function() {
            setTimeout(function() {
              uni.redirectTo({
                url: '/pages/factory/factory-home'
              })
            }, 1000)
          }
        })
      }, 1000)
    }
  }
}
</script>

<style scoped>
.login-container {
  flex: 1;
  background-color: #FFFFFF;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.login-form {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
  width: 100%;
  text-align: center;
}

.logo image {
  width: 100px;
  height: 100px;
  margin-bottom: 16px;
  border-radius: 20px;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.app-name {
  font-size: 28px;
  font-weight: bold;
  color: #1D2129;
  margin-bottom: 12px;
}

.app-subtitle {
  font-size: 16px;
  color: #4E5969;
}

/* 微信登录按钮（工人端） */
.wechat-login-btn {
  width: 85%;
  height: 56px;
  background: linear-gradient(135deg, #07C160, #059669);
  color: #FFFFFF;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
  margin-bottom: 16px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
  transition: all 0.3s ease;
}

.wechat-login-btn:active {
  transform: scale(0.98);
}

.wechat-icon {
  font-size: 24px;
}

.wechat-text {
  font-size: 18px;
}

/* 工厂登录按钮 */
.factory-login-btn {
  width: 85%;
  height: 52px;
  background-color: #1677FF;
  color: #FFFFFF;
  font-size: 17px;
  font-weight: bold;
  border-radius: 12px;
  margin-bottom: 40px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
  transition: all 0.3s ease;
}

.factory-login-btn:active {
  transform: scale(0.98);
}

.factory-icon {
  font-size: 24px;
}

.factory-text {
  font-size: 17px;
}

/* 底部合规区 */
.bottom-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: auto;
  margin-bottom: 30px;
}

.link-text {
  font-size: 12px;
  color: #86909C;
}

.link-divider {
  font-size: 12px;
  color: #86909C;
}

</style>