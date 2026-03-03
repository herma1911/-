// 账本全链路永久特权管理工具

// 账本特权等级
const PRIVILEGE_LEVELS = {
  BASIC: 'basic',      // 基础特权（1条真实互评）
  ADVANCED_2: 'advanced_2',  // 2条及以上真实互评
  ADVANCED_5: 'advanced_5',  // 5条及以上真实互评
  ADVANCED_10: 'advanced_10' // 10条及以上真实互评
}

// 基础普惠特权（完成1条真实有效互评）
const BASIC_PRIVILEGES = [
  {
    id: 'unlimited_ledgers',
    name: '无限多账本分类管理权限',
    description: '可按工厂/班组/款号/私活创建无限个独立账本，同时做多家工厂、多笔订单的账互不干扰',
    permanent: true
  },
  {
    id: 'export_bills',
    name: '账单一键导出永久权限',
    description: '可导出高清PDF/Excel格式的完整账单，自动同步工价、数量、班组长审批记录、预支扣款明细',
    permanent: true
  },
  {
    id: 'salary_calculation',
    name: '全场景薪资自动核算模板',
    description: '永久解锁计件/计时工资自动核算、预支工资/扣款/补贴自动抵扣、月底自动生成总工资对账表',
    permanent: true
  },
  {
    id: 'price_ledger',
    name: '工价永久云端台账',
    description: '自动同步绑定班组的所有款号、工序工价，云端永久留存，换款、换工厂也能随时查历史工价',
    permanent: true
  },
  {
    id: 'bill_alerts',
    name: '账单异常智能提醒',
    description: '自动识别工价异常、数量核算错误、审批驳回的账单，实时推送提醒',
    permanent: true
  }
]

// 进阶阶梯特权
const ADVANCED_PRIVILEGES = {
  [PRIVILEGE_LEVELS.ADVANCED_2]: [
    {
      id: 'team_reconciliation',
      name: '班组对账协同',
      description: '可和同班组工友共享账单、核对同工序工价，提前规避同工不同酬',
      permanent: true
    },
    {
      id: 'income_analysis',
      name: '年度/季度收入分析报表',
      description: '自动生成收入趋势、工价对比、产能统计报表，清楚知道自己一年赚了多少',
      permanent: true
    },
    {
      id: 'ledger_encryption',
      name: '账本独立加密功能',
      description: '设置专属密码，保护收入隐私',
      permanent: true
    }
  ],
  [PRIVILEGE_LEVELS.ADVANCED_5]: [
    {
      id: 'salary_tracking',
      name: '工资发放追踪台账',
      description: '记录每一笔工资到账情况、拖欠记录，自动生成带平台标识的欠薪对账凭证',
      permanent: true
    },
    {
      id: 'price_database',
      name: '全国同工种工价数据库',
      description: '可查看同地区、同工种的最新平均工价、最高工价，和老板谈工价有真实数据支撑',
      permanent: true
    },
    {
      id: 'lifetime_updates',
      name: '终身更新权限',
      description: '永久解锁所有账本模板、对账模板的终身更新权限，全平台记账功能终身免费使用',
      permanent: true
    }
  ],
  [PRIVILEGE_LEVELS.ADVANCED_10]: [
    {
      id: 'factory_risk_alert',
      name: '工厂用工风险预警',
      description: '自动提醒合作工厂的欠薪记录、工价低于行业均值、频繁降工价的风险',
      permanent: true
    },
    {
      id: 'reconciliation_advisor',
      name: '专属对账顾问服务',
      description: '免费协助处理对账纠纷、账单整理、欠薪凭证梳理',
      permanent: true
    },
    {
      id: 'future_features',
      name: '未来功能免费使用',
      description: '平台后续上线的所有付费记账、对账功能，终身免费使用，永久优先更新',
      permanent: true
    }
  ]
}

// 高质量评价额外激励
const HIGH_QUALITY_REWARDS = [
  {
    id: 'premium_price_database',
    name: '90天工价数据库高级权限',
    description: '享受90天工价数据库高级权限，查看更详细的行业工价数据',
    duration: 90 // 90天
  },
  {
    id: 'wage_protection_channel',
    name: '欠薪维权协助绿色通道',
    description: '优先处理欠薪维权问题，提供专业协助',
    duration: 90 // 90天
  }
]

