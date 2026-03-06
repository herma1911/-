<template>
  <view class="fast-track-container">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">B级快速认证通道</text>
      <view class="empty"></view>
    </view>
    
    <!-- 资格检查提示 -->
    <view v-if="!isEligible" class="eligibility-tip">
      <text class="tip-icon">⚠️</text>
      <text class="tip-text">只有C级新工厂可以申请B级快速认证</text>
      <button class="back-btn" @tap="goBack">返回</button>
    </view>
    
    <!-- 认证通道选择 -->
    <view v-else class="channels-container">
      <!-- 拉新达标通道 -->
      <view class="channel-card" @tap="selectChannel('recruitment')">
        <view class="channel-header">
          <text class="channel-icon">👥</text>
          <text class="channel-title">拉新达标通道</text>
          <text class="channel-status" :class="{ 'eligible': isRecruitmentEligible }">
            {{ isRecruitmentEligible ? '已达标' : '进行中' }}
          </text>
        </view>
        <view class="channel-desc">
          <text class="desc-text">满足以下任意1条，即可直接升级为B级工厂：</text>
          <view class="condition-list">
            <view class="condition-item" :class="{ 'completed': factoryData.totalInviteWorker >= 15 }">
              <text class="condition-icon">{{ factoryData.totalInviteWorker >= 15 ? '✓' : '○' }}</text>
              <text class="condition-text">累计有效拉新≥15名工人</text>
              <text class="condition-progress">{{ factoryData.totalInviteWorker }}/15</text>
            </view>
            <view class="condition-item" :class="{ 'completed': factoryData.totalInviteFactory >= 2 }">
              <text class="condition-icon">{{ factoryData.totalInviteFactory >= 2 ? '✓' : '○' }}</text>
              <text class="condition-text">累计有效拉新≥2家工厂</text>
              <text class="condition-progress">{{ factoryData.totalInviteFactory }}/2</text>
            </view>
          </view>
        </view>
        <view class="channel-footer">
          <text class="reward-text">🎁 完成奖励：500积分</text>
          <text class="auto-verify">系统自动核验，达标后直接升级</text>
        </view>
      </view>
      
      <!-- 海报推广通道 -->
      <view class="channel-card" @tap="selectChannel('poster')">
        <view class="channel-header">
          <text class="channel-icon">📢</text>
          <text class="channel-title">海报推广通道</text>
          <text class="channel-status">待提交</text>
        </view>
        <view class="channel-desc">
          <text class="desc-text">使用平台官方招工海报模板，完成以下任意1项推广：</text>
          <view class="condition-list">
            <view class="condition-item">
              <text class="condition-icon">○</text>
              <text class="condition-text">线下：海报张贴在厂门口醒目位置，连续7天，提交3张不同日期的实拍图</text>
            </view>
            <view class="condition-item">
              <text class="condition-icon">○</text>
              <text class="condition-text">线上：海报发送至≥5个200人以上的服装/招工群，提交带群名、发送时间的截图</text>
            </view>
          </view>
        </view>
        <view class="channel-footer">
          <text class="reward-text">🎁 完成奖励：300积分</text>
          <text class="manual-verify">提交材料后，等待人工审核</text>
        </view>
      </view>
      
      <!-- 补充规则 -->
      <view class="rules-section">
        <text class="rules-title">补充规则</text>
        <view class="rules-list">
          <text class="rule-item">• 升级后需在30天内完成≥5笔有效闭环发薪，否则自动降回C级，收回所有权益</text>
          <text class="rule-item">• 发现P图造假、虚假拉新等违规行为，直接取消B级认证，降为D级，6个月内不可再次申请</text>
        </view>
      </view>
    </view>
    
    <!-- 拉新达标通道详情 -->
    <view v-if="showRecruitmentDetail" class="detail-modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">拉新达标通道</text>
          <text class="close-btn" @tap="showRecruitmentDetail = false">✕</text>
        </view>
        <view class="modal-body">
          <text class="modal-desc">系统正在自动统计您的拉新数据，请耐心等待。</text>
          <view class="progress-container">
            <view class="progress-item">
              <text class="progress-label">有效拉新工人</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: (factoryData.totalInviteWorker / 15) * 100 + '%' }"></view>
              </view>
              <text class="progress-text">{{ factoryData.totalInviteWorker }}/15</text>
            </view>
            <view class="progress-item">
              <text class="progress-label">有效拉新工厂</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: (factoryData.totalInviteFactory / 2) * 100 + '%' }"></view>
              </view>
              <text class="progress-text">{{ factoryData.totalInviteFactory }}/2</text>
            </view>
          </view>
          <button v-if="isRecruitmentEligible" class="upgrade-btn" @tap="upgradeToBLevel">
            立即升级为B级工厂
          </button>
        </view>
      </view>
    </view>
    
    <!-- 海报推广通道详情 -->
    <view v-if="showPosterDetail" class="detail-modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">海报推广通道</text>
          <text class="close-btn" @tap="showPosterDetail = false">✕</text>
        </view>
        <view class="modal-body">
          <text class="modal-desc">请选择推广方式并上传相关材料：</text>
          <view class="promotion-options">
            <view class="option-item" :class="{ 'selected': selectedPromotion === 'offline' }" @tap="selectedPromotion = 'offline'">
              <text class="option-radio">{{ selectedPromotion === 'offline' ? '✓' : '○' }}</text>
              <text class="option-text">线下推广：厂门口张贴海报</text>
            </view>
            <view class="option-item" :class="{ 'selected': selectedPromotion === 'online' }" @tap="selectedPromotion = 'online'">
              <text class="option-radio">{{ selectedPromotion === 'online' ? '✓' : '○' }}</text>
              <text class="option-text">线上推广：发送到招工群</text>
            </view>
          </view>
          <view class="upload-section">
            <text class="upload-title">上传材料</text>
            <view class="upload-list">
              <view v-for="(file, index) in uploadedFiles" :key="index" class="upload-item">
                <text class="file-name">{{ file.name }}</text>
                <text class="delete-btn" @tap="deleteFile(index)">删除</text>
              </view>
              <view class="upload-btn" @tap="chooseImage">
                <text class="upload-icon">+</text>
                <text class="upload-text">添加图片</text>
              </view>
            </view>
          </view>
          <button class="submit-btn" @tap="submitPosterMaterials">
            提交审核
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import factoryLevelSystem from '../../utils/factory-level-system.js'

