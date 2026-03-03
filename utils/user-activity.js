// 用户活跃度检测和推送管理工具

// 活动类型
const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LEDGER: 'ledger'
}

// 推送类型
const PUSH_TYPES = {
  LEDGER_REMINDER: 'ledger_reminder',
  JOB_OPPORTUNITY: 'job_opportunity'
}

// 推送内容
const PUSH_CONTENT = {
  [PUSH_TYPES.LEDGER_REMINDER]: {
    title: '记账提醒',
    content: '该记账啦，记录工资不记错',
    icon: '💰'
  },
  [PUSH_TYPES.JOB_OPPORTUNITY]: {
    title: '新工作机会',
    content: '有新工作机会，快来看看',
    icon: '🏭'
  }
}

// 检测阈值（天）
const DETECTION_THRESHOLDS = {
  LEDGER_REMINDER: 3, // 3天未记账
  JOB_OPPORTUNITY: 7 // 7天未登录
}

// 记录用户活动
export function recordUserActivity(userId, activityType) {
  const activityData = uni.getStorageSync('userActivity') || {}
  
  if (!activityData[userId]) {
    activityData[userId] = {
      lastLogin: null,
      lastLedger: null,
      pushHistory: []
    }
  }
  
  const now = new Date().toISOString()
  
  if (activityType === ACTIVITY_TYPES.LOGIN) {
    activityData[userId].lastLogin = now
  } else if (activityType === ACTIVITY_TYPES.LEDGER) {
    activityData[userId].lastLedger = now
  }
  
  uni.setStorageSync('userActivity', activityData)
}

// 检查用户活跃度并发送推送
export function checkUserActivityAndPush() {
  const activityData = uni.getStorageSync('userActivity') || {}
  const users = Object.keys(activityData)
  
  users.forEach(userId => {
    const userActivity = activityData[userId]
    const now = new Date()
    
    // 检查连续3天未登录、未记账
    const lastLogin = userActivity.lastLogin ? new Date(userActivity.lastLogin) : null
    const lastLedger = userActivity.lastLedger ? new Date(userActivity.lastLedger) : null
    
    const daysSinceLogin = lastLogin ? Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24)) : Infinity
    const daysSinceLedger = lastLedger ? Math.floor((now - lastLedger) / (1000 * 60 * 60 * 24)) : Infinity
    
    // 检查是否需要发送记账提醒
    if (daysSinceLogin >= DETECTION_THRESHOLDS.LEDGER_REMINDER && daysSinceLedger >= DETECTION_THRESHOLDS.LEDGER_REMINDER) {
      sendPushNotification(userId, PUSH_TYPES.LEDGER_REMINDER)
    }
    
    // 检查是否需要发送工作机会提醒
    if (daysSinceLogin >= DETECTION_THRESHOLDS.JOB_OPPORTUNITY) {
      sendPushNotification(userId, PUSH_TYPES.JOB_OPPORTUNITY)
    }
  })
}

// 发送推送通知
function sendPushNotification(userId, pushType) {
  // 检查是否已经发送过该类型的推送
  const activityData = uni.getStorageSync('userActivity') || {}
  const userActivity = activityData[userId]
  
  if (!userActivity) return
  
  // 检查最近7天是否已经发送过相同类型的推送
  const now = new Date()
  const recentPushes = userActivity.pushHistory.filter(push => {
    const pushDate = new Date(push.timestamp)
    const daysSincePush = Math.floor((now - pushDate) / (1000 * 60 * 60 * 24))
    return push.type === pushType && daysSincePush < 7
  })
  
  if (recentPushes.length > 0) {
    // 最近已经发送过，不再重复发送
    return
  }
  
  // 添加到推送历史
  userActivity.pushHistory.push({
    type: pushType,
    timestamp: new Date().toISOString()
  })
  
  // 保存推送历史
  activityData[userId] = userActivity
  uni.setStorageSync('userActivity', activityData)
  
  // 获取推送内容
  const pushContent = PUSH_CONTENT[pushType]
  
  // 添加到通知列表
  const notifications = uni.getStorageSync('notifications') || []
  notifications.push({
    id: Date.now(),
    type: 'system',
    title: pushContent.title,
    content: pushContent.content,
    icon: pushContent.icon,
    userId: userId,
    read: false,
    createdAt: new Date().toISOString()
  })
  
  uni.setStorageSync('notifications', notifications)
  
  // 这里可以添加实际的APP推送逻辑
  console.log(`发送推送通知给用户 ${userId}: ${pushContent.title} - ${pushContent.content}`)
}

// 初始化用户活动数据
export function initUserActivity(userId) {
  const activityData = uni.getStorageSync('userActivity') || {}
  
  if (!activityData[userId]) {
    activityData[userId] = {
      lastLogin: new Date().toISOString(),
      lastLedger: null,
      pushHistory: []
    }
    uni.setStorageSync('userActivity', activityData)
  }
}

// 获取用户活动状态
export function getUserActivityStatus(userId) {
  const activityData = uni.getStorageSync('userActivity') || {}
  return activityData[userId] || {
    lastLogin: null,
    lastLedger: null,
    pushHistory: []
  }
}

export { ACTIVITY_TYPES, PUSH_TYPES, DETECTION_THRESHOLDS }