// 班组达标激励
const TEAM_REWARDS = {
  MEMBER_REWARDS: [
    {
      id: 'team_reconciliation_permanent',
      name: '班组账本协同永久权限',
      description: '永久解锁班组对账协同功能，与同班组工友共享账单',
      permanent: true
    },
    {
      id: 'premium_price_database_90',
      name: '90天工价数据库高级权限',
      description: '享受90天工价数据库高级权限',
      duration: 90
    }
  ],
  LEADER_REWARDS: [
    {
      id: 'team_management_advanced',
      name: '班组管理高级功能永久权限',
      description: '包含批量工价录入、账单批量审批、班组产能统计、工人出勤台账',
      permanent: true
    }
  ]
}

// 月度标杆班组激励
const MONTHLY_TEAM_REWARDS = {
  MEMBER_REWARDS: [
    {
      id: 'skill_certification_priority',
      name: '中级技能认证优先评审权',
      description: '优先获得中级技能认证评审资格',
      permanent: true
    },
    {
      id: 'income_analysis_permanent',
      name: '年度收入分析报表永久权限',
      description: '永久解锁年度收入分析报表功能',
      permanent: true
    }
  ],
  LEADER_REWARDS: [
    {
      id: 'quality_leader_tag',
      name: '优质班组长终身标签',
      description: '平台官方认证「优质班组长」终身标签，优先对接平台合作工厂的长期生产订单、招工订单',
      permanent: true
    }
  ]
}

// 冷启动限时福利
const LAUNCH_REWARDS = {
  NEW_USER: [
    {
      id: 'basic_privileges',
      name: '账本全基础特权',
      description: '解锁所有基础账本特权',
      permanent: true
    },
    {
      id: 'advanced_privileges_trial',
      name: '全进阶特权30天免费体验',
      description: '30天内免费体验所有进阶账本特权',
      duration: 30
    },
    {
      id: 'career_profile',
      name: '职业档案永久生成权限',
      description: '永久解锁个人职业信用档案生成权限',
      permanent: true
    }
  ],
  PIONEER_WORKER: [
    {
      id: 'pioneer_worker_tag',
      name: '平台认证先锋熟手终身标签',
      description: '技能认证免试升级，永久享受订单优先匹配权',
      permanent: true
    }
  ],
  PIONEER_FACTORY: [
    {
      id: 'factory_management_advanced',
      name: '工厂管理高级功能永久权限',
      description: '解锁工厂管理高级功能',
      permanent: true
    },
    {
      id: 'factory_reputation_display',
      name: '平台工厂口碑专区展示位1个月',
      description: '在平台工厂口碑专区展示1个月',
      duration: 30
    }
  ]
}

// 保存用户账本特权
export function saveUserLedgerPrivileges(userId, privileges) {
  const userPrivileges = uni.getStorageSync('userLedgerPrivileges') || {}
  userPrivileges[userId] = {
    ...userPrivileges[userId],
    ...privileges,
    updatedAt: new Date().toISOString()
  }
  uni.setStorageSync('userLedgerPrivileges', userPrivileges)
  return userPrivileges[userId]
}

// 获取用户账本特权
export function getUserLedgerPrivileges(userId) {
  const userPrivileges = uni.getStorageSync('userLedgerPrivileges') || {}
  return userPrivileges[userId] || {
    basic: false,
    advanced_2: false,
    advanced_5: false,
    advanced_10: false,
    highQualityRewards: [],
    teamRewards: [],
    launchRewards: []
  }
}

// 根据互评数量计算特权等级
export function calculatePrivilegeLevel(evaluationCount) {
  if (evaluationCount >= 10) {
    return PRIVILEGE_LEVELS.ADVANCED_10
  } else if (evaluationCount >= 5) {
    return PRIVILEGE_LEVELS.ADVANCED_5
  } else if (evaluationCount >= 2) {
    return PRIVILEGE_LEVELS.ADVANCED_2
  } else if (evaluationCount >= 1) {
    return PRIVILEGE_LEVELS.BASIC
  }
  return null
}

