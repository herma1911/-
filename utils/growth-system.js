// 衣起赚·稳工搞钱成长体系（冷启动专属版）

// 成长等级定义
const growthLevels = {
  'new': {
    name: '新手工友',
    description: '新用户初始等级，基础功能全覆盖',
    requirements: [
      '完成注册登录',
      '完善基础技能标签'
    ],
    benefits: [
      '可查看本省/当前所在市的服装旺季推荐',
      '可查看基础旺季时间、对应工种工价区间',
      '可使用基础招工筛选、记工记账全部基础功能'
    ]
  },
  'active': {
    name: '活跃搞钱人',
    description: '平台核心活跃用户，开放进阶高价值权益',
    requirements: [
      '连续记工满28天（解锁「月度稳厂达人」称号）',
      '累计记工满100条',
      '成功邀请2位工友完成注册',
      '成功入职平台合作工厂满1个月'
    ],
    benefits: [
      '新手工友全部权益',
      '可查看周边3个省份的完整旺季推荐地图',
      '可查看对应地区工厂的完整发薪信用记录、工人对账确认率',
      '可查看工厂发薪记录特权',
      '每日最多可查看30个精准匹配的旺季岗位',
      '可查看未来1个月的旺季预告，提前锁定高薪岗位',
      '报名旺季岗位，简历优先展示给工厂'
    ]
  },
  'senior': {
    name: '资深稳工大神',
    description: '平台核心种子用户，开放全部独家权益',
    requirements: [
      '连续记工满90天（解锁「季度长红打工人」称号）',
      '成功邀请3位及以上工友完成注册',
      '累计在平台记工满6个月，无断签超过3天的记录'
    ],
    benefits: [
      '活跃搞钱人全部权益',
      '解锁「全国可跑」权限，查看全国完整服装产业带旺季地图、全年工价走势预测',
      '可提前1-2个月预约全国任意地区的旺季岗位，工厂端优先对接',
      '开放专属「大神高薪岗」池，仅本等级用户可查看报名',
      '成功入职匹配的旺季岗位，可享受平台专属路费补贴',
      '无限制查看全平台所有工厂的发薪信用档案、工人真实评价',
      '报名任意岗位，简历自动置顶，工厂端第一时间查看',
      '可生成专属「全年全国搞钱最优路线」，按月份规划旺季地区、匹配岗位、预计全年收入'
    ]
  }
};

// 成长加速机制
const growthAccelerators = {
  inviteDeduction: 7, // 邀请1位工友注册抵扣7天连续记工
  firstCheckin: 5, // 首次记工获得5点成长加速值
  firstProfile: 3, // 首次完善简历获得3点成长加速值
  firstApply: 2 // 首次报名岗位获得2点成长加速值
};

// 获取用户成长等级
function getUserGrowthLevel(userData) {
  // 模拟用户数据，实际应从后端获取
  const userGrowthData = userData.growthData || {
    continuousCheckinDays: 0,
    totalCheckinCount: 0,
    inviteCount: 0,
    employmentDays: 0,
    growthPoints: 0
  };
  
  // 计算有效连续记工天数（考虑邀请抵扣）
  const effectiveContinuousDays = userGrowthData.continuousCheckinDays + (userGrowthData.inviteCount * growthAccelerators.inviteDeduction);
  
  // 检查资深稳工大神条件
  if (
    effectiveContinuousDays >= 90 ||
    userGrowthData.inviteCount >= 3 ||
    (userGrowthData.employmentDays >= 180 && userGrowthData.continuousCheckinDays >= 3)
  ) {
    return 'senior';
  }
  
  // 检查活跃搞钱人条件
  if (
    effectiveContinuousDays >= 28 ||
    userGrowthData.totalCheckinCount >= 100 ||
    userGrowthData.inviteCount >= 2 ||
    userGrowthData.employmentDays >= 30
  ) {
    return 'active';
  }
  
  // 默认新手工友
  return 'new';
}

// 获取等级进度
function getLevelProgress(userData) {
  const currentLevel = getUserGrowthLevel(userData);
  const userGrowthData = userData.growthData || {
    continuousCheckinDays: 0,
    totalCheckinCount: 0,
    inviteCount: 0,
    employmentDays: 0,
    growthPoints: 0
  };
  
  // 计算有效连续记工天数
  const effectiveContinuousDays = userGrowthData.continuousCheckinDays + (userGrowthData.inviteCount * growthAccelerators.inviteDeduction);
  
  let progress = 0;
  let nextLevel = null;
  let remaining = 0;
  
  switch (currentLevel) {
    case 'new':
      // 计算距离活跃搞钱人的进度
      const minDaysToActive = Math.min(
        28 - effectiveContinuousDays,
        100 - userGrowthData.totalCheckinCount,
        2 - userGrowthData.inviteCount,
        30 - userGrowthData.employmentDays
      );
      progress = Math.max(
        effectiveContinuousDays / 28,
        userGrowthData.totalCheckinCount / 100,
        userGrowthData.inviteCount / 2,
        userGrowthData.employmentDays / 30
      ) * 100;
      nextLevel = 'active';
      remaining = Math.max(0, minDaysToActive);
      break;
    case 'active':
      // 计算距离资深稳工大神的进度
      const minDaysToSenior = Math.min(
        90 - effectiveContinuousDays,
        3 - userGrowthData.inviteCount,
        180 - userGrowthData.employmentDays
      );
      progress = Math.max(
        effectiveContinuousDays / 90,
        userGrowthData.inviteCount / 3,
        userGrowthData.employmentDays / 180
      ) * 100;
      nextLevel = 'senior';
      remaining = Math.max(0, minDaysToSenior);
      break;
    case 'senior':
      progress = 100;
      nextLevel = null;
      remaining = 0;
      break;
  }
  
  return {
    currentLevel,
    progress: Math.min(100, Math.round(progress)),
    nextLevel,
    remaining,
    levelName: growthLevels[currentLevel].name
  };
}

// 获取等级权益
function getLevelBenefits(level) {
  return growthLevels[level]?.benefits || [];
}

// 获取等级要求
function getLevelRequirements(level) {
  return growthLevels[level]?.requirements || [];
}

// 计算推荐岗位数量限制
function getMaxRecommendations(level) {
  switch (level) {
    case 'new':
      return 999;
    case 'active':
      return 999;
    case 'senior':
      return 999;
    default:
      return 999;
  }
}

// 检查是否有权限查看特定功能
function checkPermission(level, feature) {
  switch (feature) {
    case 'nationalMap':
      return level === 'senior';
    case 'earlyReservation':
      return level === 'senior';
    case 'vipJobs':
      return level === 'senior';
    case 'travelSubsidy':
      return level === 'senior';
    case 'fullCreditInfo':
      return level === 'active' || level === 'senior';
    case 'nearbyProvinces':
      return level === 'active' || level === 'senior';
    case 'upcomingPreview':
      return level === 'active' || level === 'senior';
    case 'resumePriority':
      return level === 'active' || level === 'senior';
    default:
      return true;
  }
}

// 导出成长体系API
export default {
  growthLevels,
  growthAccelerators,
  getUserGrowthLevel,
  getLevelProgress,
  getLevelBenefits,
  getLevelRequirements,
  getMaxRecommendations,
  checkPermission
};