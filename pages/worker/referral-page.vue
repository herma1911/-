<template>
  <view class="referral-page-container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">双向拉新奖励</text>
      <text class="subtitle">员工拉工厂 · 工厂拉员工</text>
    </view>
    
    <!-- 拉新统计 -->
    <view class="stats-section">
      <text class="stats-title">📊 我的拉新成果</text>
      <view class="stats-container">
        <view class="stat-item">
          <text class="stat-value">{{totalInvites}}</text>
          <text class="stat-label">总邀请数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{totalFactories}}</text>
          <text class="stat-label">邀请工厂数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{totalWorkers}}</text>
          <text class="stat-label">邀请工人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{totalDays}}</text>
          <text class="stat-label">获得置顶天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{totalPoints}}</text>
          <text class="stat-label">获得积分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{totalPermissions}}</text>
          <text class="stat-label">获得解锁权限</text>
        </view>
      </view>
    </view>
    
    <!-- 拉新类型切换 -->
    <view class="tab-section">
      <view class="tab-buttons">
        <button class="tab-btn" :class="activeTab === 'worker-to-factory' ? 'tab-active' : ''" @click="switchTab('worker-to-factory')">
          员工拉工厂
        </button>
        <button class="tab-btn" :class="activeTab === 'factory-to-worker' ? 'tab-active' : ''" @click="switchTab('factory-to-worker')">
          工厂拉员工
        </button>
      </view>
    </view>
    
    <!-- 有效拉新判定标准 -->
    <view class="criteria-section">
      <text class="criteria-title">✅ 有效拉新判定标准</text>
      <view v-if="activeTab === 'worker-to-factory'" class="criteria-content">
        <view class="criteria-item">
          <text class="criteria-number">1</text>
          <text class="criteria-text">真实服装生产/加工工厂，完成企业实名认证+营业执照资质审核</text>
        </view>
        <view class="criteria-item">
          <text class="criteria-number">2</text>
          <text class="criteria-text">此前未入驻过平台，通过专属推荐链接/二维码完成注册</text>
        </view>
        <view class="criteria-item">
          <text class="criteria-number">3</text>
          <text class="criteria-text">入驻后发布1条及以上有效招工岗位（通过平台审核）</text>
        </view>
        <view class="criteria-item">
          <text class="criteria-number">4</text>
          <text class="criteria-text">入驻后7天内，至少完成1次简历查看/面试邀约动作</text>
        </view>
      </view>
      <view v-if="activeTab === 'factory-to-worker'" class="criteria-content">
        <view class="criteria-item">
          <text class="criteria-number">1</text>
          <text class="criteria-text">真实服装行业从业者，完成平台实名认证+人脸识别</text>
        </view>
        <view class="criteria-item">
          <text class="criteria-number">2</text>
          <text class="criteria-text">此前未入驻过平台，通过工厂专属推荐链接/二维码完成注册</text>
        </view>
        <view class="criteria-item">
          <text class="criteria-number">3</text>
          <text class="criteria-text">完成个人简历完整填写（工种、经验、求职意向、期望工价等）</text>
        </view>
        <view class="criteria-item">
          <text class="criteria-number">4</text>
          <text class="criteria-text">【加分项】完成1条及以上计件记账数据录入</text>
        </view>
      </view>
    </view>
    
    <!-- 拉新奖励说明 -->
    <view class="reward-section">
      <text class="reward-title">🎉 阶梯式奖励体系</text>
      
      <!-- 员工拉工厂奖励 -->
      <view v-if="activeTab === 'worker-to-factory'">
        <view class="reward-level">
          <text class="level-title">基础拉新奖励（拉1家得1次，无上限）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">潜力用户：</text>
              <text class="reward-value">7天简历置顶 + 100平台积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">普通用户：</text>
              <text class="reward-value">7天简历置顶 + 150平台积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">优质用户：</text>
              <text class="reward-value">7天简历置顶 + 150平台积分 + 优质用户有效期延长1个月 + 50额外积分</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">月度阶梯叠加奖励1（累计推荐3家及以上）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">潜力用户：</text>
              <text class="reward-value">30天简历置顶 + 免费技能认证1次 + 300积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">普通用户：</text>
              <text class="reward-value">30天简历置顶 + 免费技能认证1次 + 400积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">优质用户：</text>
              <text class="reward-value">30天简历置顶 + 免费技能认证1次 + 400积分 + 优质工厂岗位免费内推权限3次 + 优质有效期再延2个月</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">月度阶梯叠加奖励2（累计推荐5家及以上）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">潜力用户：</text>
              <text class="reward-value">额外加赠60天简历置顶 + 平台求职保障服务1次</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">普通用户：</text>
              <text class="reward-value">额外加赠90天简历置顶 + 平台求职保障服务1次</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">优质用户：</text>
              <text class="reward-value">个人金卡会员3个月免费权益 + 简历永久高亮标识1个月</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">月度阶梯叠加奖励3（累计推荐10家及以上）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">潜力用户：</text>
              <text class="reward-value">直接破格升级为普通用户 + 终身简历基础置顶权益 + 1000积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">普通用户：</text>
              <text class="reward-value">直接破格升级为优质用户 + 个人金卡会员6个月免费权益</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">优质用户：</text>
              <text class="reward-value">个人钻石会员1年免费权益 + 官方技能认证永久标识</text>
            </view>
          </view>
        </view>
        
        <!-- 长期绑定持续奖励 -->
        <view class="reward-level">
          <text class="level-title">长期绑定持续奖励</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">推荐工厂升级为B级及以上：</text>
              <text class="reward-value">90天简历置顶 + 500积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">推荐工厂月度发布有效岗位≥10条：</text>
              <text class="reward-value">30天简历置顶 + 200积分</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">推荐工厂月度完成招工入职≥5人：</text>
              <text class="reward-value">60天简历置顶 + 300积分</text>
            </view>
          </view>
        </view>
        
        <!-- 被推荐工厂专属福利 -->
        <view class="reward-level">
          <text class="level-title">被推荐工厂专属福利</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-value">平台新手10份通用简历解锁权限 + 额外5份通用解锁权限（累计15份）</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 工厂拉员工奖励 -->
      <view v-if="activeTab === 'factory-to-worker'">
        <view class="reward-level">
          <text class="level-title">基础拉新奖励（拉1人得1次，无上限）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">C级工厂：</text>
              <text class="reward-value">3份通用简历解锁权限</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">B级工厂：</text>
              <text class="reward-value">5份通用简历解锁权限</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">A/S级工厂：</text>
              <text class="reward-value">5份通用简历解锁权限 + 1份优质用户专属解锁权限</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">基础拉新额外奖励（完成计件记账）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">C级工厂：</text>
              <text class="reward-value">额外加赠2份通用权限</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">B级工厂：</text>
              <text class="reward-value">额外加赠3份通用权限</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">A/S级工厂：</text>
              <text class="reward-value">额外加赠2份优质专属权限</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">月度阶梯叠加奖励1（累计推荐5名及以上）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">C级工厂：</text>
              <text class="reward-value">额外加赠30份通用权限 + 7天全平台岗位置顶</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">B级工厂：</text>
              <text class="reward-value">额外加赠50份通用权限 + 10天全平台岗位置顶</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">A/S级工厂：</text>
              <text class="reward-value">额外加赠10份优质专属权限 + 15天优质岗位置顶</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">月度阶梯叠加奖励2（累计推荐10名及以上）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">C级工厂：</text>
              <text class="reward-value">额外加赠80份通用权限 + 15天岗位置顶</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">B级工厂：</text>
              <text class="reward-value">额外加赠120份通用权限 + 20天岗位置顶</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">A/S级工厂：</text>
              <text class="reward-value">额外加赠20份优质专属权限 + 30天优质岗位置顶</text>
            </view>
          </view>
        </view>
        
        <view class="reward-level">
          <text class="level-title">月度阶梯叠加奖励3（累计推荐20名及以上）</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">C级工厂：</text>
              <text class="reward-value">破格升级为B级工厂 + 一次性200份通用权限</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">B级工厂：</text>
              <text class="reward-value">破格升级为A级工厂 + 一次性300份通用权限</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">A/S级工厂：</text>
              <text class="reward-value">一次性500份通用权限 + 50份优质专属权限 + 年度靠谱工厂榜优先入选资格</text>
            </view>
          </view>
        </view>
        
        <!-- 长期绑定持续奖励 -->
        <view class="reward-level">
          <text class="level-title">长期绑定持续奖励</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-label">推荐工人升级为优质用户：</text>
              <text class="reward-value">10份通用权限/人 + 2份优质专属权限/人</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">推荐工人月度累计计件记账≥20条：</text>
              <text class="reward-value">5份通用权限/人</text>
            </view>
            <view class="reward-row">
              <text class="reward-label">推荐工人通过平台投递本厂岗位并成功入职：</text>
              <text class="reward-value">20份通用权限/人</text>
            </view>
          </view>
        </view>
        
        <!-- 被推荐工人专属福利 -->
        <view class="reward-level">
          <text class="level-title">被推荐工人专属福利</text>
          <view class="reward-details">
            <view class="reward-row">
              <text class="reward-value">平台新用户3天简历置顶+30积分 + 额外3天简历置顶 + 本厂岗位优先匹配权益</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 拉新操作步骤 -->
    <view class="steps-section">
      <text class="steps-title">📋 操作步骤</text>
      <view class="steps-content">
        <view v-if="activeTab === 'worker-to-factory'" class="steps-list">
          <view class="step-item">
            <text class="step-number">1</text>
            <text class="step-text">进入「我的」-「邀请工厂」，生成个人专属推荐二维码/链接</text>
          </view>
          <view class="step-item">
            <text class="step-number">2</text>
            <text class="step-text">将二维码/链接分享给服装厂老板/负责人</text>
          </view>
          <view class="step-item">
            <text class="step-number">3</text>
            <text class="step-text">对方通过专属链接完成注册入驻</text>
          </view>
          <view class="step-item">
            <text class="step-number">4</text>
            <text class="step-text">新工厂完成有效入驻后，系统实时发放对应奖励</text>
          </view>
          <view class="step-item">
            <text class="step-number">5</text>
            <text class="step-text">在「我的-我的权益」中查看奖励明细和拉新进度</text>
          </view>
        </view>
        <view v-if="activeTab === 'factory-to-worker'" class="steps-list">
          <view class="step-item">
            <text class="step-number">1</text>
            <text class="step-text">进入「我的」-「邀请工人」，生成工厂专属推荐二维码/链接</text>
          </view>
          <view class="step-item">
            <text class="step-number">2</text>
            <text class="step-text">将二维码/链接分享给本厂在职/离职工人</text>
          </view>
          <view class="step-item">
            <text class="step-number">3</text>
            <text class="step-text">对方通过专属链接完成注册入驻</text>
          </view>
          <view class="step-item">
            <text class="step-number">4</text>
            <text class="step-text">新工人完成有效注册后，系统实时发放对应奖励</text>
          </view>
          <view class="step-item">
            <text class="step-number">5</text>
            <text class="step-text">在「我的-我的权限」中查看权限明细和拉新进度</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 通用规则 -->
    <view class="rules-section">
      <text class="rules-title">📝 通用规则</text>
      <view class="rules-content">
        <view class="rule-item">
          <text class="rule-icon">🔒</text>
          <text class="rule-text">所有拉新获得的权益有效期为90天，自到账之日起计算</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">🎁</text>
          <text class="rule-text">本规则的拉新奖励与平台现有奖励完全独立，可叠加领取</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">🚫</text>
          <text class="rule-text">严防水军刷量，严禁通过虚假注册、空壳工厂、僵尸号等方式刷取奖励</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">🔗</text>
          <text class="rule-text">1个工厂/1个工人仅能被1位用户推荐，以首次注册绑定的推荐链接为准</text>
        </view>
        <view class="rule-item">
          <text class="rule-icon">📞</text>
          <text class="rule-text">对拉新判定有异议的，可提交平台申诉，24小时内处理完毕</text>
        </view>
      </view>
    </view>
    
    <!-- 二维码区域 -->
    <view class="qrcode-section">
      <text class="qrcode-title">📱 你的专属二维码</text>
      <view class="qrcode-container">
        <image :src="qrcodeUrl" class="qrcode-image" mode="aspectFit"></image>
        <text class="qrcode-tip">扫描二维码直接下载 APP</text>
      </view>
      <text class="qrcode-description" v-if="activeTab === 'worker-to-factory'">分享此二维码给服装厂老板，他们扫码下载后自动成为你的推荐工厂</text>
      <text class="qrcode-description" v-if="activeTab === 'factory-to-worker'">分享此二维码给本厂工人，他们扫码下载后自动成为你的推荐员工</text>
    </view>
    
    <!-- 分享按钮 -->
    <view class="share-section">
      <text class="share-title">📤 分享给好友</text>
      <view class="share-buttons">
        <button class="share-btn" @click="shareToWechat">
          <text class="share-btn-icon">💬</text>
          <text class="share-btn-text">微信</text>
        </button>
        <button class="share-btn" @click="shareToWeibo">
          <text class="share-btn-icon">📱</text>
          <text class="share-btn-text">微博</text>
        </button>
        <button class="share-btn" @click="shareToMessage">
          <text class="share-btn-icon">✉️</text>
          <text class="share-btn-text">短信</text>
        </button>
      </view>
    </view>
    
    <!-- 拉新记录 -->
    <view class="referral-history-section">
      <text class="history-title">📋 拉新记录</text>
      <view class="history-list">
        <view v-if="referralHistory.length === 0" class="empty-history">
          <text class="empty-text">暂无拉新记录</text>
        </view>
        <view v-for="(item, index) in referralHistory" :key="index" class="history-item">
          <text class="history-time">{{ item.time }}</text>
          <text class="history-name">{{ item.name }}</text>
          <text class="history-type" :class="item.type === '工厂邀请' ? 'type-factory' : 'type-worker'">
            {{ item.type || '个人邀请' }}
          </text>
          <text class="history-status" :class="item.status === 'completed' ? 'status-success' : 'status-pending'">
            {{ item.status === 'completed' ? '已完成' : '待完成' }}
          </text>
          <text class="history-reward">+{{ item.reward }} {{ item.rewardType || (item.type === '工厂邀请' ? '积分' : '天置顶') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      qrcodeUrl: '',
      referralHistory: [],
      totalInvites: 0,
      totalFactories: 0,
      totalWorkers: 0,
      totalDays: 0,
      totalPoints: 0,
      totalPermissions: 0,
      activeTab: 'worker-to-factory' // worker-to-factory, factory-to-worker
    }
  },
  onLoad() {
    this.generateQRCode()
    this.loadReferralHistory()
    this.loadReferralStats()
  },
  methods: {
    // 切换拉新类型
    switchTab(tab) {
      this.activeTab = tab
      this.generateQRCode()
    },
    // 加载拉新统计数据
    loadReferralStats() {
      const referralStats = uni.getStorageSync('referralStats') || {
        totalInvites: 0,
        totalDays: 0,
        totalFactories: 0,
        totalWorkers: 0,
        totalPoints: 0,
        totalPermissions: 0,
        currentRank: 0
      }
      
      this.totalInvites = referralStats.totalInvites
      this.totalFactories = referralStats.totalFactories
      this.totalWorkers = referralStats.totalWorkers
      this.totalDays = referralStats.totalDays
      this.totalPoints = referralStats.totalPoints
      this.totalPermissions = referralStats.totalPermissions
    },
    // 生成二维码
    generateQRCode() {
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      const username = userInfo.username || 'user'
      
      // 生成分享链接，包含拉新类型
      const shareUrl = `https://yiqizhuan.com/download?inviter=${encodeURIComponent(username)}&type=${this.activeTab}`
      
      // 使用在线二维码生成服务
      // 注意：实际项目中应该使用后端生成二维码
      this.qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
      
      // 保存分享链接到本地存储
      uni.setStorageSync('userShareUrl', shareUrl)
    },
    
    // 分享到微信
    shareToWechat() {
      this.shareInvite('微信')
    },
    
    // 分享到微博
    shareToWeibo() {
      this.shareInvite('微博')
    },
    
    // 分享到短信
    shareToMessage() {
      this.shareInvite('短信')
    },
    
    // 分享邀请
    shareInvite(platform) {
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      const username = userInfo.username || '用户'
      
      // 构建分享链接
      const shareUrl = `https://yiqizhuan.com/download?inviter=${encodeURIComponent(username)}&type=${this.activeTab}`
      
      // 根据拉新类型生成不同的分享内容
      let shareContent = ''
      if (this.activeTab === 'worker-to-factory') {
        shareContent = `我正在使用衣起赚，这是一个专业的服装行业招工、记账平台。\n\n推荐你入驻成为工厂用户，享受免费简历解锁权限，快速招到靠谱工人！\n\n扫描二维码直接下载 APP，一起享受权益奖励！`
      } else {
        shareContent = `我正在使用衣起赚，这是一个专业的服装行业招工、记账平台。\n\n推荐你注册成为工人用户，享受简历置顶权益，快速找到好工作！\n\n扫描二维码直接下载 APP，一起享受权益奖励！`
      }
      
      uni.showToast({
        title: `分享到${platform}功能开发中，链接已复制`,
        icon: 'none'
      })
      
      // 复制分享链接到剪贴板
      uni.setClipboardData({
        data: shareUrl,
        success: () => {
          uni.showToast({
            title: '分享链接已复制',
            icon: 'success'
          })
        }
      })
      
      // 模拟分享成功
      setTimeout(() => {
        uni.showToast({
          title: `分享成功`,
          icon: 'success'
        })
      }, 1000)
    },
    
    // 加载拉新记录
    loadReferralHistory() {
      // 从本地存储加载拉新记录
      const history = uni.getStorageSync('referralHistory') || []
      
      if (history.length === 0) {
        // 添加示例数据
        this.referralHistory = [
          {
            time: '2026-02-20',
            name: '衣起赚服装厂',
            status: 'completed',
            reward: 80
          },
          {
            time: '2026-02-15',
            name: '时尚服饰有限公司',
            status: 'pending',
            reward: 30
          }
        ]
        // 保存示例数据到本地存储
        uni.setStorageSync('referralHistory', this.referralHistory)
      } else {
        this.referralHistory = history
      }
    }
  }
}
</script>

