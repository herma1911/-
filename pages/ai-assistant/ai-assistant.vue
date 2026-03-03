<template>
  <view class="ai-assistant-container">
    <view class="header">
      <text class="title">AI 语音助手</text>
      <button class="close-btn" @click="closeAssistant">×</button>
    </view>
    
    <!-- 对话内容 -->
    <view class="chat-content" ref="chatContent">
      <!-- 系统欢迎消息 -->
      <view class="message system-message">
        <text class="message-content">你好！我是你的工账助手，有什么可以帮你的吗？</text>
      </view>
      
      <!-- 对话消息 -->
      <view v-for="(message, index) in messages" :key="index" :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
        <text v-if="message.type === 'user'" class="message-avatar">👤</text>
        <text v-else class="message-avatar">🤖</text>
        <text class="message-content">{{ message.content }}</text>
      </view>
      
      <!-- 加载中 -->
      <view v-if="isLoading" class="message ai-message">
        <text class="message-avatar">🤖</text>
        <text class="message-content">正在思考...</text>
      </view>
    </view>
    
    <!-- 高频问题 -->
    <view class="quick-questions">
      <text class="quick-questions-title">常见问题</text>
      <view class="quick-question-list">
        <button v-for="(question, index) in quickQuestions" :key="index" class="quick-question-btn" @click="handleQuickQuestion(question)">
          {{ question }}
        </button>
      </view>
    </view>
    
    <!-- 输入区域 -->
    <view class="input-area">
      <input type="text" v-model="inputMessage" placeholder="请输入问题..." class="text-input" @keyup.enter="sendMessage" />
      <button class="voice-btn" @click="startVoiceRecognition">🎤</button>
      <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">发送</button>
    </view>
    
    <!-- 转人工反馈 -->
    <button class="feedback-btn" @click="feedbackToHuman">转人工反馈</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      inputMessage: '',
      isLoading: false,
      quickQuestions: [
        '怎么绑定班组',
        '邀请码在哪输',
        '怎么记账',
        '怎么汇总账单审批',
        '怎么看工价',
        '怎么评价工厂'
      ]
    }
  },
  onLoad() {
    // 初始化语音识别
    this.initVoiceRecognition()
  },
  methods: {
    closeAssistant() {
      uni.navigateBack()
    },
    sendMessage() {
      if (!this.inputMessage.trim()) return
      
      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: this.inputMessage
      })
      
      // 清空输入
      const message = this.inputMessage
      this.inputMessage = ''
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟 AI 回复
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
        const response = this.getAIResponse(message)
        this.messages.push({
          type: 'ai',
          content: response
        })
        this.scrollToBottom()
        this.speakResponse(response)
      }, 1000)
    },
    handleQuickQuestion(question) {
      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: question
      })
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟 AI 回复
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
        const response = this.getAIResponse(question)
        this.messages.push({
          type: 'ai',
          content: response
        })
        this.scrollToBottom()
        this.speakResponse(response)
      }, 1000)
    },
    startVoiceRecognition() {
      // 模拟语音识别
      uni.showToast({
        title: '开始语音识别...',
        icon: 'none'
      })
      
      // 模拟语音识别结果
      setTimeout(() => {
        const voiceMessage = '我要记账'
        this.inputMessage = voiceMessage
        uni.showToast({
          title: '识别结果：' + voiceMessage,
          icon: 'none'
        })
      }, 2000)
    },
    initVoiceRecognition() {
      // 初始化语音识别（实际项目中需要调用原生语音识别 API）
      console.log('初始化语音识别')
    },
    speakResponse(response) {
      // 模拟语音播报
      console.log('语音播报:', response)
      // 实际项目中需要调用原生语音合成 API
    },
    getAIResponse(message) {
      // 根据用户输入返回相应的回复
      message = message.toLowerCase()
      
      if (message.includes('绑定') && message.includes('班组')) {
        return '要绑定班组，你需要：1. 点击首页的「输入邀请码」按钮 2. 输入工厂给你的6位邀请码 3. 确认绑定信息 4. 等待班组长在24小时内确认'
      } else if (message.includes('邀请码') && message.includes('输')) {
        return '邀请码输入入口在：首页 → 点击「输入邀请码」按钮，然后输入工厂给你的6位邀请码'
      } else if (message.includes('记账')) {
        return '要记账，你可以：1. 点击首页的「简单记账」按钮 2. 选择「计件」或「计时」模式 3. 填写相关信息 4. 点击「确认提交」'
      } else if (message.includes('汇总') || message.includes('审批')) {
        return '要汇总账单审批，你可以：1. 完成记账后 2. 系统会自动生成审批记录 3. 班组长可以在「审批管理」中查看和审批'
      } else if (message.includes('工价')) {
        return '要查看工价，你需要：1. 先绑定班组 2. 绑定成功后，在记账页面选择款号时会自动显示对应工价'
      } else if (message.includes('评价') && message.includes('工厂')) {
        return '要评价工厂，你需要：1. 绑定班组并经班组长确认 2. 有至少一条记账记录 3. 该记账记录已被班组长审批通过 4. 然后在「评价工厂」页面进行评价'
      } else if (message.includes('我要记账')) {
        // 语音指令跳转
        uni.navigateTo({
          url: '/pages/worker/simple-piece-rate'
        })
        return '正在为你跳转到记账页面...'
      } else if (message.includes('我要生成邀请码')) {
        // 语音指令跳转
        uni.navigateTo({
          url: '/pages/factory/invite-code-generate'
        })
        return '正在为你跳转到邀请码生成页面...'
      } else if (message.includes('我要审批账单')) {
        // 语音指令跳转
        uni.navigateTo({
          url: '/pages/approval/approval-list'
        })
        return '正在为你跳转到审批页面...'
      } else {
        return '抱歉，我不太理解你的问题。你可以尝试问我：怎么绑定班组、邀请码在哪输、怎么记账、怎么汇总账单审批、怎么看工价、怎么评价工厂等问题。'
      }
    },
    scrollToBottom() {
      setTimeout(() => {
        const chatContent = this.$refs.chatContent
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight
        }
      }, 100)
    },
    feedbackToHuman() {
      uni.showModal({
        title: '转人工反馈',
        content: '请描述你的问题，我们会尽快处理',
        editable: true,
        placeholderText: '请输入你的问题...',
        success: (res) => {
          if (res.confirm && res.content) {
            // 提交反馈
            uni.showToast({
              title: '反馈已提交，我们会尽快处理',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.ai-assistant-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.close-btn {
  font-size: 40rpx;
  background: none;
  color: #fff;
  padding: 0;
  line-height: 1;
}

.chat-content {
  flex: 1;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  overflow-y: auto;
  margin-bottom: 20rpx;
}

.message {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
}

.system-message {
  justify-content: center;
}

.system-message .message-content {
  background-color: #f0f0f0;
  color: #666;
  padding: 15rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.user-message {
  justify-content: flex-end;
}

.user-message .message-avatar {
  order: 2;
  margin-left: 10rpx;
}

.user-message .message-content {
  order: 1;
  background-color: #4A90E2;
  color: #fff;
  padding: 15rpx 20rpx;
  border-radius: 20rpx 20rpx 5rpx 20rpx;
  font-size: 22rpx;
  max-width: 70%;
}

.ai-message .message-avatar {
  margin-right: 10rpx;
  font-size: 24rpx;
}

.ai-message .message-content {
  background-color: #f0f0f0;
  color: #333;
  padding: 15rpx 20rpx;
  border-radius: 20rpx 20rpx 20rpx 5rpx;
  font-size: 22rpx;
  max-width: 70%;
  line-height: 1.4;
}

.quick-questions {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.quick-questions-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.quick-question-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.quick-question-btn {
  padding: 10rpx 15rpx;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 20rpx;
  font-size: 20rpx;
  margin: 0;
}

.input-area {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.text-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 35rpx;
  padding: 0 20rpx;
  font-size: 22rpx;
  background-color: #fff;
}

.voice-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  color: #4A90E2;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn {
  padding: 0 30rpx;
  background-color: #4A90E2;
  color: #fff;
  border-radius: 35rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.send-btn:disabled {
  background-color: #e0e0e0;
  color: #999;
}

.feedback-btn {
  width: 100%;
  height: 70rpx;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 35rpx;
  font-size: 22rpx;
  margin-bottom: 20rpx;
}
</style>