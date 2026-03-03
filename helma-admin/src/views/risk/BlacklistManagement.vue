<template>
  <div class="blacklist-management">
    <h2>黑名单管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户ID/手机号">
          <el-input v-model="searchForm.keyword" placeholder="请输入用户ID或手机号"></el-input>
        </el-form-item>
        <el-form-item label="黑名单类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="用户" value="user"></el-option>
            <el-option label="工厂" value="factory"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 黑名单列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>黑名单列表</span>
          <el-button type="primary" @click="addBlacklist">添加黑名单</el-button>
        </div>
      </template>
      <el-table :data="blacklistList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="120"></el-table-column>
        <el-table-column prop="targetId" label="目标ID" width="150"></el-table-column>
        <el-table-column prop="targetName" label="目标名称"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.type === 'user' ? '用户' : '工厂' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="加入原因"></el-table-column>
        <el-table-column prop="addTime" label="加入时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="danger" @click="removeBlacklist(scope.row)">移除</el-button>
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
    
    <!-- 添加黑名单对话框 -->
    <el-dialog
      title="添加黑名单"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="目标类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="用户" value="user"></el-option>
            <el-option label="工厂" value="factory"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标ID" prop="targetId">
          <el-input v-model="form.targetId" placeholder="请输入用户ID或工厂ID"></el-input>
        </el-form-item>
        <el-form-item label="目标名称" prop="targetName">
          <el-input v-model="form.targetName" placeholder="请输入用户姓名或工厂名称"></el-input>
        </el-form-item>
        <el-form-item label="加入原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" rows="3"></el-input>
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
  keyword: '',
  type: ''
})

const blacklistList = ref([
  {
    id: 'B001',
    targetId: 'U12345',
    targetName: '张三',
    type: 'user',
    reason: '重复注册作弊',
    addTime: '2024-01-15 10:00:00'
  },
  {
    id: 'B002',
    targetId: 'F67890',
    targetName: '某某工厂',
    type: 'factory',
    reason: '发布虚假岗位',
    addTime: '2024-01-14 15:30:00'
  },
  {
    id: 'B003',
    targetId: 'U24680',
    targetName: '李四',
    type: 'user',
    reason: '恶意投诉',
    addTime: '2024-01-13 09:15:00'
  }
])

const dialogVisible = ref(false)
const formRef = ref(null)
const form = reactive({
  type: 'user',
  targetId: '',
  targetName: '',
  reason: ''
})

const rules = {
  type: [{ required: true, message: '请选择目标类型', trigger: 'change' }],
  targetId: [{ required: true, message: '请输入目标ID', trigger: 'blur' }],
  targetName: [{ required: true, message: '请输入目标名称', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入加入原因', trigger: 'blur' }]
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

const addBlacklist = () => {
  Object.keys(form).forEach(key => {
    form[key] = key === 'type' ? 'user' : ''
  })
  dialogVisible.value = true
}

const removeBlacklist = (row) => {
  ElMessageBox.confirm('确定要从黑名单中移除吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('移除黑名单:', row)
    // 这里可以实现移除功能
    ElMessage.success('已从黑名单中移除')
  }).catch(() => {
    // 取消移除
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('表单数据:', form)
      // 这里可以实现保存功能
      dialogVisible.value = false
      ElMessage.success('添加成功')
    }
  })
}
</script>

<style scoped>
.blacklist-management {
  padding: 20px;
}

.blacklist-management h2 {
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