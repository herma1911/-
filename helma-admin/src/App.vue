<template>
  <div class="app-container">
    <!-- 登录页 -->
    <router-view v-if="!isLoggedIn" />
    
    <!-- 主应用布局 -->
    <template v-else>
      <el-container class="main-container">
        <!-- 侧边栏 -->
        <el-aside width="200px" class="sidebar">
          <div class="logo">
            <h1>赫尔玛智能</h1>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            router
            :unique-opened="true"
          >
            <el-menu-item index="/dashboard">
              <el-icon><House /></el-icon>
              <span>首页看板</span>
            </el-menu-item>
            <el-sub-menu index="/worker">
              <template #title>
                <el-icon><User /></el-icon>
                <span>工人管理</span>
              </template>
              <el-menu-item index="/worker/list">工人列表</el-menu-item>
              <el-menu-item index="/worker/detail">工人详情</el-menu-item>
              <el-menu-item index="/worker/tags">标签管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/factory">
              <template #title>
                <el-icon><OfficeBuilding /></el-icon>
                <span>工厂管理</span>
              </template>
              <el-menu-item index="/factory/list">工厂列表</el-menu-item>
              <el-menu-item index="/factory/detail">工厂详情</el-menu-item>
              <el-menu-item index="/factory/certification">认证管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/recruitment">
              <template #title>
                <el-icon><Position /></el-icon>
                <span>招聘管理</span>
              </template>
              <el-menu-item index="/recruitment/jobs">岗位管理</el-menu-item>
              <el-menu-item index="/recruitment/applications">应聘管理</el-menu-item>
              <el-menu-item index="/recruitment/onboarding">入职闭环</el-menu-item>
              <el-menu-item index="/recruitment/resumes">简历库</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/evaluation">
              <template #title>
                <el-icon><Star /></el-icon>
                <span>评价管理</span>
              </template>
              <el-menu-item index="/evaluation/list">评价列表</el-menu-item>
              <el-menu-item index="/evaluation/audit">评价审核</el-menu-item>
              <el-menu-item index="/evaluation/score">工厂评分</el-menu-item>
              <el-menu-item index="/evaluation/appeal">申诉管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/finance">
              <template #title>
                <el-icon><Wallet /></el-icon>
                <span>财务管理</span>
              </template>
              <el-menu-item index="/finance/ledger">账本管理</el-menu-item>
              <el-menu-item index="/finance/reconciliation">对账管理</el-menu-item>
              <el-menu-item index="/finance/packages">套餐管理</el-menu-item>
              <el-menu-item index="/finance/orders">订单管理</el-menu-item>
              <el-menu-item index="/finance/revenue">营收看板</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/promotion">
              <template #title>
                <el-icon><Promotion /></el-icon>
                <span>推广管理</span>
              </template>
              <el-menu-item index="/promotion/promoters">推广员管理</el-menu-item>
              <el-menu-item index="/promotion/data">推广数据</el-menu-item>
              <el-menu-item index="/promotion/commission">佣金结算</el-menu-item>
              <el-menu-item index="/promotion/activities">活动管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/incentive">
              <template #title>
                <el-icon><Medal /></el-icon>
                <span>激励管理</span>
              </template>
              <el-menu-item index="/incentive/medals">勋章管理</el-menu-item>
              <el-menu-item index="/incentive/rewards">奖励管理</el-menu-item>
              <el-menu-item index="/incentive/privileges">特权管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/risk">
              <template #title>
                <el-icon><Warning /></el-icon>
                <span>风控管理</span>
              </template>
              <el-menu-item index="/risk/rules">规则配置</el-menu-item>
              <el-menu-item index="/risk/monitoring">异常监控</el-menu-item>
              <el-menu-item index="/risk/blacklist">黑名单管理</el-menu-item>
              <el-menu-item index="/risk/audit">内容审核</el-menu-item>
              <el-menu-item index="/risk/logs">操作日志</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/system">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/system/accounts">账号管理</el-menu-item>
              <el-menu-item index="/system/roles">角色管理</el-menu-item>
              <el-menu-item index="/system/menus">菜单管理</el-menu-item>
              <el-menu-item index="/system/login-logs">登录日志</el-menu-item>
              <el-menu-item index="/system/settings">系统设置</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/bi">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>数据分析</span>
              </template>
              <el-menu-item index="/bi/reports">自定义报表</el-menu-item>
              <el-menu-item index="/bi/dashboard">数据看板</el-menu-item>
              <el-menu-item index="/bi/industry">行业分析</el-menu-item>
              <el-menu-item index="/bi/scheduled">定时报表</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        
        <!-- 主内容区 -->
        <el-container class="main-content">
          <!-- 顶部导航栏 -->
          <el-header class="header">
            <div class="header-left">
              <el-button
                type="text"
                class="menu-toggle"
                @click="toggleSidebar"
              >
                <el-icon><Menu /></el-icon>
              </el-button>
            </div>
            <div class="header-right">
              <el-dropdown>
                <span class="user-info">
                  <el-avatar :size="32" :src="userAvatar"></el-avatar>
                  <span class="user-name">{{ userName }}</span>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人中心</el-dropdown-item>
                    <el-dropdown-item>修改密码</el-dropdown-item>
                    <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>
          
          <!-- 页面内容 -->
          <el-main class="page-content">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  House,
  User,
  OfficeBuilding,
  Position,
  Star,
  Wallet,
  Promotion,
  Medal,
  Warning,
  Setting,
  DataAnalysis,
  Menu
} from '@element-plus/icons-vue'

const router = useRouter()
const isLoggedIn = ref(false)
const sidebarCollapsed = ref(false)
const userName = ref('管理员')
const userAvatar = ref('')

// 计算当前激活的菜单
const activeMenu = computed(() => {
  const path = router.currentRoute.value.path
  return path.split('/')[1] ? `/${path.split('/')[1]}` : '/dashboard'
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  isLoggedIn.value = false
  router.push('/login')
}

// 检查登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
    // 可以从localStorage获取用户信息
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const info = JSON.parse(userInfo)
      userName.value = info.username || '管理员'
      userAvatar.value = info.avatar || ''
    }
  } else {
    isLoggedIn.value = false
    router.push('/login')
  }
}

onMounted(() => {
  checkLoginStatus()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  width: 100%;
  height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.main-container {
  height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #1f2329;
  color: #fff;
  transition: all 0.3s;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #303641;
}

.logo h1 {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
  background-color: #1f2329;
}

.sidebar-menu .el-menu-item {
  color: #c0c4cc;
  height: 60px;
  line-height: 60px;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-menu-item.is-active {
  color: #fff;
  background-color: #272b33;
}

.sidebar-menu .el-sub-menu__title {
  color: #c0c4cc;
  height: 60px;
  line-height: 60px;
}

.sidebar-menu .el-sub-menu__title:hover {
  color: #fff;
  background-color: #272b33;
}

/* 顶部导航栏 */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.menu-toggle {
  font-size: 20px;
  margin-right: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin-left: 10px;
  font-size: 14px;
}

/* 主内容区 */
.page-content {
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .sidebar {
    width: 64px !important;
  }
  
  .sidebar .logo h1 {
    font-size: 0;
  }
}
</style>