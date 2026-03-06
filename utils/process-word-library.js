// 工序词库管理工具

// 初始基础工序词库（正式生效词库）
const initialFormalLibrary = {
  "平车工": [
    "平车整件",
    "平车开袋",
    "平车上拉链",
    "平车上领",
    "平车合缝",
    "平车卷边",
    "电脑平车",
    "双针平车",
    "裁片拼接",
    "压线",
    "开袋",
    "装拉链",
    "绱领",
    "绱袖",
    "装裤腰",
    "贴袋",
    "卷边",
    "门襟明线",
    "双线平行压线",
    "裤袢车缝",
    "门襟双针",
    "肩线加固",
    "裤腰双针",
    "装饰双线",
    "袋口两端加固",
    "裤裆加固",
    "门襟止口加固",
    "拉链头加固",
    "裤袢加固",
    "衬衫侧缝埋夹",
    "裤子内侧缝埋夹",
    "袖缝埋夹",
    "夹克埋夹",
    "西裤裤脚暗缝",
    "大衣下摆暗缝",
    "裙边暗缝",
    "衬衫下摆挑缝",
    "弹性面料拼接",
    "花边缝制",
    "松紧带车缝",
    "裤脚加固",
    "装饰人字线"
  ],
  "拷边工": [
    "锁边",
    "拷边",
    "三线拷边",
    "四线拷边",
    "五线拷边",
    "特种缝纫机",
    "单层裁片锁边",
    "简单拼缝锁边",
    "袖口锁边",
    "下摆锁边",
    "双层裁片拼缝锁边",
    "针织衣片缝合",
    "侧缝拼缝锁边",
    "厚料拼缝锁边",
    "运动服侧缝",
    "防脱散加固拼缝",
    "针织领口折边",
    "袖口绷缝",
    "下摆折边",
    "装松紧带",
    "针织肩袖拼接",
    "无痕接缝",
    "裤腰绷缝",
    "装饰三线"
  ],
  "裁剪工": [
    "电剪",
    "裁床",
    "拉布",
    "裁剪"
  ],
  "烫工": [
    "大烫",
    "小烫",
    "整烫",
    "压烫",
    "烫台"
  ],
  "质检工": [
    "质检",
    "查货",
    "品质控制",
    "验货"
  ],
  "包装工": [
    "包装",
    "整理",
    "打包"
  ],
  "锁眼钉扣工": [
    "锁眼",
    "钉扣",
    "锁眼机",
    "钉扣机",
    "衬衫门襟锁眼",
    "裤子前片锁眼",
    "袋盖锁眼",
    "平扣扣眼",
    "西装门襟锁眼",
    "大衣锁眼",
    "纽扣眼加固",
    "装饰圆眼",
    "钉平扣",
    "钉四合扣",
    "钉按扣",
    "钉鸡眼扣",
    "多粒自动钉扣"
  ],
  "制版师": [
    "打版",
    "纸样",
    "版型设计",
    "排料"
  ],
  "样衣工": [
    "样衣制作",
    "样衣缝制",
    "样衣裁剪"
  ],
  "工艺员": [
    "工艺设计",
    "工艺制定",
    "工艺指导"
  ],
  "厂长": [
    "工厂管理",
    "生产管理",
    "人员管理"
  ],
  "车间主任": [
    "车间管理",
    "生产调度",
    "质量控制"
  ],
  "班组长": [
    "班组管理",
    "生产安排",
    "质量监督"
  ],
  "跟单员": [
    "订单跟进",
    "生产跟进",
    "客户沟通"
  ],
  "业务员": [
    "业务拓展",
    "客户开发",
    "订单洽谈"
  ],
  "采购": [
    "原材料采购",
    "供应商管理",
    "成本控制"
  ],
  "仓管": [
    "仓库管理",
    "物料管理",
    "库存盘点"
  ],
  "机修": [
    "设备维修",
    "机器保养",
    "故障排除"
  ],
  "电工": [
    "电气维修",
    "电路安装",
    "设备调试"
  ]
};

