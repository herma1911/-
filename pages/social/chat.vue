<template>
  <view class="chat-container">
    <view class="chat-header">
      <text class="chat-title">{{chatTitle}}</text>
      <button class="back-button" @click="goBack">返回</button>
    </view>
    
    <view class="chat-messages">
      <view 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="['message-item', message.sender === 'me' ? 'my-message' : 'other-message']"
      >
        <view class="message-content">
          <image v-if="message.type === 'image'" :src="message.content" class="message-image" mode="aspectFit" />
          <text v-else-if="message.type === 'voice'" class="voice-message">
            <text class="voice-icon">🎤</text>
            <text class="voice-duration">{{message.duration}}''</text>
          </text>
          <text v-else class="message-text">{{message.content}}</text>
          <view class="message-footer">
            <text class="message-time">{{formatTime(message.timestamp)}}</text>
            <text v-if="message.sender === 'me'" class="message-status" :class="message.status">{{message.status === 'read' ? '已读' : '未读'}}</text>
          </view>
        </view>
      </view>
      <view v-if="messages.length === 0" class="no-messages">
        <text>暂无消息，开始聊天吧！</text>
      </view>
    </view>
    
    <!-- 快捷回复 -->
    <view v-if="showQuickReplies" class="quick-replies">
      <button 
        v-for="(reply, index) in quickReplies" 
        :key="index" 
        class="quick-reply-btn"
        @click="useQuickReply(reply)"
      >
        {{reply}}
      </button>
    </view>
    
    <view class="chat-input-area">
      <view class="input-tools">
        <button class="tool-btn" @click="toggleQuickReplies">💬</button>
        <button class="tool-btn" @click="selectImage">📷</button>
        <button class="tool-btn" @click="recordVoice">🎤</button>
      </view>
      <input 
        type="text" 
        v-model="inputMessage" 
        placeholder="输入消息..." 
        class="chat-input"
        @keyup.enter="sendMessage"
      />
      <button class="send-button" @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script>
import analytics from '../../utils/analytics.js'
import { hasUserSubmittedInterviewEvaluation, hasUserClosedInterviewEvaluation, markInterviewEvaluationClosed } from '../../utils/evaluation.js'

