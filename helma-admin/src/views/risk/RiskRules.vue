<template>
  <div class="risk-rules">
    <h2>规则配置</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.name" placeholder="请输入规则名称"></el-input>
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="searchForm.type" placeholder="请选择规则类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="注册作弊" value="registration"></el-option>
            <el-option label="投递作弊" value="application"></el-option>
            <el-option label="入职作弊" value="onboarding"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 规则列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>规则列表</span>
          <el-button type="primary" @click="addRule">添加规则</el-button>
        </div>
      </template>
      <el-table :data="ruleList" style="width: 100%">
        <el-table-column prop="id" label="规则ID" width="120"></el-table-column>
        <el-table-column prop="name" label="规则名称"></el-table-column>
        <el-table-column prop="type" label="规则类型" width="120">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="规则描述"></el-table-column>
        <el-table-column prop="threshold" label="触发阈值"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewRule(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editRule(scope.row)">编辑</el-button>
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
    
    <!-- 添加/编辑规则对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="注册作弊" value="registration"></el-option>
            <el-option label="投递作弊" value="application"></el-option>
            <el-option label="入职作弊" value="onboarding"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="触发阈值" prop="threshold">
          <el-input v-model="form.threshold"></el-input>
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
  type: ''
})

const ruleList = ref([
  {
    id: 'R001',
    name: '重复注册检测',
    type: 'registration',
    description: '同一设备或IP在24小时内注册超过3次',
    threshold: '3次/24小时',
    status: 'active'
  },
  {
    id: 'R002',
    name: '异常投递检测',
    type: 'application',
    description: '同一用户在1小时内投递超过10个岗位',
    threshold: '10次/小时',
    status: 'active'
  },
  {
    id: 'R003',
    name: '虚假入职检测',
    type: 'onboarding',
    description: '同一工人30天内入职超过5家工厂',
    threshold: '5次/30天',
    status: 'active'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加规则')
const formRef = ref(null)
const form = reactive({
  name: '',
  type: 'registration',
  description: '',
  threshold: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入规则描述', trigger: 'blur' }],
  threshold: [{ required: true, message: '请输入触发阈值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getTypeText = (type) => {
  switch (type) {
    case 'registration': return '注册作弊'
    case 'application': return '投递作弊'
    case 'onboarding': return '入职作弊'
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

const addRule = () => {
  dialogTitle.value = '添加规则'
  Object.keys(form).forEach(key => {
    form[key] = key === 'type' ? 'registration' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editRule = (row) => {
  dialogTitle.value = '编辑规则'
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewRule = (row) => {
  console.log('查看规则:', row)
  // 这里可以实现查看规则详情
}

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`规则已${row.status === 'active' ? '启用' : '禁用'}`)
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
.risk-rules {
  padding: 20px;
}

.risk-rules h2 {
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