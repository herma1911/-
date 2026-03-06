// 测试账号数据设置脚本

// 工厂主账号测试数据
function setFactoryOwnerAccount() {
  const userInfo = {
    role: '工厂主',
    isEnterprise: true,
    boundCompany: null,
    nickname: '工厂主测试账号'
  };
  uni.setStorageSync('userInfo', userInfo);
  uni.removeStorageSync('currentSubAccount');
  console.log('工厂主账号测试数据已设置');
  console.log('当前登录账号:', uni.getStorageSync('userInfo'));
}

// 子账号测试数据
function setSubAccount() {
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
  console.log('子账号测试数据已设置');
  console.log('当前登录账号:', uni.getStorageSync('userInfo'));
  console.log('子账号权限:', uni.getStorageSync('currentSubAccount'));
}

// 普通个人账号测试数据
function setPersonalAccount() {
  const userInfo = {
    role: '个人',
    isEnterprise: false,
    boundCompany: null,
    nickname: '个人账号测试账号'
  };
  uni.setStorageSync('userInfo', userInfo);
  uni.removeStorageSync('currentSubAccount');
  console.log('普通个人账号测试数据已设置');
  console.log('当前登录账号:', uni.getStorageSync('userInfo'));
}

// 执行测试
console.log('=== 测试账号数据设置 ===');

// 测试工厂主账号
console.log('\n=== 测试工厂主账号 ===');
setFactoryOwnerAccount();

// 测试子账号
console.log('\n=== 测试子账号 ===');
setSubAccount();

// 测试普通个人账号
console.log('\n=== 测试普通个人账号 ===');
setPersonalAccount();

console.log('\n=== 测试数据设置完成 ===');
