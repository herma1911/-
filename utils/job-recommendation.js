// 岗位推荐算法工具

// 计算岗位属性匹配度
export function calculateJobMatchScore(currentJob, targetJob, userInfo = {}) {
  let totalScore = 0
  
  // 1. 工序/工种匹配 (40%)
  const processScore = calculateProcessMatch(currentJob.skills || [], targetJob.skills || [])
  totalScore += processScore * 0.4
  
  // 2. 地理位置匹配 (25%)
  const locationScore = calculateLocationMatch(currentJob.location, targetJob.location, userInfo.location)
  totalScore += locationScore * 0.25
  
  // 3. 工价范围匹配 (15%)
  const salaryScore = calculateSalaryMatch(currentJob.salary, targetJob.salary)
  totalScore += salaryScore * 0.15
  
  // 4. 结款方式匹配 (10%)
  const paymentScore = calculatePaymentMatch(currentJob.salaryType, targetJob.salaryType)
  totalScore += paymentScore * 0.1
  
  // 5. 工厂属性匹配 (10%)
  const factoryScore = calculateFactoryMatch(currentJob.company, targetJob.company, currentJob.verificationType, targetJob.verificationType)
  totalScore += factoryScore * 0.1
  
  return totalScore
}

// 计算工序匹配度
function calculateProcessMatch(currentSkills, targetSkills) {
  if (!currentSkills || currentSkills.length === 0) return 0.5
  if (!targetSkills || targetSkills.length === 0) return 0.3
  
  let matchCount = 0
  currentSkills.forEach(skill => {
    if (targetSkills.includes(skill)) {
      matchCount++
    }
  })
  
  return matchCount / currentSkills.length
}

// 计算地理位置匹配度
function calculateLocationMatch(currentLocation, targetLocation, userLocation) {
  // 简化实现：相同城市为1.0，相同省份为0.7，其他为0.3
  if (currentLocation === targetLocation) return 1.0
  if (currentLocation && targetLocation && currentLocation.includes(targetLocation.substring(0, 2))) return 0.7
  return 0.3
}

// 计算工价匹配度
function calculateSalaryMatch(currentSalary, targetSalary) {
  const currentValue = getSalaryValue(currentSalary)
  const targetValue = getSalaryValue(targetSalary)
  
  if (targetValue >= currentValue) return 1.0
  if (targetValue >= currentValue * 0.9) return 0.8
  if (targetValue >= currentValue * 0.8) return 0.6
  return 0.4
}

// 提取工价数值
function getSalaryValue(salary) {
  if (!salary) return 0
  const match = salary.match(/(\d+)\-?(\d+)?/)
  if (match) {
    if (match[2]) {
      return (parseInt(match[1]) + parseInt(match[2])) / 2
    } else {
      return parseInt(match[1])
    }
  }
  return 0
}

// 计算结款方式匹配度
function calculatePaymentMatch(currentType, targetType) {
  const paymentRank = {
    '日结': 3,
    '周结': 2,
    '月结': 1
  }
  
  const currentRank = paymentRank[currentType] || 0
  const targetRank = paymentRank[targetType] || 0
  
  if (targetRank >= currentRank) return 1.0
  return 0.5
}

// 计算工厂属性匹配度
function calculateFactoryMatch(currentCompany, targetCompany, currentVerification, targetVerification) {
  // 平台认证工厂权重更高
  if (targetVerification === 'enterprise') return 1.0
  if (targetVerification === 'personal') return 0.7
  return 0.5
}

// 计算用户画像匹配度
export function calculateUserMatchScore(job, userInfo) {
  let totalScore = 0
  
  // 技能标签匹配
  if (userInfo.skills && userInfo.skills.length > 0) {
    const skillMatch = calculateProcessMatch(userInfo.skills, job.skills || [])
    totalScore += skillMatch * 0.4
  }
  
  // 求职意向匹配
  if (userInfo.expectedSalary) {
    const salaryMatch = calculateSalaryMatch(userInfo.expectedSalary, job.salary)
    totalScore += salaryMatch * 0.3
  }
  
  // 历史行为匹配（简化实现）
  if (userInfo.viewedJobs && userInfo.viewedJobs.includes(job.id)) {
    totalScore += 0.3
  }
  
  return totalScore
}

