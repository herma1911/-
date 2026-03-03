<template>
  <div class="milestone-monitor">
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>临时工板块 - 业务迭代里程碑监控</span>
          <el-button type="primary" size="small" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      
      <!-- 当前版本信息 -->
      <div class="current-version">
        <h2 class="version-title">当前版本</h2>
        <div class="version-card" :class="currentVersion.class">
          <div class="version-info">
            <span class="version-code">{{ currentVersion.code }}</span>
            <span class="version-name">{{ currentVersion.name }}</span>
          </div>
          <div class="version-desc">{{ currentVersion.description }}</div>
        </div>
      </div>
      
      <!-- 下一版本触发条件 -->
      <div class="next-version">
        <h2 class="version-title">下一版本触发条件</h2>
        <div class="trigger-conditions">
          <div v-for="condition in nextVersion.conditions" :key="condition.id" class="condition-item">
            <div class="condition-info">
              <span class="condition-name">{{ condition.name }}</span>
              <span class="condition-target">目标: {{ condition.target }}</span>
            </div>
            <div class="condition-progress">
              <el-progress 
                :percentage="condition.progress" 
                :color="condition.color"
                :stroke-width="15"
              />
              <div class="condition-status">
                <span class="current-value">{{ condition.current }}</span>
                <span class="remaining">还差 {{ condition.remaining }} 达标</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="upgrade-status" :class="{ 'ready': isReadyForUpgrade }">
          <el-tag :type="isReadyForUpgrade ? 'success' : 'info'">
            {{ isReadyForUpgrade ? '✅ 可升级到 ' + nextVersion.code : '📊 正在积累数据' }}
          </el-tag>
          <el-button 
            v-if="isReadyForUpgrade" 
            type="success" 
            @click="confirmUpgrade"
            style="margin-left: 10px;"
          >
            确认升级
          </el-button>
        </div>
      </div>
      
      <!-- 历史版本记录 -->
      <div class="version-history">
        <h2 class="version-title">历史版本记录</h2>
        <el-table :data="versionHistory" style="width: 100%">
          <el-table-column prop="code" label="版本代号" width="120" />
          <el-table-column prop="name" label="版本名称" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'completed' ? 'success' : 'info'">
                {{ scope.row.status === 'completed' ? '已完成' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="150" />
          <el-table-column prop="endDate" label="完成日期" width="150" />
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>
    </el-card>
    
    <!-- 达标提醒弹窗 -->
    <el-dialog
      v-model="showUpgradeDialog"
      title="版本升级提醒"
      width="500px"
    >
      <div class="upgrade-dialog-content">
        <el-alert
          title="🎉 恭喜！"
          type="success"
          description="当前版本数据已达标，可以升级到下一版本了！"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />
        <div class="upgrade-info">
          <p><strong>当前版本：</strong>{{ currentVersion.code }} - {{ currentVersion.name }}</p>
          <p><strong>下一版本：</strong>{{ nextVersion.code }} - {{ nextVersion.name }}</p>
          <p><strong>升级条件：</strong>所有触发条件已满足</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpgradeDialog = false">稍后处理</el-button>
          <el-button type="primary" @click="confirmUpgrade">确认升级</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MilestoneMonitor',
  data() {
    return {
      // 当前版本信息
      currentVersion: {
        code: '临时工V1.0',
        name: '极简版',
        description: '冷启动，验证工厂发单、工人接单意愿',
        class: 'version-v1'
      },
      // 下一版本信息
      nextVersion: {
        code: '临时工V2.0',
        name: '抢单版',
        conditions: [
          {
            id: 1,
            name: '工厂发单量',
            current: 15,
            target: 30,
            progress: 50,
            remaining: 15,
            color: '#409EFF'
          },
          {
            id: 2,
            name: '工人浏览量',
            current: 120,
            target: 200,
            progress: 60,
            remaining: 80,
            color: '#67C23A'
          }
        ]
      },
      // 版本历史
      versionHistory: [
        {
          code: '临时工V1.0',
          name: '极简版',
          status: 'in_progress',
          startDate: '2026-03-01',
          endDate: '',
          description: '冷启动，验证工厂发单、工人接单意愿'
        }
      ],
      // 达标提醒弹窗
      showUpgradeDialog: false,
      // 升级状态
      isReadyForUpgrade: false
    }
  },
  mounted() {
    this.checkUpgradeStatus()
    // 每5分钟自动检查一次
    this.interval = setInterval(() => {
      this.refreshData()
    }, 5 * 60 * 1000)
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    // 刷新数据
    refreshData() {
      // 模拟数据更新
      this.simulateDataUpdate()
      this.checkUpgradeStatus()
    },
    
    // 模拟数据更新
    simulateDataUpdate() {
      // 模拟工厂发单量增长
      const factoryCondition = this.nextVersion.conditions[0]
      if (factoryCondition.current < factoryCondition.target) {
        factoryCondition.current += Math.floor(Math.random() * 3)
        factoryCondition.current = Math.min(factoryCondition.current, factoryCondition.target)
        factoryCondition.progress = Math.round((factoryCondition.current / factoryCondition.target) * 100)
        factoryCondition.remaining = factoryCondition.target - factoryCondition.current
      }
      
      // 模拟工人浏览量增长
      const workerCondition = this.nextVersion.conditions[1]
      if (workerCondition.current < workerCondition.target) {
        workerCondition.current += Math.floor(Math.random() * 10)
        workerCondition.current = Math.min(workerCondition.current, workerCondition.target)
        workerCondition.progress = Math.round((workerCondition.current / workerCondition.target) * 100)
        workerCondition.remaining = workerCondition.target - workerCondition.current
      }
    },
    
    // 检查升级状态
    checkUpgradeStatus() {
      const allConditionsMet = this.nextVersion.conditions.every(condition => 
        condition.current >= condition.target
      )
      
      if (allConditionsMet && !this.isReadyForUpgrade) {
        this.isReadyForUpgrade = true
        // 显示达标提醒弹窗
        this.showUpgradeDialog = true
        // 模拟后台系统自动推送提醒到企业微信
        this.sendWechatNotification()
      }
    },
    
    // 模拟发送企业微信通知
    sendWechatNotification() {
      console.log('📱 后台系统自动推送提醒到企业微信：临时工V1.0数据达标，可以升级到V2.0了！')
      // 实际项目中这里会调用企业微信API发送通知
    },
    
    // 确认升级
    confirmUpgrade() {
      // 模拟升级操作
      this.$message.success(`已确认升级到 ${this.nextVersion.code}`)
      
      // 更新版本信息
      this.currentVersion = {
        code: this.nextVersion.code,
        name: this.nextVersion.name,
        description: this.getVersionDescription(this.nextVersion.code),
        class: this.nextVersion.code.includes('V2') ? 'version-v2' : 'version-v3'
      }
      
      // 更新下一版本信息
      if (this.nextVersion.code === '临时工V2.0') {
        this.nextVersion = {
          code: '临时工V3.0',
          name: '抽佣版',
          conditions: [
            {
              id: 1,
              name: '真实完工确认单数',
              current: 0,
              target: 10,
              progress: 0,
              remaining: 10,
              color: '#E6A23C'
            }
          ]
        }
      } else if (this.nextVersion.code === '临时工V3.0') {
        this.nextVersion = {
          code: '临时工V4.0',
          name: '优化版',
          conditions: [
            {
              id: 1,
              name: '稳定成交单数',
              current: 0,
              target: 10,
              progress: 0,
              remaining: 10,
              color: '#909399'
            }
          ]
        }
      }
      
      // 更新版本历史
      const currentHistory = this.versionHistory.find(item => 
        item.code === this.currentVersion.code && item.status === 'in_progress'
      )
      if (currentHistory) {
        currentHistory.status = 'completed'
        currentHistory.endDate = new Date().toISOString().split('T')[0]
      }
      
      this.versionHistory.push({
        code: this.currentVersion.code,
        name: this.currentVersion.name,
        status: 'in_progress',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: this.currentVersion.description
      })
      
      // 重置升级状态
      this.isReadyForUpgrade = false
      this.showUpgradeDialog = false
    },
    
    // 获取版本描述
    getVersionDescription(versionCode) {
      if (versionCode.includes('V2')) {
        return '提升匹配效率，增加用户粘性'
      } else if (versionCode.includes('V3')) {
        return '实现盈利，建立商业模式'
      } else {
        return '持续优化，提升用户体验'
      }
    }
  }
}
</script>

<style scoped>
.milestone-monitor {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 15px;
  color: #303133;
}

.current-version {
  margin-bottom: 30px;
}

.version-card {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.version-v1 {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.version-v2 {
  background-color: #f0f9eb;
  border: 1px solid #d9f7be;
}

.version-v3 {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.version-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.version-code {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.version-name {
  font-size: 14px;
  color: #606266;
}

.version-desc {
  font-size: 14px;
  color: #909399;
}

.next-version {
  margin-bottom: 30px;
}

.trigger-conditions {
  margin-bottom: 20px;
}

.condition-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.condition-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.condition-name {
  font-weight: bold;
  color: #303133;
}

.condition-target {
  color: #606266;
}

.condition-progress {
  margin-top: 10px;
}

.condition-status {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 14px;
}

.current-value {
  font-weight: bold;
  color: #409EFF;
}

.remaining {
  color: #909399;
}

.upgrade-status {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.upgrade-status.ready {
  background-color: #f0f9eb;
  border: 1px solid #d9f7be;
}

.version-history {
  margin-top: 30px;
}

.upgrade-dialog-content {
  padding: 20px;
}

.upgrade-info {
  margin-top: 20px;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>