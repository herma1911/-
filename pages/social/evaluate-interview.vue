<template>
  <view class="evaluate-interview-container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <text class="header-title">面试评价</text>
      <view class="placeholder"></view>
    </view>

    <!-- 评价内容 -->
    <view class="evaluation-content">
      <!-- 工厂信息 -->
      <view class="factory-info">
        <text class="factory-name">{{ factoryName || '工厂' }}</text>
        <text class="evaluation-tip">您的评价将帮助其他工友了解真实的面试体验</text>
      </view>

      <!-- 必选维度评价 -->
      <view class="evaluation-dimensions">
        <!-- 面试体验 -->
        <view class="dimension-item">
          <text class="dimension-label">面试体验</text>
          <view class="star-rating">
            <text 
              v-for="n in 5" 
              :key="'experience-' + n"
              class="star"
              :class="{ 'active': interviewExperience >= n }"
              @tap="setInterviewExperience(n)"
            >★</text>
          </view>
          <text class="dimension-desc">含接待态度、沟通效率、岗位匹配度</text>
        </view>

        <!-- 岗位匹配 -->
        <view class="dimension-item">
          <text class="dimension-label">岗位匹配</text>
          <view class="star-rating">
            <text 
              v-for="n in 5" 
              :key="'match-' + n"
              class="star"
              :class="{ 'active': jobMatch >= n }"
              @tap="setJobMatch(n)"
            >★</text>
          </view>
          <text class="dimension-desc">面试岗位与实际工序/工价是否一致</text>
        </view>

        <!-- 工厂接待 -->
        <view class="dimension-item">
          <text class="dimension-label">工厂接待</text>
          <view class="star-rating">
            <text 
              v-for="n in 5" 
              :key="'reception-' + n"
              class="star"
              :class="{ 'active': reception >= n }"
              @tap="setReception(n)"
            >★</text>
          </view>
          <text class="dimension-desc">含接待速度、是否热情、是否提供饮水/指引</text>
        </view>
      </view>

      <!-- 评价内容输入 -->
      <view class="comment-section">
        <textarea 
          v-model="comment" 
          class="comment-input"
          placeholder="请输入您的面试体验，帮助工友避坑（至少10字）"
          placeholder-class="placeholder-text"
          maxlength="500"
        ></textarea>
        <text class="comment-count">{{ comment.length }}/500</text>
      </view>

      <!-- 匿名/实名选择 -->
      <view class="anonymous-section">
        <text class="anonymous-label">评价方式</text>
        <view class="anonymous-options">
          <label class="radio-option" @tap="setAnonymous(true)">
            <text class="radio" :class="{ 'active': isAnonymous }">●</text>
            <text class="option-text">匿名</text>
          </label>
          <label class="radio-option" @tap="setAnonymous(false)">
            <text class="radio" :class="{ 'active': !isAnonymous }">●</text>
            <text class="option-text">实名</text>
          </label>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button 
        class="submit-btn" 
        :disabled="!canSubmit"
        @tap="submitEvaluation"
      >
        提交评价
      </button>

      <!-- 提示信息 -->
      <view class="tips-section">
        <text class="tip-item">• 同一工厂仅能评价一次</text>
        <text class="tip-item">• 提交后不可修改或删除</text>
        <text class="tip-item">• 请输入真实的面试体验</text>
      </view>
    </view>
  </view>
</template>

<script>
import { saveInterviewEvaluation, hasUserSubmittedInterviewEvaluation, detectMaliciousEvaluation } from '@/utils/evaluation'

export default {
  data() {
    return {
      factoryId: '',
      factoryName: '',
      interviewExperience: 0,
      jobMatch: 0,
      reception: 0,
      comment: '',
      isAnonymous: true,
      userInfo: {}
    }
  },
  computed: {
    canSubmit() {
      return this.interviewExperience > 0 && 
             this.jobMatch > 0 && 
             this.reception > 0 && 
             this.comment.length >= 10
    }
  },
  onLoad(options) {
    if (options.factoryId) {
      this.factoryId = options.factoryId
      this.factoryName = options.factoryName || '工厂'
    }
    this.userInfo = uni.getStorageSync('userInfo') || {}
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    setInterviewExperience(score) {
      this.interviewExperience = score
    },
    setJobMatch(score) {
      this.jobMatch = score
    },
    setReception(score) {
      this.reception = score
    },
    setAnonymous(anonymous) {
      this.isAnonymous = anonymous
    },
    submitEvaluation() {
      // 检查是否已经评价过
      const userId = this.userInfo.phone || this.userInfo.username || Date.now().toString()
      
      if (hasUserSubmittedInterviewEvaluation(userId, this.factoryId)) {
        uni.showToast({
          title: '您已经评价过该工厂的面试',
          icon: 'none'
        })
        return
      }
      
      // 检查评价内容
      if (this.comment.length < 10) {
        uni.showToast({
          title: '请输入至少10字的评价内容',
          icon: 'none'
        })
        return
      }
      
      // 检测恶意评价
      const evaluation = {
        interviewExperience: this.interviewExperience,
        jobMatch: this.jobMatch,
        reception: this.reception,
        comment: this.comment
      }
      
      const detectionResult = detectMaliciousEvaluation(evaluation)
      if (detectionResult.isMalicious) {
        uni.showToast({
          title: '请输入真实的面试体验，帮助工友避坑',
          icon: 'none'
        })
        return
      }
      
      // 保存评价
      const evaluationData = {
        evaluatorId: userId,
        evaluatorName: this.userInfo.nickname || '匿名工人',
        isAnonymous: this.isAnonymous,
        interviewExperience: this.interviewExperience,
        jobMatch: this.jobMatch,
        reception: this.reception,
        comment: this.comment,
        userLevel: this.userInfo.level || 'normal'
      }
      
      try {
        saveInterviewEvaluation(this.factoryId, evaluationData)
        
        uni.showToast({
          title: '评价提交成功',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack()
        }, 2000)
      } catch (error) {
        uni.showToast({
          title: '评价提交失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.evaluate-interview-container {
  flex: 1;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background-color: #fff;
  padding: 0 15px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 24px;
  color: #333;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.placeholder {
  width: 44px;
}

.evaluation-content {
  padding: 20px 15px;
}

.factory-info {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.factory-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.evaluation-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.evaluation-dimensions {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.dimension-item {
  margin-bottom: 20px;
}

.dimension-item:last-child {
  margin-bottom: 0;
}

.dimension-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.star-rating {
  display: flex;
  margin-bottom: 5px;
}

.star {
  font-size: 24px;
  color: #ddd;
  margin-right: 8px;
  cursor: pointer;
}

.star.active {
  color: #ff9500;
}

.dimension-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.comment-section {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  position: relative;
}

.comment-input {
  width: 100%;
  height: 120px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  resize: none;
}

.placeholder-text {
  color: #ccc;
}

.comment-count {
  position: absolute;
  bottom: 20px;
  right: 30px;
  font-size: 12px;
  color: #999;
}

.anonymous-section {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.anonymous-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.anonymous-options {
  display: flex;
  gap: 30px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 10px;
  color: transparent;
}

.radio.active {
  border-color: #ff9500;
  background-color: #ff9500;
  color: #fff;
}

.option-text {
  font-size: 14px;
  color: #333;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background-color: #ff9500;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
}

.submit-btn:disabled {
  background-color: #ffd799;
}

.tips-section {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
}

.tip-item {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
  display: block;
}
</style>