// 生成相似岗位推荐
export function generateSimilarJobs(currentJob, allJobs, userInfo = {}, limit = 6) {
  // 过滤不符合条件的岗位
  const filteredJobs = allJobs.filter(job => {
    // 过滤当前岗位
    if (job.id === currentJob.id) return false
    // 过滤已下架、已招满、已过期的岗位（简化实现）
    if (job.status === 'closed') return false
    // 过滤用户已申请、已咨询、已收藏的岗位
    if (userInfo.appliedJobs && userInfo.appliedJobs.includes(job.id)) return false
    if (userInfo.consultedJobs && userInfo.consultedJobs.includes(job.id)) return false
    if (userInfo.favoriteJobs && userInfo.favoriteJobs.includes(job.id)) return false
    // 过滤用户已屏蔽的工厂
    if (userInfo.blockedFactories && userInfo.blockedFactories.includes(job.company)) return false
    // 仅展示平台认证工厂
    if (job.verificationType !== 'enterprise') return false
    return true
  })
  
  // 计算每个岗位的综合匹配度
  const jobsWithScores = filteredJobs.map(job => {
    const jobMatchScore = calculateJobMatchScore(currentJob, job, userInfo)
    const userMatchScore = calculateUserMatchScore(job, userInfo)
    const totalScore = (jobMatchScore * 0.7) + (userMatchScore * 0.3)
    
    return {
      ...job,
      matchScore: totalScore,
      matchPercentage: Math.round(totalScore * 100)
    }
  })
  
  // 排序
  jobsWithScores.sort((a, b) => {
    // 按综合匹配度排序
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore
    }
    // 匹配度相同，按距离排序
    const distanceA = getDistance(a.location, userInfo.location)
    const distanceB = getDistance(b.location, userInfo.location)
    if (distanceA !== distanceB) {
      return distanceA - distanceB
    }
    // 距离相同，按工价排序
    const salaryA = getSalaryValue(a.salary)
    const salaryB = getSalaryValue(b.salary)
    if (salaryA !== salaryB) {
      return salaryB - salaryA
    }
    // 工价相同，按工厂评分排序
    return (b.rating || 0) - (a.rating || 0)
  })
  
  // 取前N个
  const recommendedJobs = jobsWithScores.slice(0, limit)
  
  // 兜底逻辑：如果推荐岗位不足，补充其他岗位
  if (recommendedJobs.length < limit) {
    const remainingCount = limit - recommendedJobs.length
    const additionalJobs = allJobs
      .filter(job => !recommendedJobs.some(rj => rj.id === job.id))
      .filter(job => job.verificationType === 'enterprise')
      .sort((a, b) => {
        // 按申请量排序
        return (b.applicantCount || 0) - (a.applicantCount || 0)
      })
      .slice(0, remainingCount)
    
    recommendedJobs.push(...additionalJobs)
  }
  
  return recommendedJobs
}

// 模拟距离计算
function getDistance(location1, location2) {
  // 简化实现：返回随机距离
  return Math.floor(Math.random() * 50) + 1
}

// 触发推荐场景
export function triggerRecommendationScenario(scenario, currentJob, userInfo) {
  switch (scenario) {
    case '主动触发':
      return {
        type: '主动触发',
        message: '正在为您推荐相似岗位...'
      }
    case '咨询后':
      return {
        type: '咨询后',
        message: '已提交咨询，是否推荐更多相似岗位？'
      }
    case '申请后':
      return {
        type: '申请后',
        message: '申请成功，为您推荐更多相似岗位'
      }
    case '首页推荐':
      return {
        type: '首页推荐',
        message: '为你推荐相似岗位'
      }
    default:
      return {
        type: '默认推荐',
        message: '为你推荐岗位'
      }
  }
}

// 记录推荐行为
export function recordRecommendationAction(action, jobId, userId) {
  // 这里可以实现行为记录逻辑
  console.log(`用户 ${userId} 对岗位 ${jobId} 执行了 ${action} 操作`)
}

// 生成推荐理由
export function generateRecommendationReason(job, currentJob, userInfo) {
  const reasons = []
  
  // 工序匹配
  if (job.skills && currentJob.skills) {
    const commonSkills = job.skills.filter(skill => currentJob.skills.includes(skill))
    if (commonSkills.length > 0) {
      reasons.push(`匹配您的技能：${commonSkills[0]}`)
    }
  }
  
  // 位置匹配
  if (job.location === currentJob.location) {
    reasons.push('同一地区，距离相近')
  }
  
  // 工价匹配
  const currentSalary = getSalaryValue(currentJob.salary)
  const jobSalary = getSalaryValue(job.salary)
  if (jobSalary >= currentSalary) {
    reasons.push('工价更有竞争力')
  }
  
  // 工厂认证
  if (job.verificationType === 'enterprise') {
    reasons.push('平台认证工厂，更可靠')
  }
  
  return reasons.length > 0 ? reasons : ['综合匹配度高']
}