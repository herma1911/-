<template>
  <view class="evaluation-management-container">
    <view class="header">
      <text class="title">评价管理</text>
      <button class="back-btn" @click="navigateBack">←</button>
    </view>
    
    <!-- 评价标签 -->
    <view class="evaluation-tabs">
      <button 
        type="default" 
        :class="['tab-btn', activeTab === 'all' ? 'active' : '']" 
        @click="activeTab = 'all'"
      >
        全部评价
      </button>
      <button 
        type="default" 
        :class="['tab-btn', activeTab === 'valid' ? 'active' : '']" 
        @click="activeTab = 'valid'"
      >
        有效评价
      </button>
      <button 
        type="default" 
        :class="['tab-btn', activeTab === 'passerby' ? 'active' : '']" 
        @click="activeTab = 'passerby'"
      >
        路人评价
      </button>
    </view>
    
    <!-- 评价列表 -->
    <view class="evaluation-list">
      <view 
        v-for="evaluation in filteredEvaluations" 
        :key="evaluation.id" 
        class="evaluation-card"
      >
        <view class="evaluation-header">
          <text class="evaluator-name">{{ evaluation.evaluatorName }}</text>
          <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
          <text 
            v-if="evaluation.evaluationType === 'passerby'" 
            class="passerby-tag"
          >
            路人评价·无用工记录，仅供参考
          </text>
        </view>
        
        <view class="evaluation-content">
          <text class="content-text">{{ evaluation.comment || '暂无评价内容' }}</text>
        </view>
        
        <view v-if="evaluation.reply" class="evaluation-reply">
          <text class="reply-label">工厂回复：</text>
          <text class="reply-content">{{ evaluation.reply }}</text>
          <text class="reply-date">{{ evaluation.replyDate }}</text>
        </view>
        
        <view class="evaluation-actions">
          <button 
            type="default" 
            class="action-btn reply-btn" 
            @click="showReplyModal(evaluation)"
          >
            回复
          </button>
          <button 
            v-if="evaluation.evaluationType === 'passerby'" 
            type="default" 
            class="action-btn delete-btn" 
            @click="confirmDelete(evaluation)"
          >
            删除
          </button>
        </view>
      </view>
      
      <view v-if="filteredEvaluations.length === 0" class="empty-state">
        <text class="empty-text">暂无评价</text>
      </view>
    </view>
    
    <!-- 回复弹窗 -->
    <view v-if="showReplyModalVisible" class="modal-overlay" @click="closeReplyModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">回复评价</text>
        </view>
        <view class="modal-body">
          <textarea 
            v-model="replyContent" 
            placeholder="请输入回复内容" 
            class="reply-textarea" 
            @input="checkReplyLength"
          />
          <text class="reply-length">{{ replyContent.length }}/500</text>
        </view>
        <view class="modal-footer">
          <button class="cancel-button" @click="closeReplyModal">取消</button>
          <button class="confirm-button" @click="submitReply">提交回复</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getFactoryEvaluation, replyToEvaluation, factoryDeleteEvaluation } from '../../utils/evaluation.js'

export default {
  data() {
    return {
      activeTab: 'all',
      factoryId: '',
      factoryEvaluation: null,
      showReplyModalVisible: false,
      currentEvaluation: null,
      replyContent: ''
    }
  },
  computed: {
    filteredEvaluations() {
      if (!this.factoryEvaluation) return []
      
      let evaluations = [...this.factoryEvaluation.evaluations, ...(this.factoryEvaluation.interviewEvaluations || [])]
      
      // 过滤已删除的评价
      evaluations = evaluations.filter(eval => !eval.isDeleted)
      
      // 根据标签过滤
      if (this.activeTab === 'valid') {
        return evaluations.filter(eval => eval.evaluationType === 'entry' || eval.evaluationType === 'interview')
      } else if (this.activeTab === 'passerby') {
        return evaluations.filter(eval => eval.evaluationType === 'passerby')
      }
      
      return evaluations
    }
  },
  onLoad() {
    // 假设工厂ID从本地存储获取
    const userInfo = uni.getStorageSync('userInfo') || {}
    this.factoryId = userInfo.factoryId || '1' // 默认使用ID为1的工厂
    this.loadFactoryEvaluation()
  },
  methods: {
    loadFactoryEvaluation() {
      this.factoryEvaluation = getFactoryEvaluation(this.factoryId)
    },
    navigateBack() {
      uni.navigateBack()
    },
    showReplyModal(evaluation) {
      this.currentEvaluation = evaluation
      this.replyContent = evaluation.reply || ''
      this.showReplyModalVisible = true
    },
    closeReplyModal() {
      this.showReplyModalVisible = false
      this.currentEvaluation = null
      this.replyContent = ''
    },
    checkReplyLength() {
      if (this.replyContent.length > 500) {
        this.replyContent = this.replyContent.substring(0, 500)
        uni.showToast({
          title: '回复内容最多500字',
          icon: 'none'
        })
      }
    },
    submitReply() {
      if (!this.currentEvaluation) return
      
      const success = replyToEvaluation(this.factoryId, this.currentEvaluation.id, this.replyContent)
      if (success) {
        uni.showToast({
          title: '回复提交成功，等待审核',
          icon: 'success'
        })
        this.loadFactoryEvaluation()
        this.closeReplyModal()
      } else {
        uni.showToast({
          title: '回复失败，请重试',
          icon: 'none'
        })
      }
    },
    confirmDelete(evaluation) {
      uni.showModal({
        title: '删除确认',
        content: '确定要删除这条路人评价吗？',
        success: (res) => {
          if (res.confirm) {
            const success = factoryDeleteEvaluation(this.factoryId, evaluation.id)
            if (success) {
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadFactoryEvaluation()
            } else {
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.evaluation-management-container {
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  background: transparent;
  border: none;
  font-size: 32rpx;
  color: #333;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

/* 评价标签 */
.evaluation-tabs {
  display: flex;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 10rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-btn {
  flex: 1;
  height: 60rpx;
  border: none;
  background-color: transparent;
  font-size: 28rpx;
  color: #666;
  border-radius: 10rpx;
  margin: 0 5rpx;
}

.tab-btn.active {
  background-color: #4A90E2;
  color: #fff;
  font-weight: bold;
}

/* 评价列表 */
.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.evaluation-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.evaluation-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.evaluator-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.evaluation-date {
  font-size: 20rpx;
  color: #999;
}

.passerby-tag {
  font-size: 20rpx;
  color: #FF9800;
  background-color: #FFF3E0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: auto;
}

.evaluation-content {
  margin-bottom: 16rpx;
}

.content-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.5;
}

.evaluation-reply {
  background-color: #f9f9f9;
  padding: 16rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.reply-label {
  font-size: 22rpx;
  color: #666;
  font-weight: bold;
}

.reply-content {
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
  margin-top: 8rpx;
  display: block;
}

.reply-date {
  font-size: 18rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
  text-align: right;
}

.evaluation-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
}

.reply-btn {
  background-color: #4A90E2;
  color: #fff;
}

.delete-btn {
  background-color: #FF5722;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 回复弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  width: 80%;
  max-width: 500rpx;
}

.modal-header {
  margin-bottom: 30rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 30rpx;
}

.reply-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 24rpx;
  resize: none;
  margin-bottom: 12rpx;
}

.reply-length {
  font-size: 20rpx;
  color: #999;
  text-align: right;
  display: block;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
}

.cancel-button {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f0f0f0;
  color: #666;
  border: none;
}

.confirm-button {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
}
</style>