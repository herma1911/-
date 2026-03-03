// 班组集体激励机制管理工具

// 班组激励配置
const TEAM_INCENTIVE_CONFIG = {
  // 班组达标激励门槛
  TEAM_ACHIEVEMENT_THRESHOLD: 0.8, // 80%的工人完成互评
  
  // 月度标杆班组评选数量
  MONTHLY_CHAMPION_COUNT: 3,
  
  // 评价真实性权重
  AUTHENTICITY_WEIGHT: 0.6,
  
  // 完成率权重
  COMPLETION_RATE_WEIGHT: 0.4
}

// 保存班组信息
export function saveTeamInfo(teamId, teamData) {
  const teams = uni.getStorageSync('teams') || {}
  teams[teamId] = {
    ...teams[teamId],
    ...teamData,
    updatedAt: new Date().toISOString()
  }
  uni.setStorageSync('teams', teams)
  return teams[teamId]
}

// 获取班组信息
export function getTeamInfo(teamId) {
  const teams = uni.getStorageSync('teams') || {}
  return teams[teamId] || {
    id: teamId,
    name: '',
    factoryId: '',
    leaderId: '',
    members: [],
    evaluations: [],
    createdAt: new Date().toISOString()
  }
}

// 添加班组成员
export function addTeamMember(teamId, memberId) {
  const team = getTeamInfo(teamId)
  if (!team.members.includes(memberId)) {
    team.members.push(memberId)
    saveTeamInfo(teamId, team)
  }
  return team
}

// 移除班组成员
export function removeTeamMember(teamId, memberId) {
  const team = getTeamInfo(teamId)
  const memberIndex = team.members.indexOf(memberId)
  if (memberIndex !== -1) {
    team.members.splice(memberIndex, 1)
    saveTeamInfo(teamId, team)
  }
  return team
}

// 记录班组评价
export function recordTeamEvaluation(teamId, userId, evaluationId) {
  const team = getTeamInfo(teamId)
  if (!team.evaluations) {
    team.evaluations = []
  }
  
  // 检查是否已经记录过
  const existingEvaluation = team.evaluations.find(eval => eval.userId === userId)
  if (!existingEvaluation) {
    team.evaluations.push({
      userId,
      evaluationId,
      evaluationDate: new Date().toISOString()
    })
    saveTeamInfo(teamId, team)
  }
  
  return team
}

// 计算班组互评完成率
export function calculateTeamCompletionRate(teamId) {
  const team = getTeamInfo(teamId)
  const totalMembers = team.members.length
  if (totalMembers === 0) return 0
  
  const completedEvaluations = team.evaluations ? team.evaluations.length : 0
  return completedEvaluations / totalMembers
}

// 检查班组是否达标
export function checkTeamAchievement(teamId) {
  const completionRate = calculateTeamCompletionRate(teamId)
  return completionRate >= TEAM_INCENTIVE_CONFIG.TEAM_ACHIEVEMENT_THRESHOLD
}

// 解锁班组达标奖励
export function unlockTeamAchievementRewards(teamId) {
  const team = getTeamInfo(teamId)
  const rewards = []
  
  // 为所有班组成员解锁奖励
  team.members.forEach(memberId => {
    const { unlockTeamRewards } = require('./ledger-privileges')
    unlockTeamRewards(memberId, false)
  })
  
  // 为班组长解锁额外奖励
  if (team.leaderId) {
    const { unlockTeamRewards } = require('./ledger-privileges')
    unlockTeamRewards(team.leaderId, true)
  }
  
  // 记录班组达标
  team.achievements = team.achievements || []
  team.achievements.push({
    type: 'team_achievement',
    unlockedAt: new Date().toISOString(),
    completionRate: calculateTeamCompletionRate(teamId)
  })
  
  saveTeamInfo(teamId, team)
  
  return team
}

// 计算班组评价真实性分数
export function calculateTeamAuthenticityScore(teamId) {
  const team = getTeamInfo(teamId)
  const { getRiskControlRecords } = require('./risk-control')
  
  let totalEvaluations = 0
  let anomalousEvaluations = 0
  
  // 检查每个成员的评价是否有异常
  team.evaluations.forEach(evalRecord => {
    const riskRecords = getRiskControlRecords(evalRecord.userId)
    const hasAnomaly = riskRecords.some(record => 
      record.type === 'punishment' && 
      record.evaluationId === evalRecord.evaluationId
    )
    
    totalEvaluations++
    if (hasAnomaly) {
      anomalousEvaluations++
    }
  })
  
  if (totalEvaluations === 0) return 1.0 // 没有评价时默认满分
  
  const authenticityRate = (totalEvaluations - anomalousEvaluations) / totalEvaluations
  return authenticityRate
}