// 机种与工序的关联关系
const machineProcessMap = {
  "平车": ["裁片拼接", "压线", "开袋", "装拉链", "绱领", "绱袖", "装裤腰", "贴袋", "卷边", "门襟明线"],
  "双针": ["双线平行压线", "裤袢车缝", "门襟双针", "肩线加固", "裤腰双针", "装饰双线"],
  "三线拷边": ["单层裁片锁边", "简单拼缝锁边", "袖口锁边", "下摆锁边"],
  "四线拷边": ["双层裁片拼缝锁边", "针织衣片缝合", "侧缝拼缝锁边"],
  "五线拷边": ["厚料拼缝锁边", "运动服侧缝", "防脱散加固拼缝"],
  "小方头": ["针织领口折边", "袖口绷缝", "下摆折边", "装松紧带"],
  "大方头": ["针织肩袖拼接", "无痕接缝", "裤腰绷缝", "装饰三线"],
  "平头锁眼机": ["衬衫门襟锁眼", "裤子前片锁眼", "袋盖锁眼", "平扣扣眼"],
  "圆头锁眼机": ["西装门襟锁眼", "大衣锁眼", "纽扣眼加固", "装饰圆眼"],
  "钉扣机": ["钉平扣", "钉四合扣", "钉按扣", "钉鸡眼扣", "多粒自动钉扣"],
  "打枣车": ["袋口两端加固", "裤裆加固", "门襟止口加固", "拉链头加固", "裤袢加固"],
  "埋夹机": ["衬衫侧缝埋夹", "裤子内侧缝埋夹", "袖缝埋夹", "夹克埋夹"],
  "挑脚车": ["西裤裤脚暗缝", "大衣下摆暗缝", "裙边暗缝", "衬衫下摆挑缝"],
  "人字车": ["弹性面料拼接", "花边缝制", "松紧带车缝", "裤脚加固", "装饰人字线"]
};

// 候选池词库
let candidatePool = [];

// 搜索历史
let searchHistory = [];

// 岗位关联统计
let jobAssociation = {};

// 同义词映射
let synonymsMap = {};

// 词库使用统计
let usageStats = {};

// 初始化词库
function initWordLibrary() {
  // 从本地存储加载词库数据
  const storedFormalLibrary = uni.getStorageSync('formalWordLibrary');
  const storedCandidatePool = uni.getStorageSync('candidateWordPool');
  const storedSearchHistory = uni.getStorageSync('searchHistory');
  const storedJobAssociation = uni.getStorageSync('jobAssociation');
  
  if (storedFormalLibrary) {
    // 使用存储的词库
    Object.assign(initialFormalLibrary, storedFormalLibrary);
  } else {
    // 首次使用，存储初始词库
    uni.setStorageSync('formalWordLibrary', initialFormalLibrary);
  }
  
  if (storedCandidatePool) {
    candidatePool = storedCandidatePool;
  }
  
  if (storedSearchHistory) {
    searchHistory = storedSearchHistory;
  }
  
  if (storedJobAssociation) {
    // 将存储的数组转换回Set
    const parsedJobAssociation = {};
    for (const process in storedJobAssociation) {
      parsedJobAssociation[process] = {
        jobIds: new Set(storedJobAssociation[process].jobIds),
        lastUpdated: storedJobAssociation[process].lastUpdated
      };
    }
    jobAssociation = parsedJobAssociation;
  }
  
  const storedSynonymsMap = uni.getStorageSync('synonymsMap');
  if (storedSynonymsMap) {
    synonymsMap = storedSynonymsMap;
  } else {
    // 初始化默认同义词映射
    synonymsMap = {
      '锁边': ['拷边'],
      '拷边': ['锁边'],
      '冚车': ['坎车'],
      '坎车': ['冚车'],
      '打枣': ['打套结'],
      '打套结': ['打枣']
    };
    uni.setStorageSync('synonymsMap', synonymsMap);
  }
  
  const storedUsageStats = uni.getStorageSync('usageStats');
  if (storedUsageStats) {
    usageStats = storedUsageStats;
  }
  
  // 检查词库自动下线规则
  checkLibraryExpiration();
}

// 获取正式词库
function getFormalLibrary() {
  return initialFormalLibrary;
}

// 获取候选池
function getCandidatePool() {
  return candidatePool;
}

// 获取搜索历史
function getSearchHistory() {
  return searchHistory;
}

