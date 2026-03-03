<template>
  <div class="factory-score">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>工厂评分管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="工厂名称">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="searchForm.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="评分范围">
          <el-select v-model="searchForm.scoreRange" placeholder="请选择评分范围">
            <el-option label="4.5分以上" value="4.5-5" />
            <el-option label="4-4.5分" value="4-4.5" />
            <el-option label="3.5-4分" value="3.5-4" />
            <el-option label="3分以下" value="0-3.5" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.certificationStatus" placeholder="请选择认证状态">
            <el-option label="已认证" value="certified" />
            <el-option label="未认证" value="uncertified" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="factoryList" style="width: 100%">
        <el-table-column prop="id" label="工厂ID" width="100" />
        <el-table-column prop="factoryName" label="工厂名称" width="150" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="score" label="综合评分" width="120">
          <template #default="scope">
            <div class="score">
              <el-rate v-model="scope.row.score" disabled />
              <span class="score-text">{{ scope.row.score.toFixed(1) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="coreEvaluationCount" label="核心评价数" width="120" />
        <el-table-column prop="passerbyEvaluationCount" label="路人评价数" width="120" />
        <el-table-column prop="ranking" label="行业排名" width="100">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.ranking }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="certificationStatus" label="认证状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.certificationStatus === 'certified' ? 'success' : 'info'">
              {{ scope.row.certificationStatus === 'certified' ? '已认证' : '未认证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="viewEvaluations(scope.row)">查看评价</el-button>
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
      title="工厂评分详情"
      width="800px"
    >
      <div class="score-detail">
        <div class="basic-info">
          <h3>{{ currentFactory.factoryName }}</h3>
          <div class="info-row">
            <span class="label">城市：</span>
            <span>{{ currentFactory.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">认证状态：</span>
            <el-tag :type="currentFactory.certificationStatus === 'certified' ? 'success' : 'info'">
              {{ currentFactory.certificationStatus === 'certified' ? '已认证' : '未认证' }}
            </el-tag>
          </div>
          <div class="info-row">
            <span class="label">行业排名：</span>
            <el-tag type="primary">{{ currentFactory.ranking }}</el-tag>
          </div>
        </div>
        
        <div class="score-overview">
          <h4>评分概览</h4>
          <div class="total-score">
            <div class="score-value">{{ currentFactory.score.toFixed(1) }}</div>
            <div class="score-stars">
              <el-rate v-model="currentFactory.score" disabled />
            </div>
            <div class="score-count">{{ currentFactory.coreEvaluationCount + currentFactory.passerbyEvaluationCount }}条评价</div>
          </div>
          
          <div class="score-distribution">
            <h5>评分分布</h5>
            <div class="distribution-item" v-for="(count, star) in currentFactory.scoreDistribution" :key="star">
              <span class="star">{{ star }}星</span>
              <div class="progress-bar">
                <el-progress :percentage="(count / (currentFactory.coreEvaluationCount + currentFactory.passerbyEvaluationCount)) * 100" :color="getProgressColor(star)" />
              </div>
              <span class="count">{{ count }}条</span>
            </div>
          </div>
        </div>
        
        <div class="score-trend">
          <h4>评分趋势</h4>
          <div class="chart-container">
            <!-- 这里可以集成ECharts图表 -->
            <div class="mock-chart">
              <div class="chart-title">近6个月评分趋势</div>
              <div class="chart-bars">
                <div class="bar-item" v-for="(item, index) in currentFactory.scoreTrend" :key="index">
                  <div class="bar" :style="{ height: (item.score / 5) * 100 + '%' }"></div>
                  <div class="bar-label">{{ item.month }}</div>
                  <div class="bar-value">{{ item.score.toFixed(1) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="score-factors">
          <h4>评分维度</h4>
          <div class="factor-item" v-for="factor in currentFactory.scoreFactors" :key="factor.name">
            <span class="factor-name">{{ factor.name }}</span>
            <div class="factor-score">
              <el-rate v-model="factor.score" disabled />
              <span class="factor-value">{{ factor.score.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
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
  factoryName: '',
  city: '',
  scoreRange: '',
  certificationStatus: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 工厂列表
const factoryList = ref([])

// 弹窗
const dialogVisible = ref(false)
const currentFactory = ref({})

// 模拟数据
const mockFactories = [
  {
    id: 'F001',
    factoryName: '杭州服装厂',
    city: '杭州',
    score: 4.8,
    coreEvaluationCount: 120,
    passerbyEvaluationCount: 30,
    ranking: 1,
    certificationStatus: 'certified',
    updateTime: '2026-03-01 10:00:00',
    scoreDistribution: {
      5: 90,
      4: 45,
      3: 10,
      2: 3,
      1: 2
    },
    scoreTrend: [
      { month: '8月', score: 4.5 },
      { month: '9月', score: 4.6 },
      { month: '10月', score: 4.7 },
      { month: '11月', score: 4.7 },
      { month: '12月', score: 4.8 },
      { month: '1月', score: 4.8 }
    ],
    scoreFactors: [
      { name: '工作环境', score: 4.9 },
      { name: '薪资福利', score: 4.8 },
      { name: '管理规范', score: 4.7 },
      { name: '发展空间', score: 4.6 },
      { name: '企业文化', score: 4.8 }
    ]
  },
  {
    id: 'F002',
    factoryName: '上海制衣厂',
    city: '上海',
    score: 4.5,
    coreEvaluationCount: 80,
    passerbyEvaluationCount: 25,
    ranking: 2,
    certificationStatus: 'certified',
    updateTime: '2026-03-01 14:00:00',
    scoreDistribution: {
      5: 50,
      4: 40,
      3: 10,
      2: 3,
      1: 2
    },
    scoreTrend: [
      { month: '8月', score: 4.3 },
      { month: '9月', score: 4.4 },
      { month: '10月', score: 4.4 },
      { month: '11月', score: 4.5 },
      { month: '12月', score: 4.5 },
      { month: '1月', score: 4.5 }
    ],
    scoreFactors: [
      { name: '工作环境', score: 4.6 },
      { name: '薪资福利', score: 4.5 },
      { name: '管理规范', score: 4.4 },
      { name: '发展空间', score: 4.5 },
      { name: '企业文化', score: 4.4 }
    ]
  },
  {
    id: 'F003',
    factoryName: '广州服装厂',
    city: '广州',
    score: 4.2,
    coreEvaluationCount: 60,
    passerbyEvaluationCount: 20,
    ranking: 3,
    certificationStatus: 'certified',
    updateTime: '2026-03-02 09:00:00',
    scoreDistribution: {
      5: 30,
      4: 40,
      3: 25,
      2: 3,
      1: 2
    },
    scoreTrend: [
      { month: '8月', score: 4.0 },
      { month: '9月', score: 4.1 },
      { month: '10月', score: 4.1 },
      { month: '11月', score: 4.2 },
      { month: '12月', score: 4.2 },
      { month: '1月', score: 4.2 }
    ],
    scoreFactors: [
      { name: '工作环境', score: 4.3 },
      { name: '薪资福利', score: 4.2 },
      { name: '管理规范', score: 4.1 },
      { name: '发展空间', score: 4.2 },
      { name: '企业文化', score: 4.1 }
    ]
  },
  {
    id: 'F004',
    factoryName: '深圳制衣厂',
    city: '深圳',
    score: 3.8,
    coreEvaluationCount: 40,
    passerbyEvaluationCount: 15,
    ranking: 4,
    certificationStatus: 'uncertified',
    updateTime: '2026-03-02 11:00:00',
    scoreDistribution: {
      5: 15,
      4: 25,
      3: 25,
      2: 8,
      1: 2
    },
    scoreTrend: [
      { month: '8月', score: 3.6 },
      { month: '9月', score: 3.7 },
      { month: '10月', score: 3.7 },
      { month: '11月', score: 3.8 },
      { month: '12月', score: 3.8 },
      { month: '1月', score: 3.8 }
    ],
    scoreFactors: [
      { name: '工作环境', score: 3.9 },
      { name: '薪资福利', score: 3.8 },
      { name: '管理规范', score: 3.7 },
      { name: '发展空间', score: 3.8 },
      { name: '企业文化', score: 3.6 }
    ]
  },
  {
    id: 'F005',
    factoryName: '宁波服装厂',
    city: '宁波',
    score: 3.5,
    coreEvaluationCount: 30,
    passerbyEvaluationCount: 10,
    ranking: 5,
    certificationStatus: 'uncertified',
    updateTime: '2026-03-02 15:00:00',
    scoreDistribution: {
      5: 10,
      4: 15,
      3: 20,
      2: 10,
      1: 5
    },
    scoreTrend: [
      { month: '8月', score: 3.3 },
      { month: '9月', score: 3.4 },
      { month: '10月', score: 3.4 },
      { month: '11月', score: 3.5 },
      { month: '12月', score: 3.5 },
      { month: '1月', score: 3.5 }
    ],
    scoreFactors: [
      { name: '工作环境', score: 3.6 },
      { name: '薪资福利', score: 3.5 },
      { name: '管理规范', score: 3.4 },
      { name: '发展空间', score: 3.5 },
      { name: '企业文化', score: 3.3 }
    ]
  }
]

// 获取进度条颜色
const getProgressColor = (star) => {
  const colorMap = {
    5: '#67C23A',
    4: '#E6A23C',
    3: '#F56C6C',
    2: '#909399',
    1: '#909399'
  }
  return colorMap[star] || '#909399'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockFactories.filter(item => {
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.city && !item.city.includes(searchForm.city)) return false
    if (searchForm.certificationStatus && item.certificationStatus !== searchForm.certificationStatus) return false
    if (searchForm.scoreRange) {
      const [min, max] = searchForm.scoreRange.split('-').map(Number)
      if (item.score < min || item.score > max) return false
    }
    return true
  })
  factoryList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentFactory.value = { ...row }
  dialogVisible.value = true
}

// 查看评价
const viewEvaluations = (row) => {
  ElMessage.success('跳转到评价列表')
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
.factory-score {
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

.score {
  display: flex;
  align-items: center;
}

.score-text {
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
}

.score-detail {
  padding: 20px 0;
}

.basic-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.basic-info h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: bold;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
}

.score-overview {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.score-overview h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
}

.total-score {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 20px;
}

.score-stars {
  margin-right: 20px;
}

.score-count {
  color: #909399;
  font-size: 14px;
}

.score-distribution h5 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: bold;
}

.distribution-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.star {
  min-width: 40px;
  font-size: 14px;
}

.progress-bar {
  flex: 1;
  margin: 0 10px;
}

.count {
  min-width: 50px;
  font-size: 14px;
  text-align: right;
}

.score-trend {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.score-trend h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
}

.chart-container {
  height: 300px;
  background: #f9f9f9;
  border-radius: 4px;
  padding: 20px;
}

.mock-chart {
  width: 100%;
  height: 100%;
}

.chart-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: bold;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.bar {
  width: 30px;
  background: #409EFF;
  border-radius: 4px 4px 0 0;
  margin-bottom: 10px;
}

.bar-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.bar-value {
  font-size: 14px;
  font-weight: bold;
}

.score-factors h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
}

.factor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.factor-name {
  font-size: 14px;
  min-width: 100px;
}

.factor-score {
  display: flex;
  align-items: center;
}

.factor-value {
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
}

.dialog-footer {
  text-align: right;
}
</style>