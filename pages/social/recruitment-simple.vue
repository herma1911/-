<template>
  <view class="recruitment-simple-container">
    <view class="header">
      <text class="title">招聘信息</text>
      <button class="back-button" @click="navigateBack">返回</button>
    </view>
    
    <view class="recruitment-content">
      <view v-if="recruitmentInfo" class="recruitment-card">
        <!-- 顶部核心信息区 -->
        <view class="top-core-info">
          <view class="job-header">
            <view class="job-title-container">
              <text class="job-title">{{recruitmentInfo.title}}</text>
            </view>
            <view class="company-rating-container">
              <text class="company-name">{{recruitmentInfo.company}}</text>
              <text class="rating">4.0分</text>
              <text class="certification-tag">企业认证</text>
            </view>
          </view>
          
          <!-- 平台保障条 -->
          <view class="platform-guarantee">
            <text class="guarantee-text">平台认证 | 发薪准时率100% | 对账确认率98%</text>
          </view>
        </view>
        
        <!-- 关键数据区 -->
        <view class="key-data-section">
          <view class="salary-location-container">
            <view class="salary-info">
              <text class="salary-value">{{recruitmentInfo.salary}}</text>
              <text class="payment-tag">月结</text>
            </view>
            <view class="location-info">
              <text class="location-value">{{recruitmentInfo.location}}</text>
              <text class="distance">📍距您{{getDistance(recruitmentInfo.location)}}公里</text>
            </view>
          </view>
        </view>
        
        <!-- 标签区 -->
        <view class="tags-section">
          <view class="tags-container">
            <text v-for="(skill, index) in recruitmentInfo.skills" :key="index" class="process-tag">{{skill}}</text>
            <text v-if="recruitmentInfo.benefits && recruitmentInfo.benefits.includeMeals" class="benefit-tag">包吃</text>
            <text v-if="recruitmentInfo.benefits && recruitmentInfo.benefits.includeAccommodation" class="benefit-tag">包住</text>
            <text v-if="recruitmentInfo.benefits && recruitmentInfo.benefits.socialInsurance" class="benefit-tag">五险一金</text>
            <text v-if="recruitmentInfo.workingHours && recruitmentInfo.workingHours.includes('白班')" class="benefit-tag">长白班</text>
          </view>
        </view>
        

        
        <!-- 更多信息区 -->
        <view class="more-info-section">
          <view class="more-info-header" @click="toggleMoreInfo">
            <text class="more-info-title">更多信息</text>
            <text class="more-info-arrow">{{isMoreInfoExpanded ? '▼' : '▶'}}</text>
          </view>
          
          <view v-if="isMoreInfoExpanded" class="more-info-content">
            <view class="info-item">
              <text class="info-label">技能要求</text>
              <text class="info-value">{{recruitmentInfo.skills && recruitmentInfo.skills.length > 0 ? recruitmentInfo.skills.join('、') : '无'}}</text>
            </view>
            
            <view class="info-item">
              <text class="info-label">工作经验</text>
              <text class="info-value">{{recruitmentInfo.experience || '不限'}}</text>
            </view>
            
            <view class="info-item">
              <text class="info-label">工作描述</text>
              <view class="description-container">
                <text :class="['description-content', { 'expanded': isFullDescription }]">{{recruitmentInfo.description}}</text>
                <text v-if="recruitmentInfo.description && recruitmentInfo.description.length > 50" class="view-full-text" @click="toggleFullDescription">{{isFullDescription ? '收起' : '查看全文'}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
    
    <!-- 推荐更多相似岗位 -->
    <view class="similar-jobs-section">
      <view class="similar-jobs-button" @click="recommendSimilarJobs">
        觉得这个岗位不合适？点击推荐更多相似岗位，精准匹配你的技能
      </view>
    </view>
    
    <!-- 操作按钮区 -->
    <view class="action-buttons-section">
      <view class="core-buttons">
        <button class="core-button apply-button" @click="applyForJob">申请</button>
        <button class="core-button consult-button" @click="showConsultModal">咨询</button>
        <button class="core-button phone-button" @click="recruitmentInfo.phone && makePhoneCall(recruitmentInfo.phone)">电话</button>
      </view>
    </view>
    
    <!-- 留电话弹窗 -->
    <view v-if="showPhoneModalVisible" class="modal-overlay" @click="closePhoneModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">留个电话，给你推靠谱好厂✨</text>
        </view>
        <view class="modal-body">
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">只推我们核实过的老厂、正规厂，不推黑厂、坑人工厂</text>
          </view>
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">工价透明、准时发薪，岗位信息和实际一致不忽悠</text>
          </view>
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">不瞎骚扰！只有适合你工种、离家近的好岗位才通知你</text>
          </view>
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">留号即享优先安排，好岗位不用抢，我们直接对接</text>
          </view>
          
          <view class="phone-input-section">
            <input type="number" v-model="phoneNumber" placeholder="请输入常用手机号，仅用于岗位对接" class="phone-input" />
          </view>
          
          <text class="privacy-text">（隐私保障：你的电话仅用于匹配岗位，绝不泄露）</text>
        </view>
        <view class="modal-footer">
          <button class="cancel-button" @click="closePhoneModal">暂不</button>
          <button class="confirm-button" @click="submitPhone">留电话·优先安排靠谱厂</button>
        </view>
      </view>
    </view>
    
    <!-- 申请成功弹窗 -->
    <view v-if="showApplySuccessModal" class="modal-overlay" @click="closeApplySuccessModal">
      <view class="modal-content" @click.stop>
        <view class="success-icon">✓</view>
        <text class="success-title">申请成功</text>
        <text class="success-message">等待工厂回复</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recruitmentInfo: null,
      showPhoneModalVisible: false,
      showApplySuccessModal: false,
      phoneNumber: '',
      isMoreInfoExpanded: false,
      isFullDescription: false
    }
  },
  onLoad(options) {
    // 从options中获取招聘信息ID
    const recruitmentId = options.id || 1
    this.loadRecruitmentInfo(recruitmentId)
    
    // 自动显示留电话弹窗
    setTimeout(() => {
      this.showPhoneModal()
    }, 1000)
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    loadRecruitmentInfo(id) {
      // 模拟加载招聘信息
      // 实际项目中应该从API获取
      const mockRecruitmentList = [
        {
          id: 1,
          title: '服装设计师',
          company: '衣起赚服装厂',
          salary: '8000-12000元/月',
          location: '广州',
          experience: '3年以上',
          description: '负责服装设计，熟悉时尚潮流，有相关工作经验优先',
          publishDate: '2026-02-18',
          skills: [],
          wechat: 'yiqizhuan888',
          phone: '13800138000'
        },
        {
          id: 2,
          title: '缝纫工',
          company: '衣起赚服装厂',
          salary: '5000-8000元/月',
          location: '广州',
          experience: '1年以上',
          description: '熟练操作缝纫机，有服装加工经验',
          publishDate: '2026-02-17',
          skills: ['平车'],
          wechat: 'fuzhuangrenli',
          phone: '13900139000'
        },
        {
          id: 3,
          title: '质检员',
          company: '衣起赚服装厂',
          salary: '6000-9000元/月',
          location: '广州',
          experience: '2年以上',
          description: '负责服装质量检验，确保产品符合标准',
          publishDate: '2026-02-16',
          skills: [],
          wechat: 'zhijianyuan2026',
          phone: '13700137000'
        }
      ]
      
      // 查找对应ID的招聘信息
      this.recruitmentInfo = mockRecruitmentList.find(item => item.id === parseInt(id))
    },

    makePhoneCall(phone) {
      uni.makePhoneCall({
        phoneNumber: phone,
        success: () => {
          console.log('拨打电话成功')
        },
        fail: (err) => {
          console.log('拨打电话失败', err)
        }
      })
    },
    
    // 显示留电话弹窗
    showPhoneModal() {
      this.showPhoneModalVisible = true
    },
    
    // 关闭留电话弹窗
    closePhoneModal() {
      this.showPhoneModalVisible = false
    },
    
    // 提交电话
    submitPhone() {
      if (!this.phoneNumber || this.phoneNumber.length !== 11) {
        uni.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        })
        return
      }
      
      // 模拟提交电话
      uni.showToast({
        title: '提交成功！我们会尽快为你匹配合适的岗位',
        icon: 'success'
      })
      
      // 关闭弹窗
      this.closePhoneModal()
    },
    
    // 计算距离
    getDistance(location) {
      // 模拟距离计算
      return Math.floor(Math.random() * 10) + 1
    },
    
    // 申请工作
    applyForJob() {
      // 弹出确认弹窗
      uni.showModal({
        title: '申请工作',
        content: '是否申请该岗位？',
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 显示申请成功弹窗
            this.showApplySuccessModal = true
            
            // 2秒后自动关闭
            setTimeout(() => {
              this.closeApplySuccessModal()
            }, 2000)
          }
        }
      })
    },
    
    // 复制微信
    copyWechat(wechat) {
      uni.setClipboardData({
        data: wechat,
        success: () => {
          uni.showToast({
            title: '微信已复制',
            icon: 'success'
          })
        }
      })
    },
    
    // 关闭申请成功弹窗
    closeApplySuccessModal() {
      this.showApplySuccessModal = false
    },
    
    // 切换更多信息展开/折叠
    toggleMoreInfo() {
      this.isMoreInfoExpanded = !this.isMoreInfoExpanded
    },
    
    // 切换工作描述全文显示
    toggleFullDescription() {
      this.isFullDescription = !this.isFullDescription
    },
    
    // 显示咨询弹窗
    showConsultModal() {
      // 实际项目中应该显示咨询弹窗
      uni.showToast({
        title: '咨询功能开发中',
        icon: 'none'
      })
    },
    
    // 推荐更多相似岗位
    recommendSimilarJobs() {
      // 实际项目中应该跳转到相似岗位推荐页面
      uni.showToast({
        title: '推荐相似岗位功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.recruitment-simple-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx; /* 为底部按钮留出空间 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.back-button {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
  background-color: #f0f0f0;
  color: #666;
}

/* 招聘卡片 */
.recruitment-card {
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 16rpx;
}

/* 顶部核心信息区 */
.top-core-info {
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.job-header {
  margin-bottom: 12rpx;
}

.job-title-container {
  margin-bottom: 8rpx;
}

.job-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.company-rating-container {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.company-name {
  font-size: 24rpx;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rating {
  font-size: 24rpx;
  color: #fa8c16;
  font-weight: 500;
}

.certification-tag {
  font-size: 20rpx;
  color: white;
  background-color: #fa8c16;
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
}

/* 平台保障条 */
.platform-guarantee {
  background-color: #FFF8E1;
  height: 48rpx;
  border-radius: 8rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.guarantee-text {
  font-size: 22rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 关键数据区 */
.key-data-section {
  padding: 12rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.salary-location-container {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.salary-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.salary-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fa8c16;
}

.payment-tag {
  font-size: 20rpx;
  color: white;
  background-color: #FF5722;
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.location-value {
  font-size: 24rpx;
  color: #666;
}

.distance {
  font-size: 24rpx;
  color: #666;
}

/* 标签区 */
.tags-section {
  padding: 12rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.process-tag {
  font-size: 22rpx;
  color: #4A90E2;
  border: 1rpx solid #4A90E2;
  background-color: transparent;
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
}

.benefit-tag {
  font-size: 22rpx;
  color: #666;
  border: 1rpx solid #666;
  background-color: transparent;
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
}

/* 更多信息区 */
.more-info-section {
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.more-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.more-info-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
}

.more-info-arrow {
  font-size: 20rpx;
  color: #666;
}

.more-info-content {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.info-label {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 22rpx;
  color: #333;
  line-height: 32rpx;
}

.description-container {
  position: relative;
}

.description-content {
  font-size: 22rpx;
  color: #333;
  line-height: 32rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-content.expanded {
  -webkit-line-clamp: unset;
}

.view-full-text {
  font-size: 20rpx;
  color: #4A90E2;
  margin-top: 8rpx;
  display: block;
}



/* 操作按钮区 */
.action-buttons-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 20rpx;
  background-color: white;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.core-buttons {
  display: flex;
  gap: 12rpx;
}

.core-button {
  flex: 1;
  height: 48rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apply-button {
  background-color: #52c41a;
  color: white;
}

.consult-button {
  background-color: #fa8c16;
  color: white;
}

.phone-button {
  background-color: #9E9E9E;
  color: white;
}

/* 弹窗样式 */
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
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  width: 85%;
  max-width: 500rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.modal-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 30rpx;
}

.modal-item {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
}

.modal-check {
  font-size: 24rpx;
  margin-right: 15rpx;
  margin-top: 2rpx;
}

.modal-text {
  flex: 1;
  font-size: 22rpx;
  color: #666;
  line-height: 32rpx;
}

.phone-input-section {
  margin: 30rpx 0;
}

.phone-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.privacy-text {
  font-size: 18rpx;
  color: #999;
  text-align: center;
  margin-top: 20rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
}

.cancel-button {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #666;
}

.confirm-button {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: bold;
  background-color: #00B42A;
  color: #fff;
}

/* 申请成功弹窗 */
.success-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #52c41a;
  color: white;
  font-size: 48rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}

.success-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10rpx;
}

.success-message {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500rpx;
}

.loading-text {
  font-size: 24rpx;
  color: #999;
}

/* 推荐更多相似岗位 */
.similar-jobs-section {
  margin: 20rpx 0;
  padding: 0 20rpx;
}

.similar-jobs-button {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  font-size: 24rpx;
  color: #4A90E2;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.similar-jobs-button:hover {
  background-color: #f0f0f0;
}
</style>