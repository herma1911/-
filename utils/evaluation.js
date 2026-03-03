// 评价管理工具

// 服装行业专属评价标签
const industryTags = {
  // 工厂评价员工的标签
  factoryToWorker: {
    skillMatch: [
      '车工熟练', '裁剪精准', '烫工平整', '上手快', '需培训'
    ],
    workAttitude: [
      '准时到岗', '服从调度', '不消极怠工', '加班积极', '请假少'
    ],
    teamwork: [
      '不抢活', '不挑活', '主动沟通', '配合组长', '不影响他人'
    ]
  },
  // 员工评价工厂的标签
  workerToFactory: {
    salarySettlement: [
      '日结准时', '周结准时', '月结准时', '工价透明', '不扣钱'
    ],
    workingConditions: [
      '环境干净', '食宿免费', '食宿与描述一致', '加班合理', '有空调/风扇'
    ],
    managementRespect: [
      '不骂人', '不随意扣钱', '尊重员工', '沟通顺畅', '有休息时间'
    ]
  }
}

// 获取用户权重
function getUserWeight(userLevel) {
  switch (userLevel) {
    case 'premium':
      return 1.5
    case 'normal':
      return 1.0
    case 'potential':
      return 0.5
    default:
      return 1.0
  }
}

// 获取工厂权重
function getFactoryWeight(factoryLevel) {
  switch (factoryLevel) {
    case 'premium':
      return 1.5
    case 'normal':
      return 1.0
    case 'potential':
      return 0.5
    default:
      return 1.0
  }
}

// 保存工厂评价
export function saveFactoryEvaluation(factoryId, evaluation) {
  // 获取现有评价
  let factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  
  // 如果该工厂还没有评价，初始化
  if (!factoryEvaluations[factoryId]) {
    factoryEvaluations[factoryId] = {
      totalEvaluations: 0,
      salaryOnTime: 0, // 发工资准时
      workStability: 0, // 活多稳定
      managementStandard: 0, // 管理规范
      weightedScore: 0, // 加权综合得分
      interviewEvaluations: [], // 面试评价
      interviewTotalEvaluations: 0,
      interviewExperience: 0, // 面试体验
      jobMatch: 0, // 岗位匹配
      reception: 0, // 工厂接待
      interviewWeightedScore: 0, // 面试评价加权得分
      evaluations: []
    }
  }
  
  // 获取用户权重
  const userWeight = getUserWeight(evaluation.userLevel || 'normal')
  
  // 更新评价数据
  const factoryEval = factoryEvaluations[factoryId]
  factoryEval.totalEvaluations++
  
  // 应用权重计算
  const weightedSalaryOnTime = evaluation.salaryOnTime * userWeight
  const weightedWorkStability = evaluation.workStability * userWeight
  const weightedManagementStandard = evaluation.managementStandard * userWeight
  
  factoryEval.salaryOnTime = ((factoryEval.salaryOnTime * (factoryEval.totalEvaluations - 1)) + weightedSalaryOnTime) / factoryEval.totalEvaluations
  factoryEval.workStability = ((factoryEval.workStability * (factoryEval.totalEvaluations - 1)) + weightedWorkStability) / factoryEval.totalEvaluations
  factoryEval.managementStandard = ((factoryEval.managementStandard * (factoryEval.totalEvaluations - 1)) + weightedManagementStandard) / factoryEval.totalEvaluations
  
  // 过滤掉路人评价后计算加权综合得分（发工资准时50%，活多稳定30%，管理规范20%）
  const validEntryEvaluations = factoryEval.evaluations.filter(item => item.evaluationType !== 'passerby')
  let entryScore = 0
  if (validEntryEvaluations.length > 0) {
    const totalSalaryOnTime = validEntryEvaluations.reduce((sum, item) => sum + (item.salaryOnTime || 0), 0)
    const totalWorkStability = validEntryEvaluations.reduce((sum, item) => sum + (item.workStability || 0), 0)
    const totalManagementStandard = validEntryEvaluations.reduce((sum, item) => sum + (item.managementStandard || 0), 0)
    
    const avgSalaryOnTime = totalSalaryOnTime / validEntryEvaluations.length
    const avgWorkStability = totalWorkStability / validEntryEvaluations.length
    const avgManagementStandard = totalManagementStandard / validEntryEvaluations.length
    
    entryScore = (avgSalaryOnTime * 0.5) + (avgWorkStability * 0.3) + (avgManagementStandard * 0.2)
  }
  
  // 过滤掉路人评价后计算面试评价得分
  const validInterviewEvaluations = (factoryEval.interviewEvaluations || []).filter(item => item.evaluationType !== 'passerby')
  let interviewScore = 0
  if (validInterviewEvaluations.length > 0) {
    const totalInterviewExperience = validInterviewEvaluations.reduce((sum, item) => sum + (item.interviewExperience || 0), 0)
    const totalJobMatch = validInterviewEvaluations.reduce((sum, item) => sum + (item.jobMatch || 0), 0)
    const totalReception = validInterviewEvaluations.reduce((sum, item) => sum + (item.reception || 0), 0)
    
    const avgInterviewExperience = totalInterviewExperience / validInterviewEvaluations.length
    const avgJobMatch = totalJobMatch / validInterviewEvaluations.length
    const avgReception = totalReception / validInterviewEvaluations.length
    
    interviewScore = (avgInterviewExperience + avgJobMatch + avgReception) / 3
  }
  
  // 计算综合评分（入职后评价×0.7 + 面试后评价×0.3）
  factoryEval.weightedScore = (entryScore * 0.7) + (interviewScore * 0.3)
  
  // 添加具体评价
  factoryEval.evaluations.push({
    id: Date.now(),
    evaluatorId: evaluation.evaluatorId, // 仅赫尔玛智能在特定场景下可见
    evaluatorName: evaluation.isAnonymous ? '匿名工人' : '员工', // 工厂端永远看不到具体姓名
    isAnonymous: evaluation.isAnonymous || false,
    salaryOnTime: evaluation.salaryOnTime,
    workStability: evaluation.workStability,
    managementStandard: evaluation.managementStandard,
    comment: evaluation.comment || '',
    reply: evaluation.reply || null, // 老板回复
    replyDate: evaluation.replyDate || null, // 回复日期
    appealStatus: 'none', // 申诉状态：none, appealing, approved, rejected
    appealReason: null, // 申诉理由
    appealDate: null, // 申诉日期
    isMalicious: false, // 是否恶意评价
    isDeleted: false, // 是否被删除
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluationType: evaluation.evaluationType || 'entry' // 入职后评价
  })
  
  // 保存回本地存储
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return factoryEval
}

