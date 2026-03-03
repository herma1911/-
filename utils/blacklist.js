// 黑名单管理工具类

/**
 * 获取用户的黑名单
 * @param {string} userId - 用户ID
 * @returns {Array} 黑名单列表
 */
export function getBlacklist(userId) {
  const allBlacklists = uni.getStorageSync('blacklists') || {}
  return allBlacklists[userId] || []
}

/**
 * 添加到黑名单
 * @param {string} userId - 用户ID
 * @param {string} targetId - 目标ID（工厂或工人）
 * @param {string} targetType - 目标类型（'factory' 或 'worker'）
 * @param {string} targetName - 目标名称
 * @returns {boolean} 是否添加成功
 */
export function addToBlacklist(userId, targetId, targetType, targetName) {
  const allBlacklists = uni.getStorageSync('blacklists') || {}
  
  if (!allBlacklists[userId]) {
    allBlacklists[userId] = []
  }
  
  // 检查是否已经在黑名单中
  const existingIndex = allBlacklists[userId].findIndex(item => 
    item.id === targetId && item.type === targetType
  )
  
  if (existingIndex >= 0) {
    return false // 已经在黑名单中
  }
  
  // 添加到黑名单
  allBlacklists[userId].push({
    id: targetId,
    type: targetType,
    name: targetName,
    addedAt: new Date().toISOString()
  })
  
  uni.setStorageSync('blacklists', allBlacklists)
  return true
}

/**
 * 从黑名单中移除
 * @param {string} userId - 用户ID
 * @param {string} targetId - 目标ID（工厂或工人）
 * @param {string} targetType - 目标类型（'factory' 或 'worker'）
 * @returns {boolean} 是否移除成功
 */
export function removeFromBlacklist(userId, targetId, targetType) {
  const allBlacklists = uni.getStorageSync('blacklists') || {}
  
  if (!allBlacklists[userId]) {
    return false // 黑名单不存在
  }
  
  // 找到并移除
  const initialLength = allBlacklists[userId].length
  allBlacklists[userId] = allBlacklists[userId].filter(item => 
    !(item.id === targetId && item.type === targetType)
  )
  
  if (allBlacklists[userId].length === initialLength) {
    return false // 没有找到要移除的项
  }
  
  uni.setStorageSync('blacklists', allBlacklists)
  return true
}

/**
 * 检查是否在黑名单中
 * @param {string} userId - 用户ID
 * @param {string} targetId - 目标ID（工厂或工人）
 * @param {string} targetType - 目标类型（'factory' 或 'worker'）
 * @returns {boolean} 是否在黑名单中
 */
export function isInBlacklist(userId, targetId, targetType) {
  const blacklist = getBlacklist(userId)
  return blacklist.some(item => 
    item.id === targetId && item.type === targetType
  )
}

/**
 * 获取黑名单数量
 * @param {string} userId - 用户ID
 * @returns {number} 黑名单数量
 */
export function getBlacklistCount(userId) {
  const blacklist = getBlacklist(userId)
  return blacklist.length
}
