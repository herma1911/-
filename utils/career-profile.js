// 个人职业档案终身赋能管理工具

// 技能等级认证
const SKILL_LEVELS = {
  NOVICE: {
    name: '初级工',
    requirements: {
      evaluations: 1,
      minScore: 3.0
    }
  },
  SKILLED: {
    name: '熟手',
    requirements: {
      evaluations: 2,
      minScore: 3.5
    }
  },
  ADVANCED: {
    name: '高级工',
    requirements: {
      evaluations: 5,
      minScore: 4.0
    }
  },
  EXPERT: {
    name: '技师',
    requirements: {
      evaluations: 10,
      minScore: 4.5
    }
  }
}

// 职业标签分类
const CAREER_TAGS = {
  SKILL_LEVEL: [
    '车工熟练', '裁剪精准', '烫工平整', '上手快', '技术全面'
  ],
  EFFICIENCY: [
    '出活快', '效率高', '按时完成', '加班积极', '产量稳定'
  ],
  ATTENDANCE: [
    '出勤稳定', '准时到岗', '请假少', '责任心强', '服从安排'
  ],
  TEAMWORK: [
    '团队协作', '沟通顺畅', '乐于助人', '配合度高', '不挑活'
  ]
}

// 职业档案结构
const createCareerProfile = (userId) => {
  return {
    userId,
    basicInfo: {
      name: '',
      phone: '',
      avatar: '',
      idCard: ''
    },
    skillCertifications: [],
    peerEvaluations: [],
    teamLeaderEvaluations: [],
    workHistory: [],
    productionStats: {
      totalPieces: 0,
      totalHours: 0,
      averageEfficiency: 0
    },
    industryTags: [],
    reputationScore: 0,
    badges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// 保存个人职业档案
export function saveCareerProfile(userId, profileData) {
  const profiles = uni.getStorageSync('careerProfiles') || {}
  const existingProfile = profiles[userId] || createCareerProfile(userId)
  
  profiles[userId] = {
    ...existingProfile,
    ...profileData,
    updatedAt: new Date().toISOString()
  }
  
  uni.setStorageSync('careerProfiles', profiles)
  return profiles[userId]
}

// 获取个人职业档案
export function getCareerProfile(userId) {
  const profiles = uni.getStorageSync('careerProfiles') || {}
  return profiles[userId] || createCareerProfile(userId)
}

// 更新个人基本信息
export function updateBasicInfo(userId, basicInfo) {
  const profile = getCareerProfile(userId)
  profile.basicInfo = {
    ...profile.basicInfo,
    ...basicInfo
  }
  return saveCareerProfile(userId, profile)
}

// 添加工友评价记录
export function addPeerEvaluation(userId, evaluation) {
  const profile = getCareerProfile(userId)
  profile.peerEvaluations.push({
    ...evaluation,
    evaluationDate: evaluation.evaluationDate || new Date().toISOString().split('T')[0]
  })
  // 更新行业标签
  if (evaluation.tags && evaluation.tags.length > 0) {
    profile.industryTags = [...new Set([...profile.industryTags, ...evaluation.tags])]
  }
  // 更新声誉分数
  updateReputationScore(userId)
  return saveCareerProfile(userId, profile)
}

// 添加班组长评价记录
export function addTeamLeaderEvaluation(userId, evaluation) {
  const profile = getCareerProfile(userId)
  profile.teamLeaderEvaluations.push({
    ...evaluation,
    evaluationDate: evaluation.evaluationDate || new Date().toISOString().split('T')[0]
  })
  // 更新行业标签
  if (evaluation.tags && evaluation.tags.length > 0) {
    profile.industryTags = [...new Set([...profile.industryTags, ...evaluation.tags])]
  }
  // 更新声誉分数
  updateReputationScore(userId)
  return saveCareerProfile(userId, profile)
}

// 添加工作历史记录
export function addWorkHistory(userId, workRecord) {
  const profile = getCareerProfile(userId)
  profile.workHistory.push({
    ...workRecord,
    startDate: workRecord.startDate || new Date().toISOString().split('T')[0],
    endDate: workRecord.endDate || null
  })
  return saveCareerProfile(userId, profile)
}

// 更新生产统计数据
export function updateProductionStats(userId, stats) {
  const profile = getCareerProfile(userId)
  profile.productionStats = {
    ...profile.productionStats,
    ...stats
  }
  return saveCareerProfile(userId, profile)
}

// 计算并更新声誉分数
export function updateReputationScore(userId) {
  const profile = getCareerProfile(userId)
  let totalScore = 0
  let totalEvaluations = 0
  
  // 计算工友评价分数
  profile.peerEvaluations.forEach(eval => {
    if (eval.overallScore) {
      totalScore += eval.overallScore
      totalEvaluations++
    }
  })
  
  // 计算班组长评价分数（权重更高）
  profile.teamLeaderEvaluations.forEach(eval => {
    if (eval.overallScore) {
      totalScore += eval.overallScore * 1.5 // 班组长评价权重1.5倍
      totalEvaluations += 1.5
    }
  })
  
  // 计算平均声誉分数
  profile.reputationScore = totalEvaluations > 0 ? totalScore / totalEvaluations : 0
  return saveCareerProfile(userId, profile)
}

// 生成技能等级认证
export function generateSkillCertification(userId) {
  const profile = getCareerProfile(userId)
  const evaluationCount = profile.peerEvaluations.length + profile.teamLeaderEvaluations.length
  
  // 计算平均评分
  let totalScore = 0
  let scoreCount = 0
  
  profile.peerEvaluations.forEach(eval => {
    if (eval.overallScore) {
      totalScore += eval.overallScore
      scoreCount++
    }
  })
  
  profile.teamLeaderEvaluations.forEach(eval => {
    if (eval.overallScore) {
      totalScore += eval.overallScore
      scoreCount++
    }
  })
  
  const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0
  
  // 确定技能等级
  let certificationLevel = null
  
  if (evaluationCount >= SKILL_LEVELS.EXPERT.requirements.evaluations && 
      averageScore >= SKILL_LEVELS.EXPERT.requirements.minScore) {
    certificationLevel = 'EXPERT'
  } else if (evaluationCount >= SKILL_LEVELS.ADVANCED.requirements.evaluations && 
             averageScore >= SKILL_LEVELS.ADVANCED.requirements.minScore) {
    certificationLevel = 'ADVANCED'
  } else if (evaluationCount >= SKILL_LEVELS.SKILLED.requirements.evaluations && 
             averageScore >= SKILL_LEVELS.SKILLED.requirements.minScore) {
    certificationLevel = 'SKILLED'
  } else if (evaluationCount >= SKILL_LEVELS.NOVICE.requirements.evaluations && 
             averageScore >= SKILL_LEVELS.NOVICE.requirements.minScore) {
    certificationLevel = 'NOVICE'
  }
  
  if (certificationLevel) {
    // 检查是否已有相同等级的认证
    const existingCert = profile.skillCertifications.find(cert => cert.level === certificationLevel)
    
    if (!existingCert) {
      const newCert = {
        id: Date.now(),
        level: certificationLevel,
        name: SKILL_LEVELS[certificationLevel].name,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: null, // 终身有效
        status: 'active'
      }
      
      profile.skillCertifications.push(newCert)
      saveCareerProfile(userId, profile)
      return newCert
    }
  }
  
  return null
}

// 获取技能等级认证
export function getSkillCertifications(userId) {
  const profile = getCareerProfile(userId)
  return profile.skillCertifications.filter(cert => cert.status === 'active')
}

// 获取最高技能等级
export function getHighestSkillLevel(userId) {
  const certifications = getSkillCertifications(userId)
  if (certifications.length === 0) return null
  
  const levelOrder = ['NOVICE', 'SKILLED', 'ADVANCED', 'EXPERT']
  certifications.sort((a, b) => {
    return levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level)
  })
  
  return certifications[0]
}

// 解锁职业赋能权益
export function unlockCareerBenefits(userId, evaluationCount) {
  const benefits = []
  
  // 基础背书赋能（1条互评）
  if (evaluationCount >= 1) {
    benefits.push({
      id: 'career_profile_generation',
      name: '个人职业信用档案生成权限',
      description: '永久解锁个人职业信用档案生成权限，可一键生成高清图片/PDF保存、分享',
      permanent: true
    })
  }
  
  // 2条及以上互评
  if (evaluationCount >= 2) {
    benefits.push({
      id: 'skill_level_initial',
      name: '服装行业技能等级初评',
      description: '平台根据工友互评、真实产能数据，颁发官方认证的技能等级证书',
      permanent: true
    })
    benefits.push({
      id: 'capacity_benchmarking',
      name: '同工种产能对标功能',
      description: '可查看自己的效率、手艺在同地区、同工种的行业排名',
      permanent: true
    })
  }
  
  // 5条及以上互评
  if (evaluationCount >= 5) {
    benefits.push({
      id: 'skill_level_advanced',
      name: '中/高级技能等级认证评审资格',
      description: '证书带平台官方防伪标识，合作工厂进厂可直接按认证等级定熟手顶薪，免试工、免试用期',
      permanent: true
    })
    benefits.push({
      id: 'national_skill_pool',
      name: '全国熟手人才库',
      description: '全国合作工厂有高价订单、长期稳定单，优先匹配推送',
      permanent: true
    })
    benefits.push({
      id: 'skill_courses',
      name: '服装技能提升课程',
      description: '永久免费解锁平台合作的服装技能提升课程，精进手艺、涨工价',
      permanent: true
    })
  }
  
  // 10条及以上互评
  if (evaluationCount >= 10) {
    benefits.push({
      id: 'industry_benchmark',
      name: '行业标杆熟手终身认证',
      description: '全行业通用，不管去哪个省份、哪个工厂，均享受熟手优先录用、顶薪议价权',
      permanent: true
    })
    benefits.push({
      id: 'wage_negotiation_guarantee',
      name: '工价议价保障',
      description: '合作工厂不得低于认证等级对应的行业最低工价录用，保障工人收入底线',
      permanent: true
    })
    benefits.push({
      id: 'premium_orders',
      name: '高价私单推荐',
      description: '优先获得平台合作的头部工厂、外贸订单的高价私单推荐，不用自己找活干',
      permanent: true
    })
  }
  
  // 保存权益
  const profile = getCareerProfile(userId)
  profile.benefits = benefits
  saveCareerProfile(userId, profile)
  
  return benefits
}

// 获取职业赋能权益
export function getCareerBenefits(userId) {
  const profile = getCareerProfile(userId)
  return profile.benefits || []
}

// 生成职业档案PDF/图片
export function generateProfileDocument(userId, format = 'pdf') {
  const profile = getCareerProfile(userId)
  const highestSkill = getHighestSkillLevel(userId)
  
  const documentData = {
    type: format,
    profile: {
      ...profile,
      highestSkillLevel: highestSkill ? highestSkill.name : '未认证',
      totalEvaluations: profile.peerEvaluations.length + profile.teamLeaderEvaluations.length,
      documentGeneratedAt: new Date().toISOString()
    }
  }
  
  // 这里应该调用实际的PDF/图片生成服务
  // 目前返回模拟数据
  return {
    success: true,
    data: {
      documentId: Date.now(),
      format,
      downloadUrl: `https://example.com/profiles/${userId}/${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天有效期
    }
  }
}

// 添加荣誉徽章
export function addBadge(userId, badge) {
  const profile = getCareerProfile(userId)
  // 检查是否已有相同徽章
  const existingBadge = profile.badges.find(b => b.id === badge.id)
  
  if (!existingBadge) {
    profile.badges.push({
      ...badge,
      awardedAt: new Date().toISOString()
    })
    saveCareerProfile(userId, profile)
  }
  
  return profile.badges
}

// 获取荣誉徽章
export function getBadges(userId) {
  const profile = getCareerProfile(userId)
  return profile.badges || []
}

// 检查是否符合全国熟手人才库条件
export function checkNationalSkillPoolEligibility(userId) {
  const profile = getCareerProfile(userId)
  const evaluationCount = profile.peerEvaluations.length + profile.teamLeaderEvaluations.length
  const highestSkill = getHighestSkillLevel(userId)
  
  return evaluationCount >= 5 && highestSkill && 
    (highestSkill.level === 'ADVANCED' || highestSkill.level === 'EXPERT')
}

// 检查是否符合行业标杆熟手条件
export function checkIndustryBenchmarkEligibility(userId) {
  const profile = getCareerProfile(userId)
  const evaluationCount = profile.peerEvaluations.length + profile.teamLeaderEvaluations.length
  const highestSkill = getHighestSkillLevel(userId)
  
  return evaluationCount >= 10 && highestSkill && highestSkill.level === 'EXPERT'
}

// 导出职业档案相关常量
export { SKILL_LEVELS, CAREER_TAGS }