// 保存面试评价
export function saveInterviewEvaluation(factoryId, evaluation) {
  // 获取现有评价
  let factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  
  // 如果该工厂还没有评价，初始化
  if (!factoryEvaluations[factoryId]) {
    factoryEvaluations[factoryId] = {
      totalEvaluations: 0,
      salaryOnTime: 0, // 发工资准时
      workStability: 0, // 活多稳定
      managementStandard: 0, // 管理规范
      weightedScore: 0, // 加权综合得分
      interviewEvaluations: [], // 面试评价
      interviewTotalEvaluations: 0,
      interviewExperience: 0, // 面试体验
      jobMatch: 0, // 岗位匹配
      reception: 0, // 工厂接待
      interviewWeightedScore: 0, // 面试评价加权得分
      evaluations: []
    }
  }
  
  // 获取用户权重
  const userWeight = getUserWeight(evaluation.userLevel || 'normal')
  
  // 更新面试评价数据
  const factoryEval = factoryEvaluations[factoryId]
  factoryEval.interviewTotalEvaluations++
  
  // 应用权重计算
  const weightedInterviewExperience = evaluation.interviewExperience * userWeight
  const weightedJobMatch = evaluation.jobMatch * userWeight
  const weightedReception = evaluation.reception * userWeight
  
  factoryEval.interviewExperience = ((factoryEval.interviewExperience * (factoryEval.interviewTotalEvaluations - 1)) + weightedInterviewExperience) / factoryEval.interviewTotalEvaluations
  factoryEval.jobMatch = ((factoryEval.jobMatch * (factoryEval.interviewTotalEvaluations - 1)) + weightedJobMatch) / factoryEval.interviewTotalEvaluations
  factoryEval.reception = ((factoryEval.reception * (factoryEval.interviewTotalEvaluations - 1)) + weightedReception) / factoryEval.interviewTotalEvaluations
  
  // 过滤掉路人评价后计算面试评价加权得分（三个维度各占33.33%）
  const validInterviewEvaluations = (factoryEval.interviewEvaluations || []).filter(item => item.evaluationType !== 'passerby')
  let interviewWeightedScore = 0
  if (validInterviewEvaluations.length > 0) {
    const totalInterviewExperience = validInterviewEvaluations.reduce((sum, item) => sum + (item.interviewExperience || 0), 0)
    const totalJobMatch = validInterviewEvaluations.reduce((sum, item) => sum + (item.jobMatch || 0), 0)
    const totalReception = validInterviewEvaluations.reduce((sum, item) => sum + (item.reception || 0), 0)
    
    const avgInterviewExperience = totalInterviewExperience / validInterviewEvaluations.length
    const avgJobMatch = totalJobMatch / validInterviewEvaluations.length
    const avgReception = totalReception / validInterviewEvaluations.length
    
    interviewWeightedScore = (avgInterviewExperience + avgJobMatch + avgReception) / 3
  }
  factoryEval.interviewWeightedScore = interviewWeightedScore
  
  // 过滤掉路人评价后计算入职后评价得分
  const validEntryEvaluations = factoryEval.evaluations.filter(item => item.evaluationType !== 'passerby')
  let entryScore = 0
  if (validEntryEvaluations.length > 0) {
    const totalSalaryOnTime = validEntryEvaluations.reduce((sum, item) => sum + (item.salaryOnTime || 0), 0)
    const totalWorkStability = validEntryEvaluations.reduce((sum, item) => sum + (item.workStability || 0), 0)
    const totalManagementStandard = validEntryEvaluations.reduce((sum, item) => sum + (item.managementStandard || 0), 0)
    
    const avgSalaryOnTime = totalSalaryOnTime / validEntryEvaluations.length
    const avgWorkStability = totalWorkStability / validEntryEvaluations.length
    const avgManagementStandard = totalManagementStandard / validEntryEvaluations.length
    
    entryScore = (avgSalaryOnTime * 0.5) + (avgWorkStability * 0.3) + (avgManagementStandard * 0.2)
  }
  
  // 重新计算综合评分（入职后评价×0.7 + 面试后评价×0.3）
  factoryEval.weightedScore = (entryScore * 0.7) + (interviewWeightedScore * 0.3)
  
  // 添加具体面试评价
  factoryEval.interviewEvaluations.push({
    id: Date.now(),
    evaluatorId: evaluation.evaluatorId, // 仅赫尔玛智能在特定场景下可见
    evaluatorName: evaluation.isAnonymous ? '匿名工人' : '员工', // 工厂端永远看不到具体姓名
    isAnonymous: evaluation.isAnonymous || false,
    interviewExperience: evaluation.interviewExperience,
    jobMatch: evaluation.jobMatch,
    reception: evaluation.reception,
    comment: evaluation.comment || '',
    reply: evaluation.reply || null, // 老板回复
    replyDate: evaluation.replyDate || null, // 回复日期
    appealStatus: 'none', // 申诉状态：none, appealing, approved, rejected
    appealReason: null, // 申诉理由
    appealDate: null, // 申诉日期
    isMalicious: false, // 是否恶意评价
    isDeleted: false, // 是否被删除
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluationType: 'interview' // 面试评价
  })
  
  // 保存回本地存储
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return factoryEval
}

// 检查用户是否已经提交过面试评价
export function hasUserSubmittedInterviewEvaluation(userId, factoryId) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId] || !factoryEvaluations[factoryId].interviewEvaluations) return false
  
  return factoryEvaluations[factoryId].interviewEvaluations.some(evaluation => evaluation.evaluatorId === userId)
}

// 检查用户是否已关闭面试评价弹窗
export function hasUserClosedInterviewEvaluation(factoryId) {
  const closedEvaluations = uni.getStorageSync('closedInterviewEvaluations') || {}
  return closedEvaluations[factoryId] && closedEvaluations[factoryId] > Date.now() - 24 * 60 * 60 * 1000
}

// 标记用户已关闭面试评价弹窗
export function markInterviewEvaluationClosed(factoryId) {
  const closedEvaluations = uni.getStorageSync('closedInterviewEvaluations') || {}
  closedEvaluations[factoryId] = Date.now()
  uni.setStorageSync('closedInterviewEvaluations', closedEvaluations)
}

