<template>
  <view class="invite-code-generate-container">
    <view class="header">
      <text class="title">生成班组邀请码</text>
    </view>
    
    <!-- 步骤条引导 -->
    <view class="step-guide">
      <view class="step-item" :class="{ active: currentStep >= 1 }">
        <view class="step-number">{{ currentStep >= 1 ? '✓' : '1' }}</view>
        <text class="step-text">选择车间/组别</text>
      </view>
      <view class="step-divider" :class="{ active: currentStep >= 1 }"></view>
      <view class="step-item" :class="{ active: currentStep >= 2 }">
        <view class="step-number">{{ currentStep >= 2 ? '✓' : '2' }}</view>
        <text class="step-text">填写工序、工价</text>
      </view>
      <view class="step-divider" :class="{ active: currentStep >= 2 }"></view>
      <view class="step-item" :class="{ active: currentStep >= 3 }">
        <view class="step-number">{{ currentStep >= 3 ? '✓' : '3' }}</view>
        <text class="step-text">设置有效期</text>
      </view>
    </view>
    
    <!-- 邀请码说明 -->
    <view class="invite-code-info">
      <text class="info-text">该邀请码为本班组专属绑定码，计件工人可同步查看本班组所有款号工价，计时工人可绑定班组记账</text>
    </view>
    
    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 步骤1：选择车间/组别 -->
      <view v-if="currentStep === 1" class="form-step">
        <view class="form-item">
          <text class="label">选择车间/组别</text>
          <view class="select-mode">
            <button 
              :class="['mode-btn', { active: selectMode === 'select' }]" 
              @click="selectMode = 'select'"
            >
              从组织架构选择
            </button>
            <button 
              :class="['mode-btn', { active: selectMode === 'input' }]" 
              @click="selectMode = 'input'"
            >
              手动输入
            </button>
          </view>
          <view v-if="selectMode === 'select'" class="select-container">
            <picker @change="handleDepartmentChange" :value="departmentIndex" :range="departments" range-key="name">
              <view class="picker">
                {{ departments[departmentIndex].name }}
              </view>
            </picker>
          </view>
          <view v-else class="input-container">
            <input type="text" v-model="customDepartment" placeholder="请输入班组或部门名称" class="input" />
          </view>
          <view class="bubble-guide">
            <text class="bubble-text">选组别后，员工将绑定到对应班组</text>
          </view>
        </view>
        <button class="next-btn" @click="nextStep">下一步</button>
      </view>
      
      <!-- 步骤2：填写工序、工价 -->
      <view v-if="currentStep === 2" class="form-step">
        <view class="form-item">
          <text class="label">工序</text>
          <input type="text" v-model="formData.process" placeholder="请填写具体工序" class="input" />
        </view>
        <view class="form-item">
          <text class="label">默认工价</text>
          <input type="number" v-model="formData.wage" placeholder="工价会自动同步到员工计件账本" class="input" />
        </view>
        <view class="form-actions">
          <button class="prev-btn" @click="prevStep">上一步</button>
          <button class="next-btn" @click="nextStep">下一步</button>
        </view>
      </view>
      
      <!-- 步骤3：设置有效期 -->
      <view v-if="currentStep === 3" class="form-step">
        <view class="form-item">
          <text class="label">邀请码有效期</text>
          <view class="select-container">
            <picker @change="handleExpiryChange" :value="expiryIndex" :range="expiryOptions" range-key="label">
              <view class="picker">
                {{ expiryOptions[expiryIndex].label }}
              </view>
            </picker>
          </view>
        </view>
        <view class="form-actions">
          <button class="prev-btn" @click="prevStep">上一步</button>
          <button class="generate-btn" @click="generateInviteCode">生成邀请码</button>
        </view>
      </view>
      
      <!-- 生成结果页 -->
      <view v-if="showResult" class="result-page">
        <view class="result-header">
          <text class="result-title">邀请码生成成功！</text>
        </view>
        <view class="invite-code-card">
          <text class="code-label">邀请码</text>
          <text class="code-value">{{ generatedCode }}</text>
          <view class="qrcode-placeholder">
            <text class="qrcode-text">二维码</text>
          </view>
        </view>
        <view class="benefits-list">
          <view class="benefit-item">
            <text class="benefit-icon">✅</text>
            <text class="benefit-text">员工输入邀请码即可绑定班组</text>
          </view>
          <view class="benefit-item">
            <text class="benefit-icon">✅</text>
            <text class="benefit-text">绑定后，员工可查看班组工价并进行记账</text>
          </view>
          <view class="benefit-item">
            <text class="benefit-icon">✅</text>
            <text class="benefit-text">班组长需在24小时内确认员工的班组归属</text>
          </view>
        </view>
        <view class="result-actions">
          <button class="action-btn share-btn" @click="shareInviteCode">分享给员工</button>
          <button class="action-btn print-btn" @click="printInviteCode">打印邀请码</button>
          <button class="action-btn record-btn" @click="viewInviteRecords">查看邀请记录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      showResult: false,
      generatedCode: '',
      departmentIndex: 0,
      expiryIndex: 0,
      selectMode: 'select', // 'select' 或 'input'
      customDepartment: '',
      departments: [],
      expiryOptions: [
        { value: 7, label: '7天' },
        { value: 15, label: '15天' },
        { value: 30, label: '30天' }
      ],
      formData: {
        process: '',
        wage: ''
      }
    }
  },
  onLoad() {
    this.loadDepartments()
  },
  methods: {
    loadDepartments() {
      // 从本地存储加载组织架构数据
      const storedDepartments = uni.getStorageSync('departments') || [
        { id: 1, name: '裁剪车间' },
        { id: 2, name: '缝纫车间' },
        { id: 3, name: '后整车间' },
        { id: 4, name: '包装车间' }
      ]
      this.departments = storedDepartments
    },
    nextStep() {
      if (this.currentStep === 1) {
        if (this.selectMode === 'select' && !this.departments[this.departmentIndex]) {
          uni.showToast({
            title: '请选择车间/组别',
            icon: 'none'
          })
          return
        } else if (this.selectMode === 'input' && !this.customDepartment.trim()) {
          uni.showToast({
            title: '请输入班组或部门名称',
            icon: 'none'
          })
          return
        }
      }
      if (this.currentStep === 2 && (!this.formData.process || !this.formData.wage)) {
        uni.showToast({
          title: '请完善工序、工价信息，避免员工对账纠纷',
          icon: 'none'
        })
        return
      }
      this.currentStep++
    },
    prevStep() {
      this.currentStep--
    },
    handleDepartmentChange(e) {
      this.departmentIndex = e.detail.value
    },
    handleExpiryChange(e) {
      this.expiryIndex = e.detail.value
    },
    handleCountChange(e) {
      this.countIndex = e.detail.value
    },
    generateInviteCode() {
      // 生成6位数字邀请码
      this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // 确定部门名称
      const departmentName = this.selectMode === 'select' 
        ? this.departments[this.departmentIndex].name 
        : this.customDepartment.trim()
      
      // 保存邀请码记录
      const inviteRecords = uni.getStorageSync('inviteRecords') || []
      inviteRecords.push({
        id: Date.now(),
        code: this.generatedCode,
        department: departmentName,
        process: this.formData.process,
        wage: this.formData.wage,
        expiryDays: this.expiryOptions[this.expiryIndex].value,
        createdAt: new Date().toISOString(),
        usedCount: 0,
        status: 'active'
      })
      uni.setStorageSync('inviteRecords', inviteRecords)
      
      // 显示结果页
      this.showResult = true
      
      // 数据埋点
      this.trackEvent('invite_code_generated')
    },
    shareInviteCode() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    printInviteCode() {
      uni.showToast({
        title: '打印功能开发中',
        icon: 'none'
      })
    },
    viewInviteRecords() {
      uni.navigateTo({
        url: '/pages/factory/invite-records'
      })
    },
    trackEvent(eventName) {
      // 数据埋点
      console.log('Track event:', eventName)
      // 实际项目中应该调用埋点SDK
    }
  }
}
</script>

