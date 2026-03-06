// 劳资双方互评系统工具

// 工人对工厂/班组长评价维度
const WORKER_EVALUATION_DIMENSIONS = {
 准时度: '工资发放准时度',
 透明度: '工价透明度',
 友好度: '管理友好度'
};

// 工人评价标签
const WORKER_EVALUATION_TAGS = [
  '发薪准时',
  '工价透明',
  '管理规范',
  '加班少',
  '包吃住'
];

// 工厂/班组长对工人评价维度
const FACTORY_EVALUATION_DIMENSIONS = {
 稳定性: '出勤稳定性',
 质量: '做工质量',
 配合度: '配合度'
};

// 工厂评价标签
const FACTORY_EVALUATION_TAGS = [
  '手艺好',
  '出勤稳',
  '不旷工',
  '配合度高'
];

// 创建评价
function createEvaluation(data) {
  const evaluation = {
    id: Date.now(),
    userId: data.userId,
    targetId: data.targetId, // 被评价对象ID
    targetType: data.targetType, // factory 或 worker
    reconciliationId: data.reconciliationId,
    rating: data.rating, // 星级评分
    dimensions: data.dimensions, // 维度评分
    tags: data.tags || [], // 选择的标签
    comment: data.comment || '', // 文字留言
    isAnonymous: data.isAnonymous || true,
    createdAt: new Date().toISOString()
  };
  
  // 保存评价
  const evaluations = uni.getStorageSync('workEvaluations') || [];
  evaluations.push(evaluation);
  uni.setStorageSync('workEvaluations', evaluations);
  
  return evaluation;
}

// 获取工人对工厂的评价
function getWorkerEvaluationsForFactory(factoryId) {
  const evaluations = uni.getStorageSync('workEvaluations') || [];
  return evaluations.filter(eval => 
    eval.targetType === 'factory' && 
    eval.targetId === factoryId
  );
}

// 获取工厂对工人的评价
function getFactoryEvaluationsForWorker(workerId) {
  const evaluations = uni.getStorageSync('workEvaluations') || [];
  return evaluations.filter(eval => 
    eval.targetType === 'worker' && 
    eval.targetId === workerId
  );
}

// 计算工厂平均评分
function calculateFactoryAverageRating(factoryId) {
  const evaluations = getWorkerEvaluationsForFactory(factoryId);
  if (evaluations.length === 0) return 0;
  
  const totalRating = evaluations.reduce((sum, eval) => sum + eval.rating, 0);
  return totalRating / evaluations.length;
}

// 计算工人平均评分
function calculateWorkerAverageRating(workerId) {
  const evaluations = getFactoryEvaluationsForWorker(workerId);
  if (evaluations.length === 0) return 0;
  
  const totalRating = evaluations.reduce((sum, eval) => sum + eval.rating, 0);
  return totalRating / evaluations.length;
}

// 同步评价结果到工厂评级体系
function syncToFactoryRating(factoryId) {
  const avgRating = calculateFactoryAverageRating(factoryId);
  
  // 更新工厂评级
  const factories = uni.getStorageSync('factories') || [];
  const factory = factories.find(f => f.id === factoryId);
  
  if (factory) {
    factory.rating = avgRating;
    factory.ratingCount = getWorkerEvaluationsForFactory(factoryId).length;
    
    // 根据评分更新工厂等级
    if (avgRating >= 4.5) {
      factory.level = 'A+';
    } else if (avgRating >= 4.0) {
      factory.level = 'A';
    } else if (avgRating >= 3.5) {
      factory.level = 'B+';
    } else if (avgRating >= 3.0) {
      factory.level = 'B';
    } else {
      factory.level = 'C';
    }
    
    uni.setStorageSync('factories', factories);
  }
}

// 同步评价结果到工人求职档案
function syncToWorkerProfile(workerId) {
  const avgRating = calculateWorkerAverageRating(workerId);
  
  // 更新工人档案
  const workers = uni.getStorageSync('workers') || [];
  const worker = workers.find(w => w.id === workerId);
  
  if (worker) {
    worker.rating = avgRating;
    worker.ratingCount = getFactoryEvaluationsForWorker(workerId).length;
    
    // 根据评分更新工人标签
    const tags = [];
    if (avgRating >= 4.5) {
      tags.push('优秀工人');
      tags.push('推荐优先');
    } else if (avgRating >= 4.0) {
      tags.push('良好工人');
    }
    
    worker.tags = [...new Set([...(worker.tags || []), ...tags])];
    uni.setStorageSync('workers', workers);
  }
}

// 导出模块
export default {
  createEvaluation,
  getWorkerEvaluationsForFactory,
  getFactoryEvaluationsForWorker,
  calculateFactoryAverageRating,
  calculateWorkerAverageRating,
  syncToFactoryRating,
  syncToWorkerProfile,
  WORKER_EVALUATION_DIMENSIONS,
  WORKER_EVALUATION_TAGS,
  FACTORY_EVALUATION_DIMENSIONS,
  FACTORY_EVALUATION_TAGS
};