// 获取工厂评价
export function getFactoryEvaluation(factoryId) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const factoryEval = factoryEvaluations[factoryId] || null
  
  if (factoryEval) {
    // 过滤掉已删除的评价
    factoryEval.evaluations = factoryEval.evaluations.filter(evaluation => !evaluation.isDeleted)
  }
  
  return factoryEval
}

// 保存员工评价
export function saveWorkerEvaluation(workerId, evaluation) {
  // 获取现有评价
  let workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  
  // 如果该员工还没有评价，初始化
  if (!workerEvaluations[workerId]) {
    workerEvaluations[workerId] = {
      totalEvaluations: 0,
      skillMatch: 0, // 技能匹配度
      workAttitude: 0, // 工作态度
      teamwork: 0, // 团队协作
      weightedScore: 0, // 加权综合得分
      evaluations: []
    }
  }
  
  // 获取工厂权重
  const factoryWeight = getFactoryWeight(evaluation.factoryLevel || 'normal')
  
  // 更新评价数据
  const workerEval = workerEvaluations[workerId]
  workerEval.totalEvaluations++
  
  // 应用权重计算
  const weightedSkillMatch = evaluation.skillMatch * factoryWeight
  const weightedWorkAttitude = evaluation.workAttitude * factoryWeight
  const weightedTeamwork = evaluation.teamwork * factoryWeight
  
  workerEval.skillMatch = ((workerEval.skillMatch * (workerEval.totalEvaluations - 1)) + weightedSkillMatch) / workerEval.totalEvaluations
  workerEval.workAttitude = ((workerEval.workAttitude * (workerEval.totalEvaluations - 1)) + weightedWorkAttitude) / workerEval.totalEvaluations
  workerEval.teamwork = ((workerEval.teamwork * (workerEval.totalEvaluations - 1)) + weightedTeamwork) / workerEval.totalEvaluations
  
  // 计算加权综合得分（技能匹配度40%，工作态度30%，团队协作30%）
  workerEval.weightedScore = (workerEval.skillMatch * 0.4) + (workerEval.workAttitude * 0.3) + (workerEval.teamwork * 0.3)
  
  // 添加具体评价
  workerEval.evaluations.push({
    id: Date.now(),
    evaluatorId: evaluation.evaluatorId,
    evaluatorName: evaluation.evaluatorPosition || '本厂评价', // 只显示岗位，不显示具体姓名
    factoryId: evaluation.factoryId, // 工厂ID
    skillMatch: evaluation.skillMatch,
    workAttitude: evaluation.workAttitude,
    teamwork: evaluation.teamwork,
    comment: evaluation.comment || '',
    tags: evaluation.tags || [], // 评价标签
    evaluationDate: new Date().toISOString().split('T')[0]
  })
  
  // 保存回本地存储
  uni.setStorageSync('workerEvaluations', workerEvaluations)
  return workerEval
}

// 获取员工评价
export function getWorkerEvaluation(workerId) {
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  return workerEvaluations[workerId] || null
}

// 检查用户是否已经评价过
export function hasUserEvaluatedFactory(userId, factoryId) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  return factoryEvaluations[factoryId].evaluations.some(evaluation => evaluation.evaluatorId === userId)
}

// 检查工厂是否已经评价过员工（同一工厂只能评价一次）
export function hasFactoryEvaluatedWorker(factoryId, workerId) {
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  if (!workerEvaluations[workerId]) return false
  
  return workerEvaluations[workerId].evaluations.some(evaluation => evaluation.factoryId === factoryId)
}

// 检查用户是否已经评价过员工（单个用户层面的检查）
export function hasUserEvaluatedWorker(userId, workerId) {
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  if (!workerEvaluations[workerId]) return false
  
  return workerEvaluations[workerId].evaluations.some(evaluation => evaluation.evaluatorId === userId)
}

// 添加工厂评价申诉
export function appealFactoryEvaluation(factoryId, evaluationId, reason) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  const evaluation = factoryEvaluations[factoryId].evaluations.find(item => item.id === evaluationId)
  if (!evaluation) return false
  
  evaluation.appealStatus = 'appealing'
  evaluation.appealReason = reason
  evaluation.appealDate = new Date().toISOString().split('T')[0]
  
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return true
}

// 处理评价申诉
export function handleEvaluationAppeal(factoryId, evaluationId, approved, adminReason) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  const evaluation = factoryEvaluations[factoryId].evaluations.find(item => item.id === evaluationId)
  if (!evaluation) return false
  
  evaluation.appealStatus = approved ? 'approved' : 'rejected'
  evaluation.adminReason = adminReason
  
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return true
}

// 标记并删除恶意评价
export function markAsMaliciousAndDelete(factoryId, evaluationId, reason) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  const evaluationIndex = factoryEvaluations[factoryId].evaluations.findIndex(item => item.id === evaluationId)
  if (evaluationIndex === -1) return false
  
  const evaluation = factoryEvaluations[factoryId].evaluations[evaluationIndex]
  evaluation.isMalicious = true
  evaluation.maliciousReason = reason
  
  // 从评价列表中删除
  factoryEvaluations[factoryId].evaluations.splice(evaluationIndex, 1)
  factoryEvaluations[factoryId].totalEvaluations--
  
  // 重新计算评分
  if (factoryEvaluations[factoryId].totalEvaluations > 0) {
    const remainingEvaluations = factoryEvaluations[factoryId].evaluations
    factoryEvaluations[factoryId].salaryOnTime = remainingEvaluations.reduce((sum, item) => sum + (item.salaryOnTime || 0), 0) / factoryEvaluations[factoryId].totalEvaluations
    factoryEvaluations[factoryId].workStability = remainingEvaluations.reduce((sum, item) => sum + (item.workStability || 0), 0) / factoryEvaluations[factoryId].totalEvaluations
    factoryEvaluations[factoryId].managementStandard = remainingEvaluations.reduce((sum, item) => sum + (item.managementStandard || 0), 0) / factoryEvaluations[factoryId].totalEvaluations
    // 重新计算综合得分
    factoryEvaluations[factoryId].weightedScore = (factoryEvaluations[factoryId].salaryOnTime + factoryEvaluations[factoryId].workStability + factoryEvaluations[factoryId].managementStandard) / 3
  } else {
    // 如果没有评价了，重置评分
    factoryEvaluations[factoryId].salaryOnTime = 0
    factoryEvaluations[factoryId].workStability = 0
    factoryEvaluations[factoryId].managementStandard = 0
    factoryEvaluations[factoryId].weightedScore = 0
  }
  
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return true
}

