// 衣起赚·工厂信用等级与快速认证规则系统

// 工厂5级信用等级定义
const factoryLevels = {
  'S': {
    name: 'S级（最高）',
    thresholds: {
      totalClosedPay: 1000,          // 累计闭环发薪≥1000次
      closedPayRate: 1,               // 100%入职工人完成平台收薪确认
      continuousPayMonth: 12,         // 连续12个月无发薪投诉
      workerGoodRate: 0.95,           // 工人综合好评率≥95%
      totalInviteFactory: 5,           // 累计有效拉新≥5家工厂
      totalInviteWorker: 100,          // 累计有效拉新≥100名工人
      monthlyLoginDays: 28             // 月均连续登录≥28天
    },
    benefits: [
      '岗位最高权重曝光，每日免费3次岗位置顶',
      '每日自动推送10-20份高匹配工人简历',
      '全平台专属「S级诚信大厂」标签',
      '高级用工工具免费使用+1对1专属服务'
    ],
    color: '#FFD700',
    icon: '🏆'
  },
  'A': {
    name: 'A级',
    thresholds: {
      totalClosedPay: 200,           // 累计闭环发薪≥200次
      closedPayRate: 0.95,           // 95%以上入职工人完成平台收薪确认
      continuousPayMonth: 6,          // 连续6个月无发薪投诉
      workerGoodRate: 0.9,            // 工人综合好评率≥90%
      totalInviteFactory: 2,          // 累计有效拉新≥2家工厂
      totalInviteWorker: 30,           // 累计有效拉新≥30名工人
      monthlyLoginDays: 22            // 月均连续登录≥22天
    },
    benefits: [
      '岗位高权重曝光，每日免费1次岗位置顶',
      '每日自动推送5-10份高匹配工人简历',
      '专属「A级优质稳定工厂」标签',
      '标准版用工工具免费使用'
    ],
    color: '#4169E1',
    icon: '⭐'
  },
  'B': {
    name: 'B级',
    thresholds: {
      totalClosedPay: 50,            // 累计闭环发薪≥50次
      closedPayRate: 0.9,             // 90%以上入职工人完成平台收薪确认
      continuousPayMonth: 3,           // 连续3个月无发薪投诉
      workerGoodRate: 0.85,            // 工人综合好评率≥85%
      monthlyLoginDays: 15             // 月均连续登录≥15天
    },
    benefits: [
      '岗位正常权重曝光',
      '可使用积分兑换岗位置顶、人才推送',
      '专属「B级稳定合规工厂」标签',
      '基础用工工具免费使用'
    ],
    color: '#32CD32',
    icon: '✓'
  },
  'C': {
    name: 'C级（新入驻）',
    thresholds: {
      totalClosedPay: 0,              // 新入驻工厂，或累计闭环发薪<50次
      continuousPayMonth: 0           // 连续合规发薪<3个月
    },
    benefits: [
      '岗位基础权重曝光',
      '完成首笔闭环发薪奖励100积分',
      '可通过快速通道升级B级'
    ],
    color: '#FF8C00',
    icon: '🌱'
  },
  'D': {
    name: 'D级（风险）',
    thresholds: {
      closedPayRate: 0.8,             // 闭环发薪占比<80%
      workerGoodRate: 0.8,            // 工人好评率<80%
      monthlyLoginDays: 0,             // 连续60天未登录
      violationCount: 1                // 有虚假招聘、恶意欠薪等违规记录
    },
    benefits: [
      '岗位曝光权重降低80%，每月限发3个岗位',
      '暂停积分获取与所有权益兑换',
      '整改完成后可恢复为C级'
    ],
    color: '#FF4500',
    icon: '⚠️'
  }
};

// B级快速认证绿色通道规则
const fastTrackRules = {
  channels: {
    'recruitment': {
      name: '拉新达标通道',
      conditions: [
        { type: 'inviteWorker', count: 15 },  // 累计有效拉新≥15名工人
        { type: 'inviteFactory', count: 2 }    // 累计有效拉新≥2家工厂
      ],
      autoVerify: true,  // 系统自动核验达标后直接升级
      pointsReward: 500
    },
    'poster': {
      name: '海报推广通道',
      conditions: [
        {
          type: 'offline',
          description: '海报张贴在厂门口醒目位置，连续7天，提交3张不同日期的实拍图'
        },
        {
          type: 'online',
          description: '海报发送至≥5个200人以上的服装/招工群，提交带群名、发送时间的截图'
        }
      ],
      autoVerify: false,  // 需要人工审核
      pointsReward: 300
    }
  },
  maintenance: {
    requiredPayments: 5,  // 升级后需在30天内完成≥5笔有效闭环发薪
    gracePeriod: 30,      // 30天宽限期
    demotionReason: '未在30天内完成5笔有效闭环发薪'
  },
  penalties: {
    fraud: {
      action: 'demoteToD',  // 直接降为D级
      duration: 180,         // 6个月内不可再次申请
      reason: 'P图造假、虚假拉新等违规行为'
    }
  }
};

