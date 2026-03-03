<template>
  <div class="worker-detail-container">
    <h2>工人详情</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工人信息详情</span>
          <el-button type="primary" size="small" @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <!-- 基础信息 -->
      <el-tabs>
        <el-tab-pane label="基础信息">
          <el-form :model="workerInfo" label-width="120px">
            <el-form-item label="用户ID">
              <el-input v-model="workerInfo.id" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="workerInfo.phone" disabled />
            </el-form-item>
            <el-form-item label="注册时间">
              <el-input v-model="workerInfo.registerTime" disabled />
            </el-form-item>
            <el-form-item label="所在城市">
              <el-input v-model="workerInfo.city" disabled />
            </el-form-item>
            <el-form-item label="擅长工序">
              <el-input v-model="workerInfo.skill" disabled />
            </el-form-item>
            <el-form-item label="工龄">
              <el-input v-model="workerInfo.workYears" disabled />
            </el-form-item>
            <el-form-item label="实名认证">
              <el-tag :type="workerInfo.certification ? 'success' : 'danger'">
                {{ workerInfo.certification ? '已认证' : '未认证' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="活跃状态">
              <el-tag :type="workerInfo.status ? 'success' : 'info'">
                {{ workerInfo.status ? '活跃' : '不活跃' }}
              </el-tag>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="简历信息">
          <el-form :model="workerInfo.resume" label-width="120px">
            <el-form-item label="姓名">
              <el-input v-model="workerInfo.resume.name" disabled />
            </el-form-item>
            <el-form-item label="性别">
              <el-input v-model="workerInfo.resume.gender" disabled />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="workerInfo.resume.age" disabled />
            </el-form-item>
            <el-form-item label="教育程度">
              <el-input v-model="workerInfo.resume.education" disabled />
            </el-form-item>
            <el-form-item label="工作经验">
              <el-input v-model="workerInfo.resume.experience" disabled />
            </el-form-item>
            <el-form-item label="期望薪资">
              <el-input v-model="workerInfo.resume.expectedSalary" disabled />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="行为数据">
          <el-collapse>
            <el-collapse-item title="投递记录">
              <el-table :data="deliveryRecords" style="width: 100%">
                <el-table-column prop="jobId" label="岗位ID" width="100" />
                <el-table-column prop="jobTitle" label="岗位名称" />
                <el-table-column prop="deliveryTime" label="投递时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="入职记录">
              <el-table :data="onboardingRecords" style="width: 100%">
                <el-table-column prop="factoryId" label="工厂ID" width="100" />
                <el-table-column prop="factoryName" label="工厂名称" />
                <el-table-column prop="onboardingTime" label="入职时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="对账记录">
              <el-table :data="reconciliationRecords" style="width: 100%">
                <el-table-column prop="reconciliationId" label="对账ID" width="100" />
                <el-table-column prop="factoryName" label="工厂名称" />
                <el-table-column prop="amount" label="金额" width="100" />
                <el-table-column prop="reconciliationTime" label="对账时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="评价记录">
              <el-table :data="evaluationRecords" style="width: 100%">
                <el-table-column prop="factoryName" label="工厂名称" />
                <el-table-column prop="score" label="评分" width="80" />
                <el-table-column prop="comment" label="评价内容" />
                <el-table-column prop="evaluationTime" label="评价时间" width="180" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        
        <el-tab-pane label="激励数据">
          <el-form :model="workerInfo.incentive" label-width="120px">
            <el-form-item label="获得勋章">
              <el-tag v-for="medal in workerInfo.incentive.medals" :key="medal" size="small" style="margin-right: 10px">
                {{ medal }}
              </el-tag>
            </el-form-item>
            <el-form-item label="获得奖励">
              <el-tag v-for="reward in workerInfo.incentive.rewards" :key="reward" size="small" style="margin-right: 10px">
                {{ reward }}
              </el-tag>
            </el-form-item>
            <el-form-item label="邀请拉新">
              <el-input v-model="workerInfo.incentive.referralCount" disabled />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const workerId = route.params.id

// 模拟数据
const workerInfo = ref({
  id: workerId || '1',
  phone: '13800138001',
  registerTime: '2024-01-01',
  city: '广州',
  skill: '车工',
  workYears: '3年',
  certification: true,
  status: true,
  resume: {
    name: '张三',
    gender: '男',
    age: '28',
    education: '初中',
    experience: '5年车工经验',
    expectedSalary: '6000-8000元/月'
  },
  incentive: {
    medals: ['新人勋章', '勤奋勋章', '技能达人'],
    rewards: ['现金红包', '置顶卡', '免费套餐'],
    referralCount: '5人'
  }
})

// 模拟行为数据
const deliveryRecords = ref([
  {
    jobId: '101',
    jobTitle: '车工',
    deliveryTime: '2024-01-10',
    status: '已面试'
  },
  {
    jobId: '102',
    jobTitle: '裁剪工',
    deliveryTime: '2024-01-15',
    status: '已录用'
  }
])

const onboardingRecords = ref([
  {
    factoryId: '201',
    factoryName: '广州服装厂',
    onboardingTime: '2024-01-20',
    status: '已入职'
  }
])

const reconciliationRecords = ref([
  {
    reconciliationId: '301',
    factoryName: '广州服装厂',
    amount: '6500元',
    reconciliationTime: '2024-02-01',
    status: '已确认'
  }
])

const evaluationRecords = ref([
  {
    factoryName: '广州服装厂',
    score: '4.5',
    comment: '工作环境不错，工资按时发放',
    evaluationTime: '2024-02-10'
  }
])

// 返回列表
const goBack = () => {
  router.push('/worker/list')
}

onMounted(() => {
  // 这里可以根据workerId调用API获取工人详情数据
})
</script>

<style scoped>
.worker-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-collapse {
  margin-top: 20px;
}
</style>