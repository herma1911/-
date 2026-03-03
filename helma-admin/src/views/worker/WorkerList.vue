<template>
  <div class="worker-list-container">
    <h2>工人列表</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工人用户管理</span>
          <el-button type="primary" size="small" @click="addWorker">添加工人</el-button>
        </div>
      </template>
      <el-table :data="workerList" style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="120" />
        <el-table-column prop="phone" label="手机号" width="180">
          <template #default="scope">
            <span>{{ scope.row.phone | maskPhone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column prop="city" label="所在城市" width="120" />
        <el-table-column prop="skill" label="擅长工序" width="120" />
        <el-table-column prop="workYears" label="工龄" width="80" />
        <el-table-column prop="certification" label="实名认证" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.certification ? 'success' : 'danger'">
              {{ scope.row.certification ? '已认证' : '未认证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="活跃状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'info'">
              {{ scope.row.status ? '活跃' : '不活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row.id)">查看详情</el-button>
            <el-button size="small" type="primary" @click="editWorker(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteWorker(scope.row.id)">删除</el-button>
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
const workerList = ref([
  {
    id: 1,
    phone: '13800138001',
    registerTime: '2024-01-01',
    city: '广州',
    skill: '车工',
    workYears: '3年',
    certification: true,
    status: true
  },
  {
    id: 2,
    phone: '13800138002',
    registerTime: '2024-01-02',
    city: '深圳',
    skill: '裁剪',
    workYears: '5年',
    certification: true,
    status: true
  },
  {
    id: 3,
    phone: '13800138003',
    registerTime: '2024-01-03',
    city: '东莞',
    skill: '熨烫',
    workYears: '2年',
    certification: false,
    status: false
  },
  {
    id: 4,
    phone: '13800138004',
    registerTime: '2024-01-04',
    city: '佛山',
    skill: '包装',
    workYears: '1年',
    certification: true,
    status: true
  },
  {
    id: 5,
    phone: '13800138005',
    registerTime: '2024-01-05',
    city: '中山',
    skill: '车工',
    workYears: '4年',
    certification: true,
    status: true
  },
  {
    id: 6,
    phone: '13800138006',
    registerTime: '2024-01-06',
    city: '惠州',
    skill: '裁剪',
    workYears: '6年',
    certification: true,
    status: false
  },
  {
    id: 7,
    phone: '13800138007',
    registerTime: '2024-01-07',
    city: '江门',
    skill: '熨烫',
    workYears: '3年',
    certification: false,
    status: true
  },
  {
    id: 8,
    phone: '13800138008',
    registerTime: '2024-01-08',
    city: '珠海',
    skill: '质检',
    workYears: '5年',
    certification: true,
    status: true
  },
  {
    id: 9,
    phone: '13800138009',
    registerTime: '2024-01-09',
    city: '汕头',
    skill: '车工',
    workYears: '2年',
    certification: true,
    status: false
  },
  {
    id: 10,
    phone: '13800138010',
    registerTime: '2024-01-10',
    city: '揭阳',
    skill: '裁剪',
    workYears: '4年',
    certification: false,
    status: true
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

// 查看详情
const viewDetail = (id) => {
  ElMessage.info('查看详情功能开发中')
  // router.push(`/worker/detail/${id}`)
}

// 编辑工人
const editWorker = (id) => {
  ElMessage.info('编辑工人功能开发中')
}

// 删除工人
const deleteWorker = (id) => {
  ElMessage.info('删除工人功能开发中')
}

// 添加工人
const addWorker = () => {
  ElMessage.info('添加工人功能开发中')
}

onMounted(() => {
  // 这里可以调用API获取工人列表数据
})
</script>

<style scoped>
.worker-list-container {
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