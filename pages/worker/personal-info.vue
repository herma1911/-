<template>
  <view class="personal-info-container">
    <view class="header">
      <text class="title">个人信息</text>
      <button class="back-button" @click="goBack">返回</button>
    </view>
    
    <view class="info-section">
      <!-- 头像修改 -->
      <view class="avatar-section">
        <text class="section-title">头像</text>
        <view class="avatar-container">
          <view class="avatar" @click="chooseAvatar">
            <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill"></image>
            <text v-else class="avatar-placeholder">👤</text>
          </view>
          <text class="avatar-hint">点击修改头像</text>
        </view>
      </view>
      
      <!-- 昵称修改 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input type="text" v-model="userInfo.nickname" placeholder="请输入昵称" class="form-input" />
      </view>
      
      <!-- 姓名 -->
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input type="text" v-model="userInfo.name" placeholder="请输入姓名" class="form-input" />
      </view>
      
      <!-- 手机号码 -->
      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input type="text" v-model="userInfo.phone" placeholder="请输入手机号码" class="form-input" />
      </view>
      
      <!-- 微信 -->
      <view class="form-item">
        <text class="form-label">微信</text>
        <input type="text" v-model="userInfo.wechat" placeholder="请输入微信" class="form-input" />
      </view>
      
      <!-- 所在城市 -->
      <view class="form-item">
        <text class="form-label">所在城市</text>
        <input type="text" v-model="userInfo.city" placeholder="请输入所在城市" class="form-input" />
      </view>
      
      <!-- 从业年限 -->
      <view class="form-item">
        <text class="form-label">从业年限</text>
        <input type="number" v-model.number="userInfo.workYears" placeholder="请输入从业年限" class="form-input" />
      </view>
      
      <!-- 期望工价 -->
      <view class="form-item">
        <text class="form-label">期望工价</text>
        <input type="number" v-model.number="userInfo.expectedWage" placeholder="请输入期望工价" class="form-input" />
      </view>
      

      
      <!-- 我的技能工序 -->
      <view class="form-item">
        <text class="form-label">我的技能工序</text>
        <text class="skill-hint">选择你擅长的工序，系统会优先推荐匹配的岗位</text>
        
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
          <text class="selected-label">已选技能（{{selectedProcesses.length}}/20）：</text>
          <view class="selected-tags">
            <view v-for="process in selectedProcesses" :key="process" class="selected-tag">
              <text class="tag-text">{{process}}</text>
              <text class="tag-remove" @click="removeProcess(process)">×</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 拉老乡点赞 -->
    <view class="like-section">
      <view class="like-info">
        <text class="like-count">{{ likeCount }}</text>
        <text class="like-text">位老乡认可</text>
      </view>
      <button class="like-btn" @click="inviteLikes">
        <text class="like-icon">👍</text>
        <text class="like-btn-text">拉老乡点赞</text>
      </button>
    </view>
    
    <view class="action-buttons">
      <button class="save-button" @click="savePersonalInfo">保存信息</button>
    </view>
  </view>
</template>

<script>
import { initWordLibrary, getProcessCategories, getProcessByCategory, addToCandidatePool } from '../../utils/process-word-library.js'

