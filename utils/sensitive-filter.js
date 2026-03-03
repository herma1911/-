// 敏感词过滤工具

// 敏感词列表
const sensitiveWords = [
  '黑厂',
  '骗子',
  '拖欠',
  '黑心',
  '克扣',
  '压榨',
  '垃圾',
  '骗子工厂',
  '拖欠工资',
  '黑心老板'
]

/**
 * 检查文本是否包含敏感词
 * @param {string} text - 要检查的文本
 * @returns {object} - 包含是否有敏感词、敏感词列表的对象
 */
export function checkSensitiveWords(text) {
  if (!text) {
    return {
      hasSensitive: false,
      words: []
    }
  }
  
  const foundWords = []
  
  sensitiveWords.forEach(word => {
    if (text.includes(word)) {
      foundWords.push(word)
    }
  })
  
  return {
    hasSensitive: foundWords.length > 0,
    words: foundWords
  }
}

/**
 * 过滤文本中的敏感词（替换为星号）
 * @param {string} text - 要过滤的文本
 * @returns {string} - 过滤后的文本
 */
export function filterSensitiveWords(text) {
  if (!text) {
    return text
  }
  
  let filteredText = text
  
  sensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'g')
    const replacement = '*'.repeat(word.length)
    filteredText = filteredText.replace(regex, replacement)
  })
  
  return filteredText
}

/**
 * 验证用户是否已实名
 * @param {object} userInfo - 用户信息
 * @returns {boolean} - 是否已实名
 */
export function isUserVerified(userInfo) {
  if (!userInfo) {
    return false
  }
  
  // 检查是否有手机号（作为实名的标志）
  return !!userInfo.phone
}