// 获取所有工厂评价（用于管理）
export function getAllFactoryEvaluations() {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const allEvaluations = []
  
  Object.keys(factoryEvaluations).forEach(factoryId => {
    const factoryEval = factoryEvaluations[factoryId]
    factoryEval.evaluations.forEach(evaluation => {
      allEvaluations.push({
        ...evaluation,
        factoryId,
        factoryName: factoryId // 这里应该从其他地方获取工厂名称，暂时使用factoryId
      })
    })
  })
  
  // 按评价日期排序（最新的在前）
  allEvaluations.sort((a, b) => {
    const dateA = new Date(a.evaluationDate)
    const dateB = new Date(b.evaluationDate)
    return dateB - dateA
  })
  
  return allEvaluations
}

// 回复评价
export function replyToEvaluation(factoryId, evaluationId, reply) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  const evaluation = factoryEvaluations[factoryId].evaluations.find(item => item.id === evaluationId)
  if (!evaluation) return false
  
  evaluation.reply = reply
  evaluation.replyDate = new Date().toISOString().split('T')[0]
  
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return true
}

// 删除评价（员工删除自己的评价）
export function deleteEvaluation(factoryId, evaluationId, userId) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  const evaluation = factoryEvaluations[factoryId].evaluations.find(item => item.id === evaluationId)
  if (!evaluation || evaluation.evaluatorId !== userId) return false
  
  // 标记为已删除（赫尔玛智能合规审计留存）
  evaluation.isDeleted = true
  
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return true
}

// 工厂删除评价（只能删除路人评价）
export function factoryDeleteEvaluation(factoryId, evaluationId) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  if (!factoryEvaluations[factoryId]) return false
  
  const evaluation = factoryEvaluations[factoryId].evaluations.find(item => item.id === evaluationId)
  if (!evaluation) return false
  
  // 检查评价类型，只有路人评价可以被删除
  if (evaluation.evaluationType !== 'passerby') {
    return false // 有效评价（面试后评价和入职后评价）不能被删除
  }
  
  // 标记为已删除（赫尔玛智能合规审计留存）
  evaluation.isDeleted = true
  
  uni.setStorageSync('factoryEvaluations', factoryEvaluations)
  return true
}

// 获取员工的评价列表
export function getWorkerEvaluations(userId) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const workerEvaluations = []
  
  Object.keys(factoryEvaluations).forEach(factoryId => {
    const factoryEval = factoryEvaluations[factoryId]
    factoryEval.evaluations.forEach(evaluation => {
      if (evaluation.evaluatorId === userId) {
        workerEvaluations.push({
          ...evaluation,
          factoryId
        })
      }
    })
  })
  
  // 按评价日期排序（最新的在前）
  workerEvaluations.sort((a, b) => {
    const dateA = new Date(a.evaluationDate)
    const dateB = new Date(b.evaluationDate)
    return dateB - dateA
  })
  
  return workerEvaluations
}

// 保存工友评价
export function savePeerEvaluation(peerId, evaluation) {
  // 获取现有评价
  let peerEvaluations = uni.getStorageSync('peerEvaluations') || {}
  
  // 如果该工友还没有评价，初始化
  if (!peerEvaluations[peerId]) {
    peerEvaluations[peerId] = []
  }
  
  // 添加具体评价
  peerEvaluations[peerId].push({
    id: Date.now(),
    evaluatorId: evaluation.evaluatorId,
    evaluatorName: evaluation.evaluatorName,
    skillLevel: evaluation.skillLevel,
    workAttitude: evaluation.workAttitude,
    teamwork: evaluation.teamwork,
    reliability: evaluation.reliability,
    overallScore: evaluation.overallScore,
    comment: evaluation.comment || '',
    tags: evaluation.tags || [],
    evaluationDate: new Date().toISOString().split('T')[0]
  })
  
  // 保存回本地存储
  uni.setStorageSync('peerEvaluations', peerEvaluations)
  return peerEvaluations[peerId]
}

// 获取工友评价
export function getPeerEvaluation(peerId) {
  const peerEvaluations = uni.getStorageSync('peerEvaluations') || {}
  return peerEvaluations[peerId] || []
}

// 保存记账背书评价
export function saveLedgerEvaluation(workerId, evaluation) {
  // 获取现有评价
  let ledgerEvaluations = uni.getStorageSync('ledgerEvaluations') || {}
  
  // 如果该工人还没有记账背书评价，初始化
  if (!ledgerEvaluations[workerId]) {
    ledgerEvaluations[workerId] = []
  }
  
  // 添加具体评价
  ledgerEvaluations[workerId].push({
    id: Date.now(),
    evaluatorId: evaluation.evaluatorId,
    evaluatorName: evaluation.evaluatorName,
    accuracy: evaluation.accuracy,
    timeliness: evaluation.timeliness,
    completeness: evaluation.completeness,
    standardization: evaluation.standardization,
    overallScore: evaluation.overallScore,
    comment: evaluation.comment || '',
    tags: evaluation.tags || [],
    ledgerStats: evaluation.ledgerStats || {},
    evaluationDate: new Date().toISOString().split('T')[0]
  })
  
  // 保存回本地存储
  uni.setStorageSync('ledgerEvaluations', ledgerEvaluations)
  return ledgerEvaluations[workerId]
}

// 获取记账背书评价
export function getLedgerEvaluation(workerId) {
  const ledgerEvaluations = uni.getStorageSync('ledgerEvaluations') || {}
  return ledgerEvaluations[workerId] || []
}

// 获取服装行业专属标签
export function getIndustryTags(type) {
  if (type === 'factoryToWorker') {
    return industryTags.factoryToWorker
  } else if (type === 'workerToFactory') {
    return industryTags.workerToFactory
  }
  return {}
}

// 评价激励机制

