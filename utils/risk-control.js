// 防刷风控红线机制管理工具

// 风控规则配置
const RISK_CONTROL_RULES = {
  // 评价频率限制
  EVALUATION_FREQUENCY: {
    MAX_PER_DAY: 3, // 每天最多3条评价
    MAX_PER_HOUR: 1 // 每小时最多1条评价
  },
  // 异常评价检测阈值
  ANOMALY_THRESHOLD: {
    MIN_SCORE: 1.0, // 最低评分阈值
    MAX_SCORE: 4.5, // 最高评分阈值（避免刷满分）
    MIN_COMMENT_LENGTH: 10, // 最低评论长度
    MAX_SIMILARITY: 0.8, // 评论相似度阈值
  },
  // 账号关联检测
  ACCOUNT_LINKAGE: {
    SAME_DEVICE_THRESHOLD: 3, // 同一设备最多3个账号
    SAME_IP_THRESHOLD: 5, // 同一IP最多5个账号
  },
  // 班组关联检测
  TEAM_LINKAGE: {
    REQUIRE_WORK_HISTORY: true, // 需要共事记录
    REQUIRE_APPROVED_LEDGER: true, // 需要审批通过的记账记录
    REQUIRE_REAL_NAME: true, // 需要实名认证
  }
}

// 异常评价类型
const ANOMALY_TYPES = {
  BATCH_SCORE: 'batch_score', // 抱团刷分
  MALICIOUS_NEGATIVE: 'malicious_negative', // 恶意差评
  SMALL_ACCOUNT: 'small_account', // 小号刷评
  FREQUENCY_ABUSE: 'frequency_abuse', // 频率滥用
  SIMILAR_COMMENTS: 'similar_comments', // 相似评论
  TEAM_VIOLATION: 'team_violation' // 班组规则违反
}

// 违规处理级别
const PUNISHMENT_LEVELS = {
  WARNING: 'warning', // 警告
  REVOKE_BENEFITS: 'revoke_benefits', // 收回权益
  SUSPEND_EVALUATION: 'suspend_evaluation', // 暂停评价权限
  BAN_ACCOUNT: 'ban_account' // 封禁账号
}

// 保存风控记录
export function saveRiskControlRecord(record) {
  const records = uni.getStorageSync('riskControlRecords') || []
  records.push({
    ...record,
    id: Date.now(),
    createdAt: new Date().toISOString()
  })
  // 只保留最近1000条记录
  if (records.length > 1000) {
    records.splice(0, records.length - 1000)
  }
  uni.setStorageSync('riskControlRecords', records)
  return records
}

// 获取风控记录
export function getRiskControlRecords(userId = null, limit = 50) {
  const records = uni.getStorageSync('riskControlRecords') || []
  let filteredRecords = records
  
  if (userId) {
    filteredRecords = records.filter(record => record.userId === userId)
  }
  
  // 按时间倒序排序
  filteredRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  return filteredRecords.slice(0, limit)
}

// 检测评价频率异常
export function detectFrequencyAnomaly(userId) {
  const records = getRiskControlRecords(userId)
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  // 统计今天的评价次数
  const todayEvaluations = records.filter(record => {
    return record.type === 'evaluation' && 
           record.createdAt.split('T')[0] === today
  })
  
  // 统计一小时内的评价次数
  const hourlyEvaluations = records.filter(record => {
    return record.type === 'evaluation' && 
           new Date(record.createdAt) >= oneHourAgo
  })
  
  if (todayEvaluations.length >= RISK_CONTROL_RULES.EVALUATION_FREQUENCY.MAX_PER_DAY) {
    return {
      isAnomaly: true,
      type: ANOMALY_TYPES.FREQUENCY_ABUSE,
      reason: `今日评价次数已达上限(${RISK_CONTROL_RULES.EVALUATION_FREQUENCY.MAX_PER_DAY}条)`,
      level: PUNISHMENT_LEVELS.WARNING
    }
  }
  
  if (hourlyEvaluations.length >= RISK_CONTROL_RULES.EVALUATION_FREQUENCY.MAX_PER_HOUR) {
    return {
      isAnomaly: true,
      type: ANOMALY_TYPES.FREQUENCY_ABUSE,
      reason: `一小时内评价次数已达上限(${RISK_CONTROL_RULES.EVALUATION_FREQUENCY.MAX_PER_HOUR}条)`,
      level: PUNISHMENT_LEVELS.WARNING
    }
  }
  
  return { isAnomaly: false }
}

