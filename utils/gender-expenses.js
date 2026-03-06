// 性别相关的高频支出快捷选项

// 男性高频支出快捷选项
const maleExpenses = [
  { id: 'male_1', name: '烟酒', amount: 200, icon: '🚬' },
  { id: 'male_2', name: '饮用水', amount: 50, icon: '💧' },
  { id: 'male_3', name: '快餐', amount: 150, icon: '🍔' },
  { id: 'male_4', name: '游戏充值', amount: 100, icon: '🎮' },
  { id: 'male_5', name: '骑行装备', amount: 300, icon: '🚲' },
  { id: 'male_6', name: '电竞外设', amount: 500, icon: '⌨️' },
  { id: 'male_7', name: '男士理容', amount: 80, icon: '💈' }
]

// 女性高频支出快捷选项
const femaleExpenses = [
  { id: 'female_1', name: '奶茶甜品', amount: 100, icon: '🥤' },
  { id: 'female_2', name: '美妆个护', amount: 300, icon: '💄' },
  { id: 'female_3', name: '母婴用品', amount: 500, icon: '🍼' },
  { id: 'female_4', name: '服饰鞋包', amount: 400, icon: '👗' },
  { id: 'female_5', name: '洗护用品', amount: 150, icon: '🧴' },
  { id: 'female_6', name: '香氛', amount: 200, icon: '🌸' },
  { id: 'female_7', name: '绿植', amount: 80, icon: '🌱' }
]

// 通用高频支出快捷选项
const commonExpenses = [
  { id: 'common_1', name: '餐饮', amount: 120, icon: '🍜' },
  { id: 'common_2', name: '交通', amount: 50, icon: '🚗' },
  { id: 'common_3', name: '购物', amount: 200, icon: '🛍️' },
  { id: 'common_4', name: '娱乐', amount: 150, icon: '🎬' }
]

// 获取用户性别的高频支出选项
export function getGenderExpenses(gender) {
  if (gender === 'male') {
    return [...maleExpenses, ...commonExpenses]
  } else if (gender === 'female') {
    return [...femaleExpenses, ...commonExpenses]
  } else {
    // 未设置性别时只返回通用选项
    return commonExpenses
  }
}

// 获取所有支出选项（用于编辑）
export function getAllExpenseOptions() {
  return {
    male: maleExpenses,
    female: femaleExpenses,
    common: commonExpenses
  }
}

// 保存用户自定义的支出选项
export function saveCustomExpenseOptions(gender, options) {
  const key = `customExpenses_${gender || 'common'}`
  uni.setStorageSync(key, options)
}

// 获取用户自定义的支出选项
export function getCustomExpenseOptions(gender) {
  const key = `customExpenses_${gender || 'common'}`
  return uni.getStorageSync(key) || []
}

// 合并默认选项和用户自定义选项
export function getMergedExpenseOptions(gender) {
  const defaultOptions = getGenderExpenses(gender)
  const customOptions = getCustomExpenseOptions(gender)
  
  // 合并选项，去重
  const merged = [...defaultOptions]
  const existingIds = new Set(defaultOptions.map(opt => opt.id))
  
  customOptions.forEach(opt => {
    if (!existingIds.has(opt.id)) {
      merged.push(opt)
    }
  })
  
  return merged
}