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
import factoryLevelSystem from '../../utils/factory-level-system.js'

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
    this.scoreRulesText = this.getLevelRulesText()
    this.getFactoryInfo()
  },
  methods: {
    getLevelRulesText() {
      let rulesText = '工厂信用等级体系\n\n'
      
      // 添加等级规则
      rulesText += '等级评定权重：\n'
      rulesText += '闭环发薪45% > 工人评价25% > 拉新贡献15% > 平台活跃10% > 合规经营5%\n\n'
      
      // 添加各等级规则
      Object.keys(factoryLevelSystem.factoryLevels).forEach(level => {
        const levelInfo = factoryLevelSystem.factoryLevels[level]
        rulesText += `${levelInfo.name}\n`
        rulesText += '核心准入门槛：\n'
        
        if (level === 'S') {
          rulesText += '1. 累计闭环发薪≥1000次，100%入职工人完成平台收薪确认，连续12个月无发薪投诉\n'
          rulesText += '2. 工人综合好评率≥95%\n'
          rulesText += '3. 累计有效拉新≥5家工厂/100名工人\n'
          rulesText += '4. 月均连续登录≥28天\n'
        } else if (level === 'A') {
          rulesText += '1. 累计闭环发薪≥200次，95%以上入职工人完成平台收薪确认，连续6个月无发薪投诉\n'
          rulesText += '2. 工人综合好评率≥90%\n'
          rulesText += '3. 累计有效拉新≥2家工厂/30名工人\n'
          rulesText += '4. 月均连续登录≥22天\n'
        } else if (level === 'B') {
          rulesText += '1. 累计闭环发薪≥50次，90%以上入职工人完成平台收薪确认，连续3个月无发薪投诉\n'
          rulesText += '2. 工人综合好评率≥85%\n'
          rulesText += '3. 月均连续登录≥15天\n'
        } else if (level === 'C') {
          rulesText += '新入驻工厂，或累计闭环发薪<50次，连续合规发薪<3个月\n'
        } else if (level === 'D') {
          rulesText += '闭环发薪占比<80%/工人好评率<80%/连续60天未登录/有虚假招聘、恶意欠薪等违规记录\n'
        }
        
        rulesText += '核心权益：\n'
        levelInfo.benefits.forEach((benefit, index) => {
          rulesText += `${index + 1}. ${benefit}\n`
        })
        
        rulesText += '\n'
      })
      
      // 添加B级快速认证规则
      rulesText += 'B级快速认证绿色通道（仅限C级新工厂申请，仅1次机会）\n'
      rulesText += '满足以下任意1条，即可直接升级为B级工厂：\n'
      rulesText += '1. 拉新达标通道：累计有效拉新≥15名工人 / ≥2家工厂，系统自动核验达标后直接升级\n'
      rulesText += '2. 海报推广通道：使用平台官方招工海报模板，完成以下任意1项推广，提交材料审核通过后升级：\n'
      rulesText += '   - 线下：海报张贴在厂门口醒目位置，连续7天，提交3张不同日期的实拍图\n'
      rulesText += '   - 线上：海报发送至≥5个200人以上的服装/招工群，提交带群名、发送时间的截图\n'
      rulesText += '\n'
      rulesText += '补充规则\n'
      rulesText += '- 升级后需在30天内完成≥5笔有效闭环发薪，否则自动降回C级，收回所有权益\n'
      rulesText += '- 发现P图造假、虚假拉新等违规行为，直接取消B级认证，降为D级，6个月内不可再次申请\n'
      
      return rulesText
    },
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