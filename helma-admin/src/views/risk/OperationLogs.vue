<template>
  <div class="operation-logs">
    <h2>操作日志</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人"></el-input>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择操作类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="审核" value="audit"></el-option>
            <el-option label="权限变更" value="permission"></el-option>
            <el-option label="奖励发放" value="reward"></el-option>
            <el-option label="账号封禁" value="ban"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作日志列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志列表</span>
          <el-button type="primary" size="small" @click="exportLogs">导出日志</el-button>
        </div>
      </template>
      <el-table :data="logList" style="width: 100%">
        <el-table-column prop="id" label="日志ID" width="120"></el-table-column>
        <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
        <el-table-column prop="type" label="操作类型" width="120">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="操作内容"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
        <el-table-column prop="operateTime" label="操作时间" width="180"></el-table-column>
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
  operator: '',
  type: '',
  dateRange: []
})

const logList = ref([
  {
    id: 'L001',
    operator: 'admin',
    type: 'audit',
    content: '审核通过了工厂ABC的认证申请',
    ip: '192.168.1.100',
    operateTime: '2024-01-15 14:30:00'
  },
  {
    id: 'L002',
    operator: 'admin',
    type: 'permission',
    content: '给用户张三添加了运营管理员权限',
    ip: '192.168.1.100',
    operateTime: '2024-01-15 13:15:00'
  },
  {
    id: 'L003',
    operator: 'admin',
    type: 'reward',
    content: '给工厂XYZ发放了拉新奖励套餐',
    ip: '192.168.1.100',
    operateTime: '2024-01-15 12:45:00'
  },
  {
    id: 'L004',
    operator: 'admin',
    type: 'ban',
    content: '封禁了用户李四的账号',
    ip: '192.168.1.100',
    operateTime: '2024-01-15 11:20:00'
  }
])

const getTypeText = (type) => {
  switch (type) {
    case 'audit': return '审核'
    case 'permission': return '权限变更'
    case 'reward': return '奖励发放'
    case 'ban': return '账号封禁'
    default: return ''
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里可以实现搜索功能
}

const resetSearch = () => {
  searchForm.operator = ''
  searchForm.type = ''
  searchForm.dateRange = []
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以实现分页功能
}

const exportLogs = () => {
  console.log('导出操作日志')
  // 这里可以实现导出功能
  ElMessage.success('日志导出成功')
}
</script>

<style scoped>
.operation-logs {
  padding: 20px;
}

.operation-logs h2 {
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