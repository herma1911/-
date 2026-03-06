// 测试工厂首页模块权限逻辑

// 模拟工厂主账号
const factoryOwnerUser = {
  isEnterprise: true,
  role: '工厂主'
};

// 模拟子账号
const subAccountUser = {
  isEnterprise: false,
  boundCompany: '测试工厂'
};

const currentSubAccount = {
  role: '子账号',
  modulePermissions: ['recruitment', 'onboarding', 'employment']
};

// 模拟工厂数据
const factoryData = {
  level: 'A'
};

// 模拟服务模块
const serviceModules = [
  {
    id: 'recruitment',
    name: '招聘管理',
    visible: true
  },
  {
    id: 'onboarding',
    name: '入职管理',
    visible: true
  },
  {
    id: 'employment',
    name: '用工对账',
    visible: true
  },
  {
    id: 'order',
    name: '订单管理',
    visible: true
  },
  {
    id: 'factory-profile',
    name: '工厂档案',
    visible: true
  },
  {
    id: 'worker-management',
    name: '工人管理',
    visible: true
  },
  {
    id: 'equipment-management',
    name: '设备管理',
    visible: true
  },
  {
    id: 'factory',
    name: '子账号管理',
    visible: true
  },
  {
    id: 'data',
    name: '工厂数据',
    visible: true
  },
  {
    id: 'growth',
    name: '运营增长',
    visible: true
  },
  {
    id: 'level',
    name: '等级成长',
    visible: true
  },
  {
    id: 'points',
    name: '积分中心',
    visible: true
  },
  {
    id: 'recruitment-code',
    name: '招工入职码',
    visible: true
  },
  {
    id: 'poster',
    name: '海报工具',
    visible: true
  },
  {
    id: 'efficiency',
    name: '效率工具',
    visible: true
  },
  {
    id: 'medal',
    name: '我的勋章',
    visible: true
  }
];

// 模拟权限检查函数
function hasModulePermission(moduleId, isFactoryOwner, factoryLevel, modulePermissions) {
  if (isFactoryOwner) {
    const levelModules = {
      'C': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'recruitment-code'],
      'B': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster'],
      'A': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster', 'efficiency', 'medal'],
      'S': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster', 'efficiency', 'medal']
    };
    const allowedModules = levelModules[factoryLevel] || levelModules.C;
    return allowedModules.includes(moduleId);
  }
  return modulePermissions.includes(moduleId);
}

// 测试工厂主账号
console.log('=== 测试工厂主账号 ===');
const factoryOwnerVisibleModules = serviceModules.filter(module => 
  module.visible && hasModulePermission(module.id, true, factoryData.level, [])
);
console.log(`工厂主账号可见模块数：${factoryOwnerVisibleModules.length}`);
console.log('可见模块：');
factoryOwnerVisibleModules.forEach(module => console.log(`- ${module.name}`));

// 测试子账号
console.log('\n=== 测试子账号 ===');
const subAccountVisibleModules = serviceModules.filter(module => 
  module.visible && hasModulePermission(module.id, false, factoryData.level, currentSubAccount.modulePermissions)
);
console.log(`子账号可见模块数：${subAccountVisibleModules.length}`);
console.log('可见模块：');
subAccountVisibleModules.forEach(module => console.log(`- ${module.name}`));

// 测试所有模块的权限
console.log('\n=== 测试所有模块权限 ===');
serviceModules.forEach(module => {
  const factoryOwnerCanSee = hasModulePermission(module.id, true, factoryData.level, []);
  const subAccountCanSee = hasModulePermission(module.id, false, factoryData.level, currentSubAccount.modulePermissions);
  console.log(`${module.name}: 工厂主=${factoryOwnerCanSee}, 子账号=${subAccountCanSee}`);
});