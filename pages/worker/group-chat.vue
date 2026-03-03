<template>
  <view class="group-chat-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="chat-title">{{groupName}}</text>
      <view class="header-right">
        <text class="more-icon" @click="showGroupInfo">•••</text>
      </view>
    </view>
    
    <!-- 群聊内容区域 -->
    <view class="chat-content" ref="chatContent">
      <!-- 系统消息 -->
      <view v-if="showSystemMessage" class="system-message">
        <text class="system-text">{{systemMessage}}</text>
      </view>
      
      <!-- 消息列表 -->
      <view class="message-item" 
            v-for="(message, index) in messages" 
            :key="index"
      >
        <!-- 群消息 -->
        <view class="message-row">
          <view class="avatar">
            <text class="avatar-icon">{{message.avatar}}</text>
          </view>
          <view class="message-info">
            <text class="sender-name">{{message.sender}}</text>
            <view class="message-bubble">
              <text class="message-text">{{message.content}}</text>
            </view>
          </view>
        </view>
        
        <!-- 消息时间 -->
        <view class="message-time">{{message.time}}</view>
      </view>
      
      <!-- 权限提示 -->
      <view v-if="!canSpeak" class="permission-tip">
        <text class="tip-text">
          {{groupType === 'factory' ? '未入职该工厂，只能查看消息' : '未认证，只能查看消息'}}
        </text>
      </view>
    </view>
    
    <!-- 输入区域 -->
    <view class="input-container" :class="{ 'disabled': !canSpeak }">
      <input 
        type="text" 
        v-model="inputMessage" 
        placeholder="请输入消息..." 
        class="message-input"
        :disabled="!canSpeak"
      />
      <button 
        type="primary" 
        class="send-button"
        @click="sendMessage"
        :disabled="!canSend || !canSpeak"
      >
        发送
      </button>
    </view>
    
    <!-- 群信息弹窗 -->
    <view v-if="showGroupInfoModal" class="modal-overlay" @click="closeGroupInfo">
      <view class="group-info-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">群信息</text>
          <text class="close-icon" @click="closeGroupInfo">×</text>
        </view>
        <view class="modal-content">
          <view class="group-avatar-large">
            <text class="avatar-icon">{{groupAvatar}}</text>
          </view>
          <text class="group-name-large">{{groupName}}</text>
          <text class="group-desc">{{groupDesc}}</text>
          <view class="group-stats">
            <text class="stat-item">成员: {{memberCount}}人</text>
            <text class="stat-item">类型: {{groupType === 'factory' ? '工厂内部群' : '地方交流群'}}</text>
          </view>
          <view class="permission-info">
            <text class="permission-text">
              {{canSpeak ? '您可以在群内发言' : '您只能查看群消息'}}
            </text>
          </view>
          <button 
            v-if="isAdmin" 
            type="default" 
            class="admin-button"
            @click="manageGroup"
          >
            群管理
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      groupId: '',
      groupType: '', // factory 或 local
      groupName: '群聊',
      groupAvatar: '👥',
      groupDesc: '',
      messages: [],
      inputMessage: '',
      showSystemMessage: false,
      systemMessage: '',
      lastSendTime: 0,
      canSend: false,
      canSpeak: true,
      isAdmin: false,
      memberCount: 0,
      showGroupInfoModal: false
    }
  },
  onLoad(options) {
    this.groupId = options.groupId
    this.groupType = options.type
    this.loadGroupInfo()
    this.loadMessages()
    this.checkPermissions()
  },
  watch: {
    inputMessage: function(newVal) {
      this.canSend = newVal.trim().length > 0
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载群信息
    loadGroupInfo() {
      // 模拟数据
      if (this.groupType === 'factory') {
        this.groupName = 'XX制衣厂内部群'
        this.groupAvatar = '🏢'
        this.groupDesc = '本群仅用于工厂内部沟通，非本厂人员请勿加入'
        this.memberCount = 25
      } else if (this.groupType === 'local') {
        this.groupName = '新塘工人交流群'
        this.groupAvatar = '📍'
        this.groupDesc = '新塘地区工人交流群，欢迎大家交流找活信息'
        this.memberCount = 156
      }
    },
    
    // 加载聊天记录
    loadMessages() {
      // 模拟聊天记录
      this.messages = [
        {
          id: 1,
          sender: '厂长',
          avatar: '🏢',
          content: '欢迎大家加入群聊，请注意遵守群规',
          time: '09:00',
          isSystem: true
        },
        {
          id: 2,
          sender: '张三',
          avatar: '👨',
          content: '大家好！',
          time: '09:05',
          isSystem: false
        },
        {
          id: 3,
          sender: '李四',
          avatar: '👩',
          content: '请问今天几点开工？',
          time: '09:10',
          isSystem: false
        },
        {
          id: 4,
          sender: '厂长',
          avatar: '🏢',
          content: '今天正常8点开工',
          time: '09:15',
          isSystem: false
        }
      ]
      
      // 滚动到底部
      this.scrollToBottom()
    },
    
    // 检查权限
    checkPermissions() {
      // 模拟权限检查
      if (this.groupType === 'factory') {
        // 工厂内部群：仅已入职工人可发言
        const isEmployed = true // 模拟已入职
        this.canSpeak = isEmployed
        this.isAdmin = false // 模拟非厂长
        
        if (!isEmployed) {
          this.showSystemMsg('您未入职该工厂，只能查看群消息')
        }
      } else if (this.groupType === 'local') {
        // 地方交流群：认证工人可发言
        const isVerified = true // 模拟已认证
        this.canSpeak = isVerified
        this.isAdmin = false // 模拟非厂长
        
        if (!isVerified) {
          this.showSystemMsg('请先完成认证后再发言')
        }
      }
    },
    
    // 发送消息
    sendMessage() {
      const message = this.inputMessage.trim()
      if (!message) return
      
      // 检查权限
      if (!this.canSpeak) {
        this.showSystemMsg('您没有发言权限')
        return
      }
      
      // 检查发送频率（10秒1条）
      const now = new Date().getTime()
      if (now - this.lastSendTime < 10000) {
        this.showSystemMsg('发送消息过于频繁，请稍后再试')
        return
      }
      
      // 过滤消息内容
      const filteredMessage = this.filterMessage(message)
      if (!filteredMessage) {
        this.showSystemMsg('禁止发送联系方式及广告，平台内沟通更安全')
        this.inputMessage = ''
        this.canSend = false
        return
      }
      
      // 添加消息到列表
      const newMessage = {
        id: Date.now(),
        sender: '我',
        avatar: '👤',
        content: filteredMessage,
        time: this.getCurrentTime(),
        isSystem: false
      }
      this.messages.push(newMessage)
      
      // 清空输入框
      this.inputMessage = ''
      this.canSend = false
      
      // 更新最后发送时间
      this.lastSendTime = now
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟其他成员回复
      this.simulateReply()
    },
    
    // 过滤消息内容
    filterMessage(content) {
      // 禁止的内容关键词
      const forbiddenKeywords = [
        '微信', 'wx', 'wechat',
        'QQ', 'qq',
        '电话', '手机', '139', '138', '137', '136', '135', '134', '159', '158', '157', '150', '151', '152', '153', '155', '156', '186', '187', '188', '189',
        '二维码', '链接', '网址', 'http', 'https',
        '群号', '加群',
        '招工', '招聘', '招人',
        '广告', '推广', '营销',
        '辱骂', '傻逼', '混蛋', '垃圾'
      ]
      
      // 检查关键词
      for (const keyword of forbiddenKeywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          return false
        }
      }
      
      return content
    },
    
    // 显示系统消息
    showSystemMsg(msg) {
      this.systemMessage = msg
      this.showSystemMessage = true
      
      // 3秒后隐藏
      setTimeout(() => {
        this.showSystemMessage = false
      }, 3000)
    },
    
    // 模拟回复
    simulateReply() {
      if (Math.random() > 0.5) {
        setTimeout(() => {
          const replyMessage = {
            id: Date.now() + 1,
            sender: this.groupType === 'factory' ? '李四' : '王五',
            avatar: this.groupType === 'factory' ? '👩' : '👨',
            content: '好的，我知道了',
            time: this.getCurrentTime(),
            isSystem: false
          }
          this.messages.push(replyMessage)
          this.scrollToBottom()
        }, 2000)
      }
    },
    
    // 获取当前时间
    getCurrentTime() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    // 滚动到底部
    scrollToBottom() {
      setTimeout(() => {
        const chatContent = this.$refs.chatContent
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight
        }
      }, 100)
    },
    
    // 显示群信息
    showGroupInfo() {
      this.showGroupInfoModal = true
    },
    
    // 关闭群信息
    closeGroupInfo() {
      this.showGroupInfoModal = false
    },
    
    // 群管理
    manageGroup() {
      // 这里可以跳转到群管理页面
      this.showSystemMsg('群管理功能开发中')
    }
  }
}
</script>

