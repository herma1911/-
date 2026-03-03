<template>
  <div class="content-audit">
    <h2>内容审核</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="内容类型">
          <el-select v-model="searchForm.type" placeholder="请选择内容类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="岗位" value="job"></el-option>
            <el-option label="评价" value="evaluation"></el-option>
            <el-option label="用户头像" value="avatar"></el-option>
            <el-option label="用户昵称" value="nickname"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.status" placeholder="请选择审核状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="通过" value="passed"></el-option>
            <el-option label="驳回" value="rejected"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 内容审核列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>内容审核列表</span>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table :data="auditList" style="width: 100%">
        <el-table-column prop="id" label="审核ID" width="120"></el-table-column>
        <el-table-column prop="type" label="内容类型" width="120">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="120"></el-table-column>
        <el-table-column prop="userName" label="用户姓名" width="120"></el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
        <el-table-column prop="status" label="审核状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <template v-if="scope.row.status === 'pending'">
              <el-button size="small" type="success" @click="passAudit(scope.row)">通过</el-button>
              <el-button size="small" type="danger" @click="rejectAudit(scope.row)">驳回</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="100"
          :page-size="10"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  type: '',
  status: ''
})

const auditList = ref([
  {
    id: 'A001',
    type: 'job',
    content: '招聘缝纫工，薪资8000-10000元/月，包吃住',
    userId: 'F12345',
    userName: '某某工厂',
    submitTime: '2024-01-15 14:30:00',
    status: 'pending'
  },
  {
    id: 'A002',
    type: 'evaluation',
    content: '工厂环境很好，老板人不错，工资按时发放',
    userId: 'U67890',
    userName: '张三',
    submitTime: '2024-01-15 13:15:00',
    status: 'pending'
  },
  {
    id: 'A003',
    type: 'avatar',
    content: '用户头像图片',
    userId: 'U24680',
    userName: '李四',
    submitTime: '2024-01-15 12:45:00',
    status: 'passed'
  },
  {
    id: 'A004',
    type: 'nickname',
    content: '快乐工作',
    userId: 'U13579',
    userName: '王五',
    submitTime: '2024-01-15 11:20:00',
    status: 'rejected'
  }
])

const getTypeText = (type) => {
  switch (type) {
    case 'job': return '岗位'
    case 'evaluation': return '评价'
    case 'avatar': return '用户头像'
    case 'nickname': return '用户昵称'
    default: return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待审核'
    case 'passed': return '通过'
    case 'rejected': return '驳回'
    default: return ''
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'passed': return 'success'
    case 'rejected': return 'danger'
    default: return ''
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.info('搜索功能开发中')
  // 这里可以实现搜索功能
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以实现分页功能
}

const exportData = () => {
  console.log('导出审核数据')
  ElMessage.success('数据导出成功')
  // 这里可以实现导出功能
}

const viewDetail = (row) => {
  console.log('查看审核详情:', row)
  ElMessage.info('查看详情功能开发中')
  // 这里可以实现查看详情功能
}

const passAudit = (row) => {
  console.log('通过审核:', row)
  // 找到对应的数据项并更新
  const index = auditList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    auditList.value[index].status = 'passed'
  }
  ElMessage.success('审核通过')
}

const rejectAudit = (row) => {
  console.log('驳回审核:', row)
  // 找到对应的数据项并更新
  const index = auditList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    auditList.value[index].status = 'rejected'
  }
  ElMessage.success('审核驳回')
}
</script>

<style scoped>
.content-audit {
  padding: 20px;
}

.content-audit h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.search-filter {
  margin-bottom: 20px;
}

.search-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>