<template>
  <view class="evaluate-ledger-container">
    <view class="header">
      <text class="title">记账背书评价</text>
    </view>
    
    <view class="worker-info">
      <text class="worker-name">{{ workerInfo.name || '未知工人' }}</text>
      <text class="worker-stats">
        记账记录：{{ ledgerRecords.length }}条 | 总金额：{{ totalAmount.toFixed(2) }}元
      </text>
    </view>
    
    <view class="evaluation-form">
      <!-- 记账准确性评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">记账准确性（40%）</text>
        <text class="evaluation-sub-label">记账数据是否准确？与实际工作情况是否一致？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', accuracy >= star ? 'active' : '']"
            @click="accuracy = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(accuracy) }}</text>
      </view>
      
      <!-- 记账及时性评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">记账及时性（25%）</text>
        <text class="evaluation-sub-label">是否及时记录工作内容？是否按时提交记账？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', timeliness >= star ? 'active' : '']"
            @click="timeliness = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(timeliness) }}</text>
      </view>
      
      <!-- 记账完整性评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">记账完整性（25%）</text>
        <text class="evaluation-sub-label">记账信息是否完整？是否包含必要的工作细节？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', completeness >= star ? 'active' : '']"
            @click="completeness = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(completeness) }}</text>
      </view>
      
      <!-- 记账规范性评价 -->
      <view class="evaluation-item">
        <text class="evaluation-label">记账规范性（10%）</text>
        <text class="evaluation-sub-label">记账格式是否规范？信息分类是否清晰？</text>
        <view class="star-rating">
          <text 
            v-for="star in 5" 
            :key="star" 
            :class="['star', standardization >= star ? 'active' : '']"
            @click="standardization = star"
          >★</text>
        </view>
        <text class="rating-text">{{ getRatingText(standardization) }}</text>
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
      workerId: '',
      workerInfo: {},
      ledgerRecords: [],
      accuracy: 0,
      timeliness: 0,
      completeness: 0,
      standardization: 0,
      comment: '',
      selectedTags: [],
      recommendedTags: []
    }
  },
  onLoad(options) {
    this.workerId = options.workerId
    this.loadWorkerInfo()
    this.loadLedgerRecords()
  },
  computed: {
    canSubmit() {
      return this.accuracy > 0 && this.timeliness > 0 && this.completeness > 0 && this.standardization > 0
    },
    totalAmount() {
      return this.ledgerRecords.reduce((sum, record) => {
        return sum + parseFloat(record.amount || 0)
      }, 0)
    }
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
          name: '未知工人'
        }
      }
    },
    loadLedgerRecords() {
      // 从本地存储获取记账记录
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      // 这里简化处理，实际应该根据workerId筛选
      this.ledgerRecords = allRecords.slice(-10) // 最近10条记录
    },
    getRatingText(score) {
      const ratings = ['请评价', '很差', '较差', '一般', '良好', '优秀']
      return ratings[score]
    },
    updateRecommendedTags() {
      // 简单的标签推荐逻辑
      const allTags = [
        '数据准确', '及时记账', '记录完整', '格式规范',
        '认真负责', '条理清晰', '详细具体', '可靠性高',
        '专业规范', '值得信赖', '工作细致', '效率较高'
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
        this.accuracy * 0.4 +
        this.timeliness * 0.25 +
        this.completeness * 0.25 +
        this.standardization * 0.1
      ).toFixed(1)
      
      // 保存记账背书评价
      const ledgerEvaluation = {
        id: Date.now(),
        evaluatorId: uni.getStorageSync('userId') || 'factory_' + Math.random(),
        evaluatorName: uni.getStorageSync('userInfo')?.name || '匿名评价人',
        workerId: this.workerId,
        accuracy: this.accuracy,
        timeliness: this.timeliness,
        completeness: this.completeness,
        standardization: this.standardization,
        overallScore: parseFloat(overallScore),
        comment: this.comment,
        tags: this.selectedTags,
        evaluationDate: new Date().toISOString().split('T')[0],
        ledgerStats: {
          recordCount: this.ledgerRecords.length,
          totalAmount: this.totalAmount,
          period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        }
      }
      
      // 保存到本地存储
      let ledgerEvaluations = uni.getStorageSync('ledgerEvaluations') || {}
      if (!ledgerEvaluations[this.workerId]) {
        ledgerEvaluations[this.workerId] = []
      }
      ledgerEvaluations[this.workerId].push(ledgerEvaluation)
      uni.setStorageSync('ledgerEvaluations', ledgerEvaluations)
      
      // 更新技能档案中的评价信息
      this.updateSkillProfileEvaluation(ledgerEvaluation)
      
      uni.showToast({
        title: '评价成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    },
    updateSkillProfileEvaluation(evaluation) {
      const skillProfile = uni.getStorageSync('skillProfile') || {}
      if (!skillProfile.factoryEvaluations) {
        skillProfile.factoryEvaluations = []
      }
      skillProfile.factoryEvaluations.push({
        tag: '记账背书',
        score: evaluation.overallScore,
        comment: evaluation.comment || '记账规范',
        from: evaluation.evaluatorName,
        date: evaluation.evaluationDate
      })
      uni.setStorageSync('skillProfile', skillProfile)
    }
  }
}
</script>

<style scoped>
.evaluate-ledger-container {
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

.worker-info {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
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

.worker-stats {
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