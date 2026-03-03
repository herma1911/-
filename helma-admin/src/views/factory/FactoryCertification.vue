<template>
  <div class="factory-certification-container">
    <h2>认证管理</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工厂认证审核</span>
        </div>
      </template>
      <el-table :data="certificationList" style="width: 100%">
        <el-table-column prop="id" label="认证ID" width="120" />
        <el-table-column prop="factoryName" label="企业名称" width="200" />
        <el-table-column prop="contact" label="负责人" width="120" />
        <el-table-column prop="phone" label="手机号" width="180">
          <template #default="scope">
            <span>{{ scope.row.phone | maskPhone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="status" label="认证状态" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="viewCertification(scope.row.id)">查看</el-button>
            <el-button v-if="scope.row.status === '待审核'" size="small" type="primary" @click="approveCertification(scope.row.id)">通过</el-button>
            <el-button v-if="scope.row.status === '待审核'" size="small" type="danger" @click="rejectCertification(scope.row.id)">驳回</el-button>
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
import { ElMessage } from 'element-plus'

// 模拟认证数据
const certificationList = ref([
  {
    id: 1,
    factoryName: '广州服装厂',
    contact: '王经理',
    phone: '13800138001',
    applyTime: '2024-01-01',
    status: '已通过'
  },
  {
    id: 2,
    factoryName: '深圳服装公司',
    contact: '李总',
    phone: '13800138002',
    applyTime: '2024-01-02',
    status: '待审核'
  },
  {
    id: 3,
    factoryName: '东莞制衣厂',
    contact: '张厂长',
    phone: '13800138003',
    applyTime: '2024-01-03',
    status: '已驳回'
  }
])

const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取标签类型
const getTagType = (status) => {
  switch (status) {
    case '已通过':
      return 'success'
    case '待审核':
      return 'warning'
    case '已驳回':
      return 'danger'
    default:
      return 'info'
  }
}

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page
  // 这里可以调用API获取对应页的数据
}

// 查看认证详情
const viewCertification = (id) => {
  ElMessage.success('查看认证详情功能开发中')
}

// 通过认证
const approveCertification = (id) => {
  ElMessage.success('通过认证功能开发中')
}

// 驳回认证
const rejectCertification = (id) => {
  ElMessage.success('驳回认证功能开发中')
}

onMounted(() => {
  // 这里可以调用API获取认证列表数据
})
</script>

<style scoped>
.factory-certification-container {
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