<style scoped>
.referral-page-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: #fff;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.9;
}

/* 标签切换区域 */
.tab-section {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-buttons {
  display: flex;
  gap: 15rpx;
}

.tab-btn {
  flex: 1;
  padding: 18rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 15rpx;
  background-color: #f9f9f9;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s ease;
}

.tab-btn:active {
  background-color: #f0f0f0;
}

.tab-active {
  background-color: #4A90E2 !important;
  color: #fff !important;
  border-color: #4A90E2 !important;
}

/* 拉新统计区域 */
.stats-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stats-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.stat-item {
  background-color: #f0f9ff;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
  border: 1rpx solid #bae7ff;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #1890ff;
  display: block;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: 18rpx;
  color: #666;
  display: block;
}

/* 有效拉新判定标准 */
.criteria-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.criteria-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.criteria-content {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.criteria-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #fff;
  border-radius: 10rpx;
  border-left: 4rpx solid #4A90E2;
}

.criteria-item:last-child {
  margin-bottom: 0;
}

.criteria-number {
  font-size: 24rpx;
  font-weight: 600;
  color: #4A90E2;
  margin-right: 15rpx;
  min-width: 30rpx;
}

.criteria-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 拉新奖励说明 */
.reward-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.reward-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.reward-level {
  margin-bottom: 25rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.reward-level:last-child {
  margin-bottom: 0;
}

.level-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.reward-details {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.reward-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 12rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.reward-label {
  font-size: 22rpx;
  font-weight: 500;
  color: #666;
  min-width: 120rpx;
  margin-right: 10rpx;
}

.reward-value {
  flex: 1;
  font-size: 22rpx;
  font-weight: 600;
  color: #4A90E2;
  line-height: 1.4;
}

/* 操作步骤 */
.steps-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.steps-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.steps-content {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 15rpx;
  background-color: #fff;
  border-radius: 10rpx;
  position: relative;
}

.step-number {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  background-color: #4A90E2;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 通用规则 */
.rules-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.rules-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.rules-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.rule-icon {
  font-size: 24rpx;
  margin-right: 15rpx;
  min-width: 30rpx;
  text-align: center;
}

.rule-text {
  flex: 1;
  font-size: 22rpx;
  color: #333;
  line-height: 1.4;
}

/* 二维码区域 */
.qrcode-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  text-align: center;
}

.qrcode-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.qrcode-container {
  margin-bottom: 15rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 15rpx;
}

.qrcode-tip {
  font-size: 20rpx;
  font-weight: 600;
  color: #4A90E2;
  margin-bottom: 10rpx;
}

.qrcode-description {
  font-size: 18rpx;
  color: #666;
  line-height: 1.4;
  text-align: center;
}

/* 分享按钮 */
.share-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.share-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.share-buttons {
  display: flex;
  justify-content: space-around;
}

.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border: none;
  border-radius: 12rpx;
  width: 120rpx;
  transition: all 0.3s ease;
}

.share-btn:active {
  background-color: #f0f0f0;
  transform: scale(0.95);
}

.share-btn-icon {
  font-size: 36rpx;
  margin-bottom: 10rpx;
}

.share-btn-text {
  font-size: 20rpx;
  color: #333;
}

/* 拉新记录 */
.referral-history-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.history-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.history-list {
  min-height: 200rpx;
}

.empty-history {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.empty-text {
  font-size: 20rpx;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-wrap: wrap;
  gap: 10rpx;
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  font-size: 18rpx;
  color: #999;
  width: 120rpx;
  flex-shrink: 0;
}

.history-name {
  flex: 1;
  font-size: 20rpx;
  color: #333;
  min-width: 150rpx;
}

.history-type {
  font-size: 16rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.type-factory {
  color: #1890ff;
  background-color: #e6f7ff;
  border: 1rpx solid #91d5ff;
}

.type-worker {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
}

.history-status {
  font-size: 18rpx;
  margin-right: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
}

.status-success {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
}

.status-pending {
  color: #fa8c16;
  background-color: #fff7e6;
  border: 1rpx solid #ffd591;
}

.history-reward {
  font-size: 20rpx;
  font-weight: 600;
  color: #4A90E2;
  flex-shrink: 0;
}
</style>