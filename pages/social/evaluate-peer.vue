<template>
  <view class="evaluate-peer-container">
    <view class="header">
      <text class="title">评价工友</text>
    </view>
    
    <view class="peer-info">
      <text class="peer-name">{{ peerInfo.name || '未知工友' }}</text>
      <text class="peer-skills">
        技能：{{ peerInfo.skills ? peerInfo.skills.join(', ') : '无' }}
      </text>
    </view>
    
    <view class="evaluation-form">
      <!-- 技能水平评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">技能水平（30%）</text>
        <text class="evaluation-sub-label">实际技能是否符合描述？技术水平如何？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', skillLevel >= star ? 'active' : '']"
            @click="skillLevel = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(skillLevel) }}</text>
      </view>
      
      <!-- 工作态度评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">工作态度（25%）</text>
        <text class="evaluation-sub-label">是否认真负责？是否按时完成任务？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', workAttitude >= star ? 'active' : '']"
            @click="workAttitude = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(workAttitude) }}</text>
      </view>
      
      <!-- 团队协作评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">团队协作（25%）</text>
        <text class="evaluation-sub-label">是否愿意帮助他人？与同事相处如何？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', teamwork >= star ? 'active' : '']"
            @click="teamwork = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(teamwork) }}</text>
      </view>
      
      <!-- 可靠性评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">可靠性（20%）</text>
        <text class="evaluation-sub-label">是否信守承诺？是否值得信赖？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', reliability >= star ? 'active' : '']"
            @click="reliability = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(reliability) }}</text>
      </view>
      
      <!-- 评价内容 -->
      <view class="evaluation-item">
        <text class="evaluation-label">评价内容</text>
        <textarea v-model="comment" placeholder="请输入您的评价内容（选填）" class="comment-input" @input="updateRecommendedTags" />
      </view>
      
      <!-- 标签推荐 -->
      <view class="evaluation-item">
        <text class="evaluation-label">推荐标签</text>
        <view class="tag-container">
          <text 
            v-for="tag in recommendedTags" 
            :key="tag"
            :class="['tag', selectedTags.includes(tag) ? 'selected' : '']"
            @click="toggleTag(tag)"
          >{{ tag }}</text>
        </view>
      </view>
    </view>
    
    <view class="submit-section">
      <button type="primary" class="submit-button" @click="submitEvaluation" :disabled="!canSubmit">
        提交评价
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      peerId: '',
      peerInfo: {},
      skillLevel: 0,
      workAttitude: 0,
      teamwork: 0,
      reliability: 0,
      comment: '',
      selectedTags: [],
      recommendedTags: []
    }
  },
  onLoad(options) {
    this.peerId = options.peerId
    this.loadPeerInfo()
  },
  computed: {
    canSubmit() {
      return this.skillLevel > 0 && this.workAttitude > 0 && this.teamwork > 0 && this.reliability > 0
    }
  },
  methods: {
    loadPeerInfo() {
      // 从本地存储获取工友信息
      const skillProfile = uni.getStorageSync('skillProfile')
      
      if (skillProfile) {
        this.peerInfo = skillProfile
      } else {
        // 使用默认数据
        this.peerInfo = {
          name: '未知工友',
          skills: []
        }
      }
    },
    getRatingText(score) {
      const ratings = ['请评价', '很差', '较差', '一般', '良好', '优秀']
      return ratings[score]
    },
    updateRecommendedTags() {
      // 简单的标签推荐逻辑
      const allTags = [
        '技术好', '效率高', '乐于助人', '责任心强',
        '团队合作', '诚实守信', '态度积极', '经验丰富',
        '学习能力强', '沟通顺畅', '工作认真', '值得信赖'
      ]
      
      // 基于评价内容推荐标签
      this.recommendedTags = allTags.filter(tag => 
        this.comment.includes(tag.substring(0, 2)) || Math.random() > 0.7
      ).slice(0, 6)
    },
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tag)
      }
    },
    submitEvaluation() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请完成所有评价维度', icon: 'none' })
        return
      }
      
      // 计算综合评分
      const overallScore = (
        this.skillLevel * 0.3 +
        this.workAttitude * 0.25 +
        this.teamwork * 0.25 +
        this.reliability * 0.2
      ).toFixed(1)
      
      // 保存工友评价
      const peerEvaluation = {
        id: Date.now(),
        evaluatorId: uni.getStorageSync('userId') || 'worker_' + Math.random(),
        evaluatorName: uni.getStorageSync('userInfo')?.name || '匿名工友',
        peerId: this.peerId,
        skillLevel: this.skillLevel,
        workAttitude: this.workAttitude,
        teamwork: this.teamwork,
        reliability: this.reliability,
        overallScore: parseFloat(overallScore),
        comment: this.comment,
        tags: this.selectedTags,
        evaluationDate: new Date().toISOString().split('T')[0]
      }
      
      // 保存到本地存储
      let peerEvaluations = uni.getStorageSync('peerEvaluations') || {}
      if (!peerEvaluations[this.peerId]) {
        peerEvaluations[this.peerId] = []
      }
      peerEvaluations[this.peerId].push(peerEvaluation)
      uni.setStorageSync('peerEvaluations', peerEvaluations)
      
      // 更新技能档案中的工友评价
      this.updateSkillProfilePeerEvaluations(peerEvaluation)
      
      uni.showToast({
        title: '评价成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    },
    updateSkillProfilePeerEvaluations(evaluation) {
      const skillProfile = uni.getStorageSync('skillProfile') || {}
      if (!skillProfile.peerEvaluations) {
        skillProfile.peerEvaluations = []
      }
      skillProfile.peerEvaluations.push({
        content: evaluation.comment || '未填写评价内容',
        from: evaluation.evaluatorName,
        score: evaluation.overallScore,
        date: evaluation.evaluationDate
      })
      uni.setStorageSync('skillProfile', skillProfile)
    }
  }
}
</script>

<style scoped>
.evaluate-peer-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  padding: 30rpx 0;
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.peer-info {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.peer-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.peer-skills {
  font-size: 24rpx;
  color: #666;
}

.evaluation-form {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.evaluation-item {
  margin-bottom: 30rpx;
}

.evaluation-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.evaluation-sub-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.star-rating {
  display: flex;
  margin-bottom: 10rpx;
}

.star {
  font-size: 36rpx;
  color: #ddd;
  margin-right: 10rpx;
  cursor: pointer;
}

.star.active {
  color: #FFD700;
}

.rating-text {
  font-size: 22rpx;
  color: #4A90E2;
  font-weight: bold;
}

.comment-input {
  width: 100%;
  height: 200rpx;
  padding: 15rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #333;
  background-color: #f9f9f9;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 15rpx;
}

.tag {
  padding: 10rpx 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  background-color: #f9f9f9;
  cursor: pointer;
}

.tag.selected {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
}

.submit-section {
  padding: 0 20rpx 40rpx;
}

.submit-button {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: bold;
  background-color: #4A90E2;
  color: #fff;
  border-radius: 40rpx;
}

.submit-button:disabled {
  background-color: #ccc;
}
</style>