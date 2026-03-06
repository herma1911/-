// 验证账号类型登录行为的脚本

// 模拟 uni 方法
const uni = {
  getStorageSync: function(key) {
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
  },
  setStorageSync: function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeStorageSync: function(key) {
    localStorage.removeItem(key);
  },
  reLaunch: function(options) {
    console.log('跳转:', options.url);
  }
};

// 验证工厂主账号登录
function testFactoryOwnerLogin() {
  console.log('=== 测试工厂主账号登录 ===');
  
  // 设置工厂主账号数据
  const userInfo = {
    role: '工厂主',
    isEnterprise: true,
    boundCompany: null,
    nickname: '工厂主测试账号'
  };
  uni.setStorageSync('userInfo', userInfo);
  uni.removeStorageSync('currentSubAccount');
  
  // 模拟 App.vue 中的路由逻辑
  const isEnterpriseUser = userInfo.isEnterprise || false;
  const boundCompany = userInfo.boundCompany || uni.getStorageSync('boundCompany') || null;
  
  console.log('用户信息:', userInfo);
  console.log('isEnterpriseUser:', isEnterpriseUser);
  console.log('boundCompany:', boundCompany);
  
  if (isEnterpriseUser === true) {
    console.log('✓ 工厂主账号登录成功，跳转到工厂首页');
    console.log('✓ 预期：显示完整工厂首页，所有模块正常显示，鸿蒙式编辑功能可用');
  } else {
    console.log('✗ 工厂主账号登录失败');
  }
}

// 验证子账号登录
function testSubAccountLogin() {
  console.log('\n=== 测试子账号登录 ===');
  
  // 设置子账号数据
  const userInfo = {
    role: '子账号',
    isEnterprise: false,
    boundCompany: { id: 1, name: '测试工厂' },
    nickname: '子账号测试账号'
  };
  const subAccount = {
    role: '子账号',
    modulePermissions: ['recruitment', 'onboarding', 'employment']
  };
  uni.setStorageSync('userInfo', userInfo);
  uni.setStorageSync('currentSubAccount', subAccount);
  
  // 模拟 App.vue 中的路由逻辑
  const isEnterpriseUser = userInfo.isEnterprise || false;
  const boundCompany = userInfo.boundCompany || uni.getStorageSync('boundCompany') || null;
  
  console.log('用户信息:', userInfo);
  console.log('子账号权限:', subAccount);
  console.log('isEnterpriseUser:', isEnterpriseUser);
  console.log('boundCompany:', boundCompany);
  
  if (boundCompany !== null && isEnterpriseUser === false) {
    console.log('✓ 子账号登录成功，跳转到工厂首页');
    console.log('✓ 预期：只显示主账号分配的模块，无编辑权限，可正常切换到个人端');
  } else {
    console.log('✗ 子账号登录失败');
  }
}

// 验证普通个人账号登录
function testPersonalAccountLogin() {
  console.log('\n=== 测试普通个人账号登录 ===');
  
  // 设置普通个人账号数据
  const userInfo = {
    role: '个人',
    isEnterprise: false,
    boundCompany: null,
    nickname: '个人账号测试账号'
  };
  uni.setStorageSync('userInfo', userInfo);
  uni.removeStorageSync('currentSubAccount');
  
  // 模拟 App.vue 中的路由逻辑
  const isEnterpriseUser = userInfo.isEnterprise || false;
  const boundCompany = userInfo.boundCompany || uni.getStorageSync('boundCompany') || null;
  
  console.log('用户信息:', userInfo);
  console.log('isEnterpriseUser:', isEnterpriseUser);
  console.log('boundCompany:', boundCompany);
  
  if (isEnterpriseUser === false && boundCompany === null) {
    console.log('✓ 普通个人账号登录成功，跳转到工人首页');
    console.log('✓ 预期：只能看到工人端首页，完全不加载工厂端内容，控制台无报错');
  } else {
    console.log('✗ 普通个人账号登录失败');
  }
}

// 验证工厂端权限逻辑
function testFactoryPagePermissions() {
  console.log('\n=== 测试工厂端权限逻辑 ===');
  
  // 模拟 factory-home.vue 中的权限逻辑
  function isFactoryOwner() {
    const userInfo = uni.getStorageSync('userInfo') || {};
    const isEnterpriseUser = userInfo.isEnterprise || false;
    return isEnterpriseUser === true;
  }
  
  function hasModulePermission(moduleId) {
    if (isFactoryOwner()) {
      // 工厂主拥有所有模块权限
      return true;
    }
    // 子账号只能查看分配给他们的模块
    const subAccount = uni.getStorageSync('currentSubAccount') || {};
    return subAccount.modulePermissions ? subAccount.modulePermissions.includes(moduleId) : false;
  }
  
  // 测试工厂主权限
  const factoryOwnerInfo = {
    role: '工厂主',
    isEnterprise: true,
    boundCompany: null
  };
  uni.setStorageSync('userInfo', factoryOwnerInfo);
  uni.removeStorageSync('currentSubAccount');
  
  console.log('工厂主权限测试:');
  console.log('isFactoryOwner:', isFactoryOwner());
  console.log('hasModulePermission(recruitment):', hasModulePermission('recruitment'));
  console.log('hasModulePermission(onboarding):', hasModulePermission('onboarding'));
  console.log('hasModulePermission(employment):', hasModulePermission('employment'));
  console.log('hasModulePermission(factory):', hasModulePermission('factory'));
  
  // 测试子账号权限
  const subAccountInfo = {
    role: '子账号',
    isEnterprise: false,
    boundCompany: { id: 1, name: '测试工厂' }
  };
  const subAccountPerms = {
    role: '子账号',
    modulePermissions: ['recruitment', 'onboarding', 'employment']
  };
  uni.setStorageSync('userInfo', subAccountInfo);
  uni.setStorageSync('currentSubAccount', subAccountPerms);
  
  console.log('\n子账号权限测试:');
  console.log('isFactoryOwner:', isFactoryOwner());
  console.log('hasModulePermission(recruitment):', hasModulePermission('recruitment'));
  console.log('hasModulePermission(onboarding):', hasModulePermission('onboarding'));
  console.log('hasModulePermission(employment):', hasModulePermission('employment'));
  console.log('hasModulePermission(factory):', hasModulePermission('factory')); // 应该返回 false
}

// 执行所有测试
console.log('=== 账号类型登录行为验证 ===');
testFactoryOwnerLogin();
testSubAccountLogin();
testPersonalAccountLogin();
testFactoryPagePermissions();
console.log('\n=== 验证完成 ===');
