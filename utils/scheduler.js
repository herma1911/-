// 定时任务管理工具
import { checkUserActivityAndPush } from './user-activity.js'

// 定时任务类型
const TASK_TYPES = {
  USER_ACTIVITY_CHECK: 'userActivityCheck'
}

// 任务配置
const TASK_CONFIG = {
  [TASK_TYPES.USER_ACTIVITY_CHECK]: {
    interval: 24 * 60 * 60 * 1000, // 24小时
    handler: checkUserActivityAndPush
  }
}

// 任务定时器
let taskTimers = {}

// 启动定时任务
export function startScheduledTasks() {
  console.log('启动定时任务...')
  
  // 启动用户活跃度检查任务
  startTask(TASK_TYPES.USER_ACTIVITY_CHECK)
  
  // 立即执行一次检查
  checkUserActivityAndPush()
  
  console.log('定时任务启动完成')
}

// 启动单个任务
function startTask(taskType) {
  const config = TASK_CONFIG[taskType]
  if (!config) {
    console.error(`未知的任务类型: ${taskType}`)
    return
  }
  
  // 清除已存在的定时器
  if (taskTimers[taskType]) {
    clearInterval(taskTimers[taskType])
  }
  
  // 创建新的定时器
  taskTimers[taskType] = setInterval(() => {
    try {
      console.log(`执行定时任务: ${taskType}`)
      config.handler()
    } catch (error) {
      console.error(`执行定时任务 ${taskType} 出错:`, error)
    }
  }, config.interval)
  
  console.log(`定时任务 ${taskType} 已启动，间隔: ${config.interval}ms`)
}

// 停止定时任务
export function stopScheduledTasks() {
  console.log('停止定时任务...')
  
  Object.keys(taskTimers).forEach(taskType => {
    clearInterval(taskTimers[taskType])
    console.log(`定时任务 ${taskType} 已停止`)
  })
  
  taskTimers = {}
  console.log('定时任务全部停止')
}

// 获取任务状态
export function getTaskStatus() {
  return Object.keys(taskTimers).map(taskType => ({
    taskType,
    running: !!taskTimers[taskType]
  }))
}

export { TASK_TYPES, TASK_CONFIG }