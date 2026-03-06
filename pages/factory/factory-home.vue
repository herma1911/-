<template>
  <view class="factory-home-container">
    <!-- 顶部固定导航栏 -->
    <view class="top-nav">
      <view class="nav-left">
        <text class="page-title">工厂首页</text>
      </view>
      <view class="nav-right">
        <view class="nav-item" @click="navigateTo('/pages/worker/messages')">
          <text class="nav-icon">💬</text>
          <view v-if="unreadMessages > 0" class="badge">{{unreadMessages}}</view>
        </view>
        <view class="nav-item" @click="showVoiceAssistant">
          <text class="nav-icon">🎤</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/worker/feedback')">
          <text class="nav-icon">?</text>
        </view>
        <text v-if="isFactoryOwner" class="add-module-btn">+</text>
      </view>
    </view>
    
    <!-- 紧急待办置顶提醒区 -->
    <view v-if="hasPendingTasks" class="urgent-todo-section">
      <view class="todo-slider">
        <view class="todo-item" v-for="(todo, index) in urgentTodos" :key="index">
          <view class="todo-content">
            <text class="todo-title">{{todo.title}}</text>
            <text class="todo-count">{{todo.count}}条</text>
          </view>
          <view class="todo-action" @click="handleTodoAction(todo.type)">
            <text class="action-text">立即处理</text>
          </view>
        </view>
      </view>
    </view>
    

    
    <!-- 核心经营数据看板 -->
    <view class="core-data-dashboard">
      <view class="dashboard-grid">
        <view class="dashboard-card" @click="navigateTo('/pages/factory/onboarding-process')">
          <text class="dashboard-value">{{effectiveOnboardingCount}}</text>
          <text class="dashboard-label">本月闭环发薪</text>
          <text class="dashboard-desc">有效闭环发薪数</text>
          <text class="dashboard-trend positive">
            +{{onboardingTrend}}% 环比
          </text>
        </view>
        <view :class="['dashboard-card', pendingReconciliation > 0 ? 'warning' : '']" @click="navigateTo('/pages/factory/reconciliation-management')">
          <text class="dashboard-value">{{pendingReconciliation}}</text>
          <text class="dashboard-label">待处理对账</text>
          <text v-if="pendingReconciliation > 0" class="dashboard-desc action">点击立即处理</text>
        </view>
        <view class="dashboard-card" @click="navigateTo('/pages/factory/job-management')">
          <text class="dashboard-value">{{totalApplications}}</text>
          <text class="dashboard-label">岗位累计投递</text>
          <text class="dashboard-desc">本月新增{{monthlyNewApplications}}</text>
        </view>
        <view class="dashboard-card" @click="navigateTo('/pages/factory/my-level')">
          <text class="dashboard-value">{{factoryScore}}</text>
          <text class="dashboard-label">工厂综合评分</text>
          <text class="dashboard-desc">A级优质稳定工厂</text>
        </view>
      </view>
    </view>
    
    <!-- 工厂成长紧凑胶囊卡片 -->
    <view class="factory-growth-card">
      <view class="growth-item level-item" @click="navigateTo('/pages/factory/my-level')">
        <text class="growth-icon">{{levelIcon}}</text>
        <text class="growth-text">{{factoryLevel}}</text>
      </view>
      <view class="growth-divider"></view>
      <view class="growth-item points-item" @click="navigateTo('/pages/factory/points-center')">
        <text class="growth-icon">💎</text>
        <text class="growth-text">{{availablePoints}} 积分</text>
      </view>
      <view class="growth-divider"></view>
      <view class="growth-item progress-item">
        <text class="growth-text">升级S级还差{{distanceToNextLevel}}次</text>
        <view class="compact-progress-bar">
          <view class="compact-progress-fill" :style="{ width: levelProgress + '%' }"></view>
        </view>
      </view>
    </view>
    

    
    <!-- 下滑可见中频功能分组区 -->
    <view class="mid-frequency-function-section">
      <!-- 生产管理模块 -->
      <view class="function-module-card">
        <text class="module-title">生产管理</text>
        <view class="function-button-grid">
          <view class="function-button" @click="navigateTo('/pages/order/order-list')">
            <text class="function-icon">📋</text>
            <text class="function-name">订单管理</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/organization-management')">
            <text class="function-icon">👥</text>
            <text class="function-name">工人管理</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/onboarding-process')">
            <text class="function-icon">✅</text>
            <text class="function-name">发起线上入职</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/reconciliation-management')">
            <text class="function-icon">💵</text>
            <text class="function-name">对账确认</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/social/factory-profile')">
            <text class="function-icon">⚙️</text>
            <text class="function-name">设备管理</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/worker/material-receipt')">
            <text class="function-icon">📦</text>
            <text class="function-name">收货登记</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/worker/delivery')">
            <text class="function-icon">🚚</text>
            <text class="function-name">送货登记</text>
          </view>
        </view>
      </view>
      
      <!-- 工厂运营模块 -->
      <view class="function-module-card">
        <text class="module-title">工厂运营</text>
        <view class="function-button-grid three-columns">
          <view class="function-button" @click="navigateTo('/pages/factory/sub-account-management')">
            <text class="function-icon">🏭</text>
            <text class="function-name">子账号管理</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/growth-management')">
            <text class="function-icon">🚀</text>
            <text class="function-name">运营增长</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/approval/approval-list')">
            <text class="function-icon">✅</text>
            <text class="function-name">审核管理</text>
          </view>
        </view>
      </view>
      
      <!-- 招工工具模块 -->
      <view class="function-module-card">
        <text class="module-title">招工工具</text>
        <view class="function-button-grid">
          <view class="function-button" @click="navigateTo('/pages/social/publish-recruitment')">
            <text class="function-icon">📢</text>
            <text class="function-name">发布招聘</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/poster-tool')">
            <text class="function-icon">�</text>
            <text class="function-name">海报工具</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/recruitment-code')">
            <text class="function-icon">🎟️</text>
            <text class="function-name">招工入职码</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/invite-code-generate')">
            <text class="function-icon">🎫</text>
            <text class="function-name">邀请码管理</text>
          </view>
        </view>
      </view>
      
      <!-- 工厂档案模块 -->
      <view class="function-module-card">
        <text class="module-title">工厂档案</text>
        <view class="function-button-grid">
          <view class="function-button" @click="navigateTo('/pages/factory/my-level')">
            <text class="function-icon">⭐</text>
            <text class="function-name">等级成长</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/points-center')">
            <text class="function-icon">💎</text>
            <text class="function-name">积分中心</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/approval/evaluation-management')">
            <text class="function-icon">🏅</text>
            <text class="function-name">我的勋章</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/social/factory-profile')">
            <text class="function-icon">📁</text>
            <text class="function-name">工厂资质</text>
          </view>
        </view>
      </view>
      
      <!-- 工具模块 -->
      <view class="function-module-card">
        <text class="module-title">工具模块</text>
        <view class="function-button-grid three-columns">
          <view class="function-button" @click="navigateTo('/pages/factory/efficiency-tools?tool=recruitment-accounting')">
            <text class="function-icon">💰</text>
            <text class="function-name">招工记账</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/efficiency-tools?tool=lightweight-mes')">
            <text class="function-icon">🏭</text>
            <text class="function-name">轻量化MES</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/efficiency-tools?tool=data-dashboard')">
            <text class="function-icon">📊</text>
            <text class="function-name">数据看板</text>
          </view>
        </view>
      </view>
      
      <!-- 核心功能模块 -->
      <view class="function-module-card">
        <text class="module-title">核心功能</text>
        <view class="function-button-grid">
          <view class="function-button" @click="navigateTo('/pages/factory/team-stability-dashboard')">
            <text class="function-icon">📈</text>
            <text class="function-name">团队稳定性</text>
          </view>
          <view class="function-button" @click="navigateTo('/pages/factory/standard-time-setting')">
            <text class="function-icon">⏱️</text>
            <text class="function-name">标准工序工时</text>
          </view>
        </view>
      </view>
    </view>
    

    

  </view>
