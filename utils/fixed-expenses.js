// 固定支出提醒管理工具

// 获取所有固定支出
export function getFixedExpenses() {
  const fixedExpenses = uni.getStorageSync('fixedExpenses') || []
  // 检查并更新过期的支出状态
  const updatedExpenses = fixedExpenses.map(expense => {
    if (expense.endDate && new Date(expense.endDate) < new Date()) {
      return { ...expense, status: 'completed' }
    }
    return expense
  })
  
  // 保存更新后的状态
  uni.setStorageSync('fixedExpenses', updatedExpenses)
  return updatedExpenses
}

// 保存固定支出
export function saveFixedExpense(expense) {
  const fixedExpenses = getFixedExpenses()
  const index = fixedExpenses.findIndex(item => item.id === expense.id)
  
  if (index > -1) {
    // 更新现有支出
    fixedExpenses[index] = expense
  } else {
    // 添加新支出
    fixedExpenses.push(expense)
  }
  
  uni.setStorageSync('fixedExpenses', fixedExpenses)
  return expense
}

// 删除固定支出
export function deleteFixedExpense(id) {
  const fixedExpenses = getFixedExpenses()
  const updatedExpenses = fixedExpenses.filter(item => item.id !== id)
  uni.setStorageSync('fixedExpenses', updatedExpenses)
  return updatedExpenses
}

// 暂停固定支出提醒
export function pauseFixedExpense(id, months) {
  const fixedExpenses = getFixedExpenses()
  const updatedExpenses = fixedExpenses.map(expense => {
    if (expense.id === id) {
      const pauseUntil = new Date()
      pauseUntil.setMonth(pauseUntil.getMonth() + parseInt(months))
      return { ...expense, paused: true, pauseUntil: pauseUntil.toISOString() }
    }
    return expense
  })
  uni.setStorageSync('fixedExpenses', updatedExpenses)
  return updatedExpenses
}

// 恢复固定支出提醒
export function resumeFixedExpense(id) {
  const fixedExpenses = getFixedExpenses()
  const updatedExpenses = fixedExpenses.map(expense => {
    if (expense.id === id) {
      return { ...expense, paused: false, pauseUntil: null }
    }
    return expense
  })
  uni.setStorageSync('fixedExpenses', updatedExpenses)
  return updatedExpenses
}

// 检查是否需要提醒
export function checkReminders() {
  const fixedExpenses = getFixedExpenses()
  const today = new Date()
  const reminders = []
  
  fixedExpenses.forEach(expense => {
    // 跳过已完成或暂停的支出
    if (expense.status === 'completed') return
    if (expense.paused && new Date(expense.pauseUntil) > today) return
    
    // 检查是否到了提醒日期
    const remindDay = expense.remindDay
    const currentDay = today.getDate()
    
    if (currentDay === remindDay) {
      reminders.push(expense)
    }
  })
  
  return reminders
}

// 标记支出为已缴费
export function markAsPaid(id) {
  const fixedExpenses = getFixedExpenses()
  const updatedExpenses = fixedExpenses.map(expense => {
    if (expense.id === id) {
      const paymentHistory = expense.paymentHistory || []
      paymentHistory.push({
        date: new Date().toISOString(),
        amount: expense.amount
      })
      return { ...expense, paymentHistory }
    }
    return expense
  })
  uni.setStorageSync('fixedExpenses', updatedExpenses)
  return updatedExpenses
}

// 获取支出统计
export function getExpenseStatistics() {
  const fixedExpenses = getFixedExpenses()
  const activeExpenses = fixedExpenses.filter(expense => expense.status === 'active' && (!expense.paused || new Date(expense.pauseUntil) < new Date()))
  
  const totalMonthlyExpense = activeExpenses.reduce((total, expense) => total + expense.amount, 0)
  const expenseByCategory = {}
  
  activeExpenses.forEach(expense => {
    const category = expense.type === 'custom' ? expense.customType : expense.type
    if (!expenseByCategory[category]) {
      expenseByCategory[category] = 0
    }
    expenseByCategory[category] += expense.amount
  })
  
  return {
    totalMonthlyExpense,
    expenseByCategory,
    activeCount: activeExpenses.length,
    completedCount: fixedExpenses.filter(expense => expense.status === 'completed').length
  }
}

// 生成还款计划
export function generateLoanPlan(principal, annualRate, periods, repaymentType) {
  const monthlyRate = annualRate / 100 / 12
  const plan = []
  let totalInterest = 0
  
  if (repaymentType === 'equal-principal-interest') {
    // 等额本息
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, periods) / (Math.pow(1 + monthlyRate, periods) - 1)
    let remainingPrincipal = principal
    
    for (let i = 1; i <= periods; i++) {
      const interestPayment = remainingPrincipal * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingPrincipal -= principalPayment
      totalInterest += interestPayment
      
      plan.push({
        period: i,
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        principalPayment: parseFloat(principalPayment.toFixed(2)),
        interestPayment: parseFloat(interestPayment.toFixed(2)),
        remainingPrincipal: parseFloat(Math.max(0, remainingPrincipal).toFixed(2))
      })
    }
  } else {
    // 等额本金
    const monthlyPrincipal = principal / periods
    let remainingPrincipal = principal
    
    for (let i = 1; i <= periods; i++) {
      const interestPayment = remainingPrincipal * monthlyRate
      const monthlyPayment = monthlyPrincipal + interestPayment
      remainingPrincipal -= monthlyPrincipal
      totalInterest += interestPayment
      
      plan.push({
        period: i,
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        principalPayment: parseFloat(monthlyPrincipal.toFixed(2)),
        interestPayment: parseFloat(interestPayment.toFixed(2)),
        remainingPrincipal: parseFloat(Math.max(0, remainingPrincipal).toFixed(2))
      })
    }
  }
  
  return {
    plan,
    totalPayment: parseFloat((principal + totalInterest).toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2))
  }
}

// 检查首次支出并提示设置固定支出
export function checkFirstExpense(expenseType) {
  const hasSetFixedExpense = uni.getStorageSync('hasSetFixedExpense') || false
  if (!hasSetFixedExpense && isFixedExpenseType(expenseType)) {
    uni.setStorageSync('hasSetFixedExpense', true)
    return true
  }
  return false
}

// 判断是否为固定支出类型
function isFixedExpenseType(type) {
  const fixedTypes = ['rent', 'utilities', 'gas', 'phone', 'internet', 'property', 'transport', 'insurance', 'education', 'car_loan']
  return fixedTypes.includes(type)
}