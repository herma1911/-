<template>
  <view class="publish-recruitment-container">
    <view class="form-section">
      <text class="form-title">招聘</text>
      <!-- 提示信息 -->
      <view class="form-tip">
        <text class="tip-text">完善信息的工厂，工人咨询量提升60%哦～</text>
      </view>
      
      <view class="form-item required">
        <text class="form-label">职位名称</text>
        <text class="required-mark">*</text>
        <input type="text" v-model="jobTitle" placeholder="请输入招聘岗位，如：平车工/锁边工" class="form-input" />
      </view>
      <view class="form-item required">
        <text class="form-label">公司名称</text>
        <text class="required-mark">*</text>
        <input type="text" v-model="companyName" placeholder="请输入公司名称" class="form-input" />
      </view>
      <view class="form-item required">
        <text class="form-label">主营品类</text>
        <text class="required-mark">*</text>
        <view class="category-buttons">
          <button type="default" :class="['category-btn', selectedCategory === '' ? 'active' : '']" @click="selectCategory('')">全部</button>
          <button type="default" :class="['category-btn', selectedCategory === '针织' ? 'active' : '']" @click="selectCategory('针织')">针织</button>
          <button type="default" :class="['category-btn', selectedCategory === '梭织' ? 'active' : '']" @click="selectCategory('梭织')">梭织</button>
          <button type="default" :class="['category-btn', selectedCategory === '牛仔' ? 'active' : '']" @click="selectCategory('牛仔')">牛仔</button>
          <button type="default" :class="['category-btn', selectedCategory === '童装' ? 'active' : '']" @click="selectCategory('童装')">童装</button>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">公司头像</text>
        <view class="avatar-upload">
          <view v-if="avatar" class="avatar-preview">
            <image :src="avatar" mode="aspectFill" class="avatar-img" />
            <button type="default" class="remove-avatar-btn" @click="removeAvatar">×</button>
          </view>
          <button v-else type="default" class="avatar-btn" @click="uploadAvatar">上传头像</button>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">薪资范围</text>
        <input type="text" v-model="salary" placeholder="如：5000-8000元/月" class="form-input" />
      </view>
      <view class="form-item required">
        <text class="form-label">工作地点</text>
        <text class="required-mark">*</text>
        <input type="text" v-model="location" placeholder="请输入详细地址" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">工资发放日</text>
        <input type="text" v-model="salaryPaymentDay" placeholder="如：每月15号" class="form-input" />
        <text class="tip-small">填写后招工帖会显示"准时发薪"标签</text>
      </view>
      <view class="form-item">
        <text class="form-label">工作经验</text>
        <view class="experience-selector">
          <picker v-model="experienceLevel" :range="experienceOptions" :range-key="'label'" class="form-picker">
            <view class="picker-display">{{ getExperienceLabel(experienceLevel) }}</view>
          </picker>
        </view>
        <text class="tip-small">选择经验等级，自动生成更易接受的招聘文案，吸引更多合适工人</text>
      </view>
      <view class="form-item">
        <text class="form-label">职位描述</text>
        <textarea v-model="description" placeholder="请输入职位描述" class="form-textarea" />
      </view>
      <view class="form-item">
        <text class="form-label">联系方式</text>
        <input type="text" v-model="contact" placeholder="请输入联系方式" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">类型</text>
        <view class="type-buttons">
          <button type="default" :class="['type-btn', selectedType === '' ? 'active' : '']" @click="selectType('')">全部</button>
          <button type="default" :class="['type-btn', selectedType === '针织' ? 'active' : '']" @click="selectType('针织')">针织</button>
          <button type="default" :class="['type-btn', selectedType === '梭织' ? 'active' : '']" @click="selectType('梭织')">梭织</button>
        </view>
      </view>
      <!-- 工序配置模块 -->
      <view class="form-item required">
        <!-- 模块前置引导 -->
        <view class="process-guide">
          <text class="guide-text">【精准招工提醒】填写的工序越详细，越能精准匹配对口熟练工人，大幅减少无效咨询！</text>
        </view>
        
        <text class="form-label">岗位工序</text>
        <text class="required-mark">*</text>
        
        <!-- 系统词库勾选 -->
        <view class="process-categories">
          <view v-for="category in processCategories" :key="category" class="process-category">
            <view class="category-header" @click="toggleCategory(category)">
              <text class="category-title">{{category}}</text>
              <text class="expand-icon">{{ expandedCategories[category] ? '▼' : '▶' }}</text>
            </view>
            <view v-if="expandedCategories[category]" class="process-tags">
              <button type="default" 
                      v-for="process in getProcessByCategory(category)" 
                      :key="process"
                      :class="['process-tag', selectedProcesses.includes(process) ? 'active' : '']"
                      @click="toggleProcess(process)">
                {{process}}
              </button>
            </view>
          </view>
        </view>
        
        <!-- 自定义新增输入 -->
        <view class="custom-process-section">
          <view class="custom-input-container">
            <input type="text" 
                   v-model="customProcessInput" 
                   placeholder="当地特殊叫法/细分工序，例：冚车、埋夹、打枣" 
                   class="custom-process-input" />
            <button type="default" class="add-process-btn" @click="addCustomProcess">添加</button>
          </view>
        </view>
        
        <!-- 已选工序展示 -->
        <view v-if="selectedProcesses.length > 0" class="selected-processes">
          <text class="selected-label">已选工序（{{selectedProcesses.length}}/20）：</text>
          <view class="selected-tags">
            <view v-for="process in selectedProcesses" :key="process" class="selected-tag">
              <text class="tag-text">{{process}}</text>
              <text class="tag-remove" @click="removeProcess(process)">×</text>
            </view>
          </view>
        </view>
        
        <!-- 工序补充说明 -->
        <view class="process-description-section">
          <text class="description-label">工序细节说明（选填）：</text>
          <textarea v-model="processDescription" 
                    placeholder="工序细节说明，例：平车做针织上衣整件，需3年以上熟练工" 
                    class="form-textarea" />
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">款式照片</text>
        <button type="default" class="upload-btn" @click="uploadPhoto">上传照片</button>
        <!-- 照片预览 -->
        <view v-if="photos.length > 0" class="photo-preview">
          <view v-for="(photo, index) in photos" :key="index" class="photo-item">
            <image :src="photo" mode="aspectFill" class="photo-img" />
            <button type="default" class="remove-photo-btn" @click="removePhoto(index)">×</button>
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">福利承诺</text>
        <view class="benefit-options">
          <label class="checkbox-label">
            <checkbox :checked="benefits.includeMeals" @change="benefits.includeMeals = !benefits.includeMeals" />
            <text>包吃</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="benefits.includeAccommodation" @change="benefits.includeAccommodation = !benefits.includeAccommodation" />
            <text>包住</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="benefits.socialInsurance" @change="benefits.socialInsurance = !benefits.socialInsurance" />
            <text>五险一金</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="benefits.bonus" @change="benefits.bonus = !benefits.bonus" />
            <text>年终奖</text>
          </label>
          <label class="checkbox-label">
            <checkbox :checked="benefits.overtimePay" @change="benefits.overtimePay = !benefits.overtimePay" />
            <text>加班费</text>
          </label>
        </view>
        <text class="tip-small">填写后系统会自动推荐给关注相应福利的工人</text>
      </view>
    </view>
    
    <!-- 安全提示 -->
    <view class="safety-tips">
      <text class="safety-tip-item">请确保发布的信息真实有效，不得发布虚假、诈骗、违法信息！</text>
      <text class="safety-tip-item">严禁发布要求押金、保证金等不合理条款的信息！</text>
    </view>
    
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitRecruitment">发布</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
  </view>