</template>

<script>
import factoryLevelSystem from '../../utils/factory-level-system.js'

export default {
  data() {
    return {
      // 统计数据
      unreadMessages: 3,
      hasPaidFeatures: true,
      effectiveOnboardingCount: 15,
      onboardingTrend: 12.5,
      pendingReconciliation: 8,
      totalApplications: 128,
      monthlyNewApplications: 35,
      factoryScore: '4.8',
      factoryLevel: 'A级优质稳定工厂',
      levelIcon: '⭐',
      availablePoints: 1250,
      hasColdStartBenefits: true,
      invitedFactories: 2,
      freeMonths: 2,
      levelProgress: 75, // 等级升级进度
      distanceToNextLevel: 5, // 距离下一等级还差的闭环发薪次数
      // 紧急待办事项
      urgentTodos: [
        { type: 'reconciliation', title: '待处理对账请求', count: 8 },
        { type: 'onboarding', title: '待入职确认', count: 5 },
        { type: 'application', title: '待审核报名', count: 12 },
        { type: 'salary', title: '待发薪确认', count: 3 }
      ],
      hasPendingTasks: true,
      // 工厂数据
      factoryData: {
        level: 'A',
        totalClosedPay: 250,
        closedPayRate: 0.96,
        continuousPayMonth: 8,
        workerGoodRate: 0.92,
        totalInviteFactory: 3,
        totalInviteWorker: 45,
        monthlyLoginDays: 25,
        violationCount: 0
      },
      // 用户信息
      userInfo: {
        role: '工厂主',
        isFactoryOwner: true
      },
      // 模块权限
      modulePermissions: ['recruitment', 'onboarding', 'employment', 'order', 'factory', 'data', 'growth', 'level', 'points', 'poster', 'recruitment-code', 'efficiency', 'medal', 'factory-profile', 'worker-management', 'equipment-management'],

      // 服务模块（16个标准服务卡片）
      serviceModules: [
        {
          id: 'recruitment',
          name: '招聘管理',
          icon: '📢',
          route: '/pages/factory/job-management',
          visible: true,
          size: 1,
          data: '在招5岗 | 新增35投递',
          preview: []
        },
        {
          id: 'onboarding',
          name: '入职管理',
          icon: '✅',
          route: '/pages/factory/onboarding-process',
          visible: true,
          size: 1,
          data: '入职中3人 | 待入职5人',
          preview: []
        },
        {
          id: 'employment',
          name: '用工对账',
          icon: '💵',
          route: '/pages/factory/ledger-management',
          visible: true,
          size: 1,
          data: '本月记工120人 | 待对账15笔',
          preview: []
        },
        {
          id: 'order',
          name: '订单管理',
          icon: '📋',
          route: '/pages/order/order-list',
          visible: true,
          size: 1,
          data: '订单总数20 | 进行中5',
          preview: []
        },
        {
          id: 'factory-profile',
          name: '工厂档案',
          icon: '📁',
          route: '/pages/social/factory-profile',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'worker-management',
          name: '工人管理',
          icon: '👥',
          route: '/pages/factory/organization-management',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'equipment-management',
          name: '设备管理',
          icon: '⚙️',
          route: '/pages/factory/factory-profile',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'factory',
          name: '子账号管理',
          icon: '🏭',
          route: '/pages/factory/sub-account-management',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'data',
          name: '工厂数据',
          icon: '📊',
          route: '/pages/factory/efficiency-tools',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'growth',
          name: '运营增长',
          icon: '🚀',
          route: '/pages/factory/growth-management',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'level',
          name: '等级成长',
          icon: '⭐',
          route: '/pages/factory/my-level',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'points',
          name: '积分中心',
          icon: '💎',
          route: '/pages/factory/points-center',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'recruitment-code',
          name: '招工入职码',
          icon: '🎟️',
          route: '/pages/factory/recruitment-code',
          visible: true,
          size: 1,
          data: '扫码下载 | 一键入职',
          preview: []
        },
        {
          id: 'poster',
          name: '海报工具',
          icon: '🎨',
          route: '/pages/factory/poster-tool',
          visible: true,
          size: 1,
          data: '官方海报模板',
          preview: []
        },
        {
          id: 'efficiency',
          name: '效率工具',
          icon: '🛠️',
          route: '/pages/factory/efficiency-tools',
          visible: true,
          size: 1,
          data: '',
          preview: []
        },
        {
          id: 'medal',
          name: '我的勋章',
          icon: '🏅',
          route: '/pages/approval/evaluation-management',
          visible: true,
          size: 1,
          data: '',
          preview: []
        }
      ],
      // 核心模块列表
      coreModules: [
        {
          id: 'recruitment',
          name: '招聘管理',
          icon: '📢',
          description: '管理招聘岗位和候选人',
          route: '/pages/factory/job-management'
        },
        {
          id: 'onboarding',
          name: '入职管理',
          icon: '✅',
          description: '管理员工入职流程',
          route: '/pages/factory/onboarding-process'
        },
        {
          id: 'employment',
          name: '用工对账',
          icon: '💵',
          description: '管理记工和对账',
          route: '/pages/factory/ledger-management'
        },
        {
          id: 'order',
          name: '订单管理',
          icon: '📋',
          description: '管理工厂订单',
          route: '/pages/order/order-list'
        },
        {
          id: 'factory-profile',
          name: '工厂档案',
          icon: '📁',
          description: '管理工厂基本信息',
          route: '/pages/social/factory-profile'
        },
        {
          id: 'worker-management',
          name: '工人管理',
          icon: '👥',
          description: '管理工厂工人信息',
          route: '/pages/factory/organization-management'
        },
        {
          id: 'equipment-management',
          name: '设备管理',
          icon: '⚙️',
          description: '管理工厂设备',
          route: '/pages/factory/factory-profile'
        },
        {
          id: 'factory',
          name: '子账号管理',
          icon: '🏭',
          description: '管理工厂子账号和权限',
          route: '/pages/factory/sub-account-management'
        },
        {
          id: 'data',
          name: '工厂数据',
          icon: '📊',
          description: '查看工厂运营数据',
          route: '/pages/factory/efficiency-tools'
        },
        {
          id: 'growth',
          name: '运营增长',
          icon: '🚀',
          description: '管理工厂增长策略',
          route: '/pages/factory/growth-management'
        },
        {
          id: 'level',
          name: '等级成长',
          icon: '⭐',
          description: '查看等级成长和权益',
          route: '/pages/factory/my-level'
        },
        {
          id: 'points',
          name: '积分中心',
          icon: '💎',
          description: '管理积分和兑换',
          route: '/pages/factory/points-center'
        },
        {
          id: 'recruitment-code',
          name: '招工入职码',
          icon: '🎟️',
          description: '扫码下载 + 一键入职 + 快速绿色通道',
          route: '/pages/factory/recruitment-code'
        },
        {
          id: 'poster',
          name: '海报工具',
          icon: '🎨',
          description: '生成官方招工海报模板',
          route: '/pages/factory/poster-tool'
        },
        {
          id: 'efficiency',
          name: '效率工具',
          icon: '🛠️',
          description: '提高工厂运营效率',
          route: '/pages/factory/efficiency-tools'
        },
        {
          id: 'medal',
          name: '我的勋章',
          icon: '🏅',
          description: '查看获得的勋章',
          route: '/pages/approval/evaluation-management'
        }
      ],

    }
  },

  computed: {
    isFactoryOwner() {
      // 根据用户信息判断是否为工厂主
      return this.userInfo.isFactoryOwner === true
    },
    currentLevel() {
      const levelKey = factoryLevelSystem.getFactoryLevel(this.factoryData)
      return factoryLevelSystem.factoryLevels[levelKey] || factoryLevelSystem.factoryLevels.C
    }
  },
  onLoad() {
    this.loadData()
    this.loadUserInfo()
  },
  methods: {
    // 加载数据
    loadData() {
      try {
        // 模拟从本地存储或API加载数据
        const factoryData = uni.getStorageSync('factoryData')
        if (factoryData) {
          this.effectiveOnboardingCount = factoryData.effectiveOnboardingCount || 0
          this.pendingReconciliation = factoryData.pendingReconciliation || 0
          this.totalApplications = factoryData.totalApplications || 0
          this.monthlyNewApplications = factoryData.monthlyNewApplications || 0
          this.factoryScore = factoryData.factoryScore || '0.0'
          this.factoryLevel = factoryData.factoryLevel || '未评级'
          this.invitedFactories = factoryData.invitedFactories || 0
          this.freeMonths = factoryData.freeMonths || 0
          this.hasColdStartBenefits = this.invitedFactories > 0
          // 加载工厂等级数据
          this.factoryData = {
            level: factoryData.level || 'C',
            totalClosedPay: factoryData.totalClosedPay || 0,
            closedPayRate: factoryData.closedPayRate || 0,
            continuousPayMonth: factoryData.continuousPayMonth || 0,
            workerGoodRate: factoryData.workerGoodRate || 0,
            totalInviteFactory: factoryData.totalInviteFactory || 0,
            totalInviteWorker: factoryData.totalInviteWorker || 0,
            monthlyLoginDays: factoryData.monthlyLoginDays || 0,
            violationCount: factoryData.violationCount || 0
          }
        }
      } catch (error) {
        console.error('数据加载失败:', error)
        // 弱网/无网环境下，使用默认值确保页面布局正常
        this.effectiveOnboardingCount = '--'
        this.pendingReconciliation = '--'
        this.totalApplications = '--'
        this.monthlyNewApplications = '--'
        this.factoryScore = '--'
        this.factoryLevel = '未评级'
        this.invitedFactories = 0
        this.freeMonths = 0
        this.hasColdStartBenefits = false
        this.factoryData = {
          level: 'C',
          totalClosedPay: 0,
          closedPayRate: 0,
          continuousPayMonth: 0,
          workerGoodRate: 0,
          totalInviteFactory: 0,
          totalInviteWorker: 0,
          monthlyLoginDays: 0,
          violationCount: 0
        }
      }
    },
    // 导航到指定页面
    navigateTo(url) {
      console.log('导航到:', url)
      
      // 检查是否为tabbar页面
      const tabbarPages = [
        '/pages/worker/piece-rate',
        '/pages/finance/profit-dashboard'
      ]
      
      if (tabbarPages.includes(url)) {
        // 对于tabbar页面，使用switchTab
        uni.switchTab({
          url: url,
          success: () => {
            console.log('导航成功')
          },
          fail: (err) => {
            console.error('导航失败:', err)
            uni.showToast({
              title: '导航失败，请检查路径',
              icon: 'none'
            })
          }
        })
      } else {
        // 对于非tabbar页面，使用navigateTo
        uni.navigateTo({
          url: url,
          success: () => {
            console.log('导航成功')
          },
          fail: (err) => {
            console.error('导航失败:', err)
            uni.showToast({
              title: '导航失败，请检查路径',
              icon: 'none'
            })
          }
        })
      }
    },
    
    // 分享功能
    shareModule(moduleName, moduleUrl) {
      uni.showActionSheet({
        itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 分享给朋友
              this.shareToFriend(moduleName, moduleUrl)
              break
            case 1:
              // 分享到朋友圈
              this.shareToMoment(moduleName, moduleUrl)
              break
            case 2:
              // 复制链接
              this.copyLink(moduleName, moduleUrl)
              break
            default:
              break
          }
        }
      })
    },
    
    // 分享给朋友
    shareToFriend(moduleName, moduleUrl) {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        title: `${moduleName} - 衣起赚工厂管理`,
        content: `快来使用衣起赚的${moduleName}功能，提升工厂管理效率！`,
        url: moduleUrl,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    
    // 分享到朋友圈
    shareToMoment(moduleName, moduleUrl) {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneTimeline',
        type: 0,
        title: `${moduleName} - 衣起赚工厂管理`,
        content: `快来使用衣起赚的${moduleName}功能，提升工厂管理效率！`,
        url: moduleUrl,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    
    // 复制链接
    copyLink(moduleName, moduleUrl) {
      uni.setClipboardData({
        data: moduleUrl,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('复制失败:', err)
          uni.showToast({
            title: '复制失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    
    // 加载用户信息
    loadUserInfo() {
      // 从本地存储加载用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      const isEnterpriseUser = userInfo.isEnterprise || false
      const boundCompany = userInfo.boundCompany || uni.getStorageSync('boundCompany') || null
      const subAccount = uni.getStorageSync('currentSubAccount') || null
      
      console.log('当前登录账号userInfo：', userInfo)
      console.log('isEnterprise：', isEnterpriseUser) // 工厂主账号必须是true
      console.log('boundCompany：', boundCompany) // 主账号是null，子账号才有值
      
      // 强制统一的身份判断规则
      if (isEnterpriseUser === true) {
        // 工厂主登录
        console.log('身份确认：工厂主账号')
        this.userInfo = {
          role: userInfo.role || '工厂主',
          isFactoryOwner: true,
          isEnterprise: true
        }
        this.modulePermissions = ['recruitment', 'onboarding', 'employment', 'order', 'factory', 'data', 'growth', 'level', 'points', 'poster', 'recruitment-code', 'efficiency', 'medal', 'factory-profile', 'worker-management', 'equipment-management']
      } else if (boundCompany !== null && isEnterpriseUser === false) {
        // 子账号登录
        console.log('身份确认：子账号')
        this.userInfo = {
          role: subAccount?.role || '子账号',
          isFactoryOwner: false,
          boundCompany: boundCompany
        }
        this.modulePermissions = subAccount?.modulePermissions || []
      } else if (isEnterpriseUser === false && boundCompany === null) {
        // 普通个人账号，不应该进入工厂端
        console.log('身份确认：普通个人账号，重定向到工人首页')
        uni.reLaunch({
          url: '/pages/worker/employee-home'
        })
        return
      }
    },
    // 检查模块权限
    hasModulePermission(moduleId) {
      // 工厂主拥有所有模块权限
      if (this.isFactoryOwner) {
        // 按工厂等级限制可解锁的模块
        const levelModules = {
          'C': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'recruitment-code'], // C级工厂仅开放基础模块
          'B': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster'], // B级及以上解锁全部模块
          'A': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster', 'efficiency', 'medal'], // A级解锁全量模块
          'S': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster', 'efficiency', 'medal'] // S级解锁全量模块
        }
        const allowedModules = levelModules[this.factoryData.level] || levelModules.C
        return allowedModules.includes(moduleId)
      }
      // 子账号只能查看分配给他们的模块
      return this.modulePermissions.includes(moduleId)
    },

    // 处理待办事项操作
    handleTodoAction(type) {
      switch (type) {
        case 'reconciliation':
          this.navigateTo('/pages/factory/reconciliation-management')
          break
        case 'onboarding':
          this.navigateTo('/pages/factory/onboarding-process')
          break
        case 'application':
          this.navigateTo('/pages/factory/job-management')
          break
        case 'salary':
          this.navigateTo('/pages/factory/worker-management')
          break
        default:
          break
      }
    },
    // 显示语音助手
    showVoiceAssistant() {
      uni.showModal({
        title: '工厂语音助手',
        content: '你好，我是衣起赚工厂语音助手，你可以直接说发布招聘、处理对账、查工厂数据等需求\n\n你可以这样说：\n1. 发布招聘：招2个平车开口袋工人\n2. 待办处理：处理待对账请求\n3. 数据查询：本月岗位投递数、工厂综合评分\n4. 操作发起：发起线上入职、生成招工邀请码\n5. 标准工时查询：查询平车开口袋的标准工时',
        confirmText: '开始使用',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 这里可以集成语音识别功能
            uni.showToast({
              title: '语音助手已启动',
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
.factory-home-container {
  padding: 120rpx 0 0 0;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  height: 80rpx;
}

.nav-left {
  flex: 1;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.nav-right {
  display: flex;
  gap: 32rpx;
  align-items: center;
}

.nav-item {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.nav-item:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 36rpx;
  color: white;
}

.add-module-btn {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background-color: #FF5252;
  color: white;
  border-radius: 50%;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
}

/* 紧急待办置顶提醒区 */
.urgent-todo-section {
  margin: 100rpx 32rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #FF5252;
  height: 120rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.todo-slider {
  display: flex;
  height: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

.todo-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.todo-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.todo-count {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.todo-action {
  background-color: white;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #FF5252;
}





/* 核心经营数据看板 */
.core-data-dashboard {
  padding: 0 32rpx 24rpx;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.dashboard-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.dashboard-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  filter: brightness(0.95);
  transition: all 0.2s ease;
}

.dashboard-card.warning {
  border-left: 4rpx solid #FF5252;
}

.dashboard-value {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.dashboard-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.3;
}

.dashboard-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.dashboard-trend {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.dashboard-trend.positive {
  color: #4CAF50;
}

.dashboard-trend.negative {
  color: #F56C6C;
}

.dashboard-trend.action {
  color: #FF5252;
  font-weight: 500;
}



/* 工厂成长紧凑胶囊卡片 */
.factory-growth-card {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 16rpx;
  margin: 24rpx 32rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  height: 140rpx;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.growth-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 16rpx;
  flex-shrink: 0;
}

.level-item, .points-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-item:active, .points-item:active {
  opacity: 0.8;
}

.growth-icon {
  font-size: 36rpx;
}

.growth-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.growth-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: #e0e0e0;
  margin: 0 8rpx;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
  flex-shrink: 0;
  min-width: 200rpx;
}

.compact-progress-bar {
  width: 160rpx;
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.compact-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 下滑可见中频功能分组区 */
.mid-frequency-function-section {
  padding: 0 32rpx 100rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.function-module-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.function-button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.function-button-grid:not(:last-child) {
  margin-bottom: 16rpx;
}

/* 三列布局 */
.function-button-grid.three-columns {
  grid-template-columns: repeat(3, 1fr);
}

.function-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
  height: 140rpx;
}

.function-button:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.function-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.function-name {
  font-size: 28rpx;
  color: #333;
  text-align: center;
}



</style>