// 检测评价内容异常
export function detectContentAnomaly(evaluation) {
  // 检测评分异常
  const scores = [
    evaluation.salarySettlement,
    evaluation.workingConditions,
    evaluation.managementRespect,
    evaluation.skillMatch,
    evaluation.workAttitude,
    evaluation.teamwork
  ].filter(score => score !== undefined)
  
  if (scores.length > 0) {
    const allLow = scores.every(score => score <= RISK_CONTROL_RULES.ANOMALY_THRESHOLD.MIN_SCORE)
    const allHigh = scores.every(score => score >= RISK_CONTROL_RULES.ANOMALY_THRESHOLD.MAX_SCORE)
    
    if (allLow) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.MALICIOUS_NEGATIVE,
        reason: '所有维度评分过低，疑似恶意差评',
        level: PUNISHMENT_LEVELS.REVOKE_BENEFITS
      }
    }
    
    if (allHigh) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.BATCH_SCORE,
        reason: '所有维度评分过高，疑似刷满分',
        level: PUNISHMENT_LEVELS.REVOKE_BENEFITS
      }
    }
  }
  
  // 检测评论长度异常
  if (evaluation.comment && evaluation.comment.length < RISK_CONTROL_RULES.ANOMALY_THRESHOLD.MIN_COMMENT_LENGTH) {
    return {
      isAnomaly: true,
      type: ANOMALY_TYPES.SIMILAR_COMMENTS,
      reason: '评论内容过短，疑似敷衍评价',
      level: PUNISHMENT_LEVELS.WARNING
    }
  }
  
  return { isAnomaly: false }
}

// 检测班组关联异常
export function detectTeamAnomaly(userId, teamId, factoryId) {
  // 检查是否有共事记录
  if (RISK_CONTROL_RULES.TEAM_LINKAGE.REQUIRE_WORK_HISTORY) {
    const workHistory = uni.getStorageSync('workHistory') || {}
    const userWorkHistory = workHistory[userId] || []
    const hasWorkHistory = userWorkHistory.some(record => 
      record.teamId === teamId && record.factoryId === factoryId
    )
    
    if (!hasWorkHistory) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.TEAM_VIOLATION,
        reason: '无共事记录，不符合评价条件',
        level: PUNISHMENT_LEVELS.WARNING
      }
    }
  }
  
  // 检查是否有审批通过的记账记录
  if (RISK_CONTROL_RULES.TEAM_LINKAGE.REQUIRE_APPROVED_LEDGER) {
    const ledgers = uni.getStorageSync('ledgers') || {}
    const userLedgers = ledgers[userId] || []
    const hasApprovedLedger = userLedgers.some(ledger => 
      ledger.teamId === teamId && 
      ledger.factoryId === factoryId && 
      ledger.status === 'approved'
    )
    
    if (!hasApprovedLedger) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.TEAM_VIOLATION,
        reason: '无审批通过的记账记录，不符合评价条件',
        level: PUNISHMENT_LEVELS.WARNING
      }
    }
  }
  
  // 检查是否实名认证
  if (RISK_CONTROL_RULES.TEAM_LINKAGE.REQUIRE_REAL_NAME) {
    const userInfo = uni.getStorageSync('userInfo') || {}
    if (!userInfo.isRealNameVerified) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.TEAM_VIOLATION,
        reason: '未完成实名认证，不符合评价条件',
        level: PUNISHMENT_LEVELS.WARNING
      }
    }
  }
  
  return { isAnomaly: false }
}

// 综合检测评价异常
export function detectEvaluationAnomaly(userId, evaluation, teamId, factoryId) {
  // 检测频率异常
  const frequencyAnomaly = detectFrequencyAnomaly(userId)
  if (frequencyAnomaly.isAnomaly) {
    return frequencyAnomaly
  }
  
  // 检测内容异常
  const contentAnomaly = detectContentAnomaly(evaluation)
  if (contentAnomaly.isAnomaly) {
    return contentAnomaly
  }
  
  // 检测班组关联异常
  const teamAnomaly = detectTeamAnomaly(userId, teamId, factoryId)
  if (teamAnomaly.isAnomaly) {
    return teamAnomaly
  }
  
  return { isAnomaly: false }
}