export default {
  data() {
    return {
      factoryData: {
        level: 'C',
        totalInviteWorker: 0,
        totalInviteFactory: 0,
        totalClosedPay: 0,
        closedPayRate: 0,
        continuousPayMonth: 0,
        workerGoodRate: 0,
        monthlyLoginDays: 0,
        violationCount: 0
      },
      isEligible: true,
      isRecruitmentEligible: false,
      showRecruitmentDetail: false,
      showPosterDetail: false,
      selectedPromotion: 'offline',
      uploadedFiles: []
    }
  },
  onLoad() {
    this.loadFactoryData()
  },
  methods: {
    // 加载工厂数据
    loadFactoryData() {
      // 模拟从本地存储加载工厂数据
      const storedData = uni.getStorageSync('factoryData')
      if (storedData) {
        this.factoryData = storedData
      }
      
      // 检查资格
      this.isEligible = factoryLevelSystem.checkFastTrackEligibility(this.factoryData)
      this.isRecruitmentEligible = factoryLevelSystem.checkRecruitmentChannel(this.factoryData)
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 选择认证通道
    selectChannel(channel) {
      if (channel === 'recruitment') {
        this.showRecruitmentDetail = true
      } else if (channel === 'poster') {
        this.showPosterDetail = true
      }
    },
    
    // 升级为B级工厂
    upgradeToBLevel() {
      if (this.isRecruitmentEligible) {
        // 更新工厂等级
        this.factoryData.level = 'B'
        uni.setStorageSync('factoryData', this.factoryData)
        
        // 发放积分奖励
        const pointsReward = factoryLevelSystem.fastTrackRules.channels.recruitment.pointsReward
        
        // 显示成功提示
        uni.showToast({
          title: `升级成功！获得${pointsReward}积分奖励`,
          icon: 'success'
        })
        
        // 3秒后返回
        setTimeout(() => {
          this.showRecruitmentDetail = false
          this.goBack()
        }, 3000)
      }
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 5,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          res.tempFilePaths.forEach((path, index) => {
            this.uploadedFiles.push({
              name: `材料${this.uploadedFiles.length + index + 1}.jpg`,
              path: path
            })
          })
        }
      })
    },
    
    // 删除文件
    deleteFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    
    // 提交海报材料
    submitPosterMaterials() {
      if (this.uploadedFiles.length === 0) {
        uni.showToast({
          title: '请上传相关材料',
          icon: 'none'
        })
        return
      }
      
      // 模拟提交审核
      uni.showLoading({
        title: '提交中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '提交成功，等待审核',
          icon: 'success'
        })
        
        // 3秒后返回
        setTimeout(() => {
          this.showPosterDetail = false
          this.goBack()
        }, 3000)
      }, 2000)
    }
  }
}
</script>

