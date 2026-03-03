import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { title: '登录' }
  },
  
  // 首页看板
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/Dashboard.vue'),
    meta: { title: '首页看板', requiresAuth: true }
  },
  
  // 工人管理
  {
    path: '/worker/list',
    name: 'WorkerList',
    component: () => import('../views/worker/WorkerList.vue'),
    meta: { title: '工人列表', requiresAuth: true }
  },
  {
    path: '/worker/detail/:id',
    name: 'WorkerDetail',
    component: () => import('../views/worker/WorkerDetail.vue'),
    meta: { title: '工人详情', requiresAuth: true }
  },
  {
    path: '/worker/tags',
    name: 'WorkerTags',
    component: () => import('../views/worker/WorkerTags.vue'),
    meta: { title: '标签管理', requiresAuth: true }
  },
  
  // 工厂管理
  {
    path: '/factory/list',
    name: 'FactoryList',
    component: () => import('../views/factory/FactoryList.vue'),
    meta: { title: '工厂列表', requiresAuth: true }
  },
  {
    path: '/factory/detail/:id',
    name: 'FactoryDetail',
    component: () => import('../views/factory/FactoryDetail.vue'),
    meta: { title: '工厂详情', requiresAuth: true }
  },
  {
    path: '/factory/certification',
    name: 'FactoryCertification',
    component: () => import('../views/factory/FactoryCertification.vue'),
    meta: { title: '认证管理', requiresAuth: true }
  },
  
  // 招聘管理
  {
    path: '/recruitment/jobs',
    name: 'JobManagement',
    component: () => import('../views/recruitment/JobManagement.vue'),
    meta: { title: '岗位管理', requiresAuth: true }
  },
  {
    path: '/recruitment/applications',
    name: 'ApplicationManagement',
    component: () => import('../views/recruitment/ApplicationManagement.vue'),
    meta: { title: '应聘管理', requiresAuth: true }
  },
  {
    path: '/recruitment/onboarding',
    name: 'OnboardingManagement',
    component: () => import('../views/recruitment/OnboardingManagement.vue'),
    meta: { title: '入职闭环', requiresAuth: true }
  },
  {
    path: '/recruitment/resumes',
    name: 'ResumeManagement',
    component: () => import('../views/recruitment/ResumeManagement.vue'),
    meta: { title: '简历库', requiresAuth: true }
  },
  
  // 评价管理
  {
    path: '/evaluation/list',
    name: 'EvaluationList',
    component: () => import('../views/evaluation/EvaluationList.vue'),
    meta: { title: '评价列表', requiresAuth: true }
  },
  {
    path: '/evaluation/audit',
    name: 'EvaluationAudit',
    component: () => import('../views/evaluation/EvaluationAudit.vue'),
    meta: { title: '评价审核', requiresAuth: true }
  },
  {
    path: '/evaluation/score',
    name: 'FactoryScore',
    component: () => import('../views/evaluation/FactoryScore.vue'),
    meta: { title: '工厂评分', requiresAuth: true }
  },
  {
    path: '/evaluation/appeal',
    name: 'EvaluationAppeal',
    component: () => import('../views/evaluation/EvaluationAppeal.vue'),
    meta: { title: '申诉管理', requiresAuth: true }
  },
  
  // 财务管理
  {
    path: '/finance/ledger',
    name: 'LedgerManagement',
    component: () => import('../views/finance/LedgerManagement.vue'),
    meta: { title: '账本管理', requiresAuth: true }
  },
  {
    path: '/finance/reconciliation',
    name: 'ReconciliationManagement',
    component: () => import('../views/finance/ReconciliationManagement.vue'),
    meta: { title: '对账管理', requiresAuth: true }
  },
  {
    path: '/finance/packages',
    name: 'PackageManagement',
    component: () => import('../views/finance/PackageManagement.vue'),
    meta: { title: '套餐管理', requiresAuth: true }
  },
  {
    path: '/finance/orders',
    name: 'OrderManagement',
    component: () => import('../views/finance/OrderManagement.vue'),
    meta: { title: '订单管理', requiresAuth: true }
  },
  {
    path: '/finance/revenue',
    name: 'RevenueDashboard',
    component: () => import('../views/finance/RevenueDashboard.vue'),
    meta: { title: '营收看板', requiresAuth: true }
  },
  
  // 推广管理
  {
    path: '/promotion/promoters',
    name: 'PromoterManagement',
    component: () => import('../views/promotion/PromoterManagement.vue'),
    meta: { title: '推广员管理', requiresAuth: true }
  },
  {
    path: '/promotion/data',
    name: 'PromotionData',
    component: () => import('../views/promotion/PromotionData.vue'),
    meta: { title: '推广数据', requiresAuth: true }
  },
  {
    path: '/promotion/commission',
    name: 'CommissionManagement',
    component: () => import('../views/promotion/CommissionManagement.vue'),
    meta: { title: '佣金结算', requiresAuth: true }
  },
  {
    path: '/promotion/activities',
    name: 'ActivityManagement',
    component: () => import('../views/promotion/ActivityManagement.vue'),
    meta: { title: '活动管理', requiresAuth: true }
  },
  
  // 激励管理
  {
    path: '/incentive/medals',
    name: 'MedalManagement',
    component: () => import('../views/incentive/MedalManagement.vue'),
    meta: { title: '勋章管理', requiresAuth: true }
  },
  {
    path: '/incentive/rewards',
    name: 'RewardManagement',
    component: () => import('../views/incentive/RewardManagement.vue'),
    meta: { title: '奖励管理', requiresAuth: true }
  },
  {
    path: '/incentive/privileges',
    name: 'PrivilegeManagement',
    component: () => import('../views/incentive/PrivilegeManagement.vue'),
    meta: { title: '特权管理', requiresAuth: true }
  },
  
  // 风控管理
  {
    path: '/risk/rules',
    name: 'RiskRules',
    component: () => import('../views/risk/RiskRules.vue'),
    meta: { title: '规则配置', requiresAuth: true }
  },
  {
    path: '/risk/monitoring',
    name: 'RiskMonitoring',
    component: () => import('../views/risk/RiskMonitoring.vue'),
    meta: { title: '异常监控', requiresAuth: true }
  },
  {
    path: '/risk/blacklist',
    name: 'BlacklistManagement',
    component: () => import('../views/risk/BlacklistManagement.vue'),
    meta: { title: '黑名单管理', requiresAuth: true }
  },
  {
    path: '/risk/audit',
    name: 'ContentAudit',
    component: () => import('../views/risk/ContentAudit.vue'),
    meta: { title: '内容审核', requiresAuth: true }
  },
  {
    path: '/risk/logs',
    name: 'OperationLogs',
    component: () => import('../views/risk/OperationLogs.vue'),
    meta: { title: '操作日志', requiresAuth: true }
  },
  
  // 系统管理
  {
    path: '/system/accounts',
    name: 'AccountManagement',
    component: () => import('../views/system/AccountManagement.vue'),
    meta: { title: '账号管理', requiresAuth: true }
  },
  {
    path: '/system/roles',
    name: 'RoleManagement',
    component: () => import('../views/system/RoleManagement.vue'),
    meta: { title: '角色管理', requiresAuth: true }
  },
  {
    path: '/system/menus',
    name: 'MenuManagement',
    component: () => import('../views/system/MenuManagement.vue'),
    meta: { title: '菜单管理', requiresAuth: true }
  },
  {
    path: '/system/login-logs',
    name: 'LoginLogs',
    component: () => import('../views/system/LoginLogs.vue'),
    meta: { title: '登录日志', requiresAuth: true }
  },
  {
    path: '/system/settings',
    name: 'SystemSettings',
    component: () => import('../views/system/SystemSettings.vue'),
    meta: { title: '系统设置', requiresAuth: true }
  },
  
  // 数据分析
  {
    path: '/bi/reports',
    name: 'CustomReports',
    component: () => import('../views/bi/CustomReports.vue'),
    meta: { title: '自定义报表', requiresAuth: true }
  },
  {
    path: '/bi/dashboard',
    name: 'DataDashboard',
    component: () => import('../views/bi/DataDashboard.vue'),
    meta: { title: '数据看板', requiresAuth: true }
  },
  {
    path: '/bi/industry',
    name: 'IndustryAnalysis',
    component: () => import('../views/bi/IndustryAnalysis.vue'),
    meta: { title: '行业分析', requiresAuth: true }
  },
  {
    path: '/bi/scheduled',
    name: 'ScheduledReports',
    component: () => import('../views/bi/ScheduledReports.vue'),
    meta: { title: '定时报表', requiresAuth: true }
  },
  
  // 里程碑监控
  {
    path: '/milestone/monitor',
    name: 'MilestoneMonitor',
    component: () => import('../views/milestone/MilestoneMonitor.vue'),
    meta: { title: '里程碑监控', requiresAuth: true }
  },
  
  // 物料管理
  {
    path: '/materials/inventory-count',
    name: 'InventoryCounting',
    component: () => import('../views/materials/InventoryCounting.vue'),
    meta: { title: '库存盘点', requiresAuth: true }
  },
  {
    path: '/materials/batch-traceability',
    name: 'BatchTraceability',
    component: () => import('../views/materials/BatchTraceability.vue'),
    meta: { title: '物料批次追溯', requiresAuth: true }
  },
  {
    path: '/materials/order-matching',
    name: 'OrderMatching',
    component: () => import('../views/materials/OrderMatching.vue'),
    meta: { title: '订单匹配', requiresAuth: true }
  },
  {
    path: '/materials/shipment-tracking',
    name: 'ShipmentTracking',
    component: () => import('../views/materials/ShipmentTracking.vue'),
    meta: { title: '发货跟踪', requiresAuth: true }
  },
  {
    path: '/materials/shipment-list',
    name: 'ShipmentList',
    component: () => import('../views/materials/ShipmentList.vue'),
    meta: { title: '出货管理列表', requiresAuth: true }
  },
  
  // 重定向
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 赫尔玛智能管理系统` : '赫尔玛智能管理系统'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router