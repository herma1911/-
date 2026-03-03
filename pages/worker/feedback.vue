<template>
  <view class="feedback-container">
    <view class="header">
      <text class="title">意见反馈</text>
      <button class="back-button" @click="goBack">返回</button>
    </view>
    
    <view class="feedback-form">
      <view class="form-group">
        <text class="form-label">反馈类型</text>
        <view class="type-buttons">
          <button 
            v-for="type in feedbackTypes" 
            :key="type.value"
            :class="['type-btn', feedbackForm.type === type.value ? 'active' : '']" 
            @click="feedbackForm.type = type.value"
          >{{type.label}}</button>
        </view>
      </view>
      
      <view class="form-group">
        <text class="form-label">反馈内容</text>
        <textarea 
          v-model="feedbackForm.content" 
          placeholder="请详细描述您的问题或建议..." 
          class="form-textarea" 
          maxlength="500"
        />
        <text class="char-count">{{feedbackForm.content.length}}/500</text>
      </view>
      
      <view class="form-group">
        <text class="form-label">联系方式（选填）</text>
        <input 
          type="text" 
          v-model="feedbackForm.contact" 
          placeholder="请留下您的手机号或微信，方便我们联系您" 
          class="form-input" 
        />
      </view>
      
      <button class="submit-button" @click="submitFeedback" :disabled="!isFormValid">
        提交反馈
      </button>
    </view>
    
    <view class="info-section">
      <text class="info-title">反馈说明</text>
      <text class="info-text">• 我们会认真对待每一条反馈，帮助我们改进产品。</text>
      <text class="info-text">• 您的反馈将在1-3个工作日内得到回复。</text>
      <text class="info-text">• 请提供详细的问题描述，以便我们更好地理解和解决问题。</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedbackForm: {
        type: 'suggestion',
        content: '',
        contact: ''
      },
      feedbackTypes: [
        { label: '功能建议', value: 'suggestion' },
        { label: 'bug反馈', value: 'bug' },
        { label: '其他问题', value: 'other' }
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.feedbackForm.content.trim().length > 0
    }
  },
  methods: {
    submitFeedback() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写反馈内容',
          icon: 'none'
        })
        return
      }
      
      // 保存反馈到本地存储
      const feedbacks = uni.getStorageSync('feedbacks') || []
      feedbacks.push({
        id: Date.now(),
        type: this.feedbackForm.type,
        content: this.feedbackForm.content,
        contact: this.feedbackForm.contact,
        submitTime: new Date().toISOString(),
        status: 'pending'
      })
      uni.setStorageSync('feedbacks', feedbacks)
      
      // 显示成功提示
      uni.showToast({
        title: '反馈已提交，感谢您的建议！',
        icon: 'success'
      })
      
      // 重置表单
      this.feedbackForm = {
        type: 'suggestion',
        content: '',
        contact: ''
      }
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.feedback-container {
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

.feedback-form {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.type-buttons {
  display: flex;
  gap: 15rpx;
  flex-wrap: wrap;
}

.type-btn {
  padding: 15rpx 25rpx;
  border-radius: 25rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.type-btn.active {
  background-color: #4A90E2;
  color: #fff;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 24rpx;
  resize: none;
  box-sizing: border-box;
}

.char-count {
  font-size: 20rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  box-sizing: border-box;
}

.submit-button {
  width: 100%;
  height: 80rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.info-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 25rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.info-text {
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15rpx;
  display: block;
}
</style>