<style scoped>
.fast-track-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
}

/* 顶部导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  height: 100rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.empty {
  width: 60rpx;
}

/* 资格检查提示 */
.eligibility-tip {
  background: #fff;
  margin: 20rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tip-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
  line-height: 1.4;
}

/* 认证通道 */
.channels-container {
  padding: 20rpx;
}

.channel-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.channel-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.channel-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.channel-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.channel-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.channel-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.channel-status.eligible {
  background: #f6ffed;
  color: #52c41a;
}

.channel-status:not(.eligible) {
  background: #e6f7ff;
  color: #1677ff;
}

.channel-desc {
  margin-bottom: 20rpx;
}

.desc-text {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
  line-height: 1.4;
}

.condition-list {
  margin-left: 20rpx;
}

.condition-item {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  padding: 15rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  border-left: 4rpx solid #e8e8e8;
}

.condition-item.completed {
  background: #f6ffed;
  border-left-color: #52c41a;
}

.condition-icon {
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 15rpx;
  width: 30rpx;
  text-align: center;
}

.condition-item.completed .condition-icon {
  color: #52c41a;
}

.condition-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

.condition-progress {
  font-size: 20rpx;
  color: #999;
  font-weight: 600;
  margin-left: 15rpx;
}

.channel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.reward-text {
  font-size: 22rpx;
  color: #fa8c16;
  font-weight: 600;
}

.auto-verify,
.manual-verify {
  font-size: 20rpx;
  color: #999;
}

/* 补充规则 */
.rules-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.rules-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.rules-list {
  margin-left: 10rpx;
}

.rule-item {
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

/* 详情模态框 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-width: 500rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
}

.modal-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  line-height: 1.4;
  display: block;
}

/* 进度条 */
.progress-container {
  margin-bottom: 30rpx;
}

.progress-item {
  margin-bottom: 20rpx;
}

.progress-label {
  font-size: 22rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 20rpx;
  color: #999;
  text-align: right;
}

/* 推广选项 */
.promotion-options {
  margin-bottom: 30rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.option-item.selected {
  background: #e6f7ff;
  border-color: #1677ff;
}

.option-radio {
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 15rpx;
  width: 30rpx;
  text-align: center;
}

.option-item.selected .option-radio {
  color: #1677ff;
}

.option-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 30rpx;
}

.upload-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.upload-list {
  border: 2rpx dashed #e8e8e8;
  border-radius: 12rpx;
  padding: 20rpx;
  min-height: 200rpx;
}

.upload-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.file-name {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  font-size: 20rpx;
  color: #ff4d4f;
  padding: 5rpx 10rpx;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  border: 2rpx dashed #e8e8e8;
  transition: all 0.3s ease;
}

.upload-btn:active {
  background: #f0f0f0;
}

.upload-icon {
  font-size: 48rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 22rpx;
  color: #999;
}

/* 按钮样式 */
.upgrade-btn,
.submit-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 20rpx;
}

.upgrade-btn:active,
.submit-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
