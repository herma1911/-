<template>
  <view class="factory-profile-container">
    <view class="form-section">
      <text class="form-title">工厂档案</text>
      <view class="form-tip">
        <text class="tip-text">完善工厂档案，提高工人信任度和咨询量！</text>
      </view>
      <view class="form-tip highlight-tip">
        <text class="tip-title">想要好工人先看到你？</text>
        <text class="tip-content">完成实力认证，即可开启《技能档案》展示。让你的工人展示真实产量与工序专长，工人越优秀，你的工厂越吸粉！同时积累排名积分，抢占首页优质曝光位，让好工人主动来找你！</text>
      </view>
      
      <view class="form-item required">
        <text class="form-label">工厂名称</text>
        <text class="required-mark">*</text>
        <input type="text" v-model="factoryInfo.name" placeholder="请输入工厂名称" class="form-input" />
      </view>
      
      <view class="form-item required">
        <text class="form-label">真实地址</text>
        <text class="required-mark">*</text>
        <input type="text" v-model="factoryInfo.address" placeholder="请输入详细地址" class="form-input" />
      </view>
      
      <view class="form-item required">
        <text class="form-label">主营品类</text>
        <text class="required-mark">*</text>
        <input type="text" v-model="factoryInfo.category" placeholder="请输入主营品类，例如：专做羽绒服" class="form-input" />
        <text class="tip-small">建议详细描述，如"专做羽绒服"、"牛仔裤加工"等，让工人更清楚</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">车间照片</text>
        <text class="tip-small">拍设备/环境，别P图！真实照片更能获得工人信任</text>
        <button type="default" class="upload-btn" @click="uploadPhotos('workshop')">上传照片</button>
        <!-- 照片预览 -->
        <view v-if="factoryInfo.workshopPhotos && factoryInfo.workshopPhotos.length > 0" class="photo-preview">
          <view v-for="(photo, index) in factoryInfo.workshopPhotos" :key="index" class="photo-item">
            <image :src="photo" mode="aspectFill" class="photo-img" />
            <button type="default" class="remove-photo-btn" @click="removePhoto('workshop', index)">×</button>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">工厂实拍照片</text>
        <text class="tip-small">拍摄工厂外观、整体环境等，展示真实工厂面貌</text>
        <button type="default" class="upload-btn" @click="uploadPhotos('factory')">上传照片</button>
        <!-- 照片预览 -->
        <view v-if="factoryInfo.factoryPhotos && factoryInfo.factoryPhotos.length > 0" class="photo-preview">
          <view v-for="(photo, index) in factoryInfo.factoryPhotos" :key="index" class="photo-item">
            <image :src="photo" mode="aspectFill" class="photo-img" />
            <button type="default" class="remove-photo-btn" @click="removePhoto('factory', index)">×</button>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">工人福利</text>
        <view class="benefit-options">
          <label class="checkbox-label">
            <checkbox :checked="factoryInfo.benefits.includeMeals" @change="factoryInfo.benefits.includeMeals = !factoryInfo.benefits.includeMeals" />
            <text>包吃</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="factoryInfo.benefits.includeAccommodation" @change="factoryInfo.benefits.includeAccommodation = !factoryInfo.benefits.includeAccommodation" />
            <text>包住</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="factoryInfo.benefits.socialInsurance" @change="factoryInfo.benefits.socialInsurance = !factoryInfo.benefits.socialInsurance" />
            <text>社保</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="factoryInfo.benefits.bonus" @change="factoryInfo.benefits.bonus = !factoryInfo.benefits.bonus" />
            <text>年终奖</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="factoryInfo.benefits.overtimePay" @change="factoryInfo.benefits.overtimePay = !factoryInfo.benefits.overtimePay" />
            <text>加班费</text>
          </label>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">工资发放日</text>
        <input type="text" v-model="factoryInfo.salaryPaymentDay" placeholder="如：每月15号" class="form-input" />
      </view>
      
      <view class="form-item">
        <text class="form-label">老板承诺</text>
        <textarea v-model="factoryInfo.promise" placeholder="如：绝不拖欠工资、加班有补贴" class="form-textarea" />
      </view>
      
      <view class="form-item">
        <text class="form-label">工厂自评</text>
        <textarea v-model="factoryInfo.selfEvaluation" placeholder="如：我们厂今年刚换了新缝纫机，工人都说踩起来省力～" class="form-textarea" />
      </view>
    </view>
    
    <view class="button-section">
      <button type="primary" class="submit-button" @click="saveFactoryProfile">保存工厂档案</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      factoryInfo: {
        name: '',
        address: '',
        category: '',
        workshopPhotos: [],
        factoryPhotos: [],
        benefits: {
          includeMeals: false,
          includeAccommodation: false,
          socialInsurance: false,
          bonus: false,
          overtimePay: false
        },
        salaryPaymentDay: '',
        promise: '',
        selfEvaluation: ''
      }
    }
  },
  onLoad() {
    this.loadFactoryProfile()
  },
  methods: {
    loadFactoryProfile() {
      // 加载本地存储的工厂档案
      const storedProfile = uni.getStorageSync('factoryProfile')
      if (storedProfile) {
        this.factoryInfo = storedProfile
      }
    },
    saveFactoryProfile() {
      if (!this.factoryInfo.name || !this.factoryInfo.address || !this.factoryInfo.category) {
        uni.showToast({
          title: '请填写完整的工厂信息',
          icon: 'none'
        })
        return false
      }
      
      // 保存到本地存储
      uni.setStorageSync('factoryProfile', this.factoryInfo)
      
      uni.showToast({
        title: '工厂档案保存成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    },

    uploadPhotos(type) {
      uni.chooseImage({
        count: 5, // 最多选择5张照片
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          const photoKey = type === 'workshop' ? 'workshopPhotos' : 'factoryPhotos'
          this.factoryInfo[photoKey] = this.factoryInfo[photoKey].concat(tempFilePaths)
          uni.showToast({
            title: '照片上传成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.log('选择照片失败', err)
          uni.showToast({
            title: '选择照片失败',
            icon: 'none'
          })
        }
      })
    },
    removePhoto(type, index) {
      const photoKey = type === 'workshop' ? 'workshopPhotos' : 'factoryPhotos'
      this.factoryInfo[photoKey].splice(index, 1)
      uni.showToast({
        title: '照片已删除',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.factory-profile-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
  text-align: center;
}

.form-tip {
  background-color: #fff7e6;
  border: 1rpx solid #ffd591;
  border-radius: 8rpx;
  padding: 15rpx;
  margin-bottom: 30rpx;
}

.tip-text {
  font-size: 22rpx;
  color: #fa8c16;
  display: block;
}

.tip-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.tip-content {
  font-size: 20rpx;
  color: #666;
  line-height: 1.5;
  display: block;
}

.highlight-tip {
  background-color: #e6f7ff;
  border: 1rpx solid #91d5ff;
  margin-bottom: 30rpx;
}

.tip-small {
  font-size: 18rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.form-item {
  margin-bottom: 30rpx;
  position: relative;
}

.form-item.required {
  display: flex;
  align-items: center;
}

.required-mark {
  color: #ff4d4f;
  font-size: 28rpx;
  margin-left: 10rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  min-height: 200rpx;
}

.button-section {
  margin-top: 30rpx;
}

.submit-button {
  width: 100%;
  height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  background-color: #4A90E2;
}

.benefit-options {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-top: 10rpx;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #333;
}

.checkbox-label text {
  margin-left: 10rpx;
}

.upload-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #666;
  margin-bottom: 20rpx;
}

.photo-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.photo-item {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.photo-img {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.remove-photo-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(255, 77, 79, 0.9);
  color: #fff;
  font-size: 24rpx;
  line-height: 40rpx;
  text-align: center;
  padding: 0;
}
</style>