// 工厂积分管理工具

// 初始化工厂积分
export function initFactoryScore(companyId) {
  const scoreData = {
    score: 100, // 初始积分
    lastUpdate: new Date().toISOString(),
    history: []
  }
  uni.setStorageSync(`factoryScore_${companyId}`, scoreData)
  return scoreData
}

// 获取工厂积分
export function getFactoryScore(companyId) {
  const scoreData = uni.getStorageSync(`factoryScore_${companyId}`)
  if (!scoreData) {
    return initFactoryScore(companyId)
  }
  return scoreData
}

// 更新工厂积分
export function updateFactoryScore(companyId, change, reason, type = 'add') {
  const scoreData = getFactoryScore(companyId)
  const scoreChange = type === 'add' ? change : -change
  
  scoreData.score += scoreChange
  scoreData.lastUpdate = new Date().toISOString()
  scoreData.history.push({
    id: Date.now(),
    change: scoreChange,
    reason: reason,
    date: new Date().toISOString()
  })
  
  uni.setStorageSync(`factoryScore_${companyId}`, scoreData)
  return scoreData
}

// 检查并应用每日登录积分
export function checkDailyLoginScore(companyId) {
  const lastLogin = uni.getStorageSync(`lastLogin_${companyId}`)
  const today = new Date().toDateString()
  
  if (lastLogin !== today) {
    uni.setStorageSync(`lastLogin_${companyId}`, today)
    return updateFactoryScore(companyId, 2, '每日登录', 'add')
  }
  return getFactoryScore(companyId)
}

// 应用认证加分
export function applyCertificationScore(companyId, certificationType) {
  if (certificationType === 'basic') {
    return updateFactoryScore(companyId, 30, '基础认证', 'add')
  } else if (certificationType === 'vip') {
    return updateFactoryScore(companyId, 60, 'VIP实力认证', 'add')
  }
  return getFactoryScore(companyId)
}

// 应用违规扣分
export function applyViolationScore(companyId, violationType) {
  switch (violationType) {
    case 'fake_data':
      return updateFactoryScore(companyId, 100, '资料虚假/造假', 'subtract')
    case 'fake_recruitment':
      return updateFactoryScore(companyId, 50, '发布虚假招工', 'subtract')
    case 'complaint':
      return updateFactoryScore(companyId, 50, '工人投诉并核实', 'subtract')
    case 'abuse_recruitment':
      return updateFactoryScore(companyId, 20, '重复滥发招工', 'subtract')
    case 'malicious_rejection':
      return updateFactoryScore(companyId, 80, '恶意拒招/辱骂工人', 'subtract')
    default:
      return getFactoryScore(companyId)
  }
}

// 获取工厂排名等级
export function getFactoryRankLevel(score) {
  if (score <= -50) {
    return {
      level: 4,
      name: '严重违规',
      description: '隐藏工厂，不可被工人搜到'
    }
  } else if (score <= 0) {
    return {
      level: 3,
      name: '限制状态',
      description: '限制联系工人，仅可浏览'
    }
  } else if (score < 50) {
    return {
      level: 2,
      name: '排名靠后',
      description: '排名靠后，减少曝光'
    }
  } else {
    return {
      level: 1,
      name: '正常状态',
      description: '正常展示，排名根据积分'
    }
  }
}

// 获取积分规则文本
export function getScoreRulesText() {
  return `# 衣起赚 - 工厂积分（排名权重）规则

## 积分总规则
- 工厂初始积分：100分
- 排名逻辑：积分越高，排名越靠前
- 积分每日更新，实时影响展示排序
- 积分无上限、无下限（可负分）

## 加分规则
1. **认证加分**
   - 基础认证（营业执照）：+30分
   - VIP实力认证（执照+场地+规模）：+60分

2. **付费/会员加分**
   - 开通VIP会员：+50分
   - 招工信息置顶：+100分（时效内有效）
   - 充值消费：+10分/每笔（每月上限30分）

3. **活跃度加分**
   - 每日登录：+2分（每日限1次）
   - 完善工厂资料（100%完成）：+10分（一次性）
   - 发布招工信息：+15分/条（每日上限1条）
   - 主动联系工人：+5分/天（每日上限5分）
   - 工人查看/咨询工厂：+3分/次（每日上限10分）

4. **信誉/好评加分**
   - 获得工人好评：+5分/条
   - 30天无投诉：+20分
   - 按时结薪、无纠纷：+10分/月

## 扣分规则
1. **资料/认证问题**
   - 资料虚假/造假：-100分，并取消认证
   - 认证过期未更新：-30分

2. **招工行为违规**
   - 发布虚假招工：-50分/次
   - 重复滥发招工：-20分/次
   - 招工信息下架/删除：-10分/次

3. **工人投诉/差评**
   - 工人投诉并核实：-50分/次
   - 工人差评：-5分/条
   - 恶意拒招/辱骂工人：-80分/次

4. **不活跃扣分**
   - 7天未登录：-10分
   - 30天未发布招工：-20分

## 处罚等级
1. **积分＜50分**：排名靠后，减少曝光
2. **积分≤0分**：限制联系工人，仅可浏览
3. **积分≤-50分**：隐藏工厂，不可被工人搜到
4. **严重违规**：直接封号，永不展示`
}
