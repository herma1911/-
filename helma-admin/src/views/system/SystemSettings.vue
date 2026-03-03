<template>
  <div class="system-settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基础设置 -->
        <el-tab-pane label="基础设置" name="basic">
          <el-form :model="basicSettings" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicSettings.systemVersion" disabled />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="basicSettings.copyright" type="textarea" />
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input v-model="basicSettings.contact" />
            </el-form-item>
            <el-form-item label="是否开启注册">
              <el-switch v-model="basicSettings.allowRegister" />
            </el-form-item>
            <el-form-item label="是否开启审核">
              <el-switch v-model="basicSettings.needAudit" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="notificationSettings" label-width="120px">
            <el-form-item label="邮件服务器">
              <el-input v-model="notificationSettings.smtpServer" />
            </el-form-item>
            <el-form-item label="邮件端口">
              <el-input v-model="notificationSettings.smtpPort" type="number" />
            </el-form-item>
            <el-form-item label="发件人邮箱">
              <el-input v-model="notificationSettings.senderEmail" />
            </el-form-item>
            <el-form-item label="发件人密码">
              <el-input v-model="notificationSettings.senderPassword" type="password" />
            </el-form-item>
            <el-form-item label="是否开启邮件通知">
              <el-switch v-model="notificationSettings.enableEmail" />
            </el-form-item>
            <el-form-item label="是否开启短信通知">
              <el-switch v-model="notificationSettings.enableSms" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 预警设置 -->
        <el-tab-pane label="预警设置" name="warning">
          <el-form :model="warningSettings" label-width="120px">
            <el-form-item label="到岗闭环预警阈值">
              <el-input v-model="warningSettings.closureThreshold" type="number" />
              <span class="form-tip">连续下滑百分比</span>
            </el-form-item>
            <el-form-item label="对账完成率预警阈值">
              <el-input v-model="warningSettings.reconciliationThreshold" type="number" />
              <span class="form-tip">百分比</span>
            </el-form-item>
            <el-form-item label="异常行为预警">
              <el-switch v-model="warningSettings.enableAnomalyWarning" />
            </el-form-item>
            <el-form-item label="预警通知方式">
              <el-select v-model="warningSettings.notificationMethod" multiple placeholder="请选择">
                <el-option label="邮件" value="email" />
                <el-option label="短信" value="sms" />
                <el-option label="系统消息" value="system" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveWarningSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 自动审核规则 -->
        <el-tab-pane label="自动审核规则" name="audit">
          <el-form :model="auditSettings" label-width="120px">
            <el-form-item label="自动审核岗位">
              <el-switch v-model="auditSettings.autoAuditJobs" />
            </el-form-item>
            <el-form-item label="自动审核条件">
              <el-checkbox-group v-model="auditSettings.autoAuditConditions">
                <el-checkbox label="已认证工厂">已认证工厂</el-checkbox>
                <el-checkbox label="无违规记录">无违规记录</el-checkbox>
                <el-checkbox label="信用评分≥80">信用评分≥80</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="自动审核评价">
              <el-switch v-model="auditSettings.autoAuditEvaluations" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAuditSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 平台阶段设置 -->
        <el-tab-pane label="平台阶段设置" name="platform">
          <el-form :model="platformSettings" label-width="180px">
            <el-form-item label="当前平台阶段">
              <el-select v-model="platformSettings.currentStage" placeholder="请选择">
                <el-option label="冷启动期" value="coldStart" />
                <el-option label="成长期" value="growth" />
                <el-option label="成熟期" value="mature" />
              </el-select>
            </el-form-item>
            <el-form-item label="冷启动期结束时间">
              <el-date-picker
                v-model="platformSettings.coldStartEndDate"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="是否开启简历数量限制">
              <el-switch v-model="platformSettings.enableResumeLimit" />
            </el-form-item>
            <el-form-item label="每月免费简历查看额度">
              <el-input v-model="platformSettings.freeResumeLimit" type="number" />
              <span class="form-tip">仅在成长期和成熟期生效</span>
            </el-form-item>
            <el-form-item label="管理员提醒设置">
              <el-checkbox-group v-model="platformSettings.adminNotification">
                <el-checkbox label="冷启动期结束前7天提醒">冷启动期结束前7天提醒</el-checkbox>
                <el-checkbox label="冷启动期结束当天提醒">冷启动期结束当天提醒</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePlatformSettings">保存设置</el-button>
              <el-button @click="checkStageStatus">检查阶段状态</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 当前激活的标签
const activeTab = ref('basic')

// 基础设置
const basicSettings = reactive({
  systemName: '赫尔玛智能管理系统',
  systemVersion: '1.0.0',
  copyright: '© 2024 赫尔玛智能科技有限公司',
  contact: 'support@helma.com',
  allowRegister: true,
  needAudit: true
})

// 通知设置
const notificationSettings = reactive({
  smtpServer: 'smtp.qq.com',
  smtpPort: 465,
  senderEmail: 'noreply@helma.com',
  senderPassword: '',
  enableEmail: true,
  enableSms: false
})

// 预警设置
const warningSettings = reactive({
  closureThreshold: 20,
  reconciliationThreshold: 80,
  enableAnomalyWarning: true,
  notificationMethod: ['email', 'system']
})

// 自动审核规则
const auditSettings = reactive({
  autoAuditJobs: true,
  autoAuditConditions: ['已认证工厂', '无违规记录'],
  autoAuditEvaluations: false
})

// 平台阶段设置
const platformSettings = reactive({
  currentStage: 'coldStart',
  coldStartEndDate: new Date('2026-09-03 23:59:59'),
  enableResumeLimit: false,
  freeResumeLimit: 100,
  adminNotification: ['冷启动期结束前7天提醒', '冷启动期结束当天提醒']
})

// 保存基础设置
const saveBasicSettings = () => {
  ElMessage.success('基础设置保存成功')
}

// 保存通知设置
const saveNotificationSettings = () => {
  ElMessage.success('通知设置保存成功')
}

// 保存预警设置
const saveWarningSettings = () => {
  ElMessage.success('预警设置保存成功')
}

// 保存自动审核规则
const saveAuditSettings = () => {
  ElMessage.success('自动审核规则保存成功')
}

// 保存平台阶段设置
const savePlatformSettings = () => {
  // 保存设置到后端或本地存储
  console.log('平台阶段设置已保存:', platformSettings)
  ElMessage.success('平台阶段设置保存成功')
}

// 检查阶段状态
const checkStageStatus = () => {
  const now = new Date()
  const endDate = new Date(platformSettings.coldStartEndDate)
  const timeDiff = endDate - now
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  if (daysLeft > 7) {
    ElMessage.info(`冷启动期还有 ${daysLeft} 天结束`)
  } else if (daysLeft === 7) {
    ElMessage.warning('冷启动期还有7天结束，请准备开启简历数量限制')
  } else if (daysLeft === 0) {
    ElMessage.error('冷启动期今日结束，请立即开启简历数量限制')
  } else if (daysLeft < 0) {
    ElMessage.error('冷启动期已结束，请开启简历数量限制')
  }
}
</script>

<style scoped>
.system-settings-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.form-tip {
  margin-left: 10px;
  color: #999;
  font-size: 14px;
}

.el-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>