<style scoped>
.group-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.back-button {
  width: 60rpx;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.chat-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: center;
}

.header-right {
  width: 60rpx;
  text-align: right;
}

.more-icon {
  font-size: 28rpx;
  color: #333;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 系统消息 */
.system-message {
  margin: 10rpx 0;
  text-align: center;
}

.system-text {
  background-color: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

/* 消息项 */
.message-item {
  margin: 15rpx 0;
  display: flex;
  flex-direction: column;
}

/* 消息行 */
.message-row {
  display: flex;
  align-items: flex-start;
}

/* 头像 */
.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15rpx;
}

.avatar-icon {
  font-size: 30rpx;
  color: #fff;
}

/* 消息信息 */
.message-info {
  flex: 1;
}

/* 发送者姓名 */
.sender-name {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 5rpx;
  display: block;
}

/* 消息气泡 */
.message-bubble {
  max-width: 80%;
  padding: 15rpx 20rpx;
  border-radius: 20rpx;
  background-color: #fff;
  border-bottom-left-radius: 5rpx;
}

.message-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
}

/* 消息时间 */
.message-time {
  font-size: 18rpx;
  color: #999;
  margin: 5rpx 10rpx;
  text-align: center;
}

/* 权限提示 */
.permission-tip {
  margin: 20rpx 0;
  padding: 15rpx;
  background-color: #fff2e8;
  border-radius: 10rpx;
  text-align: center;
}

