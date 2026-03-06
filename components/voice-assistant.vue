<template>
  <view class="voice-assistant-container">
    <!-- 首页悬浮麦克风按钮 -->
    <view 
      v-if="showFloatingButton" 
      class="floating-button"
      :style="{ bottom: floatingButtonPosition.bottom + 'px', right: floatingButtonPosition.right + 'px' }"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="stopDrag"
      @click="openVoicePanel"
    >
      <view class="microphone-icon">
        <text class="icon">🎤</text>
      </view>
    </view>
    
    <!-- 语音录入面板 -->
    <view v-if="showVoicePanel" class="voice-panel-overlay" @click="closeVoicePanel">
      <view class="voice-panel" @click.stop>
        <!-- 面板头部 -->
        <view class="panel-header">
          <text class="panel-title">语音助手</text>
          <text class="close-button" @click="closeVoicePanel">✕</text>
        </view>
        
        <!-- 录音状态 -->
        <view class="recording-status" v-if="isRecording">
          <text class="status-text">正在听你说话...</text>
          <view class="wave-animation">
            <view class="wave-bar" v-for="n in 5" :key="n" :style="{ animationDelay: n * 0.1 + 's' }"></view>
          </view>
        </view>
        
        <!-- 识别结果 -->
        <view class="recognition-result" v-if="recognitionResult">
          <text class="result-text">{{ recognitionResult }}</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button 
            class="action-button primary" 
            @click="toggleRecording"
            :disabled="isProcessing"
          >
            {{ isRecording ? '正在录音·点击结束' : '开始录音' }}
          </button>
          <button class="action-button secondary" @click="closeVoicePanel">
            取消
          </button>
        </view>
        
        <!-- 多轮对话 -->
        <view class="multi-turn-dialog" v-if="multiTurnDialog.isActive">
          <text class="dialog-question">请问您要招什么{{ multiTurnDialog.steps[multiTurnDialog.currentStep].label }}？</text>
          <view class="dialog-options">
            <view 
              v-for="(option, index) in multiTurnDialog.steps[multiTurnDialog.currentStep].options" 
              :key="index"
              class="option-item"
              @click="selectOption(option)"
            >
              <text class="option-text">{{ option }}</text>
            </view>
          </view>
        </view>
        
        <!-- 你可以这样说 -->
        <view class="quick-commands" v-if="!isRecording && !recognitionResult && !multiTurnDialog.isActive">
          <text class="commands-title">你可以这样说</text>
          <view class="commands-list">
            <!-- 个人版普通工人示例 -->
            <template v-if="userRole === 'worker'">
              <view class="command-item">
                <text class="command-text">012款开口袋500件</text>
              </view>
              <view class="command-item">
                <text class="command-text">今天013款上拉链300件</text>
              </view>
              <view class="command-item">
                <text class="command-text">昨天合大身400件</text>
              </view>
              <view class="command-item">
                <text class="command-text">今天晚饭花了15元</text>
              </view>
              <view class="command-item">
                <text class="command-text">给小孩交学费8000元</text>
              </view>
              <view class="command-item">
                <text class="command-text">我想找平车开口袋的工作</text>
              </view>
            </template>
            
            <!-- 班组长/带班工头示例 -->
            <template v-else-if="userRole === 'team_leader'">
              <view class="command-item">
                <text class="command-text">本组今天012款成品2000件</text>
              </view>
              <view class="command-item">
                <text class="command-text">一组今天开口袋工序产量1500件</text>
              </view>
              <view class="command-item">
                <text class="command-text">二组今天013款成品800件，次品20件</text>
              </view>
              <view class="command-item">
                <text class="command-text">张三012款成品400件，李四012款成品500件</text>
              </view>
              <view class="command-item">
                <text class="command-text">本组今天总产量多少</text>
              </view>
              <view class="command-item">
                <text class="command-text">我缺个平车开口袋的工人</text>
              </view>
            </template>
            
            <!-- 工厂老板/管理员示例 -->
            <template v-else-if="userRole === 'factory_owner'">
              <view class="command-item">
                <text class="command-text">招3个平车熟手，开口袋工序，计件5毛一件</text>
              </view>
              <view class="command-item">
                <text class="command-text">这个星期发布的岗位一共有多少人报名</text>
              </view>
              <view class="command-item">
                <text class="command-text">这个月全厂计件总数是多少</text>
              </view>
              <view class="command-item">
                <text class="command-text">工厂采购布料花了2万元，记工厂账本</text>
              </view>
            </template>
            
            <!-- 默认示例 -->
            <template v-else>
              <view class="command-item">
                <text class="command-text">012款开口袋500件</text>
              </view>
              <view class="command-item">
                <text class="command-text">今天晚饭花了15元</text>
              </view>
              <view class="command-item">
                <text class="command-text">给小孩交学费8000元</text>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 确认弹窗 -->
    <view v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <view class="confirm-modal" @click.stop>
        <text class="modal-title">确认操作</text>
        <view v-if="actionType === 'piece_rate'" class="piece-rate-confirm">
          <text class="confirm-label">已为你识别计件信息：</text>
          <view class="confirm-item">
            <text class="confirm-key">款号：</text>
            <text class="confirm-value">{{ actionData.process.match(/(\d+款)/) ? actionData.process.match(/(\d+款)/)[0] : '012款' }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-key">工序：</text>
            <text class="confirm-value">{{ actionData.process.replace(/(\d+款)/, '') }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-key">数量：</text>
            <text class="confirm-value">{{ actionData.quantity }}件</text>
          </view>
          <view v-if="!boundCompany" class="category-hint-voice">
            <text class="hint-text-voice">可选：补充细分品类，帮你更准记工价</text>
            <view class="add-category-btn" @tap="showCategorySelection">
              <text class="add-icon">+</text>
            </view>
          </view>
          <view v-if="standardPriceHint" class="standard-price-hint-voice">
            {{ standardPriceHint }}
          </view>
          <text class="confirm-question">请问是否确认保存？</text>
        </view>
        <text v-else class="modal-content">{{ confirmMessage }}</text>
        <view class="modal-buttons">
          <button class="modal-button secondary" @click="closeConfirmModal">取消</button>
          <button class="modal-button primary" @click="confirmAction">确认保存</button>
        </view>
      </view>
    </view>
    
    <!-- 细分品类选择面板 -->
    <view v-if="showCategoryPanel" class="category-panel-overlay" @tap="hideCategoryPanel">
      <view class="category-panel" @tap.stop>
        <view class="category-panel-header">
          <button class="category-panel-close" @tap="hideCategoryPanel">取消</button>
        </view>
        <view class="category-panel-content">
          <view v-for="group in garmentCategories" :key="group.category" class="category-group">
            <text class="category-group-title">{{ group.category }}</text>
            <view class="category-items">
              <view 
                v-for="item in group.items" 
                :key="item.id"
                class="category-item"
                @tap="selectCategoryItem(item)"
              >
                <text class="category-item-icon">{{ item.icon }}</text>
                <text class="category-item-name">{{ item.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import VoiceAssistant from '../utils/voice-assistant.js'

export default {
  data() {
    return {
      showFloatingButton: true,
      showVoicePanel: false,
      isRecording: false,
      isProcessing: false,
      recognitionResult: '',
      confirmMessage: '',
      showConfirmModal: false,
      actionData: null,
      actionType: '',
      floatingButtonPosition: {
        bottom: 100,
        right: 20
      },
      isDragging: false,
      startPosition: {
        x: 0,
        y: 0
      },
      // 权限状态
      hasRecruitmentPermission: false,
      userRole: 'worker',
      // 绑定状态
      boundCompany: null,
      // 细分品类相关
      showCategoryHint: false,
      showCategoryPanel: false,
      selectedCategory: '',
      garmentCategories: [
        {
          category: '针织上衣',
          items: [
            { id: 'knit_t_shirt', name: '圆领T恤', icon: '👕' },
            { id: 'knit_polo', name: ' Polo衫', icon: '👔' },
            { id: 'knit_sweater', name: '毛衣', icon: '🧥' },
            { id: 'knit_hoodie', name: '连帽卫衣', icon: '🧢' }
          ]
        },
        {
          category: '针织下装',
          items: [
            { id: 'knit_pants', name: '针织裤', icon: '👖' },
            { id: 'knit_shorts', name: '针织短裤', icon: '🩳' },
            { id: 'knit_skirt', name: '针织裙', icon: '👗' }
          ]
        },
        {
          category: '梭织上衣',
          items: [
            { id: 'woven_shirt', name: '衬衫', icon: '👔' },
            { id: 'woven_jacket', name: '夹克', icon: '🧥' },
            { id: 'woven_coat', name: '外套', icon: '🧥' }
          ]
        },
        {
          category: '梭织下装',
          items: [
            { id: 'woven_pants', name: '西裤', icon: '👖' },
            { id: 'woven_shorts', name: '梭织短裤', icon: '🩳' }
          ]
        },
        {
          category: '裙装',
          items: [
            { id: 'dress_casual', name: '休闲裙', icon: '👗' },
            { id: 'dress_formal', name: '正装裙', icon: '👗' }
          ]
        },
        {
          category: '通用',
          items: [
            { id: 'other_garment', name: '其他服装', icon: '👕' },
            { id: 'accessory', name: '配饰', icon: '👜' }
          ]
        }
      ],
      // 标准工价提示
      standardPriceHint: '',
      // 多轮对话状态
      multiTurnDialog: {
        isActive: false,
        currentStep: 0,
        steps: [
          { key: 'process', label: '工序', options: ['车工', '平车', '锁边', '冚车', '开口袋', '缝制', '裁剪'] },
          { key: 'machine', label: '机种', options: ['平车', '锁边机', '冚车', '裁剪机'] },
          { key: 'count', label: '招聘人数', options: ['1人', '2人', '3人', '5人以上'] },
          { key: 'wageType', label: '工价结算方式', options: ['计件', '计时', '日结'] },
          { key: 'duration', label: '工期', options: ['长期', '短期', '临时'] }
        ],
        collectedData: {}
      },
      // 录音状态
      recordingTimer: null,
      noResponseTimer: null
    }
  },
  mounted() {
    // 初始化语音助手
    VoiceAssistant.initRecognition()
    
    // 从本地存储加载按钮位置
    const savedPosition = uni.getStorageSync('voiceButtonPosition')
    if (savedPosition) {
      this.floatingButtonPosition = savedPosition
    }
    
    // 检查权限
    this.checkPermissions()
    
    // 加载绑定状态
    const storedBoundCompany = uni.getStorageSync('boundCompany')
    this.boundCompany = storedBoundCompany && Object.keys(storedBoundCompany).length > 0 ? storedBoundCompany : null
  },
  methods: {
    // 检查权限
    checkPermissions() {
      // 模拟权限检查，实际项目中应该调用权限接口
      this.userRole = uni.getStorageSync('userRole') || 'worker'
      this.hasRecruitmentPermission = this.userRole === 'team_leader' || this.userRole === 'factory_owner'
    },
    // 打开语音面板
    openVoicePanel() {
      this.showVoicePanel = true
      this.recognitionResult = ''
    },
    
    // 关闭语音面板
    closeVoicePanel() {
      if (this.isRecording) {
        this.stopRecording()
      }
      this.showVoicePanel = false
      this.recognitionResult = ''
    },
    
    // 切换录音状态
    async toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        await this.startRecording()
      }
    },
    
    // 开始录音
    async startRecording() {
      try {
        this.isRecording = true
        this.isProcessing = false
        this.recognitionResult = ''
        
        const success = await VoiceAssistant.startRecording()
        if (!success) {
          uni.showToast({
            title: '录音权限被拒绝，请在设置中开启',
            icon: 'none'
          })
          this.isRecording = false
          return
        }
        
        // 根据用户角色获取欢迎引导提示词
        const greetingText = this.getGreetingText()
        // 语音播报
        await VoiceAssistant.synthesizeSpeech(greetingText)
        // 显示引导文字
        this.recognitionResult = greetingText
        
        // 无响应兜底引导
        this.noResponseTimer = setTimeout(() => {
          const reminderText = '我在听哦，你可以直接说要记的计件、支出，有任何需求都可以直接告诉我~'
          VoiceAssistant.synthesizeSpeech(reminderText)
          this.recognitionResult = reminderText
        }, 5000)
        
        // 10秒没说话自动关闭
        this.recordingTimer = setTimeout(() => {
          this.stopRecording()
          const endText = '没听到你说话哦，有需要再点击开始录音吧'
          VoiceAssistant.synthesizeSpeech(endText)
          uni.showToast({
            title: endText,
            icon: 'none'
          })
          this.recognitionResult = ''
        }, 10000)
      } catch (error) {
        console.error('开始录音失败:', error)
        uni.showToast({
          title: '录音失败，请重试',
          icon: 'none'
        })
        this.isRecording = false
      }
    },
    
    // 根据用户角色获取欢迎引导提示词
    getGreetingText() {
      const userRole = uni.getStorageSync('userRole') || 'worker'
      
      switch (userRole) {
        case 'worker':
          return '你好，我是衣起赚语音助手，你可以直接说要记的计件、支出，或者找工作的需求'
        case 'team_leader':
          return '你好，我是衣起赚语音助手，你可以录本组产量、查成品数量、招工人、对班组账目'
        case 'factory_owner':
          return '你好，我是衣起赚语音助手，你可以发招聘、查报名、看工厂计件汇总、记对账'
        default:
          return '你好，我是衣起赚语音助手，你可以直接说要记的计件、支出，或者找工作的需求'
      }
    },
    
    // 停止录音
    stopRecording() {
      // 清除定时器
      if (this.noResponseTimer) {
        clearTimeout(this.noResponseTimer)
        this.noResponseTimer = null
      }
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer)
        this.recordingTimer = null
      }
      
      this.isRecording = false
      this.isProcessing = true
      VoiceAssistant.stopRecording()
      
      // 模拟处理结果
      setTimeout(() => {
        this.isProcessing = false
        // 模拟识别结果
        this.recognitionResult = '012款开口袋500件'
        // 实际项目中，这里会通过回调获取识别结果
        this.processCommand(this.recognitionResult)
      }, 1000)
    },
    
    // 使用快捷指令
    useQuickCommand(command) {
      this.recognitionResult = command
      this.processCommand(command)
    },
    
    // 处理命令
    async processCommand(text) {
      try {
        this.isProcessing = true
        const result = await VoiceAssistant.processCommand(text)
        this.isProcessing = false
        
        // 语音合成反馈
        await VoiceAssistant.synthesizeSpeech(result.message)
        
        if (result.type === 'error') {
          // 容错处理：识别模糊时提供选项
          if (result.message.includes('没有理解')) {
            this.showOptionsModal(text)
          } else {
            uni.showToast({
              title: result.message,
              icon: 'none'
            })
          }
        } else {
          // 二次确认
          this.showConfirmModal = true
          this.confirmMessage = result.message
          this.actionData = result.data
          this.actionType = result.type
        }
      } catch (error) {
        console.error('处理命令失败:', error)
        uni.showToast({
          title: '处理命令失败，请重试',
          icon: 'none'
        })
        this.isProcessing = false
      }
    },
    
    // 显示选项弹窗
    showOptionsModal(text) {
      uni.showActionSheet({
        itemList: ['记计件', '记支出', '招聘', '查询'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.startRecognition('记计件')
              break
            case 1:
              this.startRecognition('记支出')
              break
            case 2:
              this.startRecruitmentDialog()
              break
            case 3:
              this.startRecognition('查询')
              break
          }
        }
      })
    },
    
    // 开始定向识别
    startRecognition(type) {
      uni.showToast({
        title: `请说${type}相关内容`,
        icon: 'none'
      })
      this.openVoicePanel()
    },
    
    // 确认操作
    async confirmAction() {
      this.showConfirmModal = false
      
      // 根据操作类型和用户角色获取成功提示词
      let successText
      if (this.actionType === 'piece_rate') {
        if (this.userRole === 'team_leader') {
          successText = '保存成功啦，已经帮你记好本组今天的产量记录'
        } else {
          successText = '保存成功啦，已经帮你记好这笔计件'
        }
      } else if (this.actionType === 'expense') {
        successText = '保存成功啦，已经帮你记好这笔支出'
      } else if (this.actionType === 'recruitment') {
        successText = '发布成功啦，岗位已经上架到找工作板块，有工人报名我会及时提醒你'
      } else {
        successText = '操作成功'
      }
      
      // 语音播报操作成功
      await VoiceAssistant.synthesizeSpeech(successText)
      
      // 根据操作类型执行不同的逻辑
      switch (this.actionType) {
        case 'piece_rate':
          this.savePieceRate()
          break
        case 'expense':
          this.saveExpense()
          break
        case 'recruitment':
          this.publishRecruitment()
          break
        default:
          break
      }
      
      uni.showToast({
        title: successText,
        icon: 'success'
      })
      
      // 关闭面板
      this.closeVoicePanel()
    },
    
    // 关闭确认弹窗
    closeConfirmModal() {
      this.showConfirmModal = false
    },
    
    // 保存记计件
    savePieceRate() {
      // 调用现有的记计件保存接口
      console.log('保存记计件:', this.actionData)
    },
    
    // 保存记支出
    saveExpense() {
      // 调用现有的记支出保存接口
      console.log('保存记支出:', this.actionData)
    },
    
    // 发布招聘
    publishRecruitment() {
      // 调用现有的招聘发布接口
      console.log('发布招聘:', this.actionData)
    },
    
    // 开始招聘多轮对话
    startRecruitmentDialog() {
      this.multiTurnDialog.isActive = true
      this.multiTurnDialog.currentStep = 0
      this.multiTurnDialog.collectedData = {}
    },
    
    // 选择选项
    selectOption(option) {
      const currentStep = this.multiTurnDialog.currentStep
      const stepKey = this.multiTurnDialog.steps[currentStep].key
      
      // 处理选项值
      let value = option
      if (stepKey === 'count') {
        // 提取人数
        value = option === '5人以上' ? 5 : parseInt(option)
      }
      
      this.multiTurnDialog.collectedData[stepKey] = value
      
      // 进入下一步或完成
      if (currentStep < this.multiTurnDialog.steps.length - 1) {
        this.multiTurnDialog.currentStep++
      } else {
        this.completeRecruitmentDialog()
      }
    },
    
    // 完成招聘对话
    completeRecruitmentDialog() {
      this.multiTurnDialog.isActive = false
      
      // 生成招聘命令
      const data = this.multiTurnDialog.collectedData
      const command = `招${data.count}个${data.process}，用${data.machine}，${data.wageType}，${data.duration}`
      
      // 处理招聘命令
      this.processCommand(command)
    },
    
    // 开始拖动
    startDrag(e) {
      this.isDragging = true
      this.startPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    },
    
    // 拖动中
    onDrag(e) {
      if (!this.isDragging) return
      
      const deltaX = e.touches[0].clientX - this.startPosition.x
      const deltaY = e.touches[0].clientY - this.startPosition.y
      
      // 更新按钮位置
      this.floatingButtonPosition.right = Math.max(20, Math.min(window.innerWidth - 80, this.floatingButtonPosition.right - deltaX))
      this.floatingButtonPosition.bottom = Math.max(20, Math.min(window.innerHeight - 80, this.floatingButtonPosition.bottom - deltaY))
      
      // 更新起始位置
      this.startPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    },
    
    // 停止拖动
    stopDrag() {
      this.isDragging = false
      // 保存按钮位置到本地存储
      uni.setStorageSync('voiceButtonPosition', this.floatingButtonPosition)
    },
    
    // 显示细分品类选择
    showCategorySelection() {
      this.showCategoryPanel = true
    },
    
    // 隐藏细分品类选择面板
    hideCategoryPanel() {
      this.showCategoryPanel = false
    },
    
    // 选择细分品类
    selectCategoryItem(item) {
      this.selectedCategory = item.name
      this.showCategoryPanel = false
      // 关联IE库，显示标准工价提示
      this.calculateStandardPrice()
    },
    
    // 计算标准工价
    calculateStandardPrice() {
      // 模拟IE库数据
      const standardProcesses = {
        '圆领T恤': {
          '开口袋': { standardTime: 120, difficultyCoefficient: 1.1 },
          '上领': { standardTime: 90, difficultyCoefficient: 1.2 },
          '车缝': { standardTime: 60, difficultyCoefficient: 1.0 }
        },
        '衬衫': {
          '开口袋': { standardTime: 150, difficultyCoefficient: 1.3 },
          '上领': { standardTime: 120, difficultyCoefficient: 1.4 },
          '车缝': { standardTime: 80, difficultyCoefficient: 1.1 }
        }
      }
      
      const categoryProcesses = standardProcesses[this.selectedCategory]
      if (categoryProcesses) {
        // 模糊匹配工序
        let matchedProcess = null
        const processName = this.actionData.process.replace(/(\d+款)/, '')
        for (const processNameKey in categoryProcesses) {
          if (processName.includes(processNameKey)) {
            matchedProcess = categoryProcesses[processNameKey]
            break
          }
        }
        
        if (matchedProcess) {
          const standardTime = matchedProcess.standardTime
          const difficultyCoefficient = matchedProcess.difficultyCoefficient
          const basePrice = (standardTime / 3600) * 18 * difficultyCoefficient
          this.standardPriceHint = `已匹配标准工价：${basePrice.toFixed(2)}元/件`
        }
      }
    }
  }
}
</script>

