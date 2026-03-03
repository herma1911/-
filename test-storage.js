// 测试本地存储
console.log('=== 测试本地存储 ===');

// 检查是否有招聘信息
const recruitments = uni.getStorageSync('recruitments');
console.log('招聘信息数量:', recruitments ? recruitments.length : 0);

// 检查工序词库
const formalLibrary = uni.getStorageSync('formalWordLibrary');
console.log('正式词库:', formalLibrary ? Object.keys(formalLibrary) : '未初始化');

// 检查候选池
const candidatePool = uni.getStorageSync('candidateWordPool');
console.log('候选池数量:', candidatePool ? candidatePool.length : 0);

// 检查搜索历史
const searchHistory = uni.getStorageSync('processSearchHistory');
console.log('搜索历史:', searchHistory ? searchHistory.length : 0);

console.log('=== 测试完成 ===');
