// 工序高低频动态计算工具

// 模拟工人档案数据（实际应从数据库获取）
const mockWorkerArchive = {
  1: {
    worker_id: 1,
    worker_name: '张三',
    worker_phone: '13800138000',
    good_at_operations: [
      { detail_operation_id: 1, skill_level: 3 }, // 精通
      { detail_operation_id: 2, skill_level: 2 }, // 熟练
      { detail_operation_id: 3, skill_level: 1 }  // 入门
    ]
  },
  2: {
    worker_id: 2,
    worker_name: '李四',
    worker_phone: '13900139000',
    good_at_operations: [
      { detail_operation_id: 2, skill_level: 3 },
      { detail_operation_id: 4, skill_level: 2 }
    ]
  }
};

// 模拟计件账单数据（实际应从数据库获取）
const mockPieceworkBill = [
  { bill_id: 1, worker_id: 1, detail_operation_id: 1, finish_num: 5, finish_time: new Date('2026-02-20'), wage: 50 },
  { bill_id: 2, worker_id: 1, detail_operation_id: 1, finish_num: 8, finish_time: new Date('2026-02-25'), wage: 80 },
  { bill_id: 3, worker_id: 1, detail_operation_id: 2, finish_num: 3, finish_time: new Date('2026-02-22'), wage: 30 },
  { bill_id: 4, worker_id: 1, detail_operation_id: 3, finish_num: 2, finish_time: new Date('2026-02-15'), wage: 20 },
  { bill_id: 5, worker_id: 2, detail_operation_id: 2, finish_num: 10, finish_time: new Date('2026-02-21'), wage: 100 },
  { bill_id: 6, worker_id: 2, detail_operation_id: 4, finish_num: 6, finish_time: new Date('2026-02-23'), wage: 60 }
];

// 模拟GSD工序数据（实际应从数据库获取）
const mockGsdOperations = [
  { detail_operation_id: 1, detail_operation_name: '平车合肩缝', basic_operation_id: 1, basic_operation_name: '平车' },
  { detail_operation_id: 2, detail_operation_name: '平车合侧缝', basic_operation_id: 1, basic_operation_name: '平车' },
  { detail_operation_id: 3, detail_operation_name: '锁眼', basic_operation_id: 2, basic_operation_name: '特种机' },
  { detail_operation_id: 4, detail_operation_name: '整烫', basic_operation_id: 3, basic_operation_name: '后道' }
];

// 计算工人近N天的工序完成统计
export function calculateWorkerOperationStats(workerId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // 筛选工人近N天的账单
  const workerBills = mockPieceworkBill.filter(bill => 
    bill.worker_id === workerId && 
    new Date(bill.finish_time) >= cutoffDate
  );
  
  // 统计各工序完成量
  const operationStats = {};
  let totalFinishNum = 0;
  
  workerBills.forEach(bill => {
    if (!operationStats[bill.detail_operation_id]) {
      operationStats[bill.detail_operation_id] = 0;
    }
    operationStats[bill.detail_operation_id] += bill.finish_num;
    totalFinishNum += bill.finish_num;
  });
  
  // 计算各工序占比
  Object.keys(operationStats).forEach(opId => {
    operationStats[opId] = {
      total_finish_num: operationStats[opId],
      ratio: totalFinishNum > 0 ? operationStats[opId] / totalFinishNum : 0
    };
  });
  
  return { operationStats, totalFinishNum };
}

// 获取工人擅长工序及等级
export function getWorkerSkills(workerId) {
  const worker = mockWorkerArchive[workerId];
  if (!worker) return {};
  
  const skills = {};
  worker.good_at_operations.forEach(item => {
    skills[item.detail_operation_id] = item.skill_level;
  });
  
  return skills;
}

