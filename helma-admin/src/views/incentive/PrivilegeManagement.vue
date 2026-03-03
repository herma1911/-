<template>
  <div class="privilege-management">
    <h2>特权管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="特权名称">
          <el-input v-model="searchForm.name" placeholder="请输入特权名称"></el-input>
        </el-form-item>
        <el-form-item label="特权类型">
          <el-select v-model="searchForm.type" placeholder="请选择特权类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="流量加权" value="traffic"></el-option>
            <el-option label="简历置顶" value="resumeTop"></el-option>
            <el-option label="套餐折扣" value="packageDiscount"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 特权列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>特权列表</span>
          <el-button type="primary" @click="addPrivilege">添加特权</el-button>
        </div>
      </template>
      <el-table :data="privilegeList" style="width: 100%">
        <el-table-column prop="id" label="特权ID" width="120"></el-table-column>
        <el-table-column prop="name" label="特权名称"></el-table-column>
        <el-table-column prop="type" label="特权类型" width="120">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="特权描述"></el-table-column>
        <el-table-column prop="validityPeriod" label="有效期"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewPrivilege(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editPrivilege(scope.row)">编辑</el-button>
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
    
    <!-- 特权使用记录 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>特权使用记录</span>
          <el-button type="primary" size="small" @click="exportRecords">导出记录</el-button>
        </div>
      </template>
      <el-table :data="usageRecords" style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="120"></el-table-column>
        <el-table-column prop="privilegeName" label="特权名称" width="150"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="120"></el-table-column>
        <el-table-column prop="userName" label="用户姓名" width="120"></el-table-column>
        <el-table-column prop="usageTime" label="使用时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'used' ? 'success' : 'info'">
              {{ scope.row.status === 'used' ? '已使用' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑特权对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="特权名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="特权类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="流量加权" value="traffic"></el-option>
            <el-option label="简历置顶" value="resumeTop"></el-option>
            <el-option label="套餐折扣" value="packageDiscount"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="特权描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="有效期" prop="validityPeriod">
          <el-input v-model="form.validityPeriod" placeholder="如：30天、1个月等"></el-input>
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

const privilegeList = ref([
  {
    id: 'P001',
    name: '流量加权',
    type: 'traffic',
    description: '提高岗位曝光率，增加投递量',
    validityPeriod: '30天',
    status: 'active'
  },
  {
    id: 'P002',
    name: '简历置顶',
    type: 'resumeTop',
    description: '简历在搜索结果中优先展示',
    validityPeriod: '15天',
    status: 'active'
  },
  {
    id: 'P003',
    name: '套餐折扣',
    type: 'packageDiscount',
    description: '购买套餐享受8折优惠',
    validityPeriod: '60天',
    status: 'active'
  }
])

const usageRecords = ref([
  {
    id: 'UR001',
    privilegeName: '流量加权',
    userId: 'F001',
    userName: '某某工厂',
    usageTime: '2024-01-15 10:00:00',
    status: 'used'
  },
  {
    id: 'UR002',
    privilegeName: '简历置顶',
    userId: 'U001',
    userName: '张三',
    usageTime: '2024-01-14 15:30:00',
    status: 'used'
  },
  {
    id: 'UR003',
    privilegeName: '套餐折扣',
    userId: 'F002',
    userName: '某某服装厂',
    usageTime: '2024-01-13 09:15:00',
    status: 'used'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加特权')
const formRef = ref(null)
const form = reactive({
  name: '',
  type: 'traffic',
  description: '',
  validityPeriod: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入特权名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择特权类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入特权描述', trigger: 'blur' }],
  validityPeriod: [{ required: true, message: '请输入有效期', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getTypeText = (type) => {
  switch (type) {
    case 'traffic': return '流量加权'
    case 'resumeTop': return '简历置顶'
    case 'packageDiscount': return '套餐折扣'
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

const addPrivilege = () => {
  dialogTitle.value = '添加特权'
  Object.keys(form).forEach(key => {
    form[key] = key === 'type' ? 'traffic' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editPrivilege = (row) => {
  dialogTitle.value = '编辑特权'
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewPrivilege = (row) => {
  console.log('查看特权:', row)
  // 这里可以实现查看特权详情
}

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`特权已${row.status === 'active' ? '启用' : '禁用'}`)
}

const exportRecords = () => {
  console.log('导出特权使用记录')
  // 这里可以实现导出功能
  ElMessage.success('记录导出成功')
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
.privilege-management {
  padding: 20px;
}

.privilege-management h2 {
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