// 解锁基础特权
export function unlockBasicPrivileges(userId) {
  const privileges = getUserLedgerPrivileges(userId)
  privileges.basic = true
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁进阶特权
export function unlockAdvancedPrivileges(userId, evaluationCount) {
  const privileges = getUserLedgerPrivileges(userId)
  const level = calculatePrivilegeLevel(evaluationCount)
  
  switch (level) {
    case PRIVILEGE_LEVELS.ADVANCED_10:
      privileges.advanced_10 = true
    case PRIVILEGE_LEVELS.ADVANCED_5:
      privileges.advanced_5 = true
    case PRIVILEGE_LEVELS.ADVANCED_2:
      privileges.advanced_2 = true
    case PRIVILEGE_LEVELS.BASIC:
      privileges.basic = true
      break
  }
  
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁高质量评价奖励
export function unlockHighQualityRewards(userId) {
  const privileges = getUserLedgerPrivileges(userId)
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(startDate.getDate() + 90)
  
  privileges.highQualityRewards.push({
    rewards: HIGH_QUALITY_REWARDS,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  })
  
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁班组达标奖励
export function unlockTeamRewards(userId, isLeader = false) {
  const privileges = getUserLedgerPrivileges(userId)
  const rewards = isLeader ? TEAM_REWARDS.LEADER_REWARDS : TEAM_REWARDS.MEMBER_REWARDS
  
  // 为90天期限的奖励设置过期时间
  const timeLimitedRewards = rewards.map(reward => {
    if (reward.duration) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + reward.duration)
      return {
        ...reward,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }
    return reward
  })
  
  privileges.teamRewards.push({
    type: 'team_achievement',
    rewards: timeLimitedRewards,
    unlockedAt: new Date().toISOString()
  })
  
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁月度标杆班组奖励
export function unlockMonthlyTeamRewards(userId, isLeader = false) {
  const privileges = getUserLedgerPrivileges(userId)
  const rewards = isLeader ? MONTHLY_TEAM_REWARDS.LEADER_REWARDS : MONTHLY_TEAM_REWARDS.MEMBER_REWARDS
  
  privileges.teamRewards.push({
    type: 'monthly_champion',
    rewards,
    unlockedAt: new Date().toISOString()
  })
  
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁冷启动新人礼
export function unlockNewUserReward(userId) {
  const privileges = getUserLedgerPrivileges(userId)
  const timeLimitedRewards = LAUNCH_REWARDS.NEW_USER.map(reward => {
    if (reward.duration) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + reward.duration)
      return {
        ...reward,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }
    return reward
  })
  
  privileges.launchRewards.push({
    type: 'new_user',
    rewards: timeLimitedRewards,
    unlockedAt: new Date().toISOString()
  })
  
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁千名先锋熟手福利
export function unlockPioneerWorkerReward(userId) {
  const privileges = getUserLedgerPrivileges(userId)
  
  privileges.launchRewards.push({
    type: 'pioneer_worker',
    rewards: LAUNCH_REWARDS.PIONEER_WORKER,
    unlockedAt: new Date().toISOString()
  })
  
  return saveUserLedgerPrivileges(userId, privileges)
}

// 解锁标杆工厂班组福利
export function unlockPioneerFactoryReward(factoryId) {
  const factoryPrivileges = uni.getStorageSync('factoryLedgerPrivileges') || {}
  const timeLimitedRewards = LAUNCH_REWARDS.PIONEER_FACTORY.map(reward => {
    if (reward.duration) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + reward.duration)
      return {
        ...reward,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }
    return reward
  })
  
  factoryPrivileges[factoryId] = {
    ...factoryPrivileges[factoryId],
    launchRewards: [
      ...(factoryPrivileges[factoryId]?.launchRewards || []),
      {
        type: 'pioneer_factory',
        rewards: timeLimitedRewards,
        unlockedAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  }
  
  uni.setStorageSync('factoryLedgerPrivileges', factoryPrivileges)
  return factoryPrivileges[factoryId]
}

// 检查特权是否有效
export function checkPrivilegeValidity(privilege) {
  if (privilege.permanent) {
    return true
  }
  if (privilege.endDate) {
    return new Date() <= new Date(privilege.endDate)
  }
  return false
}

// 获取用户有效特权列表
export function getValidPrivileges(userId) {
  const privileges = getUserLedgerPrivileges(userId)
  const validPrivileges = []
  
  // 基础特权
  if (privileges.basic) {
    validPrivileges.push(...BASIC_PRIVILEGES)
  }
  
  // 进阶特权
  if (privileges.advanced_2) {
    validPrivileges.push(...ADVANCED_PRIVILEGES[PRIVILEGE_LEVELS.ADVANCED_2])
  }
  if (privileges.advanced_5) {
    validPrivileges.push(...ADVANCED_PRIVILEGES[PRIVILEGE_LEVELS.ADVANCED_5])
  }
  if (privileges.advanced_10) {
    validPrivileges.push(...ADVANCED_PRIVILEGES[PRIVILEGE_LEVELS.ADVANCED_10])
  }
  
  // 高质量评价奖励
  if (privileges.highQualityRewards) {
    privileges.highQualityRewards.forEach(reward => {
      reward.rewards.forEach(item => {
        if (checkPrivilegeValidity(item)) {
          validPrivileges.push(item)
        }
      })
    })
  }
  
  // 班组奖励
  if (privileges.teamRewards) {
    privileges.teamRewards.forEach(reward => {
      reward.rewards.forEach(item => {
        if (checkPrivilegeValidity(item)) {
          validPrivileges.push(item)
        }
      })
    })
  }
  
  // 冷启动奖励
  if (privileges.launchRewards) {
    privileges.launchRewards.forEach(reward => {
      reward.rewards.forEach(item => {
        if (checkPrivilegeValidity(item)) {
          validPrivileges.push(item)
        }
      })
    })
  }
  
  return validPrivileges
}

// 检查用户是否拥有特定特权
export function hasPrivilege(userId, privilegeId) {
  const validPrivileges = getValidPrivileges(userId)
  return validPrivileges.some(privilege => privilege.id === privilegeId)
}

// 重置用户特权（用于异常评价处理）
export function resetUserPrivileges(userId) {
  const userPrivileges = uni.getStorageSync('userLedgerPrivileges') || {}
  userPrivileges[userId] = {
    basic: false,
    advanced_2: false,
    advanced_5: false,
    advanced_10: false,
    highQualityRewards: [],
    teamRewards: [],
    launchRewards: [],
    resetAt: new Date().toISOString()
  }
  uni.setStorageSync('userLedgerPrivileges', userPrivileges)
  return userPrivileges[userId]
}

// 获取特权等级对应的所有特权
export function getPrivilegesByLevel(level) {
  const privileges = []
  
  if (level === PRIVILEGE_LEVELS.BASIC || 
      level === PRIVILEGE_LEVELS.ADVANCED_2 || 
      level === PRIVILEGE_LEVELS.ADVANCED_5 || 
      level === PRIVILEGE_LEVELS.ADVANCED_10) {
    privileges.push(...BASIC_PRIVILEGES)
  }
  
  if (level === PRIVILEGE_LEVELS.ADVANCED_2 || 
      level === PRIVILEGE_LEVELS.ADVANCED_5 || 
      level === PRIVILEGE_LEVELS.ADVANCED_10) {
    privileges.push(...ADVANCED_PRIVILEGES[PRIVILEGE_LEVELS.ADVANCED_2])
  }
  
  if (level === PRIVILEGE_LEVELS.ADVANCED_5 || 
      level === PRIVILEGE_LEVELS.ADVANCED_10) {
    privileges.push(...ADVANCED_PRIVILEGES[PRIVILEGE_LEVELS.ADVANCED_5])
  }
  
  if (level === PRIVILEGE_LEVELS.ADVANCED_10) {
    privileges.push(...ADVANCED_PRIVILEGES[PRIVILEGE_LEVELS.ADVANCED_10])
  }
  
  return privileges
}

// 导出特权常量
export { PRIVILEGE_LEVELS, BASIC_PRIVILEGES, ADVANCED_PRIVILEGES, HIGH_QUALITY_REWARDS, TEAM_REWARDS, MONTHLY_TEAM_REWARDS, LAUNCH_REWARDS }