.tip-text {
  font-size: 22rpx;
  color: #fa8c16;
}

/* 输入区域 */
.input-container {
  display: flex;
  align-items: center;
  padding: 15rpx;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.input-container.disabled {
  background-color: #f5f5f5;
}

.message-input {
  flex: 1;
  height: 80rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #333;
}

.message-input:disabled {
  background-color: #e8e8e8;
  color: #999;
}

.send-button {
  width: 120rpx;
  height: 60rpx;
  margin-left: 15rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  background-color: #4A90E2;
  color: #fff;
}

.send-button:disabled {
  background-color: #ccc;
}

/* 群信息弹窗 */
.modal-overlay {
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

.group-info-modal {
  background-color: #fff;
  border-radius: 20rpx;
  width: 80%;
  max-width: 500rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.close-icon {
  font-size: 36rpx;
  color: #999;
}

.modal-content {
  padding: 30rpx;
  text-align: center;
}

.group-avatar-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20rpx;
}

.group-avatar-large .avatar-icon {
  font-size: 60rpx;
}

.group-name-large {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.group-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.group-stats {
  margin-bottom: 20rpx;
}

.stat-item {
  font-size: 22rpx;
  color: #999;
  margin: 0 10rpx;
}

.permission-info {
  margin-bottom: 30rpx;
}

.permission-text {
  font-size: 24rpx;
  color: #4A90E2;
}

.admin-button {
  width: 100%;
  height: 70rpx;
  border-radius: 35rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #333;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .message-bubble {
    max-width: 85%;
  }
  
  .message-text {
    font-size: 22rpx;
  }
  
  .avatar {
    width: 50rpx;
    height: 50rpx;
  }
  
  .avatar-icon {
    font-size: 25rpx;
  }
}
</style>