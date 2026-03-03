// A/B测试工具
class ABTesting {
  constructor() {
    this.init()
  }

  // 初始化
  init() {
    // 从本地存储加载测试配置
    this.loadTestConfigurations()
  }

  // 加载测试配置
  loadTestConfigurations() {
    this.testConfigs = uni.getStorageSync('abTestConfigs') || {
      // 默认测试配置
      recruitmentCardDesign: {
        testName: 'recruitment_card_design',
        variants: ['A', 'B'],
        weights: [0.5, 0.5], // 50% 的用户使用A版本，50% 使用B版本
        startDate: new Date().toISOString(),
        endDate: null
      },
      recruitmentList: {
        testName: 'recruitment_list',
        variants: ['A', 'B'],
        weights: [0.5, 0.5], // 50% 的用户使用A版本，50% 使用B版本
        startDate: new Date().toISOString(),
        endDate: null
      }
    }
  }

  // 保存测试配置
  saveTestConfigurations() {
    uni.setStorageSync('abTestConfigs', this.testConfigs)
  }

  // 为用户分配测试变体
  assignVariant(testName) {
    const testConfig = this.testConfigs[testName]
    if (!testConfig) {
      console.error(`A/B测试配置不存在: ${testName}`)
      return 'A' // 默认返回A版本
    }

    // 检查测试是否在有效期内
    const now = new Date()
    if (testConfig.startDate && new Date(testConfig.startDate) > now) {
      return 'A' // 测试尚未开始，返回默认版本
    }

    if (testConfig.endDate && new Date(testConfig.endDate) < now) {
      return 'A' // 测试已结束，返回默认版本
    }

    // 从本地存储获取用户的变体分配
    const userVariants = uni.getStorageSync('userABVariants') || {}
    if (userVariants[testName]) {
      return userVariants[testName] // 用户已经被分配了变体
    }

    // 根据权重随机分配变体
    const variant = this.weightedRandom(testConfig.variants, testConfig.weights)
    
    // 保存用户的变体分配
    userVariants[testName] = variant
    uni.setStorageSync('userABVariants', userVariants)

    return variant
  }

  // 加权随机选择
  weightedRandom(variants, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < variants.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return variants[i]
      }
    }

    return variants[0] // 兜底返回第一个变体
  }

  // 记录测试事件
  trackEvent(testName, variant, action) {
    const events = uni.getStorageSync('abTestEvents') || []
    
    events.push({
      testName,
      variant,
      action,
      timestamp: new Date().toISOString(),
      userId: uni.getStorageSync('userInfo')?.username || 'guest',
      deviceId: uni.getStorageSync('deviceId') || 'unknown'
    })

    // 限制事件数量，只保留最近1000条
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }

    uni.setStorageSync('abTestEvents', events)
  }

  // 获取测试数据
  getTestData(testName) {
    const events = uni.getStorageSync('abTestEvents') || []
    const testEvents = events.filter(event => event.testName === testName)

    // 按变体分组统计
    const variantStats = {}
    testEvents.forEach(event => {
      if (!variantStats[event.variant]) {
        variantStats[event.variant] = {
          totalEvents: 0,
          actions: {}
        }
      }

      variantStats[event.variant].totalEvents++
      
      if (!variantStats[event.variant].actions[event.action]) {
        variantStats[event.variant].actions[event.action] = 0
      }
      variantStats[event.variant].actions[event.action]++
    })

    return variantStats
  }

  // 添加新的测试
  addTest(testName, variants, weights, startDate, endDate) {
    this.testConfigs[testName] = {
      testName,
      variants,
      weights,
      startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
      endDate: endDate ? endDate.toISOString() : null
    }

    this.saveTestConfigurations()
  }

  // 结束测试
  endTest(testName) {
    if (this.testConfigs[testName]) {
      this.testConfigs[testName].endDate = new Date().toISOString()
      this.saveTestConfigurations()
    }
  }

  // 获取用户的测试变体
  getVariant(testName) {
    return this.assignVariant(testName)
  }
}

// 导出单例
const abTesting = new ABTesting()
export default abTesting