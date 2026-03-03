<template>
  <div class="job-management-container">
    <h2>岗位管理</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位发布管理</span>
          <el-button type="primary" size="small" @click="publishJob">发布岗位</el-button>
        </div>
      </template>
      <el-table :data="jobList" style="width: 100%">
        <el-table-column prop="id" label="岗位ID" width="120" />
        <el-table-column prop="factoryName" label="所属工厂" width="200" />
        <el-table-column prop="title" label="岗位名称" />
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column prop="status" label="岗位状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="80" />
        <el-table-column prop="applications" label="投递数" width="80" />
        <el-table-column prop="onboarding" label="到岗数" width="80" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="viewJob(scope.row.id)">查看</el-button>
            <el-button size="small" type="primary" @click="editJob(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteJob(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 模拟数据
const jobList = ref([
  {
    id: 1,
    factoryName: '广州服装厂',
    title: '车工',
    publishTime: '2024-01-01',
    status: '已发布',
    views: 120,
    applications: 20,
    onboarding: 5
  },
  {
    id: 2,
    factoryName: '深圳服装公司',
    title: '裁剪工',
    publishTime: '2024-01-02',
    status: '已发布',
    views: 98,
    applications: 15,
    onboarding: 3
  },
  {
    id: 3,
    factoryName: '东莞制衣厂',
    title: '熨烫工',
    publishTime: '2024-01-03',
    status: '已下架',
    views: 56,
    applications: 8,
    onboarding: 1
  },
  {
    id: 4,
    factoryName: '佛山纺织厂',
    title: '包装工',
    publishTime: '2024-01-04',
    status: '已发布',
    views: 85,
    applications: 12,
    onboarding: 2
  },
  {
    id: 5,
    factoryName: '中山服装有限公司',
    title: '质检员',
    publishTime: '2024-01-05',
    status: '已发布',
    views: 156,
    applications: 28,
    onboarding: 7
  },
  {
    id: 6,
    factoryName: '惠州制衣有限公司',
    title: '车工',
    publishTime: '2024-01-06',
    status: '已发布',
    views: 102,
    applications: 18,
    onboarding: 4
  },
  {
    id: 7,
    factoryName: '江门服装加工厂',
    title: '裁剪工',
    publishTime: '2024-01-07',
    status: '已下架',
    views: 67,
    applications: 9,
    onboarding: 1
  },
  {
    id: 8,
    factoryName: '珠海时装公司',
    title: '设计师',
    publishTime: '2024-01-08',
    status: '已发布',
    views: 203,
    applications: 35,
    onboarding: 8
  },
  {
    id: 9,
    factoryName: '汕头内衣厂',
    title: '车工',
    publishTime: '2024-01-09',
    status: '已发布',
    views: 134,
    applications: 22,
    onboarding: 5
  },
  {
    id: 10,
    factoryName: '揭阳纺织品有限公司',
    title: '仓库管理员',
    publishTime: '2024-01-10',
    status: '已发布',
    views: 78,
    applications: 10,
    onboarding: 2
  }
])

const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page
  // 这里可以调用API获取对应页的数据
}

// 查看岗位
const viewJob = (id) => {
  ElMessage.info('查看岗位功能开发中')
}

// 编辑岗位
const editJob = (id) => {
  ElMessage.info('编辑岗位功能开发中')
}

// 删除岗位
const deleteJob = (id) => {
  ElMessage.info('删除岗位功能开发中')
}

// 发布岗位
const publishJob = () => {
  ElMessage.info('发布岗位功能开发中')
}

onMounted(() => {
  // 这里可以调用API获取岗位列表数据
})
</script>

<style scoped>
.job-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>