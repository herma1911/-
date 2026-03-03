<template>
  <div class="login-logs-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>登录日志管理</span>
        </div>
      </template>
      
      <!-- 搜索筛选 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="账号">
            <el-input v-model="searchForm.username" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input v-model="searchForm.ip" placeholder="请输入IP地址" />
          </el-form-item>
          <el-form-item label="登录时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 数据表格 -->
      <el-table :data="loginLogs" style="width: 100%">
        <el-table-column prop="id" label="日志ID" width="120" />
        <el-table-column prop="username" label="账号" width="180" />
        <el-table-column prop="ip" label="IP地址" width="180" />
        <el-table-column prop="location" label="登录地点" width="200" />
        <el-table-column prop="browser" label="浏览器" width="200" />
        <el-table-column prop="os" label="操作系统" width="150" />
        <el-table-column prop="loginTime" label="登录时间" width="200" />
        <el-table-column prop="status" label="登录状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  username: '',
  ip: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 登录日志数据
const loginLogs = ref([
  {
    id: 1,
    username: 'admin',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    browser: 'Chrome 96.0.4664.110',
    os: 'Windows 10',
    loginTime: '2024-01-15 09:30:25',
    status: '成功',
    remark: '正常登录'
  },
  {
    id: 2,
    username: 'helma123',
    ip: '192.168.1.101',
    location: '上海市浦东新区',
    browser: 'Firefox 95.0',
    os: 'macOS Big Sur',
    loginTime: '2024-01-15 08:45:12',
    status: '成功',
    remark: '正常登录'
  },
  {
    id: 3,
    username: 'testuser',
    ip: '192.168.1.102',
    location: '广州市天河区',
    browser: 'Safari 15.1',
    os: 'iOS 15.1',
    loginTime: '2024-01-15 07:20:33',
    status: '失败',
    remark: '密码错误'
  },
  {
    id: 4,
    username: 'admin',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    browser: 'Chrome 96.0.4664.110',
    os: 'Windows 10',
    loginTime: '2024-01-14 18:15:47',
    status: '成功',
    remark: '正常登录'
  },
  {
    id: 5,
    username: 'helma123',
    ip: '192.168.1.101',
    location: '上海市浦东新区',
    browser: 'Firefox 95.0',
    os: 'macOS Big Sur',
    loginTime: '2024-01-14 15:30:22',
    status: '成功',
    remark: '正常登录'
  }
])

// 搜索
const handleSearch = () => {
  // 模拟搜索
  ElMessage.success('搜索成功')
}

// 重置
const resetForm = () => {
  searchForm.username = ''
  searchForm.ip = ''
  searchForm.dateRange = []
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current
}
</script>

<style scoped>
.login-logs-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>