export default {
  data() {
    return {
      chatId: '',
      chatType: '', // 'recruitment' or 'resume'
      targetId: '',
      targetName: '',
      messages: [],
      inputMessage: '',
      showQuickReplies: false,
      quickReplies: [],
      showEvaluationPrompt: false
    }
  },
  computed: {
    chatTitle() {
      return this.targetName || '在线咨询'
    }
  },
  onLoad(options) {
    this.chatType = options.type
    this.targetId = options.id
    this.targetName = options.name || '对方'
    this.initChat()
    
    // 统计页面加载
    analytics.trackEvent('page_view', {
      pageName: 'chat',
      chatType: this.chatType,
      targetId: this.targetId
    });
  },
  onUnload() {
    // 统计聊天结束
    analytics.trackEvent('chat_end', {
      chatId: this.chatId,
      chatType: this.chatType,
      messageCount: this.messages.length
    });
  },
  methods: {
    initChat() {
      // 生成唯一的聊天ID
      this.chatId = `${this.chatType}_${this.targetId}_${uni.getStorageSync('userId') || 'user'}`
      
      // 从本地存储加载聊天记录
      const allChats = uni.getStorageSync('chatMessages') || {}
      this.messages = allChats[this.chatId] || []
      
      // 模拟从云端同步数据
      this.syncFromCloud()
      
      // 初始化快捷回复
      this.initQuickReplies()
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟实时通讯连接
      this.simulateWebSocketConnection()
    },
    syncFromCloud() {
      // 模拟从云端同步数据
      console.log('正在从云端同步聊天记录...')
      
      // 模拟网络请求延迟
      setTimeout(() => {
        // 模拟从云端获取数据
        const cloudData = this.simulateCloudData()
        if (cloudData && cloudData.length > 0) {
          // 合并本地和云端数据
          this.messages = [...new Set([...this.messages, ...cloudData])]
          // 按时间排序
          this.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          // 保存到本地
          this.saveToLocalStorage()
          console.log('聊天记录同步完成')
        }
      }, 500)
    },
    syncToCloud() {
      // 模拟同步数据到云端
      console.log('正在同步聊天记录到云端...')
      
      // 模拟网络请求
      setTimeout(() => {
        console.log('聊天记录同步到云端成功')
      }, 300)
    },
    simulateCloudData() {
      // 模拟云端数据
      return []
    },
    saveToLocalStorage() {
      const allChats = uni.getStorageSync('chatMessages') || {}
      allChats[this.chatId] = this.messages
      uni.setStorageSync('chatMessages', allChats)
    },
    initQuickReplies() {
      // 根据聊天类型设置不同的快捷回复
      if (this.chatType === 'recruitment') {
        // 工人常用语
        this.quickReplies = [
          '请问工价是多少？',
          '什么时候可以面试？',
          '工厂地址在哪里？',
          '包吃住吗？',
          '是月结吗？'
        ]
      } else {
        // 工厂常用语
        this.quickReplies = [
          '请问您有 3 年以上工作经验吗？',
          '我们工厂包吃住',
          '您什么时候可以来面试？',
          '您的技能证书齐全吗？',
          '期待您加入我们团队！'
        ]
      }
    },
    toggleQuickReplies() {
      this.showQuickReplies = !this.showQuickReplies
    },
    useQuickReply(reply) {
      this.inputMessage = reply
      this.sendMessage()
      this.showQuickReplies = false
    },
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'], // 只选择压缩图片
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          // 模拟图片压缩和CDN加速
          const cdnUrl = this.uploadToCDN(tempFilePaths[0])
          this.sendImageMessage(cdnUrl)
        }
      })
    },
    uploadToCDN(imagePath) {
      // 模拟图片上传到CDN
      console.log('正在上传图片到CDN...')
      
      // 模拟网络请求延迟
      setTimeout(() => {
        console.log('图片上传到CDN成功')
      }, 500)
      
      // 返回模拟的CDN链接
      return `https://cdn.example.com/images/${Date.now()}.jpg`
    },
    recordVoice() {
      uni.showActionSheet({
        itemList: ['录制语音', '取消'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 模拟语音录制
            uni.showToast({
              title: '开始录制语音...',
              icon: 'none'
            })
            
            // 模拟语音录制完成
            setTimeout(() => {
              const duration = Math.floor(Math.random() * 5) + 1
              this.sendVoiceMessage(duration)
            }, 2000)
          }
        }
      })
    },
    sendVoiceMessage(duration) {
      // 创建语音消息
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        type: 'voice',
        content: 'voice_message',
        duration: duration,
        timestamp: new Date().toISOString(),
        status: 'unread'
      }
      
      // 添加消息到列表
      this.messages.push(newMessage)
      
      // 保存到本地存储
      const allChats = uni.getStorageSync('chatMessages') || {}
      allChats[this.chatId] = this.messages
      uni.setStorageSync('chatMessages', allChats)
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟对方回复
      setTimeout(() => {
        const replyMessage = {
          id: Date.now(),
          sender: 'other',
          type: 'text',
          content: '收到您的语音消息，谢谢！',
          timestamp: new Date().toISOString()
        }
        
        // 添加回复到列表
        this.messages.push(replyMessage)
        
        // 保存到本地存储
        const allChats = uni.getStorageSync('chatMessages') || {}
        allChats[this.chatId] = this.messages
        uni.setStorageSync('chatMessages', allChats)
        
        // 滚动到底部
        this.scrollToBottom()
      }, 1000)
    },
    sendMessage() {
      if (!this.inputMessage.trim()) return
      
      // 统计消息发送
      analytics.trackEvent('message_sent', {
        chatId: this.chatId,
        chatType: this.chatType,
        messageType: 'text',
        messageLength: this.inputMessage.trim().length
      });
      
      // 创建新消息
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        type: 'text',
        content: this.inputMessage.trim(),
        timestamp: new Date().toISOString(),
        status: 'unread'
      }
      
      // 添加消息到列表
      this.messages.push(newMessage)
      
      // 保存到本地存储
      this.saveToLocalStorage()
      
      // 同步到云端
      this.syncToCloud()
      
      // 清空输入框
      this.inputMessage = ''
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟对方回复
      this.simulateReply()
      
      // 模拟消息已读
      setTimeout(() => {
        this.markMessageAsRead(newMessage.id)
      }, 2000)
    },
    sendImageMessage(imagePath) {
      // 创建图片消息
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        type: 'image',
        content: imagePath,
        timestamp: new Date().toISOString(),
        status: 'unread'
      }
      
      // 添加消息到列表
      this.messages.push(newMessage)
      
      // 保存到本地存储
      this.saveToLocalStorage()
      
      // 同步到云端
      this.syncToCloud()
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 模拟对方回复
      setTimeout(() => {
        const replyMessage = {
          id: Date.now(),
          sender: 'other',
          type: 'text',
          content: '收到您的图片，谢谢！',
          timestamp: new Date().toISOString()
        }
        
        // 添加回复到列表
        this.messages.push(replyMessage)
        
        // 保存到本地存储
        this.saveToLocalStorage()
        
        // 同步到云端
        this.syncToCloud()
        
        // 滚动到底部
        this.scrollToBottom()
      }, 1000)
    },
    markMessageAsRead(messageId) {
      const message = this.messages.find(msg => msg.id === messageId)
      if (message) {
        message.status = 'read'
        
        // 保存到本地存储
        this.saveToLocalStorage()
        
        // 同步到云端
        this.syncToCloud()
      }
    },
    simulateWebSocketConnection() {
      // 模拟WebSocket连接
      console.log('WebSocket连接已建立')
      
      // 模拟接收消息
      setInterval(() => {
        // 随机模拟接收消息
        if (Math.random() > 0.95) {
          const randomMessages = [
            '您好，请问您对我们的职位还有什么疑问吗？',
            '我们的工厂环境非常好，欢迎您来参观！',
            '请问您什么时候方便来面试呢？',
            '我们提供 competitive 的薪资待遇',
            '期待您加入我们的团队！'
          ]
          
          const randomReply = randomMessages[Math.floor(Math.random() * randomMessages.length)]
          
          const replyMessage = {
            id: Date.now(),
            sender: 'other',
            type: 'text',
            content: randomReply,
            timestamp: new Date().toISOString()
          }
          
          // 添加回复到列表
          this.messages.push(replyMessage)
          
          // 保存到本地存储
          const allChats = uni.getStorageSync('chatMessages') || {}
          allChats[this.chatId] = this.messages
          uni.setStorageSync('chatMessages', allChats)
          
          // 滚动到底部
          this.scrollToBottom()
        }
      }, 30000) // 每30秒可能收到一条消息
    },
    simulateReply() {
      // 模拟对方1-3秒后回复
      setTimeout(() => {
        const replies = [
          '您好，请问有什么可以帮助您的？',
          '感谢您的咨询，我们会尽快回复您的问题。',
          '请问您对这个职位还有什么疑问吗？',
          '我们的工作环境非常好，欢迎您加入我们团队！',
          '请问您什么时候可以来面试呢？',
          '您的简历很符合我们的要求，希望能进一步了解您。'
        ]
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)]
        
        const replyMessage = {
          id: Date.now(),
          sender: 'other',
          type: 'text',
          content: randomReply,
          timestamp: new Date().toISOString()
        }
        
        // 统计消息接收
        analytics.trackEvent('message_received', {
          chatId: this.chatId,
          chatType: this.chatType,
          messageType: 'text',
          messageLength: randomReply.length
        });
        
        // 统计回复率
        analytics.trackEvent('chat_reply', {
          chatId: this.chatId,
          chatType: this.chatType,
          replyTime: Date.now()
        });
        
        // 添加回复到列表
        this.messages.push(replyMessage)
        
        // 保存到本地存储
        this.saveToLocalStorage()
        
        // 同步到云端
        this.syncToCloud()
        
        // 滚动到底部
        this.scrollToBottom()
      }, Math.random() * 2000 + 1000)
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    scrollToBottom() {
      setTimeout(() => {
        uni.createSelectorQuery().select('.chat-messages').boundingClientRect((rect) => {
          if (rect) {
            uni.pageScrollTo({
              scrollTop: rect.height,
              duration: 300
            })
          }
        }).exec()
      }, 100)
    },
    goBack() {
      // 检查是否是工人咨询工厂（chatType === 'recruitment'）
      if (this.chatType === 'recruitment') {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo') || {}
        const userId = userInfo.phone || userInfo.username || Date.now().toString()
        
        // 检查是否已经提交过面试评价
        const hasSubmitted = hasUserSubmittedInterviewEvaluation(userId, this.targetId)
        
        // 检查是否已关闭面试评价弹窗（24小时内不再触发）
        const hasClosed = hasUserClosedInterviewEvaluation(this.targetId)
        
        if (!hasSubmitted && !hasClosed) {
          // 显示面试评价提示
          uni.showModal({
            title: '面试评价',
            content: '您已完成与工厂的咨询，是否对面试过程进行评价？',
            success: (res) => {
              if (res.confirm) {
                // 跳转到面试评价页面
                uni.navigateTo({
                  url: './evaluate-interview?factoryId=' + this.targetId
                })
              } else if (res.cancel) {
                // 标记用户已关闭面试评价弹窗，24小时内不再触发
                markInterviewEvaluationClosed(this.targetId)
                // 直接返回
                uni.navigateBack()
              }
            }
          })
        } else {
          // 直接返回
          uni.navigateBack()
        }
      } else {
        // 其他类型的聊天直接返回
        uni.navigateBack()
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4A90E2;
  color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
}

.chat-title {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.back-button {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  border: none;
}

.chat-messages {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  min-height: 600rpx;
  max-height: 600rpx;
  overflow-y: auto;
  margin-bottom: 20rpx;
}

.message-item {
  margin-bottom: 20rpx;
  max-width: 70%;
}

.my-message {
  align-self: flex-end;
  margin-left: auto;
}

.other-message {
  align-self: flex-start;
}

.message-content {
  padding: 15rpx;
  border-radius: 15rpx;
  word-break: break-word;
  position: relative;
}

.my-message .message-content {
  background-color: #e6f2ff;
  color: #333;
  border-bottom-right-radius: 5rpx;
}

.other-message .message-content {
  background-color: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 5rpx;
}

.message-text {
  font-size: 24rpx;
  line-height: 1.4;
  display: block;
  margin-bottom: 5rpx;
}

.message-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  margin-bottom: 5rpx;
}

.voice-message {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 15rpx;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10rpx;
  margin-bottom: 5rpx;
}

.voice-icon {
  font-size: 24rpx;
}

.voice-duration {
  font-size: 20rpx;
  color: #666;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5rpx;
}

.message-time {
  font-size: 16rpx;
  color: #999;
}

.message-status {
  font-size: 14rpx;
  margin-left: 10rpx;
}

.message-status.unread {
  color: #999;
}

.message-status.read {
  color: #4A90E2;
}

.no-messages {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

.quick-replies {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx;
  margin-bottom: 15rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.quick-reply-btn {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background-color: #f0f5ff;
  color: #4A90E2;
  border: 1rpx solid #e6f2ff;
}

.chat-input-area {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.input-tools {
  display: flex;
  gap: 10rpx;
}

.tool-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  font-size: 24rpx;
  background-color: #f0f0f0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.send-button {
  width: 120rpx;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
}
</style>