// 记录员工评价工厂的次数
export function recordWorkerEvaluationCount(userId, factoryId) {
  const evaluationCounts = uni.getStorageSync('evaluationCounts') || {
    workerEvaluations: {},
    factoryEvaluations: {}
  }
  
  // 初始化员工评价记录
  if (!evaluationCounts.workerEvaluations[userId]) {
    evaluationCounts.workerEvaluations[userId] = {
      total: 0,
      monthly: 0,
      lastReset: new Date().toISOString().split('T')[0].slice(0, 7) // YYYY-MM
    }
  }
  
  const workerEval = evaluationCounts.workerEvaluations[userId]
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7)
  
  // 重置月度计数（如果是新月份）
  if (workerEval.lastReset !== currentMonth) {
    workerEval.monthly = 0
    workerEval.lastReset = currentMonth
  }
  
  // 增加计数
  workerEval.total++
  workerEval.monthly++
  
  // 保存回本地存储
  uni.setStorageSync('evaluationCounts', evaluationCounts)
  return workerEval
}

// 记录工厂评价员工的次数
export function recordFactoryEvaluationCount(factoryId, workerId) {
  const evaluationCounts = uni.getStorageSync('evaluationCounts') || {
    workerEvaluations: {},
    factoryEvaluations: {}
  }
  
  // 初始化工厂评价记录
  if (!evaluationCounts.factoryEvaluations[factoryId]) {
    evaluationCounts.factoryEvaluations[factoryId] = {
      total: 0,
      monthly: 0,
      lastReset: new Date().toISOString().split('T')[0].slice(0, 7) // YYYY-MM
    }
  }
  
  const factoryEval = evaluationCounts.factoryEvaluations[factoryId]
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7)
  
  // 重置月度计数（如果是新月份）
  if (factoryEval.lastReset !== currentMonth) {
    factoryEval.monthly = 0
    factoryEval.lastReset = currentMonth
  }
  
  // 增加计数
  factoryEval.total++
  factoryEval.monthly++
  
  // 保存回本地存储
  uni.setStorageSync('evaluationCounts', evaluationCounts)
  return factoryEval
}

// 发放员工评价激励
export function rewardWorkerEvaluation(userId, userLevel) {
  const evaluationCounts = uni.getStorageSync('evaluationCounts') || {
    workerEvaluations: {},
    factoryEvaluations: {}
  }
  
  const workerEval = evaluationCounts.workerEvaluations[userId] || {
    total: 0,
    monthly: 0
  }
  
  const rewards = {
    immediate: [],
    monthly: []
  }
  
  // 即时奖励：评价1家工厂
  rewards.immediate.push({
    type: 'resumeTop',
    duration: 3, // 3天
    description: '3天简历置顶权益'
  })
  
  rewards.immediate.push({
    type: 'points',
    amount: 50,
    description: '50平台积分'
  })
  
  // 优质用户额外奖励
  if (userLevel === 'premium') {
    rewards.immediate.push({
      type: 'priorityPush',
      amount: 1,
      description: '1份优质工厂岗位优先推送权益'
    })
  }
  
  // 月度累计奖励：评价3家及以上
  if (workerEval.monthly >= 3) {
    rewards.monthly.push({
      type: 'resumeTop',
      duration: 10,
      description: '10天简历置顶权益'
    })
    
    rewards.monthly.push({
      type: 'points',
      amount: 100,
      description: '100平台积分'
    })
  }
  
  // 发放奖励（这里只是返回奖励信息，实际发放需要在前端处理）
  return rewards
}

// 发放工厂评价激励
export function rewardFactoryEvaluation(factoryId, factoryLevel) {
  const evaluationCounts = uni.getStorageSync('evaluationCounts') || {
    workerEvaluations: {},
    factoryEvaluations: {}
  }
  
  const factoryEval = evaluationCounts.factoryEvaluations[factoryId] || {
    total: 0,
    monthly: 0
  }
  
  const rewards = {
    immediate: [],
    monthly: []
  }
  
  // 即时奖励：评价1名员工
  rewards.immediate.push({
    type: 'resumeUnlock',
    amount: 2,
    description: '2份通用简历解锁权限'
  })
  
  // 优质工厂额外奖励
  if (factoryLevel === 'premium') {
    rewards.immediate.push({
      type: 'premiumResumeUnlock',
      amount: 1,
      description: '1份优质用户专属解锁权限'
    })
  }
  
  // 月度累计奖励：评价5名及以上
  if (factoryEval.monthly >= 5) {
    rewards.monthly.push({
      type: 'resumeUnlock',
      amount: 10,
      description: '10份通用简历解锁权限'
    })
  }
  
  // 发放奖励（这里只是返回奖励信息，实际发放需要在前端处理）
  return rewards
}

// 评价审核机制

// 敏感词列表
const sensitiveWords = [
  '垃圾', '骗子', '黑心', '坑人', '倒闭', '破产',
  '滚蛋', '傻逼', '脑残', '废物', '垃圾厂', '黑厂'
]

// 检测恶意评价
export function detectMaliciousEvaluation(evaluation) {
  const maliciousPatterns = {
    // 恶意差评模式
    negative: [
      // 全是差评
      () => {
        const scores = [
          evaluation.salaryOnTime || evaluation.salarySettlement || evaluation.skillMatch,
          evaluation.workStability || evaluation.workingConditions || evaluation.workAttitude,
          evaluation.managementStandard || evaluation.managementRespect || evaluation.teamwork
        ].filter(score => score !== undefined)
        return scores.length > 0 && scores.every(score => score <= 1)
      },
      // 包含敏感词
      () => {
        const comment = evaluation.comment || ''
        return sensitiveWords.some(word => comment.includes(word))
      },
      // 内容空泛
      () => {
        const comment = evaluation.comment || ''
        return comment.length < 10 && comment.length > 0
      }
    ],
    // 刷好评模式
    positive: [
      // 全是好评
      () => {
        const scores = [
          evaluation.salaryOnTime || evaluation.salarySettlement || evaluation.skillMatch,
          evaluation.workStability || evaluation.workingConditions || evaluation.workAttitude,
          evaluation.managementStandard || evaluation.managementRespect || evaluation.teamwork
        ].filter(score => score !== undefined)
        return scores.length > 0 && scores.every(score => score >= 4.5)
      },
      // 内容空泛
      () => {
        const comment = evaluation.comment || ''
        return comment.length < 10 && comment.length > 0
      }
    ]
  }
  
  // 检测恶意差评
  const isMaliciousNegative = maliciousPatterns.negative.some(pattern => pattern())
  
  // 检测刷好评
  const isMaliciousPositive = maliciousPatterns.positive.some(pattern => pattern())
  
  if (isMaliciousNegative) {
    return { isMalicious: true, type: 'negative', reason: '恶意差评' }
  }
  
  if (isMaliciousPositive) {
    return { isMalicious: true, type: 'positive', reason: '刷好评' }
  }
  
  return { isMalicious: false, type: 'normal', reason: '正常评价' }
}

