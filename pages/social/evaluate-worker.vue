<template>
  <view class="evaluate-worker-container">
    <view class="header">
      <text class="title">评价工人</text>
    </view>
    
    <view class="worker-info">
      <text class="worker-name">{{ workerInfo.name || '未知工人' }}</text>
      <text class="worker-skill">{{ workerInfo.skills ? workerInfo.skills.join('、') : '暂无技能信息' }}</text>
    </view>
    
    <view class="evaluation-form">
      <!-- 极简评价标签 -->
      <view class="evaluation-item">
        <text class="evaluation-label">评价标签</text>
        <text class="evaluation-sub-label">选择最符合该工人的标签</text>
        <view class="tag-container">
          <text 
            v-for="tag in evaluationTags" 
            :key="tag.value"
            :class="['tag', selectedTag === tag.value ? 'selected' : '']"
            @click="selectedTag = tag.value"
          >{{ tag.label }}</text>
        </view>
      </view>
      
      <!-- 评价内容 -->
      <view class="evaluation-item">
        <text class="evaluation-label">评价内容</text>
        <textarea v-model="comment" placeholder="请输入您的评价内容（选填）" class="comment-input" />
      </view>
      
      <!-- 匿名/实名选项 -->
      <view class="evaluation-item">
        <view class="anonymous-option">
          <checkbox :checked="isAnonymous" @change="isAnonymous = !isAnonymous" />
          <text class="anonymous-label">
            {{ isAnonymous ? '匿名评价（保护隐私）' : '实名评价（工人会看到你的信息）' }}
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
export default {
  data() {
    return {
      workerId: '',
      workerInfo: {},
      selectedTag: '',
      comment: '',
      isAnonymous: true,
      evaluationTags: [
        { label: '守时', value: 'punctual' },
        { label: '手艺好', value: 'skilled' },
        { label: '稳定肯干', value: 'stable' },
        { label: '好沟通', value: 'communicative' }
      ]
    }
  },
  onLoad(options) {
    this.workerId = options.workerId
    this.loadWorkerInfo()
  },
  methods: {
    loadWorkerInfo() {
      // 从本地存储获取工人信息
      const skillProfile = uni.getStorageSync('skillProfile')
      if (skillProfile) {
        this.workerInfo = skillProfile
      } else {
        // 使用默认数据
        this.workerInfo = {
          name: '未知工人',
          skills: []
        }
      }
    },
    submitEvaluation() {
      if (!this.selectedTag) {
        uni.showToast({
          title: '请选择评价标签',
          icon: 'none'
        })
        return
      }
      
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      const evaluatorId = userInfo.phone || userInfo.username || Date.now().toString()
      const evaluatorName = userInfo.username || '匿名用户'
      
      // 创建评价对象
      const evaluation = {
        evaluatorId: evaluatorId,
        evaluatorName: evaluatorName,
        isAnonymous: this.isAnonymous,
        tag: this.selectedTag,
        comment: this.comment,
        date: new Date().toISOString()
      }
      
      // 保存评价到本地存储
      this.saveWorkerEvaluation(evaluation)
      
      // 计算并更新工人信誉分
      this.updateWorkerReputationScore()
      
      uni.showToast({
        title: '评价提交成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    },
    saveWorkerEvaluation(evaluation) {
      // 从本地存储获取工人评价
      let workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
      
      if (!workerEvaluations[this.workerId]) {
        workerEvaluations[this.workerId] = []
      }
      
      // 添加新评价
      workerEvaluations[this.workerId].push(evaluation)
      
      // 保存回本地存储
      uni.setStorageSync('workerEvaluations', workerEvaluations)
    },
    updateWorkerReputationScore() {
      // 从本地存储获取工人评价
      const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
      const evaluations = workerEvaluations[this.workerId] || []
      
      if (evaluations.length === 0) {
        return
      }
      
      // 计算信誉分
      const reputationScore = this.calculateReputationScore(evaluations)
      
      // 更新工人档案中的信誉分
      const skillProfile = uni.getStorageSync('skillProfile') || {}
      skillProfile.reputationScore = reputationScore
      skillProfile.evaluations = evaluations
      
      // 保存回本地存储
      uni.setStorageSync('skillProfile', skillProfile)
    },
    calculateReputationScore(evaluations) {
      // 简单的信誉分计算逻辑
      // 每个评价得1分，满分100分
      const score = Math.min(evaluations.length * 25, 100)
      return score
    },
    cancel() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.evaluate-worker-container {
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

.worker-info {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.worker-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.worker-skill {
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

.evaluation-sub-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag {
  padding: 20rpx 30rpx;
  border-radius: 25rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag.selected {
  background-color: #4A90E2;
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
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