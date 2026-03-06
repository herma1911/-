<template>
  <view class="evaluation-management-container">
    <view class="header">
      <text class="title">评价管理</text>
      <button class="back-button" @click="goBack">返回</button>
    </view>
    
    <!-- 搜索和筛选 -->
    <view class="search-filter-section">
      <view class="search-bar">
        <input type="text" v-model="searchKeyword" placeholder="搜索评价内容或评价人" class="search-input" />
        <button class="search-btn" @click="search">搜索</button>
      </view>
      
      <view class="filter-section">
        <text class="filter-label">筛选：</text>
        <picker @change="onStatusChange" :range="statusOptions" :value="statusIndex">
          <view class="picker">
            {{ statusOptions[statusIndex] }}
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 评价列表 -->
    <view class="evaluation-list">
      <view v-for="(evaluation, index) in filteredEvaluations" :key="evaluation.id" class="evaluation-item">
        <view class="evaluation-header">
          <text class="factory-name">{{ evaluation.factoryName }}</text>
          <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
        </view>
        
        <view class="evaluation-content">
          <view class="evaluator-info">
            <text class="evaluator-label">评价人：</text>
            <text class="evaluator-name">{{ evaluation.evaluatorName }}</text>
            <text v-if="evaluation.isAnonymous" class="anonymous-tag">匿名</text>
          </view>
          
          <view class="rating-info">
            <text class="rating-item">薪资结算：{{ evaluation.salarySettlement }}星</text>
            <text class="rating-item">工作条件：{{ evaluation.workingConditions }}星</text>
            <text class="rating-item">管理尊重：{{ evaluation.managementRespect }}星</text>
          </view>
          
          <view class="comment-section">
            <text class="comment-label">评价内容：</text>
            <text class="comment-text">{{ evaluation.comment || '无' }}</text>
          </view>
          
          <view v-if="evaluation.tags && evaluation.tags.length > 0" class="tags-section">
            <text class="tags-label">标签：</text>
            <view class="tag-list">
              <text v-for="(tag, tagIndex) in evaluation.tags" :key="tagIndex" class="tag">{{ tag }}</text>
            </view>
          </view>
          
          <view v-if="evaluation.reply" class="reply-section">
            <text class="reply-label">回复：</text>
            <text class="reply-text">{{ evaluation.reply }}</text>
            <text class="reply-date">{{ evaluation.replyDate }}</text>
          </view>
          
          <view v-if="evaluation.appealStatus !== 'none'" class="appeal-section">
            <text class="appeal-label">申诉状态：</text>
            <text :class="['appeal-status', evaluation.appealStatus]">{{ getAppealStatusText(evaluation.appealStatus) }}</text>
            <text v-if="evaluation.appealReason" class="appeal-reason">理由：{{ evaluation.appealReason }}</text>
          </view>
        </view>
        
        <view class="action-buttons">
          <button class="action-btn reply-btn" @click="showReplyDialog(evaluation)">回复</button>
          <button class="action-btn appeal-btn" @click="showAppealDialog(evaluation)">申诉</button>
          <button class="action-btn delete-btn" @click="confirmDelete(evaluation)">删除恶意评价</button>
        </view>
      </view>
      
      <view v-if="filteredEvaluations.length === 0" class="empty-state">
        <text>暂无评价数据</text>
      </view>
    </view>
    
    <!-- 回复对话框 -->
    <view v-if="showReplyModal" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">回复评价</text>
        <textarea v-model="replyContent" placeholder="请输入回复内容" class="dialog-textarea" />
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="showReplyModal = false">取消</button>
          <button class="dialog-btn confirm-btn" @click="submitReply">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 申诉对话框 -->
    <view v-if="showAppealModal" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">申诉评价</text>
        <textarea v-model="appealReason" placeholder="请输入申诉理由" class="dialog-textarea" />
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="showAppealModal = false">取消</button>
          <button class="dialog-btn confirm-btn" @click="submitAppeal">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 删除确认对话框 -->
    <view v-if="showDeleteModal" class="dialog-overlay">
      <view class="dialog-content">
        <text class="dialog-title">删除恶意评价</text>
        <textarea v-model="deleteReason" placeholder="请输入删除理由" class="dialog-textarea" />
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="showDeleteModal = false">取消</button>
          <button class="dialog-btn confirm-btn" @click="submitDelete">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAllFactoryEvaluations, replyToEvaluation, appealFactoryEvaluation, markAsMaliciousAndDelete } from '../../utils/evaluation.js'

