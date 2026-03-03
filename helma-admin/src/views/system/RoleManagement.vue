<template>
  <div class="role-management">
    <h2>角色管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 角色列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </div>
      </template>
      <el-table :data="roleList" style="width: 100%">
        <el-table-column prop="id" label="角色ID" width="120"></el-table-column>
        <el-table-column prop="name" label="角色名称"></el-table-column>
        <el-table-column prop="description" label="角色描述"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewRole(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editRole(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
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
    
    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="权限设置" prop="permissions">
          <el-tree
            :data="permissionTree"
            show-checkbox
            node-key="id"
            default-expand-all
            v-model="form.permissions"
          ></el-tree>
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
  name: ''
})

const roleList = ref([
  {
    id: 'R001',
    name: '超级管理员',
    description: '拥有所有权限',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 'R002',
    name: '运营管理员',
    description: '负责运营管理',
    createTime: '2024-01-02 00:00:00'
  },
  {
    id: 'R003',
    name: '财务管理员',
    description: '负责财务管理',
    createTime: '2024-01-03 00:00:00'
  },
  {
    id: 'R004',
    name: '审核员',
    description: '负责内容审核',
    createTime: '2024-01-04 00:00:00'
  },
  {
    id: 'R005',
    name: '只读账号',
    description: '只能查看数据',
    createTime: '2024-01-05 00:00:00'
  }
])

const permissionTree = ref([
  {
    id: 'dashboard',
    label: '首页看板',
    children: [
      { id: 'dashboard:view', label: '查看' }
    ]
  },
  {
    id: 'worker',
    label: '工人管理',
    children: [
      { id: 'worker:view', label: '查看' },
      { id: 'worker:edit', label: '编辑' },
      { id: 'worker:delete', label: '删除' }
    ]
  },
  {
    id: 'factory',
    label: '工厂管理',
    children: [
      { id: 'factory:view', label: '查看' },
      { id: 'factory:edit', label: '编辑' },
      { id: 'factory:delete', label: '删除' }
    ]
  },
  {
    id: 'recruitment',
    label: '招聘管理',
    children: [
      { id: 'recruitment:view', label: '查看' },
      { id: 'recruitment:edit', label: '编辑' },
      { id: 'recruitment:delete', label: '删除' }
    ]
  },
  {
    id: 'evaluation',
    label: '评价管理',
    children: [
      { id: 'evaluation:view', label: '查看' },
      { id: 'evaluation:edit', label: '编辑' },
      { id: 'evaluation:delete', label: '删除' }
    ]
  },
  {
    id: 'finance',
    label: '财务管理',
    children: [
      { id: 'finance:view', label: '查看' },
      { id: 'finance:edit', label: '编辑' },
      { id: 'finance:delete', label: '删除' }
    ]
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加角色')
const formRef = ref(null)
const form = reactive({
  name: '',
  description: '',
  permissions: []
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
  permissions: [{ required: true, message: '请选择权限', trigger: 'change' }]
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里可以实现搜索功能
}

const resetSearch = () => {
  searchForm.name = ''
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以实现分页功能
}

const addRole = () => {
  dialogTitle.value = '添加角色'
  Object.keys(form).forEach(key => {
    form[key] = key === 'permissions' ? [] : ''
  })
  dialogVisible.value = true
}

const editRole = (row) => {
  dialogTitle.value = '编辑角色'
  form.name = row.name
  form.description = row.description
  form.permissions = []
  dialogVisible.value = true
}

const viewRole = (row) => {
  console.log('查看角色:', row)
  // 这里可以实现查看角色详情
}

const deleteRole = (row) => {
  ElMessageBox.confirm('确定要删除这个角色吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('删除角色:', row)
    // 这里可以实现删除功能
    ElMessage.success('角色删除成功')
  }).catch(() => {
    // 取消删除
  })
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
.role-management {
  padding: 20px;
}

.role-management h2 {
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