export default {
  data() {
    return {
      userInfo: {
        avatar: '',
        nickname: '',
        name: '',
        phone: '',
        wechat: '',
        city: '',
        workYears: 0,
        expectedWage: 0
      },
      likeCount: 0,
      // 工序相关
      processCategories: [],
      selectedProcesses: [],
      customProcessInput: '',
      expandedCategories: {}
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.initProcessWordLibrary()
  },
  methods: {
    // 初始化工序词库
    initProcessWordLibrary() {
      initWordLibrary()
      this.processCategories = getProcessCategories()
      // 加载已保存的技能工序
      const savedSkills = uni.getStorageSync('workerSkills')
      if (savedSkills) {
        this.selectedProcesses = savedSkills
      } else {
        // 设置默认技能工序示例
        this.selectedProcesses = ['平车', '平车开袋', '平车上拉链']
        // 保存到本地存储
        uni.setStorageSync('workerSkills', this.selectedProcesses)
      }
    },
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      const skillProfile = uni.getStorageSync('skillProfile') || {}
      
      this.userInfo = {
        avatar: userInfo.avatar || userInfo.wechatInfo?.avatar || '',
        nickname: userInfo.nickname || userInfo.wechatInfo?.nickname || '',
        name: skillProfile.name || userInfo.name || '',
        phone: userInfo.phone || userInfo.username || '',
        wechat: skillProfile.wechat || userInfo.wechat || '',
        city: skillProfile.city || userInfo.city || '',
        workYears: Number(skillProfile.workYears || userInfo.workYears || 0),
        expectedWage: Number(skillProfile.expectedWage || userInfo.expectedWage || 0)
      }
      
      // 加载点赞数
      this.likeCount = uni.getStorageSync('likeCount') || 0
    },
    inviteLikes() {
      // 生成分享链接
      const shareUrl = 'https://yiqizhuan.com/like/' + Math.random().toString(36).substr(2, 9)
      
      uni.showActionSheet({
        itemList: ['分享到微信', '复制分享链接'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '已选择分享到微信',
              icon: 'none'
            })
          } else if (res.tapIndex === 1) {
            uni.setClipboardData({
              data: shareUrl,
              success: () => {
                uni.showToast({
                  title: '链接已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像已选择',
            icon: 'success'
          })
        }
      })
    },
    savePersonalInfo() {
      // 保存到userInfo
      const currentUserInfo = uni.getStorageSync('userInfo') || {}
      const updatedUserInfo = {
        ...currentUserInfo,
        avatar: this.userInfo.avatar,
        nickname: this.userInfo.nickname,
        name: this.userInfo.name,
        phone: this.userInfo.phone,
        wechat: this.userInfo.wechat,
        city: this.userInfo.city,
        workYears: this.userInfo.workYears,
        expectedWage: this.userInfo.expectedWage
      }
      uni.setStorageSync('userInfo', updatedUserInfo)
      
      // 保存到skillProfile
      const currentSkillProfile = uni.getStorageSync('skillProfile') || {}
      const updatedSkillProfile = {
        ...currentSkillProfile,
        name: this.userInfo.name,
        wechat: this.userInfo.wechat,
        city: this.userInfo.city,
        workYears: this.userInfo.workYears,
        expectedWage: this.userInfo.expectedWage
      }
      uni.setStorageSync('skillProfile', updatedSkillProfile)
      
      // 保存技能工序
      uni.setStorageSync('workerSkills', this.selectedProcesses)
      
      uni.showToast({
        title: '信息保存成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        this.goBack()
      }, 1000)
    },
    goBack() {
      uni.navigateBack()
    },
    
    // 切换工序分类展开状态
    toggleCategory(category) {
      this.$set(this.expandedCategories, category, !this.expandedCategories[category])
    },
    
    // 切换工序选择状态
    toggleProcess(process) {
      if (this.selectedProcesses.length >= 20 && !this.selectedProcesses.includes(process)) {
        uni.showToast({
          title: '最多只能添加20个技能工序',
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
          title: '最多只能添加20个技能工序',
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
        title: '技能工序添加成功',
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
.personal-info-container {
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

.info-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.avatar-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  background-color: #e8f0fe;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15rpx;
  overflow: hidden;
  border: 2rpx solid #4A90E2;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 70rpx;
  color: #4A90E2;
}

.avatar-hint {
  font-size: 22rpx;
  color: #666;
}

.form-item {
  margin-bottom: 25rpx;
}

.form-label {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.save-button {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #4A90E2;
  color: #fff;
}

/* 拉老乡点赞样式 */
.like-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.like-info {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.like-count {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B35;
}

.like-text {
  font-size: 24rpx;
  color: #666;
}

.like-btn {
  background-color: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.like-icon {
  font-size: 28rpx;
}

/* 技能工序样式 */
.skill-hint {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
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
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.expand-icon {
  font-size: 20rpx;
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
  padding: 10rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  color: #666;
  font-size: 22rpx;
}

.process-tag.active {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
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
  padding: 16rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.add-process-btn {
  padding: 0 30rpx;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

.selected-processes {
  margin: 30rpx 0;
}

.selected-label {
  font-size: 24rpx;
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
  padding: 10rpx 16rpx;
  background-color: #e3f2fd;
  border-radius: 30rpx;
  font-size: 22rpx;
  color: #4A90E2;
}

.tag-remove {
  margin-left: 12rpx;
  font-size: 24rpx;
  font-weight: bold;
  cursor: pointer;
}


</style>