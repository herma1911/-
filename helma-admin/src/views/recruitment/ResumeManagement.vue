<template>
  <div class="resume-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>简历库管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="工人姓名">
          <el-input v-model="searchForm.workerName" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="所在城市">
          <el-input v-model="searchForm.city" placeholder="请输入所在城市" />
        </el-form-item>
        <el-form-item label="擅长工序">
          <el-select v-model="searchForm.skills" placeholder="请选择擅长工序" multiple>
            <el-option label="缝纫" value="sewing" />
            <el-option label="裁剪" value="cutting" />
            <el-option label="熨烫" value="ironing" />
            <el-option label="包装" value="packaging" />
            <el-option label="质检" value="quality" />
          </el-select>
        </el-form-item>
        <el-form-item label="工龄">
          <el-select v-model="searchForm.workYears" placeholder="请选择工龄">
            <el-option label="1年以下" value="<1" />
            <el-option label="1-3年" value="1-3" />
            <el-option label="3-5年" value="3-5" />
            <el-option label="5年以上" value=">5" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.certificationStatus" placeholder="请选择认证状态">
            <el-option label="已认证" value="certified" />
            <el-option label="未认证" value="uncertified" />
          </el-select>
        </el-form-item>
        <el-form-item label="优质简历">
          <el-select v-model="searchForm.isQuality" placeholder="请选择是否优质">
            <el-option label="是" value="true" />
            <el-option label="否" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="resumeList" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="简历ID" width="100" />
        <el-table-column prop="workerName" label="工人姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="city" label="所在城市" width="120" />
        <el-table-column prop="skills" label="擅长工序">
          <template #default="scope">
            <el-tag v-for="skill in scope.row.skills" :key="skill" size="small" style="margin-right: 5px;">
              {{ skill }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workYears" label="工龄" width="100" />
        <el-table-column prop="education" label="学历" width="100" />
        <el-table-column prop="certificationStatus" label="认证状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.certificationStatus === 'certified' ? 'success' : 'info'">
              {{ scope.row.certificationStatus === 'certified' ? '已认证' : '未认证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isQuality" label="优质简历" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isQuality" type="success">优质</el-tag>
            <el-tag v-else type="info">普通</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="markQuality(scope.row)">
              {{ scope.row.isQuality ? '取消优质' : '标记优质' }}
            </el-button>
            <el-button size="small" type="success" @click="recommend(scope.row)">推荐</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="简历详情"
      width="800px"
    >
      <el-form :model="currentResume" label-width="120px">
        <el-form-item label="基本信息">
          <div class="info-section">
            <div class="info-item"><span class="label">姓名：</span>{{ currentResume.workerName }}</div>
            <div class="info-item"><span class="label">性别：</span>{{ currentResume.gender }}</div>
            <div class="info-item"><span class="label">年龄：</span>{{ currentResume.age }}岁</div>
            <div class="info-item"><span class="label">联系电话：</span>{{ currentResume.phone }}</div>
            <div class="info-item"><span class="label">所在城市：</span>{{ currentResume.city }}</div>
            <div class="info-item"><span class="label">学历：</span>{{ currentResume.education }}</div>
          </div>
        </el-form-item>
        <el-form-item label="专业技能">
          <div>
            <el-tag v-for="skill in currentResume.skills" :key="skill" size="small" style="margin-right: 5px; margin-bottom: 5px;">
              {{ skill }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="工作经历">
          <div v-for="(experience, index) in currentResume.experiences" :key="index" class="experience-item">
            <div class="experience-header">
              <span class="company">{{ experience.company }}</span>
              <span class="period">{{ experience.startDate }} - {{ experience.endDate }}</span>
            </div>
            <div class="experience-content">{{ experience.description }}</div>
          </div>
          <div v-if="!currentResume.experiences || currentResume.experiences.length === 0" class="text-gray">无工作经历</div>
        </el-form-item>
        <el-form-item label="教育背景">
          <div v-for="(education, index) in currentResume.educations" :key="index" class="education-item">
            <div class="education-header">
              <span class="school">{{ education.school }}</span>
              <span class="period">{{ education.startDate }} - {{ education.endDate }}</span>
            </div>
            <div class="education-content">{{ education.major }}</div>
          </div>
          <div v-if="!currentResume.educations || currentResume.educations.length === 0" class="text-gray">无教育背景</div>
        </el-form-item>
        <el-form-item label="期望薪资">
          <span>{{ currentResume.expectedSalary }}</span>
        </el-form-item>
        <el-form-item label="期望工作">
          <span>{{ currentResume.expectedJob }}</span>
        </el-form-item>
        <el-form-item label="自我评价">
          <div>{{ currentResume.selfEvaluation || '无' }}</div>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-tag :type="currentResume.certificationStatus === 'certified' ? 'success' : 'info'">
            {{ currentResume.certificationStatus === 'certified' ? '已认证' : '未认证' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadResume">下载简历</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 推荐弹窗 -->
    <el-dialog
      v-model="recommendDialogVisible"
      title="推荐简历"
      width="600px"
    >
      <el-form :model="recommendForm" label-width="100px">
        <el-form-item label="选择工厂">
          <el-select v-model="recommendForm.factoryId" placeholder="请选择工厂" style="width: 100%;">
            <el-option v-for="factory in factoryList" :key="factory.id" :label="factory.name" :value="factory.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐理由">
          <el-input
            v-model="recommendForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入推荐理由"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recommendDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRecommend">确认推荐</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  workerName: '',
  city: '',
  skills: [],
  workYears: '',
  certificationStatus: '',
  isQuality: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 简历列表
const resumeList = ref([])

// 弹窗
const dialogVisible = ref(false)
const recommendDialogVisible = ref(false)
const currentResume = ref({})
const recommendForm = reactive({
  factoryId: '',
  reason: ''
})

// 工厂列表
const factoryList = ref([
  { id: 'F001', name: '杭州服装厂' },
  { id: 'F002', name: '上海制衣厂' },
  { id: 'F003', name: '广州服装厂' },
  { id: 'F004', name: '深圳制衣厂' }
])

// 模拟数据
const mockResumes = [
  {
    id: 'R001',
    workerName: '张三',
    gender: '男',
    age: 25,
    phone: '138****1234',
    city: '杭州',
    skills: ['缝纫', '熨烫'],
    workYears: '3-5年',
    education: '高中',
    certificationStatus: 'certified',
    isQuality: true,
    updateTime: '2026-03-01 10:00:00',
    expectedSalary: '6000-8000元/月',
    expectedJob: '缝纫工',
    selfEvaluation: '有3年缝纫经验，熟悉各种面料的缝制工艺，工作认真负责',
    experiences: [
      {
        company: '杭州服装厂',
        startDate: '2023-01',
        endDate: '2026-02',
        description: '担任缝纫工，负责服装缝制，质量合格率98%以上'
      }
    ],
    educations: [
      {
        school: '杭州职业技术学校',
        startDate: '2018-09',
        endDate: '2021-06',
        major: '服装设计与工艺'
      }
    ]
  },
  {
    id: 'R002',
    workerName: '李四',
    gender: '女',
    age: 30,
    phone: '139****5678',
    city: '上海',
    skills: ['裁剪', '质检'],
    workYears: '5年以上',
    education: '大专',
    certificationStatus: 'certified',
    isQuality: true,
    updateTime: '2026-03-01 14:00:00',
    expectedSalary: '8000-10000元/月',
    expectedJob: '裁剪师',
    selfEvaluation: '有5年裁剪经验，熟悉各种服装版型，工作细致认真',
    experiences: [
      {
        company: '上海制衣厂',
        startDate: '2021-01',
        endDate: '2026-02',
        description: '担任裁剪师，负责服装裁剪，准确率99%以上'
      },
      {
        company: '苏州服装厂',
        startDate: '2018-01',
        endDate: '2020-12',
        description: '担任缝纫工，负责服装缝制'
      }
    ],
    educations: [
      {
        school: '上海纺织学院',
        startDate: '2015-09',
        endDate: '2018-06',
        major: '服装工艺'
      }
    ]
  },
  {
    id: 'R003',
    workerName: '王五',
    gender: '男',
    age: 22,
    phone: '137****9012',
    city: '广州',
    skills: ['包装', '熨烫'],
    workYears: '1-3年',
    education: '初中',
    certificationStatus: 'uncertified',
    isQuality: false,
    updateTime: '2026-03-02 09:00:00',
    expectedSalary: '4000-6000元/月',
    expectedJob: '包装工',
    selfEvaluation: '踏实肯干，能吃苦耐劳',
    experiences: [
      {
        company: '广州服装厂',
        startDate: '2024-01',
        endDate: '2026-02',
        description: '担任包装工，负责服装包装'
      }
    ],
    educations: []
  },
  {
    id: 'R004',
    workerName: '赵六',
    gender: '女',
    age: 28,
    phone: '136****3456',
    city: '深圳',
    skills: ['缝纫', '质检'],
    workYears: '3-5年',
    education: '高中',
    certificationStatus: 'certified',
    isQuality: false,
    updateTime: '2026-03-02 11:00:00',
    expectedSalary: '6000-8000元/月',
    expectedJob: '缝纫工',
    selfEvaluation: '有3年缝纫经验，工作认真负责，服从安排',
    experiences: [
      {
        company: '深圳制衣厂',
        startDate: '2023-01',
        endDate: '2026-02',
        description: '担任缝纫工，负责服装缝制'
      }
    ],
    educations: [
      {
        school: '深圳职业技术学校',
        startDate: '2015-09',
        endDate: '2018-06',
        major: '服装工艺'
      }
    ]
  },
  {
    id: 'R005',
    workerName: '孙七',
    gender: '男',
    age: 35,
    phone: '135****7890',
    city: '杭州',
    skills: ['裁剪', '缝纫', '熨烫'],
    workYears: '5年以上',
    education: '大专',
    certificationStatus: 'certified',
    isQuality: true,
    updateTime: '2026-03-02 15:00:00',
    expectedSalary: '10000-12000元/月',
    expectedJob: '生产组长',
    selfEvaluation: '有8年服装生产经验，熟悉生产流程，具备管理能力',
    experiences: [
      {
        company: '杭州服装厂',
        startDate: '2020-01',
        endDate: '2026-02',
        description: '担任生产组长，负责生产管理，提高生产效率20%'
      },
      {
        company: '宁波服装厂',
        startDate: '2018-01',
        endDate: '2019-12',
        description: '担任裁剪师，负责服装裁剪'
      }
    ],
    educations: [
      {
        school: '浙江纺织学院',
        startDate: '2012-09',
        endDate: '2015-06',
        major: '服装工程'
      }
    ]
  }
]

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockResumes.filter(item => {
    if (searchForm.workerName && !item.workerName.includes(searchForm.workerName)) return false
    if (searchForm.city && !item.city.includes(searchForm.city)) return false
    if (searchForm.workYears && item.workYears !== searchForm.workYears) return false
    if (searchForm.certificationStatus && item.certificationStatus !== searchForm.certificationStatus) return false
    if (searchForm.isQuality && item.isQuality.toString() !== searchForm.isQuality) return false
    if (searchForm.skills.length > 0) {
      const hasSkill = searchForm.skills.some(skill => item.skills.includes(skill))
      if (!hasSkill) return false
    }
    return true
  })
  resumeList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.skills = []
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentResume.value = { ...row }
  dialogVisible.value = true
}

// 下载简历
const downloadResume = () => {
  ElMessage.success('简历下载成功')
}

// 标记优质
const markQuality = (row) => {
  row.isQuality = !row.isQuality
  ElMessage.success(row.isQuality ? '标记优质成功' : '取消优质成功')
  handleSearch()
}

// 推荐
const recommend = (row) => {
  currentResume.value = { ...row }
  recommendForm.factoryId = ''
  recommendForm.reason = ''
  recommendDialogVisible.value = true
}

// 确认推荐
const confirmRecommend = () => {
  ElMessage.success('推荐成功')
  recommendDialogVisible.value = false
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  handleSearch()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  handleSearch()
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.resume-management {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-gray {
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}

.info-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 150px;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}

.experience-item,
.education-item {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.experience-header,
.education-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.company,
.school {
  font-weight: bold;
}

.period {
  color: #909399;
  font-size: 14px;
}

.experience-content,
.education-content {
  font-size: 14px;
  line-height: 1.5;
}
</style>