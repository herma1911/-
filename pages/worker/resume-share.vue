<template>
  <view class="resume-share-container">
    <view class="header">
      <text class="title">极简简历</text>
      <button class="back-button" @click="goBack">返回</button>
    </view>
    
    <!-- 简历卡片预览 -->
    <view class="resume-card">
      <view class="card-header">
        <view class="avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <text class="user-name">{{profile.name || '未命名'}}</text>
      </view>
      
      <view class="skill-tags">
        <text v-for="(skill, index) in profile.skills.slice(0, 5)" :key="index" class="skill-tag">{{skill}}</text>
      </view>
      
      <view class="work-record">
        <text class="record-title">有效记账累计</text>
        <text class="record-content">{{getWorkRecordText()}}</text>
      </view>
      
      <view class="expectations">
        <view class="expectation-item">
          <text class="expectation-label">期望工价</text>
          <text class="expectation-value">{{profile.expectedWage || '暂无'}}元/件</text>
        </view>
        <view class="expectation-item">
          <text class="expectation-label">所在城市</text>
          <text class="expectation-value">{{profile.city || '暂无'}}</text>
        </view>
        <view class="expectation-item">
          <text class="expectation-label">老乡认可</text>
          <text class="expectation-value">{{likeCount}}人</text>
        </view>
      </view>
      
      <view class="qrcode">
        <text class="qrcode-placeholder">🔲</text>
        <text class="qrcode-text">扫码查看完整档案</text>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="action-button" @click="saveImage">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存图片</text>
      </button>
      <button class="action-button" @click="shareWechat">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享到微信</text>
      </button>
      <button class="action-button" @click="copyLink">
        <text class="btn-icon">🔗</text>
        <text class="btn-text">复制链接</text>
      </button>
    </view>
    
    <!-- 免责声明 -->
    <view class="disclaimer">
      <text class="disclaimer-text">⚠️ 重要提醒：本档案仅为用户自主提交+有效记账记录汇总，不代表平台官方认证，招工方请自主核实。</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      profile: {
        name: '',
        skills: [],
        expectedWage: '',
        city: '',
        workRecords: []
      },
      likeCount: 0
    }
  },
  onLoad() {
    this.loadProfile()
  },
  methods: {
    loadProfile() {
      // 加载技能档案数据
      const savedProfile = uni.getStorageSync('skillProfile')
      if (savedProfile) {
        this.profile = savedProfile
      }
      
      // 加载点赞数
      this.likeCount = uni.getStorageSync('likeCount') || 0
      
      // 加载记账数据并生成工作记录
      this.loadWorkRecords()
    },
    loadWorkRecords() {
      // 从本地存储加载账本记录
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      // 过滤出已确认的记录
      const confirmedRecords = allRecords.filter(record => record.status === 'confirmed')
      
      // 按技能分组统计
      const skillMap = {}
      confirmedRecords.forEach(record => {
        // 从描述中提取技能信息
        if (record.description) {
          // 尝试从描述中提取技能名称
          let skillName = record.description
          // 简单处理：取描述的前半部分作为技能名称
          if (skillName.includes(' - ')) {
            skillName = skillName.split(' - ')[0]
          }
          if (skillName.includes('款号')) {
            skillName = skillName.replace('款号', '').trim()
          }
          if (!skillMap[skillName]) {
            skillMap[skillName] = {
              skill: skillName,
              count: 0
            }
          }
          // 增加计数
          skillMap[skillName].count += 1
        }
      })
      
      // 转换为工作记录数组
      this.profile.workRecords = Object.values(skillMap)
    },
    getWorkRecordText() {
      if (!this.profile.workRecords || this.profile.workRecords.length === 0) {
        return '暂无记录'
      }
      
      // 找到数量最多的工序
      const topSkill = this.profile.workRecords.reduce((max, current) => 
        (current.count || 0) > (max.count || 0) ? current : max, this.profile.workRecords[0]
      )
      
      return `累计完成${topSkill.skill}${topSkill.count || 0}件`
    },
    saveImage() {
      // 模拟保存图片
      uni.showLoading({
        title: '保存中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '图片已保存到本地',
          icon: 'success'
        })
      }, 1000)
    },
    shareWechat() {
      // 模拟分享到微信
      uni.showActionSheet({
        itemList: ['转发给微信好友', '分享到朋友圈'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '已选择转发给微信好友',
              icon: 'success'
            })
          } else if (res.tapIndex === 1) {
            uni.showToast({
              title: '已选择分享到朋友圈',
              icon: 'success'
            })
          }
        }
      })
    },
    copyLink() {
      // 复制分享链接
      const shareLink = 'https://yiqizhuan.com/resume/' + Math.random().toString(36).substr(2, 9)
      uni.setClipboardData({
        data: shareLink,
        success: () => {
          uni.showToast({
            title: '链接已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },
    goBack() {
      // 尝试返回上一页，如果失败则跳转到技能档案页面
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({
            url: './skill-profile'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.resume-share-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.back-button {
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
}

/* 简历卡片样式 */
.resume-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
  text-align: center;
}

.card-header {
  margin-bottom: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20rpx;
}

.avatar-icon {
  font-size: 60rpx;
  color: #fff;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 技能标签样式 */
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.skill-tag {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 24rpx;
  font-weight: bold;
}

/* 工作记录样式 */
.work-record {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.record-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.record-content {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

/* 期望信息样式 */
.expectations {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.expectation-item {
  text-align: center;
}

.expectation-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.expectation-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

/* 二维码样式 */
.qrcode {
  margin-top: 20rpx;
}

.qrcode-placeholder {
  font-size: 120rpx;
  display: block;
  margin-bottom: 10rpx;
}

.qrcode-text {
  font-size: 22rpx;
  color: #666;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 22rpx;
  color: #333;
}

/* 免责声明样式 */
.disclaimer {
  background-color: #fff3cd;
  border-radius: 10rpx;
  padding: 20rpx;
  border-left: 4rpx solid #ffc107;
}

.disclaimer-text {
  font-size: 22rpx;
  color: #856404;
  line-height: 1.4;
}
</style>