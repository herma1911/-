<template>
  <div class="factory-list-container">
    <h2>工厂列表</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工厂用户管理</span>
          <el-button type="primary" size="small" @click="addFactory">添加工厂</el-button>
        </div>
      </template>
      <el-table :data="factoryList" style="width: 100%">
        <el-table-column prop="id" label="工厂ID" width="120" />
        <el-table-column prop="name" label="企业名称" width="200" />
        <el-table-column prop="contact" label="负责人" width="120" />
        <el-table-column prop="phone" label="手机号" width="180">
          <template #default="scope">
            <span>{{ scope.row.phone | maskPhone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column prop="city" label="所在城市" width="120" />
        <el-table-column prop="certification" label="认证状态" width="100">
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
        <el-table-column prop="paidStatus" label="付费状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.paidStatus ? 'success' : 'info'">
              {{ scope.row.paidStatus ? '付费' : '免费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row.id)">查看详情</el-button>
            <el-button size="small" type="primary" @click="editFactory(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteFactory(scope.row.id)">删除</el-button>
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
const factoryList = ref([
  {
    id: 1,
    name: '广州服装厂',
    contact: '王经理',
    phone: '13800138001',
    registerTime: '2024-01-01',
    city: '广州',
    certification: true,
    status: true,
    paidStatus: true
  },
  {
    id: 2,
    name: '深圳服装公司',
    contact: '李总',
    phone: '13800138002',
    registerTime: '2024-01-02',
    city: '深圳',
    certification: true,
    status: true,
    paidStatus: false
  },
  {
    id: 3,
    name: '东莞制衣厂',
    contact: '张厂长',
    phone: '13800138003',
    registerTime: '2024-01-03',
    city: '东莞',
    certification: false,
    status: false,
    paidStatus: false
  },
  {
    id: 4,
    name: '佛山纺织厂',
    contact: '刘经理',
    phone: '13800138004',
    registerTime: '2024-01-04',
    city: '佛山',
    certification: true,
    status: true,
    paidStatus: true
  },
  {
    id: 5,
    name: '中山服装有限公司',
    contact: '陈总',
    phone: '13800138005',
    registerTime: '2024-01-05',
    city: '中山',
    certification: true,
    status: true,
    paidStatus: true
  },
  {
    id: 6,
    name: '惠州制衣有限公司',
    contact: '杨厂长',
    phone: '13800138006',
    registerTime: '2024-01-06',
    city: '惠州',
    certification: false,
    status: true,
    paidStatus: false
  },
  {
    id: 7,
    name: '江门服装加工厂',
    contact: '黄经理',
    phone: '13800138007',
    registerTime: '2024-01-07',
    city: '江门',
    certification: true,
    status: false,
    paidStatus: false
  },
  {
    id: 8,
    name: '珠海时装公司',
    contact: '赵总',
    phone: '13800138008',
    registerTime: '2024-01-08',
    city: '珠海',
    certification: true,
    status: true,
    paidStatus: true
  },
  {
    id: 9,
    name: '汕头内衣厂',
    contact: '吴厂长',
    phone: '13800138009',
    registerTime: '2024-01-09',
    city: '汕头',
    certification: false,
    status: true,
    paidStatus: false
  },
  {
    id: 10,
    name: '揭阳纺织品有限公司',
    contact: '郑经理',
    phone: '13800138010',
    registerTime: '2024-01-10',
    city: '揭阳',
    certification: true,
    status: true,
    paidStatus: true
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
  // router.push(`/factory/detail/${id}`)
}

// 编辑工厂
const editFactory = (id) => {
  ElMessage.info('编辑工厂功能开发中')
}

// 删除工厂
const deleteFactory = (id) => {
  ElMessage.info('删除工厂功能开发中')
}

// 添加工厂
const addFactory = () => {
  ElMessage.info('添加工厂功能开发中')
}

onMounted(() => {
  // 这里可以调用API获取工厂列表数据
})
</script>

<style scoped>
.factory-list-container {
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