// AI自动审核
export function aiAutoAudit(evaluation) {
  // 检测恶意评价
  const detectionResult = detectMaliciousEvaluation(evaluation)
  
  if (detectionResult.isMalicious) {
    return {
      approved: false,
      reason: detectionResult.reason,
      level: 'blocked' // blocked: 直接拦截, suspected: 疑似恶意需要人工审核
    }
  }
  
  // 检查评价频率（简单实现：检查最近24小时内的评价次数）
  const recentEvaluations = getRecentEvaluations(evaluation.evaluatorId, 24)
  if (recentEvaluations.length >= 3) {
    return {
      approved: false,
      reason: '短时间内评价次数过多',
      level: 'suspected'
    }
  }
  
  return {
    approved: true,
    reason: '正常评价',
    level: 'approved'
  }
}

// 获取最近一段时间内的评价
function getRecentEvaluations(evaluatorId, hours) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  const recentEvaluations = []
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - hours)
  
  // 检查工厂评价
  Object.keys(factoryEvaluations).forEach(factoryId => {
    const factoryEval = factoryEvaluations[factoryId]
    factoryEval.evaluations.forEach(evaluation => {
      if (evaluation.evaluatorId === evaluatorId) {
        const evalTime = new Date(evaluation.evaluationDate)
        if (evalTime >= cutoffTime) {
          recentEvaluations.push(evaluation)
        }
      }
    })
  })
  
  // 检查员工评价
  Object.keys(workerEvaluations).forEach(workerId => {
    const workerEval = workerEvaluations[workerId]
    workerEval.evaluations.forEach(evaluation => {
      if (evaluation.evaluatorId === evaluatorId) {
        const evalTime = new Date(evaluation.evaluationDate)
        if (evalTime >= cutoffTime) {
          recentEvaluations.push(evaluation)
        }
      }
    })
  })
  
  return recentEvaluations
}

// 人工审核评价
export function manualAudit(evaluationId, evaluationType, approved, reason) {
  let evaluations
  let storageKey
  
  if (evaluationType === 'factory') {
    evaluations = uni.getStorageSync('factoryEvaluations') || {}
    storageKey = 'factoryEvaluations'
  } else if (evaluationType === 'worker') {
    evaluations = uni.getStorageSync('workerEvaluations') || {}
    storageKey = 'workerEvaluations'
  } else {
    return false
  }
  
  // 查找评价
  let found = false
  Object.keys(evaluations).forEach(key => {
    const evalItem = evaluations[key]
    const evaluation = evalItem.evaluations.find(item => item.id === evaluationId)
    if (evaluation) {
      evaluation.auditStatus = approved ? 'approved' : 'rejected'
      evaluation.auditReason = reason
      evaluation.auditDate = new Date().toISOString().split('T')[0]
      if (!approved) {
        evaluation.isMalicious = true
        evaluation.maliciousReason = reason
      }
      found = true
    }
  })
  
  if (found) {
    uni.setStorageSync(storageKey, evaluations)
    return true
  }
  
  return false
}

// 提交评价申诉
export function submitEvaluationAppeal(evaluationId, evaluationType, reason, evidence) {
  let evaluations
  let storageKey
  
  if (evaluationType === 'factory') {
    evaluations = uni.getStorageSync('factoryEvaluations') || {}
    storageKey = 'factoryEvaluations'
  } else if (evaluationType === 'worker') {
    evaluations = uni.getStorageSync('workerEvaluations') || {}
    storageKey = 'workerEvaluations'
  } else {
    return false
  }
  
  // 查找评价
  let found = false
  Object.keys(evaluations).forEach(key => {
    const evalItem = evaluations[key]
    const evaluation = evalItem.evaluations.find(item => item.id === evaluationId)
    if (evaluation) {
      evaluation.appealStatus = 'appealing'
      evaluation.appealReason = reason
      evaluation.appealEvidence = evidence
      evaluation.appealDate = new Date().toISOString().split('T')[0]
      found = true
    }
  })
  
  if (found) {
    uni.setStorageSync(storageKey, evaluations)
    return true
  }
  
  return false
}

// 处理评价申诉
export function handleAppeal(evaluationId, evaluationType, approved, reason) {
  let evaluations
  let storageKey
  
  if (evaluationType === 'factory') {
    evaluations = uni.getStorageSync('factoryEvaluations') || {}
    storageKey = 'factoryEvaluations'
  } else if (evaluationType === 'worker') {
    evaluations = uni.getStorageSync('workerEvaluations') || {}
    storageKey = 'workerEvaluations'
  } else {
    return false
  }
  
  // 查找评价
  let found = false
  Object.keys(evaluations).forEach(key => {
    const evalItem = evaluations[key]
    const evaluation = evalItem.evaluations.find(item => item.id === evaluationId)
    if (evaluation) {
      evaluation.appealStatus = approved ? 'approved' : 'rejected'
      evaluation.appealResultReason = reason
      evaluation.appealResultDate = new Date().toISOString().split('T')[0]
      if (approved) {
        evaluation.isMalicious = false
        evaluation.maliciousReason = null
        evaluation.auditStatus = 'approved'
      }
      found = true
    }
  })
  
  if (found) {
    uni.setStorageSync(storageKey, evaluations)
    return true
  }
  
  return false
}

