// 隐私保护和防骚扰工具

// 联系频率限制配置
const CONTACT_LIMITS = {
  // 工厂联系频率限制
  FACTORY_CONTACT: {
    MAX_PER_24H: 1, // 24小时内最多1次
    TIME_WINDOW: 24 * 60 * 60 * 1000 // 24小时时间窗口
  },
  // 平台推送频率限制
  PLATFORM_PUSH: {
    MAX_PER_DAY: 2, // 每天最多2条
    TIME_WINDOW: 24 * 60 * 60 * 1000 // 24小时时间窗口
  }
}

// 触达权限模式
const CONTACT_MODES = {
  PLATFORM_ONLY: 'platform', // 仅平台推荐
  FACTORY_ONLY: 'factory', // 仅工厂联系
  NO_CONTACT: 'none' // 全部拒绝
}

// 检查工厂联系频率是否超限
export function checkFactoryContactLimit(userId, factoryId) {
  const contactLimits = uni.getStorageSync('contactLimits') || {}
  const userLimits = contactLimits[userId] || {
    lastContactTime: {},
    dailyPlatformPushes: 0,
    lastPushDate: new Date().toDateString()
  }
  
  const now = Date.now()
  const lastContactTime = userLimits.lastContactTime[factoryId] || 0
  
  // 检查是否在24小时内
  if (now - lastContactTime < CONTACT_LIMITS.FACTORY_CONTACT.TIME_WINDOW) {
    return {
      allowed: false,
      remainingTime: Math.ceil((CONTACT_LIMITS.FACTORY_CONTACT.TIME_WINDOW - (now - lastContactTime)) / (60 * 60 * 1000))
    }
  }
  
  return { allowed: true }
}

// 检查平台推送频率是否超限
export function checkPlatformPushLimit(userId) {
  const contactLimits = uni.getStorageSync('contactLimits') || {}
  const userLimits = contactLimits[userId] || {
    lastContactTime: {},
    dailyPlatformPushes: 0,
    lastPushDate: new Date().toDateString()
  }
  
  const today = new Date().toDateString()
  
  // 如果是新的一天，重置推送计数
  if (userLimits.lastPushDate !== today) {
    userLimits.dailyPlatformPushes = 0
    userLimits.lastPushDate = today
    contactLimits[userId] = userLimits
    uni.setStorageSync('contactLimits', contactLimits)
  }
  
  if (userLimits.dailyPlatformPushes >= CONTACT_LIMITS.PLATFORM_PUSH.MAX_PER_DAY) {
    return {
      allowed: false,
      remaining: 0
    }
  }
  
  return {
    allowed: true,
    remaining: CONTACT_LIMITS.PLATFORM_PUSH.MAX_PER_DAY - userLimits.dailyPlatformPushes
  }
}

// 记录工厂联系
export function recordFactoryContact(userId, factoryId) {
  const contactLimits = uni.getStorageSync('contactLimits') || {}
  const userLimits = contactLimits[userId] || {
    lastContactTime: {},
    dailyPlatformPushes: 0,
    lastPushDate: new Date().toDateString()
  }
  
  userLimits.lastContactTime[factoryId] = Date.now()
  contactLimits[userId] = userLimits
  uni.setStorageSync('contactLimits', contactLimits)
  
  return true
}

// 记录平台推送
export function recordPlatformPush(userId) {
  const contactLimits = uni.getStorageSync('contactLimits') || {}
  const userLimits = contactLimits[userId] || {
    lastContactTime: {},
    dailyPlatformPushes: 0,
    lastPushDate: new Date().toDateString()
  }
  
  const today = new Date().toDateString()
  
  // 如果是新的一天，重置推送计数
  if (userLimits.lastPushDate !== today) {
    userLimits.dailyPlatformPushes = 0
    userLimits.lastPushDate = today
  }
  
  userLimits.dailyPlatformPushes++
  contactLimits[userId] = userLimits
  uni.setStorageSync('contactLimits', contactLimits)
  
  return true
}

// 检查触达权限
export function checkContactPermission(userId, contactType) {
  // 获取用户触达权限模式
  const contactMode = uni.getStorageSync('contactMode') || CONTACT_MODES.PLATFORM_ONLY
  
  // 检查是否完全拒绝所有联系
  if (contactMode === CONTACT_MODES.NO_CONTACT) {
    return {
      allowed: false,
      reason: '用户已设置拒绝所有联系'
    }
  }
  
  // 检查具体触达类型权限
  if (contactType === 'platform' && contactMode !== CONTACT_MODES.PLATFORM_ONLY) {
    return {
      allowed: false,
      reason: '用户未开启平台推荐权限'
    }
  }
  
  if (contactType === 'factory' && contactMode !== CONTACT_MODES.FACTORY_ONLY) {
    return {
      allowed: false,
      reason: '用户未开启工厂联系权限'
    }
  }
  
  return { allowed: true }
}

// 检查APP内消息联系权限
export function checkAppMessagePermission(userId, factoryId) {
  // 检查用户状态
  const userInfo = uni.getStorageSync('userInfo') || {}
  const userStatus = userInfo.status
  
  // 根据用户状态判断是否允许APP内消息联系
  if (userStatus === 'working') {
    return {
      allowed: false,
      reason: '用户当前状态不允许APP内消息联系'
    }
  }
  
  // 检查联系频率限制
  const limitCheck = checkFactoryContactLimit(userId, factoryId)
  if (!limitCheck.allowed) {
    return {
      allowed: false,
      reason: `24小时内只能联系1次，还需等待${limitCheck.remainingTime}小时`
    }
  }
  
  return { allowed: true }
}

// 检查手机号查看权限（需要积分或套餐解锁）
export function checkPhoneViewPermission(userId, factoryId) {
  // 检查用户状态
  const userInfo = uni.getStorageSync('userInfo') || {}
  const userStatus = userInfo.status
  
  // 根据用户状态判断是否允许打电话
  if (userStatus === 'exploring' || userStatus === 'working') {
    return {
      allowed: false,
      reason: '用户当前状态不允许电话联系'
    }
  }
  
  // 检查联系频率限制
  const limitCheck = checkFactoryContactLimit(userId, factoryId)
  if (!limitCheck.allowed) {
    return {
      allowed: false,
      reason: `24小时内只能联系1次，还需等待${limitCheck.remainingTime}小时`
    }
  }
  
  // 检查工厂是否有电话权限（这里需要根据实际的积分/套餐系统来实现）
  // 暂时返回需要积分/套餐的提示
  return {
    allowed: false,
    reason: '需要积分或套餐解锁直拨电话权限'
  }
}

// 获取用户隐私设置
export function getUserPrivacySettings(userId) {
  const contactMode = uni.getStorageSync('contactMode') || CONTACT_MODES.PLATFORM_ONLY
  const notificationSettings = uni.getStorageSync('notificationSettings') || {
    platformPush: true
  }
  
  const phoneRecords = uni.getStorageSync('phoneRecords') || {}
  const userRecord = phoneRecords[userId]
  
  return {
    contactMode,
    notificationSettings,
    hasPhoneRecord: !!userRecord,
    authOptions: userRecord ? userRecord.authOptions : {
      platformRecommendation: false,
      factoryContact: false
    }
  }
}

// 验证留号授权
export function validatePhoneAuth(authOptions) {
  // 确保至少选择一项授权
  if (!authOptions.platformRecommendation && !authOptions.factoryContact) {
    return {
      valid: false,
      reason: '请至少选择一项授权选项'
    }
  }
  
  return { valid: true }
}

// 导出常量
export { CONTACT_LIMITS, CONTACT_MODES }