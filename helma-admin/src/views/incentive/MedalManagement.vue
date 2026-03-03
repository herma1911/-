<template>
  <div class="medal-management">
    <h2>勋章管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="勋章名称">
          <el-input v-model="searchForm.name" placeholder="请输入勋章名称"></el-input>
        </el-form-item>
        <el-form-item label="适用对象">
          <el-select v-model="searchForm.target" placeholder="请选择适用对象">
            <el-option label="全部" value=""></el-option>
            <el-option label="工人" value="worker"></el-option>
            <el-option label="工厂" value="factory"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 勋章列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>勋章列表</span>
          <el-button type="primary" @click="addMedal">添加勋章</el-button>
        </div>
      </template>
      <el-table :data="medalList" style="width: 100%">
        <el-table-column prop="id" label="勋章ID" width="120"></el-table-column>
        <el-table-column prop="name" label="勋章名称"></el-table-column>
        <el-table-column prop="target" label="适用对象" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.target === 'worker' ? '工人' : '工厂' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="解锁条件"></el-table-column>
        <el-table-column prop="privilege" label="对应特权"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewMedal(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editMedal(scope.row)">编辑</el-button>
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
    
    <!-- 添加/编辑勋章对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="勋章名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="适用对象" prop="target">
          <el-select v-model="form.target">
            <el-option label="工人" value="worker"></el-option>
            <el-option label="工厂" value="factory"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="解锁条件" prop="condition">
          <el-input v-model="form.condition" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="对应特权" prop="privilege">
          <el-input v-model="form.privilege" type="textarea" rows="3"></el-input>
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
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  name: '',
  target: ''
})

const medalList = ref([
  {
    id: 'M001',
    name: '优质工人',
    target: 'worker',
    condition: '累计有效入职3次以上，好评率90%以上',
    privilege: '简历置顶，优先推荐岗位',
    status: 'active'
  },
  {
    id: 'M002',
    name: '诚信工厂',
    target: 'factory',
    condition: '累计有效入职10次以上，好评率85%以上',
    privilege: '岗位优先展示，流量加权',
    status: 'active'
  },
  {
    id: 'M003',
    name: '招聘达人',
    target: 'factory',
    condition: '月招聘人数超过20人',
    privilege: '免费岗位置顶3次/月',
    status: 'inactive'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加勋章')
const formRef = ref(null)
const form = reactive({
  name: '',
  target: 'worker',
  condition: '',
  privilege: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入勋章名称', trigger: 'blur' }],
  target: [{ required: true, message: '请选择适用对象', trigger: 'change' }],
  condition: [{ required: true, message: '请输入解锁条件', trigger: 'blur' }],
  privilege: [{ required: true, message: '请输入对应特权', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
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

const addMedal = () => {
  dialogTitle.value = '添加勋章'
  Object.keys(form).forEach(key => {
    form[key] = key === 'target' ? 'worker' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editMedal = (row) => {
  dialogTitle.value = '编辑勋章'
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewMedal = (row) => {
  console.log('查看勋章:', row)
  // 这里可以实现查看勋章详情
}

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`勋章已${row.status === 'active' ? '启用' : '禁用'}`)
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
.medal-management {
  padding: 20px;
}

.medal-management h2 {
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