<template>
  <div class="admin-notification">
    <!-- 后台提醒组件 -->
    <el-alert
      v-if="showAlert"
      :title="alertTitle"
      :description="alertDescription"
      type="warning"
      show-icon
      :closable="false"
    >
      <template #default>
        <div class="alert-actions">
          <el-button type="primary" size="small" @click="handleAlertAction">立即处理</el-button>
          <el-button size="small" @click="dismissAlert">稍后处理</el-button>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const showAlert = ref(false)
const alertTitle = ref('')
const alertDescription = ref('')

// 检查平台阶段状态
const checkPlatformStage = () => {
  // 从本地存储或API获取平台设置
  const platformSettings = JSON.parse(localStorage.getItem('platformSettings') || '{}')
  const currentStage = platformSettings.currentStage || 'coldStart'
  const coldStartEndDate = platformSettings.coldStartEndDate ? new Date(platformSettings.coldStartEndDate) : new Date('2026-09-03 23:59:59')
  
  const now = new Date()
  const timeDiff = coldStartEndDate - now
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  // 检查是否需要显示提醒
  if (currentStage === 'coldStart') {
    if (daysLeft === 7) {
      showAlert.value = true
      alertTitle.value = '冷启动期即将结束'
      alertDescription.value = '冷启动期还有7天结束，请准备开启简历数量限制。只有您（平台管理员）能看到此提醒，工厂端不会收到任何通知。'
    } else if (daysLeft === 0) {
      showAlert.value = true
      alertTitle.value = '冷启动期今日结束'
      alertDescription.value = '冷启动期今日结束，请立即开启简历数量限制。只有您（平台管理员）能看到此提醒，工厂端不会收到任何通知。'
    } else if (daysLeft < 0) {
      showAlert.value = true
      alertTitle.value = '冷启动期已结束'
      alertDescription.value = '冷启动期已结束，请立即开启简历数量限制。只有您（平台管理员）能看到此提醒，工厂端不会收到任何通知。'
    }
  }
}

// 处理提醒操作
const handleAlertAction = () => {
  // 跳转到系统设置页面的平台阶段设置
  window.location.hash = '#/system/settings?tab=platform'
  dismissAlert()
}

//  dismiss提醒
const dismissAlert = () => {
  showAlert.value = false
}

// 组件挂载时检查
onMounted(() => {
  checkPlatformStage()
  // 每天检查一次
  setInterval(checkPlatformStage, 24 * 60 * 60 * 1000)
})
</script>

<style scoped>
.admin-notification {
  margin-bottom: 20px;
}

.alert-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>