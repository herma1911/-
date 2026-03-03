<template>
  <view class="score-rules-container">
    <!-- 顶部左侧个人信息区域 -->
    <view class="top-left-section">
      <view class="avatar" @click="goToMyPage">
        <text class="avatar-text">🏭</text>
      </view>
      <view class="user-info">
        <text class="nickname">{{ factoryInfo.name || 'XX制衣厂' }}</text>
        <view class="status-section" @click="showStatusSelection">
          <text class="status-text" :class="factoryStatusClass">{{ factoryStatusText }}</text>
        </view>
      </view>
    </view>
    
    <view class="content">
      <view class="rules-section">
        <text class="rules-text">{{scoreRulesText}}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getScoreRulesText } from '../../utils/factory-score.js'

export default {
  data() {
    return {
      scoreRulesText: '',
      factoryInfo: {
        name: ''
      },
      factoryStatus: 'recruiting', // recruiting: 招聘中, followable: 可关注, notRecruiting: 暂不招聘
      factoryStatusMap: {
        recruiting: '招聘中',
        followable: '可关注',
        notRecruiting: '暂不招聘'
      }
    }
  },
  computed: {
    factoryStatusText() {
      return this.factoryStatusMap[this.factoryStatus] || '招聘中'
    },
    factoryStatusClass() {
      switch (this.factoryStatus) {
        case 'recruiting': return 'status-recruiting'
        case 'followable': return 'status-followable'
        case 'notRecruiting': return 'status-not-recruiting'
        default: return ''
      }
    }
  },
  onLoad() {
    this.scoreRulesText = getScoreRulesText()
    this.getFactoryInfo()
  },
  methods: {
    getFactoryInfo() {
      const factoryInfo = uni.getStorageSync('factoryInfo')
      if (factoryInfo) {
        this.factoryInfo = factoryInfo
      }
    },
    goToMyPage() {
      uni.navigateTo({
        url: '../worker/my-page'
      })
    },
    showStatusSelection() {
      uni.showActionSheet({
        itemList: ['招聘中', '可关注', '暂不招聘'],
        success: (res) => {
          const statusMap = ['recruiting', 'followable', 'notRecruiting']
          this.factoryStatus = statusMap[res.tapIndex]
          uni.showToast({
            title: '状态已更新',
            icon: 'success'
          })
        }
      })
    },
    navigateBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.score-rules-container {
  padding: 0;
  background-color: #F5F5F5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部左侧个人信息区域 */
.top-left-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  max-width: 200dp;
  padding-left: 16dp;
  padding-top: 20rpx;
}

/* 头像 */
.avatar {
  width: 40dp;
  height: 40dp;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12dp;
  cursor: pointer;
}

.avatar-text {
  font-size: 24rpx;
}

/* 用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 16sp;
  color: #333333;
  display: block;
  margin-bottom: 4dp;
}

/* 状态区域 */
.status-section {
  min-height: 44dp;
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 12sp;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-recruiting {
  color: #00C851;
}

.status-followable {
  color: #FFB800;
}

.status-not-recruiting {
  color: #999999;
}

.content {
  padding: 20rpx;
}

.rules-section {
  background-color: #FFFFFF;
  border-radius: 12rpx;
  padding: 25rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rules-text {
  font-size: 16rpx;
  line-height: 1.6;
  color: #333333;
  white-space: pre-wrap;
}

.rules-text::before {
  content: '';
  white-space: pre;
}
</style>