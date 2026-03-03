<template>
  <view class="evaluate-factory-container">
    <view class="header">
      <text class="title">评价工厂</text>
    </view>
    
    <view class="factory-info">
      <text class="factory-name">{{ factoryInfo.company }}</text>
      <text class="factory-job">{{ factoryInfo.title }}</text>
    </view>
    
    <view class="evaluation-form">
      <!-- 发工资准时 -->
      <view class="evaluation-item">
        <text class="evaluation-label">发工资准时</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', salaryOnTime >= star ? 'active' : '']"
            @click="salaryOnTime = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(salaryOnTime) }}</text>
      </view>
      
      <!-- 活多稳定 -->
      <view class="evaluation-item">
        <text class="evaluation-label">活多稳定</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', workStability >= star ? 'active' : '']"
            @click="workStability = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(workStability) }}</text>
      </view>
      
      <!-- 管理规范 -->
      <view class="evaluation-item">
        <text class="evaluation-label">管理规范</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', managementStandard >= star ? 'active' : '']"
            @click="managementStandard = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(managementStandard) }}</text>
      </view>
      
      <!-- 评价内容 -->
      <view class="evaluation-item">
        <text class="evaluation-label">评价内容（选填）</text>
        <textarea v-model="comment" placeholder="请输入您的评价内容" class="comment-input" />
      </view>
      
      <!-- 匿名/实名选项 -->
      <view class="evaluation-item">
        <view class="anonymous-option">
          <checkbox :checked="isAnonymous" @change="isAnonymous = !isAnonymous" />
          <text class="anonymous-label">
            {{ isAnonymous ? '匿名评价（保护隐私）' : '实名评价（老板会看到你的信息）' }}
          </text>
        </view>
      </view>
    </view>
    
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitEvaluation">提交评价</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
  </view>
</template>

<script>
import { saveFactoryEvaluation, hasUserEvaluatedFactory } from '../../utils/evaluation.js'
import { checkSensitiveWords, isUserVerified } from '../../utils/sensitive-filter.js'

