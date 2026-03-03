// 示例评价数据

import { saveFactoryEvaluation, saveWorkerEvaluation } from './evaluation.js'

// 初始化示例工厂评价
export function initSampleFactoryEvaluations() {
  // 为招聘信息添加评价
  const jobIds = [1, 2, 3, 4, 5, 6]
  
  jobIds.forEach(jobId => {
    // 评价1：匿名评价
    saveFactoryEvaluation(jobId, {
      evaluatorId: 'worker1',
      evaluatorName: '张三',
      isAnonymous: true,
      salaryBenefits: 4.5,
      workEnvironment: 4.0,
      management: 3.5,
      communication: 4.0,
      growthSpace: 3.0,
      comment: '工资按时发放，工作环境不错，管理上有些严格，总体来说还可以。',
      tags: ['薪资靠谱', '环境友好', '管理严格']
    })
    
    // 评价2：实名评价
    saveFactoryEvaluation(jobId, {
      evaluatorId: 'worker2',
      evaluatorName: '李四',
      isAnonymous: false,
      salaryBenefits: 4.0,
      workEnvironment: 4.5,
      management: 4.0,
      communication: 4.5,
      growthSpace: 3.5,
      comment: '老板人很好，经常和工人交流，车间有空调，夏天干活很舒服。就是工资稍微低了一点。',
      tags: ['没架子', '环境友好', '福利到位']
    })
    
    // 评价3：带老板回复的评价
    saveFactoryEvaluation(jobId, {
      evaluatorId: 'worker3',
      evaluatorName: '王五',
      isAnonymous: false,
      salaryBenefits: 3.5,
      workEnvironment: 3.0,
      management: 3.0,
      communication: 4.0,
      growthSpace: 2.5,
      comment: '工作强度有点大，希望能适当减轻一些，工资也希望能再涨一点。',
      tags: ['沟通顺畅', '工作强度大'],
      reply: '感谢您的反馈，我们会考虑调整工作强度，工资方面我们会根据绩效进行调整，希望能继续一起努力！',
      replyDate: new Date().toISOString().split('T')[0]
    })
  })
}

// 初始化示例工人评价
export function initSampleWorkerEvaluations() {
  // 为工人添加评价
  const workerIds = [1, 2, 3, 4]
  
  workerIds.forEach(workerId => {
    // 评价1：技能很好
    saveWorkerEvaluation(workerId, {
      evaluatorId: 'boss1',
      evaluatorName: '衣起赚服装厂',
      skillProficiency: 5.0,
      efficiency: 4.5,
      learningAbility: 4.0,
      responsibility: 4.5,
      teamwork: 4.0,
      comment: '技术非常好，做的衣服质量很高，效率也不错，是个靠谱的工人。',
      tags: ['技术大神', '效率先锋', '靠谱担当']
    })
    
    // 评价2：学习能力强
    saveWorkerEvaluation(workerId, {
      evaluatorId: 'boss2',
      evaluatorName: '时尚服装厂',
      skillProficiency: 4.0,
      efficiency: 3.5,
      learningAbility: 5.0,
      responsibility: 4.0,
      teamwork: 4.5,
      comment: '虽然经验不是很丰富，但是学习能力很强，很快就能掌握新技能，团队合作也很好。',
      tags: ['学习小天才', '团队粘合剂', '责任心强']
    })
    
    // 评价3：效率高
    saveWorkerEvaluation(workerId, {
      evaluatorId: 'boss3',
      evaluatorName: '精品服装厂',
      skillProficiency: 4.5,
      efficiency: 5.0,
      learningAbility: 4.0,
      responsibility: 4.0,
      teamwork: 3.5,
      comment: '效率非常高，每天的产量都能超额完成，质量也能保证，是个高产能手。',
      tags: ['高产王', '效率先锋', '技术大神']
    })
  })
}

// 初始化所有示例评价
export function initAllSampleEvaluations() {
  initSampleFactoryEvaluations()
  initSampleWorkerEvaluations()
  console.log('示例评价数据初始化完成')
}