<style scoped>
/* 悬浮按钮 */
.floating-button {
  position: fixed;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90E2 0%, #5C6BC0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.4);
  z-index: 999;
  touch-action: none;
  transition: all 0.3s ease;
}

.floating-button:active {
  transform: scale(0.95);
}

.microphone-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 32rpx;
}

/* 语音面板 */
.voice-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.voice-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 面板头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.panel-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-button {
  font-size: 36rpx;
  color: #666;
  padding: 10rpx;
}

/* 录音状态 */
.recording-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.status-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 30rpx;
}

.wave-animation {
  display: flex;
  align-items: center;
  gap: 10rpx;
  height: 100rpx;
}

.wave-bar {
  width: 10rpx;
  background: #4A90E2;
  border-radius: 5rpx;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    height: 20rpx;
  }
  50% {
    height: 80rpx;
  }
}

/* 识别结果 */
.recognition-result {
  background: #f5f5f5;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.result-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-button {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: linear-gradient(135deg, #4A90E2 0%, #5C6BC0 100%);
  color: #fff;
  border: none;
}

.action-button.secondary {
  background: #f5f5f5;
  color: #333;
  border: 2rpx solid #e0e0e0;
}

.action-button:disabled {
  opacity: 0.6;
}

/* 多轮对话 */
.multi-turn-dialog {
  margin-top: 30rpx;
}

