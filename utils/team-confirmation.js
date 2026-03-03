// 班组确认相关工具函数

/**
 * 检查并处理超时未确认的班组归属请求
 * 当班组长未在24小时内确认时，自动解绑
 */
export function checkTeamConfirmationTimeout() {
  const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
  const now = new Date().getTime()
  const twentyFourHours = 24 * 60 * 60 * 1000
  
  let updatedConfirmations = teamConfirmations.filter(confirmation => {
    if (confirmation.status === 'pending') {
      const submittedTime = new Date(confirmation.submittedAt).getTime()
      if (now - submittedTime > twentyFourHours) {
        // 超过24小时未确认，自动解绑
        return false
      }
    }
    return true
  })
  
  // 如果有变化，更新存储
  if (updatedConfirmations.length !== teamConfirmations.length) {
    uni.setStorageSync('teamConfirmations', updatedConfirmations)
    return true
  }
  
  return false
}

/**
 * 检查用户是否已被班组长确认
 * @param {string} userId - 用户ID
 * @param {number} companyId - 公司ID
 * @returns {boolean} - 是否已确认
 */
export function isUserConfirmedByLeader(userId, companyId) {
  const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
  return teamConfirmations.some(confirmation => 
    confirmation.workerId === userId && 
    confirmation.companyId === companyId &&
    confirmation.status === 'approved'
  )
}

/**
 * 获取用户的班组确认状态
 * @param {string} userId - 用户ID
 * @returns {Object|null} - 确认状态信息
 */
export function getUserConfirmationStatus(userId) {
  const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
  return teamConfirmations.find(confirmation => confirmation.workerId === userId)
}