export default {
  data() {
    return {
      factoryId: '',
      factoryInfo: {},
      salaryOnTime: 3, // 默认3星
      workStability: 3, // 默认3星
      managementStandard: 3, // 默认3星
      comment: '',
      isAnonymous: true // 默认匿名评价
    }
  },
  onLoad(options) {
    this.factoryId = options.factoryId
    this.loadFactoryInfo()
  },
  methods: {
    loadFactoryInfo() {
      // 从本地存储获取招聘信息
      let recruitments = uni.getStorageSync('recruitments') || []
      const factoryInfo = recruitments.find(item => item.id.toString() === this.factoryId)
      
      if (factoryInfo) {
        this.factoryInfo = factoryInfo
      } else {
        // 使用默认数据
        this.factoryInfo = {
          company: '未知工厂',
          title: '未知职位'
        }
      }
    },
    getRatingText(rating) {
      const texts = ['很差', '较差', '一般', '满意', '非常满意']
      return texts[rating - 1] || '一般'
    },
    submitEvaluation() {
      // 检查是否已经评价过
      const userInfo = uni.getStorageSync('userInfo') || {}
      const userId = userInfo.phone || userInfo.username || Date.now().toString()
      
      if (hasUserEvaluatedFactory(userId, this.factoryId)) {
        uni.showToast({
          title: '您已经评价过该工厂',
          icon: 'none'
        })
        return
      }
      
      // 检查是否是工厂员工或离职三个月内
      if (!this.canEvaluateFactory()) {
        uni.showToast({
          title: '只有入职后或离职三个月内的员工可以评价',
          icon: 'none'
        })
        return
      }
      
      // 检查是否已实名
      if (!isUserVerified(userInfo)) {
        uni.showToast({
          title: '评价必须实名制，请先绑定手机号',
          icon: 'none'
        })
        return
      }
      
      // 检查敏感词
      const sensitiveCheck = checkSensitiveWords(this.comment)
      if (sensitiveCheck.hasSensitive) {
        uni.showToast({
          title: '评价内容包含敏感词：' + sensitiveCheck.words.join('、'),
          icon: 'none'
        })
        return
      }
      
      // 检查每月评价次数限制（最多3家不同工厂）
      const evaluations = uni.getStorageSync('userEvaluations') || {}
      const userEvaluations = evaluations[userId] || []
        const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
        const monthlyEvaluations = userEvaluations.filter(evaluation => 
          evaluation.date.substring(0, 7) === currentMonth
        )
      
      if (monthlyEvaluations.length >= 3) {
        uni.showToast({
          title: '每月最多可评价3家不同工厂',
          icon: 'none'
        })
        return
      }
      
      // 提交评价
      const evaluation = {
        evaluatorId: userId,
        evaluatorName: userInfo.username || '匿名用户',
        isAnonymous: this.isAnonymous,
        salaryOnTime: this.salaryOnTime,
        workStability: this.workStability,
        managementStandard: this.managementStandard,
        comment: this.comment
      }
      
      saveFactoryEvaluation(this.factoryId, evaluation)
      
      // 记录用户评价
      if (!evaluations[userId]) {
        evaluations[userId] = []
      }
      evaluations[userId].push({
        factoryId: this.factoryId,
        date: new Date().toISOString()
      })
      uni.setStorageSync('userEvaluations', evaluations)
      
      // 发送评价提醒
      this.sendEvaluationNotification()
      
      uni.showToast({
        title: '评价提交成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    },
    sendEvaluationNotification() {
      // 发送评价提醒给班组长和工厂管理员
      const notifications = uni.getStorageSync('notifications') || []
      const boundCompany = uni.getStorageSync('boundCompany')
      
      // 防骚扰规则：检查30天内是否已发送过相同员工对相同工厂的提醒
      const userId = uni.getStorageSync('userInfo')?.phone || uni.getStorageSync('userInfo')?.username || 'user'
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const recentNotifications = notifications.filter(notification => 
        notification.type === 'evaluation' &&
        notification.workerId === userId &&
        notification.factoryId === this.factoryId &&
        notification.createdAt > thirtyDaysAgo
      )
      
      if (recentNotifications.length === 0) {
        // 发送提醒给班组长
        notifications.push({
          id: Date.now(),
          type: 'evaluation',
          title: '工厂评价提醒',
          content: `您工厂 ${boundCompany?.name || '未知'} 班组有员工提交了最新评价，点击即可查看详情。`,
          target: 'team_leader',
          factoryId: this.factoryId,
          workerId: userId,
          isRead: false,
          createdAt: new Date().toISOString()
        })
        
        // 发送提醒给工厂管理员
        notifications.push({
          id: Date.now() + 1,
          type: 'evaluation',
          title: '工厂评价提醒',
          content: `您工厂 ${boundCompany?.name || '未知'} 有员工提交了最新评价，点击即可查看详情。`,
          target: 'factory_admin',
          factoryId: this.factoryId,
          workerId: userId,
          isRead: false,
          createdAt: new Date().toISOString()
        })
        
        uni.setStorageSync('notifications', notifications)
      }
    },
    cancel() {
      uni.navigateBack()
    },
    canEvaluateFactory() {
      // 检查用户是否是该工厂的在职员工或离职三个月内的员工
      const userInfo = uni.getStorageSync('userInfo') || {}
      const userId = userInfo.phone || userInfo.username
      
      if (!userId) {
        return false
      }
      
      // 检查1：工人是否关联班组
      const boundCompany = uni.getStorageSync('boundCompany')
      if (!boundCompany) {
        return false
      }
      
      // 检查2：班组长是否在24小时内确认
      const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
      const userConfirmation = teamConfirmations.find(confirm => 
        confirm.workerId === userId && 
        confirm.companyId === boundCompany.id &&
        confirm.status === 'approved'
      )
      
      if (!userConfirmation) {
        return false
      }
      
      // 检查3：是否有至少一条记账记录
      const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
      const userRecords = ledgerRecords.filter(record => 
        record.workerId === userId || 
        record.approvalId // 关联审批记录的记账
      )
      
      if (userRecords.length === 0) {
        return false
      }
      
      // 检查4：是否有班组长审批通过的记账记录
      const approvalRecords = uni.getStorageSync('approvalRecords') || []
      const approvedApprovals = approvalRecords.filter(approval => 
        approval.workerId === userId && 
        approval.status === 'approved'
      )
      
      if (approvedApprovals.length === 0) {
        return false
      }
      
      return true
    }
  }
}
</script>

<style scoped>
.evaluate-factory-container {
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

.factory-info {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.factory-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.factory-job {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.evaluation-form {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.evaluation-item {
  margin-bottom: 30rpx;
}

.evaluation-label {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.star-rating {
  display: flex;
  gap: 15rpx;
  margin-bottom: 10rpx;
}

.star {
  font-size: 40rpx;
  color: #ddd;
  cursor: pointer;
}

.star.active {
  color: #ffd700;
}

.rating-text {
  font-size: 20rpx;
  color: #666;
  margin-left: 10rpx;
}

.comment-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 15rpx;
  font-size: 24rpx;
  min-height: 200rpx;
  background-color: #f9f9f9;
  resize: none;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.tag {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
  cursor: pointer;
}

.tag.selected {
  background-color: #4A90E2;
  color: #fff;
}

.anonymous-option {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}

.anonymous-label {
  font-size: 24rpx;
  color: #666;
  margin-left: 10rpx;
}

.button-section {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.submit-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #4A90E2;
}

.cancel-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}
</style>