// 计算班组综合评分
export function calculateTeamScore(teamId) {
  const completionRate = calculateTeamCompletionRate(teamId)
  const authenticityScore = calculateTeamAuthenticityScore(teamId)
  
  // 加权计算综合评分
  const score = (
    authenticityScore * TEAM_INCENTIVE_CONFIG.AUTHENTICITY_WEIGHT +
    completionRate * TEAM_INCENTIVE_CONFIG.COMPLETION_RATE_WEIGHT
  )
  
  return score
}

// 评选月度标杆班组
export function selectMonthlyChampionTeams(year, month) {
  const teams = uni.getStorageSync('teams') || {}
  const teamScores = []
  
  // 计算每个班组的综合评分
  Object.keys(teams).forEach(teamId => {
    const team = teams[teamId]
    const score = calculateTeamScore(teamId)
    teamScores.push({
      teamId,
      score,
      completionRate: calculateTeamCompletionRate(teamId),
      authenticityScore: calculateTeamAuthenticityScore(teamId)
    })
  })
  
  // 按评分排序，取前3名
  teamScores.sort((a, b) => b.score - a.score)
  const champions = teamScores.slice(0, TEAM_INCENTIVE_CONFIG.MONTHLY_CHAMPION_COUNT)
  
  // 记录月度标杆班组
  const monthlyChampions = uni.getStorageSync('monthlyChampions') || {}
  const key = `${year}-${String(month).padStart(2, '0')}`
  monthlyChampions[key] = champions
  uni.setStorageSync('monthlyChampions', monthlyChampions)
  
  return champions
}

// 解锁月度标杆班组奖励
export function unlockMonthlyChampionRewards(teamId) {
  const team = getTeamInfo(teamId)
  
  // 为所有班组成员解锁奖励
  team.members.forEach(memberId => {
    const { unlockMonthlyTeamRewards } = require('./ledger-privileges')
    unlockMonthlyTeamRewards(memberId, false)
  })
  
  // 为班组长解锁额外奖励
  if (team.leaderId) {
    const { unlockMonthlyTeamRewards } = require('./ledger-privileges')
    unlockMonthlyTeamRewards(team.leaderId, true)
    
    // 为班组长添加优质班组长标签
    const { addBadge } = require('./career-profile')
    addBadge(team.leaderId, {
      id: 'quality_leader',
      name: '优质班组长',
      description: '平台官方认证优质班组长，优先对接平台合作工厂的长期生产订单、招工订单',
      level: 'gold'
    })
  }
  
  // 记录月度标杆
  team.achievements = team.achievements || []
  team.achievements.push({
    type: 'monthly_champion',
    unlockedAt: new Date().toISOString(),
    score: calculateTeamScore(teamId)
  })
  
  saveTeamInfo(teamId, team)
  
  return team
}

// 获取班组历史成就
export function getTeamAchievements(teamId) {
  const team = getTeamInfo(teamId)
  return team.achievements || []
}

// 获取月度标杆班组记录
export function getMonthlyChampions(year, month) {
  const monthlyChampions = uni.getStorageSync('monthlyChampions') || {}
  const key = `${year}-${String(month).padStart(2, '0')}`
  return monthlyChampions[key] || []
}

// 检查班组是否是月度标杆
export function isMonthlyChampion(teamId, year, month) {
  const champions = getMonthlyChampions(year, month)
  return champions.some(champion => champion.teamId === teamId)
}

// 批量处理班组激励
export function processTeamIncentives() {
  const teams = uni.getStorageSync('teams') || {}
  const processedTeams = []
  
  Object.keys(teams).forEach(teamId => {
    // 检查班组达标激励
    if (checkTeamAchievement(teamId)) {
      const team = unlockTeamAchievementRewards(teamId)
      processedTeams.push({
        teamId,
        type: 'team_achievement',
        status: 'success'
      })
    }
  })
  
  return processedTeams
}

// 月度处理标杆班组
export function processMonthlyChampions() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  const champions = selectMonthlyChampionTeams(year, month)
  const processedTeams = []
  
  champions.forEach(champion => {
    const team = unlockMonthlyChampionRewards(champion.teamId)
    processedTeams.push({
      teamId: champion.teamId,
      type: 'monthly_champion',
      score: champion.score,
      status: 'success'
    })
  })
  
  return processedTeams
}

// 获取班组统计数据
export function getTeamStats(teamId) {
  const team = getTeamInfo(teamId)
  const completionRate = calculateTeamCompletionRate(teamId)
  const authenticityScore = calculateTeamAuthenticityScore(teamId)
  const totalScore = calculateTeamScore(teamId)
  
  return {
    teamId,
    teamName: team.name,
    totalMembers: team.members.length,
    completedEvaluations: team.evaluations ? team.evaluations.length : 0,
    completionRate,
    authenticityScore,
    totalScore,
    achievements: team.achievements ? team.achievements.length : 0
  }
}

// 导出班组激励相关常量
export { TEAM_INCENTIVE_CONFIG }