// 积分规则
const pointsSystem = {
  // 积分获取规则
  earnings: {
    closedPay: 1,  // 每完成1次有效闭环发薪
    inviteFactory: {
      'C': 100,
      'B': 200,
      'A': 500,
      'S': 1000
    },
    inviteWorker: {
      'C': 5,
      'B': 10,
      'A': 30,
      'S': 50
    },
    continuousLogin: {
      'B': 100,  // 连续登录满30天
      'A': 200,
      'S': 500
    },
    fastTrack: 500  // 完成快速认证通道
  },
  // 积分兑换权益
  exchanges: [
    {
      id: 'topPosition1h',
      name: '岗位置顶1小时',
      points: 500
    },
    {
      id: 'talentPush',
      name: '精准人才推送1次（5份匹配简历）',
      points: 1000
    },
    {
      id: 'homepageRecommend2h',
      name: '全平台首页推荐2小时',
      points: 2000
    },
    {
      id: 'promotionTag1m',
      name: '专属推广标签1个月',
      points: 5000
    },
    {
      id: 'advancedTools1m',
      name: '高级用工工具1个月使用权',
      points: 10000
    }
  ]
};

// 等级评定权重
const levelEvaluationWeights = {
  closedPay: 0.45,       // 闭环发薪45%
  workerEvaluation: 0.25, // 工人评价25%
  recruitment: 0.15,      // 拉新贡献15%
  platformActivity: 0.1,  // 平台活跃10%
  compliance: 0.05        // 合规经营5%
};

// 获取工厂等级
function getFactoryLevel(factoryData) {
  // 检查D级条件（一票否决）
  if (
    (factoryData.closedPayRate < 0.8) ||
    (factoryData.workerGoodRate < 0.8) ||
    (factoryData.monthlyLoginDays === 0 && factoryData.lastLoginDays > 60) ||
    (factoryData.violationCount > 0)
  ) {
    return 'D';
  }
  
  // 检查S级条件
  if (
    factoryData.totalClosedPay >= 1000 &&
    factoryData.closedPayRate >= 1 &&
    factoryData.continuousPayMonth >= 12 &&
    factoryData.workerGoodRate >= 0.95 &&
    (factoryData.totalInviteFactory >= 5 || factoryData.totalInviteWorker >= 100) &&
    factoryData.monthlyLoginDays >= 28
  ) {
    return 'S';
  }
  
  // 检查A级条件
  if (
    factoryData.totalClosedPay >= 200 &&
    factoryData.closedPayRate >= 0.95 &&
    factoryData.continuousPayMonth >= 6 &&
    factoryData.workerGoodRate >= 0.9 &&
    (factoryData.totalInviteFactory >= 2 || factoryData.totalInviteWorker >= 30) &&
    factoryData.monthlyLoginDays >= 22
  ) {
    return 'A';
  }
  
  // 检查B级条件
  if (
    factoryData.totalClosedPay >= 50 &&
    factoryData.closedPayRate >= 0.9 &&
    factoryData.continuousPayMonth >= 3 &&
    factoryData.workerGoodRate >= 0.85 &&
    factoryData.monthlyLoginDays >= 15
  ) {
    return 'B';
  }
  
  // 默认C级
  return 'C';
}

// 计算等级进度
function calculateLevelProgress(factoryData) {
  const currentLevel = getFactoryLevel(factoryData);
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progress: 100,
      details: {}
    };
  }
  
  const thresholds = factoryLevels[nextLevel].thresholds;
  const progressDetails = {};
  let totalWeight = 0;
  let weightedProgress = 0;
  
  // 计算各项指标的进度
  Object.keys(thresholds).forEach(key => {
    const target = thresholds[key];
    const current = factoryData[key] || 0;
    const progress = Math.min(1, current / target);
    progressDetails[key] = {
      current,
      target,
      progress: Math.round(progress * 100)
    };
    
    // 应用权重
    const weight = getWeightForMetric(key);
    totalWeight += weight;
    weightedProgress += progress * weight;
  });
  
  return {
    currentLevel,
    nextLevel,
    progress: Math.round((weightedProgress / totalWeight) * 100),
    details: progressDetails
  };
}

// 获取下一级别
function getNextLevel(currentLevel) {
  const levels = ['C', 'B', 'A', 'S'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

// 获取指标权重
function getWeightForMetric(metric) {
  switch (metric) {
    case 'totalClosedPay':
    case 'closedPayRate':
    case 'continuousPayMonth':
      return levelEvaluationWeights.closedPay;
    case 'workerGoodRate':
      return levelEvaluationWeights.workerEvaluation;
    case 'totalInviteFactory':
    case 'totalInviteWorker':
      return levelEvaluationWeights.recruitment;
    case 'monthlyLoginDays':
      return levelEvaluationWeights.platformActivity;
    case 'violationCount':
      return levelEvaluationWeights.compliance;
    default:
      return 0;
  }
}

// 检查快速认证资格
function checkFastTrackEligibility(factoryData) {
  return factoryData.level === 'C';
}

// 检查拉新达标通道
function checkRecruitmentChannel(factoryData) {
  return factoryData.totalInviteWorker >= 15 || factoryData.totalInviteFactory >= 2;
}

// 计算积分奖励
function calculatePointsReward(action, factoryData) {
  const level = factoryData.level || 'C';
  
  switch (action.type) {
    case 'closedPay':
      return pointsSystem.earnings.closedPay;
    case 'inviteFactory':
      return pointsSystem.earnings.inviteFactory[level] || 0;
    case 'inviteWorker':
      return pointsSystem.earnings.inviteWorker[level] || 0;
    case 'continuousLogin':
      return pointsSystem.earnings.continuousLogin[level] || 0;
    case 'fastTrack':
      return pointsSystem.earnings.fastTrack;
    default:
      return 0;
  }
}

// 导出工厂等级系统API
export default {
  factoryLevels,
  fastTrackRules,
  pointsSystem,
  levelEvaluationWeights,
  getFactoryLevel,
  calculateLevelProgress,
  checkFastTrackEligibility,
  checkRecruitmentChannel,
  calculatePointsReward
};
