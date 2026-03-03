<template>
  <div class="account-management">
    <h2>账号管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="账号名称">
          <el-input v-model="searchForm.username" placeholder="请输入账号名称"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色">
            <el-option label="全部" value=""></el-option>
            <el-option label="超级管理员" value="superadmin"></el-option>
            <el-option label="运营管理员" value="operation"></el-option>
            <el-option label="财务管理员" value="finance"></el-option>
            <el-option label="审核员" value="auditor"></el-option>
            <el-option label="只读账号" value="readonly"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" value="active"></el-option>
            <el-option label="禁用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 账号列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账号列表</span>
          <el-button type="primary" @click="addAccount">添加账号</el-button>
        </div>
      </template>
      <el-table :data="accountList" style="width: 100%">
        <el-table-column prop="id" label="账号ID" width="120"></el-table-column>
        <el-table-column prop="username" label="账号名称"></el-table-column>
        <el-table-column prop="role" label="角色" width="150">
          <template #default="scope">
            <el-tag>{{ getRoleText(scope.row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewAccount(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editAccount(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" @click="resetPassword(scope.row)">重置密码</el-button>
            <el-button size="small" :type="scope.row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
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
    
    <!-- 添加/编辑账号对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="账号名称" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isAdd">
          <el-input v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role">
            <el-option label="超级管理员" value="superadmin"></el-option>
            <el-option label="运营管理员" value="operation"></el-option>
            <el-option label="财务管理员" value="finance"></el-option>
            <el-option label="审核员" value="auditor"></el-option>
            <el-option label="只读账号" value="readonly"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="启用" value="active"></el-option>
            <el-option label="禁用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  username: '',
  role: '',
  status: ''
})

const accountList = ref([
  {
    id: 'A001',
    username: 'admin',
    role: 'superadmin',
    createTime: '2024-01-01 00:00:00',
    lastLoginTime: '2024-01-15 10:00:00',
    status: 'active'
  },
  {
    id: 'A002',
    username: 'operation',
    role: 'operation',
    createTime: '2024-01-02 00:00:00',
    lastLoginTime: '2024-01-14 15:30:00',
    status: 'active'
  },
  {
    id: 'A003',
    username: 'finance',
    role: 'finance',
    createTime: '2024-01-03 00:00:00',
    lastLoginTime: '2024-01-13 09:15:00',
    status: 'active'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加账号')
const isAdd = ref(true)
const formRef = ref(null)
const form = reactive({
  username: '',
  password: '',
  role: 'operation',
  status: 'active'
})

const rules = {
  username: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
  password: [{ required: isAdd.value, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getRoleText = (role) => {
  switch (role) {
    case 'superadmin': return '超级管理员'
    case 'operation': return '运营管理员'
    case 'finance': return '财务管理员'
    case 'auditor': return '审核员'
    case 'readonly': return '只读账号'
    default: return ''
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
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

const addAccount = () => {
  isAdd.value = true
  dialogTitle.value = '添加账号'
  Object.keys(form).forEach(key => {
    form[key] = key === 'role' ? 'operation' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editAccount = (row) => {
  isAdd.value = false
  dialogTitle.value = '编辑账号'
  form.username = row.username
  form.role = row.role
  form.status = row.status
  dialogVisible.value = true
}

const viewAccount = (row) => {
  console.log('查看账号:', row)
  // 这里可以实现查看账号详情
}

const resetPassword = (row) => {
  ElMessageBox.confirm('确定要重置密码吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('重置密码:', row)
    // 这里可以实现重置密码功能
    ElMessage.success('密码重置成功')
  }).catch(() => {
    // 取消重置
  })
}

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`账号已${row.status === 'active' ? '启用' : '禁用'}`)
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('表单数据:', form)
      // 这里可以实现保存功能
      dialogVisible.value = false
      ElMessage.success('操作成功')
    }
  })
}
</script>

<style scoped>
.account-management {
  padding: 20px;
}

.account-management h2 {
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

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>