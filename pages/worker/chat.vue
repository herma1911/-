<template>
  <view class="chat-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="chat-title">{{chatName}}</text>
      <view class="header-right">
        <text class="more-icon">•••</text>
      </view>
    </view>
    
    <!-- 聊天内容区域 -->
    <view class="chat-content" ref="chatContent">
      <!-- 消息列表 -->
      <view class="message-item" 
            v-for="(message, index) in messages" 
            :key="index"
            :class="{ 'my-message': message.isMine, 'other-message': !message.isMine }"
      >
        <!-- 对方消息 -->
        <view v-if="!message.isMine" class="message-left">
          <view class="avatar">
            <text class="avatar-icon">{{chatAvatar}}</text>
          </view>
          <view class="message-bubble">
            <!-- 文本消息 -->
            <text v-if="!message.type || message.type === 'text'" class="message-text">{{message.content}}</text>
            <!-- 语音消息 -->
            <view v-else-if="message.type === 'voice'" class="voice-message">
              <text class="voice-icon">🎤</text>
              <text class="voice-text">[语音消息]</text>
            </view>
            <!-- 图片消息 -->
            <image v-else-if="message.type === 'image'" :src="message.content" class="message-image" mode="aspectFit"></image>
          </view>
        </view>
        
        <!-- 我的消息 -->
        <view v-else class="message-right">
          <view class="message-bubble">
            <!-- 文本消息 -->
            <text v-if="!message.type || message.type === 'text'" class="message-text">{{message.content}}</text>
            <!-- 语音消息 -->
            <view v-else-if="message.type === 'voice'" class="voice-message">
              <text class="voice-icon">🎤</text>
              <text class="voice-text">[语音消息]</text>
            </view>
            <!-- 图片消息 -->
            <image v-else-if="message.type === 'image'" :src="message.content" class="message-image" mode="aspectFit"></image>
          </view>
          <view class="avatar">
            <text class="avatar-icon">👤</text>
          </view>
        </view>
        
        <!-- 消息时间 -->
        <view class="message-time">{{message.time}}</view>
      </view>
      
      <!-- 系统消息 -->
      <view v-if="showSystemMessage" class="system-message">
        <text class="system-text">{{systemMessage}}</text>
      </view>
    </view>
    
    <!-- 快捷回复栏 -->
    <view class="quick-reply-bar">
      <button 
        v-for="(reply, index) in quickReplies" 
        :key="index" 
        class="quick-reply-button"
        @click="useQuickReply(reply)"
      >
        {{reply}}
      </button>
    </view>
    
    <!-- 输入区域 -->
    <view class="input-container">
      <!-- 语音按钮 -->
      <button class="voice-button" @touchstart="startVoice" @touchend="stopVoice">
        <text class="voice-icon">🎤</text>
      </button>
      
      <!-- 文字输入框 -->
      <input 
        type="text" 
        v-model="inputMessage" 
        placeholder="请输入消息..." 
        class="message-input"
        @input="onInput"
      />
      
      <!-- 图片发送按钮 -->
      <button class="image-button" @click="selectImage">
        <text class="image-icon">📷</text>
      </button>
      
      <!-- 发送按钮 -->
      <button 
        type="primary" 
        class="send-button"
        @click="sendMessage"
        :disabled="!canSend"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userId: '',
      userType: '',
      chatName: '聊天对象',
      chatAvatar: '👤',
      messages: [],
      inputMessage: '',
      showSystemMessage: false,
      systemMessage: '',
      lastSendTime: 0,
      canSend: false,
      isNewUser: false,
      isUnverified: false,
      isBlocked: false,
      quickReplies: [
        '请问工价是多少？',
        '什么时候可以面试？',
        '包吃住吗？'
      ],
      isRecording: false,
      recordingTimer: null
    }
  },
  onLoad(options) {
    this.userId = options.userId
    this.userType = options.type
    this.loadChatInfo()
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
    
    // 加载聊天对象信息
    loadChatInfo() {
      // 模拟数据
      if (this.userType === 'worker') {
        this.chatName = '张三'
        this.chatAvatar = '👨'
      } else if (this.userType === 'factory') {
        this.chatName = 'XX制衣厂'
        this.chatAvatar = '🏭'
      }
    },
    
    // 加载聊天记录
    loadMessages() {
      // 模拟聊天记录
      this.messages = [
        {
          id: 1,
          content: '你好，最近在找活吗？',
          time: '10:00',
          isMine: false
        },
        {
          id: 2,
          content: '是的，正在找平车的活',
          time: '10:01',
          isMine: true
        },
        {
          id: 3,
          content: '我们厂正在招平车工，有兴趣吗？',
          time: '10:02',
          isMine: false
        }
      ]
      
      // 滚动到底部
      this.scrollToBottom()
    },
    
    // 检查权限
    checkPermissions() {
      // 模拟权限检查
      // 新注册24小时内禁止发言
      this.isNewUser = false
      // 未完善资料/未认证禁止发言
      this.isUnverified = false
      // 被封禁用户
      this.isBlocked = false
    },
    
    // 输入监听
    onInput() {
      // 实时检查输入内容
    },
    
    // 发送消息
    sendMessage() {
      const message = this.inputMessage.trim()
      if (!message) return
      
      // 检查权限
      if (this.isBlocked) {
        this.showSystemMsg('您的账号已被封禁，无法发送消息')
        return
      }
      
      if (this.isNewUser) {
        this.showSystemMsg('新注册用户24小时内禁止发言')
        return
      }
      
      if (this.isUnverified) {
        this.showSystemMsg('请先完善资料并认证后再发言')
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
        content: filteredMessage,
        time: this.getCurrentTime(),
        isMine: true
      }
      this.messages.push(newMessage)
      
      // 清空输入框
      this.inputMessage = ''
      this.canSend = false
      
      // 更新最后发送时间
      this.lastSendTime = now
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟对方回复
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
    
    // 模拟对方回复
    simulateReply() {
      setTimeout(() => {
        const replyMessage = {
          id: Date.now() + 1,
          content: '好的，我知道了',
          time: this.getCurrentTime(),
          isMine: false
        }
        this.messages.push(replyMessage)
        this.scrollToBottom()
      }, 1000)
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
    
    // 使用快捷回复
    useQuickReply(reply) {
      this.inputMessage = reply
      this.canSend = true
      this.sendMessage()
    },
    
    // 开始录音
    startVoice() {
      this.isRecording = true
      this.showSystemMsg('按住说话...')
      // 这里可以添加实际的录音逻辑
      this.recordingTimer = setTimeout(() => {
        this.showSystemMsg('录音时间过长，请重试')
        this.isRecording = false
      }, 60000) // 60秒超时
    },
    
    // 停止录音
    stopVoice() {
      if (this.isRecording) {
        this.isRecording = false
        clearTimeout(this.recordingTimer)
        // 这里可以添加实际的录音结束逻辑
        this.showSystemMsg('语音消息已发送')
        // 模拟发送语音消息
        const voiceMessage = {
          id: Date.now(),
          content: '[语音消息]',
          time: this.getCurrentTime(),
          isMine: true,
          type: 'voice'
        }
        this.messages.push(voiceMessage)
        this.scrollToBottom()
        
        // 模拟对方回复
        this.simulateReply()
      }
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 模拟发送图片消息
          const imageMessage = {
            id: Date.now(),
            content: res.tempFilePaths[0],
            time: this.getCurrentTime(),
            isMine: true,
            type: 'image'
          }
          this.messages.push(imageMessage)
          this.scrollToBottom()
          
          // 模拟对方回复
          this.simulateReply()
        }
      })
    }
  }
}
</script>