// 执行违规处理
export function executePunishment(userId, anomaly) {
  const userStatus = uni.getStorageSync('userStatus') || {}
  const user = userStatus[userId] || {
    id: userId,
    violations: 0,
    status: 'normal', // normal, warning, suspended, banned
    lastViolation: null
  }
  
  // 增加违规次数
  user.violations++
  user.lastViolation = new Date().toISOString()
  
  // 根据违规类型和次数执行不同处理
  switch (anomaly.level) {
    case PUNISHMENT_LEVELS.WARNING:
      user.status = 'warning'
      break
    
    case PUNISHMENT_LEVELS.REVOKE_BENEFITS:
      // 重置用户特权
      const { resetUserPrivileges } = require('./ledger-privileges')
      resetUserPrivileges(userId)
      user.status = 'warning'
      break
    
    case PUNISHMENT_LEVELS.SUSPEND_EVALUATION:
      // 暂停评价权限7天
      user.status = 'suspended'
      user.suspendUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      break
    
    case PUNISHMENT_LEVELS.BAN_ACCOUNT:
      user.status = 'banned'
      user.banUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 封禁30天
      break
  }
  
  // 保存用户状态
  userStatus[userId] = user
  uni.setStorageSync('userStatus', userStatus)
  
  // 记录风控处理
  saveRiskControlRecord({
    userId,
    type: 'punishment',
    anomalyType: anomaly.type,
    reason: anomaly.reason,
    punishmentLevel: anomaly.level,
    userStatus: user.status
  })
  
  return user
}

// 检查用户是否被封禁
export function checkUserStatus(userId) {
  const userStatus = uni.getStorageSync('userStatus') || {}
  const user = userStatus[userId] || {
    id: userId,
    violations: 0,
    status: 'normal',
    lastViolation: null
  }
  
  // 检查是否处于暂停期
  if (user.status === 'suspended' && user.suspendUntil) {
    const now = new Date()
    const suspendUntil = new Date(user.suspendUntil)
    if (now > suspendUntil) {
      // 暂停期已过，恢复正常状态
      user.status = 'normal'
      user.suspendUntil = null
      userStatus[userId] = user
      uni.setStorageSync('userStatus', userStatus)
    }
  }
  
  // 检查是否处于封禁期
  if (user.status === 'banned' && user.banUntil) {
    const now = new Date()
    const banUntil = new Date(user.banUntil)
    if (now > banUntil) {
      // 封禁期已过，恢复正常状态
      user.status = 'normal'
      user.banUntil = null
      userStatus[userId] = user
      uni.setStorageSync('userStatus', userStatus)
    }
  }
  
  return user
}

// 提交申诉
export function submitAppeal(userId, appealData) {
  const appeals = uni.getStorageSync('appeals') || []
  
  const newAppeal = {
    id: Date.now(),
    userId,
    type: appealData.type, // benefit, evaluation, account
    reason: appealData.reason,
    evidence: appealData.evidence || [],
    status: 'pending', // pending, approved, rejected
    submittedAt: new Date().toISOString(),
    processedAt: null,
    processorId: null,
    resultReason: null
  }
  
  appeals.push(newAppeal)
  uni.setStorageSync('appeals', appeals)
  
  // 记录申诉提交
  saveRiskControlRecord({
    userId,
    type: 'appeal_submitted',
    appealId: newAppeal.id,
    appealType: appealData.type
  })
  
  return newAppeal
}

// 处理申诉
export function processAppeal(appealId, approved, reason, processorId) {
  const appeals = uni.getStorageSync('appeals') || []
  const appealIndex = appeals.findIndex(appeal => appeal.id === appealId)
  
  if (appealIndex === -1) {
    return false
  }
  
  const appeal = appeals[appealIndex]
  appeal.status = approved ? 'approved' : 'rejected'
  appeal.processedAt = new Date().toISOString()
  appeal.processorId = processorId
  appeal.resultReason = reason
  
  appeals[appealIndex] = appeal
  uni.setStorageSync('appeals', appeals)
  
  // 如果申诉通过，恢复用户状态
  if (approved) {
    const userStatus = uni.getStorageSync('userStatus') || {}
    const user = userStatus[appeal.userId] || {}
    
    if (user.status === 'suspended' || user.status === 'banned') {
      user.status = 'normal'
      user.suspendUntil = null
      user.banUntil = null
      userStatus[appeal.userId] = user
      uni.setStorageSync('userStatus', userStatus)
    }
    
    // 恢复用户特权
    const { saveUserLedgerPrivileges } = require('./ledger-privileges')
    saveUserLedgerPrivileges(appeal.userId, {
      basic: true,
      // 其他特权需要根据实际情况恢复
    })
  }
  
  // 记录申诉处理
  saveRiskControlRecord({
    userId: appeal.userId,
    type: 'appeal_processed',
    appealId,
    approved,
    reason
  })
  
  return true
}