// 获取恶意评价统计数据
export function getMaliciousEvaluationStats(days = 7) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  const stats = {
    total: 0,
    negative: 0,
    positive: 0,
    processed: 0,
    pending: 0
  }
  
  const cutoffTime = new Date()
  cutoffTime.setDate(cutoffTime.getDate() - days)
  
  // 统计工厂评价
  Object.keys(factoryEvaluations).forEach(factoryId => {
    const factoryEval = factoryEvaluations[factoryId]
    factoryEval.evaluations.forEach(evaluation => {
      const evalTime = new Date(evaluation.evaluationDate)
      if (evalTime >= cutoffTime && evaluation.isMalicious) {
        stats.total++
        if (evaluation.maliciousReason && evaluation.maliciousReason.includes('恶意差评')) {
          stats.negative++
        } else if (evaluation.maliciousReason && evaluation.maliciousReason.includes('刷好评')) {
          stats.positive++
        }
        if (evaluation.auditStatus) {
          stats.processed++
        } else {
          stats.pending++
        }
      }
    })
  })
  
  // 统计员工评价
  Object.keys(workerEvaluations).forEach(workerId => {
    const workerEval = workerEvaluations[workerId]
    workerEval.evaluations.forEach(evaluation => {
      const evalTime = new Date(evaluation.evaluationDate)
      if (evalTime >= cutoffTime && evaluation.isMalicious) {
        stats.total++
        if (evaluation.maliciousReason && evaluation.maliciousReason.includes('恶意差评')) {
          stats.negative++
        } else if (evaluation.maliciousReason && evaluation.maliciousReason.includes('刷好评')) {
          stats.positive++
        }
        if (evaluation.auditStatus) {
          stats.processed++
        } else {
          stats.pending++
        }
      }
    })
  })
  
  return stats
}

// 评价系统与用户/工厂分层体系联动

// 检查员工是否符合升级优质用户条件
export function checkWorkerPremiumEligibility(workerId) {
  const workerEval = getWorkerEvaluation(workerId)
  if (!workerEval || workerEval.totalEvaluations < 1) {
    return false
  }
  
  // 综合评价得分≥4.2星
  return workerEval.weightedScore >= 4.2
}

// 检查工厂是否符合升级优质工厂条件
export function checkFactoryPremiumEligibility(factoryId) {
  const factoryEval = getFactoryEvaluation(factoryId)
  if (!factoryEval || factoryEval.totalEvaluations < 1) {
    return false
  }
  
  // 综合评价得分≥4.2星
  return factoryEval.weightedScore >= 4.2
}

// 检查员工是否需要降级
export function checkWorkerDemotion(workerId) {
  const workerEval = getWorkerEvaluation(workerId)
  if (!workerEval || workerEval.totalEvaluations < 1) {
    return false
  }
  
  // 综合评价得分连续3个月低于3.5星
  // 这里简化实现，只检查当前得分
  return workerEval.weightedScore < 3.5
}

// 检查工厂是否需要降级
export function checkFactoryDemotion(factoryId) {
  const factoryEval = getFactoryEvaluation(factoryId)
  if (!factoryEval || factoryEval.totalEvaluations < 1) {
    return false
  }
  
  // 综合评价得分连续3个月低于3.5星
  // 这里简化实现，只检查当前得分
  return factoryEval.weightedScore < 3.5
}

// 获取用户/工厂的评价等级
export function getEvaluationLevel(score) {
  if (score >= 4.5) {
    return 'excellent'
  } else if (score >= 4.0) {
    return 'good'
  } else if (score >= 3.5) {
    return 'average'
  } else if (score >= 3.0) {
    return 'below_average'
  } else {
    return 'poor'
  }
}

// 评价系统与拉新数据看板联动

// 获取评价参与率
export function getEvaluationParticipationRate(days = 30) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  const evaluationCounts = uni.getStorageSync('evaluationCounts') || {
    workerEvaluations: {},
    factoryEvaluations: {}
  }
  
  const cutoffTime = new Date()
  cutoffTime.setDate(cutoffTime.getDate() - days)
  
  // 统计员工评价参与数
  let workerEvaluationCount = 0
  Object.keys(factoryEvaluations).forEach(factoryId => {
    const factoryEval = factoryEvaluations[factoryId]
    factoryEval.evaluations.forEach(evaluation => {
      const evalTime = new Date(evaluation.evaluationDate)
      if (evalTime >= cutoffTime) {
        workerEvaluationCount++
      }
    })
  })
  
  // 统计工厂评价参与数
  let factoryEvaluationCount = 0
  Object.keys(workerEvaluations).forEach(workerId => {
    const workerEval = workerEvaluations[workerId]
    workerEval.evaluations.forEach(evaluation => {
      const evalTime = new Date(evaluation.evaluationDate)
      if (evalTime >= cutoffTime) {
        factoryEvaluationCount++
      }
    })
  })
  
  // 假设总用户数和总工厂数（实际应该从用户系统获取）
  const totalWorkers = Object.keys(evaluationCounts.workerEvaluations || {}).length || 100
  const totalFactories = Object.keys(evaluationCounts.factoryEvaluations || {}).length || 50
  
  return {
    workerParticipationRate: totalWorkers > 0 ? (workerEvaluationCount / totalWorkers) * 100 : 0,
    factoryParticipationRate: totalFactories > 0 ? (factoryEvaluationCount / totalFactories) * 100 : 0,
    workerEvaluationCount,
    factoryEvaluationCount,
    totalWorkers,
    totalFactories
  }
}

// 获取综合评价得分趋势
export function getEvaluationScoreTrend(days = 7) {
  const factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
  const workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
  
  const cutoffTime = new Date()
  cutoffTime.setDate(cutoffTime.getDate() - days)
  
  // 统计工厂平均综合评价得分
  let factoryScores = []
  Object.keys(factoryEvaluations).forEach(factoryId => {
    const factoryEval = factoryEvaluations[factoryId]
    if (factoryEval.totalEvaluations > 0) {
      const latestEvaluation = factoryEval.evaluations.sort((a, b) => {
        return new Date(b.evaluationDate) - new Date(a.evaluationDate)
      })[0]
      
      const evalTime = new Date(latestEvaluation.evaluationDate)
      if (evalTime >= cutoffTime) {
        factoryScores.push(factoryEval.weightedScore)
      }
    }
  })
  
  // 统计员工平均综合评价得分
  let workerScores = []
  Object.keys(workerEvaluations).forEach(workerId => {
    const workerEval = workerEvaluations[workerId]
    if (workerEval.totalEvaluations > 0) {
      const latestEvaluation = workerEval.evaluations.sort((a, b) => {
        return new Date(b.evaluationDate) - new Date(a.evaluationDate)
      })[0]
      
      const evalTime = new Date(latestEvaluation.evaluationDate)
      if (evalTime >= cutoffTime) {
        workerScores.push(workerEval.weightedScore)
      }
    }
  })
  
  const averageFactoryScore = factoryScores.length > 0 ? 
    factoryScores.reduce((sum, score) => sum + score, 0) / factoryScores.length : 0
  
  const averageWorkerScore = workerScores.length > 0 ? 
    workerScores.reduce((sum, score) => sum + score, 0) / workerScores.length : 0
  
  return {
    averageFactoryScore,
    averageWorkerScore,
    factoryScoreCount: factoryScores.length,
    workerScoreCount: workerScores.length
  }
}