<style scoped>
.chat-container {
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

/* 对方消息 */
.other-message .message-left {
  display: flex;
  align-items: flex-start;
}

/* 我的消息 */
.my-message .message-right {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
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
  margin: 0 10rpx;
}

.avatar-icon {
  font-size: 30rpx;
  color: #fff;
}

/* 消息气泡 */
.message-bubble {
  max-width: 70%;
  padding: 15rpx 20rpx;
  border-radius: 20rpx;
  margin-top: 5rpx;
}

.other-message .message-bubble {
  background-color: #fff;
  border-bottom-left-radius: 5rpx;
}

.my-message .message-bubble {
  background-color: #4A90E2;
  border-bottom-right-radius: 5rpx;
}

.message-text {
  font-size: 24rpx;
  line-height: 1.4;
  word-wrap: break-word;
}

.other-message .message-text {
  color: #333;
}

.my-message .message-text {
  color: #fff;
}

/* 语音消息 */
.voice-message {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.voice-icon {
  font-size: 20rpx;
}

.voice-text {
  font-size: 22rpx;
  color: inherit;
}

/* 图片消息 */
.message-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
}

.my-message .message-image {
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 消息时间 */
.message-time {
  font-size: 18rpx;
  color: #999;
  margin: 5rpx 10rpx;
  text-align: center;
}

/* 快捷回复栏 */
.quick-reply-bar {
  display: flex;
  overflow-x: auto;
  padding: 10rpx 15rpx;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  gap: 10rpx;
}

.quick-reply-button {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f0f0;
  color: #333;
  white-space: nowrap;
  border: 1rpx solid #e0e0e0;
}

/* 输入区域 */
.input-container {
  display: flex;
  align-items: center;
  padding: 15rpx;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  gap: 10rpx;
}

/* 语音按钮 */
.voice-button {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e0e0e0;
}

.voice-icon {
  font-size: 28rpx;
}

.message-input {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #333;
}

/* 图片按钮 */
.image-button {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e0e0e0;
}

.image-icon {
  font-size: 28rpx;
}

.send-button {
  width: 100rpx;
  height: 60rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  background-color: #4A90E2;
  color: #fff;
}

.send-button:disabled {
  background-color: #ccc;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .message-bubble {
    max-width: 75%;
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