export default {
  data() {
    return {
      evaluations: [],
      searchKeyword: '',
      statusIndex: 0,
      statusOptions: ['全部', '正常', '申诉中', '已申诉'],
      showReplyModal: false,
      showAppealModal: false,
      showDeleteModal: false,
      currentEvaluation: null,
      replyContent: '',
      appealReason: '',
      deleteReason: ''
    }
  },
  computed: {
    filteredEvaluations() {
      let result = [...this.evaluations]
      
      // 搜索过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(item => 
          item.comment.toLowerCase().includes(keyword) ||
          item.evaluatorName.toLowerCase().includes(keyword) ||
          item.factoryName.toLowerCase().includes(keyword)
        )
      }
      
      // 状态过滤
      if (this.statusIndex === 1) {
        result = result.filter(item => item.appealStatus === 'none')
      } else if (this.statusIndex === 2) {
        result = result.filter(item => item.appealStatus === 'appealing')
      } else if (this.statusIndex === 3) {
        result = result.filter(item => item.appealStatus === 'approved' || item.appealStatus === 'rejected')
      }
      
      return result
    }
  },
  onLoad() {
    this.loadEvaluations()
  },
  methods: {
    loadEvaluations() {
      this.evaluations = getAllFactoryEvaluations()
    },
    goBack() {
      uni.navigateBack()
    },
    search() {
      // 搜索逻辑已在computed中实现
    },
    onStatusChange(e) {
      this.statusIndex = e.detail.value
    },
    getAppealStatusText(status) {
      switch (status) {
        case 'appealing':
          return '申诉中'
        case 'approved':
          return '申诉通过'
        case 'rejected':
          return '申诉驳回'
        default:
          return '无'
      }
    },
    showReplyDialog(evaluation) {
      this.currentEvaluation = evaluation
      this.replyContent = evaluation.reply || ''
      this.showReplyModal = true
    },
    showAppealDialog(evaluation) {
      this.currentEvaluation = evaluation
      this.appealReason = ''
      this.showAppealModal = true
    },
    confirmDelete(evaluation) {
      this.currentEvaluation = evaluation
      this.deleteReason = ''
      this.showDeleteModal = true
    },
    submitReply() {
      if (!this.currentEvaluation) return
      
      const success = replyToEvaluation(this.currentEvaluation.factoryId, this.currentEvaluation.id, this.replyContent)
      if (success) {
        uni.showToast({ title: '回复成功', icon: 'success' })
        this.loadEvaluations()
      } else {
        uni.showToast({ title: '回复失败', icon: 'none' })
      }
      this.showReplyModal = false
      this.currentEvaluation = null
      this.replyContent = ''
    },
    submitAppeal() {
      if (!this.currentEvaluation) return
      
      const success = appealFactoryEvaluation(this.currentEvaluation.factoryId, this.currentEvaluation.id, this.appealReason)
      if (success) {
        uni.showToast({ title: '申诉提交成功', icon: 'success' })
        this.loadEvaluations()
      } else {
        uni.showToast({ title: '申诉提交失败', icon: 'none' })
      }
      this.showAppealModal = false
      this.currentEvaluation = null
      this.appealReason = ''
    },
    submitDelete() {
      if (!this.currentEvaluation) return
      
      const success = markAsMaliciousAndDelete(this.currentEvaluation.factoryId, this.currentEvaluation.id, this.deleteReason)
      if (success) {
        uni.showToast({ title: '恶意评价已删除', icon: 'success' })
        this.loadEvaluations()
      } else {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
      this.showDeleteModal = false
      this.currentEvaluation = null
      this.deleteReason = ''
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
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.back-button {
  background-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  border: none;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.search-filter-section {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
}

.search-btn {
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  padding: 0 30rpx;
  border-radius: 10rpx;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #333;
}

.picker {
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  min-width: 200rpx;
}

.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.evaluation-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.factory-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.evaluation-date {
  font-size: 20rpx;
  color: #666;
}

.evaluation-content {
  margin-bottom: 20rpx;
}

.evaluator-info {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.evaluator-label {
  font-size: 22rpx;
  color: #666;
}

.evaluator-name {
  font-size: 22rpx;
  color: #333;
  margin-left: 10rpx;
}

.anonymous-tag {
  font-size: 18rpx;
  color: #999;
  margin-left: 10rpx;
  background-color: #f0f0f0;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
}

.rating-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.rating-item {
  font-size: 22rpx;
  color: #666;
  background-color: #f9f9f9;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.comment-section {
  margin-bottom: 15rpx;
}

.comment-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.comment-text {
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

.tags-section {
  margin-bottom: 15rpx;
}

.tags-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  font-size: 20rpx;
  color: #4A90E2;
  background-color: #e6f2ff;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.reply-section {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.reply-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.reply-text {
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
  margin-bottom: 5rpx;
}

.reply-date {
  font-size: 18rpx;
  color: #999;
}

.appeal-section {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #fff3cd;
  border-radius: 10rpx;
}

.appeal-label {
  font-size: 22rpx;
  color: #856404;
  display: block;
  margin-bottom: 5rpx;
}

.appeal-status {
  font-size: 22rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.appeal-status.appealing {
  color: #ffc107;
}

.appeal-status.approved {
  color: #28a745;
}

.appeal-status.rejected {
  color: #dc3545;
}

.appeal-reason {
  font-size: 20rpx;
  color: #856404;
  margin-top: 5rpx;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 10rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
}

.reply-btn {
  background-color: #4A90E2;
  color: #fff;
}

.appeal-btn {
  background-color: #ffc107;
  color: #333;
}

.delete-btn {
  background-color: #dc3545;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-state text {
  font-size: 24rpx;
  color: #999;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.dialog-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 80%;
  max-width: 500rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.dialog-textarea {
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 15rpx;
  font-size: 24rpx;
  min-height: 200rpx;
  margin-bottom: 30rpx;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
}

.dialog-btn {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.confirm-btn {
  background-color: #4A90E2;
  color: #fff;
}
</style>