// 获取评价激励数据
export function getEvaluationRewardStats(days = 7) {
  const evaluationCounts = uni.getStorageSync('evaluationCounts') || {
    workerEvaluations: {},
    factoryEvaluations: {}
  }
  
  const cutoffTime = new Date()
  cutoffTime.setDate(cutoffTime.getDate() - days)
  
  // 统计员工评价激励
  let workerRewards = 0
  let workerMonthlyRewards = 0
  Object.keys(evaluationCounts.workerEvaluations || {}).forEach(workerId => {
    const workerEval = evaluationCounts.workerEvaluations[workerId]
    if (workerEval.monthly >= 1) {
      workerRewards++
      if (workerEval.monthly >= 3) {
        workerMonthlyRewards++
      }
    }
  })
  
  // 统计工厂评价激励
  let factoryRewards = 0
  let factoryMonthlyRewards = 0
  Object.keys(evaluationCounts.factoryEvaluations || {}).forEach(factoryId => {
    const factoryEval = evaluationCounts.factoryEvaluations[factoryId]
    if (factoryEval.monthly >= 1) {
      factoryRewards++
      if (factoryEval.monthly >= 5) {
        factoryMonthlyRewards++
      }
    }
  })
  
  return {
    workerRewards,
    workerMonthlyRewards,
    factoryRewards,
    factoryMonthlyRewards,
    totalRewards: workerRewards + factoryRewards,
    totalMonthlyRewards: workerMonthlyRewards + factoryMonthlyRewards
  }
}

// 获取完整的评价数据看板
export function getEvaluationDashboardData(days = 7) {
  const cutoffTime = new Date()
  cutoffTime.setDate(cutoffTime.getDate() - days)
  
  return {
    participation: getEvaluationParticipationRate(days),
    scoreTrend: getEvaluationScoreTrend(days),
    maliciousStats: getMaliciousEvaluationStats(days),
    rewardStats: getEvaluationRewardStats(days),
    dateRange: {
      start: cutoffTime.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  }
}

// 评价系统与平台内部沟通联动

// 生成员工评价工厂的提醒消息
export function generateWorkerEvaluationReminder(workerId, factoryId, type) {
  const typeText = type === 'entry' ? '入职' : '离职'
  const daysText = type === 'entry' ? '1个月' : '1个月'
  
  return {
    id: Date.now(),
    recipientId: workerId,
    type: 'evaluation_reminder',
    title: `邀请您评价工厂`,
    content: `您好！您已${typeText}满${daysText}，邀请您对所在工厂进行评价，您的评价将帮助其他工友了解真实的工作环境。`,
    factoryId,
    evaluationType: 'worker_to_factory',
    createdAt: new Date().toISOString(),
    hasRead: false,
    actionUrl: `/pages/evaluation/worker-evaluation?factoryId=${factoryId}`
  }
}

// 生成工厂评价员工的提醒消息
export function generateFactoryEvaluationReminder(factoryId, workerId, type, evaluatorPosition) {
  const typeText = type === 'entry' ? '入职' : '离职'
  const daysText = type === 'entry' ? '1个月' : '1个月'
  
  return {
    id: Date.now(),
    recipientId: factoryId,
    type: 'evaluation_reminder',
    title: `邀请您评价员工`,
    content: `您好！员工已${typeText}满${daysText}，邀请您对该员工进行评价，您的评价将帮助员工提升技能和职业发展。`,
    workerId,
    evaluatorPosition,
    evaluationType: 'factory_to_worker',
    createdAt: new Date().toISOString(),
    hasRead: false,
    actionUrl: `/pages/evaluation/factory-evaluation?workerId=${workerId}`
  }
}

// 检查员工是否需要评价提醒
export function checkWorkerEvaluationReminder(workerId, factoryId, entryDate, exitDate) {
  const reminders = []
  const now = new Date()
  
  // 检查入职满1个月
  if (entryDate) {
    const entryDateObj = new Date(entryDate)
    const entryDiff = Math.floor((now - entryDateObj) / (1000 * 60 * 60 * 24))
    if (entryDiff === 30) {
      reminders.push(generateWorkerEvaluationReminder(workerId, factoryId, 'entry'))
    }
  }
  
  // 检查离职满1个月
  if (exitDate) {
    const exitDateObj = new Date(exitDate)
    const exitDiff = Math.floor((now - exitDateObj) / (1000 * 60 * 60 * 24))
    if (exitDiff === 30) {
      reminders.push(generateWorkerEvaluationReminder(workerId, factoryId, 'exit'))
    }
  }
  
  return reminders
}

// 检查工厂是否需要评价提醒
export function checkFactoryEvaluationReminder(factoryId, workerId, entryDate, exitDate, evaluatorPosition) {
  const reminders = []
  const now = new Date()
  
  // 检查入职满1个月
  if (entryDate) {
    const entryDateObj = new Date(entryDate)
    const entryDiff = Math.floor((now - entryDateObj) / (1000 * 60 * 60 * 24))
    if (entryDiff === 30) {
      reminders.push(generateFactoryEvaluationReminder(factoryId, workerId, 'entry', evaluatorPosition))
    }
  }
  
  // 检查离职满1个月
  if (exitDate) {
    const exitDateObj = new Date(exitDate)
    const exitDiff = Math.floor((now - exitDateObj) / (1000 * 60 * 60 * 24))
    if (exitDiff === 30) {
      reminders.push(generateFactoryEvaluationReminder(factoryId, workerId, 'exit', evaluatorPosition))
    }
  }
  
  return reminders
}

// 批量检查评价提醒
export function batchCheckEvaluationReminders(employmentRecords) {
  const allReminders = []
  
  employmentRecords.forEach(record => {
    // 生成员工提醒
    const workerReminders = checkWorkerEvaluationReminder(
      record.workerId,
      record.factoryId,
      record.entryDate,
      record.exitDate
    )
    allReminders.push(...workerReminders)
    
    // 生成工厂提醒
    const factoryReminders = checkFactoryEvaluationReminder(
      record.factoryId,
      record.workerId,
      record.entryDate,
      record.exitDate,
      record.evaluatorPosition || '本厂评价'
    )
    allReminders.push(...factoryReminders)
  })
  
  return allReminders
}
