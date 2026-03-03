<template>
  <div class="factory-detail-container">
    <h2>工厂详情</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工厂信息详情</span>
          <el-button type="primary" size="small" @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <!-- 基础信息 -->
      <el-tabs>
        <el-tab-pane label="基础信息">
          <el-form :model="factoryInfo" label-width="120px">
            <el-form-item label="工厂ID">
              <el-input v-model="factoryInfo.id" disabled />
            </el-form-item>
            <el-form-item label="企业名称">
              <el-input v-model="factoryInfo.name" disabled />
            </el-form-item>
            <el-form-item label="负责人">
              <el-input v-model="factoryInfo.contact" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="factoryInfo.phone" disabled />
            </el-form-item>
            <el-form-item label="注册时间">
              <el-input v-model="factoryInfo.registerTime" disabled />
            </el-form-item>
            <el-form-item label="所在城市">
              <el-input v-model="factoryInfo.city" disabled />
            </el-form-item>
            <el-form-item label="认证状态">
              <el-tag :type="factoryInfo.certification ? 'success' : 'danger'">
                {{ factoryInfo.certification ? '已认证' : '未认证' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="活跃状态">
              <el-tag :type="factoryInfo.status ? 'success' : 'info'">
                {{ factoryInfo.status ? '活跃' : '不活跃' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="付费状态">
              <el-tag :type="factoryInfo.paidStatus ? 'success' : 'info'">
                {{ factoryInfo.paidStatus ? '付费' : '免费' }}
              </el-tag>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="认证信息">
          <el-form :model="factoryInfo.certificationInfo" label-width="120px">
            <el-form-item label="企业资质">
              <el-input v-model="factoryInfo.certificationInfo.qualification" disabled />
            </el-form-item>
            <el-form-item label="营业执照">
              <el-input v-model="factoryInfo.certificationInfo.businessLicense" disabled />
            </el-form-item>
            <el-form-item label="认证时间">
              <el-input v-model="factoryInfo.certificationInfo.certificationTime" disabled />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="行为数据">
          <el-collapse>
            <el-collapse-item title="岗位发布记录">
              <el-table :data="jobRecords" style="width: 100%">
                <el-table-column prop="jobId" label="岗位ID" width="100" />
                <el-table-column prop="jobTitle" label="岗位名称" />
                <el-table-column prop="publishTime" label="发布时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="招聘数据">
              <el-table :data="recruitmentData" style="width: 100%">
                <el-table-column prop="month" label="月份" width="100" />
                <el-table-column prop="views" label="浏览量" width="100" />
                <el-table-column prop="applications" label="投递数" width="100" />
                <el-table-column prop="onboarding" label="到岗数" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="入职闭环记录">
              <el-table :data="onboardingRecords" style="width: 100%">
                <el-table-column prop="workerId" label="工人ID" width="100" />
                <el-table-column prop="workerName" label="工人姓名" />
                <el-table-column prop="onboardingTime" label="入职时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="对账记录">
              <el-table :data="reconciliationRecords" style="width: 100%">
                <el-table-column prop="reconciliationId" label="对账ID" width="100" />
                <el-table-column prop="workerName" label="工人姓名" />
                <el-table-column prop="amount" label="金额" width="100" />
                <el-table-column prop="reconciliationTime" label="对账时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="评价数据">
              <el-table :data="evaluationData" style="width: 100%">
                <el-table-column prop="workerName" label="工人姓名" />
                <el-table-column prop="score" label="评分" width="80" />
                <el-table-column prop="comment" label="评价内容" />
                <el-table-column prop="evaluationTime" label="评价时间" width="180" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        
        <el-tab-pane label="付费数据">
          <el-collapse>
            <el-collapse-item title="套餐开通记录">
              <el-table :data="packageRecords" style="width: 100%">
                <el-table-column prop="packageId" label="套餐ID" width="100" />
                <el-table-column prop="packageName" label="套餐名称" />
                <el-table-column prop="startTime" label="开始时间" width="180" />
                <el-table-column prop="endTime" label="结束时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="权益使用记录">
              <el-table :data="privilegeRecords" style="width: 100%">
                <el-table-column prop="privilegeId" label="权益ID" width="100" />
                <el-table-column prop="privilegeName" label="权益名称" />
                <el-table-column prop="useTime" label="使用时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
            
            <el-collapse-item title="消费记录">
              <el-table :data="consumptionRecords" style="width: 100%">
                <el-table-column prop="orderId" label="订单ID" width="100" />
                <el-table-column prop="amount" label="金额" width="100" />
                <el-table-column prop="consumptionTime" label="消费时间" width="180" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        
        <el-tab-pane label="勋章权益">
          <el-form :model="factoryInfo.medals" label-width="120px">
            <el-form-item label="获得勋章">
              <el-tag v-for="medal in factoryInfo.medals.list" :key="medal" size="small" style="margin-right: 10px">
                {{ medal }}
              </el-tag>
            </el-form-item>
            <el-form-item label="解锁特权">
              <el-tag v-for="privilege in factoryInfo.medals.privileges" :key="privilege" size="small" style="margin-right: 10px">
                {{ privilege }}
              </el-tag>
            </el-form-item>
            <el-form-item label="流量加权记录">
              <el-tag v-for="record in factoryInfo.medals.trafficRecords" :key="record" size="small" style="margin-right: 10px">
                {{ record }}
              </el-tag>
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
const factoryId = route.params.id

// 模拟数据
const factoryInfo = ref({
  id: factoryId || '1',
  name: '广州服装厂',
  contact: '王经理',
  phone: '13800138001',
  registerTime: '2024-01-01',
  city: '广州',
  certification: true,
  status: true,
  paidStatus: true,
  certificationInfo: {
    qualification: '服装生产',
    businessLicense: '91440101MA12345678',
    certificationTime: '2024-01-05'
  },
  medals: {
    list: ['诚信经营', '优质工厂', '高活跃度'],
    privileges: ['流量加权', '简历置顶', '套餐折扣'],
    trafficRecords: ['2024-01-10', '2024-01-15', '2024-01-20']
  }
})

// 模拟行为数据
const jobRecords = ref([
  {
    jobId: '101',
    jobTitle: '车工',
    publishTime: '2024-01-01',
    status: '已发布'
  },
  {
    jobId: '102',
    jobTitle: '裁剪工',
    publishTime: '2024-01-05',
    status: '已发布'
  }
])

const recruitmentData = ref([
  {
    month: '2024-01',
    views: 1200,
    applications: 120,
    onboarding: 20
  },
  {
    month: '2024-02',
    views: 1500,
    applications: 150,
    onboarding: 25
  }
])

const onboardingRecords = ref([
  {
    workerId: '1001',
    workerName: '张三',
    onboardingTime: '2024-01-10',
    status: '已入职'
  },
  {
    workerId: '1002',
    workerName: '李四',
    onboardingTime: '2024-01-15',
    status: '已入职'
  }
])

const reconciliationRecords = ref([
  {
    reconciliationId: '2001',
    workerName: '张三',
    amount: '6500元',
    reconciliationTime: '2024-01-31',
    status: '已确认'
  },
  {
    reconciliationId: '2002',
    workerName: '李四',
    amount: '7000元',
    reconciliationTime: '2024-01-31',
    status: '已确认'
  }
])

const evaluationData = ref([
  {
    workerName: '张三',
    score: '4.5',
    comment: '工作环境不错，工资按时发放',
    evaluationTime: '2024-01-15'
  },
  {
    workerName: '李四',
    score: '4.8',
    comment: '工厂管理规范，福利待遇好',
    evaluationTime: '2024-01-20'
  }
])

// 模拟付费数据
const packageRecords = ref([
  {
    packageId: '3001',
    packageName: '招工记账基础包',
    startTime: '2024-01-01',
    endTime: '2024-01-31',
    status: '已过期'
  },
  {
    packageId: '3002',
    packageName: '招工记账专业包',
    startTime: '2024-02-01',
    endTime: '2024-02-29',
    status: '进行中'
  }
])

const privilegeRecords = ref([
  {
    privilegeId: '4001',
    privilegeName: '岗位置顶',
    useTime: '2024-01-10',
    status: '已使用'
  },
  {
    privilegeId: '4002',
    privilegeName: '简历置顶',
    useTime: '2024-01-15',
    status: '已使用'
  }
])

const consumptionRecords = ref([
  {
    orderId: '5001',
    amount: '199元',
    consumptionTime: '2024-01-01',
    status: '已支付'
  },
  {
    orderId: '5002',
    amount: '299元',
    consumptionTime: '2024-02-01',
    status: '已支付'
  }
])

// 返回列表
const goBack = () => {
  router.push('/factory/list')
}

onMounted(() => {
  // 这里可以根据factoryId调用API获取工厂详情数据
})
</script>

<style scoped>
.factory-detail-container {
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