// 添加到候选池
function addToCandidatePool(word) {
  // 验证词的有效性
  if (!validateWord(word)) {
    return false;
  }
  
  // 检查是否已在正式词库中
  if (isInFormalLibrary(word)) {
    return false;
  }
  
  // 检查是否已在候选池中
  if (candidatePool.some(item => item.word === word)) {
    // 更新出现次数
    candidatePool = candidatePool.map(item => {
      if (item.word === word) {
        return {
          ...item,
          count: item.count + 1,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });
  } else {
    // 添加到候选池
    candidatePool.push({
      word,
      count: 1,
      firstAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      source: 'user_input'
    });
  }
  
  // 保存到本地存储
  uni.setStorageSync('candidateWordPool', candidatePool);
  
  // 检查是否满足进入正式词库的条件
  checkCandidatePromotion(word);
  
  return true;
}

// 记录搜索历史
function recordSearchHistory(word) {
  // 验证词的有效性
  if (!validateWord(word)) {
    return;
  }
  
  // 添加到搜索历史（去重，保持最新）
  searchHistory = searchHistory.filter(item => item !== word);
  searchHistory.unshift(word);
  
  // 限制历史记录数量
  if (searchHistory.length > 10) {
    searchHistory = searchHistory.slice(0, 10);
  }
  
  // 保存到本地存储
  uni.setStorageSync('searchHistory', searchHistory);
  
  // 检查是否需要添加到候选池
  if (!isInFormalLibrary(word)) {
    // 检查搜索次数
    const searchCount = searchHistory.filter(item => item === word).length;
    if (searchCount >= 2) {
      addToCandidatePool(word);
    }
  }
}

// 记录岗位关联
function recordJobAssociation(jobId, processes) {
  processes.forEach(process => {
    if (!jobAssociation[process]) {
      jobAssociation[process] = {
        jobIds: new Set(),
        lastUpdated: new Date().toISOString()
      };
    }
    jobAssociation[process].jobIds.add(jobId);
    jobAssociation[process].lastUpdated = new Date().toISOString();
  });
  
  // 保存到本地存储
  // 注意：Set需要转换为数组才能存储
  const serializedJobAssociation = {};
  for (const process in jobAssociation) {
    serializedJobAssociation[process] = {
      jobIds: Array.from(jobAssociation[process].jobIds),
      lastUpdated: jobAssociation[process].lastUpdated
    };
  }
  uni.setStorageSync('jobAssociation', serializedJobAssociation);
  
  // 检查候选池中相关工序的晋升条件
  processes.forEach(process => {
    if (!isInFormalLibrary(process)) {
      checkCandidatePromotion(process);
    }
  });
}

// 验证词的有效性
function validateWord(word) {
  // 空值检查
  if (!word || word.trim() === '') {
    return false;
  }
  
  // 长度检查
  if (word.length > 10) {
    return false;
  }
  
  // 纯数字检查
  if (/^\d+$/.test(word)) {
    return false;
  }
  
  // 纯符号检查
  if (/^[^\w\u4e00-\u9fa5]+$/.test(word)) {
    return false;
  }
  
  // 敏感词检查（简单示例）
  const sensitiveWords = ['违法', '诈骗', '色情'];
  return !sensitiveWords.some(sensitive => word.includes(sensitive));
}

// 检查词是否在正式词库中
function isInFormalLibrary(word) {
  for (const category in initialFormalLibrary) {
    if (initialFormalLibrary[category].includes(word)) {
      return true;
    }
  }
  return false;
}

// 检查候选词是否满足晋升条件
function checkCandidatePromotion(word) {
  const candidate = candidatePool.find(item => item.word === word);
  if (!candidate) return;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // 规则1：30天内累计出现次数≥5次
  if (candidate.count >= 5 && new Date(candidate.lastUpdated) >= thirtyDaysAgo) {
    promoteToFormalLibrary(word);
    return;
  }
  
  // 规则2：30天内关联发布的岗位数≥3个
  if (jobAssociation[word]) {
    const association = jobAssociation[word];
    if (new Date(association.lastUpdated) >= thirtyDaysAgo && association.jobIds.size >= 3) {
      promoteToFormalLibrary(word);
      return;
    }
  }
}

// 晋升到正式词库
function promoteToFormalLibrary(word) {
  // 简单分类逻辑，实际项目中可能需要更复杂的分类算法
  let category = "平车工";
  
  if (word.includes('平车')) {
    category = "平车工";
  } else if (word.includes('锁边') || word.includes('拷边')) {
    category = "拷边工";
  } else if (word.includes('裁')) {
    category = "裁剪工";
  } else if (word.includes('烫')) {
    category = "烫工";
  } else if (word.includes('质检') || word.includes('查货')) {
    category = "质检工";
  } else if (word.includes('包装')) {
    category = "包装工";
  } else if (word.includes('锁眼') || word.includes('钉扣')) {
    category = "锁眼钉扣工";
  } else if (word.includes('版') || word.includes('纸样')) {
    category = "制版师";
  } else if (word.includes('样衣')) {
    category = "样衣工";
  } else if (word.includes('工艺')) {
    category = "工艺员";
  } else if (word.includes('跟单')) {
    category = "跟单员";
  } else if (word.includes('业务')) {
    category = "业务员";
  } else if (word.includes('采购')) {
    category = "采购";
  } else if (word.includes('仓')) {
    category = "仓管";
  } else if (word.includes('机修')) {
    category = "机修";
  } else if (word.includes('电工')) {
    category = "电工";
  }
  
  // 添加到正式词库
  if (!initialFormalLibrary[category].includes(word)) {
    initialFormalLibrary[category].push(word);
    // 保存到本地存储
    uni.setStorageSync('formalWordLibrary', initialFormalLibrary);
  }
  
  // 从候选池中移除
  candidatePool = candidatePool.filter(item => item.word !== word);
  uni.setStorageSync('candidateWordPool', candidatePool);
  
  console.log(`工序词 "${word}" 已晋升到正式词库，分类：${category}`);
}

// 搜索工序词
function searchProcessWords(keyword) {
  const results = [];
  
  // 从正式词库搜索
  for (const category in initialFormalLibrary) {
    initialFormalLibrary[category].forEach(word => {
      if (word.includes(keyword)) {
        results.push({
          word,
          category,
          type: 'formal'
        });
      }
    });
  }
  
  // 从候选池搜索
  candidatePool.forEach(item => {
    if (item.word.includes(keyword)) {
      results.push({
        word: item.word,
        category: '候选',
        type: 'candidate',
        count: item.count
      });
    }
  });
  
  return results;
}

// 获取工序分类
function getProcessCategories() {
  return Object.keys(initialFormalLibrary).filter(category => {
    return category !== '针织类' && category !== '梭织类';
  });
}

// 获取指定分类的工序
function getProcessByCategory(category) {
  return initialFormalLibrary[category] || [];
}

// 添加同义词关联
function addSynonymAssociation(word, synonyms) {
  // 为每个同义词建立双向关联
  synonyms.forEach(synonym => {
    if (!synonymsMap[word]) {
      synonymsMap[word] = [];
    }
    if (!synonymsMap[synonym]) {
      synonymsMap[synonym] = [];
    }
    
    if (!synonymsMap[word].includes(synonym)) {
      synonymsMap[word].push(synonym);
    }
    if (!synonymsMap[synonym].includes(word)) {
      synonymsMap[synonym].push(word);
    }
  });
  
  // 保存到本地存储
  uni.setStorageSync('synonymsMap', synonymsMap);
}

// 移除同义词关联
function removeSynonymAssociation(word, synonym) {
  if (synonymsMap[word]) {
    synonymsMap[word] = synonymsMap[word].filter(item => item !== synonym);
  }
  if (synonymsMap[synonym]) {
    synonymsMap[synonym] = synonymsMap[synonym].filter(item => item !== word);
  }
  
  // 保存到本地存储
  uni.setStorageSync('synonymsMap', synonymsMap);
}

// 获取词的所有同义词
function getSynonyms(word) {
  return synonymsMap[word] || [];
}

// 记录词的使用情况
function recordUsage(word) {
  const now = new Date().toISOString();
  usageStats[word] = {
    lastUsed: now,
    useCount: (usageStats[word]?.useCount || 0) + 1
  };
  
  // 保存到本地存储
  uni.setStorageSync('usageStats', usageStats);
}

// 检查词库自动下线规则
function checkLibraryExpiration() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const wordsToRemove = [];
  
  // 检查正式词库中的词
  for (const category in initialFormalLibrary) {
    const words = initialFormalLibrary[category];
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      const usage = usageStats[word];
      
      // 如果90天内无使用记录，标记为下线
      if (!usage || new Date(usage.lastUsed) < ninetyDaysAgo) {
        wordsToRemove.push({ word, category });
      }
    }
  }
  
  // 执行下线操作
  wordsToRemove.forEach(({ word, category }) => {
    // 从正式词库中移除
    const index = initialFormalLibrary[category].indexOf(word);
    if (index > -1) {
      initialFormalLibrary[category].splice(index, 1);
    }
    
    // 添加到候选池
    addToCandidatePool(word);
    
    console.log(`工序词 "${word}" 已从正式词库下线，移至候选池`);
  });
  
  // 保存更新后的词库
  if (wordsToRemove.length > 0) {
    uni.setStorageSync('formalWordLibrary', initialFormalLibrary);
  }
}

// 搜索时考虑同义词
function searchWithSynonyms(keyword) {
  const results = searchProcessWords(keyword);
  const synonyms = getSynonyms(keyword);
  
  // 记录使用情况
  recordUsage(keyword);
  
  // 搜索同义词
  synonyms.forEach(synonym => {
    const synonymResults = searchProcessWords(synonym);
    // 去重添加
    synonymResults.forEach(result => {
      if (!results.some(item => item.word === result.word && item.category === result.category)) {
        results.push(result);
      }
    });
  });
  
  return results;
}

// 导出模块
export {
  initWordLibrary,
  getFormalLibrary,
  getCandidatePool,
  getSearchHistory,
  addToCandidatePool,
  recordSearchHistory,
  recordJobAssociation,
  validateWord,
  isInFormalLibrary,
  searchProcessWords,
  searchWithSynonyms,
  getProcessCategories,
  getProcessByCategory,
  addSynonymAssociation,
  removeSynonymAssociation,
  getSynonyms,
  machineProcessMap
};