// 获取用户申诉记录
export function getUserAppeals(userId, limit = 20) {
  const appeals = uni.getStorageSync('appeals') || []
  const userAppeals = appeals.filter(appeal => appeal.userId === userId)
  
  // 按时间倒序排序
  userAppeals.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  
  return userAppeals.slice(0, limit)
}

// 检测账号关联异常
export function detectAccountLinkageAnomaly(userId, deviceId, ipAddress) {
  const deviceAccounts = uni.getStorageSync('deviceAccounts') || {}
  const ipAccounts = uni.getStorageSync('ipAccounts') || {}
  
  // 检查同一设备的账号数量
  const deviceUsers = deviceAccounts[deviceId] || []
  if (deviceUsers.length >= RISK_CONTROL_RULES.ACCOUNT_LINKAGE.SAME_DEVICE_THRESHOLD) {
    return {
      isAnomaly: true,
      type: ANOMALY_TYPES.SMALL_ACCOUNT,
      reason: `同一设备账号数量已达上限(${RISK_CONTROL_RULES.ACCOUNT_LINKAGE.SAME_DEVICE_THRESHOLD}个)`,
      level: PUNISHMENT_LEVELS.SUSPEND_EVALUATION
    }
  }
  
  // 检查同一IP的账号数量
  const ipUsers = ipAccounts[ipAddress] || []
  if (ipUsers.length >= RISK_CONTROL_RULES.ACCOUNT_LINKAGE.SAME_IP_THRESHOLD) {
    return {
      isAnomaly: true,
      type: ANOMALY_TYPES.SMALL_ACCOUNT,
      reason: `同一IP账号数量已达上限(${RISK_CONTROL_RULES.ACCOUNT_LINKAGE.SAME_IP_THRESHOLD}个)`,
      level: PUNISHMENT_LEVELS.SUSPEND_EVALUATION
    }
  }
  
  // 记录设备和IP关联
  if (!deviceUsers.includes(userId)) {
    deviceUsers.push(userId)
    deviceAccounts[deviceId] = deviceUsers
    uni.setStorageSync('deviceAccounts', deviceAccounts)
  }
  
  if (!ipUsers.includes(userId)) {
    ipUsers.push(userId)
    ipAccounts[ipAddress] = ipUsers
    uni.setStorageSync('ipAccounts', ipAccounts)
  }
  
  return { isAnomaly: false }
}

// 验证评价有效性
export function validateEvaluation(userId, evaluation, teamId, factoryId, deviceId = null, ipAddress = null) {
  // 检查用户状态
  const userStatus = checkUserStatus(userId)
  if (userStatus.status === 'suspended' || userStatus.status === 'banned') {
    return {
      valid: false,
      reason: `账号${userStatus.status === 'suspended' ? '暂停' : '封禁'}中，无法进行评价`,
      code: 'USER_STATUS_INVALID'
    }
  }
  
  // 检测账号关联异常
  if (deviceId && ipAddress) {
    const linkageAnomaly = detectAccountLinkageAnomaly(userId, deviceId, ipAddress)
    if (linkageAnomaly.isAnomaly) {
      executePunishment(userId, linkageAnomaly)
      return {
        valid: false,
        reason: linkageAnomaly.reason,
        code: 'ACCOUNT_LINKAGE_ANOMALY'
      }
    }
  }
  
  // 检测评价异常
  const anomaly = detectEvaluationAnomaly(userId, evaluation, teamId, factoryId)
  if (anomaly.isAnomaly) {
    executePunishment(userId, anomaly)
    return {
      valid: false,
      reason: anomaly.reason,
      code: 'EVALUATION_ANOMALY'
    }
  }
  
  // 记录正常评价
  saveRiskControlRecord({
    userId,
    type: 'evaluation',
    factoryId,
    teamId,
    evaluationId: evaluation.id || Date.now()
  })
  
  return { valid: true }
}

// 导出风控相关常量
export { RISK_CONTROL_RULES, ANOMALY_TYPES, PUNISHMENT_LEVELS }