// 动态判定工序高低频
export function calculateProcessFrequency(workerId, days = 30) {
  // 获取工人技能
  const workerSkills = getWorkerSkills(workerId);
  
  // 计算工人近N天的工序统计
  const { operationStats } = calculateWorkerOperationStats(workerId, days);
  
  // 高低频判定结果
  const frequencyResults = [];
  
  // 遍历所有可能的工序（实际应从GSD工序表获取）
  mockGsdOperations.forEach(op => {
    const skillLevel = workerSkills[op.detail_operation_id] || 0;
    const stat = operationStats[op.detail_operation_id] || { total_finish_num: 0, ratio: 0 };
    
    // 判定规则：
    // 1. 熟练/精通（2/3）直接归为高频
    // 2. 近30天完成次数≥20或占比≥30%归为高频
    // 3. 否则为低频
    let frequency = '低频';
    if (skillLevel >= 2) {
      frequency = '高频';
    } else if (stat.total_finish_num >= 20 || stat.ratio >= 0.3) {
      frequency = '高频';
    }
    
    frequencyResults.push({
      detail_operation_id: op.detail_operation_id,
      detail_operation_name: op.detail_operation_name,
      big_category: op.basic_operation_name,
      frequency,
      skill_level: skillLevel,
      total_finish_num: stat.total_finish_num,
      ratio: stat.ratio
    });
  });
  
  return frequencyResults;
}

// 筛选招聘岗位（支持高频/低频/全品类）
export function filterRecruitmentPosts(workerId, filterType = 2, bigCategoryId = null, detailOperationId = null, days = 30) {
  // 计算工人工序高低频
  const frequencyResults = calculateProcessFrequency(workerId, days);
  
  // 构建工序频率映射
  const frequencyMap = {};
  frequencyResults.forEach(item => {
    frequencyMap[item.detail_operation_id] = item.frequency === '高频' ? 1 : 0;
  });
  
  // 模拟招聘岗位数据（实际应从数据库获取）
  const mockRecruitmentPosts = [
    { post_id: 1, company_name: '广州服装厂', work_address: '广州白云', salary: '6000-8000', detail_operation_id: 1, is_valid: 1 },
    { post_id: 2, company_name: '深圳制衣厂', work_address: '深圳宝安', salary: '5500-7500', detail_operation_id: 2, is_valid: 1 },
    { post_id: 3, company_name: '东莞服装公司', work_address: '东莞虎门', salary: '5000-7000', detail_operation_id: 3, is_valid: 1 },
    { post_id: 4, company_name: '佛山制衣有限公司', work_address: '佛山顺德', salary: '6500-8500', detail_operation_id: 4, is_valid: 1 }
  ];
  
  // 筛选岗位
  let filteredPosts = mockRecruitmentPosts.filter(post => {
    // 只显示有效岗位
    if (post.is_valid !== 1) return false;
    
    // 高低频筛选：全品类则跳过频率条件
    if (filterType !== 2) {
      const frequencyFlag = frequencyMap[post.detail_operation_id] || 0;
      if (frequencyFlag !== filterType) return false;
    }
    
    // 大类筛选：不传则不限制
    if (bigCategoryId) {
      const op = mockGsdOperations.find(o => o.detail_operation_id === post.detail_operation_id);
      if (!op || op.basic_operation_id !== bigCategoryId) return false;
    }
    
    // 细分工序筛选：不传则不限制
    if (detailOperationId && post.detail_operation_id !== detailOperationId) {
      return false;
    }
    
    return true;
  });
  
  // 添加工序和频率信息
  filteredPosts = filteredPosts.map(post => {
    const op = mockGsdOperations.find(o => o.detail_operation_id === post.detail_operation_id);
    const frequency = frequencyMap[post.detail_operation_id] === 1 ? '高频' : '低频';
    
    return {
      ...post,
      big_category: op ? op.basic_operation_name : '',
      small_category: op ? op.detail_operation_name : '',
      frequency
    };
  });
  
  // 按创建时间降序排序（模拟）
  filteredPosts.sort((a, b) => b.post_id - a.post_id);
  
  return filteredPosts;
}

// 获取工人高频工序
export function getHighFrequencyProcesses(workerId, days = 30) {
  const frequencyResults = calculateProcessFrequency(workerId, days);
  return frequencyResults.filter(item => item.frequency === '高频');
}

// 获取工人低频工序
export function getLowFrequencyProcesses(workerId, days = 30) {
  const frequencyResults = calculateProcessFrequency(workerId, days);
  return frequencyResults.filter(item => item.frequency === '低频');
}