</template>

<script>
import { initWordLibrary, getProcessCategories, getProcessByCategory, addToCandidatePool, recordJobAssociation } from '../../utils/process-word-library.js'

export default {
  data() {
    return {
      jobTitle: '',
      companyName: '',
      selectedCategory: '',
      salary: '',
      location: '',
      salaryPaymentDay: '',
      experience: '',
      experienceLevel: 0,
      experienceOptions: [
        { value: 0, label: '无要求' },
        { value: 1, label: '1年以内' },
        { value: 2, label: '1-2年' },
        { value: 3, label: '2年以上' }
      ],
      description: '',
      contact: '',
      selectedType: '',
      selectedSkills: [],
      photos: [],
      benefits: {
        includeMeals: false,
        includeAccommodation: false,
        socialInsurance: false,
        bonus: false,
        overtimePay: false
      },
      avatar: '',
      // 工序相关
      processCategories: [],
      selectedProcessCategory: '',
      selectedProcesses: [],
      customProcessInput: '',
      processDescription: '',
      expandedCategories: {}
    }
  },
  onLoad() {
    this.loadDefaultLocation()
    this.initProcessWordLibrary()
  },
  methods: {
    // 获取经验等级对应的显示标签
    getExperienceLabel(level) {
      const option = this.experienceOptions.find(opt => opt.value === level)
      return option ? option.label : '请选择'
    },
    
    // 获取经验等级对应的口语化文案
    getExperienceText(level) {
      const experienceMap = {
        0: '不限经验，想学即可',
        1: '有经验即可，熟手优先',
        2: '1年以上经验，熟手优先',
        3: '2年以上相关经验，技术稳定优先'
      }
      return experienceMap[level] || '不限经验，想学即可'
    },
    
    // 初始化工序词库
    initProcessWordLibrary() {
      initWordLibrary()
      this.processCategories = getProcessCategories()
    },
    loadDefaultLocation() {
      // 尝试获取用户当前位置
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          // 这里可以根据经纬度获取具体地址，现在使用模拟数据
          this.location = '广州市番禺区'
        },
        fail: (err) => {
          console.log('获取位置失败', err)
          // 如果获取位置失败，使用默认地址
          this.location = '广州市'
        }
      })
    },
    uploadAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像上传成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.log('选择头像失败', err)
          uni.showToast({
            title: '选择头像失败',
            icon: 'none'
          })
        }
      })
    },
    removeAvatar() {
      this.avatar = ''
      uni.showToast({
        title: '头像已删除',
        icon: 'success'
      })
    },
    submitRecruitment() {
      if (!this.jobTitle || !this.companyName || !this.selectedCategory || !this.location) {
        uni.showToast({
          title: '请填写必填信息：职位名称、公司名称、主营品类、工作地点',
          icon: 'none'
        })
        return
      }
      
      // 验证工序必填
      if (this.selectedProcesses.length === 0) {
        uni.showToast({
          title: '请至少添加一个工序',
          icon: 'none'
        })
        return
      }
      
      // 获取用户认证状态
      const userInfo = uni.getStorageSync('userInfo')
      let verificationType = ''
      if (userInfo.isEnterprise) {
        verificationType = 'enterprise'
      } else if (userInfo.isPersonalVerified) {
        verificationType = 'personal'
      }
      
      // 将经验等级转换为口语化文案
      const experienceText = this.getExperienceText(this.experienceLevel)
      
      const recruitmentData = {
        id: Date.now(),
        title: this.jobTitle,
        company: this.companyName,
        category: this.selectedCategory,
        salary: this.salary,
        location: this.location,
        salaryPaymentDay: this.salaryPaymentDay,
        experience: experienceText,
        experienceLevel: this.experienceLevel,
        description: this.description,
        contact: this.contact,
        publishDate: new Date().toISOString().split('T')[0],
        applicantCount: 0,
        type: this.selectedType,
        skills: this.selectedProcesses, // 使用工序配置替代技能选择
        photos: this.photos,
        benefits: this.benefits,
        avatar: this.avatar,
        verificationType: verificationType,
        processDescription: this.processDescription // 工序补充说明
      }
      
      // 保存到本地存储
      let recruitments = uni.getStorageSync('recruitments') || []
      recruitments.push(recruitmentData)
      uni.setStorageSync('recruitments', recruitments)
      console.log('招聘信息已保存到本地存储，数量：', recruitments.length)
      
      // 记录工序与岗位的关联关系
      if (recruitmentData.skills && recruitmentData.skills.length > 0) {
        recordJobAssociation(recruitmentData.id, recruitmentData.skills)
      }
      
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        // 检查用户是否已认证
        const isAuthenticated = userInfo.isEnterprise || userInfo.isPersonalVerified
        if (!isAuthenticated) {
          // 发布完成后提醒认证
          uni.showModal({
            title: '提升可信度',
            content: '完成认证后，您的招聘信息会显示认证标识，提高求职者的信任度，获得更多申请。',
            confirmText: '去认证',
            cancelText: '暂不认证',
            success: (res) => {
              if (res.confirm) {
                // 显示认证方式选择
                uni.showActionSheet({
                  itemList: ['企业认证', '个人实名认证'],
                  success: (actionRes) => {
                    if (actionRes.tapIndex === 0) {
                      // 企业认证
                      uni.showToast({
                        title: '企业认证功能开发中',
                        icon: 'none'
                      })
                    } else if (actionRes.tapIndex === 1) {
                      // 个人实名认证
                      uni.showToast({
                        title: '个人实名认证功能开发中',
                        icon: 'none'
                      })
                    }
                  }
                })
              }
              // 无论是否认证，都返回上一页
              uni.navigateBack()
            }
          })
        } else {
          // 已认证用户直接返回
          uni.navigateBack()
        }
      }, 1000)
    },
    uploadPhoto() {
      uni.chooseImage({
        count: 5, // 最多选择5张照片
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          this.photos = this.photos.concat(tempFilePaths)
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
    removePhoto(index) {
      this.photos.splice(index, 1)
      uni.showToast({
        title: '照片已删除',
        icon: 'success'
      })
    },
    cancel() {
      uni.navigateBack()
    },
    selectType(type) {
      this.selectedType = type
    },
    toggleSkill(skill) {
      const index = this.selectedSkills.indexOf(skill)
      if (index === -1) {
        this.selectedSkills.push(skill)
      } else {
        this.selectedSkills.splice(index, 1)
      }
    },
    clearSkills() {
      this.selectedSkills = []
    },
    selectCategory(category) {
      this.selectedCategory = category
    },
    
    // 切换工序分类展开状态
    toggleCategory(category) {
      this.$set(this.expandedCategories, category, !this.expandedCategories[category])
    },
    
    // 切换工序选择状态
    toggleProcess(process) {
      if (this.selectedProcesses.length >= 20 && !this.selectedProcesses.includes(process)) {
        uni.showToast({
          title: '最多只能添加20个工序',
          icon: 'none'
        })
        return
      }
      
      const index = this.selectedProcesses.indexOf(process)
      if (index > -1) {
        this.selectedProcesses.splice(index, 1)
      } else {
        this.selectedProcesses.push(process)
      }
    },
    
    // 添加自定义工序
    addCustomProcess() {
      const process = this.customProcessInput.trim()
      if (!process) {
        uni.showToast({
          title: '请输入工序名称',
          icon: 'none'
        })
        return
      }
      
      // 验证工序名称
      if (process.length > 10) {
        uni.showToast({
          title: '工序名称不能超过10个字',
          icon: 'none'
        })
        return
      }
      
      if (/^\d+$/.test(process)) {
        uni.showToast({
          title: '工序名称不能为纯数字',
          icon: 'none'
        })
        return
      }
      
      if (/^[^a-zA-Z0-9\u4e00-\u9fa5]+$/.test(process)) {
        uni.showToast({
          title: '工序名称不能为纯符号',
          icon: 'none'
        })
        return
      }
      
      if (this.selectedProcesses.length >= 20) {
        uni.showToast({
          title: '最多只能添加20个工序',
          icon: 'none'
        })
        return
      }
      
      if (this.selectedProcesses.includes(process)) {
        uni.showToast({
          title: '该工序已添加',
          icon: 'none'
        })
        return
      }
      
      // 添加到已选工序
      this.selectedProcesses.push(process)
      
      // 自动进入候选池
      addToCandidatePool(process)
      
      // 清空输入框
      this.customProcessInput = ''
      
      uni.showToast({
        title: '工序添加成功',
        icon: 'success'
      })
    },
    
    // 移除工序
    removeProcess(process) {
      const index = this.selectedProcesses.indexOf(process)
      if (index > -1) {
        this.selectedProcesses.splice(index, 1)
      }
    }
  }
}
</script>

<style scoped>
.publish-recruitment-container {
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

.tip-small {
  font-size: 18rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.category-buttons {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  margin-top: 10rpx;
}

.category-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.category-btn.active {
  background-color: #4A90E2;
  color: #fff;
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

/* 经验选择器样式 */
.experience-selector {
  margin-bottom: 10rpx;
}

.form-picker {
  width: 100%;
}

.picker-display {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  color: #333;
}

.button-section {
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
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

.type-buttons {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.type-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.type-btn.active {
  background-color: #4A90E2;
  color: #fff;
}

.skill-buttons {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.skill-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #666;
}

.skill-btn.active {
  background-color: #4A90E2;
  color: #fff;
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

.avatar-upload {
  margin-top: 10rpx;
}

.avatar-btn {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 2rpx dashed #ddd;
  font-size: 24rpx;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.remove-avatar-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: rgba(255, 77, 79, 0.9);
  color: #fff;
  font-size: 28rpx;
  line-height: 50rpx;
  text-align: center;
  padding: 0;
}

/* 工序配置模块样式 */
.process-guide {
  background-color: #e3f2fd;
  border: 2rpx solid #2196F3;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.guide-text {
  font-size: 24rpx;
  color: #2196F3;
  line-height: 1.4;
}

.process-categories {
  margin: 20rpx 0;
}

.process-category {
  margin-bottom: 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  cursor: pointer;
}

.category-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.expand-icon {
  font-size: 24rpx;
  color: #999;
}

.process-tags {
  padding: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  background-color: #fff;
}

.process-tag {
  padding: 12rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  color: #666;
  font-size: 24rpx;
}

.process-tag.active {
  background-color: #2196F3;
  color: #fff;
  border-color: #2196F3;
}

.custom-process-section {
  margin: 30rpx 0;
}

.custom-input-container {
  display: flex;
  gap: 16rpx;
}

.custom-process-input {
  flex: 1;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.add-process-btn {
  padding: 0 30rpx;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  white-space: nowrap;
}

.selected-processes {
  margin: 30rpx 0;
}

.selected-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.selected-tag {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #e3f2fd;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #2196F3;
}

.tag-remove {
  margin-left: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
}

.process-description-section {
  margin-top: 30rpx;
}

.description-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

/* 安全提示样式 */
.safety-tips {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff1f0;
  border: 1rpx solid #ffccc7;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
}

.safety-tip-item {
  display: block;
  font-size: 22rpx;
  color: #cf1322;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.safety-tip-item:last-child {
  margin-bottom: 0;
}
</style>