<style scoped>
.invite-code-generate-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.step-guide {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-number {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.step-item.active .step-number {
  background-color: #4A90E2;
  color: #fff;
}

.step-text {
  font-size: 20rpx;
  color: #666;
  text-align: center;
}

.step-item.active .step-text {
  color: #4A90E2;
  font-weight: bold;
}

.step-divider {
  width: 80rpx;
  height: 2rpx;
  background-color: #e0e0e0;
}

.step-divider.active {
  background-color: #4A90E2;
}

.form-content {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-step {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.label {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.input {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 24rpx;
}

.select-mode {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.mode-btn {
  flex: 1;
  height: 60rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  background-color: #f9f9f9;
  font-size: 24rpx;
  color: #666;
}

.mode-btn.active {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
}

.select-container {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
}

.input-container {
  margin-top: 10rpx;
}

.picker {
  font-size: 24rpx;
  color: #333;
}

.bubble-guide {
  background-color: #e6f7ff;
  padding: 15rpx;
  border-radius: 10rpx;
  margin-top: 10rpx;
}

.bubble-text {
  font-size: 20rpx;
  color: #1890ff;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.next-btn, .prev-btn, .generate-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.next-btn, .generate-btn {
  background-color: #4A90E2;
  color: #fff;
}

.prev-btn {
  background-color: #e0e0e0;
  color: #333;
}

.result-page {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  align-items: center;
}

.result-header {
  text-align: center;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.invite-code-card {
  background-color: #f9f9f9;
  border: 2rpx solid #4A90E2;
  border-radius: 15rpx;
  padding: 40rpx;
  width: 100%;
  text-align: center;
  margin: 20rpx 0;
}

.code-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.code-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4A90E2;
  letter-spacing: 10rpx;
  margin: 20rpx 0;
}

.qrcode-placeholder {
  width: 200rpx;
  height: 200rpx;
  background-color: #e0e0e0;
  margin: 20rpx auto;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-text {
  font-size: 20rpx;
  color: #999;
}

.benefits-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 15rpx;
}

.benefit-icon {
  font-size: 24rpx;
  margin-top: 2rpx;
}

.benefit-text {
  font-size: 24rpx;
  color: #666;
  flex: 1;
}

.result-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.action-btn {
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.share-btn {
  background-color: #52c41a;
  color: #fff;
}

.print-btn {
  background-color: #faad14;
  color: #fff;
}

.record-btn {
  background-color: #1890ff;
  color: #fff;
}

/* 邀请码说明样式 */
.invite-code-info {
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 10rpx;
  padding: 15rpx;
  margin-bottom: 20rpx;
}

.info-text {
  font-size: 20rpx;
  color: #389e0d;
  line-height: 1.4;
  text-align: center;
}
</style>