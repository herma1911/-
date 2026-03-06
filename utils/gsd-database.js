// GSD (General Sewing Data) 数据库模拟
// 包含服装行业标准工序和技能数据

const GSD_DATABASE = {
  // 工序分类
  categories: [
    {
      id: 'sewing',
      name: '缝制工序',
      description: '服装缝制过程中的各种工序'
    },
    {
      id: 'cutting',
      name: '裁剪工序',
      description: '服装裁剪过程中的各种工序'
    },
    {
      id: 'finishing',
      name: '后整理工序',
      description: '服装后整理过程中的各种工序'
    },
    {
      id: 'packaging',
      name: '包装工序',
      description: '服装包装过程中的各种工序'
    }
  ],
  
  // 标准工序数据
  processes: [
    // 缝制工序
    {
      id: 'sewing-001',
      categoryId: 'sewing',
      name: '平车',
      standardName: '平缝机操作',
      description: '使用平缝机进行基本缝合',
      skillLevel: '基础',
      standardTime: '0.5-1.0分钟/件'
    },
    {
      id: 'sewing-002',
      categoryId: 'sewing',
      name: '拷边',
      standardName: '包缝机操作',
      description: '使用包缝机进行边缘包边',
      skillLevel: '基础',
      standardTime: '0.3-0.8分钟/件'
    },
    {
      id: 'sewing-003',
      categoryId: 'sewing',
      name: '开口袋',
      standardName: '口袋缝制',
      description: '缝制服装口袋',
      skillLevel: '中级',
      standardTime: '1.0-2.0分钟/件'
    },
    {
      id: 'sewing-004',
      categoryId: 'sewing',
      name: '装拉链',
      standardName: '拉链安装',
      description: '安装服装拉链',
      skillLevel: '中级',
      standardTime: '1.5-2.5分钟/件'
    },
    {
      id: 'sewing-005',
      categoryId: 'sewing',
      name: '拉腰',
      standardName: '腰部缝制',
      description: '缝制服装腰部',
      skillLevel: '中级',
      standardTime: '0.8-1.5分钟/件'
    },
    {
      id: 'sewing-006',
      categoryId: 'sewing',
      name: '装领',
      standardName: '衣领安装',
      description: '安装服装衣领',
      skillLevel: '高级',
      standardTime: '1.2-2.2分钟/件'
    },
    {
      id: 'sewing-007',
      categoryId: 'sewing',
      name: '双针卷边',
      standardName: '双针卷边缝制',
      description: '使用双针机进行卷边缝制',
      skillLevel: '中级',
      standardTime: '0.6-1.2分钟/件'
    },
    {
      id: 'sewing-008',
      categoryId: 'sewing',
      name: '四针六线',
      standardName: '四针六线缝制',
      description: '使用四针六线机进行缝制',
      skillLevel: '高级',
      standardTime: '0.8-1.8分钟/件'
    },
    {
      id: 'sewing-009',
      categoryId: 'sewing',
      name: '无缝',
      standardName: '无缝缝制',
      description: '使用无缝设备进行缝制',
      skillLevel: '高级',
      standardTime: '1.0-2.0分钟/件'
    },
    {
      id: 'sewing-010',
      categoryId: 'sewing',
      name: '打枣',
      standardName: '加固缝',
      description: '进行加固缝处理',
      skillLevel: '基础',
      standardTime: '0.2-0.5分钟/件'
    },
    {
      id: 'sewing-011',
      categoryId: 'sewing',
      name: '锁边',
      standardName: '边缘锁边',
      description: '对服装边缘进行锁边处理',
      skillLevel: '基础',
      standardTime: '0.3-0.7分钟/件'
    },
    {
      id: 'sewing-012',
      categoryId: 'sewing',
      name: '钉扣',
      standardName: '纽扣安装',
      description: '安装服装纽扣',
      skillLevel: '基础',
      standardTime: '0.4-0.8分钟/件'
    },
    {
      id: 'sewing-013',
      categoryId: 'sewing',
      name: '牛仔裤埋夹',
      standardName: '牛仔裤埋夹缝制',
      description: '牛仔裤埋夹工序',
      skillLevel: '高级',
      standardTime: '1.5-2.5分钟/件'
    },
    {
      id: 'sewing-014',
      categoryId: 'sewing',
      name: '羽绒服充绒',
      standardName: '羽绒服充绒',
      description: '羽绒服充绒工序',
      skillLevel: '中级',
      standardTime: '2.0-3.0分钟/件'
    },
    
    // 裁剪工序
    {
      id: 'cutting-001',
      categoryId: 'cutting',
      name: '裁剪',
      standardName: '面料裁剪',
      description: '根据纸样裁剪面料',
      skillLevel: '中级',
      standardTime: '0.5-1.5分钟/层'
    },
    
    // 后整理工序
    {
      id: 'finishing-001',
      categoryId: 'finishing',
      name: '熨烫',
      standardName: '服装熨烫',
      description: '对服装进行熨烫处理',
      skillLevel: '中级',
      standardTime: '0.8-1.8分钟/件'
    },
    {
      id: 'finishing-002',
      categoryId: 'finishing',
      name: '大烫',
      standardName: '服装大烫',
      description: '对服装进行整体大烫',
      skillLevel: '高级',
      standardTime: '1.5-2.5分钟/件'
    },
    
    // 包装工序
    {
      id: 'packaging-001',
      categoryId: 'packaging',
      name: '包装',
      standardName: '服装包装',
      description: '对服装进行包装处理',
      skillLevel: '基础',
      standardTime: '0.3-0.8分钟/件'
    }
  ]
};

// 导出GSD数据库相关方法
export function getGsdCategories() {
  return GSD_DATABASE.categories;
}

export function getGsdProcesses() {
  return GSD_DATABASE.processes;
}

export function getProcessesByCategory(categoryId) {
  if (!categoryId) {
    return GSD_DATABASE.processes;
  }
  return GSD_DATABASE.processes.filter(process => process.categoryId === categoryId);
}

export function searchGsdProcesses(keyword) {
  if (!keyword) {
    return [];
  }
  const lowerKeyword = keyword.toLowerCase();
  return GSD_DATABASE.processes.filter(process => 
    process.name.toLowerCase().includes(lowerKeyword) ||
    process.standardName.toLowerCase().includes(lowerKeyword) ||
    process.description.toLowerCase().includes(lowerKeyword)
  );
}

export function getProcessById(processId) {
  return GSD_DATABASE.processes.find(process => process.id === processId);
}

export function getProcessByName(name) {
  return GSD_DATABASE.processes.find(process => process.name === name);
}

// 导出GSD数据库
export { GSD_DATABASE };