.dialog-question {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
  font-weight: 500;
}

.dialog-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.option-item {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 25rpx;
  text-align: center;
  transition: all 0.3s ease;
  border: 2rpx solid #e0e0e0;
}

.option-item:active {
  background: #e0e0e0;
  transform: scale(0.98);
}

.option-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 你可以这样说 */
.quick-commands {
  margin-top: 30rpx;
}

.commands-title {
  font-size: 28rpx; /* 14号字体 */
  color: #999; /* 灰色 */
  margin-bottom: 20rpx;
  font-weight: normal;
}

.commands-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.command-item {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  /* 无点击态 */
}

.command-text {
  font-size: 32rpx; /* 16号字体 */
  color: #333;
  line-height: 1.4;
  font-weight: 500;
}

/* 确认弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-modal {
  background: #fff;
  border-radius: 20rpx;
  width: 85%;
  max-width: 550rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.modal-content {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

/* 计件确认样式 */
.piece-rate-confirm {
  margin-bottom: 40rpx;
}

.confirm-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  text-align: center;
}

.confirm-item {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 15rpx;
  text-align: center;
}

.confirm-key {
  font-weight: normal;
  color: #666;
}

.confirm-value {
  font-weight: bold;
  color: #333;
}

.confirm-question {
  font-size: 28rpx;
  color: #333;
  margin-top: 30rpx;
  display: block;
  text-align: center;
  font-weight: 500;
}

