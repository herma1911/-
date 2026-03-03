// 冷启动限时破局福利管理工具

// 冷启动配置
const LAUNCH_CONFIG = {
  // 活动时间范围（上线前3个月）
  START_DATE: new Date(),
  END_DATE: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3个月后
  
  // 千名先锋熟手限额
  PIONEER_WORKER_LIMIT: 1000,
  
  // 标杆工厂限额
  PIONEER_FACTORY_LIMIT: 10
}

// 保存冷启动活动数据
export function saveLaunchData(data) {
  const launchData = uni.getStorageSync('launchData') || {
    newUserRewards: [],
    pioneerWorkers: [],
    pioneerFactories: [],
    initialized: false
  }
  
  const updatedData = {
    ...launchData,
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  uni.setStorageSync('launchData', updatedData)
  return updatedData
}

// 获取冷启动活动数据
export function getLaunchData() {
  const launchData = uni.getStorageSync('launchData') || {
    newUserRewards: [],
    pioneerWorkers: [],
    pioneerFactories: [],
    initialized: false
  }
  
  // 初始化数据（如果未初始化）
  if (!launchData.initialized) {
    launchData.initialized = true
    saveLaunchData(launchData)
  }
  
  return launchData
}

// 检查活动是否在有效期内
export function isLaunchPeriodActive() {
  const now = new Date()
  return now >= LAUNCH_CONFIG.START_DATE && now <= LAUNCH_CONFIG.END_DATE
}

// 解锁首月新人礼
export function unlockNewUserReward(userId) {
  if (!isLaunchPeriodActive()) {
    return {
      success: false,
      reason: '活动已结束'
    }
  }
  
  const launchData = getLaunchData()
  
  // 检查是否已经领取
  const hasClaimed = launchData.newUserRewards.some(record => record.userId === userId)
  if (hasClaimed) {
    return {
      success: false,
      reason: '已领取过新人礼'
    }
  }
  
  // 解锁新人礼
  const { unlockNewUserReward: unlockLedgerReward } = require('./ledger-privileges')
  unlockLedgerReward(userId)
  
  // 记录领取
  launchData.newUserRewards.push({
    userId,
    claimedAt: new Date().toISOString()
  })
  
  saveLaunchData(launchData)
  
  return {
    success: true,
    message: '新人礼领取成功'
  }
}

// 解锁千名先锋熟手福利
export function unlockPioneerWorkerReward(userId) {
  if (!isLaunchPeriodActive()) {
    return {
      success: false,
      reason: '活动已结束'
    }
  }
  
  const launchData = getLaunchData()
  
  // 检查是否已经领取
  const hasClaimed = launchData.pioneerWorkers.some(record => record.userId === userId)
  if (hasClaimed) {
    return {
      success: false,
      reason: '已领取过先锋熟手福利'
    }
  }
  
  // 检查是否达到限额
  if (launchData.pioneerWorkers.length >= LAUNCH_CONFIG.PIONEER_WORKER_LIMIT) {
    return {
      success: false,
      reason: '先锋熟手名额已满'
    }
  }
  
  // 解锁先锋熟手福利
  const { unlockPioneerWorkerReward: unlockLedgerReward } = require('./ledger-privileges')
  unlockLedgerReward(userId)
  
  // 添加先锋熟手标签
  const { addBadge } = require('./career-profile')
  addBadge(userId, {
    id: 'pioneer_worker',
    name: '平台认证先锋熟手',
    description: '技能认证免试升级，永久享受订单优先匹配权',
    level: 'platinum'
  })
  
  // 记录领取
  launchData.pioneerWorkers.push({
    userId,
    claimedAt: new Date().toISOString(),
    rank: launchData.pioneerWorkers.length + 1
  })
  
  saveLaunchData(launchData)
  
  return {
    success: true,
    message: '先锋熟手福利领取成功',
    rank: launchData.pioneerWorkers.length
  }
}

// 解锁标杆工厂班组福利
export function unlockPioneerFactoryReward(factoryId) {
  if (!isLaunchPeriodActive()) {
    return {
      success: false,
      reason: '活动已结束'
    }
  }
  
  const launchData = getLaunchData()
  
  // 检查是否已经领取
  const hasClaimed = launchData.pioneerFactories.some(record => record.factoryId === factoryId)
  if (hasClaimed) {
    return {
      success: false,
      reason: '已领取过标杆工厂福利'
    }
  }
  
  // 检查是否达到限额
  if (launchData.pioneerFactories.length >= LAUNCH_CONFIG.PIONEER_FACTORY_LIMIT) {
    return {
      success: false,
      reason: '标杆工厂名额已满'
    }
  }
  
  // 解锁标杆工厂福利
  const { unlockPioneerFactoryReward: unlockLedgerReward } = require('./ledger-privileges')
  unlockLedgerReward(factoryId)
  
  // 记录领取
  launchData.pioneerFactories.push({
    factoryId,
    claimedAt: new Date().toISOString(),
    rank: launchData.pioneerFactories.length + 1
  })
  
  saveLaunchData(launchData)
  
  return {
    success: true,
    message: '标杆工厂福利领取成功',
    rank: launchData.pioneerFactories.length
  }
}

// 检查用户是否已领取新人礼
export function hasClaimedNewUserReward(userId) {
  const launchData = getLaunchData()
  return launchData.newUserRewards.some(record => record.userId === userId)
}

// 检查用户是否已领取先锋熟手福利
export function hasClaimedPioneerWorkerReward(userId) {
  const launchData = getLaunchData()
  return launchData.pioneerWorkers.some(record => record.userId === userId)
}

// 检查工厂是否已领取标杆工厂福利
export function hasClaimedPioneerFactoryReward(factoryId) {
  const launchData = getLaunchData()
  return launchData.pioneerFactories.some(record => record.factoryId === factoryId)
}

// 获取先锋熟手剩余名额
export function getPioneerWorkerRemainingQuota() {
  const launchData = getLaunchData()
  return Math.max(0, LAUNCH_CONFIG.PIONEER_WORKER_LIMIT - launchData.pioneerWorkers.length)
}

// 获取标杆工厂剩余名额
export function getPioneerFactoryRemainingQuota() {
  const launchData = getLaunchData()
  return Math.max(0, LAUNCH_CONFIG.PIONEER_FACTORY_LIMIT - launchData.pioneerFactories.length)
}

// 获取活动统计数据
export function getLaunchStats() {
  const launchData = getLaunchData()
  const now = new Date()
  const daysRemaining = Math.ceil((LAUNCH_CONFIG.END_DATE - now) / (24 * 60 * 60 * 1000))
  
  return {
    isActive: isLaunchPeriodActive(),
    daysRemaining: Math.max(0, daysRemaining),
    newUserRewardsClaimed: launchData.newUserRewards.length,
    pioneerWorkersClaimed: launchData.pioneerWorkers.length,
    pioneerWorkersRemaining: getPioneerWorkerRemainingQuota(),
    pioneerFactoriesClaimed: launchData.pioneerFactories.length,
    pioneerFactoriesRemaining: getPioneerFactoryRemainingQuota()
  }
}

// 批量处理冷启动福利
export function processLaunchIncentives() {
  const stats = getLaunchStats()
  return {
    stats,
    message: isLaunchPeriodActive() ? '冷启动活动进行中' : '冷启动活动已结束'
  }
}

// 导出冷启动配置
export { LAUNCH_CONFIG }