/* 语音助手细分品类提示 */
.category-hint-voice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 15rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.hint-text-voice {
  font-size: 28rpx; /* 14号字体 */
  color: #999;
  flex: 1;
}

.add-category-btn {
  width: 48rpx; /* 直径≥24dp */
  height: 48rpx;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15rpx;
}

.add-icon {
  font-size: 32rpx;
  color: #666;
}

/* 标准工价提示 */
.standard-price-hint-voice {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-top: 15rpx;
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
}

.modal-button {
  flex: 1;
  height: 100rpx; /* 高度≥50dp */
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.modal-button.primary {
  background: linear-gradient(135deg, #4A90E2 0%, #5C6BC0 100%);
  color: #fff;
  border: none;
}

.modal-button.secondary {
  background: #f5f5f5;
  color: #333;
  border: 2rpx solid #e0e0e0;
}

/* 细分品类选择面板 */
.category-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1200;
}

.category-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

.category-panel-header {
  margin-bottom: 30rpx;
}

.category-panel-close {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #666;
  font-weight: normal;
}

.category-panel-content {
  max-height: 60vh;
  overflow-y: auto;
}

.category-group {
  margin-bottom: 30rpx;
}

.category-group-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  padding-left: 10rpx;
}

.category-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.category-item {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 30rpx;
  text-align: center;
  min-height: 160rpx; /* 单张卡片尺寸≥160*80dp */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.category-item:active {
  background: #e0e0e0;
  transform: scale(0.98);
}

.category-item-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.category-item-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>